"""
evaluate.py — post-training evaluation of the SQLLM fine-tuned model.

Tests the model on held-out SQL problems and checks:
  - All 8 reasoning steps are present
  - Step 3 uses arrow notation (->)
  - SQL block is present at step 7
  - No ARRAY_AGG(struct(...)) pattern used for argmax
  - Edit distance between generated and reference SQL (when reference available)

Usage:
    python evaluate.py --adapter output/qwen25-7b-sqllm-metal --problems eval_problems.jsonl
    python evaluate.py --adapter output/qwen25-7b-sqllm-metal --problems eval_problems.jsonl --base-model Qwen/Qwen2.5-Coder-7B

Hardware target: Apple Silicon (Metal/MPS).
Model is loaded in float16 without bitsandbytes quantization.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path


# ---------------------------------------------------------------------------
# Step detection
# ---------------------------------------------------------------------------

STEP_PATTERNS = [
    re.compile(r"##\s*(?:step\s+)?1[\.\s:]", re.IGNORECASE),  # 1. Identify shapes
    re.compile(r"##\s*(?:step\s+)?2[\.\s:]", re.IGNORECASE),  # 2. Sources and relationships
    re.compile(r"##\s*(?:step\s+)?3[\.\s:]", re.IGNORECASE),  # 3. Aggregation depth
    re.compile(r"##\s*(?:step\s+)?4[\.\s:]", re.IGNORECASE),  # 4. Dependencies
    re.compile(r"##\s*(?:step\s+)?5[\.\s:]", re.IGNORECASE),  # 5. Plan CTE layers
    re.compile(r"##\s*(?:step\s+)?6[\.\s:]", re.IGNORECASE),  # 6. Write each CTE
    re.compile(r"##\s*(?:step\s+)?7[\.\s:]", re.IGNORECASE),  # 7. Compose final query
    re.compile(r"##\s*(?:step\s+)?8[\.\s:]", re.IGNORECASE),  # 8. Verify output shape
]

ARROW_PATTERN = re.compile(r"->")
SQL_BLOCK_PATTERN = re.compile(r"```sql", re.IGNORECASE)
ARRAY_AGG_STRUCT_PATTERN = re.compile(r"ARRAY_AGG\s*\(.*?struct", re.IGNORECASE | re.DOTALL)


@dataclass
class EvalResult:
    problem_index: int
    steps_found: list[bool]
    has_arrow_notation: bool
    has_sql_block: bool
    has_array_agg_struct: bool
    edit_distance: int | None = None
    generated_sql: str = ""
    reference_sql: str = ""

    @property
    def steps_count(self) -> int:
        return sum(self.steps_found)

    @property
    def all_steps_present(self) -> bool:
        return all(self.steps_found)

    @property
    def passed(self) -> bool:
        return (
            self.all_steps_present
            and self.has_arrow_notation
            and self.has_sql_block
            and not self.has_array_agg_struct
        )

    def summary(self) -> str:
        lines = [
            f"Problem {self.problem_index}:",
            f"  Steps present: {self.steps_count}/8  {'OK' if self.all_steps_present else 'FAIL'}",
            f"  Arrow notation (->): {'YES' if self.has_arrow_notation else 'NO'}",
            f"  SQL block: {'YES' if self.has_sql_block else 'NO'}",
            f"  ARRAY_AGG(struct): {'BAD' if self.has_array_agg_struct else 'OK'}",
        ]
        if self.edit_distance is not None:
            lines.append(f"  Edit distance (SQL): {self.edit_distance}")
        lines.append(f"  => {'PASS' if self.passed else 'FAIL'}")
        return "\n".join(lines)


def extract_sql(text: str) -> str:
    """Extract the first ```sql ... ``` block from a response."""
    match = re.search(r"```sql\s*(.*?)```", text, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""


def edit_distance(a: str, b: str) -> int:
    """Levenshtein edit distance between two strings (character level)."""
    # Normalise whitespace before comparing
    a = re.sub(r"\s+", " ", a.strip().lower())
    b = re.sub(r"\s+", " ", b.strip().lower())

    if a == b:
        return 0

    m, n = len(a), len(b)
    # Use two-row DP to keep memory O(n)
    prev = list(range(n + 1))
    curr = [0] * (n + 1)

    for i in range(1, m + 1):
        curr[0] = i
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                curr[j] = prev[j - 1]
            else:
                curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])
        prev, curr = curr, prev

    return prev[n]


def evaluate_response(response: str, problem_index: int, reference_sql: str = "") -> EvalResult:
    steps_found = [bool(p.search(response)) for p in STEP_PATTERNS]

    # Arrow notation should appear in the step-3 region specifically
    step3_match = STEP_PATTERNS[2].search(response)
    step4_match = STEP_PATTERNS[3].search(response)
    if step3_match and step4_match:
        step3_text = response[step3_match.start():step4_match.start()]
    elif step3_match:
        step3_text = response[step3_match.start():]
    else:
        step3_text = ""

    has_arrow = bool(ARROW_PATTERN.search(step3_text))
    has_sql = bool(SQL_BLOCK_PATTERN.search(response))
    has_array_agg_struct = bool(ARRAY_AGG_STRUCT_PATTERN.search(response))

    generated_sql = extract_sql(response)
    dist = None
    if reference_sql:
        dist = edit_distance(generated_sql, reference_sql)

    return EvalResult(
        problem_index=problem_index,
        steps_found=steps_found,
        has_arrow_notation=has_arrow,
        has_sql_block=has_sql,
        has_array_agg_struct=has_array_agg_struct,
        edit_distance=dist,
        generated_sql=generated_sql,
        reference_sql=reference_sql,
    )


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

def detect_device() -> str:
    """Return the best available compute device: mps, cuda, or cpu."""
    import torch
    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_model_and_tokenizer(base_model: str, adapter_path: str):
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from peft import PeftModel

    device = detect_device()
    print(f"Compute device: {device}")

    print(f"Loading tokenizer from adapter: {adapter_path}")
    tokenizer = AutoTokenizer.from_pretrained(adapter_path, trust_remote_code=True)

    # bitsandbytes 4-bit quantization is not supported on MPS.
    # Load in float16 and move to device.
    print(f"Loading base model: {base_model}")
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        torch_dtype=torch.float16,
        trust_remote_code=True,
    )
    model = model.to(device)

    print(f"Loading LoRA adapter: {adapter_path}")
    model = PeftModel.from_pretrained(model, adapter_path)
    model.eval()

    return model, tokenizer


def generate_response(model, tokenizer, messages: list[dict], max_new_tokens: int = 2048) -> str:
    import torch

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )
    inputs = tokenizer(text, return_tensors="pt").to(model.device)

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            temperature=1.0,
            pad_token_id=tokenizer.eos_token_id,
        )

    # Decode only the newly generated tokens
    new_tokens = output_ids[0][inputs["input_ids"].shape[1]:]
    return tokenizer.decode(new_tokens, skip_special_tokens=True)


# ---------------------------------------------------------------------------
# Problem loading
# ---------------------------------------------------------------------------

def load_problems(path: str) -> list[dict]:
    """
    Load evaluation problems from a JSONL file.
    Each line must have at minimum a "messages" key (system + user turns).
    Optionally may include a "reference_sql" key for edit-distance scoring.
    """
    problems = []
    with open(path, "r") as f:
        for lineno, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as e:
                raise ValueError(f"{path}:{lineno}: {e}") from e
            problems.append(obj)
    return problems


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="SQLLM evaluation")
    parser.add_argument("--adapter", required=True, help="Path to LoRA adapter directory")
    parser.add_argument("--problems", required=True, help="JSONL file of eval problems")
    parser.add_argument(
        "--base-model",
        default="Qwen/Qwen2.5-Coder-7B",
        help="HuggingFace model ID for the base model (default: Qwen/Qwen2.5-Coder-7B)",
    )
    parser.add_argument(
        "--max-new-tokens",
        type=int,
        default=2048,
        help="Max tokens to generate per problem",
    )
    args = parser.parse_args()

    problems = load_problems(args.problems)
    print(f"Loaded {len(problems)} evaluation problems from {args.problems}")

    model, tokenizer = load_model_and_tokenizer(args.base_model, args.adapter)

    results: list[EvalResult] = []

    for i, problem in enumerate(problems):
        messages = problem.get("messages", [])
        # Strip to system + user only (no assistant turn)
        prompt_messages = [m for m in messages if m["role"] in ("system", "user")]
        reference_sql = problem.get("reference_sql", "")

        print(f"\n--- Problem {i} ---")
        print(f"User: {prompt_messages[-1]['content'][:120]}...")

        response = generate_response(model, tokenizer, prompt_messages, args.max_new_tokens)
        result = evaluate_response(response, problem_index=i, reference_sql=reference_sql)
        results.append(result)
        print("\n" + response)
        print("\n" + "─" * 60)
        print(result.summary())

    # Aggregate
    n = len(results)
    n_pass = sum(1 for r in results if r.passed)
    n_all_steps = sum(1 for r in results if r.all_steps_present)
    n_arrow = sum(1 for r in results if r.has_arrow_notation)
    n_sql = sum(1 for r in results if r.has_sql_block)
    n_bad_argmax = sum(1 for r in results if r.has_array_agg_struct)
    edit_distances = [r.edit_distance for r in results if r.edit_distance is not None]

    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    print(f"  Problems evaluated: {n}")
    print(f"  Overall pass:       {n_pass}/{n}")
    print(f"  All 8 steps:        {n_all_steps}/{n}")
    print(f"  Arrow notation:     {n_arrow}/{n}")
    print(f"  SQL block present:  {n_sql}/{n}")
    print(f"  ARRAY_AGG(struct):  {n_bad_argmax}/{n}  (should be 0)")
    if edit_distances:
        avg_ed = sum(edit_distances) / len(edit_distances)
        print(f"  Avg SQL edit dist:  {avg_ed:.1f} chars")
    print()

    if n_pass < n:
        print("Model needs more training. Check:")
        print("  - lora_r: increase to 32 if arrow notation absent")
        print("  - num_train_epochs: increase if steps are missing")
        sys.exit(1)
    else:
        print("All problems passed. Model ready for volume generation.")


if __name__ == "__main__":
    main()

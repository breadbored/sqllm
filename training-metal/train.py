"""
train.py — LoRA fine-tuning of Qwen2.5-Coder-7B on SQLLM reasoning traces.

Usage:
    python train.py --config config.yaml
    python train.py --config config.yaml --dry-run   # validate data only

Hardware target: Apple Silicon (M3 Pro/Max) via Metal/MPS
4-bit QLoRA is not available on MPS — the model is loaded in float16 and
trained with standard LoRA. Adapter weight updates run in float32.
Expected peak unified memory: ~17-18 GB for the 7B model at seq_len 2048.
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

import yaml

logging.basicConfig(
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
    level=logging.INFO,
)
log = logging.getLogger(__name__)


def load_config(path: str) -> dict:
    with open(path, "r") as f:
        return yaml.safe_load(f)


def detect_device() -> str:
    """Return the best available compute device: mps, cuda, or cpu."""
    import torch
    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    log.warning("No GPU detected — falling back to CPU (training will be very slow)")
    return "cpu"


def build_lora_config(cfg: dict):
    from peft import LoraConfig, TaskType

    return LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=cfg.get("lora_r", 16),
        lora_alpha=cfg.get("lora_alpha", 32),
        lora_dropout=cfg.get("lora_dropout", 0.05),
        target_modules=cfg.get("lora_target_modules", [
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj",
        ]),
        bias="none",
    )


def load_dataset_from_jsonl(data_path: str, eval_ratio: float, script_dir: Path):
    """
    Load, validate, and split the JSONL training data.
    Returns (train_records, eval_records) as lists of message dicts.
    """
    sys.path.insert(0, str(script_dir))
    from corpus_utils import iter_records, split_records, record_to_messages

    path = Path(data_path)
    if not path.is_absolute():
        path = script_dir / path

    log.info("Loading training data from %s", path)
    records = list(iter_records(path))
    log.info("Loaded %d valid records", len(records))

    train_records, eval_records = split_records(records, eval_ratio=eval_ratio)
    log.info("Split: %d train / %d eval", len(train_records), len(eval_records))

    train_messages = [record_to_messages(r) for r in train_records]
    eval_messages = [record_to_messages(r) for r in eval_records]

    return train_messages, eval_messages


def messages_to_hf_dataset(messages_list: list[list[dict]], tokenizer, max_seq_length: int):
    """
    Apply the chat template and tokenise each conversation.
    Returns a HuggingFace Dataset with 'input_ids' and 'labels' columns.
    Labels are set to -100 for all non-assistant tokens (instruction masking).
    """
    from datasets import Dataset

    def apply_template(messages: list[dict]) -> dict:
        # Apply chat template — adds BOS/EOS and role tokens per Qwen convention.
        # tokenize=False so we can do our own masking before encoding.
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=False,
        )
        encoded = tokenizer(
            text,
            truncation=True,
            max_length=max_seq_length,
            padding=False,
            return_tensors=None,
        )
        input_ids = encoded["input_ids"]

        # Build labels: mask everything except the assistant turn.
        # We re-encode just the prompt (system + user) to find the cutoff index.
        prompt_only = tokenizer.apply_chat_template(
            messages[:-1],
            tokenize=False,
            add_generation_prompt=True,
        )
        prompt_ids = tokenizer(
            prompt_only,
            truncation=True,
            max_length=max_seq_length,
            padding=False,
            return_tensors=None,
        )["input_ids"]

        cutoff = len(prompt_ids)
        labels = [-100] * cutoff + input_ids[cutoff:]

        return {"input_ids": input_ids, "labels": labels, "attention_mask": encoded["attention_mask"]}

    rows = [apply_template(msgs) for msgs in messages_list]
    return Dataset.from_list(rows)


def main():
    parser = argparse.ArgumentParser(description="SQLLM LoRA fine-tuner (Metal/MPS)")
    parser.add_argument("--config", required=True, help="Path to config.yaml")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate data and print config, then exit without training",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).parent.resolve()
    cfg = load_config(args.config)

    log.info("Config: %s", args.config)
    log.info("  model:      %s", cfg["model_name"])
    log.info("  data:       %s", cfg["data_path"])
    log.info("  output:     %s", cfg["output_dir"])
    log.info("  epochs:     %s", cfg.get("num_train_epochs", 3))
    log.info("  lora_r:     %s", cfg.get("lora_r", 16))
    log.info("  4-bit:      disabled (MPS not supported)")

    eval_ratio = cfg.get("eval_split", 0.1)
    train_messages, eval_messages = load_dataset_from_jsonl(
        cfg["data_path"], eval_ratio, script_dir
    )

    if args.dry_run:
        log.info("Dry run complete — data valid, skipping training.")
        return

    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from peft import get_peft_model
    from trl import SFTTrainer, SFTConfig

    device = detect_device()
    log.info("Compute device: %s", device)

    log.info("Loading tokenizer: %s", cfg["model_name"])
    tokenizer = AutoTokenizer.from_pretrained(
        cfg["model_name"],
        trust_remote_code=True,
        padding_side="right",
    )
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    log.info("Building datasets")
    max_seq = cfg.get("max_seq_length", 2048)
    train_dataset = messages_to_hf_dataset(train_messages, tokenizer, max_seq)
    eval_dataset = messages_to_hf_dataset(eval_messages, tokenizer, max_seq)
    log.info("Train tokens — first example: %d", len(train_dataset[0]["input_ids"]))

    # Load in float16 to fit within unified memory.
    # bitsandbytes 4-bit is not available on MPS; we use standard LoRA instead.
    log.info("Loading model in float16: %s", cfg["model_name"])
    model = AutoModelForCausalLM.from_pretrained(
        cfg["model_name"],
        torch_dtype=torch.float16,
        trust_remote_code=True,
    )
    model = model.to(device)
    model.config.use_cache = False

    if cfg.get("gradient_checkpointing", False):
        log.info("Enabling gradient checkpointing")
        model.gradient_checkpointing_enable()
        model.enable_input_require_grads()  # required for PEFT + gradient checkpointing

    log.info("Wrapping with LoRA (r=%d, alpha=%d)", cfg.get("lora_r", 16), cfg.get("lora_alpha", 32))
    lora_config = build_lora_config(cfg)
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    output_dir = cfg["output_dir"]
    if not Path(output_dir).is_absolute():
        output_dir = str(script_dir / output_dir)

    # warmup_ratio was removed in transformers 5.2 — compute warmup_steps explicitly.
    import math
    batch_size = cfg.get("per_device_train_batch_size", 1)
    grad_accum = cfg.get("gradient_accumulation_steps", 8)
    epochs = cfg.get("num_train_epochs", 3)
    steps_per_epoch = math.ceil(len(train_dataset) / (batch_size * grad_accum))
    total_steps = steps_per_epoch * epochs
    warmup_steps = max(1, int(total_steps * cfg.get("warmup_ratio", 0.05)))
    log.info("  total_steps: %d  warmup_steps: %d", total_steps, warmup_steps)

    training_args = SFTConfig(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=grad_accum,
        learning_rate=cfg.get("learning_rate", 2e-4),
        warmup_steps=warmup_steps,
        lr_scheduler_type=cfg.get("lr_scheduler_type", "cosine"),
        bf16=False,   # MPS does not support bfloat16
        fp16=False,   # adapter updates run in float32 for stability
        gradient_checkpointing=cfg.get("gradient_checkpointing", False),
        logging_steps=cfg.get("logging_steps", 10),
        save_steps=cfg.get("save_steps", 50),
        save_total_limit=2,
        eval_strategy="steps",
        eval_steps=cfg.get("save_steps", 50),
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        report_to="none",
        dataloader_num_workers=0,     # MPS requires workers=0
        dataloader_pin_memory=False,  # pin_memory is a CUDA concept
        remove_unused_columns=False,
        max_length=max_seq,
        dataset_kwargs={"skip_prepare_dataset": True},
    )

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        processing_class=tokenizer,
    )

    log.info("Starting training")
    trainer.train()

    log.info("Saving LoRA adapter to %s", output_dir)
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)

    log.info("Training complete.")


if __name__ == "__main__":
    main()

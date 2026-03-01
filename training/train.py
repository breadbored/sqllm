"""
train.py — QLoRA fine-tuning of Qwen3.5-27B on SQLLM reasoning traces.

Usage:
    python train.py --config config.yaml
    python train.py --config config.yaml --dry-run   # validate data only

Hardware target: AMD RX 9070 XT (16GB GDDR6) with ROCm >= 6.3.1
Expected peak VRAM: ~14-15GB at 4-bit quantisation.
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


def build_bnb_config(cfg: dict):
    import torch
    from transformers import BitsAndBytesConfig

    compute_dtype = getattr(torch, cfg.get("bnb_4bit_compute_dtype", "bfloat16"))
    return BitsAndBytesConfig(
        load_in_4bit=cfg.get("load_in_4bit", True),
        bnb_4bit_compute_dtype=compute_dtype,
        bnb_4bit_use_double_quant=cfg.get("bnb_4bit_use_double_quant", True),
        bnb_4bit_quant_type=cfg.get("bnb_4bit_quant_type", "nf4"),
    )


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
    parser = argparse.ArgumentParser(description="SQLLM QLoRA fine-tuner")
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
    log.info("  bf16:       %s", cfg.get("bf16", True))

    eval_ratio = cfg.get("eval_split", 0.1)
    train_messages, eval_messages = load_dataset_from_jsonl(
        cfg["data_path"], eval_ratio, script_dir
    )

    if args.dry_run:
        log.info("Dry run complete — data valid, skipping training.")
        return

    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
    from peft import get_peft_model
    from trl import SFTTrainer, DataCollatorForCompletionOnlyLM

    log.info("Loading tokenizer: %s", cfg["model_name"])
    tokenizer = AutoTokenizer.from_pretrained(
        cfg["model_name"],
        trust_remote_code=True,
        padding_side="right",
    )
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    log.info("Building datasets")
    max_seq = cfg.get("max_seq_length", 4096)
    train_dataset = messages_to_hf_dataset(train_messages, tokenizer, max_seq)
    eval_dataset = messages_to_hf_dataset(eval_messages, tokenizer, max_seq)
    log.info("Train tokens — first example: %d", len(train_dataset[0]["input_ids"]))

    log.info("Loading model in 4-bit: %s", cfg["model_name"])
    bnb_config = build_bnb_config(cfg)
    model = AutoModelForCausalLM.from_pretrained(
        cfg["model_name"],
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.bfloat16,
    )
    model.config.use_cache = False

    log.info("Wrapping with LoRA (r=%d, alpha=%d)", cfg.get("lora_r", 16), cfg.get("lora_alpha", 32))
    lora_config = build_lora_config(cfg)
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    output_dir = cfg["output_dir"]
    if not Path(output_dir).is_absolute():
        output_dir = str(script_dir / output_dir)

    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=cfg.get("num_train_epochs", 3),
        per_device_train_batch_size=cfg.get("per_device_train_batch_size", 1),
        gradient_accumulation_steps=cfg.get("gradient_accumulation_steps", 8),
        learning_rate=cfg.get("learning_rate", 2e-4),
        warmup_ratio=cfg.get("warmup_ratio", 0.05),
        lr_scheduler_type=cfg.get("lr_scheduler_type", "cosine"),
        bf16=cfg.get("bf16", True),
        fp16=False,
        logging_steps=cfg.get("logging_steps", 10),
        save_steps=cfg.get("save_steps", 50),
        save_total_limit=2,
        evaluation_strategy="steps",
        eval_steps=cfg.get("save_steps", 50),
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        report_to="none",
        dataloader_num_workers=0,
        remove_unused_columns=False,
    )

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=tokenizer,
        max_seq_length=max_seq,
        dataset_kwargs={"skip_prepare_dataset": True},
    )

    log.info("Starting training")
    trainer.train()

    log.info("Saving LoRA adapter to %s", output_dir)
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)

    log.info("Training complete.")


if __name__ == "__main__":
    main()

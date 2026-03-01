# SQLLM Fine-Tuner — Metal/MPS fork (Qwen2.5-Coder-7B)

This is a **testing fork** of `../training/` (the production ROCm pipeline).
Its purpose is to validate the training pipeline on Apple Silicon before running
the real fine-tune on the RX 9070 XT. The model is smaller (7B vs 27B) and runs
without QLoRA — standard LoRA on a float16 base model.

---

## Context

```
Opus-generated JSONL (~50-100 records)
    ↓
fine-tune Qwen2.5-Coder-7B  ← this fork (Metal/MPS, pipeline validation)
    ↓
(if pipeline passes) fine-tune Qwen3.5-27B on ROCm  ← ../training/
    ↓
Qwen3.5:27B-SQLLM (runs locally via Ollama)
    ↓
generates 50k-100k synthetic training records
    ↓
fine-tune Qwen2.5-Coder-12B → SQLLM student model
```

---

## Hardware

- **GPU:** Apple Silicon (M3 Pro 18 GB / M3 Max 36 GB, or better)
- **Backend:** Metal via PyTorch MPS (Metal Performance Shaders)
- **Framework:** HuggingFace `transformers` + `peft` + `trl`

### Memory budget (7B model)

| Component              | ~Size   |
|------------------------|---------|
| 7B weights (float16)   | 14 GB   |
| LoRA adapters + opt    | 0.5 GB  |
| Activations (seq 2048) | 2–3 GB  |
| **Total**              | **~17–18 GB** |

Fits on 18 GB M3 Pro (tight) or 36 GB M3 Max (comfortable).

For a quick smoke-test on a tighter machine, switch `model_name` in
`config.yaml` to `Qwen/Qwen2.5-Coder-1.5B` (~3 GB float16).

### Key differences from the ROCm pipeline

| Feature              | This fork (Metal)       | Production (ROCm)        |
|----------------------|-------------------------|--------------------------|
| Model                | Qwen2.5-Coder-7B        | Qwen3.5-27B              |
| Quantization         | None (float16)          | 4-bit QLoRA (bitsandbytes) |
| bf16                 | No (MPS unsupported)    | Yes                      |
| `max_seq_length`     | 2048                    | 4096                     |
| `bitsandbytes`       | Not installed           | Required                 |

---

## Project Structure

```
~/sqllm/training-metal/
├── train.py                  # main training script
├── config.yaml               # Metal-specific hyperparameters
├── corpus_utils.py           # shared data utilities (identical to ../training/)
├── evaluate.py               # post-training evaluation
├── data/
│   └── training_data.jsonl   # input — output of reasoning-extractor
├── output/
│   └── qwen25-7b-sqllm-metal/ # LoRA adapter weights
├── CLAUDE.md
└── requirements.txt
```

---

## Setup

### Verify MPS is available

```python
import torch
print(torch.backends.mps.is_available())   # should be True on Apple Silicon
print(torch.backends.mps.is_built())       # should be True
```

### Python environment

```bash
python3 -m venv venv
source venv/bin/activate

# Standard PyTorch for macOS — MPS support is built in from PyTorch 2.0+
pip install torch torchvision torchaudio

pip install transformers peft trl datasets accelerate pyyaml
# Note: bitsandbytes is NOT installed — 4-bit quant is CUDA/ROCm only
```

---

## Training

```bash
python train.py --config config.yaml
```

Dry-run (validates data only, no model load):

```bash
python train.py --config config.yaml --dry-run
```

---

## Config Reference (`config.yaml`)

```yaml
model_name: Qwen/Qwen2.5-Coder-7B
load_in_4bit: false            # MPS does not support bitsandbytes quantization

lora_r: 16
lora_alpha: 32
lora_dropout: 0.05

max_seq_length: 2048           # reduced from 4096 to ease memory pressure
per_device_train_batch_size: 1
gradient_accumulation_steps: 8
num_train_epochs: 3
learning_rate: 2.0e-4
bf16: false                    # MPS does not support bfloat16
fp16: false                    # adapter updates run in float32
```

---

## Evaluation

```bash
python evaluate.py \
    --adapter output/qwen25-7b-sqllm-metal \
    --problems eval_problems.jsonl
```

The pass criteria are identical to the production pipeline (all 8 steps,
arrow notation in step 3, SQL block present, no ARRAY_AGG struct antipattern).
A pass here gives confidence the training logic is correct before investing
compute on the full 27B ROCm run.

---

## Notes

- `dataloader_num_workers=0` and `dataloader_pin_memory=False` are required
  for MPS — both are set in `train.py`.
- If you see `MPS backend out of memory`, reduce `max_seq_length` to 1024
  before touching batch size or LoRA rank.
- `bfloat16` is not supported on MPS as of PyTorch 2.x — any config that sets
  `bf16: true` will be silently overridden to `False` in `TrainingArguments`.
  The code explicitly sets `bf16=False` to make this unambiguous.

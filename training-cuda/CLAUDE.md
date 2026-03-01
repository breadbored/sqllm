# SQLLM Fine-Tuner — CUDA fork (Qwen2.5-Coder-7B + QLoRA)

This is the **CUDA fork** for running on rented GPU servers (A10, A100, RTX 4090, etc.)
while the production RX 9070 XT is in transit. Uses 4-bit QLoRA — the same
quantization strategy as the production ROCm pipeline, just on a smaller model.

---

## Context

```
Opus-generated JSONL (~50-100 records)
    ↓
fine-tune Qwen2.5-Coder-7B  ← this fork (CUDA rental, QLoRA)
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

- **GPU:** Any CUDA GPU with >= 16 GB VRAM (A10 24 GB, A100 40/80 GB, RTX 4090 24 GB)
- **Backend:** CUDA via PyTorch
- **Framework:** HuggingFace `transformers` + `peft` + `trl` + `bitsandbytes`

### Memory budget (7B model, 4-bit QLoRA)

| Component              | ~Size   |
|------------------------|---------|
| 7B weights (4-bit NF4) | 3.5 GB  |
| LoRA adapters + opt    | 0.5 GB  |
| Activations (seq 4096) | 3–5 GB  |
| **Total**              | **~7–9 GB** |

Fits on any 16 GB+ CUDA GPU. To use a larger model:

| Model                    | 4-bit VRAM | Minimum GPU        |
|--------------------------|------------|--------------------|
| Qwen2.5-Coder-7B         | ~7–9 GB    | RTX 3080 (10 GB)   |
| Qwen2.5-Coder-12B        | ~10–12 GB  | RTX 3080 Ti (12 GB)|
| Qwen2.5-Coder-32B        | ~22–26 GB  | A100 40 GB         |

### Key differences from the ROCm pipeline

| Feature          | This fork (CUDA)            | Production (ROCm)            |
|------------------|-----------------------------|------------------------------|
| Model            | Qwen2.5-Coder-7B            | Qwen3.5-27B                  |
| Quantization     | 4-bit QLoRA (bitsandbytes)  | 4-bit QLoRA (bitsandbytes)   |
| bf16             | Yes (Ampere+)               | Yes                          |
| `max_seq_length` | 4096                        | 4096                         |
| `bitsandbytes`   | Required                    | Required                     |

---

## Project Structure

```
~/sqllm/training-cuda/
├── train.py                  # main training script
├── config.yaml               # CUDA-specific hyperparameters
├── corpus_utils.py           # shared data utilities (identical to ../training/)
├── evaluate.py               # post-training evaluation
├── data/
│   └── training_data.jsonl   # input — output of reasoning-extractor
├── output/
│   └── qwen25-7b-sqllm-cuda/ # LoRA adapter weights
├── CLAUDE.md
└── requirements.txt
```

---

## Setup

### Verify CUDA is available

```python
import torch
print(torch.cuda.is_available())    # should be True
print(torch.cuda.get_device_name()) # e.g. "NVIDIA A100-SXM4-40GB"
```

### Python environment

```bash
python3 -m venv venv
source venv/bin/activate

# Install PyTorch with CUDA support (adjust cu121 to match your CUDA version)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

pip install transformers peft trl datasets accelerate pyyaml bitsandbytes
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
load_in_4bit: true             # 4-bit NF4 QLoRA (base frozen, adapters in bf16)

lora_r: 16
lora_alpha: 32
lora_dropout: 0.05

max_seq_length: 4096
per_device_train_batch_size: 1
gradient_accumulation_steps: 8
num_train_epochs: 5
learning_rate: 2.0e-4
bf16: true                     # bfloat16 on Ampere+ (A100, A10, RTX 30xx/40xx)
fp16: false
gradient_checkpointing: true
```

---

## Evaluation

```bash
python evaluate.py \
    --adapter output/qwen25-7b-sqllm-cuda \
    --problems eval_problems.jsonl \
    --load-4bit
```

`--load-4bit` matches the training quantization and uses less VRAM during eval.
Without it the base model is loaded in bfloat16 (~14 GB).

---

## Notes

- `bf16: true` requires Ampere or newer (A100, A10, RTX 30xx/40xx). On older
  cards (Pascal/Volta/Turing) set `bf16: false` and `fp16: true`.
- When `load_in_4bit: true`, `train.py` calls `prepare_model_for_kbit_training`
  which handles layer norm casting and `enable_input_require_grads` — do not
  call `gradient_checkpointing_enable()` manually in this path.
- `dataloader_num_workers=2` and `dataloader_pin_memory=True` are set
  automatically on CUDA for faster data loading.

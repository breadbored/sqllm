# SQLLM Fine-Tuner — Qwen3.5:27B

Fine-tunes `Qwen/Qwen3.5-27B` on SQLLM reasoning traces using QLoRA via the
HuggingFace PEFT stack. The resulting model replaces Opus as the synthetic data
generator in the next pipeline stage, producing high-volume training data at zero
per-token cost via Ollama.

---

## Context

This is the **intermediate fine-tune**, not the final student model. The goal is
not a general-purpose SQL model — it is a model that reliably produces SQLLM
reasoning traces in the correct format for a given SQL problem. Once this model
produces acceptable output quality, it feeds the volume generation stage that
produces training data for `Qwen2.5-Coder-12B`.

```
Opus-generated JSONL (~50-100 records)
    ↓
fine-tune Qwen3.5:27B  ← this project
    ↓
Qwen3.5:27B-SQLLM (runs locally via Ollama)
    ↓
generates 50k-100k synthetic training records
    ↓
fine-tune Qwen2.5-Coder-12B → SQLLM student model
```

---

## Hardware

- **GPU:** AMD RX 9070 XT (16GB GDDR6, gfx1201)
- **CPU RAM:** 32GB DDR5 6000MT/s
- **ROCm:** must be >= 6.3.1 for gfx1201 support
- **Framework:** HuggingFace `transformers` + `peft` + `trl`

**Note on Unsloth:** Unsloth is CUDA-first. ROCm support exists but is
experimental and not recommended for production fine-tuning on RDNA 4 yet.
Use the plain HuggingFace stack until Unsloth's ROCm path matures.

**Note on bitsandbytes:** `bitsandbytes` ROCm support is via
`bitsandbytes-rocm`. Install from source if the PyPI package does not
detect the RX 9070 XT correctly.

---

## Project Structure

```
~/sqllm/fine-tuner/
├── train.py                  # main training script
├── config.yaml               # training hyperparameters
├── data/
│   └── training_data.jsonl   # input — output of reasoning-extractor
├── output/
│   └── qwen35-sqllm/         # LoRA adapter weights (not full model)
├── CLAUDE.md
└── requirements.txt
```

---

## Setup

### ROCm environment

```bash
# verify ROCm version
rocminfo | grep "Name:" | head -5

# verify gfx1201 is detected
rocminfo | grep gfx1201
```

If gfx1201 is not detected, update ROCm before proceeding.

### Python environment

```bash
python3 -m venv venv
source venv/bin/activate

pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.3
pip install transformers peft trl datasets accelerate
pip install bitsandbytes  # try PyPI first; if ROCm detection fails, build from source
```

Verify GPU is visible to PyTorch:

```python
import torch
print(torch.cuda.is_available())   # should be True under ROCm
print(torch.cuda.get_device_name(0))
```

---

## Training

```bash
python train.py --config config.yaml
```

Expected peak VRAM usage for Qwen3.5-27B at 4-bit with QLoRA: ~14-15GB.
This leaves minimal headroom. If OOM occurs, reduce `max_seq_length` in
`config.yaml` before reducing batch size.

---

## Config Reference (`config.yaml`)

```yaml
model_name: Qwen/Qwen3.5-27B
data_path: data/training_data.jsonl
output_dir: output/qwen35-sqllm

# qlora settings
load_in_4bit: true
bnb_4bit_compute_dtype: bfloat16
bnb_4bit_use_double_quant: true
bnb_4bit_quant_type: nf4

# lora settings
lora_r: 16
lora_alpha: 32
lora_dropout: 0.05
lora_target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj
  - gate_proj
  - up_proj
  - down_proj

# training settings
max_seq_length: 4096
per_device_train_batch_size: 1
gradient_accumulation_steps: 8
num_train_epochs: 3
learning_rate: 2.0e-4
warmup_ratio: 0.05
lr_scheduler_type: cosine
save_steps: 50
logging_steps: 10
bf16: true
```

`lora_r: 16` is conservative for a dataset of 50-100 examples — keeps the
adapter small and reduces overfitting risk. Increase to 32 if the model
under-fits after 3 epochs.

---

## Data Format

The JSONL input must follow standard chat format as produced by the
reasoning-extractor:

```json
{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "natural language problem description" },
    { "role": "assistant", "content": "reasoning trace + SQL" }
  ]
}
```

The `source_file` metadata field is ignored during training if present.

---

## Output

Training produces a LoRA adapter in `output/qwen35-sqllm/`. This is not a
standalone model — it must be merged with or loaded alongside the base
`Qwen/Qwen3.5-27B` weights.

To use the fine-tuned model for synthetic data generation, either:

1. **Merge the adapter** into the base model weights and export as a full model
   for loading in Ollama via `ollama create`
2. **Load with PEFT** in the volume generation script directly, bypassing Ollama

Option 1 is simpler for Ollama integration. Option 2 avoids the merge step if
running generation from Python directly.

---

## Evaluation

After training, test the model on 3-5 held-out SQL problems not in the training
set. The model is performing acceptably if:

- All 8 steps are present in the output
- Step 3 uses arrow notation without being prompted to
- The SQL at step 7 is structurally correct for the described problem
- It does not default to `ARRAY_AGG(struct(...))` for argmax problems

If arrow notation is missing or inconsistent, increase epochs or `lora_r`
before proceeding to volume generation.

---

## Notes

- Do not train on the `source_file` field — strip it from JSONL before training
  if the training script does not ignore unknown fields automatically
- 3 epochs on 50-100 examples risks overfitting to specific schemas — monitor
  training loss and stop early if it bottoms out before epoch 3
- The system prompt is part of every training record and will be baked into the
  adapter's behavior — do not change the system prompt after training without
  retraining

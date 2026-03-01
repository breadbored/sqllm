"""
corpus_utils.py — utilities for loading and validating SQLLM training data.

Expected JSONL format (one JSON object per line):
  {
    "messages": [
      {"role": "system",    "content": "..."},
      {"role": "user",      "content": "..."},
      {"role": "assistant", "content": "..."}
    ],
    "source_file": "optional_metadata.sqlx"   # ignored at training time
  }
"""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Generator


REQUIRED_ROLES = ("system", "user", "assistant")


def validate_record(record: dict) -> tuple[bool, str]:
    """
    Return (True, "") if the record is valid, or (False, reason) if not.

    Rules:
    - Must have a "messages" key that is a list
    - Must have exactly 3 messages in order: system, user, assistant
    - Each message must have "role" and "content" keys
    - All content fields must be non-empty strings
    """
    if not isinstance(record, dict):
        return False, "record is not a dict"

    messages = record.get("messages")
    if not isinstance(messages, list):
        return False, "missing or non-list 'messages' field"

    if len(messages) != 3:
        return False, f"expected 3 messages, got {len(messages)}"

    for i, (msg, expected_role) in enumerate(zip(messages, REQUIRED_ROLES)):
        if not isinstance(msg, dict):
            return False, f"message {i} is not a dict"
        if msg.get("role") != expected_role:
            return False, f"message {i}: expected role '{expected_role}', got '{msg.get('role')}'"
        content = msg.get("content")
        if not isinstance(content, str) or not content.strip():
            return False, f"message {i}: empty or missing content"

    return True, ""


def iter_records(path: str | Path) -> Generator[dict, None, None]:
    """
    Yield parsed records from a JSONL file, skipping blank lines.
    Raises ValueError for malformed JSON or invalid records.
    """
    path = Path(path)
    with path.open("r", encoding="utf-8") as f:
        for lineno, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError as e:
                raise ValueError(f"{path}:{lineno}: JSON parse error — {e}") from e

            ok, reason = validate_record(record)
            if not ok:
                raise ValueError(f"{path}:{lineno}: invalid record — {reason}")

            yield record


def split_records(
    records: list[dict],
    eval_ratio: float = 0.1,
    seed: int = 42,
) -> tuple[list[dict], list[dict]]:
    """
    Split records into (train, eval) lists.

    With small datasets (< 20 records) a 0.1 ratio may produce 0 eval records;
    in that case at least 1 record is reserved for eval regardless of ratio.
    """
    if not 0.0 < eval_ratio < 1.0:
        raise ValueError(f"eval_ratio must be in (0, 1), got {eval_ratio}")

    shuffled = records[:]
    random.Random(seed).shuffle(shuffled)

    n_eval = max(1, int(len(shuffled) * eval_ratio))
    return shuffled[n_eval:], shuffled[:n_eval]


def record_to_messages(record: dict) -> list[dict]:
    """
    Extract the messages list from a record, stripping the source_file field.
    Returns a list of {"role": ..., "content": ...} dicts.
    """
    return [
        {"role": msg["role"], "content": msg["content"]}
        for msg in record["messages"]
    ]

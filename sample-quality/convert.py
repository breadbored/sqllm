#!/usr/bin/env python3
"""
Convert SQLLM training data between JSONL and plain-text edit format.

  --decode   JSONL → a folder of numbered .md files (one per record)
  --encode   folder of .md files → back to the same JSONL

The default companion folder is <jsonl-path-without-extension>/ next to the
JSONL file.  Pass -d/--dir to use a different directory.

Usage:
    python convert.py path/to/training_data.jsonl --decode
    python convert.py path/to/training_data.jsonl --decode -d /my/edit/dir

    python convert.py path/to/training_data.jsonl --encode
    python convert.py path/to/training_data.jsonl --encode -d /my/edit/dir
"""

import argparse
import json
import sys
from pathlib import Path

from format import edittext_to_record, record_to_edittext


# ── JSONL helpers ──────────────────────────────────────────────────────────────

def load_jsonl(path: Path) -> list[dict]:
    records: list[dict] = []
    with open(path, encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError as exc:
                    print(f"  Warning: skipping malformed line {lineno}: {exc}", file=sys.stderr)
    return records


def save_jsonl(path: Path, records: list[dict]) -> None:
    tmp = Path(str(path) + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    tmp.rename(path)


# ── Decode: JSONL → .md files ─────────────────────────────────────────────────

def decode(jsonl_path: Path, out_dir: Path) -> None:
    records = load_jsonl(jsonl_path)
    if not records:
        print("No records found.", file=sys.stderr)
        sys.exit(1)

    if out_dir.exists() and not out_dir.is_dir():
        print(f"Error: {out_dir} exists and is not a directory.", file=sys.stderr)
        sys.exit(1)
    out_dir.mkdir(parents=True, exist_ok=True)

    width = len(str(len(records)))  # zero-padding width

    for i, record in enumerate(records):
        filename = out_dir / f"{str(i + 1).zfill(width)}.md"
        filename.write_text(record_to_edittext(record), encoding="utf-8")

    print(f"Decoded {len(records)} records → {out_dir}/")


# ── Encode: .md files → JSONL ─────────────────────────────────────────────────

def encode(jsonl_path: Path, src_dir: Path) -> None:
    if not src_dir.is_dir():
        print(f"Error: expected folder {src_dir} does not exist.", file=sys.stderr)
        sys.exit(1)

    md_files = sorted(src_dir.glob("*.md"))
    if not md_files:
        print(f"No .md files found in {src_dir}.", file=sys.stderr)
        sys.exit(1)

    records: list[dict] = []
    errors = 0
    for md_file in md_files:
        text = md_file.read_text(encoding="utf-8")
        record = edittext_to_record(text)
        if not record.get("messages"):
            print(f"  Warning: {md_file.name} produced no messages — skipping", file=sys.stderr)
            errors += 1
            continue
        records.append(record)

    if not records:
        print("No valid records to write.", file=sys.stderr)
        sys.exit(1)

    save_jsonl(jsonl_path, records)
    summary = f"Encoded {len(records)} records → {jsonl_path}"
    if errors:
        summary += f"  ({errors} files skipped due to parse errors)"
    print(summary)


# ── Entry point ────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert training data between JSONL and plain-text edit format."
    )
    parser.add_argument("file", type=Path, help="Path to the .jsonl file")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--decode", action="store_true", help="JSONL → folder of .md files")
    mode.add_argument("--encode", action="store_true", help="folder of .md files → JSONL")
    parser.add_argument(
        "-d", "--dir", type=Path, default=None,
        help="Directory to read/write .md files (default: <jsonl-name-without-extension>/)",
    )
    args = parser.parse_args()

    jsonl_path = args.file.expanduser().resolve()
    companion = args.dir.expanduser().resolve() if args.dir else jsonl_path.with_suffix("")

    if args.decode:
        if not jsonl_path.exists():
            print(f"Error: {jsonl_path} not found.", file=sys.stderr)
            sys.exit(1)
        decode(jsonl_path, companion)
    else:
        encode(jsonl_path, companion)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Inject schema tables into training data USER prompts.

For each file in training_data/1615.md through training_data/2021.md:
  - Finds table names referenced in the document
  - Looks up their schemas from the schemas/ JSON files
  - Injects a ## Tables section at the top of the USER prompt
  - Wraps the original user text under ## Question

Skips files that already have ## Tables in the USER section.
"""

import json
import re
import sys
from pathlib import Path

SCHEMAS_DIR = Path(__file__).parent / "schemas"
TRAINING_DIR = Path(__file__).parent / "training_data"

SCHEMA_FILES = [
    "source-tables.json",
    "staging-tables.json",
    "aggregate-tables.json",
    "reporting-tables.json",
    "buckets-tables.json",
]

START = 1615
END = 2021


def load_schemas() -> dict[str, list[tuple[str, str]]]:
    """Load all schemas into a dict keyed by table_name."""
    schema_map: dict[str, list[tuple[str, str]]] = {}
    for fname in SCHEMA_FILES:
        path = SCHEMAS_DIR / fname
        data = json.load(open(path, encoding="utf-8"))
        for table in data:
            name = table["table_name"]
            cols = [(c["column_name"], c["data_type"]) for c in table["table_columns"]]
            schema_map[name] = cols
    return schema_map


def extract_table_names(text: str, schema_map: dict) -> list[str]:
    """Extract table names referenced in the document, filtered to known schema tables."""
    found: set[str] = set()

    # Pattern 1: ${ref("table_name")} or ${ref('table_name')}
    found.update(re.findall(r'ref\(["\'](\w+)["\']\)', text))

    # Pattern 2: "table_name" standalone double-quoted strings
    found.update(re.findall(r'"(\w+)"', text))

    # Pattern 3: .table_name` backtick edge case
    found.update(re.findall(r'\.(\w+)`', text))

    # Filter to only tables that exist in the schema
    return sorted(name for name in found if name in schema_map)


def build_tables_section(table_names: list[str], schema_map: dict) -> str:
    """Build the ## Tables markdown block."""
    lines = ["## Tables"]
    for name in table_names:
        lines.append(f"### {name}")
        lines.append("| column | type |")
        lines.append("|---|---|")
        for col_name, col_type in schema_map[name]:
            lines.append(f"| {col_name} | {col_type} |")
    return "\n".join(lines)


def process_file(path: Path, schema_map: dict) -> str:
    """
    Process a single .md file.
    Returns a status string: 'processed', 'skipped_already_done', 'skipped_no_tables'.
    """
    text = path.read_text(encoding="utf-8")

    user_marker = "--- USER ---"
    agent_marker = "--- AGENT ---"

    user_start = text.find(user_marker)
    if user_start == -1:
        return "skipped_no_user_section"

    user_content_start = user_start + len(user_marker)
    agent_start = text.find(agent_marker)

    user_section = text[user_content_start:agent_start] if agent_start != -1 else text[user_content_start:]

    # Skip if already has ## Tables in the user section
    if "## Tables" in user_section:
        return "skipped_already_done"

    table_names = extract_table_names(text, schema_map)
    if not table_names:
        return "skipped_no_tables"

    tables_section = build_tables_section(table_names, schema_map)

    user_content_stripped = user_section.strip()
    new_user_section = f"\n\n{tables_section}\n\n## Question\n{user_content_stripped}\n\n"

    before = text[:user_content_start]
    after = text[agent_start:] if agent_start != -1 else ""
    new_text = before + new_user_section + after

    path.write_text(new_text, encoding="utf-8")
    return "processed"


def main() -> None:
    schema_map = load_schemas()
    print(f"Loaded {len(schema_map)} tables from schemas")

    counts = {"processed": 0, "skipped_already_done": 0, "skipped_no_tables": 0, "skipped_no_user_section": 0, "missing": 0}

    for i in range(START, END + 1):
        fname = f"{i:04d}.md"
        path = TRAINING_DIR / fname
        if not path.exists():
            counts["missing"] += 1
            continue
        status = process_file(path, schema_map)
        counts[status] += 1

    print(f"Processed:            {counts['processed']}")
    print(f"Already had schemas:  {counts['skipped_already_done']}")
    print(f"No tables found:      {counts['skipped_no_tables']}")
    print(f"No USER section:      {counts['skipped_no_user_section']}")
    print(f"Missing files:        {counts['missing']}")


if __name__ == "__main__":
    main()

"""
Shared serialization between the JSONL record format and the plain-text edit format.

Edit-file layout
----------------
# source: filename.md          ← optional metadata line

--- SYSTEM ---

<system content>

--- USER ---

<user content>

--- AGENT ---

<assistant content>

Role headers must appear on a line by themselves. Everything between consecutive
headers is taken verbatim; leading/trailing blank lines are stripped per section.
"""

from typing import Optional

ROLE_TO_HEADER: dict[str, str] = {
    "system":    "--- SYSTEM ---",
    "user":      "--- USER ---",
    "assistant": "--- AGENT ---",
}
HEADER_TO_ROLE: dict[str, str] = {v: k for k, v in ROLE_TO_HEADER.items()}
ALL_HEADERS: set[str] = set(HEADER_TO_ROLE)


def record_to_edittext(record: dict) -> str:
    """Serialize a JSONL record to the plain-text edit format."""
    lines: list[str] = []
    source = record.get("source_file", "")
    if source:
        lines += [f"# source: {source}", ""]
    for msg in record.get("messages", []):
        role = msg.get("role", "?")
        content = msg.get("content", "")
        header = ROLE_TO_HEADER.get(role, f"--- {role.upper()} ---")
        lines += [header, "", content, ""]
    return "\n".join(lines)


def edittext_to_record(text: str, original: Optional[dict] = None) -> dict:
    """
    Parse the plain-text edit format back into a record dict.

    `original` is used only to fall back on source_file if the text omits the
    ``# source:`` line. Pass None when no original is available.

    Content lines are preserved verbatim — including any trailing spaces —
    because the original JSON may contain them. Only the blank separator lines
    added by record_to_edittext (one blank after the header, one blank before
    the next header) are stripped.
    """
    source_file: str = (original or {}).get("source_file", "")
    sections: dict[str, list[str]] = {}
    order: list[str] = []
    current_role: Optional[str] = None
    current_lines: list[str] = []

    for raw_line in text.splitlines():
        # Use rstrip only for comparison — never mutate the stored line.
        stripped = raw_line.rstrip()
        if stripped in ALL_HEADERS:
            if current_role is not None:
                # Trim trailing blank lines added by the serializer, keep the rest.
                while current_lines and not current_lines[-1].strip():
                    current_lines.pop()
                sections[current_role] = "\n".join(current_lines)
            current_role = HEADER_TO_ROLE[stripped]
            if current_role not in sections:
                order.append(current_role)
            current_lines = []
        elif stripped.startswith("# source:") and current_role is None:
            source_file = stripped[len("# source:"):].strip()
        else:
            if current_role is not None:
                # Skip the single blank line the serializer inserts after the header.
                if not current_lines and not raw_line.strip():
                    continue
                current_lines.append(raw_line)

    # Flush last section.
    if current_role is not None:
        while current_lines and not current_lines[-1].strip():
            current_lines.pop()
        sections[current_role] = "\n".join(current_lines)

    messages = [
        {"role": role, "content": sections[role]}
        for role in order
        if role in sections
    ]
    record: dict = {"messages": messages}
    if source_file:
        record["source_file"] = source_file
    return record

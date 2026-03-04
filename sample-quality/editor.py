#!/usr/bin/env python3
"""
SQLLM Sample Quality Editor

TUI for reviewing and editing LLM training data one record at a time.
Opens records in Zed for editing, tracks review progress, and saves changes.

Usage:
    python editor.py [path/to/training_data.jsonl]
    python editor.py          # defaults to training-cuda/data/training_data.jsonl
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Optional

from textual import on
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Container, VerticalScroll
from textual.reactive import reactive
from textual.widgets import DataTable, Footer, Header, Markdown, Static

from format import edittext_to_record, record_to_edittext

# ── Config ────────────────────────────────────────────────────────────────────

EDITOR = "zed"
DEFAULT_JSONL = (
    Path(__file__).parent.parent / "training-cuda" / "data" / "training_data.jsonl"
)

STATUS_META = {
    #            symbol  rich-style
    "pending":  ("○",   "dim white"),
    "edited":   ("✓",   "bold green"),
    "skipped":  ("—",   "yellow"),
    "editing":  ("✏",   "bold cyan"),
}

# ── Data helpers ──────────────────────────────────────────────────────────────

def load_jsonl(path: Path) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def save_jsonl(path: Path, records: list[dict]) -> None:
    tmp = Path(str(path) + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    tmp.rename(path)


def progress_path_for(jsonl_path: Path) -> Path:
    return Path(str(jsonl_path) + ".sqllm-progress.json")


def load_progress(path: Path) -> dict[int, str]:
    if path.exists():
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return {int(k): v for k, v in data.get("statuses", {}).items()}
    return {}


def save_progress(path: Path, statuses: dict[int, str]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"statuses": {str(k): v for k, v in statuses.items()}}, f, indent=2)


def get_snippet(record: dict, max_len: int = 38) -> str:
    """Short preview from the user turn."""
    for msg in record.get("messages", []):
        if msg.get("role") == "user":
            text = msg.get("content", "").replace("\n", " ").strip()
            return (text[: max_len - 1] + "…") if len(text) > max_len else text
    return record.get("source_file", "?")



def record_to_markdown(record: dict) -> str:
    """Markdown for the in-TUI preview panel."""
    lines: list[str] = []
    source = record.get("source_file", "")
    if source:
        lines += [f"*Source: `{source}`*", ""]
    for msg in record.get("messages", []):
        role = msg.get("role", "?")
        content = msg.get("content", "")
        lines += [f"### {role.upper()}", "", content, ""]
    return "\n".join(lines)


# ── App ───────────────────────────────────────────────────────────────────────

class SampleEditor(App):
    TITLE = "SQLLM Sample Quality Editor"

    CSS = """
    Screen { layout: vertical; }

    #body {
        layout: horizontal;
        height: 1fr;
    }

    /* ── Left panel ── */
    #left-panel {
        width: 48;
        border-right: solid $primary-darken-2;
    }

    #record-table {
        height: 1fr;
    }

    /* ── Right panel ── */
    #right-panel {
        width: 1fr;
        layout: vertical;
    }

    #edit-banner {
        height: 1;
        background: $warning-darken-1;
        color: $background;
        padding: 0 2;
        display: none;
    }

    #edit-banner.active {
        display: block;
    }

    #preview-scroll {
        height: 1fr;
        padding: 0 2;
    }

    /* ── Bottom bar ── */
    #stats-bar {
        height: 1;
        background: $primary-darken-3;
        color: $text-muted;
        padding: 0 2;
    }
    """

    BINDINGS = [
        Binding("e",     "edit",          "Edit in Zed",   show=True),
        Binding("r",     "reload",        "Reload edit",   show=True),
        Binding("s",     "skip",          "Skip",          show=True),
        Binding("u",     "unskip",        "Reset→pending", show=True),
        Binding("n",     "next_pending",  "Next pending",  show=True),
        Binding("q",     "quit",          "Quit",          show=True),
    ]

    current_index: reactive[int] = reactive(0)
    editing_index: reactive[Optional[int]] = reactive(None)

    def __init__(self, jsonl_path: Path) -> None:
        super().__init__()
        self.jsonl_path = jsonl_path
        self._progress_path = progress_path_for(jsonl_path)
        self.records: list[dict] = load_jsonl(jsonl_path)
        self.statuses: dict[int, str] = load_progress(self._progress_path)
        # Fill in missing
        for i in range(len(self.records)):
            if i not in self.statuses:
                self.statuses[i] = "pending"
        self._temp_path: Optional[Path] = None

    # ── Compose ───────────────────────────────────────────────────────────────

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Container(id="body"):
            with Container(id="left-panel"):
                yield DataTable(id="record-table", cursor_type="row", zebra_stripes=True)
            with Container(id="right-panel"):
                yield Static("", id="edit-banner")
                with VerticalScroll(id="preview-scroll"):
                    yield Markdown("", id="preview-md")
        yield Static("", id="stats-bar")
        yield Footer()

    def on_mount(self) -> None:
        table = self.query_one("#record-table", DataTable)
        table.add_column("#",       key="num",     width=5)
        table.add_column("St",      key="status",  width=3)
        table.add_column("Preview", key="snippet", width=38)
        self._rebuild_table()
        # Jump to first pending record
        start = self._first_pending()
        if start is not None:
            table.move_cursor(row=start)
            self.current_index = start
        self._refresh_preview()
        self._refresh_stats()

    # ── Table helpers ─────────────────────────────────────────────────────────

    def _rebuild_table(self) -> None:
        table = self.query_one("#record-table", DataTable)
        table.clear()
        for i, record in enumerate(self.records):
            sym, _ = STATUS_META[self.statuses.get(i, "pending")]
            table.add_row(str(i + 1), sym, get_snippet(record), key=str(i))

    def _refresh_row(self, index: int) -> None:
        table = self.query_one("#record-table", DataTable)
        sym, _ = STATUS_META[self.statuses.get(index, "pending")]
        try:
            table.update_cell(str(index), "status",  sym,                        update_width=False)
            table.update_cell(str(index), "snippet",  get_snippet(self.records[index]), update_width=False)
        except Exception:
            pass  # row may not exist yet

    # ── Preview / stats / banner ──────────────────────────────────────────────

    def _refresh_preview(self) -> None:
        i = self.current_index
        if 0 <= i < len(self.records):
            self.query_one("#preview-md", Markdown).update(
                record_to_markdown(self.records[i])
            )

    def _refresh_stats(self) -> None:
        edited  = sum(1 for s in self.statuses.values() if s == "edited")
        skipped = sum(1 for s in self.statuses.values() if s == "skipped")
        pending = sum(1 for s in self.statuses.values() if s == "pending")
        total   = len(self.records)
        self.query_one("#stats-bar", Static).update(
            f"  {self.jsonl_path.name}"
            f"  │  {self.current_index + 1}/{total}"
            f"  │  ✓ {edited} edited"
            f"   — {skipped} skipped"
            f"   ○ {pending} pending"
        )

    def _refresh_banner(self) -> None:
        banner = self.query_one("#edit-banner", Static)
        if self.editing_index is not None and self.editing_index == self.current_index:
            banner.update(
                f"  ✏  Editing record {self.editing_index + 1} in Zed"
                "  —  press [R] to reload when saved"
            )
            banner.add_class("active")
        else:
            banner.update("")
            banner.remove_class("active")

    # ── Events ────────────────────────────────────────────────────────────────

    @on(DataTable.RowHighlighted)
    def row_highlighted(self, event: DataTable.RowHighlighted) -> None:
        if event.row_key and event.row_key.value is not None:
            self.current_index = int(str(event.row_key.value))
            self._refresh_preview()
            self._refresh_stats()
            self._refresh_banner()

    # ── Actions ───────────────────────────────────────────────────────────────

    def action_edit(self) -> None:
        """Open current record in Zed for editing."""
        i = self.current_index
        record = self.records[i]

        temp = Path(tempfile.gettempdir()) / f"sqllm_edit_{i}.md"
        temp.write_text(record_to_edittext(record), encoding="utf-8")
        self._temp_path = temp
        self.editing_index = i

        self.statuses[i] = "editing"
        self._refresh_row(i)
        self._refresh_banner()

        subprocess.Popen([EDITOR, str(temp)])
        self.notify(
            f"Record {i + 1} opened — press [R] when done",
            title="Editing",
        )

    def action_reload(self) -> None:
        """Read the edited JSON back from disk and save."""
        if self.editing_index is None or self._temp_path is None:
            self.notify("No active edit to reload", severity="warning")
            return

        i = self.editing_index
        temp = self._temp_path

        if not temp.exists():
            self.notify("Temp file not found", severity="error")
            return

        try:
            updated = edittext_to_record(temp.read_text(encoding="utf-8"), self.records[i])
        except Exception as exc:
            self.notify(f"Parse error: {exc}", severity="error")
            return

        if not updated.get("messages"):
            self.notify("No sections found — check the --- SYSTEM/USER/AGENT --- headers", severity="error")
            return

        changed = updated != self.records[i]
        self.records[i] = updated
        self.statuses[i] = "edited"
        self.editing_index = None
        self._temp_path = None

        self._refresh_row(i)
        self._refresh_banner()

        save_jsonl(self.jsonl_path, self.records)
        save_progress(self._progress_path, self.statuses)

        self.notify(
            f"Record {i + 1} saved {'(modified)' if changed else '(no changes)'}",
            title="Saved",
        )
        self._refresh_preview()
        self._refresh_stats()
        self._advance_pending(after=i)

    def action_skip(self) -> None:
        """Mark current record as skipped and move on."""
        i = self.current_index
        if self.editing_index == i:
            self.editing_index = None
        self.statuses[i] = "skipped"
        self._refresh_row(i)
        self._refresh_banner()
        save_progress(self._progress_path, self.statuses)
        self._refresh_stats()
        self._advance_pending(after=i)

    def action_unskip(self) -> None:
        """Reset current record back to pending."""
        i = self.current_index
        if self.editing_index == i:
            self.editing_index = None
        prev = self.statuses.get(i, "pending")
        self.statuses[i] = "pending"
        self._refresh_row(i)
        self._refresh_banner()
        save_progress(self._progress_path, self.statuses)
        self._refresh_stats()
        self.notify(f"Record {i + 1} reset to pending (was: {prev})", title="Reset")

    def action_next_pending(self) -> None:
        """Jump to next pending record."""
        self._advance_pending(after=self.current_index - 1)

    # ── Navigation helpers ────────────────────────────────────────────────────

    def _first_pending(self) -> Optional[int]:
        for i in range(len(self.records)):
            if self.statuses.get(i) == "pending":
                return i
        return None

    def _advance_pending(self, after: int) -> None:
        """Move cursor to the next pending record after `after`, wrapping around."""
        table = self.query_one("#record-table", DataTable)
        n = len(self.records)
        candidates = list(range(after + 1, n)) + list(range(0, after + 1))
        for i in candidates:
            if self.statuses.get(i) == "pending":
                table.move_cursor(row=i)
                self.current_index = i
                self._refresh_preview()
                self._refresh_stats()
                self._refresh_banner()
                return
        self.notify("No more pending records!", title="Complete")


# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    if len(sys.argv) > 1:
        path = Path(sys.argv[1]).expanduser().resolve()
    else:
        path = DEFAULT_JSONL

    if not path.exists():
        print(f"Error: file not found: {path}", file=sys.stderr)
        print(f"Usage: python editor.py [path/to/training_data.jsonl]", file=sys.stderr)
        sys.exit(1)

    SampleEditor(path).run()


if __name__ == "__main__":
    main()

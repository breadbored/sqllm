"use client";

import { Button } from "doriath";
import type { SelectedTable } from "@/lib/types";

interface Props {
  value: string;
  onChange: (v: string) => void;
  selectedTables: SelectedTable[];
  onSubmit: () => void;
  loading: boolean;
}

export function QuestionInput({ value, onChange, selectedTables, onSubmit, loading }: Props) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!loading && value.trim() && selectedTables.length > 0) onSubmit();
    }
  }

  const canSubmit = !loading && value.trim().length > 0 && selectedTables.length > 0;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-moria-500">Question</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the data transformation you need…"
          rows={3}
          disabled={loading}
          className={[
            "w-full rounded-xl border bg-moria-800 px-4 py-3 text-base outline-none transition-colors",
            "text-moria-400 placeholder:text-moria-600",
            loading
              ? "border-moria-700 text-moria-600 cursor-not-allowed resize-none"
              : "border-moria-500 focus:border-moria-300 focus:text-moria-300 resize-y",
          ].join(" ")}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-moria-600">
          {selectedTables.length === 0
            ? "Select at least one table to continue"
            : `${selectedTables.length} table${selectedTables.length === 1 ? "" : "s"} · ⌘↵ to run`}
        </span>
        <Button variant="primary" disabled={!canSubmit} onClick={onSubmit}>
          {loading ? "Running…" : "Run"}
        </Button>
      </div>
    </div>
  );
}

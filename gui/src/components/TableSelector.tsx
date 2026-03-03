"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Database, X } from "lucide-react";
import { SearchInput } from "doriath";
import type { SelectedTable, TableColumn, TableRow } from "@/lib/types";

interface Props {
  selected: SelectedTable[];
  onChange: (tables: SelectedTable[]) => void;
}

export function TableSelector({ selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TableRow[]>([]);
  const [loadingSchema, setLoadingSchema] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch table list whenever query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/tables?q=${encodeURIComponent(query)}`);
      const data: TableRow[] = await res.json();
      setResults(data);
    }, 200);
  }, [query]);

  const selectedNames = new Set(selected.map((t) => t.name));

  async function toggleTable(row: TableRow) {
    if (selectedNames.has(row.table_name)) {
      onChange(selected.filter((t) => t.name !== row.table_name));
      return;
    }

    setLoadingSchema(row.table_name);
    try {
      const res = await fetch(
        `/api/schema?table=${encodeURIComponent(row.table_name)}`,
      );
      if (!res.ok) return;
      const columns: TableColumn[] = await res.json();
      onChange([
        ...selected,
        { name: row.table_name, dataset: row.dataset_id, columns },
      ]);
    } finally {
      setLoadingSchema(null);
    }
  }

  function removeTable(name: string) {
    onChange(selected.filter((t) => t.name !== name));
  }

  return (
    <aside className="w-64 shrink-0 bg-moria-800 border-r border-moria-700 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-moria-700">
        <div className="flex items-center gap-2 mb-3">
          <Database size={15} strokeWidth={1.75} className="text-moria-500" />
          <span className="text-xs font-semibold text-moria-500 uppercase tracking-widest">
            Tables
          </span>
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search tables…"
        />
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="px-4 py-3 border-b border-moria-700 flex flex-wrap gap-1.5">
          {selected.map((t) => (
            <span
              key={t.name}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: "var(--color-moria-700)",
                color: "var(--color-moria-400)",
              }}
            >
              {t.name}
              <button
                onClick={() => removeTable(t.name)}
                className="-mr-0.5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`Remove ${t.name}`}
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Table list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
        {results.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-moria-600">
            No tables found
          </div>
        ) : (
          results.map((row) => {
            const active = selectedNames.has(row.table_name);
            const loading = loadingSchema === row.table_name;
            return (
              <button
                key={row.table_name}
                onClick={() => toggleTable(row)}
                disabled={loading}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
                  ${
                    active
                      ? "bg-moria-700 text-moria-300"
                      : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"
                  } disabled:opacity-50`}
              >
                <span className="flex-1 truncate font-mono text-xs">
                  {row.table_name}
                </span>
                {active && (
                  <Check
                    size={13}
                    strokeWidth={2.5}
                    style={{ color: "var(--color-accent)" }}
                    className="shrink-0"
                  />
                )}
                {loading && (
                  <span className="shrink-0 w-3 h-3 rounded-full border-2 border-moria-600 border-t-accent animate-spin" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Footer count */}
      <div className="px-4 py-3 border-t border-moria-700">
        <span className="text-xs text-moria-600">
          {selected.length === 0
            ? "No tables selected"
            : `${selected.length} table${selected.length === 1 ? "" : "s"} selected`}
        </span>
      </div>
    </aside>
  );
}

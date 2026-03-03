"use client";

import { useState } from "react";
import { Search, Table, AlertTriangle } from "lucide-react";
import { Button, GhostButton } from "doriath";
import { toTableColumns } from "@/lib/schema";
import type { ModelRequest, TableRow, TableColumn, SelectedTable } from "@/lib/types";

interface Props {
  request: ModelRequest;
  onApprove: (additionalTables: SelectedTable[]) => void;
  onReject: (note: string) => void;
}

export function RequestPanel({ request, onApprove, onReject }: Props) {
  const [searchResults, setSearchResults] = useState<TableRow[]>([]);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [fetchedSchema, setFetchedSchema] = useState<TableColumn[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch() {
    if (request.type !== "search_tables") return;
    setLoading(true);
    const res = await fetch(`/api/tables?q=${encodeURIComponent(request.query)}`);
    const data: TableRow[] = await res.json();
    setSearchResults(data);
    setSearched(true);
    setLoading(false);
  }

  async function runFetch() {
    if (request.type !== "fetch_schema") return;
    setLoading(true);
    setFetchError(null);
    const res = await fetch(`/api/schema?table=${encodeURIComponent(request.table)}`);
    if (res.ok) {
      const cols: TableColumn[] = await res.json();
      setFetchedSchema(cols);
    } else {
      const body = await res.json();
      const suggestions = (body.suggestions as string[]) ?? [];
      setFetchError(
        `Table not found.${suggestions.length > 0 ? ` Did you mean: ${suggestions.join(", ")}?` : ""}`
      );
    }
    setLoading(false);
  }

  function toggleTable(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function approve() {
    if (request.type === "search_tables") {
      const tables: SelectedTable[] = [...selectedNames].map((name) => {
        const row = searchResults.find((r) => r.table_name === name)!;
        return { name: row.table_name, dataset: row.dataset_id, columns: toTableColumns(row.table_columns) };
      });
      onApprove(tables);
    } else if (request.type === "fetch_schema" && fetchedSchema) {
      onApprove([{ name: request.table, dataset: "", columns: fetchedSchema }]);
    }
  }

  const canApprove =
    request.type === "search_tables" ? searched : fetchedSchema !== null;

  return (
    <div className="rounded-xl border border-moria-700 bg-moria-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-moria-700 flex items-start gap-3">
        <div className="mt-0.5 h-6 w-6 rounded-lg bg-moria-700 flex items-center justify-center shrink-0">
          {request.type === "search_tables" ? (
            <Search size={13} strokeWidth={2} className="text-moria-500" />
          ) : (
            <Table size={13} strokeWidth={2} className="text-moria-500" />
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-moria-300">
            {request.type === "search_tables"
              ? `Search tables: "${request.query}"`
              : `Fetch schema: "${request.table}"`}
          </div>
          <div className="text-xs text-moria-500 mt-0.5">{request.reason}</div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Search results */}
        {request.type === "search_tables" && (
          <div className="space-y-2">
            {!searched ? (
              <Button variant="secondary" onClick={runSearch} disabled={loading}>
                {loading ? "Searching…" : "Run search"}
              </Button>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-moria-500">No matching tables found.</p>
            ) : (
              <div className="rounded-xl border border-moria-700 overflow-hidden">
                {searchResults.map((row) => (
                  <button
                    key={row.table_name}
                    onClick={() => toggleTable(row.table_name)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left border-b border-moria-700 last:border-b-0 transition-colors
                      ${selectedNames.has(row.table_name)
                        ? "bg-moria-700 text-moria-300"
                        : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"
                      }`}
                  >
                    <span className="flex-1 font-mono text-xs">{row.table_name}</span>
                    <span className="text-xs text-moria-600">{row.dataset_id}</span>
                    {selectedNames.has(row.table_name) && (
                      <span className="text-xs font-medium" style={{ color: "var(--color-accent)" }}>
                        selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fetch schema */}
        {request.type === "fetch_schema" && (
          <div className="space-y-2">
            {!fetchedSchema && !fetchError ? (
              <Button variant="secondary" onClick={runFetch} disabled={loading}>
                {loading ? "Fetching…" : "Fetch schema"}
              </Button>
            ) : fetchError ? (
              <div className="flex items-start gap-2 text-sm text-moria-400">
                <AlertTriangle
                  size={15}
                  strokeWidth={2}
                  className="shrink-0 mt-0.5"
                  style={{ color: "var(--color-lift-negative)" }}
                />
                {fetchError}
              </div>
            ) : fetchedSchema ? (
              <div className="rounded-xl border border-moria-700 overflow-hidden">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-moria-700 bg-moria-700">
                      <th className="px-3 py-2 text-left font-semibold text-moria-500 uppercase tracking-wider">
                        column
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-moria-500 uppercase tracking-wider">
                        type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetchedSchema.map((col) => (
                      <tr key={col.name} className="border-b border-moria-700 last:border-b-0">
                        <td className="px-3 py-2 font-mono text-moria-400">{col.name}</td>
                        <td className="px-3 py-2 text-moria-500">{col.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}

        {/* Reject form */}
        {rejecting && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-moria-500">
              Rejection note (optional)
            </label>
            <input
              type="text"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Explain to the model what to do instead…"
              className="w-full rounded-xl border border-moria-500 bg-moria-900 px-4 py-2.5 text-sm text-moria-400 placeholder:text-moria-600 outline-none focus:border-moria-300 focus:text-moria-300 transition-colors"
            />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => onReject(rejectNote)}>
                Reject
              </Button>
              <GhostButton onClick={() => setRejecting(false)}>Cancel</GhostButton>
            </div>
          </div>
        )}

        {/* Primary actions */}
        {!rejecting && (
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={approve} disabled={!canApprove}>
              Approve
            </Button>
            <GhostButton onClick={() => setRejecting(true)}>Reject</GhostButton>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { DataTableColumn } from "../types";

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = sortKey === null ? rows : [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortKey];
    const bv = (b as Record<string, unknown>)[sortKey];
    const cmp = (av as string | number) < (bv as string | number) ? -1 : (av as string | number) > (bv as string | number) ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="rounded-xl border border-moria-700 overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-moria-700 bg-moria-800">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={[
                  "px-4 py-3 text-xs font-semibold text-moria-500 uppercase tracking-wider whitespace-nowrap",
                  col.align === "right" ? "text-right" : "text-left",
                  col.sortable ? "cursor-pointer hover:text-moria-300 transition-colors select-none" : "",
                ].join(" ")}
              >
                <span className={`inline-flex items-center gap-1.5 ${col.align === "right" ? "flex-row-reverse" : ""}`}>
                  {col.header}
                  {col.sortable && (
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? <ArrowUp size={12} strokeWidth={2.5} />
                        : <ArrowDown size={12} strokeWidth={2.5} />
                      : <ArrowUpDown size={12} strokeWidth={2} className="text-moria-600" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => (
            <tr
              key={row.id}
              className="border-b border-moria-700 last:border-b-0 hover:bg-moria-800 transition-colors"
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={[
                    "px-4 py-3 text-sm text-moria-400",
                    col.align === "right" ? "text-right tabular-nums" : "text-left",
                  ].join(" ")}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

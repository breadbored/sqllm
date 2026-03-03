"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  function getPages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)             return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  }

  const btnBase = "flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors";
  const arrowBase = (off: boolean) =>
    `${btnBase} text-moria-500 ${off ? "opacity-30 cursor-not-allowed" : "hover:bg-moria-700 hover:text-moria-300 cursor-pointer"}`;

  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={page <= 1} onClick={() => page > 1 && onChange(page - 1)}
        className={arrowBase(page <= 1)}>
        <ChevronLeft size={16} strokeWidth={2} />
      </button>

      {getPages().map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} className={`${btnBase} text-moria-600 cursor-default`}>…</span>
          : <button key={p} type="button" onClick={() => onChange(p as number)}
              className={`${btnBase} ${p === page ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"}`}>
              {p}
            </button>
      )}

      <button type="button" disabled={page >= totalPages} onClick={() => page < totalPages && onChange(page + 1)}
        className={arrowBase(page >= totalPages)}>
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

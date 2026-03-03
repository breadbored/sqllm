"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import type { ComboOption } from "../types";

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
}: {
  options: ComboOption[];
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selected = options.find(o => o.value === value) ?? null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-moria-800 text-sm transition-colors
                     ${disabled ? "border-moria-700 cursor-not-allowed" : open ? "border-moria-300" : "border-moria-500"}`}
      >
        <span className={`flex-1 text-left truncate ${selected ? "text-moria-400" : "text-moria-600"}`}>
          {selected?.label ?? placeholder}
        </span>
        {selected && !disabled && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange(null); }}
            className="text-moria-500 hover:text-moria-300 transition-colors"
          >
            <X size={14} strokeWidth={2.5} />
          </span>
        )}
        <ChevronDown size={16} strokeWidth={2}
          className={`shrink-0 text-moria-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-moria-800 border border-moria-500 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-moria-700">
            <Search size={14} strokeWidth={2} className="text-moria-500 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 text-sm bg-transparent outline-none text-moria-300 placeholder:text-moria-600"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-moria-500 hover:text-moria-300 transition-colors">
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto scrollbar-hide">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-moria-600 text-center">No results</div>
            ) : (
              filtered.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                               ${option.value === value
                                 ? "bg-moria-700 text-moria-300"
                                 : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"}`}
                  onClick={() => { onChange(option.value); setOpen(false); setQuery(""); }}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <Check size={14} strokeWidth={2.5} style={{ color: "var(--color-accent)" }} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import type { ComboOption } from "../types";

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
}: {
  options: ComboOption[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

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

  const toggle = (val: string) => {
    onChange(value.includes(val) ? value.filter(v => v !== val) : [...value, val]);
  };

  const triggerLabel =
    value.length === 0 ? placeholder
    : value.length === 1 ? (options.find(o => o.value === value[0])?.label ?? "1 selected")
    : `${value.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-moria-800 text-sm transition-colors
                     ${disabled ? "border-moria-700 cursor-not-allowed" : open ? "border-moria-300" : "border-moria-500"}`}
      >
        <span className={`flex-1 text-left truncate ${value.length > 0 ? "text-moria-400" : "text-moria-600"}`}>
          {triggerLabel}
        </span>
        {value.length > 0 && !disabled && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange([]); }}
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
              filtered.map(option => {
                const checked = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
                                 ${checked ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"}`}
                    onClick={() => toggle(option.value)}
                  >
                    <span className={`shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-colors
                                       ${checked ? "border-accent bg-accent" : "border-moria-500 bg-transparent"}`}>
                      {checked && <Check size={10} strokeWidth={3} className="text-white" />}
                    </span>
                    <span className="flex-1 truncate">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
          {value.length > 0 && (
            <div className="border-t border-moria-700 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-moria-500">{value.length} selected</span>
              <button
                onClick={() => onChange([])}
                className="text-xs text-moria-500 hover:text-moria-300 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

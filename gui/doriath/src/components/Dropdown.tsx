"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { DropdownOption } from "../types";

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
}: {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find(o => o.value === value) ?? null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={[
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left",
          "bg-moria-800 transition-colors disabled:cursor-not-allowed",
          open      ? "border-moria-300" :
          disabled  ? "border-moria-700" : "border-moria-500",
        ].join(" ")}
      >
        <span className={`flex-1 truncate ${selected ? "text-moria-400" : "text-moria-600"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`shrink-0 text-moria-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-moria-800 border border-moria-500 rounded-xl overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={[
                "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left",
                opt.value === value
                  ? "bg-moria-700 text-moria-300"
                  : "text-moria-400 hover:bg-moria-700 hover:text-moria-300",
              ].join(" ")}
            >
              <span>{opt.label}</span>
              {opt.value === value && (
                <Check size={14} strokeWidth={2.5} className="shrink-0" style={{ color: "var(--color-accent)" }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

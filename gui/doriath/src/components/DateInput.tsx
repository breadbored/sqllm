"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";

export function DateInput({
  value,
  onChange,
  disabled = false,
  label,
}: {
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const borderClass = disabled ? "border-moria-700" : "border-moria-500 focus-within:border-moria-300";
  return (
    <div className="space-y-1.5">
      {label && <div className="text-xs font-medium text-moria-500">{label}</div>}
      <div className={`flex rounded-xl border bg-moria-800 overflow-hidden transition-colors ${borderClass}`}>
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          className={`flex-1 px-4 py-3 text-base bg-transparent outline-none transition-colors
                       ${disabled ? "text-moria-600 cursor-not-allowed" : "text-moria-400 focus:text-moria-300"}`}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => inputRef.current?.showPicker?.()}
          className={`flex items-center pr-4 shrink-0 transition-colors
                       ${disabled ? "text-moria-600 cursor-not-allowed" : "text-moria-500 hover:text-moria-300 cursor-pointer"}`}
        >
          <Calendar size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

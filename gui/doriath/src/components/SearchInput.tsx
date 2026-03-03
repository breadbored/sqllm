"use client";

import { Search, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";
  return (
    <div className={`flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`}>
      <span className="flex items-center pl-4 pr-2 text-moria-500 shrink-0">
        <Search size={16} strokeWidth={2} />
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed"
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          tabIndex={-1}
          aria-label="Clear"
          className="flex items-center pr-3 text-moria-500 hover:text-moria-300 transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

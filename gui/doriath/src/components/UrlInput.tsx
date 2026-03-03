"use client";

import { Globe, Check, X } from "lucide-react";

export function UrlInput({
  value,
  onChange,
  placeholder = "https://example.com",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const isEmpty = value.length === 0;
  const isValid = !isEmpty && (() => {
    try { new URL(value); return true; } catch { return false; }
  })();
  const isInvalid = !isEmpty && !isValid;
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";

  return (
    <div className={`flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`}>
      <span className={`flex items-center justify-center px-3 border-r ${borderColor} text-moria-500 shrink-0`}>
        <Globe size={16} strokeWidth={2} />
      </span>
      <input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed"
      />
      {isValid && (
        <span className="flex items-center justify-center px-3 shrink-0" style={{ color: "var(--color-lift-positive)" }}>
          <Check size={16} strokeWidth={2.5} />
        </span>
      )}
      {isInvalid && (
        <span className="flex items-center justify-center px-3 shrink-0" style={{ color: "var(--color-lift-negative)" }}>
          <X size={16} strokeWidth={2.5} />
        </span>
      )}
    </div>
  );
}

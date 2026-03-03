"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder = "0",
  disabled = false,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  function increment() {
    if (disabled) return;
    const next = (value === "" ? 0 : value) + step;
    onChange(max !== undefined ? Math.min(next, max) : next);
  }

  function decrement() {
    if (disabled) return;
    const next = (value === "" ? 0 : value) - step;
    onChange(min !== undefined ? Math.max(next, min) : next);
  }

  const borderColor = disabled ? "border-moria-700" : "border-moria-500";

  return (
    <div className={`flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`}>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className={`flex flex-col border-l ${borderColor}`}>
        <button
          type="button"
          onClick={increment}
          disabled={disabled || (max !== undefined && value !== "" && value >= max)}
          className="flex-1 flex items-center justify-center px-2 text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          tabIndex={-1}
        >
          <ChevronUp size={14} strokeWidth={2.5} />
        </button>
        <div className={`h-px ${disabled ? "bg-moria-700" : "bg-moria-500"}`} />
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || (min !== undefined && value !== "" && value <= min)}
          className="flex-1 flex items-center justify-center px-2 text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          tabIndex={-1}
        >
          <ChevronDown size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

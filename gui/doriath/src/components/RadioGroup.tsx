"use client";

import type { RadioOption } from "../types";

export function RadioGroup({
  options,
  value,
  onChange,
  disabled = false,
}: {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" className="flex flex-col gap-3">
      {options.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className="group flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none"
          >
            <span
              className={[
                "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                selected ? "border-accent bg-accent" : "border-moria-500 bg-moria-800",
                disabled ? "opacity-40" : "group-hover:border-moria-300",
              ].join(" ")}
            >
              {selected && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </span>
            <span className={`text-base transition-colors ${disabled ? "text-moria-600" : "text-moria-400 group-hover:text-moria-300"}`}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

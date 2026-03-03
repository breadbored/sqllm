"use client";

import { Check, Minus } from "lucide-react";
import type { CheckState } from "../types";

export function Checkbox({
  state,
  onChange,
  label,
  disabled = false,
}: {
  state: CheckState;
  onChange: (next: CheckState) => void;
  label?: string;
  disabled?: boolean;
}) {
  function cycle() {
    if (disabled) return;
    onChange(state === "off" ? "on" : state === "on" ? "off" : "off");
  }

  const isChecked = state === "on";
  const isIndeterminate = state === "some";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isIndeterminate ? "mixed" : isChecked}
      onClick={cycle}
      disabled={disabled}
      className={[
        "group flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed",
        "focus-visible:outline-none",
      ].join(" ")}
    >
      <span
        className={[
          "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors",
          isChecked
            ? "border-accent bg-accent"
            : isIndeterminate
              ? "border-moria-500 bg-moria-800"
              : "border-moria-500 bg-moria-800",
          disabled ? "opacity-40" : "group-hover:border-moria-300",
        ].join(" ")}
      >
        {isChecked && <Check size={12} strokeWidth={3} className="text-white" />}
        {isIndeterminate && <Minus size={12} strokeWidth={3} className="text-moria-400" />}
      </span>
      {label && (
        <span className={`text-base transition-colors ${disabled ? "text-moria-600" : "text-moria-400 group-hover:text-moria-300"}`}>
          {label}
        </span>
      )}
    </button>
  );
}

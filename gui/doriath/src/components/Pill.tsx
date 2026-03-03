"use client";

import { X } from "lucide-react";
import type { PillVariant } from "../types";

const PILL_STYLE: Record<PillVariant, { background: string; color: string }> = {
  default:  { background: "var(--color-moria-700)",    color: "var(--color-moria-400)" },
  positive: { background: "rgba(95, 138, 86, 0.15)",   color: "var(--color-lift-positive)" },
  warning:  { background: "rgba(192, 138, 42, 0.15)",  color: "var(--color-lift-warning)" },
  negative: { background: "rgba(168, 87, 46, 0.15)",   color: "var(--color-lift-negative)" },
};

export function Pill({
  label,
  variant = "default",
  onRemove,
}: {
  label: string;
  variant?: PillVariant;
  onRemove?: () => void;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={PILL_STYLE[variant]}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          <X size={10} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}

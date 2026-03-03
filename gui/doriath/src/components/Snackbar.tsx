"use client";

import { X } from "lucide-react";
import type { SnackbarState } from "../types";

export function Snackbar({ state, onDismiss }: { state: SnackbarState; onDismiss: () => void }) {
  const accent =
    state.variant === "success"     ? "border-l-4 border-accent" :
    state.variant === "warning"     ? "border-l-4 border-lift-warning" :
    state.variant === "destructive" ? "border-l-4 border-lift-negative" : "";

  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "transition-all duration-200",
        state.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className={`flex items-center gap-4 bg-moria-300 text-moria-900 pl-4 pr-3 py-3 rounded-xl text-sm font-medium whitespace-nowrap ${accent}`}>
        <span>{state.message}</span>
        <button
          onClick={onDismiss}
          className="text-moria-600 hover:text-moria-900 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

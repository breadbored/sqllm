"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SidebarIcon } from "../types";

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: SidebarIcon;
}) {
  const pos = delta !== undefined && delta > 0;
  const neg = delta !== undefined && delta < 0;
  return (
    <div className="rounded-xl border border-moria-700 bg-moria-800 px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-moria-500 uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={15} strokeWidth={1.75} className="text-moria-600" />}
      </div>
      <div className="text-3xl font-semibold text-moria-300 tabular-nums leading-none">{value}</div>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${pos ? "text-accent" : neg ? "text-lift-negative" : "text-moria-500"}`}>
          {pos ? <TrendingUp size={12} strokeWidth={2} />
               : neg ? <TrendingDown size={12} strokeWidth={2} />
               : <Minus size={12} strokeWidth={2} />}
          <span>{pos ? "+" : ""}{delta}%</span>
          {deltaLabel && <span className="text-moria-600 font-normal ml-1">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

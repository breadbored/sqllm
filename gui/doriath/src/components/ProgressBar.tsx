"use client";

export function ProgressBar({
  value,
  max = 100,
  label,
  indeterminate = false,
}: {
  value?: number;
  max?: number;
  label?: string;
  indeterminate?: boolean;
}) {
  const pct = value !== undefined ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex justify-between text-xs text-moria-500">
          <span>{label}</span>
          {!indeterminate && value !== undefined && (
            <span className="font-mono">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div className="relative h-2 rounded-full bg-moria-700 overflow-hidden">
        {indeterminate
          ? <div className="progress-indeterminate" />
          : <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
        }
      </div>
    </div>
  );
}

"use client";

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
}: {
  value: number;
  onChange?: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 flex items-center">
        <input
          type="range"
          value={value}
          onChange={e => onChange?.(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="moria-range w-full"
          style={{
            background: disabled
              ? `linear-gradient(to right, var(--color-moria-600) ${pct}%, var(--color-moria-700) ${pct}%)`
              : `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-moria-700) ${pct}%)`,
          }}
        />
      </div>
      {showValue && (
        <span className="text-sm font-mono text-moria-500 w-8 text-right shrink-0">{value}</span>
      )}
    </div>
  );
}

export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  value: [number, number];
  onChange?: (v: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [lo, hi] = value;
  const pctLo = ((lo - min) / (max - min)) * 100;
  const pctHi = ((hi - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 flex items-center h-5">
        <div className="absolute inset-x-0 h-2 rounded-full" style={{ background: "var(--color-moria-700)" }} />
        <div
          className="absolute h-2 rounded-full"
          style={{
            left: `${pctLo}%`,
            right: `${100 - pctHi}%`,
            background: "var(--color-accent)",
          }}
        />
        <input
          type="range"
          value={lo}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange?.([Math.min(Number(e.target.value), hi - step), hi])}
          className="moria-range absolute inset-x-0 w-full"
          style={{ background: "transparent" }}
        />
        <input
          type="range"
          value={hi}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange?.([lo, Math.max(Number(e.target.value), lo + step)])}
          className="moria-range absolute inset-x-0 w-full"
          style={{ background: "transparent" }}
        />
      </div>
      <span className="text-sm font-mono text-moria-500 shrink-0 w-16 text-right">{lo}–{hi}</span>
    </div>
  );
}

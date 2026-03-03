"use client";

export function Textarea({
  value,
  onChange,
  placeholder = "",
  rows = 4,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={[
        "w-full rounded-xl border bg-moria-800 px-4 py-3 text-base outline-none transition-colors",
        "text-moria-400 placeholder:text-moria-600",
        disabled
          ? "border-moria-700 text-moria-600 cursor-not-allowed resize-none"
          : "border-moria-500 focus:border-moria-300 focus:text-moria-300 resize-y",
      ].join(" ")}
    />
  );
}

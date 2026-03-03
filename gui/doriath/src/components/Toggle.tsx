"use client";

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="group flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none"
    >
      <span
        className={[
          "relative inline-flex w-10 h-6 rounded-full transition-colors duration-200 shrink-0",
          checked ? "" : "bg-moria-700",
          disabled ? "opacity-40" : "",
        ].join(" ")}
        style={checked ? { background: "var(--color-accent)" } : {}}
      >
        <span
          className={[
            "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0",
          ].join(" ")}
        />
      </span>
      {label && (
        <span className={`text-base transition-colors ${disabled ? "text-moria-600" : "text-moria-400 group-hover:text-moria-300"}`}>
          {label}
        </span>
      )}
    </button>
  );
}

"use client";

export function TextInput({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "email";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={[
        "w-full rounded-xl border bg-moria-800 px-4 py-3 text-base outline-none transition-colors",
        "text-moria-400 placeholder:text-moria-600",
        disabled
          ? "border-moria-700 text-moria-600 cursor-not-allowed"
          : "border-moria-500 focus:border-moria-300 focus:text-moria-300",
      ].join(" ")}
    />
  );
}

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  placeholder = "Password",
  disabled = false,
}: {
  placeholder?: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";

  return (
    <div className={`flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`}>
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        disabled={disabled}
        className={`flex items-center justify-center px-3 border-l ${borderColor} text-moria-500 hover:text-moria-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
      </button>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { PhoneCountry } from "../types";

const PHONE_COUNTRIES: Record<string, PhoneCountry> = {
  US: {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    maxDigits: 10,
    format(digits) {
      if (digits.length === 0) return "";
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    },
  },
};

export function PhoneInput({
  defaultCountry = "US",
  disabled = false,
}: {
  defaultCountry?: string;
  disabled?: boolean;
}) {
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [digits, setDigits] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  const country = PHONE_COUNTRIES[countryCode] ?? PHONE_COUNTRIES.US;
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDigits(e.target.value.replace(/\D/g, "").slice(0, country.maxDigits));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      setDigits(d => d.slice(0, -1));
      e.preventDefault();
    }
  }

  function selectCountry(code: string) {
    setCountryCode(code);
    setDigits("");
    setOpen(false);
  }

  const triggerClasses = `flex items-center gap-1.5 pl-3 pr-2 border-r ${borderColor} shrink-0 transition-colors`;

  return (
    <div ref={containerRef} className="relative">
      <div ref={inputWrapperRef} className={`flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setOpen(o => !o)}
          disabled={disabled}
          className={`${triggerClasses} text-moria-400 hover:text-moria-300 disabled:text-moria-600 disabled:cursor-not-allowed`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-sm font-mono">{country.dialCode}</span>
          {open
            ? <ChevronUp size={12} strokeWidth={2.5} className="text-moria-500" />
            : <ChevronDown size={12} strokeWidth={2.5} className="text-moria-500" />
          }
        </button>

        <input
          type="tel"
          inputMode="numeric"
          value={country.format(digits)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={country.format("2015550123")}
          disabled={disabled}
          className="flex-1 px-4 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed"
        />
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute top-0 left-0 z-50 bg-moria-800 border border-moria-500 rounded-tl-xl rounded-br-xl rounded-bl-xl overflow-hidden"
          style={{ width: triggerRef.current?.offsetWidth ?? "auto" }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={`w-full ${triggerClasses} px-3 text-moria-400 hover:text-moria-300 border-r-0 border-b border-moria-700`}
            style={{ height: inputWrapperRef.current?.offsetHeight }}
          >
            <span className="text-base leading-none">{country.flag}</span>
            <span className="text-sm font-mono">{country.dialCode}</span>
            <ChevronUp size={12} strokeWidth={2.5} className="text-moria-500" />
          </button>

          {Object.values(PHONE_COUNTRIES).map(c => (
            <button
              key={c.code}
              role="option"
              aria-selected={c.code === countryCode}
              type="button"
              onClick={() => selectCountry(c.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors
                ${c.code === countryCode
                  ? "bg-moria-700 text-moria-300"
                  : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"
                }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="font-mono text-moria-500">{c.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

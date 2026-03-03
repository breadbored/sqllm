"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag…",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInputVal("");
  };

  const removeTag = (tag: string) => onChange(value.filter(t => t !== tag));

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center rounded-xl border border-moria-500 bg-moria-800
                 px-3 py-2.5 cursor-text focus-within:border-moria-300 transition-colors min-h-[48px]"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0"
          style={{ background: "var(--color-moria-700)", color: "var(--color-moria-400)" }}
        >
          {tag}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); removeTag(tag); }}
            className="opacity-60 hover:opacity-100 transition-opacity flex items-center"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(inputVal); }
          if (e.key === "Backspace" && !inputVal && value.length > 0) removeTag(value[value.length - 1]);
        }}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] text-sm bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 py-0.5"
      />
    </div>
  );
}

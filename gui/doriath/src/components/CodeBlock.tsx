"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CodeBlock({
  code,
  language = "sql",
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-moria-700 bg-moria-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-moria-700 bg-moria-900">
        <span className="text-xs font-mono text-moria-600">{title ?? language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-moria-500 hover:text-moria-300 transition-colors"
        >
          {copied
            ? <Check size={13} strokeWidth={2.5} style={{ color: "var(--color-accent)" }} />
            : <Copy size={13} strokeWidth={1.75} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="px-5 py-4 text-sm font-mono text-moria-400 overflow-x-auto scrollbar-hide leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

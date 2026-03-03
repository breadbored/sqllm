"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { AccordionItemDef } from "../types";

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-moria-700 last:border-b-0">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium
                   text-moria-400 hover:text-moria-300 hover:bg-moria-700/30 transition-colors select-none text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span>{title}</span>
        <ChevronRight
          size={15}
          strokeWidth={2}
          className={`text-moria-500 transition-transform duration-200 shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </button>
      <div className={`grid transition-all duration-200 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 text-sm text-moria-500 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({ items, className }: { items: AccordionItemDef[]; className?: string }) {
  return (
    <div className={`rounded-xl border border-moria-700 bg-moria-800 overflow-hidden ${className ?? ""}`}>
      {items.map(item => (
        <AccordionItem key={item.id} title={item.title} defaultOpen={item.defaultOpen}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}

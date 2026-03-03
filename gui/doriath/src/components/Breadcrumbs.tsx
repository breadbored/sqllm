"use client";

import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "../types";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const Icon = item.icon;
        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight size={13} strokeWidth={2} className="text-moria-600 shrink-0" />
            )}
            {isLast ? (
              <span className="text-moria-300 font-medium flex items-center gap-1.5">
                {Icon && <Icon size={13} strokeWidth={1.75} className="shrink-0" />}
                {item.label}
              </span>
            ) : (
              <button className="text-moria-500 hover:text-moria-300 transition-colors flex items-center gap-1.5">
                {Icon && <Icon size={13} strokeWidth={1.75} className="shrink-0" />}
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

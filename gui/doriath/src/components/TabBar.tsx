"use client";

import type { TabItem } from "../types";

export function TabBar({
  tabs,
  activeId,
  onChange,
}: {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex border-b border-moria-700">
      {tabs.map(tab => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "text-moria-300" : "text-moria-500 hover:text-moria-400",
            ].join(" ")}
          >
            {tab.icon && <tab.icon size={15} strokeWidth={1.75} />}
            {tab.label}
            {active && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

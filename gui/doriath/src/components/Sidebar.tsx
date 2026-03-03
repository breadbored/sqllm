"use client";

import { useState } from "react";
import { ChevronRight, PanelLeft } from "lucide-react";
import type { SidebarNavItem, SidebarNavSection } from "../types";

function SidebarItem({
  item,
  depth,
  activeId,
  onSelect,
}: {
  item: SidebarNavItem;
  depth: number;
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = Boolean(item.children?.length);
  const isActive = item.id === activeId;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (hasChildren) setOpen(o => !o);
          onSelect?.(item.id);
        }}
        className={[
          "w-full flex items-center gap-2.5 px-3 rounded-lg transition-colors cursor-pointer text-left",
          depth === 0 ? "py-2 text-sm" : "py-1.5 text-sm",
          isActive
            ? "bg-moria-700 text-moria-300"
            : "text-moria-400 hover:bg-moria-700 hover:text-moria-300",
        ].join(" ")}
      >
        {item.icon && (
          <item.icon size={16} strokeWidth={1.75} className="shrink-0" />
        )}
        <span className="flex-1 truncate">{item.label}</span>
        {hasChildren && (
          <ChevronRight
            size={13}
            strokeWidth={2}
            className={`shrink-0 text-moria-600 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
          />
        )}
      </button>

      {hasChildren && open && (
        <div className="ml-3.5 mt-0.5 pl-3 border-l border-moria-700 space-y-0.5">
          {item.children!.map(child => (
            <SidebarItem
              key={child.id}
              item={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarSection({
  section,
  activeId,
  onSelect,
}: {
  section: SidebarNavSection;
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  const [open, setOpen] = useState(section.defaultOpen ?? true);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-moria-500 uppercase tracking-widest hover:text-moria-300 transition-colors cursor-pointer select-none"
      >
        <span>{section.label}</span>
        <ChevronRight
          size={12}
          strokeWidth={2.5}
          className={`text-moria-600 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-0.5">
          {section.items.map(item => (
            <SidebarItem
              key={item.id}
              item={item}
              depth={0}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  sections,
  activeId,
  onSelect,
}: {
  sections: SidebarNavSection[];
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    const iconItems = sections.flatMap(s => s.items.filter(i => i.icon));
    return (
      <nav className="w-14 shrink-0 bg-moria-800 border-r border-moria-700 flex flex-col items-center">
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center py-3 gap-1 w-full">
          {iconItems.map(item => {
            const Icon = item.icon!;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect?.(item.id)}
                title={item.label}
                className={[
                  "flex items-center justify-center h-9 w-9 rounded-lg transition-colors",
                  item.id === activeId
                    ? "bg-moria-700 text-moria-300"
                    : "text-moria-400 hover:bg-moria-700 hover:text-moria-300",
                ].join(" ")}
              >
                <Icon size={16} strokeWidth={1.75} />
              </button>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-moria-700 py-2 flex justify-center w-full">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="flex items-center justify-center h-9 w-9 rounded-lg text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors"
          >
            <PanelLeft size={16} strokeWidth={1.75} />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-56 shrink-0 bg-moria-800 border-r border-moria-700 flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-5 px-2 py-3">
        {sections.map(section => (
          <SidebarSection
            key={section.id}
            section={section}
            activeId={activeId}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="shrink-0 border-t border-moria-700 px-2 py-2 flex justify-end">
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
          className="flex items-center justify-center h-7 w-7 rounded-lg text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors"
        >
          <PanelLeft size={15} strokeWidth={1.75} />
        </button>
      </div>
    </nav>
  );
}

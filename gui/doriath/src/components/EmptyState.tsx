"use client";

import React from "react";
import type { SidebarIcon } from "../types";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: SidebarIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {Icon && (
        <div className="mb-4 flex items-center justify-center h-14 w-14 rounded-2xl bg-moria-800 border border-moria-700">
          <Icon size={24} strokeWidth={1.5} className="text-moria-500" />
        </div>
      )}
      <div className="text-base font-semibold text-moria-300">{title}</div>
      {description && (
        <div className="mt-1.5 text-sm text-moria-500 max-w-xs">{description}</div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

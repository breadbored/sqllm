"use client";

import React from "react";

export function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-moria-700 bg-moria-800 overflow-hidden">
      <div className={`px-5 py-4${children ? " border-b border-moria-700" : ""}`}>
        <div className="text-sm font-semibold text-moria-300">{title}</div>
        {subtitle && <div className="text-xs text-moria-500 mt-1">{subtitle}</div>}
      </div>
      {children && (
        <div className="px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

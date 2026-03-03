"use client";

import React, { useState } from "react";

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <span
        className={[
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 pointer-events-none",
          "bg-moria-300 text-moria-900 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap",
          "transition-all duration-150",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
        ].join(" ")}
      >
        {content}
        <span
          className="absolute top-full left-1/2 -translate-x-1/2"
          style={{
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid var(--color-moria-300)",
          }}
        />
      </span>
    </span>
  );
}

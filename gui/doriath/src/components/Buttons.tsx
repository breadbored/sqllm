"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "warning" | "destructive";

export function Button({
  variant = "primary",
  children,
  onClick,
  disabled = false,
  type = "button",
}: {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  if (disabled) {
    return (
      <button
        type={type}
        disabled
        className="group rounded-lg p-0 cursor-not-allowed border-none"
        style={{ background: "var(--color-moria-700)" }}
      >
        <span
          className="block px-5 py-2 rounded-lg text-sm font-medium translate-y-[-4px]"
          style={{ background: "var(--color-moria-800)", color: "var(--color-moria-600)" }}
        >
          {children}
        </span>
      </button>
    );
  }

  const styles: Record<ButtonVariant, { shadow: string; face: string; text: string }> = {
    primary: {
      shadow: "var(--color-accent-hover)",
      face: "var(--color-accent)",
      text: "text-white",
    },
    secondary: {
      shadow: "var(--color-moria-600)",
      face: "var(--color-moria-800)",
      text: "text-moria-300",
    },
    warning: {
      shadow: "var(--color-lift-warning-shadow)",
      face: "var(--color-lift-warning)",
      text: "text-white",
    },
    destructive: {
      shadow: "var(--color-lift-negative-shadow)",
      face: "var(--color-lift-negative)",
      text: "text-white",
    },
  };

  const { shadow, face, text } = styles[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      className="group rounded-lg p-0 cursor-pointer border-none outline-offset-4"
      style={{ background: shadow }}
    >
      <span
        className={`block px-5 py-2 rounded-lg text-sm font-medium ${text} transition-transform translate-y-[-4px] group-active:translate-y-[-1px]`}
        style={{ background: face }}
      >
        {children}
      </span>
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-5 py-2 text-sm font-medium rounded-lg transition-colors"
      style={{ color: "var(--color-moria-500)" }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-moria-300)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--color-moria-500)")}
    >
      {children}
    </button>
  );
}

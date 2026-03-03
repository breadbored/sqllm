"use client";

import { X, Info, CheckCircle, AlertTriangle, AlertCircle, type LucideIcon } from "lucide-react";
import type { AlertVariant } from "../types";

const ALERT_CONFIG: Record<AlertVariant, {
  bar: string;
  iconColor: string;
  Icon: LucideIcon;
}> = {
  info:        { bar: "bg-moria-500",      iconColor: "text-moria-500",     Icon: Info },
  success:     { bar: "bg-accent",         iconColor: "text-accent",        Icon: CheckCircle },
  warning:     { bar: "bg-lift-warning",   iconColor: "text-lift-warning",  Icon: AlertTriangle },
  destructive: { bar: "bg-lift-negative",  iconColor: "text-lift-negative", Icon: AlertCircle },
};

export function Alert({
  variant = "info",
  title,
  description,
  onDismiss,
}: {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  onDismiss?: () => void;
}) {
  const { bar, iconColor, Icon } = ALERT_CONFIG[variant];
  return (
    <div className="flex rounded-xl border border-moria-700 bg-moria-800 overflow-hidden">
      <div className={`w-1 shrink-0 ${bar}`} />
      <div className="flex-1 flex gap-3 px-4 py-3.5">
        <Icon size={17} strokeWidth={1.75} className={`shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          {title && <div className="text-sm font-semibold text-moria-300">{title}</div>}
          {description && (
            <div className={`text-sm text-moria-500 ${title ? "mt-0.5" : ""}`}>{description}</div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 text-moria-500 hover:text-moria-300 transition-colors mt-0.5"
          >
            <X size={15} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X, ChevronRight, Check, Minus, Copy, ChevronDown, Search, ArrowUp, ArrowDown, ArrowUpDown, Calendar, ChevronUp, ChevronLeft, EyeOff, Eye, PanelLeft, TrendingUp, TrendingDown, Globe } from 'lucide-react';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/components/Accordion.tsx
function AccordionItem({
  title,
  children,
  defaultOpen = false
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /* @__PURE__ */ jsxs("div", { className: "border-b border-moria-700 last:border-b-0", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "w-full flex items-center justify-between px-5 py-4 text-sm font-medium\n                   text-moria-400 hover:text-moria-300 hover:bg-moria-700/30 transition-colors select-none text-left",
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsx("span", { children: title }),
          /* @__PURE__ */ jsx(
            ChevronRight,
            {
              size: 15,
              strokeWidth: 2,
              className: `text-moria-500 transition-transform duration-200 shrink-0 ${open ? "rotate-90" : ""}`
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: `grid transition-all duration-200 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`, children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "px-5 pb-5 text-sm text-moria-500 leading-relaxed", children }) }) })
  ] });
}
function Accordion({ items, className }) {
  return /* @__PURE__ */ jsx("div", { className: `rounded-xl border border-moria-700 bg-moria-800 overflow-hidden ${className ?? ""}`, children: items.map((item) => /* @__PURE__ */ jsx(AccordionItem, { title: item.title, defaultOpen: item.defaultOpen, children: item.content }, item.id)) });
}
var ALERT_CONFIG = {
  info: { bar: "bg-moria-500", iconColor: "text-moria-500", Icon: Info },
  success: { bar: "bg-accent", iconColor: "text-accent", Icon: CheckCircle },
  warning: { bar: "bg-lift-warning", iconColor: "text-lift-warning", Icon: AlertTriangle },
  destructive: { bar: "bg-lift-negative", iconColor: "text-lift-negative", Icon: AlertCircle }
};
function Alert({
  variant = "info",
  title,
  description,
  onDismiss
}) {
  const { bar, iconColor, Icon } = ALERT_CONFIG[variant];
  return /* @__PURE__ */ jsxs("div", { className: "flex rounded-xl border border-moria-700 bg-moria-800 overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: `w-1 shrink-0 ${bar}` }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex gap-3 px-4 py-3.5", children: [
      /* @__PURE__ */ jsx(Icon, { size: 17, strokeWidth: 1.75, className: `shrink-0 mt-0.5 ${iconColor}` }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        title && /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-moria-300", children: title }),
        description && /* @__PURE__ */ jsx("div", { className: `text-sm text-moria-500 ${title ? "mt-0.5" : ""}`, children: description })
      ] }),
      onDismiss && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onDismiss,
          className: "shrink-0 text-moria-500 hover:text-moria-300 transition-colors mt-0.5",
          children: /* @__PURE__ */ jsx(X, { size: 15, strokeWidth: 2 })
        }
      )
    ] })
  ] });
}
function Breadcrumbs({ items }) {
  return /* @__PURE__ */ jsx("nav", { "aria-label": "breadcrumb", className: "flex items-center gap-1 text-sm flex-wrap", children: items.map((item, i) => {
    const isLast = i === items.length - 1;
    const Icon = item.icon;
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      i > 0 && /* @__PURE__ */ jsx(ChevronRight, { size: 13, strokeWidth: 2, className: "text-moria-600 shrink-0" }),
      isLast ? /* @__PURE__ */ jsxs("span", { className: "text-moria-300 font-medium flex items-center gap-1.5", children: [
        Icon && /* @__PURE__ */ jsx(Icon, { size: 13, strokeWidth: 1.75, className: "shrink-0" }),
        item.label
      ] }) : /* @__PURE__ */ jsxs("button", { className: "text-moria-500 hover:text-moria-300 transition-colors flex items-center gap-1.5", children: [
        Icon && /* @__PURE__ */ jsx(Icon, { size: 13, strokeWidth: 1.75, className: "shrink-0" }),
        item.label
      ] })
    ] }, i);
  }) });
}
function Button({
  variant = "primary",
  children,
  onClick,
  disabled = false,
  type = "button"
}) {
  if (disabled) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type,
        disabled: true,
        className: "group rounded-lg p-0 cursor-not-allowed border-none",
        style: { background: "var(--color-moria-700)" },
        children: /* @__PURE__ */ jsx(
          "span",
          {
            className: "block px-5 py-2 rounded-lg text-sm font-medium translate-y-[-4px]",
            style: { background: "var(--color-moria-800)", color: "var(--color-moria-600)" },
            children
          }
        )
      }
    );
  }
  const styles = {
    primary: {
      shadow: "var(--color-accent-hover)",
      face: "var(--color-accent)",
      text: "text-white"
    },
    secondary: {
      shadow: "var(--color-moria-600)",
      face: "var(--color-moria-800)",
      text: "text-moria-300"
    },
    warning: {
      shadow: "var(--color-lift-warning-shadow)",
      face: "var(--color-lift-warning)",
      text: "text-white"
    },
    destructive: {
      shadow: "var(--color-lift-negative-shadow)",
      face: "var(--color-lift-negative)",
      text: "text-white"
    }
  };
  const { shadow, face, text } = styles[variant];
  return /* @__PURE__ */ jsx(
    "button",
    {
      type,
      onClick,
      className: "group rounded-lg p-0 cursor-pointer border-none outline-offset-4",
      style: { background: shadow },
      children: /* @__PURE__ */ jsx(
        "span",
        {
          className: `block px-5 py-2 rounded-lg text-sm font-medium ${text} transition-transform translate-y-[-4px] group-active:translate-y-[-1px]`,
          style: { background: face },
          children
        }
      )
    }
  );
}
function GhostButton({
  children,
  onClick,
  type = "button"
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type,
      onClick,
      className: "px-5 py-2 text-sm font-medium rounded-lg transition-colors",
      style: { color: "var(--color-moria-500)" },
      onMouseEnter: (e) => e.currentTarget.style.color = "var(--color-moria-300)",
      onMouseLeave: (e) => e.currentTarget.style.color = "var(--color-moria-500)",
      children
    }
  );
}
function Card({
  title,
  subtitle,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-moria-700 bg-moria-800 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: `px-5 py-4${children ? " border-b border-moria-700" : ""}`, children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-moria-300", children: title }),
      subtitle && /* @__PURE__ */ jsx("div", { className: "text-xs text-moria-500 mt-1", children: subtitle })
    ] }),
    children && /* @__PURE__ */ jsx("div", { className: "px-5 py-4", children })
  ] });
}
function Checkbox({
  state,
  onChange,
  label,
  disabled = false
}) {
  function cycle() {
    if (disabled) return;
    onChange(state === "off" ? "on" : state === "on" ? "off" : "off");
  }
  const isChecked = state === "on";
  const isIndeterminate = state === "some";
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      role: "checkbox",
      "aria-checked": isIndeterminate ? "mixed" : isChecked,
      onClick: cycle,
      disabled,
      className: [
        "group flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed",
        "focus-visible:outline-none"
      ].join(" "),
      children: [
        /* @__PURE__ */ jsxs(
          "span",
          {
            className: [
              "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors",
              isChecked ? "border-accent bg-accent" : isIndeterminate ? "border-moria-500 bg-moria-800" : "border-moria-500 bg-moria-800",
              disabled ? "opacity-40" : "group-hover:border-moria-300"
            ].join(" "),
            children: [
              isChecked && /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3, className: "text-white" }),
              isIndeterminate && /* @__PURE__ */ jsx(Minus, { size: 12, strokeWidth: 3, className: "text-moria-400" })
            ]
          }
        ),
        label && /* @__PURE__ */ jsx("span", { className: `text-base transition-colors ${disabled ? "text-moria-600" : "text-moria-400 group-hover:text-moria-300"}`, children: label })
      ]
    }
  );
}
function CodeBlock({
  code,
  language = "sql",
  title
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
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-moria-700 bg-moria-800 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-moria-700 bg-moria-900", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-moria-600", children: title ?? language }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: copy,
          className: "flex items-center gap-1.5 text-xs text-moria-500 hover:text-moria-300 transition-colors",
          children: [
            copied ? /* @__PURE__ */ jsx(Check, { size: 13, strokeWidth: 2.5, style: { color: "var(--color-accent)" } }) : /* @__PURE__ */ jsx(Copy, { size: 13, strokeWidth: 1.75 }),
            /* @__PURE__ */ jsx("span", { children: copied ? "Copied!" : "Copy" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("pre", { className: "px-5 py-4 text-sm font-mono text-moria-400 overflow-x-auto scrollbar-hide leading-relaxed", children: /* @__PURE__ */ jsx("code", { children: code }) })
  ] });
}
function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select\u2026",
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options;
  const selected = options.find((o) => o.value === value) ?? null;
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => {
          if (!disabled) setOpen((o) => !o);
        },
        className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-moria-800 text-sm transition-colors
                     ${disabled ? "border-moria-700 cursor-not-allowed" : open ? "border-moria-300" : "border-moria-500"}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: `flex-1 text-left truncate ${selected ? "text-moria-400" : "text-moria-600"}`, children: selected?.label ?? placeholder }),
          selected && !disabled && /* @__PURE__ */ jsx(
            "span",
            {
              role: "button",
              onClick: (e) => {
                e.stopPropagation();
                onChange(null);
              },
              className: "text-moria-500 hover:text-moria-300 transition-colors",
              children: /* @__PURE__ */ jsx(X, { size: 14, strokeWidth: 2.5 })
            }
          ),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              size: 16,
              strokeWidth: 2,
              className: `shrink-0 text-moria-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute top-full left-0 right-0 mt-1 z-50 bg-moria-800 border border-moria-500 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 border-b border-moria-700", children: [
        /* @__PURE__ */ jsx(Search, { size: 14, strokeWidth: 2, className: "text-moria-500 shrink-0" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            autoFocus: true,
            type: "text",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Search\u2026",
            className: "flex-1 text-sm bg-transparent outline-none text-moria-300 placeholder:text-moria-600"
          }
        ),
        query && /* @__PURE__ */ jsx("button", { onClick: () => setQuery(""), className: "text-moria-500 hover:text-moria-300 transition-colors", children: /* @__PURE__ */ jsx(X, { size: 12, strokeWidth: 2.5 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-52 overflow-y-auto scrollbar-hide", children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-sm text-moria-600 text-center", children: "No results" }) : filtered.map((option) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: `w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                               ${option.value === value ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"}`,
          onClick: () => {
            onChange(option.value);
            setOpen(false);
            setQuery("");
          },
          children: [
            /* @__PURE__ */ jsx("span", { children: option.label }),
            option.value === value && /* @__PURE__ */ jsx(Check, { size: 14, strokeWidth: 2.5, style: { color: "var(--color-accent)" } })
          ]
        },
        option.value
      )) })
    ] })
  ] });
}
function DataTable({
  columns,
  rows
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }
  const sorted = sortKey === null ? rows : [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });
  return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-moria-700 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto scrollbar-hide", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-moria-700 bg-moria-800", children: columns.map((col) => /* @__PURE__ */ jsx(
      "th",
      {
        onClick: () => col.sortable && handleSort(col.key),
        className: [
          "px-4 py-3 text-xs font-semibold text-moria-500 uppercase tracking-wider whitespace-nowrap",
          col.align === "right" ? "text-right" : "text-left",
          col.sortable ? "cursor-pointer hover:text-moria-300 transition-colors select-none" : ""
        ].join(" "),
        children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 ${col.align === "right" ? "flex-row-reverse" : ""}`, children: [
          col.header,
          col.sortable && (sortKey === col.key ? sortDir === "asc" ? /* @__PURE__ */ jsx(ArrowUp, { size: 12, strokeWidth: 2.5 }) : /* @__PURE__ */ jsx(ArrowDown, { size: 12, strokeWidth: 2.5 }) : /* @__PURE__ */ jsx(ArrowUpDown, { size: 12, strokeWidth: 2, className: "text-moria-600" }))
        ] })
      },
      col.key
    )) }) }),
    /* @__PURE__ */ jsx("tbody", { children: sorted.map((row) => /* @__PURE__ */ jsx(
      "tr",
      {
        className: "border-b border-moria-700 last:border-b-0 hover:bg-moria-800 transition-colors",
        children: columns.map((col) => /* @__PURE__ */ jsx(
          "td",
          {
            className: [
              "px-4 py-3 text-sm text-moria-400",
              col.align === "right" ? "text-right tabular-nums" : "text-left"
            ].join(" "),
            children: col.render ? col.render(row) : String(row[col.key] ?? "")
          },
          col.key
        ))
      },
      row.id
    )) })
  ] }) }) });
}
function DateInput({
  value,
  onChange,
  disabled = false,
  label
}) {
  const inputRef = useRef(null);
  const borderClass = disabled ? "border-moria-700" : "border-moria-500 focus-within:border-moria-300";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    label && /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-moria-500", children: label }),
    /* @__PURE__ */ jsxs("div", { className: `flex rounded-xl border bg-moria-800 overflow-hidden transition-colors ${borderClass}`, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          type: "date",
          value,
          onChange: (e) => onChange?.(e.target.value),
          disabled,
          className: `flex-1 px-4 py-3 text-base bg-transparent outline-none transition-colors
                       ${disabled ? "text-moria-600 cursor-not-allowed" : "text-moria-400 focus:text-moria-300"}`
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          tabIndex: -1,
          disabled,
          onClick: () => inputRef.current?.showPicker?.(),
          className: `flex items-center pr-4 shrink-0 transition-colors
                       ${disabled ? "text-moria-600 cursor-not-allowed" : "text-moria-500 hover:text-moria-300 cursor-pointer"}`,
          children: /* @__PURE__ */ jsx(Calendar, { size: 16, strokeWidth: 1.75 })
        }
      )
    ] })
  ] });
}
function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select\u2026",
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const selected = options.find((o) => o.value === value) ?? null;
  return /* @__PURE__ */ jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => !disabled && setOpen((o) => !o),
        disabled,
        className: [
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left",
          "bg-moria-800 transition-colors disabled:cursor-not-allowed",
          open ? "border-moria-300" : disabled ? "border-moria-700" : "border-moria-500"
        ].join(" "),
        children: [
          /* @__PURE__ */ jsx("span", { className: `flex-1 truncate ${selected ? "text-moria-400" : "text-moria-600"}`, children: selected ? selected.label : placeholder }),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              size: 16,
              strokeWidth: 2,
              className: `shrink-0 text-moria-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 right-0 mt-1 z-50 bg-moria-800 border border-moria-500 rounded-xl overflow-hidden", children: options.map((opt) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => {
          onChange(opt.value);
          setOpen(false);
        },
        className: [
          "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left",
          opt.value === value ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"
        ].join(" "),
        children: [
          /* @__PURE__ */ jsx("span", { children: opt.label }),
          opt.value === value && /* @__PURE__ */ jsx(Check, { size: 14, strokeWidth: 2.5, className: "shrink-0", style: { color: "var(--color-accent)" } })
        ]
      },
      opt.value
    )) })
  ] });
}
function EmptyState({
  icon: Icon,
  title,
  description,
  action
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-14 px-6 text-center", children: [
    Icon && /* @__PURE__ */ jsx("div", { className: "mb-4 flex items-center justify-center h-14 w-14 rounded-2xl bg-moria-800 border border-moria-700", children: /* @__PURE__ */ jsx(Icon, { size: 24, strokeWidth: 1.5, className: "text-moria-500" }) }),
    /* @__PURE__ */ jsx("div", { className: "text-base font-semibold text-moria-300", children: title }),
    description && /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-sm text-moria-500 max-w-xs", children: description }),
    action && /* @__PURE__ */ jsx("div", { className: "mt-5", children: action })
  ] });
}
function Modal({
  open,
  onClose,
  title,
  children,
  footer
}) {
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center",
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-moria-300/20 backdrop-blur-sm" }),
        /* @__PURE__ */ jsxs("div", { className: "relative bg-moria-800 border border-moria-700 rounded-2xl w-full max-w-md mx-4 overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-moria-700", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-moria-300", children: title }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "flex items-center justify-center h-7 w-7 rounded-lg text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors",
                children: /* @__PURE__ */ jsx(X, { size: 15, strokeWidth: 2 })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-6 py-5", children }),
          footer && /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-t border-moria-700 flex justify-end gap-3", children: footer })
        ] })
      ]
    }
  );
}
function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select\u2026",
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options;
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const toggle = (val) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };
  const triggerLabel = value.length === 0 ? placeholder : value.length === 1 ? options.find((o) => o.value === value[0])?.label ?? "1 selected" : `${value.length} selected`;
  return /* @__PURE__ */ jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => {
          if (!disabled) setOpen((o) => !o);
        },
        className: `w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-moria-800 text-sm transition-colors
                     ${disabled ? "border-moria-700 cursor-not-allowed" : open ? "border-moria-300" : "border-moria-500"}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: `flex-1 text-left truncate ${value.length > 0 ? "text-moria-400" : "text-moria-600"}`, children: triggerLabel }),
          value.length > 0 && !disabled && /* @__PURE__ */ jsx(
            "span",
            {
              role: "button",
              onClick: (e) => {
                e.stopPropagation();
                onChange([]);
              },
              className: "text-moria-500 hover:text-moria-300 transition-colors",
              children: /* @__PURE__ */ jsx(X, { size: 14, strokeWidth: 2.5 })
            }
          ),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              size: 16,
              strokeWidth: 2,
              className: `shrink-0 text-moria-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute top-full left-0 right-0 mt-1 z-50 bg-moria-800 border border-moria-500 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 border-b border-moria-700", children: [
        /* @__PURE__ */ jsx(Search, { size: 14, strokeWidth: 2, className: "text-moria-500 shrink-0" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            autoFocus: true,
            type: "text",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Search\u2026",
            className: "flex-1 text-sm bg-transparent outline-none text-moria-300 placeholder:text-moria-600"
          }
        ),
        query && /* @__PURE__ */ jsx("button", { onClick: () => setQuery(""), className: "text-moria-500 hover:text-moria-300 transition-colors", children: /* @__PURE__ */ jsx(X, { size: 12, strokeWidth: 2.5 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-52 overflow-y-auto scrollbar-hide", children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-sm text-moria-600 text-center", children: "No results" }) : filtered.map((option) => {
        const checked = value.includes(option.value);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
                                 ${checked ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"}`,
            onClick: () => toggle(option.value),
            children: [
              /* @__PURE__ */ jsx("span", { className: `shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-colors
                                       ${checked ? "border-accent bg-accent" : "border-moria-500 bg-transparent"}`, children: checked && /* @__PURE__ */ jsx(Check, { size: 10, strokeWidth: 3, className: "text-white" }) }),
              /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: option.label })
            ]
          },
          option.value
        );
      }) }),
      value.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t border-moria-700 px-4 py-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-moria-500", children: [
          value.length,
          " selected"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onChange([]),
            className: "text-xs text-moria-500 hover:text-moria-300 transition-colors",
            children: "Clear all"
          }
        )
      ] })
    ] })
  ] });
}
function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder = "0",
  disabled = false
}) {
  function increment() {
    if (disabled) return;
    const next = (value === "" ? 0 : value) + step;
    onChange(max !== void 0 ? Math.min(next, max) : next);
  }
  function decrement() {
    if (disabled) return;
    const next = (value === "" ? 0 : value) - step;
    onChange(min !== void 0 ? Math.max(next, min) : next);
  }
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";
  return /* @__PURE__ */ jsxs("div", { className: `flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`, children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "number",
        value,
        onChange: (e) => onChange(e.target.value === "" ? "" : Number(e.target.value)),
        min,
        max,
        step,
        placeholder,
        disabled,
        className: "flex-1 px-4 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: `flex flex-col border-l ${borderColor}`, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: increment,
          disabled: disabled || max !== void 0 && value !== "" && value >= max,
          className: "flex-1 flex items-center justify-center px-2 text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
          tabIndex: -1,
          children: /* @__PURE__ */ jsx(ChevronUp, { size: 14, strokeWidth: 2.5 })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: `h-px ${disabled ? "bg-moria-700" : "bg-moria-500"}` }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: decrement,
          disabled: disabled || min !== void 0 && value !== "" && value <= min,
          className: "flex-1 flex items-center justify-center px-2 text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
          tabIndex: -1,
          children: /* @__PURE__ */ jsx(ChevronDown, { size: 14, strokeWidth: 2.5 })
        }
      )
    ] })
  ] });
}
function Pagination({
  page,
  totalPages,
  onChange
}) {
  function getPages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "\u2026", totalPages];
    if (page >= totalPages - 3) return [1, "\u2026", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "\u2026", page - 1, page, page + 1, "\u2026", totalPages];
  }
  const btnBase = "flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors";
  const arrowBase = (off) => `${btnBase} text-moria-500 ${off ? "opacity-30 cursor-not-allowed" : "hover:bg-moria-700 hover:text-moria-300 cursor-pointer"}`;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        disabled: page <= 1,
        onClick: () => page > 1 && onChange(page - 1),
        className: arrowBase(page <= 1),
        children: /* @__PURE__ */ jsx(ChevronLeft, { size: 16, strokeWidth: 2 })
      }
    ),
    getPages().map(
      (p, i) => p === "\u2026" ? /* @__PURE__ */ jsx("span", { className: `${btnBase} text-moria-600 cursor-default`, children: "\u2026" }, `e${i}`) : /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange(p),
          className: `${btnBase} ${p === page ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"}`,
          children: p
        },
        p
      )
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        disabled: page >= totalPages,
        onClick: () => page < totalPages && onChange(page + 1),
        className: arrowBase(page >= totalPages),
        children: /* @__PURE__ */ jsx(ChevronRight, { size: 16, strokeWidth: 2 })
      }
    )
  ] });
}
function PasswordInput({
  placeholder = "Password",
  disabled = false
}) {
  const [visible, setVisible] = useState(false);
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";
  return /* @__PURE__ */ jsxs("div", { className: `flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`, children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: visible ? "text" : "password",
        placeholder,
        disabled,
        className: "flex-1 px-4 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setVisible((v) => !v),
        disabled,
        className: `flex items-center justify-center px-3 border-l ${borderColor} text-moria-500 hover:text-moria-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`,
        tabIndex: -1,
        "aria-label": visible ? "Hide password" : "Show password",
        children: visible ? /* @__PURE__ */ jsx(EyeOff, { size: 16, strokeWidth: 2 }) : /* @__PURE__ */ jsx(Eye, { size: 16, strokeWidth: 2 })
      }
    )
  ] });
}
var PHONE_COUNTRIES = {
  US: {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "\u{1F1FA}\u{1F1F8}",
    maxDigits: 10,
    format(digits) {
      if (digits.length === 0) return "";
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  }
};
function PhoneInput({
  defaultCountry = "US",
  disabled = false
}) {
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [digits, setDigits] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const country = PHONE_COUNTRIES[countryCode] ?? PHONE_COUNTRIES.US;
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);
  function handleChange(e) {
    setDigits(e.target.value.replace(/\D/g, "").slice(0, country.maxDigits));
  }
  function handleKeyDown(e) {
    if (e.key === "Backspace") {
      setDigits((d) => d.slice(0, -1));
      e.preventDefault();
    }
  }
  function selectCountry(code) {
    setCountryCode(code);
    setDigits("");
    setOpen(false);
  }
  const triggerClasses = `flex items-center gap-1.5 pl-3 pr-2 border-r ${borderColor} shrink-0 transition-colors`;
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: "relative", children: [
    /* @__PURE__ */ jsxs("div", { ref: inputWrapperRef, className: `flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          ref: triggerRef,
          type: "button",
          onClick: () => !disabled && setOpen((o) => !o),
          disabled,
          className: `${triggerClasses} text-moria-400 hover:text-moria-300 disabled:text-moria-600 disabled:cursor-not-allowed`,
          "aria-haspopup": "listbox",
          "aria-expanded": open,
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: country.flag }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-mono", children: country.dialCode }),
            open ? /* @__PURE__ */ jsx(ChevronUp, { size: 12, strokeWidth: 2.5, className: "text-moria-500" }) : /* @__PURE__ */ jsx(ChevronDown, { size: 12, strokeWidth: 2.5, className: "text-moria-500" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "tel",
          inputMode: "numeric",
          value: country.format(digits),
          onChange: handleChange,
          onKeyDown: handleKeyDown,
          placeholder: country.format("2015550123"),
          disabled,
          className: "flex-1 px-4 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed"
        }
      )
    ] }),
    open && /* @__PURE__ */ jsxs(
      "div",
      {
        role: "listbox",
        className: "absolute top-0 left-0 z-50 bg-moria-800 border border-moria-500 rounded-tl-xl rounded-br-xl rounded-bl-xl overflow-hidden",
        style: { width: triggerRef.current?.offsetWidth ?? "auto" },
        children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setOpen(false),
              className: `w-full ${triggerClasses} px-3 text-moria-400 hover:text-moria-300 border-r-0 border-b border-moria-700`,
              style: { height: inputWrapperRef.current?.offsetHeight },
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: country.flag }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-mono", children: country.dialCode }),
                /* @__PURE__ */ jsx(ChevronUp, { size: 12, strokeWidth: 2.5, className: "text-moria-500" })
              ]
            }
          ),
          Object.values(PHONE_COUNTRIES).map((c) => /* @__PURE__ */ jsxs(
            "button",
            {
              role: "option",
              "aria-selected": c.code === countryCode,
              type: "button",
              onClick: () => selectCountry(c.code),
              className: `w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors
                ${c.code === countryCode ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: c.flag }),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-moria-500", children: c.dialCode })
              ]
            },
            c.code
          ))
        ]
      }
    )
  ] });
}
var PILL_STYLE = {
  default: { background: "var(--color-moria-700)", color: "var(--color-moria-400)" },
  positive: { background: "rgba(95, 138, 86, 0.15)", color: "var(--color-lift-positive)" },
  warning: { background: "rgba(192, 138, 42, 0.15)", color: "var(--color-lift-warning)" },
  negative: { background: "rgba(168, 87, 46, 0.15)", color: "var(--color-lift-negative)" }
};
function Pill({
  label,
  variant = "default",
  onRemove
}) {
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
      style: PILL_STYLE[variant],
      children: [
        label,
        onRemove && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onRemove,
            className: "-mr-0.5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity",
            "aria-label": `Remove ${label}`,
            children: /* @__PURE__ */ jsx(X, { size: 10, strokeWidth: 2.5 })
          }
        )
      ]
    }
  );
}
function ProgressBar({
  value,
  max = 100,
  label,
  indeterminate = false
}) {
  const pct = value !== void 0 ? Math.min(Math.max(value / max * 100, 0), 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    label && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-moria-500", children: [
      /* @__PURE__ */ jsx("span", { children: label }),
      !indeterminate && value !== void 0 && /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
        Math.round(pct),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative h-2 rounded-full bg-moria-700 overflow-hidden", children: indeterminate ? /* @__PURE__ */ jsx("div", { className: "progress-indeterminate" }) : /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full rounded-full transition-all duration-300",
        style: { width: `${pct}%`, background: "var(--color-accent)" }
      }
    ) })
  ] });
}
function RadioGroup({
  options,
  value,
  onChange,
  disabled = false
}) {
  return /* @__PURE__ */ jsx("div", { role: "radiogroup", className: "flex flex-col gap-3", children: options.map((option) => {
    const selected = option.value === value;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        role: "radio",
        "aria-checked": selected,
        onClick: () => !disabled && onChange(option.value),
        disabled,
        className: "group flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none",
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: [
                "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                selected ? "border-accent bg-accent" : "border-moria-500 bg-moria-800",
                disabled ? "opacity-40" : "group-hover:border-moria-300"
              ].join(" "),
              children: selected && /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-white" })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: `text-base transition-colors ${disabled ? "text-moria-600" : "text-moria-400 group-hover:text-moria-300"}`, children: option.label })
        ]
      },
      option.value
    );
  }) });
}
function SearchInput({
  value,
  onChange,
  placeholder = "Search\u2026",
  disabled = false
}) {
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";
  return /* @__PURE__ */ jsxs("div", { className: `flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`, children: [
    /* @__PURE__ */ jsx("span", { className: "flex items-center pl-4 pr-2 text-moria-500 shrink-0", children: /* @__PURE__ */ jsx(Search, { size: 16, strokeWidth: 2 }) }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        disabled,
        className: "flex-1 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed"
      }
    ),
    value && !disabled && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(""),
        tabIndex: -1,
        "aria-label": "Clear",
        className: "flex items-center pr-3 text-moria-500 hover:text-moria-300 transition-colors",
        children: /* @__PURE__ */ jsx(X, { size: 14, strokeWidth: 2.5 })
      }
    )
  ] });
}
function SidebarItem({
  item,
  depth,
  activeId,
  onSelect
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = Boolean(item.children?.length);
  const isActive = item.id === activeId;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => {
          if (hasChildren) setOpen((o) => !o);
          onSelect?.(item.id);
        },
        className: [
          "w-full flex items-center gap-2.5 px-3 rounded-lg transition-colors cursor-pointer text-left",
          depth === 0 ? "py-2 text-sm" : "py-1.5 text-sm",
          isActive ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"
        ].join(" "),
        children: [
          item.icon && /* @__PURE__ */ jsx(item.icon, { size: 16, strokeWidth: 1.75, className: "shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: item.label }),
          hasChildren && /* @__PURE__ */ jsx(
            ChevronRight,
            {
              size: 13,
              strokeWidth: 2,
              className: `shrink-0 text-moria-600 transition-transform duration-150 ${open ? "rotate-90" : ""}`
            }
          )
        ]
      }
    ),
    hasChildren && open && /* @__PURE__ */ jsx("div", { className: "ml-3.5 mt-0.5 pl-3 border-l border-moria-700 space-y-0.5", children: item.children.map((child) => /* @__PURE__ */ jsx(
      SidebarItem,
      {
        item: child,
        depth: depth + 1,
        activeId,
        onSelect
      },
      child.id
    )) })
  ] });
}
function SidebarSection({
  section,
  activeId,
  onSelect
}) {
  const [open, setOpen] = useState(section.defaultOpen ?? true);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((o) => !o),
        className: "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-moria-500 uppercase tracking-widest hover:text-moria-300 transition-colors cursor-pointer select-none",
        children: [
          /* @__PURE__ */ jsx("span", { children: section.label }),
          /* @__PURE__ */ jsx(
            ChevronRight,
            {
              size: 12,
              strokeWidth: 2.5,
              className: `text-moria-600 transition-transform duration-150 ${open ? "rotate-90" : ""}`
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "space-y-0.5", children: section.items.map((item) => /* @__PURE__ */ jsx(
      SidebarItem,
      {
        item,
        depth: 0,
        activeId,
        onSelect
      },
      item.id
    )) })
  ] });
}
function Sidebar({
  sections,
  activeId,
  onSelect
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (collapsed) {
    const iconItems = sections.flatMap((s) => s.items.filter((i) => i.icon));
    return /* @__PURE__ */ jsxs("nav", { className: "w-14 shrink-0 bg-moria-800 border-r border-moria-700 flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center py-3 gap-1 w-full", children: iconItems.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => onSelect?.(item.id),
            title: item.label,
            className: [
              "flex items-center justify-center h-9 w-9 rounded-lg transition-colors",
              item.id === activeId ? "bg-moria-700 text-moria-300" : "text-moria-400 hover:bg-moria-700 hover:text-moria-300"
            ].join(" "),
            children: /* @__PURE__ */ jsx(Icon, { size: 16, strokeWidth: 1.75 })
          },
          item.id
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "shrink-0 border-t border-moria-700 py-2 flex justify-center w-full", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setCollapsed(false),
          title: "Expand sidebar",
          className: "flex items-center justify-center h-9 w-9 rounded-lg text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors",
          children: /* @__PURE__ */ jsx(PanelLeft, { size: 16, strokeWidth: 1.75 })
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxs("nav", { className: "w-56 shrink-0 bg-moria-800 border-r border-moria-700 flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-5 px-2 py-3", children: sections.map((section) => /* @__PURE__ */ jsx(
      SidebarSection,
      {
        section,
        activeId,
        onSelect
      },
      section.id
    )) }),
    /* @__PURE__ */ jsx("div", { className: "shrink-0 border-t border-moria-700 px-2 py-2 flex justify-end", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setCollapsed(true),
        title: "Collapse sidebar",
        className: "flex items-center justify-center h-7 w-7 rounded-lg text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors",
        children: /* @__PURE__ */ jsx(PanelLeft, { size: 15, strokeWidth: 1.75 })
      }
    ) })
  ] });
}
function Skeleton({ className }) {
  return /* @__PURE__ */ jsx("div", { className: `skeleton-shimmer rounded-md ${className ?? ""}` });
}
function SkeletonText({ lines = 3 }) {
  return /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: Array.from({ length: lines }, (_, i) => /* @__PURE__ */ jsx(Skeleton, { className: `h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}` }, i)) });
}
function SkeletonCard() {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-moria-700 bg-moria-800 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-b border-moria-700 space-y-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-1/3" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-1/2" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 space-y-3", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-5/6" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-4/6" })
    ] })
  ] });
}
function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true
}) {
  const pct = (value - min) / (max - min) * 100;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsx("div", { className: "relative flex-1 flex items-center", children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "range",
        value,
        onChange: (e) => onChange?.(Number(e.target.value)),
        min,
        max,
        step,
        disabled,
        className: "moria-range w-full",
        style: {
          background: disabled ? `linear-gradient(to right, var(--color-moria-600) ${pct}%, var(--color-moria-700) ${pct}%)` : `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-moria-700) ${pct}%)`
        }
      }
    ) }),
    showValue && /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-moria-500 w-8 text-right shrink-0", children: value })
  ] });
}
function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1
}) {
  const [lo, hi] = value;
  const pctLo = (lo - min) / (max - min) * 100;
  const pctHi = (hi - min) / (max - min) * 100;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative flex-1 flex items-center h-5", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 h-2 rounded-full", style: { background: "var(--color-moria-700)" } }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute h-2 rounded-full",
          style: {
            left: `${pctLo}%`,
            right: `${100 - pctHi}%`,
            background: "var(--color-accent)"
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          value: lo,
          min,
          max,
          step,
          onChange: (e) => onChange?.([Math.min(Number(e.target.value), hi - step), hi]),
          className: "moria-range absolute inset-x-0 w-full",
          style: { background: "transparent" }
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          value: hi,
          min,
          max,
          step,
          onChange: (e) => onChange?.([lo, Math.max(Number(e.target.value), lo + step)]),
          className: "moria-range absolute inset-x-0 w-full",
          style: { background: "transparent" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "text-sm font-mono text-moria-500 shrink-0 w-16 text-right", children: [
      lo,
      "\u2013",
      hi
    ] })
  ] });
}
function Snackbar({ state, onDismiss }) {
  const accent = state.variant === "success" ? "border-l-4 border-accent" : state.variant === "warning" ? "border-l-4 border-lift-warning" : state.variant === "destructive" ? "border-l-4 border-lift-negative" : "";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: [
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "transition-all duration-200",
        state.visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"
      ].join(" "),
      children: /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-4 bg-moria-300 text-moria-900 pl-4 pr-3 py-3 rounded-xl text-sm font-medium whitespace-nowrap ${accent}`, children: [
        /* @__PURE__ */ jsx("span", { children: state.message }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onDismiss,
            className: "text-moria-600 hover:text-moria-900 transition-colors",
            "aria-label": "Dismiss",
            children: /* @__PURE__ */ jsx(X, { size: 14, strokeWidth: 2.5 })
          }
        )
      ] })
    }
  );
}
function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon
}) {
  const pos = delta !== void 0 && delta > 0;
  const neg = delta !== void 0 && delta < 0;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-moria-700 bg-moria-800 px-5 py-4 flex flex-col gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-moria-500 uppercase tracking-wide", children: label }),
      Icon && /* @__PURE__ */ jsx(Icon, { size: 15, strokeWidth: 1.75, className: "text-moria-600" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold text-moria-300 tabular-nums leading-none", children: value }),
    delta !== void 0 && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 text-xs font-medium ${pos ? "text-accent" : neg ? "text-lift-negative" : "text-moria-500"}`, children: [
      pos ? /* @__PURE__ */ jsx(TrendingUp, { size: 12, strokeWidth: 2 }) : neg ? /* @__PURE__ */ jsx(TrendingDown, { size: 12, strokeWidth: 2 }) : /* @__PURE__ */ jsx(Minus, { size: 12, strokeWidth: 2 }),
      /* @__PURE__ */ jsxs("span", { children: [
        pos ? "+" : "",
        delta,
        "%"
      ] }),
      deltaLabel && /* @__PURE__ */ jsx("span", { className: "text-moria-600 font-normal ml-1", children: deltaLabel })
    ] })
  ] });
}
function TabBar({
  tabs,
  activeId,
  onChange
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex border-b border-moria-700", children: tabs.map((tab) => {
    const active = tab.id === activeId;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => onChange(tab.id),
        className: [
          "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
          active ? "text-moria-300" : "text-moria-500 hover:text-moria-400"
        ].join(" "),
        children: [
          tab.icon && /* @__PURE__ */ jsx(tab.icon, { size: 15, strokeWidth: 1.75 }),
          tab.label,
          active && /* @__PURE__ */ jsx(
            "span",
            {
              className: "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
              style: { background: "var(--color-accent)" }
            }
          )
        ]
      },
      tab.id
    );
  }) });
}
function TagInput({
  value,
  onChange,
  placeholder = "Add tag\u2026"
}) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);
  const addTag = (raw) => {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInputVal("");
  };
  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex flex-wrap gap-1.5 items-center rounded-xl border border-moria-500 bg-moria-800\n                 px-3 py-2.5 cursor-text focus-within:border-moria-300 transition-colors min-h-[48px]",
      onClick: () => inputRef.current?.focus(),
      children: [
        value.map((tag) => /* @__PURE__ */ jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0",
            style: { background: "var(--color-moria-700)", color: "var(--color-moria-400)" },
            children: [
              tag,
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  },
                  className: "opacity-60 hover:opacity-100 transition-opacity flex items-center",
                  children: /* @__PURE__ */ jsx(X, { size: 10, strokeWidth: 2.5 })
                }
              )
            ]
          },
          tag
        )),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            value: inputVal,
            onChange: (e) => setInputVal(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(inputVal);
              }
              if (e.key === "Backspace" && !inputVal && value.length > 0) removeTag(value[value.length - 1]);
            },
            placeholder: value.length === 0 ? placeholder : "",
            className: "flex-1 min-w-[120px] text-sm bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 py-0.5"
          }
        )
      ]
    }
  );
}
function Textarea({
  value,
  onChange,
  placeholder = "",
  rows = 4,
  disabled = false
}) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      value,
      onChange: (e) => onChange(e.target.value),
      placeholder,
      rows,
      disabled,
      className: [
        "w-full rounded-xl border bg-moria-800 px-4 py-3 text-base outline-none transition-colors",
        "text-moria-400 placeholder:text-moria-600",
        disabled ? "border-moria-700 text-moria-600 cursor-not-allowed resize-none" : "border-moria-500 focus:border-moria-300 focus:text-moria-300 resize-y"
      ].join(" ")
    }
  );
}
function TextInput({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  type = "text"
}) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      value,
      onChange: (e) => onChange(e.target.value),
      placeholder,
      disabled,
      className: [
        "w-full rounded-xl border bg-moria-800 px-4 py-3 text-base outline-none transition-colors",
        "text-moria-400 placeholder:text-moria-600",
        disabled ? "border-moria-700 text-moria-600 cursor-not-allowed" : "border-moria-500 focus:border-moria-300 focus:text-moria-300"
      ].join(" ")
    }
  );
}
function Toggle({
  checked,
  onChange,
  label,
  disabled = false
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": checked,
      onClick: () => !disabled && onChange(!checked),
      disabled,
      className: "group flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none",
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: [
              "relative inline-flex w-10 h-6 rounded-full transition-colors duration-200 shrink-0",
              checked ? "" : "bg-moria-700",
              disabled ? "opacity-40" : ""
            ].join(" "),
            style: checked ? { background: "var(--color-accent)" } : {},
            children: /* @__PURE__ */ jsx(
              "span",
              {
                className: [
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                  checked ? "translate-x-4" : "translate-x-0"
                ].join(" ")
              }
            )
          }
        ),
        label && /* @__PURE__ */ jsx("span", { className: `text-base transition-colors ${disabled ? "text-moria-600" : "text-moria-400 group-hover:text-moria-300"}`, children: label })
      ]
    }
  );
}
function Tooltip({
  content,
  children
}) {
  const [visible, setVisible] = useState(false);
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: "relative inline-flex",
      onMouseEnter: () => setVisible(true),
      onMouseLeave: () => setVisible(false),
      children: [
        children,
        /* @__PURE__ */ jsxs(
          "span",
          {
            className: [
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 pointer-events-none",
              "bg-moria-300 text-moria-900 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap",
              "transition-all duration-150",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            ].join(" "),
            children: [
              content,
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "absolute top-full left-1/2 -translate-x-1/2",
                  style: {
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "5px solid var(--color-moria-300)"
                  }
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function UrlInput({
  value,
  onChange,
  placeholder = "https://example.com",
  disabled = false
}) {
  const isEmpty = value.length === 0;
  const isValid = !isEmpty && (() => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  })();
  const isInvalid = !isEmpty && !isValid;
  const borderColor = disabled ? "border-moria-700" : "border-moria-500";
  return /* @__PURE__ */ jsxs("div", { className: `flex rounded-xl border ${borderColor} bg-moria-800 overflow-hidden transition-colors focus-within:border-moria-300`, children: [
    /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center px-3 border-r ${borderColor} text-moria-500 shrink-0`, children: /* @__PURE__ */ jsx(Globe, { size: 16, strokeWidth: 2 }) }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "url",
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        disabled,
        className: "flex-1 px-4 py-3 text-base bg-transparent outline-none text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors disabled:text-moria-600 disabled:cursor-not-allowed"
      }
    ),
    isValid && /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center px-3 shrink-0", style: { color: "var(--color-lift-positive)" }, children: /* @__PURE__ */ jsx(Check, { size: 16, strokeWidth: 2.5 }) }),
    isInvalid && /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center px-3 shrink-0", style: { color: "var(--color-lift-negative)" }, children: /* @__PURE__ */ jsx(X, { size: 16, strokeWidth: 2.5 }) })
  ] });
}

export { Accordion, Alert, Breadcrumbs, Button, Card, Checkbox, CodeBlock, Combobox, DataTable, DateInput, Dropdown, EmptyState, GhostButton, Modal, MultiSelect, NumberInput, Pagination, PasswordInput, PhoneInput, Pill, ProgressBar, RadioGroup, RangeSlider, SearchInput, Sidebar, Skeleton, SkeletonCard, SkeletonText, Slider, Snackbar, StatCard, TabBar, TagInput, TextInput, Textarea, Toggle, Tooltip, UrlInput };

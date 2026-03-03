# UI Reference — mirror-of-galadriel

Design language and component catalogue for the Moria data mining UI.
The component playground lives at `/dev`.

---

## Philosophy

Light, warm, and tactile. The palette is drawn from pine wood and natural sage — off-white
surfaces, warm brown text, muted green accents. Components have physical weight: buttons press
down, inputs have defined borders that match their text. Nothing floats unsupported.

---

## Palette

Defined in `src/app/globals.css` as Tailwind 4 `@theme` tokens.

The scale runs **inverted from standard Tailwind convention**: `900` is the lightest (page
background) and `300` is the darkest (primary text). This keeps all component class names
consistent regardless of light/dark mode direction.

### Base scale — `moria-*`

| Token | Hex | Role |
|---|---|---|
| `moria-900` | `#f4efe4` | Page background — warm off-white |
| `moria-800` | `#ece5d5` | Card and panel backgrounds |
| `moria-700` | `#d7ceba` | Borders, dividers, subtle fills |
| `moria-600` | `#b0a490` | Muted borders, button shadows |
| `moria-500` | `#857869` | Muted text, placeholders, icons at rest |
| `moria-400` | `#5a4e42` | Secondary / body text, input values at rest |
| `moria-300` | `#2a2118` | Primary text, focused input values |

### Semantic tokens

| Token | Hex | Role |
|---|---|---|
| `accent` | `#5f8a56` | Sage green — primary action, checked state |
| `accent-hover` | `#4e7846` | Sage shadow layer for 3D buttons |
| `lift-positive` | `#5f8a56` | Positive lift score |
| `lift-neutral` | `#857869` | Neutral / near-zero lift |
| `lift-warning` | `#c08a2a` | Warning — warm amber / beeswax |
| `lift-warning-shadow` | `#8f6420` | Shadow layer for warning button |
| `lift-negative` | `#a8572e` | Negative lift score — terracotta |
| `lift-negative-shadow` | `#7e4122` | Shadow layer for destructive button |

### Typography

| Usage | Classes |
|---|---|
| Page / section heading | `text-2xl font-semibold text-moria-300` |
| Body | `text-base text-moria-300` |
| Secondary / metadata | `text-sm text-moria-500` |
| Mono identifiers (tags, IDs) | `text-xs font-mono text-moria-500` |

Fonts: `Inter` (sans), `JetBrains Mono` / `Fira Code` (mono).

---

## Components

### Card

Surface container with a header region and an optional body. Sits one tonal step above the page background (`moria-800` on `moria-900`).

```tsx
<div className="rounded-xl border border-moria-700 bg-moria-800 overflow-hidden">
  {/* Header — border-b only when a body is present */}
  <div className="px-5 py-4 border-b border-moria-700">
    <div className="text-sm font-semibold text-moria-300">{title}</div>
    {subtitle && <div className="text-xs text-moria-500 mt-1">{subtitle}</div>}
  </div>
  {/* Body */}
  <div className="px-5 py-4">
    {children}
  </div>
</div>
```

| Region | Classes |
|---|---|
| Container | `rounded-xl border border-moria-700 bg-moria-800 overflow-hidden` |
| Header | `px-5 py-4` · `border-b border-moria-700` only when body present |
| Title | `text-sm font-semibold text-moria-300` |
| Subtitle | `text-xs text-moria-500 mt-1` |
| Body | `px-5 py-4` |

`overflow-hidden` on the container ensures child backgrounds (e.g. hover states in lists) are clipped to the rounded corners. The `border-b` divider is conditional — a header-only card has no bottom rule inside it.

---

### Sidebar

Navigation panel with collapsible sections, nested items (up to 3 levels), Lucide icon support, and a full ↔ icon-only collapsed mode.

#### Structure

```
Sidebar
├── [toggle button — PanelLeft icon]
└── SidebarSection (collapsible, uppercase tracking-widest label + ChevronRight)
    └── SidebarItem (recursive, depth 0–2)
        ├── [icon] label [ChevronRight if has children]
        └── children → ml-3.5 pl-3 border-l border-moria-700 guide line
```

#### Expanded mode (`w-56`)

```tsx
<nav className="w-56 shrink-0 bg-moria-800 border-r border-moria-700
                flex flex-col gap-5 px-2 py-3 overflow-y-auto">

  {/* Collapse toggle — top-right */}
  <div className="flex justify-end px-1">
    <button className="flex items-center justify-center h-7 w-7 rounded-lg
                       text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors">
      <PanelLeft size={15} strokeWidth={1.75} />
    </button>
  </div>

  {/* Section */}
  <div className="space-y-0.5">
    <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg
                       text-xs font-semibold text-moria-500 uppercase tracking-widest
                       hover:text-moria-300 transition-colors select-none">
      <span>Section label</span>
      <ChevronRight size={12} strokeWidth={2.5}
        className="text-moria-600 transition-transform duration-150 rotate-90" {/* open */} />
    </button>

    {/* Depth-0 item */}
    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                       text-moria-400 hover:bg-moria-700 hover:text-moria-300 transition-colors">
      <Icon size={16} strokeWidth={1.75} className="shrink-0" />
      <span className="flex-1 truncate">Label</span>
      <ChevronRight size={13} strokeWidth={2}
        className="shrink-0 text-moria-600 transition-transform duration-150 rotate-90" />
    </button>

    {/* Nested children — guide line per level */}
    <div className="ml-3.5 mt-0.5 pl-3 border-l border-moria-700 space-y-0.5">
      {/* depth-1 item: py-1.5 instead of py-2, no icon required */}
    </div>
  </div>
</nav>
```

#### Collapsed mode (`w-14`)

Only items that have an `icon` are shown — items without icons and all section labels are hidden. `title` attribute provides native browser tooltip.

```tsx
<nav className="w-14 shrink-0 bg-moria-800 border-r border-moria-700
                flex flex-col items-center py-3 gap-1 overflow-y-auto">

  {/* Expand toggle */}
  <button className="flex items-center justify-center h-9 w-9 rounded-lg
                     text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors mb-1">
    <PanelLeft size={16} strokeWidth={1.75} />
  </button>

  {/* Icon-only item */}
  <button title="Label"
          className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors
                     text-moria-400 hover:bg-moria-700 hover:text-moria-300
                     {/* active: bg-moria-700 text-moria-300 */}">
    <Icon size={16} strokeWidth={1.75} />
  </button>
</nav>
```

#### Item states

| State | Background | Text |
|---|---|---|
| Default | — | `moria-400` |
| Hover | `moria-700` | `moria-300` |
| Active | `moria-700` | `moria-300` |
| Section label | — | `moria-500` |

#### Nesting guide line

Each level of nesting wraps children in `ml-3.5 mt-0.5 pl-3 border-l border-moria-700`. Up to 3 levels (depth 0 → 1 → 2). Items at all depths collapse their children independently via local state; depth-0 items default to open, deeper items default to closed.

---

### Buttons

3D "pushable" effect: the outer element holds a darker shadow color; the inner `<span>` face
sits `translateY(-4px)` above it at rest and `translateY(-1px)` on `:active`, creating a
press-down feeling.

```tsx
{/* Primary */}
<button className="group rounded-lg p-0 cursor-pointer border-none"
  style={{ background: "var(--color-accent-hover)" }}>
  <span className="block px-5 py-2 rounded-lg text-sm font-medium text-white
                   translate-y-[-4px] group-active:translate-y-[-1px] transition-transform"
    style={{ background: "var(--color-accent)" }}>
    Label
  </span>
</button>

{/* Secondary */}
<button className="group rounded-lg p-0 cursor-pointer border-none"
  style={{ background: "var(--color-moria-600)" }}>
  <span className="block px-5 py-2 rounded-lg text-sm font-medium
                   translate-y-[-4px] group-active:translate-y-[-1px] transition-transform"
    style={{ background: "var(--color-moria-800)", color: "var(--color-moria-300)" }}>
    Label
  </span>
</button>

{/* Warning */}
<button className="group rounded-lg p-0 cursor-pointer border-none"
  style={{ background: "var(--color-lift-warning-shadow)" }}>
  <span className="block px-5 py-2 rounded-lg text-sm font-medium text-white
                   translate-y-[-4px] group-active:translate-y-[-1px] transition-transform"
    style={{ background: "var(--color-lift-warning)" }}>
    Label
  </span>
</button>

{/* Destructive */}
<button className="group rounded-lg p-0 cursor-pointer border-none"
  style={{ background: "var(--color-lift-negative-shadow)" }}>
  <span className="block px-5 py-2 rounded-lg text-sm font-medium text-white
                   translate-y-[-4px] group-active:translate-y-[-1px] transition-transform"
    style={{ background: "var(--color-lift-negative)" }}>
    Label
  </span>
</button>

{/* Ghost — flat, no depth */}
<button className="px-5 py-2 text-sm font-medium rounded-lg text-moria-500
                   hover:text-moria-300 transition-colors">
  Label
</button>

{/* Disabled */}
<button disabled className="group rounded-lg p-0 cursor-not-allowed border-none"
  style={{ background: "var(--color-moria-700)" }}>
  <span className="block px-5 py-2 rounded-lg text-sm font-medium translate-y-[-4px]"
    style={{ background: "var(--color-moria-800)", color: "var(--color-moria-600)" }}>
    Label
  </span>
</button>
```

**Depth values:** 4px rest → 1px active. No transition on transform — instant response feels
more physical.

---

### Snackbar

Brief notification that appears fixed at the bottom-center of the screen, slides up on entry,
and auto-dismisses after 3 seconds. Can also be manually dismissed via an `X` button.

**Appearance:** `bg-moria-300` (dark warm charcoal) against the light page gives strong
contrast. Text is `moria-900` (cream). Variant is indicated by a `border-l-4` accent — no
border for default, sage for success, terracotta for destructive.

| Variant | Left border | Use for |
|---|---|---|
| `default` | none | Neutral info / confirmation |
| `success` | `border-accent` | Saved, created, completed |
| `warning` | `border-lift-warning` | Review required, non-critical issues |
| `destructive` | `border-lift-negative` | Errors, failures, deletions |

```tsx
// State shape
interface SnackbarState {
  visible: boolean;
  message: string;
  variant: "default" | "success" | "warning" | "destructive";
}

// Component
function Snackbar({ state, onDismiss }) {
  const accent =
    state.variant === "success"     ? "border-l-4 border-accent" :
    state.variant === "warning"     ? "border-l-4 border-lift-warning" :
    state.variant === "destructive" ? "border-l-4 border-lift-negative" : "";

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-200
                     ${state.visible
                       ? "translate-y-0 opacity-100"
                       : "translate-y-3 opacity-0 pointer-events-none"}`}>
      <div className={`flex items-center gap-4 bg-moria-300 text-moria-900
                       pl-4 pr-3 py-3 rounded-xl text-sm font-medium whitespace-nowrap ${accent}`}>
        <span>{state.message}</span>
        <button onClick={onDismiss} className="text-moria-600 hover:text-moria-900 transition-colors">
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// Usage — timer resets on each trigger so rapid-firing replaces in place
const timer = useRef(null);

function show(message, variant) {
  if (timer.current) clearTimeout(timer.current);
  setSnackbar({ visible: true, message, variant });
  timer.current = setTimeout(() => setSnackbar(s => ({ ...s, visible: false })), 3000);
}
```

---

### Text input

`rounded-xl` corners (12px), `px-4 py-3`, `text-base`. Border and text share the same
tonal family to read as a single cohesive element.

```tsx
<input
  type="text"
  className="w-full rounded-xl border border-moria-500 bg-moria-800
             px-4 py-3 text-base text-moria-400 placeholder:text-moria-600
             outline-none focus:border-moria-300 focus:text-moria-300 transition-colors"
/>
```

| State | Border | Text |
|---|---|---|
| Placeholder | `moria-500` | `moria-600` |
| Value, unfocused | `moria-500` | `moria-400` |
| Focused | `moria-300` | `moria-300` |
| Disabled | `moria-700` | `moria-600` |

Label: `text-xs font-medium text-moria-500`, `space-y-1.5` gap above the input.

---

### Number input

Same shape as text input. Native browser spinner is hidden; replaced with Lucide
`ChevronUp` / `ChevronDown` in a right-side column. The border lives on the **wrapper div**
(not the `<input>`) so hover backgrounds on the chevron buttons cannot cover it.
`overflow-hidden` on the wrapper clips button backgrounds to the rounded corners.

```tsx
<div className="flex rounded-xl border border-moria-500 bg-moria-800
                overflow-hidden transition-colors focus-within:border-moria-300">
  <input
    type="number"
    className="flex-1 px-4 py-3 text-base bg-transparent outline-none
               text-moria-400 placeholder:text-moria-600 focus:text-moria-300
               [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
  />
  <div className="flex flex-col border-l border-moria-500">
    <button className="flex-1 flex items-center justify-center px-2
                       text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors"
      tabIndex={-1}>
      <ChevronUp size={14} strokeWidth={2.5} />
    </button>
    <div className="h-px bg-moria-500" />
    <button className="flex-1 flex items-center justify-center px-2
                       text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors"
      tabIndex={-1}>
      <ChevronDown size={14} strokeWidth={2.5} />
    </button>
  </div>
</div>
```

The chevron column divider (`h-px bg-moria-500`) matches the border color.
`tabIndex={-1}` keeps tab navigation in the field, not the steppers.

---

### Password input

Same wrapper pattern as number input. Right column holds a single Lucide `Eye` / `EyeOff`
toggle that reveals/hides the value.

```tsx
<div className="flex rounded-xl border border-moria-500 bg-moria-800
                overflow-hidden transition-colors focus-within:border-moria-300">
  <input
    type={visible ? "text" : "password"}
    className="flex-1 px-4 py-3 text-base bg-transparent outline-none
               text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors"
  />
  <button
    type="button"
    onClick={() => setVisible(v => !v)}
    className="flex items-center justify-center px-3 border-l border-moria-500
               text-moria-500 hover:text-moria-300 transition-colors"
    tabIndex={-1}
    aria-label={visible ? "Hide password" : "Show password"}
  >
    {visible ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
  </button>
</div>
```

---

### Phone input

Country selector (flag + dial code) on the left; formatted digit field on the right. The border lives on the **wrapper div** — same convention as number and password inputs. `focus-within:border-moria-300` on the wrapper catches focus from either the trigger or the field.

The dropdown opens flush with the trigger's top-left corner, matches the trigger column width, and is closed by clicking the mirrored header row or by selecting a country. Only one country is visible at a time; clicking outside also closes it.

```tsx
<div className="flex rounded-xl border border-moria-500 bg-moria-800
                overflow-hidden transition-colors focus-within:border-moria-300">
  <button
    type="button"
    className="flex items-center gap-1.5 pl-3 pr-2 border-r border-moria-500
               text-moria-400 hover:text-moria-300 shrink-0"
    aria-haspopup="listbox"
  >
    <span className="text-base leading-none">🇺🇸</span>
    <span className="text-sm font-mono">+1</span>
    <ChevronDown size={12} strokeWidth={2.5} className="text-moria-500" />
  </button>
  <input
    type="tel"
    inputMode="numeric"
    placeholder="(201) 555-0123"
    className="flex-1 px-4 py-3 text-base bg-transparent outline-none
               text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors"
  />
</div>
```

Digit input strips non-numeric characters on change and caps at `maxDigits` for the selected country. Formatting is applied as a display transformation (`format(digits)` → formatted string), not stored.

---

### URL input

Globe icon prefix in a left column; inline validation icon on the right when the field has a value. Border lives on the **wrapper div**. The globe column has a `border-r` that matches the wrapper border color.

Validation uses `new URL()` — a `Check` in `lift-positive` (sage) when valid, an `X` in `lift-negative` (terracotta) when invalid. Empty field shows neither icon.

```tsx
<div className="flex rounded-xl border border-moria-500 bg-moria-800
                overflow-hidden transition-colors focus-within:border-moria-300">
  <span className="flex items-center justify-center px-3 border-r border-moria-500
                   text-moria-500 shrink-0">
    <Globe size={16} strokeWidth={2} />
  </span>
  <input
    type="url"
    placeholder="https://example.com"
    className="flex-1 px-4 py-3 text-base bg-transparent outline-none
               text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors"
  />
  {/* shown when non-empty and valid */}
  <span className="flex items-center justify-center px-3 shrink-0"
        style={{ color: "var(--color-lift-positive)" }}>
    <Check size={16} strokeWidth={2.5} />
  </span>
  {/* shown when non-empty and invalid */}
  <span className="flex items-center justify-center px-3 shrink-0"
        style={{ color: "var(--color-lift-negative)" }}>
    <X size={16} strokeWidth={2.5} />
  </span>
</div>
```

| State | Globe | Right icon |
|---|---|---|
| Empty | `moria-500` | — |
| Valid | `moria-500` | `Check` in `lift-positive` |
| Invalid | `moria-500` | `X` in `lift-negative` |
| Disabled | `moria-500` at reduced opacity | — |

The validation icon column has no `border-l` — it floats flush inside the wrapper. `shrink-0` on both icon spans prevents them from collapsing on narrow widths.

---

### Checkbox

Three states: `off`, `on`, `some` (indeterminate). The box is `w-5 h-5 rounded-md`
(6px radius), consistent with the input border family.

| State | Box | Icon |
|---|---|---|
| `off` | `border-moria-500 bg-moria-800` | — |
| `on` | `border-accent bg-accent` | `Check` white, strokeWidth 3 |
| `some` | `border-moria-500 bg-moria-800` | `Minus` moria-400, strokeWidth 3 |

- Hover lifts box border to `moria-300` and label text to `moria-300`
- `some` → `off` on click (indeterminate clears rather than checks)
- `aria-checked="mixed"` on the indeterminate state
- Label: `text-base text-moria-400`, same weight as input body text

### Dropdown

Custom listbox — same height and padding as a text input. Border lives directly on the trigger `<button>` (not a wrapper) and updates to `moria-300` when the panel is open. `ChevronDown` rotates 180° on open.

```tsx
{/* Trigger */}
<button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-moria-500
                   bg-moria-800 text-sm transition-colors"
  {/* open → border-moria-300 | disabled → border-moria-700 */}>
  <span className="flex-1 truncate text-moria-400">{selected.label}</span>
  <ChevronDown size={16} strokeWidth={2}
    className="shrink-0 text-moria-500 transition-transform duration-150 rotate-180" {/* open */} />
</button>

{/* Panel — absolute, z-50, mt-1 below trigger */}
<div className="absolute top-full left-0 right-0 mt-1 z-50
                bg-moria-800 border border-moria-500 rounded-xl overflow-hidden">
  {/* Option row */}
  <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left
                     text-moria-400 hover:bg-moria-700 hover:text-moria-300 transition-colors
                     {/* selected: bg-moria-700 text-moria-300 */}">
    <span>Option label</span>
    <Check size={14} strokeWidth={2.5} style={{ color: "var(--color-accent)" }} /> {/* selected only */}
  </button>
</div>
```

| State | Border | Chevron |
|---|---|---|
| Default | `moria-500` | 0° |
| Open | `moria-300` | 180° |
| Disabled | `moria-700` | 0° |

Selected option gets `bg-moria-700 text-moria-300` and a sage `Check` icon on the right. Placeholder text is `moria-600`.

---

### Pill

Inline label for tags, status, and grouping. `rounded-full`, `px-2.5 py-0.5`, `text-xs font-medium`. Color is applied via inline `style` using CSS variable references.

```tsx
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background, color }}>
  {label}
  {onRemove && (
    <button className="-mr-0.5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
      <X size={10} strokeWidth={2.5} />
    </button>
  )}
</span>
```

| Variant | Background | Text |
|---|---|---|
| `default` | `moria-700` | `moria-400` |
| `positive` | `lift-positive` at 15% opacity | `lift-positive` |
| `warning` | `lift-warning` at 15% opacity | `lift-warning` |
| `negative` | `lift-negative` at 15% opacity | `lift-negative` |

Opacity backgrounds use `rgba()` literal values (e.g. `rgba(95, 138, 86, 0.15)`) since CSS `color-mix` is not required.  The optional `onRemove` renders an `X` button with `opacity-60 hover:opacity-100` — it inherits the pill's text color.

---

### Table

Data table with sortable columns. Container: `rounded-xl border border-moria-700 overflow-hidden`. Rows on `moria-900` background, header on `moria-800`.

```tsx
<div className="rounded-xl border border-moria-700 overflow-hidden">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-moria-700 bg-moria-800">
        <th className="px-4 py-3 text-xs font-semibold text-moria-500 uppercase tracking-wider
                       text-left cursor-pointer hover:text-moria-300 transition-colors select-none">
          <span className="inline-flex items-center gap-1.5">
            Column
            <ArrowUpDown size={12} strokeWidth={2} className="text-moria-600" /> {/* unsorted */}
            {/* <ArrowUp /> or <ArrowDown /> when sorted */}
          </span>
        </th>
        <th className="px-4 py-3 ... text-right"> {/* numeric column */}
          <span className="inline-flex items-center gap-1.5 flex-row-reverse"> ... </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-moria-700 last:border-b-0 hover:bg-moria-800 transition-colors">
        <td className="px-4 py-3 text-sm text-moria-400 text-left">…</td>
        <td className="px-4 py-3 text-sm text-moria-400 text-right tabular-nums">…</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Sort indicator:** `ArrowUpDown` (moria-600) when unsorted; `ArrowUp` / `ArrowDown` in the header's current text color when sorted. For right-aligned columns the icon sits to the left of the header text (`flex-row-reverse`).

**Numeric columns:** `text-right tabular-nums`. Lift score cells use inline `color` from lift semantic tokens (`lift-positive`, `lift-neutral`, `lift-negative`) to convey direction.

The `DataTable` component is generic over `T extends { id: string | number }`. Columns are defined with a `render?: (row: T) => ReactNode` prop for custom cell content.

### Search input

Identical wrapper pattern to the other compound inputs. `Search` icon in a left prefix span (no `border-r` — the icon floats inside the field). A `X` clear button appears on the right only when the field has a value; `tabIndex={-1}` keeps tab flow in the field.

```tsx
<div className="flex rounded-xl border border-moria-500 bg-moria-800
                overflow-hidden transition-colors focus-within:border-moria-300">
  <span className="flex items-center pl-4 pr-2 text-moria-500 shrink-0">
    <Search size={16} strokeWidth={2} />
  </span>
  <input type="text" className="flex-1 py-3 text-base bg-transparent outline-none
                                text-moria-400 placeholder:text-moria-600 focus:text-moria-300 transition-colors" />
  {value && (
    <button tabIndex={-1} className="flex items-center pr-3 text-moria-500 hover:text-moria-300 transition-colors">
      <X size={14} strokeWidth={2.5} />
    </button>
  )}
</div>
```

---

### Textarea

Same border, radius, padding, and focus behaviour as the text input. `resize-y` when enabled; `resize-none` when disabled.

```tsx
<textarea
  className="w-full rounded-xl border border-moria-500 bg-moria-800
             px-4 py-3 text-base outline-none resize-y transition-colors
             text-moria-400 placeholder:text-moria-600
             focus:border-moria-300 focus:text-moria-300"
/>
```

Disabled: `border-moria-700 text-moria-600 cursor-not-allowed resize-none`.

---

### Toggle

Pill-shaped track (`w-10 h-6 rounded-full`) with a white thumb (`w-4 h-4`). Thumb translates `translate-x-4` (16px) when on. Track colour transitions via `background` style prop (`accent` on, `moria-700` off). `role="switch"` with `aria-checked`.

```tsx
<button role="switch" aria-checked={checked} className="group flex items-center gap-2.5">
  <span className="relative inline-flex w-10 h-6 rounded-full transition-colors duration-200"
        style={{ background: checked ? "var(--color-accent)" : "var(--color-moria-700)" }}>
    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm
                      transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
  </span>
  {label && <span className="text-base text-moria-400 group-hover:text-moria-300">{label}</span>}
</button>
```

Disabled: `opacity-40` on the track span.

---

### Tabs

Horizontal tab bar with an accent underline indicator on the active tab. The bar sits on top of a `border-b border-moria-700` container edge.

```tsx
<div className="flex border-b border-moria-700">
  <button className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                     text-moria-300 transition-colors">
    <Icon size={15} strokeWidth={1.75} />
    Label
    {/* active indicator */}
    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{ background: "var(--color-accent)" }} />
  </button>
  <button className="... text-moria-500 hover:text-moria-400">Inactive</button>
</div>
```

Inactive tabs: `text-moria-500 hover:text-moria-400`. No background fill on active — the underline is the sole indicator.

---

### Tooltip

Hover-triggered floating label. Wrapper is `relative inline-flex`; tooltip is `absolute bottom-full` centred above the trigger. Fades + translates on enter/leave (`duration-150`). Arrow uses CSS border trick.

```tsx
<span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
  {children}
  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 pointer-events-none
                   bg-moria-300 text-moria-900 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap
                   transition-all duration-150 opacity-0 translate-y-1
                   {/* visible: opacity-100 translate-y-0 */}">
    {content}
    <span className="absolute top-full left-1/2 -translate-x-1/2"
          style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                   borderTop: "5px solid var(--color-moria-300)" }} />
  </span>
</span>
```

Same `moria-300` bg / `moria-900` text as the Snackbar — strong contrast against the light page.

---

### Modal

`fixed inset-0 z-50` overlay. Backdrop: `bg-moria-300/20 backdrop-blur-sm`. Dialog: `bg-moria-800 border border-moria-700 rounded-2xl max-w-md`. Closes on Escape keydown or backdrop click.

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center"
     onClick={closeOnBackdrop}>
  <div className="absolute inset-0 bg-moria-300/20 backdrop-blur-sm" />
  <div className="relative bg-moria-800 border border-moria-700 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-moria-700">
      <h2 className="text-base font-semibold text-moria-300">{title}</h2>
      <button className="h-7 w-7 rounded-lg text-moria-500 hover:text-moria-300 hover:bg-moria-700">
        <X size={15} strokeWidth={2} />
      </button>
    </div>
    {/* Body */}
    <div className="px-6 py-5">{children}</div>
    {/* Footer — optional */}
    <div className="px-6 py-4 border-t border-moria-700 flex justify-end gap-3">{footer}</div>
  </div>
</div>
```

---

### Pagination

Prev / next chevron buttons flanking numbered page buttons. Ellipsis (`…`) appears when the page range would exceed 7 visible items. Current page: `bg-moria-700 text-moria-300`. Disabled prev/next: `opacity-30 cursor-not-allowed`.

```tsx
<div className="flex items-center gap-1">
  <button disabled={page <= 1} className="h-9 w-9 rounded-lg text-moria-500 ...">
    <ChevronLeft size={16} strokeWidth={2} />
  </button>
  {/* page buttons */}
  <button className="h-9 w-9 rounded-lg text-sm font-medium
                     bg-moria-700 text-moria-300 {/* active */}
                     text-moria-400 hover:bg-moria-700 hover:text-moria-300 {/* default */}">
    {n}
  </button>
  <span className="h-9 w-9 text-sm text-moria-600 cursor-default flex items-center justify-center">…</span>
  <button disabled={page >= total} className="..."><ChevronRight /></button>
</div>
```

Ellipsis logic: always show first/last page; show 3 pages around current; fill remaining with `…`.

---

### Progress bar

Horizontal track (`h-2 rounded-full bg-moria-700 overflow-hidden relative`). Fill uses `background: var(--color-accent)` via inline style. Determinate: `width: ${pct}% transition-all duration-300`. Indeterminate: CSS animation `.progress-indeterminate` defined in `globals.css`.

```tsx
<div className="relative h-2 rounded-full bg-moria-700 overflow-hidden">
  {indeterminate
    ? <div className="progress-indeterminate" />  {/* globals.css keyframe */}
    : <div className="h-full rounded-full transition-all duration-300"
           style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
  }
</div>
```

Optional label row above: left-aligned name + right-aligned `font-mono` percentage.

---

### Skeleton

Shimmer animation defined in `globals.css` as `.skeleton-shimmer` — a 200%-wide linear gradient sliding left to right at 1.5s. Applied to `<div>` shapes; `rounded-md` by default.

```tsx
<div className="skeleton-shimmer rounded-md h-4 w-full" />
```

Preset compositions:
- `SkeletonText` — N lines, last line `w-3/4`
- `SkeletonCard` — card shell with header and 3 body lines

---

### Empty state

Centred column layout. Optional icon in a `rounded-2xl bg-moria-800 border border-moria-700 h-14 w-14` container. Title in `text-base font-semibold text-moria-300`; description in `text-sm text-moria-500 max-w-xs`. Optional action slot below.

```tsx
<div className="flex flex-col items-center justify-center py-14 px-6 text-center">
  <div className="mb-4 h-14 w-14 rounded-2xl bg-moria-800 border border-moria-700
                  flex items-center justify-center">
    <Icon size={24} strokeWidth={1.5} className="text-moria-500" />
  </div>
  <div className="text-base font-semibold text-moria-300">{title}</div>
  <div className="mt-1.5 text-sm text-moria-500 max-w-xs">{description}</div>
  <div className="mt-5">{action}</div>
</div>
```

Render inside a `rounded-xl border border-moria-700 bg-moria-900` container when used as a table/card placeholder.

---

### Date input

Same wrapper pattern as other compound inputs. A `Calendar` icon sits in a right column; clicking it calls `input.showPicker()`. The native browser calendar icon is hidden via CSS (`input[type="date"]::-webkit-calendar-picker-indicator`).

```tsx
<div className="flex rounded-xl border border-moria-500 bg-moria-800
                overflow-hidden transition-colors focus-within:border-moria-300">
  <input
    ref={inputRef}
    type="date"
    className="flex-1 px-4 py-3 text-base bg-transparent outline-none
               text-moria-400 focus:text-moria-300 transition-colors"
  />
  <button tabIndex={-1} onClick={() => inputRef.current?.showPicker?.()}
          className="flex items-center pr-4 text-moria-500 hover:text-moria-300 transition-colors">
    <Calendar size={16} strokeWidth={1.75} />
  </button>
</div>
```

---

### Combobox

Searchable single-select. Visually identical to Dropdown, but the panel includes a search field at the top. A clear `X` button appears inline in the trigger when a value is selected.

```tsx
{/* Trigger — identical to Dropdown */}
<button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-moria-500
                   bg-moria-800 text-sm transition-colors {/* open → border-moria-300 */}">
  <span className="flex-1 text-left truncate text-moria-400">{selected.label}</span>
  {selected && <X size={14} strokeWidth={2.5} className="text-moria-500" />} {/* clear */}
  <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-moria-500 rotate-180" />
</button>

{/* Panel */}
<div className="absolute top-full left-0 right-0 mt-1 z-50
                bg-moria-800 border border-moria-500 rounded-xl overflow-hidden">
  {/* Search field */}
  <div className="flex items-center gap-2 px-3 py-2 border-b border-moria-700">
    <Search size={14} strokeWidth={2} className="text-moria-500 shrink-0" />
    <input autoFocus className="flex-1 text-sm bg-transparent outline-none
                                text-moria-300 placeholder:text-moria-600" />
    {query && <X size={12} strokeWidth={2.5} />}
  </div>
  {/* Options — same as Dropdown */}
  <div className="max-h-52 overflow-y-auto scrollbar-hide">
    <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm
                       text-moria-400 hover:bg-moria-700 hover:text-moria-300">
      <span>Option label</span>
      <Check size={14} strokeWidth={2.5} style={{ color: "var(--color-accent)" }} />
    </button>
  </div>
</div>
```

---

### Multi-select

Searchable multi-select. Visually identical to Combobox — same trigger shape, same panel with search — so they can sit side by side (e.g. qualifiers + goal in the lift configurator) without visual mismatch. Options have a mini checkbox instead of a single `Check` icon.

Trigger label:
- 0 selected → placeholder
- 1 selected → item label
- N > 1 → `"N selected"`

A footer row inside the open panel shows `"N selected"` and a **Clear all** link.

```tsx
{/* Option row — checkbox variant */}
<button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                   text-moria-400 hover:bg-moria-700 hover:text-moria-300">
  <span className="shrink-0 w-4 h-4 rounded border border-accent bg-accent
                   flex items-center justify-center"> {/* checked */}
    <Check size={10} strokeWidth={3} className="text-white" />
  </span>
  <span className="flex-1 truncate">Option label</span>
</button>

{/* Footer — visible when ≥ 1 item selected */}
<div className="border-t border-moria-700 px-4 py-2 flex items-center justify-between">
  <span className="text-xs text-moria-500">2 selected</span>
  <button className="text-xs text-moria-500 hover:text-moria-300">Clear all</button>
</div>
```

---

### Tag input

Free-form inline tag entry. The border lives on a wrapper `div` (`focus-within:border-moria-300`). Existing tags render as default-variant pills inside the field; a bare `<input>` follows them for typing. Press **Enter** or **,** to commit a tag; **Backspace** on empty input removes the last tag.

```tsx
<div className="flex flex-wrap gap-1.5 items-center rounded-xl border border-moria-500 bg-moria-800
                px-3 py-2.5 cursor-text focus-within:border-moria-300 transition-colors min-h-[48px]"
     onClick={() => inputRef.current?.focus()}>
  {tags.map(tag => (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{ background: "var(--color-moria-700)", color: "var(--color-moria-400)" }}>
      {tag}
      <button onClick={() => removeTag(tag)}><X size={10} strokeWidth={2.5} /></button>
    </span>
  ))}
  <input ref={inputRef}
    onKeyDown={e => {
      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(inputVal); }
      if (e.key === "Backspace" && !inputVal) removeTag(last);
    }}
    className="flex-1 min-w-[120px] text-sm bg-transparent outline-none
               text-moria-400 placeholder:text-moria-600 focus:text-moria-300" />
</div>
```

> **Tag input vs Multi-select**: Use Multi-select when picking from a known list (e.g. taxonomy tags). Use Tag input for freeform labels, custom metadata keys, or anything not backed by a predefined vocabulary.

---

### Slider

Custom-styled `<input type="range">`. The track fill is rendered via `background: linear-gradient(to right, accent N%, moria-700 N%)` on the input itself. The native thumb is hidden; a custom thumb is drawn via `::webkit-slider-thumb` / `::moz-range-thumb` CSS in `globals.css` (`.moria-range` class).

```tsx
<input
  type="range"
  className="moria-range w-full"
  style={{
    background: `linear-gradient(to right,
      var(--color-accent) ${pct}%,
      var(--color-moria-700) ${pct}%)`
  }}
/>
```

**Range slider** (dual-handle): two overlapping `<input type="range">` elements on a shared track `div`. Both inputs use the same `min`/`max` so their internal track scale matches the fill calculation. Constraints are enforced in `onChange` (`Math.min(newLo, hi - step)` / `Math.max(newHi, lo + step)`). The filled segment uses `left: pctLo%` and `right: (100 - pctHi)%` on an absolutely positioned `div`. The container is `h-5 flex items-center` to give thumbs vertical room; the visible track and fill are `h-2` centered inside it.

---

### Alert / Banner

Inline contextual feedback. A thin colored left bar (1–3px) identifies variant; no full border accent juggling. Uses `overflow-hidden` on the outer container to clip the bar to rounded corners.

```tsx
<div className="flex rounded-xl border border-moria-700 bg-moria-800 overflow-hidden">
  <div className="w-1 shrink-0 bg-accent" /> {/* bar color varies by variant */}
  <div className="flex-1 flex gap-3 px-4 py-3.5">
    <Icon size={17} strokeWidth={1.75} className="shrink-0 mt-0.5 text-accent" />
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-moria-300">{title}</div>
      <div className="text-sm text-moria-500 mt-0.5">{description}</div>
    </div>
    {onDismiss && <button><X size={15} strokeWidth={2} className="text-moria-500 hover:text-moria-300" /></button>}
  </div>
</div>
```

| Variant | Bar | Icon | Icon color |
|---|---|---|---|
| `info` | `bg-moria-500` | `Info` | `text-moria-500` |
| `success` | `bg-accent` | `CheckCircle` | `text-accent` |
| `warning` | `bg-lift-warning` | `AlertTriangle` | `text-lift-warning` |
| `destructive` | `bg-lift-negative` | `AlertCircle` | `text-lift-negative` |

---

### Stat card

Key metric display. Large tabular number with an optional trend delta below. Icon sits top-right at `moria-600` weight. Delta uses lift semantic colors: positive → `text-accent`, negative → `text-lift-negative`, zero → `text-moria-500`.

```tsx
<div className="rounded-xl border border-moria-700 bg-moria-800 px-5 py-4 flex flex-col gap-2">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-moria-500 uppercase tracking-wide">{label}</span>
    <Icon size={15} strokeWidth={1.75} className="text-moria-600" />
  </div>
  <div className="text-3xl font-semibold text-moria-300 tabular-nums leading-none">{value}</div>
  <div className="flex items-center gap-1 text-xs font-medium text-accent">
    <TrendingUp size={12} strokeWidth={2} />
    <span>+4.2%</span>
    <span className="text-moria-600 font-normal ml-1">new tags</span>
  </div>
</div>
```

---

### Breadcrumbs

Horizontal trail of `<button>` elements (past segments) + a `<span>` (current page). `ChevronRight` separators between items. Supports an optional Lucide icon on any item.

```tsx
<nav className="flex items-center gap-1 text-sm flex-wrap">
  {items.map((item, i) => (
    <div key={i} className="flex items-center gap-1">
      {i > 0 && <ChevronRight size={13} strokeWidth={2} className="text-moria-600 shrink-0" />}
      {isLast
        ? <span className="text-moria-300 font-medium flex items-center gap-1.5">
            {Icon && <Icon size={13} strokeWidth={1.75} />} {item.label}
          </span>
        : <button className="text-moria-500 hover:text-moria-300 transition-colors flex items-center gap-1.5">
            {Icon && <Icon size={13} strokeWidth={1.75} />} {item.label}
          </button>}
    </div>
  ))}
</nav>
```

| State | Color |
|---|---|
| Past segment (clickable) | `moria-500` → hover `moria-300` |
| Current page (non-interactive) | `moria-300 font-medium` |
| Separator | `moria-600` |

---

### Accordion

Collapsible content panel. Container: `rounded-xl border border-moria-700 bg-moria-800 overflow-hidden`. Each item has a trigger row (`border-b border-moria-700` on all but the last). Height animation uses the CSS grid trick — no JS measurement, no `max-height` hack.

```tsx
{/* Container */}
<div className="rounded-xl border border-moria-700 bg-moria-800 overflow-hidden">
  {/* Item */}
  <div className="border-b border-moria-700 last:border-b-0">
    <button className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium
                       text-moria-400 hover:text-moria-300 hover:bg-moria-700/30 transition-colors">
      <span>Item title</span>
      <ChevronRight size={15} strokeWidth={2}
        className="text-moria-500 transition-transform duration-200 rotate-90" {/* open */} />
    </button>

    {/* Height animation — grid-rows-[0fr] → grid-rows-[1fr] */}
    <div className="grid transition-all duration-200 ease-in-out grid-rows-[1fr] {/* or [0fr] */}">
      <div className="overflow-hidden">
        <div className="px-5 pb-5 text-sm text-moria-500 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  </div>
</div>
```

The grid trick works because `grid-rows-[0fr]` collapses the row to its minimum content height (0, since the inner `div` has `overflow-hidden` which forces `min-height: 0`). No JS, no `scrollHeight`, no flash.

---

### Code block

Styled `<pre><code>` block with a copy-to-clipboard button. Header bar (`bg-moria-900`) shows the language/filename label on the left and the copy button on the right. `overflow-x-auto scrollbar-hide` handles long lines.

```tsx
<div className="rounded-xl border border-moria-700 bg-moria-800 overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-2.5 border-b border-moria-700 bg-moria-900">
    <span className="text-xs font-mono text-moria-600">{title ?? language}</span>
    <button className="flex items-center gap-1.5 text-xs text-moria-500 hover:text-moria-300 transition-colors">
      {copied ? <Check size={13} style={{ color: "var(--color-accent)" }} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  </div>
  {/* Body */}
  <pre className="px-5 py-4 text-sm font-mono text-moria-400 overflow-x-auto scrollbar-hide leading-relaxed">
    <code>{code}</code>
  </pre>
</div>
```

Copy tries `navigator.clipboard.writeText(code)` first (requires HTTPS or localhost), then falls back to a hidden `<textarea>` + `document.execCommand("copy")` for HTTP dev servers. The button swaps to a sage `Check` + "Copied!" for 2 seconds then resets. No syntax highlighting library by default — add Prism.js or Shiki for token colouring.

---

## Conventions

- **Border ownership:** for compound inputs (number, password), the border belongs to the
  wrapper `div`, never to the `<input>` itself. `overflow-hidden` on the wrapper clips all
  child backgrounds.
- **Focus ring:** `focus-within:border-moria-300` on wrappers; `focus:border-moria-300` on
  bare inputs. No browser default outline (`outline-none`).
- **Icons:** Lucide React throughout. Size 12–16px depending on context; strokeWidth 2–3.
- **Disabled:** opacity or color step back, `cursor-not-allowed`, no interaction.
- **`tabIndex={-1}`** on accessory buttons (steppers, toggles) inside inputs — keep tab
  flow in the field.

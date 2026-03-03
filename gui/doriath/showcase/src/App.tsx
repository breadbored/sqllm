import { useRef, useState } from "react";
import {
  Palette, Type, LayoutTemplate, PanelLeft,
  TextCursorInput, Hash, Lock, Phone, Globe, Calendar, Search, AlignLeft,
  ChevronsUpDown, ListChecks, Tag,
  MousePointerClick, SquareCheck, CircleDot, ToggleRight, PanelTop,
  SlidersHorizontal, MoreHorizontal,
  Bell, AlertCircle, Info, AppWindow,
  TrendingUp, Table2, Loader2, AlignJustify, Inbox,
  Home, Layers, Code2,
  LayoutDashboard, Settings, MapPin, Database,
  ArrowUp, ArrowDown,
} from "lucide-react";

import {
  Accordion,
  Alert,
  Breadcrumbs,
  Button,
  GhostButton,
  Card,
  Checkbox,
  CodeBlock,
  Combobox,
  DataTable,
  DateInput,
  Dropdown,
  EmptyState,
  Modal,
  MultiSelect,
  NumberInput,
  Pagination,
  PasswordInput,
  PhoneInput,
  Pill,
  ProgressBar,
  RadioGroup,
  RangeSlider,
  SearchInput,
  Sidebar,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  Slider,
  Snackbar,
  StatCard,
  TabBar,
  TagInput,
  Textarea,
  TextInput,
  Toggle,
  Tooltip,
  UrlInput,
} from "../../src";

import type {
  AccordionItemDef,
  CheckState,
  ComboOption,
  DataTableColumn,
  DropdownOption,
  RadioOption,
  SidebarNavSection,
  SnackbarState,
  SnackbarVariant,
  TabItem,
} from "../../src";

// ── Scaffolding ────────────────────────────────────────────────────────────────

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-3">
      <div className="border-b border-moria-700 pb-2">
        <h2 className="text-base font-semibold text-moria-300">{title}</h2>
        {description && <p className="text-xs text-moria-500 mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs text-moria-600 font-mono">{label}</div>
      <div>{children}</div>
    </div>
  );
}

// ── Sidebar nav ────────────────────────────────────────────────────────────────

const DEV_SIDEBAR: SidebarNavSection[] = [
  {
    id: "foundations",
    label: "Foundations",
    defaultOpen: true,
    items: [
      { id: "palette",    label: "Palette",    icon: Palette },
      { id: "typography", label: "Typography", icon: Type },
    ],
  },
  {
    id: "layout",
    label: "Layout",
    defaultOpen: true,
    items: [
      { id: "card",    label: "Card",    icon: LayoutTemplate },
      { id: "sidebar", label: "Sidebar", icon: PanelLeft },
    ],
  },
  {
    id: "inputs",
    label: "Inputs",
    defaultOpen: true,
    items: [
      { id: "text-input",     label: "Text",         icon: TextCursorInput },
      { id: "number-input",   label: "Number",       icon: Hash },
      { id: "password-input", label: "Password",     icon: Lock },
      { id: "phone-input",    label: "Phone",        icon: Phone },
      { id: "url-input",      label: "URL",          icon: Globe },
      { id: "date-input",     label: "Date",         icon: Calendar },
      { id: "search-input",   label: "Search",       icon: Search },
      { id: "textarea",       label: "Textarea",     icon: AlignLeft },
      { id: "dropdown",       label: "Dropdown",     icon: ChevronsUpDown },
      { id: "combobox",       label: "Combobox",     icon: ChevronsUpDown },
      { id: "multi-select",   label: "Multi-select", icon: ListChecks },
      { id: "tag-input",      label: "Tag input",    icon: Tag },
    ],
  },
  {
    id: "controls",
    label: "Controls",
    defaultOpen: true,
    items: [
      { id: "buttons",    label: "Buttons",    icon: MousePointerClick },
      { id: "pill",       label: "Pill",       icon: Tag },
      { id: "toggle",     label: "Toggle",     icon: ToggleRight },
      { id: "tabs",       label: "Tabs",       icon: PanelTop },
      { id: "checkbox",   label: "Checkbox",   icon: SquareCheck },
      { id: "radio",      label: "Radio",      icon: CircleDot },
      { id: "slider",     label: "Slider",     icon: SlidersHorizontal },
      { id: "pagination", label: "Pagination", icon: MoreHorizontal },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    defaultOpen: true,
    items: [
      { id: "snackbar", label: "Snackbar", icon: Bell },
      { id: "alert",    label: "Alert",    icon: AlertCircle },
      { id: "tooltip",  label: "Tooltip",  icon: Info },
      { id: "modal",    label: "Modal",    icon: AppWindow },
    ],
  },
  {
    id: "data",
    label: "Data",
    defaultOpen: true,
    items: [
      { id: "stat-card",   label: "Stat card",   icon: TrendingUp },
      { id: "table",       label: "Table",       icon: Table2 },
      { id: "progress",    label: "Progress",    icon: Loader2 },
      { id: "skeleton",    label: "Skeleton",    icon: AlignJustify },
      { id: "empty-state", label: "Empty state", icon: Inbox },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    defaultOpen: true,
    items: [
      { id: "breadcrumbs", label: "Breadcrumbs", icon: Home },
    ],
  },
  {
    id: "disclosure",
    label: "Disclosure",
    defaultOpen: true,
    items: [
      { id: "accordion", label: "Accordion", icon: Layers },
    ],
  },
  {
    id: "code",
    label: "Code",
    defaultOpen: true,
    items: [
      { id: "code-block", label: "Code block", icon: Code2 },
    ],
  },
];

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState("palette");

  function scrollTo(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="h-screen flex flex-col bg-moria-900 text-moria-300">
      <div className="border-b border-moria-700 bg-moria-800 px-6 py-3 flex items-center gap-3 shrink-0">
        <span className="text-moria-400 text-sm font-semibold">doriath</span>
        <span className="text-moria-700">/</span>
        <span className="text-moria-500 text-sm">component showcase</span>
        <span className="ml-auto text-xs text-moria-700 font-mono">pine · sage · 38 components</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar sections={DEV_SIDEBAR} activeId={activeSection} onSelect={scrollTo} />

        <main className="flex-1 overflow-y-auto scrollbar-hide px-10 py-10">
          <div className="max-w-3xl mx-auto space-y-14">

            <Section id="palette" title="Palette" description="Color tokens from @theme in tokens.css">
              <div className="space-y-4">
                <Row label="moria scale — 900 (bg) → 300 (text)">
                  <div className="flex gap-2 flex-wrap">
                    {(["900","800","700","600","500","400","300"] as const).map((n) => (
                      <div key={n} className="flex flex-col items-center gap-1">
                        <div
                          className="w-10 h-10 rounded border border-moria-700"
                          style={{ background: `var(--color-moria-${n})` }}
                        />
                        <span className="text-xs text-moria-500 font-mono">{n}</span>
                      </div>
                    ))}
                  </div>
                </Row>
                <Row label="semantic">
                  <div className="flex gap-2 flex-wrap">
                    {([
                      ["var(--color-lift-positive)", "positive"],
                      ["var(--color-lift-neutral)",  "neutral"],
                      ["var(--color-lift-warning)",  "warning"],
                      ["var(--color-lift-negative)", "negative"],
                      ["var(--color-accent)",        "accent"],
                    ] as const).map(([color, label]) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded" style={{ background: color }} />
                        <span className="text-xs text-moria-500 font-mono">{label}</span>
                      </div>
                    ))}
                  </div>
                </Row>
              </div>
            </Section>

            <Section id="typography" title="Typography">
              <div className="space-y-2">
                <div className="text-2xl font-semibold text-moria-300">Lift Analysis</div>
                <div className="text-base text-moria-300">County-level behavioral tag correlation</div>
                <div className="text-sm text-moria-500">3,142 entities · arda schema</div>
                <div className="text-xs text-moria-500 font-mono">air_quality:pm25:exceeds_annual_standard</div>
              </div>
            </Section>

            <Section id="card" title="Card">
              <CardExamples />
            </Section>

            <Section id="sidebar" title="Sidebar">
              <SidebarExamples />
            </Section>

            <Section id="buttons" title="Buttons">
              <ButtonsExamples />
            </Section>

            <Section id="pill" title="Pill">
              <PillExamples />
            </Section>

            <Section id="toggle" title="Toggle">
              <ToggleExamples />
            </Section>

            <Section id="tabs" title="Tabs">
              <TabsExamples />
            </Section>

            <Section id="checkbox" title="Checkbox">
              <CheckboxExamples />
            </Section>

            <Section id="radio" title="Radio">
              <RadioExamples />
            </Section>

            <Section id="slider" title="Slider">
              <SliderExamples />
            </Section>

            <Section id="pagination" title="Pagination">
              <PaginationExamples />
            </Section>

            <Section id="snackbar" title="Snackbar">
              <SnackbarExamples />
            </Section>

            <Section id="alert" title="Alert" description="Inline contextual feedback">
              <AlertExamples />
            </Section>

            <Section id="tooltip" title="Tooltip">
              <TooltipExamples />
            </Section>

            <Section id="modal" title="Modal">
              <ModalExamples />
            </Section>

            <Section id="text-input" title="Text input">
              <TextInputExamples />
            </Section>

            <Section id="number-input" title="Number input">
              <NumberInputExamples />
            </Section>

            <Section id="password-input" title="Password input">
              <PasswordInputExamples />
            </Section>

            <Section id="phone-input" title="Phone input">
              <PhoneInputExamples />
            </Section>

            <Section id="url-input" title="URL input">
              <UrlInputExamples />
            </Section>

            <Section id="date-input" title="Date input">
              <DateInputExamples />
            </Section>

            <Section id="search-input" title="Search input">
              <SearchInputExamples />
            </Section>

            <Section id="textarea" title="Textarea">
              <TextareaExamples />
            </Section>

            <Section id="dropdown" title="Dropdown">
              <DropdownExamples />
            </Section>

            <Section id="combobox" title="Combobox" description="Searchable single-select">
              <ComboboxExamples />
            </Section>

            <Section id="multi-select" title="Multi-select" description="Searchable, multiple selection">
              <MultiSelectExamples />
            </Section>

            <Section id="tag-input" title="Tag input" description="Freeform inline tag entry">
              <TagInputExamples />
            </Section>

            <Section id="stat-card" title="Stat card">
              <StatCardExamples />
            </Section>

            <Section id="table" title="Table">
              <DataTableExamples />
            </Section>

            <Section id="progress" title="Progress">
              <ProgressExamples />
            </Section>

            <Section id="skeleton" title="Skeleton">
              <SkeletonExamples />
            </Section>

            <Section id="empty-state" title="Empty state">
              <EmptyStateExamples />
            </Section>

            <Section id="breadcrumbs" title="Breadcrumbs">
              <BreadcrumbsExamples />
            </Section>

            <Section id="accordion" title="Accordion">
              <AccordionExamples />
            </Section>

            <Section id="code-block" title="Code block">
              <CodeBlockExamples />
            </Section>

          </div>
        </main>
      </div>
    </div>
  );
}

// ── Examples ───────────────────────────────────────────────────────────────────

const SIDEBAR_NAV: SidebarNavSection[] = [
  {
    id: "project",
    label: "Project",
    defaultOpen: true,
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
  {
    id: "analysis",
    label: "Analysis",
    defaultOpen: true,
    items: [
      {
        id: "lift",
        label: "Lift Explorer",
        icon: TrendingUp,
        children: [
          {
            id: "lift-table",
            label: "Table view",
            children: [
              { id: "lift-table-all",      label: "All entities" },
              { id: "lift-table-filtered", label: "Filtered" },
            ],
          },
          { id: "lift-chart", label: "Chart view" },
        ],
      },
      {
        id: "tags",
        label: "Tag Browser",
        icon: Tag,
        children: [
          { id: "tags-all",    label: "All tags" },
          { id: "tags-groups", label: "By group" },
        ],
      },
      { id: "entities", label: "Entity Map", icon: MapPin },
    ],
  },
  {
    id: "data",
    label: "Data",
    defaultOpen: true,
    items: [
      { id: "sources", label: "Sources", icon: Database },
      {
        id: "models",
        label: "Models",
        icon: Layers,
        children: [
          { id: "models-staging",      label: "Staging" },
          { id: "models-intermediate", label: "Intermediate" },
          { id: "models-marts",        label: "Marts" },
        ],
      },
    ],
  },
];

function SidebarExamples() {
  const [activeId, setActiveId] = useState("overview");
  return (
    <div className="border border-moria-700 rounded-xl overflow-hidden flex" style={{ height: 480 }}>
      <Sidebar sections={SIDEBAR_NAV} activeId={activeId} onSelect={setActiveId} />
      <div className="flex-1 p-6 bg-moria-900 flex flex-col gap-1.5">
        <div className="text-xs font-mono text-moria-500">active</div>
        <div className="text-sm font-mono text-moria-300">{activeId}</div>
      </div>
    </div>
  );
}

function CardExamples() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="Title only" />
      <Card title="Title and subtitle" subtitle="Optional supporting line beneath the title" />
      <Card title="Title and body">
        <p className="text-sm text-moria-400">
          Body content goes here. Any children are rendered inside the padded body region.
        </p>
      </Card>
      <Card title="Lift result" subtitle="air_quality:pm25:exceeds_annual_standard">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-moria-500">Entities qualified</span>
            <span className="text-moria-300 font-mono">847</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-moria-500">Lift score</span>
            <span className="font-mono" style={{ color: "var(--color-lift-positive)" }}>+2.34</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-moria-500">p-value</span>
            <span className="text-moria-300 font-mono">0.0012</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ButtonsExamples() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="destructive">Destructive</Button>
      <GhostButton>Ghost</GhostButton>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
  );
}

function SnackbarExamples() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: "",
    variant: "default",
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show(message: string, variant: SnackbarVariant) {
    if (timer.current) clearTimeout(timer.current);
    setSnackbar({ visible: true, message, variant });
    timer.current = setTimeout(() => setSnackbar(s => ({ ...s, visible: false })), 3000);
  }

  function dismiss() {
    if (timer.current) clearTimeout(timer.current);
    setSnackbar(s => ({ ...s, visible: false }));
  }

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <Button variant="secondary"    onClick={() => show("Changes saved", "default")}>Default</Button>
        <Button variant="primary"      onClick={() => show("Saved successfully", "success")}>Success</Button>
        <Button variant="warning"      onClick={() => show("Review required before proceeding", "warning")}>Warning</Button>
        <Button variant="destructive"  onClick={() => show("Failed to delete item", "destructive")}>Destructive</Button>
      </div>
      <Snackbar state={snackbar} onDismiss={dismiss} />
    </>
  );
}

function CheckboxExamples() {
  const [a, setA] = useState<CheckState>("off");
  const [b, setB] = useState<CheckState>("on");
  const [c, setC] = useState<CheckState>("some");

  return (
    <div className="space-y-6">
      <Row label="states">
        <div className="flex flex-col gap-3">
          <Checkbox state="off"  onChange={() => {}} label="Unchecked" />
          <Checkbox state="on"   onChange={() => {}} label="Checked" />
          <Checkbox state="some" onChange={() => {}} label="Indeterminate" />
        </div>
      </Row>
      <Row label="interactive">
        <div className="flex flex-col gap-3">
          <Checkbox state={a} onChange={setA} label="Toggle me" />
          <Checkbox state={b} onChange={setB} label="Also toggleable" />
          <Checkbox state={c} onChange={setC} label="Starts indeterminate — click to clear" />
        </div>
      </Row>
      <Row label="disabled">
        <div className="flex flex-col gap-3">
          <Checkbox state="off" onChange={() => {}} label="Disabled off" disabled />
          <Checkbox state="on"  onChange={() => {}} label="Disabled on"  disabled />
        </div>
      </Row>
    </div>
  );
}

function PasswordInputExamples() {
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="default">
        <PasswordInput />
      </Row>
      <Row label="with label">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Password</span>
          <PasswordInput placeholder="Enter your password" />
        </label>
      </Row>
      <Row label="disabled">
        <PasswordInput disabled />
      </Row>
    </div>
  );
}

function NumberInputExamples() {
  const [a, setA] = useState<number | "">(42);
  const [b, setB] = useState<number | "">(1);
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="default">
        <NumberInput value={a} onChange={setA} placeholder="0" />
      </Row>
      <Row label="with min / max / step">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Confidence threshold (%)</span>
          <NumberInput value={b} onChange={setB} min={1} max={100} step={5} />
        </label>
      </Row>
      <Row label="disabled">
        <NumberInput value={99} onChange={() => {}} disabled />
      </Row>
    </div>
  );
}

function TextInputExamples() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="default">
        <TextInput value={a} onChange={setA} placeholder="Placeholder text" />
      </Row>
      <Row label="with label">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Qualifier tag</span>
          <TextInput value={b} onChange={setB} placeholder="e.g. air_quality:pm25:exceeds_annual_standard" />
        </label>
      </Row>
      <Row label="disabled">
        <TextInput value="" onChange={() => {}} placeholder="Not available" disabled />
      </Row>
    </div>
  );
}

const SCHEMA_OPTIONS: DropdownOption[] = [
  { value: "arda",     label: "arda — Political & geospatial" },
  { value: "weather",  label: "weather — Climate data" },
  { value: "economic", label: "economic — Economic indicators" },
  { value: "health",   label: "health — Public health" },
];

const ENTITY_OPTIONS: DropdownOption[] = [
  { value: "county",   label: "County" },
  { value: "district", label: "Congressional district" },
  { value: "state",    label: "State" },
  { value: "zip",      label: "ZIP code" },
];

function DropdownExamples() {
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>("county");
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="no selection">
        <Dropdown options={SCHEMA_OPTIONS} value={a} onChange={setA} placeholder="Select schema…" />
      </Row>
      <Row label="with selection">
        <Dropdown options={ENTITY_OPTIONS} value={b} onChange={setB} />
      </Row>
      <Row label="with label">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Entity type</span>
          <Dropdown options={ENTITY_OPTIONS} value={b} onChange={setB} />
        </label>
      </Row>
      <Row label="disabled">
        <Dropdown options={ENTITY_OPTIONS} value="county" onChange={() => {}} disabled />
      </Row>
    </div>
  );
}

function PillExamples() {
  const [tags, setTags] = useState(["air_quality", "election", "broadband"]);
  return (
    <div className="space-y-6">
      <Row label="variants">
        <div className="flex flex-wrap gap-2">
          <Pill label="default" />
          <Pill label="positive" variant="positive" />
          <Pill label="warning"  variant="warning" />
          <Pill label="negative" variant="negative" />
        </div>
      </Row>
      <Row label="domain labels">
        <div className="flex flex-wrap gap-2">
          <Pill label="air_quality"      variant="positive" />
          <Pill label="election"         variant="default" />
          <Pill label="campaign_finance" variant="warning" />
          <Pill label="flood_risk"       variant="negative" />
          <Pill label="broadband"        variant="default" />
        </div>
      </Row>
      <Row label="removable">
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Pill key={tag} label={tag} onRemove={() => setTags(ts => ts.filter(t => t !== tag))} />
          ))}
          {tags.length === 0 && (
            <button
              type="button"
              onClick={() => setTags(["air_quality", "election", "broadband"])}
              className="text-xs text-moria-500 hover:text-moria-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </Row>
    </div>
  );
}

interface LiftRow {
  id: string;
  tag: string;
  group: string;
  entities: number;
  lift: number;
  pValue: number;
}

const LIFT_ROWS: LiftRow[] = [
  { id: "1", tag: "air_quality:pm25:exceeds_annual_standard",      group: "air_quality",      entities: 847,  lift:  2.34, pValue: 0.0012 },
  { id: "2", tag: "election:presidential_turnout:below_median",    group: "election",         entities: 1203, lift:  1.87, pValue: 0.0045 },
  { id: "3", tag: "flood_risk:gauge:exceeded_action_stage",        group: "flood_risk",       entities: 312,  lift:  1.54, pValue: 0.0189 },
  { id: "4", tag: "broadband:fcc:below_25mbps_majority",           group: "broadband",        entities: 891,  lift: -0.67, pValue: 0.0823 },
  { id: "5", tag: "campaign_finance:fossil_fuel_pac:top_quartile", group: "campaign_finance", entities: 412,  lift: -1.23, pValue: 0.0321 },
  { id: "6", tag: "food_access:usda:food_desert",                  group: "food_access",      entities: 267,  lift:  0.12, pValue: 0.4521 },
];

const LIFT_COLUMNS: DataTableColumn<LiftRow>[] = [
  {
    key: "tag",
    header: "Tag",
    sortable: true,
    render: row => <span className="font-mono text-xs">{row.tag}</span>,
  },
  {
    key: "group",
    header: "Group",
    sortable: true,
    render: row => <Pill label={row.group} />,
  },
  {
    key: "entities",
    header: "Entities",
    align: "right",
    sortable: true,
    render: row => row.entities.toLocaleString(),
  },
  {
    key: "lift",
    header: "Lift",
    align: "right",
    sortable: true,
    render: row => (
      <span
        className="font-mono font-medium"
        style={{
          color: row.lift >  0.5 ? "var(--color-lift-positive)" :
                 row.lift < -0.5 ? "var(--color-lift-negative)" :
                                   "var(--color-lift-neutral)",
        }}
      >
        {row.lift > 0 ? "+" : ""}{row.lift.toFixed(2)}
      </span>
    ),
  },
  {
    key: "pValue",
    header: "p-value",
    align: "right",
    sortable: true,
    render: row => <span className="font-mono text-moria-500">{row.pValue.toFixed(4)}</span>,
  },
];

function DataTableExamples() {
  return <DataTable columns={LIFT_COLUMNS} rows={LIFT_ROWS} />;
}

function SearchInputExamples() {
  const [a, setA] = useState("");
  const [b, setB] = useState("pm25");
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="default">
        <SearchInput value={a} onChange={setA} />
      </Row>
      <Row label="with value — shows clear button">
        <SearchInput value={b} onChange={setB} />
      </Row>
      <Row label="with label">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Filter tags</span>
          <SearchInput value={a} onChange={setA} placeholder="Search tags…" />
        </label>
      </Row>
      <Row label="disabled">
        <SearchInput value="" onChange={() => {}} disabled />
      </Row>
    </div>
  );
}

function TextareaExamples() {
  const [a, setA] = useState("");
  const [b, setB] = useState("Counties with high PM2.5 readings that also show above-median campaign contributions from fossil fuel PACs.");
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="default">
        <Textarea value={a} onChange={setA} placeholder="Enter a description…" />
      </Row>
      <Row label="with value">
        <Textarea value={b} onChange={setB} />
      </Row>
      <Row label="with label">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Query notes</span>
          <Textarea value={a} onChange={setA} placeholder="Describe what you're analysing…" rows={3} />
        </label>
      </Row>
      <Row label="disabled">
        <Textarea value="Read-only content." onChange={() => {}} disabled />
      </Row>
    </div>
  );
}

function ToggleExamples() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  const [c, setC] = useState(false);
  return (
    <div className="space-y-6">
      <Row label="states">
        <div className="flex gap-6">
          <Toggle checked={false} onChange={() => {}} />
          <Toggle checked={true}  onChange={() => {}} />
        </div>
      </Row>
      <Row label="interactive with labels">
        <div className="flex flex-col gap-3">
          <Toggle checked={a} onChange={setA} label="Normalise by population" />
          <Toggle checked={b} onChange={setB} label="Show confidence interval" />
          <Toggle checked={c} onChange={setC} label="Include incomplete data" />
        </div>
      </Row>
      <Row label="disabled">
        <div className="flex flex-col gap-3">
          <Toggle checked={false} onChange={() => {}} label="Disabled off" disabled />
          <Toggle checked={true}  onChange={() => {}} label="Disabled on"  disabled />
        </div>
      </Row>
    </div>
  );
}

const VIEW_TABS: TabItem[] = [
  { id: "table", label: "Table", icon: Table2 },
  { id: "chart", label: "Chart", icon: TrendingUp },
  { id: "map",   label: "Map",   icon: MapPin },
];

function TabsExamples() {
  const [a, setA] = useState("table");
  const [b, setB] = useState("overview");
  return (
    <div className="space-y-8">
      <Row label="with icons">
        <div className="space-y-3">
          <TabBar tabs={VIEW_TABS} activeId={a} onChange={setA} />
          <div className="px-1 text-xs font-mono text-moria-500">active: {a}</div>
        </div>
      </Row>
      <Row label="text only">
        <TabBar
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "details",  label: "Details" },
            { id: "history",  label: "History" },
          ]}
          activeId={b}
          onChange={setB}
        />
      </Row>
    </div>
  );
}

function TooltipExamples() {
  return (
    <div className="space-y-8">
      <Row label="on text">
        <p className="text-sm text-moria-400">
          Lift score measures how much more likely a behaviour is among{" "}
          <Tooltip content="Entities matching your qualifier tag">
            <span className="border-b border-dashed border-moria-500 cursor-default">qualified entities</span>
          </Tooltip>
          {" "}compared to the overall population.
        </p>
      </Row>
      <Row label="on icon buttons">
        <div className="flex gap-3">
          {([
            ["Sort ascending",  ArrowUp],
            ["Sort descending", ArrowDown],
            ["More options",    MoreHorizontal],
          ] as const).map(([label, Icon]) => (
            <Tooltip key={label} content={label}>
              <button className="flex items-center justify-center h-8 w-8 rounded-lg text-moria-500 hover:text-moria-300 hover:bg-moria-700 transition-colors">
                <Icon size={15} strokeWidth={2} />
              </button>
            </Tooltip>
          ))}
        </div>
      </Row>
      <Row label="on a pill">
        <Tooltip content="15% opacity background, full-opacity text">
          <Pill label="positive" variant="positive" />
        </Tooltip>
      </Row>
    </div>
  );
}

function ModalExamples() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen]       = useState(false);
  const [queryName, setQueryName]     = useState("");
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Delete query</Button>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete query?"
        footer={
          <>
            <Button variant="secondary"   onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(false)}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-moria-400">
          This will permanently delete the saved query and cannot be undone.
        </p>
      </Modal>

      <Button variant="primary" onClick={() => setFormOpen(true)}>Save query</Button>
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Save query"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="primary"   onClick={() => setFormOpen(false)}>Save</Button>
          </>
        }
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Query name</span>
          <TextInput
            value={queryName}
            onChange={setQueryName}
            placeholder="e.g. PM2.5 × fossil fuel PAC"
          />
        </label>
      </Modal>
    </div>
  );
}

function PaginationExamples() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(7);
  return (
    <div className="space-y-6">
      <Row label="few pages">
        <Pagination page={a} totalPages={5} onChange={setA} />
      </Row>
      <Row label="many pages — ellipsis">
        <Pagination page={b} totalPages={24} onChange={setB} />
      </Row>
    </div>
  );
}

function ProgressExamples() {
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="determinate">
        <div className="space-y-3">
          <ProgressBar value={25} />
          <ProgressBar value={60} />
          <ProgressBar value={100} />
        </div>
      </Row>
      <Row label="with labels">
        <div className="space-y-4">
          <ProgressBar value={3}  max={5}  label="Ingesting sources" />
          <ProgressBar value={12} max={47} label="Running dbt models" />
        </div>
      </Row>
      <Row label="indeterminate">
        <ProgressBar indeterminate label="Fetching EPA AQS data…" />
      </Row>
    </div>
  );
}

function SkeletonExamples() {
  return (
    <div className="space-y-8">
      <Row label="text lines">
        <div className="max-w-sm">
          <SkeletonText lines={4} />
        </div>
      </Row>
      <Row label="card">
        <div className="max-w-xs">
          <SkeletonCard />
        </div>
      </Row>
      <Row label="table rows">
        <div className="rounded-xl border border-moria-700 overflow-hidden">
          <div className="bg-moria-800 border-b border-moria-700 px-4 py-3">
            <Skeleton className="h-3 w-48" />
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b border-moria-700 last:border-b-0">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
}

function EmptyStateExamples() {
  return (
    <div className="space-y-4">
      <Row label="no results">
        <div className="rounded-xl border border-moria-700 bg-moria-900">
          <EmptyState
            icon={Search}
            title="No matching tags"
            description="Try a different search term or remove some filters."
          />
        </div>
      </Row>
      <Row label="no data loaded">
        <div className="rounded-xl border border-moria-700 bg-moria-900">
          <EmptyState
            icon={Inbox}
            title="No lift results yet"
            description="Select a qualifier and goal tag to run your first lift analysis."
            action={<Button variant="primary">Run analysis</Button>}
          />
        </div>
      </Row>
    </div>
  );
}

function DateInputExamples() {
  const [a, setA] = useState("");
  const [b, setB] = useState("2024-11-05");
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="empty">
        <DateInput value={a} onChange={setA} label="Start date" />
      </Row>
      <Row label="with value">
        <DateInput value={b} onChange={setB} label="Election day" />
      </Row>
      <Row label="disabled">
        <DateInput value="2024-01-01" disabled label="Locked date" />
      </Row>
    </div>
  );
}

const TAG_OPTIONS: ComboOption[] = [
  { value: "air_quality:pm25:exceeds_annual_standard",      label: "PM2.5 — exceeds annual standard" },
  { value: "air_quality:ozone:exceeds_standard",            label: "Ozone — exceeds standard" },
  { value: "election:presidential_turnout:below_median",    label: "Presidential turnout — below median" },
  { value: "election:margin:competitive",                   label: "Election margin — competitive" },
  { value: "campaign_finance:fossil_fuel_pac:top_quartile", label: "Fossil fuel PAC — top quartile" },
  { value: "campaign_finance:renewable_pac:top_quartile",   label: "Renewable PAC — top quartile" },
  { value: "flood_risk:gauge:exceeded_action_stage",        label: "Flood risk — exceeded action stage" },
  { value: "broadband:fcc:below_25mbps_majority",           label: "Broadband — below 25 Mbps majority" },
  { value: "food_access:usda:food_desert",                  label: "Food access — USDA food desert" },
];

function ComboboxExamples() {
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>("election:margin:competitive");
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="empty">
        <Combobox options={TAG_OPTIONS} value={a} onChange={setA} placeholder="Select goal tag…" />
      </Row>
      <Row label="with selection">
        <Combobox options={TAG_OPTIONS} value={b} onChange={setB} placeholder="Select goal tag…" />
      </Row>
      <Row label="disabled">
        <Combobox options={TAG_OPTIONS} value="flood_risk:gauge:exceeded_action_stage" onChange={() => {}} disabled />
      </Row>
    </div>
  );
}

function MultiSelectExamples() {
  const [a, setA] = useState<string[]>([]);
  const [b, setB] = useState<string[]>(["air_quality:pm25:exceeds_annual_standard", "election:margin:competitive"]);
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="empty">
        <MultiSelect options={TAG_OPTIONS} value={a} onChange={setA} placeholder="Select qualifier tags…" />
      </Row>
      <Row label="with selections">
        <MultiSelect options={TAG_OPTIONS} value={b} onChange={setB} placeholder="Select qualifier tags…" />
      </Row>
      <Row label="side by side — qualifiers + goal">
        <div className="flex gap-3">
          <div className="flex-1">
            <MultiSelect options={TAG_OPTIONS} value={b} onChange={setB} placeholder="Qualifiers (any)" />
          </div>
          <div className="flex-1">
            <Combobox options={TAG_OPTIONS} value={a[0] ?? null} onChange={v => setA(v ? [v] : [])} placeholder="Goal tag" />
          </div>
        </div>
      </Row>
      <Row label="disabled">
        <MultiSelect options={TAG_OPTIONS} value={["flood_risk:gauge:exceeded_action_stage"]} onChange={() => {}} disabled />
      </Row>
    </div>
  );
}

function TagInputExamples() {
  const [a, setA] = useState<string[]>([]);
  const [b, setB] = useState<string[]>(["county", "fips", "arda"]);
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="empty — press Enter or comma to add">
        <TagInput value={a} onChange={setA} placeholder="Type a label and press Enter…" />
      </Row>
      <Row label="with tags — Backspace removes last">
        <TagInput value={b} onChange={setB} />
      </Row>
    </div>
  );
}

function SliderExamples() {
  const [a, setA] = useState(40);
  const [b, setB] = useState(75);
  const [r, setR] = useState<[number, number]>([20, 70]);
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="single — lift threshold">
        <Slider value={a} onChange={setA} min={0} max={100} />
      </Row>
      <Row label="single with step">
        <Slider value={b} onChange={setB} min={0} max={100} step={5} />
      </Row>
      <Row label="range — min/max filter">
        <RangeSlider value={r} onChange={setR} min={0} max={100} />
      </Row>
      <Row label="disabled">
        <Slider value={60} disabled />
      </Row>
    </div>
  );
}

function AlertExamples() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <div className="space-y-3 max-w-lg">
      <Alert variant="info"        title="Lift analysis pending"   description="Results will appear once the ETL pipeline completes its next run." />
      <Alert variant="success"     title="Model materialised"      description="arda.behaviors refreshed — 3,142 entities, 41,805 tag rows." />
      <Alert variant="warning"     title="Stale data"              description="EPA AQS hasn't synced in 48 hours. Lift scores may not reflect current conditions." />
      <Alert variant="destructive" title="Query failed"            description={'relation "arda.behaviors" does not exist — run the ETL pipeline first.'} />
      {!dismissed && (
        <Alert
          variant="info"
          title="Dismissible alert"
          description="Click the × to close this banner."
          onDismiss={() => setDismissed(true)}
        />
      )}
      {dismissed && (
        <button className="text-xs text-moria-500 hover:text-moria-300 transition-colors" onClick={() => setDismissed(false)}>
          Reset
        </button>
      )}
    </div>
  );
}

function StatCardExamples() {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-lg">
      <StatCard label="Entities"   value="3,142"  icon={MapPin}    delta={0}   deltaLabel="vs last run" />
      <StatCard label="Behaviors"  value="41,805" icon={Tag}       delta={4.2} deltaLabel="new tags" />
      <StatCard label="Lift score" value="2.41×"  icon={TrendingUp} delta={12}  deltaLabel="vs baseline" />
      <StatCard label="Data lag"   value="48 h"   icon={Database}  delta={-8}  deltaLabel="improved" />
    </div>
  );
}

function BreadcrumbsExamples() {
  return (
    <div className="space-y-5 max-w-lg">
      <Row label="project navigation">
        <Breadcrumbs items={[
          { label: "Home", icon: Home },
          { label: "Arda" },
          { label: "Lift analysis" },
          { label: "Table view" },
        ]} />
      </Row>
      <Row label="short — two levels">
        <Breadcrumbs items={[
          { label: "Home", icon: Home },
          { label: "Settings" },
        ]} />
      </Row>
    </div>
  );
}

function AccordionExamples() {
  const items: AccordionItemDef[] = [
    {
      id: "what-is-lift",
      title: "What is lift?",
      defaultOpen: true,
      content: (
        <p>
          Lift measures how much more (or less) likely an entity is to have a <em>goal</em> behavior
          given that it already has one or more <em>qualifier</em> behaviors. A lift score of 2.0×
          means the goal appears twice as often among qualifying entities as in the general population.
        </p>
      ),
    },
    {
      id: "qualifiers",
      title: "What are qualifiers?",
      content: (
        <p>
          Qualifiers filter the population before calculating lift. You can stack multiple qualifiers —
          Moria applies them as an intersection (AND logic). For example: counties with high PM2.5
          <em> and</em> below-median broadband.
        </p>
      ),
    },
    {
      id: "reading-scores",
      title: "How do I read lift scores?",
      content: (
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-moria-400">&gt; 1.0×</strong> — goal is more likely in the qualified group</li>
          <li><strong className="text-moria-400">= 1.0×</strong> — no correlation; qualified group matches baseline</li>
          <li><strong className="text-moria-400">&lt; 1.0×</strong> — goal is less likely in the qualified group</li>
        </ul>
      ),
    },
  ];
  return (
    <div className="max-w-lg">
      <Accordion items={items} />
    </div>
  );
}

const LIFT_SQL = `-- lift.sql — generated by Moria configurator
with
  population as (
    select count(distinct entity_id) as n
    from arda.behaviors
  ),

  qualified as (
    select entity_id
    from arda.behaviors
    where tag = 'air_quality:pm25:exceeds_annual_standard'
    intersect
    select entity_id
    from arda.behaviors
    where tag = 'election:margin:competitive'
  ),

  goal as (
    select entity_id
    from arda.behaviors
    where tag = 'flood_risk:gauge:exceeded_action_stage'
  )

select
  count(distinct q.entity_id)                          as qualified_n,
  count(distinct g.entity_id)                          as goal_n,
  round(
    count(distinct g.entity_id)::numeric
    / nullif(count(distinct q.entity_id), 0)
    / (
      select count(distinct entity_id)::numeric
      from goal
    ) * (select n from population), 4
  )                                                     as lift
from qualified q
left join goal g using (entity_id);`;

const DBT_SQL = `-- models/marts/behaviors.sql
{{
  config(
    materialized = 'table',
    schema       = 'arda'
  )
}}

select
  e.entity_id,
  b.tag,
  b.tag_label,
  b.tag_group,
  b.value
from {{ ref('int_county_air_quality') }}  b
join {{ ref('entities') }}               e using (entity_id)

union all

select
  e.entity_id,
  b.tag,
  b.tag_label,
  b.tag_group,
  b.value
from {{ ref('int_county_election') }} b
join {{ ref('entities') }}            e using (entity_id)`;

function CodeBlockExamples() {
  return (
    <div className="space-y-5 max-w-2xl">
      <Row label="generated lift SQL">
        <CodeBlock code={LIFT_SQL} language="sql" title="lift query — arda" />
      </Row>
      <Row label="dbt model">
        <CodeBlock code={DBT_SQL} language="sql" title="models/marts/behaviors.sql" />
      </Row>
    </div>
  );
}

function UrlInputExamples() {
  const [a, setA] = useState("");
  const [b, setB] = useState("https://moria.example.com/project/arda");
  const [c, setC] = useState("not a url");
  const [d, setD] = useState("");
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="default — type to validate">
        <UrlInput value={a} onChange={setA} />
      </Row>
      <Row label="valid">
        <UrlInput value={b} onChange={setB} />
      </Row>
      <Row label="invalid">
        <UrlInput value={c} onChange={setC} />
      </Row>
      <Row label="with label">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Data source endpoint</span>
          <UrlInput value={d} onChange={setD} placeholder="https://api.example.com" />
        </label>
      </Row>
      <Row label="disabled">
        <UrlInput value="" onChange={() => {}} disabled />
      </Row>
    </div>
  );
}

const AGGREGATION_OPTIONS: RadioOption[] = [
  { value: "county",   label: "County" },
  { value: "district", label: "Congressional district" },
  { value: "state",    label: "State" },
];

function RadioExamples() {
  const [a, setA] = useState("county");
  return (
    <div className="space-y-6">
      <Row label="interactive">
        <RadioGroup options={AGGREGATION_OPTIONS} value={a} onChange={setA} />
      </Row>
      <Row label="disabled">
        <RadioGroup options={AGGREGATION_OPTIONS} value="district" onChange={() => {}} disabled />
      </Row>
    </div>
  );
}

function PhoneInputExamples() {
  return (
    <div className="space-y-6 max-w-sm">
      <Row label="default — US">
        <PhoneInput />
      </Row>
      <Row label="with label">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-moria-500">Phone number</span>
          <PhoneInput />
        </label>
      </Row>
      <Row label="disabled">
        <PhoneInput disabled />
      </Row>
    </div>
  );
}

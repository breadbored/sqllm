import * as react_jsx_runtime from 'react/jsx-runtime';
import { LucideIcon } from 'lucide-react';
import React$1 from 'react';

type SidebarIcon = LucideIcon;
interface SidebarNavItem {
    id: string;
    label: string;
    icon?: SidebarIcon;
    children?: SidebarNavItem[];
}
interface SidebarNavSection {
    id: string;
    label: string;
    defaultOpen?: boolean;
    items: SidebarNavItem[];
}
interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: SidebarIcon;
}
interface TabItem {
    id: string;
    label: string;
    icon?: SidebarIcon;
}
interface AccordionItemDef {
    id: string;
    title: string;
    content: React.ReactNode;
    defaultOpen?: boolean;
}
type CheckState = "off" | "on" | "some";
type PillVariant = "default" | "positive" | "warning" | "negative";
type AlertVariant = "info" | "success" | "warning" | "destructive";
type SnackbarVariant = "default" | "success" | "warning" | "destructive";
interface SnackbarState {
    visible: boolean;
    message: string;
    variant: SnackbarVariant;
}
interface DropdownOption {
    value: string;
    label: string;
}
interface ComboOption {
    value: string;
    label: string;
}
interface DataTableColumn<T> {
    key: string;
    header: string;
    align?: "left" | "right";
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
}
interface RadioOption {
    value: string;
    label: string;
}
interface PhoneCountry {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
    maxDigits: number;
    format: (digits: string) => string;
}

declare function Accordion({ items, className }: {
    items: AccordionItemDef[];
    className?: string;
}): react_jsx_runtime.JSX.Element;

declare function Alert({ variant, title, description, onDismiss, }: {
    variant?: AlertVariant;
    title?: string;
    description?: string;
    onDismiss?: () => void;
}): react_jsx_runtime.JSX.Element;

declare function Breadcrumbs({ items }: {
    items: BreadcrumbItem[];
}): react_jsx_runtime.JSX.Element;

type ButtonVariant = "primary" | "secondary" | "warning" | "destructive";
declare function Button({ variant, children, onClick, disabled, type, }: {
    variant?: ButtonVariant;
    children: React$1.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}): react_jsx_runtime.JSX.Element;
declare function GhostButton({ children, onClick, type, }: {
    children: React$1.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
}): react_jsx_runtime.JSX.Element;

declare function Card({ title, subtitle, children, }: {
    title: string;
    subtitle?: string;
    children?: React$1.ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function Checkbox({ state, onChange, label, disabled, }: {
    state: CheckState;
    onChange: (next: CheckState) => void;
    label?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function CodeBlock({ code, language, title, }: {
    code: string;
    language?: string;
    title?: string;
}): react_jsx_runtime.JSX.Element;

declare function Combobox({ options, value, onChange, placeholder, disabled, }: {
    options: ComboOption[];
    value: string | null;
    onChange: (v: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function DataTable<T extends {
    id: string | number;
}>({ columns, rows, }: {
    columns: DataTableColumn<T>[];
    rows: T[];
}): react_jsx_runtime.JSX.Element;

declare function DateInput({ value, onChange, disabled, label, }: {
    value: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
    label?: string;
}): react_jsx_runtime.JSX.Element;

declare function Dropdown({ options, value, onChange, placeholder, disabled, }: {
    options: DropdownOption[];
    value: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function EmptyState({ icon: Icon, title, description, action, }: {
    icon?: SidebarIcon;
    title: string;
    description?: string;
    action?: React$1.ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function Modal({ open, onClose, title, children, footer, }: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React$1.ReactNode;
    footer?: React$1.ReactNode;
}): react_jsx_runtime.JSX.Element | null;

declare function MultiSelect({ options, value, onChange, placeholder, disabled, }: {
    options: ComboOption[];
    value: string[];
    onChange: (v: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function NumberInput({ value, onChange, min, max, step, placeholder, disabled, }: {
    value: number | "";
    onChange: (v: number | "") => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Pagination({ page, totalPages, onChange, }: {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}): react_jsx_runtime.JSX.Element;

declare function PasswordInput({ placeholder, disabled, }: {
    placeholder?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function PhoneInput({ defaultCountry, disabled, }: {
    defaultCountry?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Pill({ label, variant, onRemove, }: {
    label: string;
    variant?: PillVariant;
    onRemove?: () => void;
}): react_jsx_runtime.JSX.Element;

declare function ProgressBar({ value, max, label, indeterminate, }: {
    value?: number;
    max?: number;
    label?: string;
    indeterminate?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function RadioGroup({ options, value, onChange, disabled, }: {
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function SearchInput({ value, onChange, placeholder, disabled, }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Sidebar({ sections, activeId, onSelect, }: {
    sections: SidebarNavSection[];
    activeId?: string;
    onSelect?: (id: string) => void;
}): react_jsx_runtime.JSX.Element;

declare function Skeleton({ className }: {
    className?: string;
}): react_jsx_runtime.JSX.Element;
declare function SkeletonText({ lines }: {
    lines?: number;
}): react_jsx_runtime.JSX.Element;
declare function SkeletonCard(): react_jsx_runtime.JSX.Element;

declare function Slider({ value, onChange, min, max, step, disabled, showValue, }: {
    value: number;
    onChange?: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    showValue?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function RangeSlider({ value, onChange, min, max, step, }: {
    value: [number, number];
    onChange?: (v: [number, number]) => void;
    min?: number;
    max?: number;
    step?: number;
}): react_jsx_runtime.JSX.Element;

declare function Snackbar({ state, onDismiss }: {
    state: SnackbarState;
    onDismiss: () => void;
}): react_jsx_runtime.JSX.Element;

declare function StatCard({ label, value, delta, deltaLabel, icon: Icon, }: {
    label: string;
    value: string | number;
    delta?: number;
    deltaLabel?: string;
    icon?: SidebarIcon;
}): react_jsx_runtime.JSX.Element;

declare function TabBar({ tabs, activeId, onChange, }: {
    tabs: TabItem[];
    activeId: string;
    onChange: (id: string) => void;
}): react_jsx_runtime.JSX.Element;

declare function TagInput({ value, onChange, placeholder, }: {
    value: string[];
    onChange: (v: string[]) => void;
    placeholder?: string;
}): react_jsx_runtime.JSX.Element;

declare function Textarea({ value, onChange, placeholder, rows, disabled, }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function TextInput({ value, onChange, placeholder, disabled, type, }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: "text" | "email";
}): react_jsx_runtime.JSX.Element;

declare function Toggle({ checked, onChange, label, disabled, }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Tooltip({ content, children, }: {
    content: string;
    children: React$1.ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function UrlInput({ value, onChange, placeholder, disabled, }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

export { Accordion, type AccordionItemDef, Alert, type AlertVariant, type BreadcrumbItem, Breadcrumbs, Button, Card, type CheckState, Checkbox, CodeBlock, type ComboOption, Combobox, DataTable, type DataTableColumn, DateInput, Dropdown, type DropdownOption, EmptyState, GhostButton, Modal, MultiSelect, NumberInput, Pagination, PasswordInput, type PhoneCountry, PhoneInput, Pill, type PillVariant, ProgressBar, RadioGroup, type RadioOption, RangeSlider, SearchInput, Sidebar, type SidebarIcon, type SidebarNavItem, type SidebarNavSection, Skeleton, SkeletonCard, SkeletonText, Slider, Snackbar, type SnackbarState, type SnackbarVariant, StatCard, TabBar, type TabItem, TagInput, TextInput, Textarea, Toggle, Tooltip, UrlInput };

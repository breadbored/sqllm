import { type LucideIcon } from "lucide-react";

export type SidebarIcon = LucideIcon;

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: SidebarIcon;
  children?: SidebarNavItem[];
}

export interface SidebarNavSection {
  id: string;
  label: string;
  defaultOpen?: boolean;
  items: SidebarNavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: SidebarIcon;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: SidebarIcon;
}

export interface AccordionItemDef {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export type CheckState = "off" | "on" | "some";

export type PillVariant = "default" | "positive" | "warning" | "negative";

export type AlertVariant = "info" | "success" | "warning" | "destructive";

export type SnackbarVariant = "default" | "success" | "warning" | "destructive";

export interface SnackbarState {
  visible: boolean;
  message: string;
  variant: SnackbarVariant;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface ComboOption {
  value: string;
  label: string;
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface RadioOption {
  value: string;
  label: string;
}

export interface PhoneCountry {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  maxDigits: number;
  format: (digits: string) => string;
}

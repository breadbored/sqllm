import type { TableColumn, TableRow } from "./types";

/** Map raw BigQuery INFORMATION_SCHEMA columns to the simple TableColumn format. */
export function toTableColumns(raw: TableRow["table_columns"]): TableColumn[] {
  return raw
    .filter((c) => c.is_hidden !== "YES" && c.is_system_defined !== "YES")
    .map((c) => ({ name: c.column_name, type: c.data_type }));
}

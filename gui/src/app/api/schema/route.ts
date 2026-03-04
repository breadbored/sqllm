import { NextRequest, NextResponse } from "next/server";
import { getBigQueryClient } from "@/lib/bigquery";
import { toTableColumns } from "@/lib/schema";
import type { TableRow } from "@/lib/types";
import { TableInformationSchema } from "@/types/tables";

/**
 * GET /api/schema?table=<name>
 *
 * Used by the model's <fetch_schema> request flow.
 * Returns TableColumn[] for a specific table, or 404 with name suggestions.
 */
export async function GET(req: NextRequest) {
  const table = req.nextUrl.searchParams.get("table");

  if (!table) {
    return NextResponse.json(
      { error: "table param required" },
      { status: 400 },
    );
  }

  const bigquery = getBigQueryClient();
  const query = `
    SELECT
      info.table_catalog as project_id,
      info.table_schema  as dataset_id,
      info.table_name    as table_name,
      ARRAY_AGG(
        JSON_OBJECT(
          'column_name', info.column_name,
          'nullable', info.is_nullable,
          'data_type', info.data_type,
          'is_generated', info.is_generated,
          'is_stored', info.is_stored,
          'is_hidden', info.is_hidden,
          'is_updatable', info.is_updatable,
          'is_system_defined', info.is_system_defined,
          'clustering_ordinal_position', info.clustering_ordinal_position,
          'collation_name', info.collation_name,
          'column_default', info.column_default,
          'rounding_mode', info.rounding_mode
        )
        IGNORE NULLS
      ) as table_columns
    FROM dev_staging.INFORMATION_SCHEMA.COLUMNS as info
    WHERE info.table_name = @table
    GROUP BY project_id, dataset_id, table_name
  `;

  const [data] = await bigquery.query({ query, params: { table } });
  const rows = (data as Array<TableInformationSchema>).map((row) => {
    row.table_columns = row.table_columns.map((col) => {
      if (typeof col === "string") {
        return JSON.parse(col);
      }
      return col;
    });
    return row;
  });

  console.log("[DEBUG]", rows);

  const columns = toTableColumns((rows[0] as TableRow).table_columns);
  return NextResponse.json(columns);
}

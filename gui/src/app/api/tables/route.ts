import { NextRequest, NextResponse } from "next/server";
import type { TableRow } from "@/lib/types";
import { getBigQueryClient } from "@/lib/bigquery";
import { TableInformationSchema } from "@/types/tables";

/**
 * GET /api/tables?dataset=<dataset>&q=<query>
 *
 * Returns a list of tables matching the search query.
 * In production, queries BigQuery INFORMATION_SCHEMA.TABLES.
 * Currently returns mock data — replace with real BigQuery client.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").toLowerCase();

  const bigquery = getBigQueryClient();

  const query = `
    SELECT
      info.table_catalog as project_id,
      info.table_schema as dataset_id,
      info.table_name as table_name,
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
    FROM
      dev_staging.INFORMATION_SCHEMA.COLUMNS as info
    GROUP BY
      project_id,
      dataset_id,
      table_name
  `;

  const [rows] = await bigquery.query({ query });
  const data = rows as Array<TableInformationSchema>;

  const results =
    q && q !== "" ? data.filter((t) => t.table_name.includes(q)) : data;

  return NextResponse.json(results);
}

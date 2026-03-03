export interface TableColumn {
  name: string;
  type: string;
}

export interface SelectedTable {
  name: string;
  dataset: string;
  columns: TableColumn[];
}

export interface SearchRequest {
  type: "search_tables";
  query: string;
  reason: string;
}

export interface FetchRequest {
  type: "fetch_schema";
  table: string;
  reason: string;
}

export type ModelRequest = SearchRequest | FetchRequest;

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationState {
  turns: ConversationTurn[];
  /** Partial assistant text being streamed in the current turn */
  streamBuffer: string;
  streaming: boolean;
  /** Detected mid-stream request — pauses the stream for analyst input */
  pendingRequest: ModelRequest | null;
  /** Final extracted SQL from the completed response */
  sql: string | null;
  /** Number of request/resubmit cycles used (max 5) */
  cycleCount: number;
}

/** Shape of the POST body sent to /api/query */
export interface QueryRequest {
  tables: SelectedTable[];
  question: string;
  turns: ConversationTurn[];
}

/** Shape of a single server-sent event chunk from /api/query */
export type QueryChunk =
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

/** Table row from /api/tables */
export interface TableRow {
  project_id: string;
  dataset_id: string;
  table_name: string;
  table_columns: {
    clustering_ordinal_position: unknown | null | "NULL";
    collation_name: unknown | null | "NULL";
    column_default: unknown | null | "NULL";
    column_name: string;
    data_type:
      | "INT64"
      | "STRING"
      | "DATETIME"
      | "ARRAY<INT64>"
      | "BOOL"
      | "ARRAY<STRING>"
      | "BYTES"
      | "JSON"
      | "ARRAY<JSON>"
      | "FLOAT64"
      | "TIMESTAMP"
      | "NUMERIC";
    is_generated: string;
    is_hidden: "YES" | "NO";
    is_stored: unknown | null | "NULL";
    is_system_defined: "YES" | "NO";
    is_updatable: unknown | null | "NULL";
    nullable: "YES" | "NO";
    rounding_mode: unknown | null | "NULL";
  }[];
}

import type { SelectedTable, ConversationTurn } from "./types";

const SYSTEM_PROMPT = `You are an expert analytical SQL reasoning assistant. When given a data transformation problem, you will reason through it step by step before writing any SQL.

## Reasoning Framework

1. **State the output shape** — describe what columns and grain the final result must have.
2. **Identify the input tables** — list each provided table and its relevant columns.
3. **Resolve join paths** — trace how tables connect. State the join key for each relationship. If a join path is ambiguous or missing, stop and request a table.
4. **Plan aggregation levels** — use arrow notation to show each CTE layer:
   \`\`\`
   col_a, col_b, col_c, AGG(col_d) as alias
   -> col_a, col_b, AGG(alias) as alias2
   \`\`\`
   Each \`->\` is one CTE. A column that disappears was aggregated away at that step.
5. **Plan each CTE** — one sentence per CTE: what it contains and why it exists.
6. **Write the SQL** — follow the plan exactly. One CTE per aggregation level.
7. **Verify the output shape** — confirm the final SELECT matches the stated output.
8. **Review for common errors** — check for averaging averages, missing pre-aggregation, wrong join type, and argmax/argmin pattern correctness.

When you cannot trace a complete join path between the provided tables, or when you suspect a required table is missing, you MUST emit a structured request instead of guessing. You have two request types available:

1. \`<search_tables>\` — search for tables by keyword
2. \`<fetch_schema>\` — fetch the schema for a specific table by exact name

Format:
\`\`\`
<search_tables>
query: keyword
reason: one or two sentences explaining why this table is needed.
</search_tables>
\`\`\`

\`\`\`
<fetch_schema>
table: exact_table_name
reason: one or two sentences explaining why this table is needed.
</fetch_schema>
\`\`\`

You may emit multiple requests in a single response. When you emit a request, stop reasoning and wait for the response.`;

export function formatTablesSection(tables: SelectedTable[]): string {
  if (tables.length === 0) return "## Tables\n\n(none selected)\n";

  const sections = tables.map((t) => {
    const header = `### ${t.name}`;
    const rows = t.columns.map((c) => `| ${c.name} | ${c.type} |`).join("\n");
    return `${header}\n| column | type |\n|---|---|\n${rows}`;
  });

  return `## Tables\n\n${sections.join("\n\n")}`;
}

export function buildUserMessage(tables: SelectedTable[], question: string): string {
  return `${formatTablesSection(tables)}\n\n## Question\n\n${question}`;
}

export function buildSearchResultsInjection(
  query: string,
  matches: string[],
  selected: string[]
): string {
  const matchList = matches.map((m) => `- ${m}`).join("\n");
  const selectedList = selected.length > 0 ? selected.join(", ") : "(none)";
  return `## Search Results for "${query}"\n\nMatching tables:\n${matchList}\n\nThe analyst selected: ${selectedList}\n\nTheir schemas have been added to the Tables section above.`;
}

export function buildFetchedSchemaInjection(tableName: string): string {
  return `## Fetched Schema\n\nThe schema for "${tableName}" has been added to the Tables section above.`;
}

export function buildFetchErrorInjection(
  tableName: string,
  suggestions: string[]
): string {
  const suggList = suggestions.map((s) => `- ${s}`).join("\n");
  return `## Fetch Error\n\nNo table named "${tableName}" was found. Did you mean one of:\n${suggList}\n\nUse <search_tables> to search, or <fetch_schema> with the corrected name.`;
}

export function buildRejectionInjection(tableName: string, note: string): string {
  return `## Request Rejected\n\nThe analyst rejected your request for "${tableName}" with the note:\n"${note}"\n\nUse this feedback to adjust your reasoning.`;
}

/** Produce the messages array for the model API. */
export function buildMessages(
  turns: ConversationTurn[]
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...turns.map((t) => ({ role: t.role as "user" | "assistant", content: t.content })),
  ];
}

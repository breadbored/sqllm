# SQLLM GUI — Orchestration and Interaction System

## What This Is

A GUI application that mediates between an analyst and the SQLLM model. The
analyst selects tables, describes a data question, and the orchestration layer
constructs a fully-grounded prompt with schemas. The model reasons through the
problem and produces SQL. If the model identifies missing context, it emits
structured requests that the orchestration layer intercepts and surfaces to the
analyst.

The model never fetches data. The model never calls APIs. The model receives
context and produces reasoning. Everything else is application code.

---

## Architecture

```
Analyst (GUI)
    |
    v
Orchestration Layer
    |-- BigQuery INFORMATION_SCHEMA (schema source)
    |-- Prompt Builder (assembles model input)
    |-- Response Parser (detects structured requests)
    |
    v
SQLLM Model (reasoning + SQL generation)
```

---

## Prompt Format

Every prompt sent to the model follows this structure exactly. The model is
trained to expect this format. Do not deviate from it.

```
--- SYSTEM ---

You are an expert analytical SQL reasoning assistant. When given a data
transformation problem, you will reason through it step by step before writing
any SQL.

[full reasoning framework from training — the 8-step structure]

When you cannot trace a complete join path between the provided tables, or when
you suspect a required table is missing, you MUST emit a structured request
instead of guessing. You have two request types available:

1. <search_tables> — search for tables by keyword
2. <fetch_schema> — fetch the schema for a specific table by exact name

You may emit multiple requests in a single response. You may emit requests at
any point during your reasoning. When you emit a request, stop reasoning and
wait for the response.

--- USER ---

## Tables

### agg_transactions
| column | type |
|---|---|
| user_id | INT64 |
| created | TIMESTAMP |
| amount | FLOAT64 |
| course_id | INT64 |

### stg_users
| column | type |
|---|---|
| id | INT64 |
| created | TIMESTAMP |
| external_client_id | INT64 |

## Question

For each day, show the number of total active users, returning users, and new
users based on transaction activity. A "new" user is one whose account was
created on the same day as the transaction.
```

The `## Tables` section is assembled by the orchestration layer from
INFORMATION_SCHEMA metadata. The `## Question` section is the analyst's natural
language input. The model sees both together as a single prompt.

---

## Structured Request Format

### Search for tables by keyword

When the model needs to find a table but does not know its exact name, it emits:

```
<search_tables>
query: course_lesson
reason: I need a table that maps courses to lessons to resolve the join
       path from courses to individual lesson records. No provided table
       contains both course_id and lesson_id.
</search_tables>
```

**Fields:**
- `query` (required): A substring or keyword to match against table names in
  the dataset. The orchestration layer performs a case-insensitive contains
  match against all table names visible to the current project.
- `reason` (required): One or two sentences explaining why this table is needed.
  This is displayed to the analyst in the GUI so they can evaluate whether the
  request is valid.

**Orchestration behavior:**

1. Parse the `query` value from the tag.
2. Query BigQuery `INFORMATION_SCHEMA.TABLES` for table names containing the
   query string (case-insensitive).
3. Return at most 20 matching table names to the GUI.
4. The analyst selects zero or more tables from the results.
5. For each selected table, the orchestration layer fetches its schema and
   appends it to the `## Tables` section.
6. The prompt is resubmitted to the model with the additional tables included.

**Response format injected into the resubmitted prompt:**

```
## Search Results for "course_lesson"

Matching tables:
- course_lessons
- course_lesson_progress
- course_lesson_resources
- stg_course_lessons

The analyst selected: course_lessons, course_lesson_progress

Their schemas have been added to the Tables section above.
```

### Fetch schema for a specific table

When the model knows the exact table name (e.g., from a foreign key convention
or a previous search result) and needs its schema, it emits:

```
<fetch_schema>
table: course_lessons
reason: This table was returned in the search results and likely contains
       the course_id and lesson_id mapping I need to complete the join chain.
</fetch_schema>
```

**Fields:**
- `table` (required): The exact table name. Must match a table in the dataset.
  If the name does not match, the orchestration layer returns an error and
  suggests the analyst use a search instead.
- `reason` (required): One or two sentences explaining why this table is needed.
  Displayed to the analyst.

**Orchestration behavior:**

1. Parse the `table` value from the tag.
2. Query BigQuery `INFORMATION_SCHEMA.COLUMNS` for that exact table name.
3. If found: display the schema to the analyst for confirmation. On approval,
   append the schema to the `## Tables` section and resubmit the prompt.
4. If not found: inject an error message into the prompt and resubmit.

**Response format on success (injected into resubmitted prompt):**

```
## Fetched Schema

The schema for "course_lessons" has been added to the Tables section above.
```

**Response format on failure:**

```
## Fetch Error

No table named "course_lesson" was found. Did you mean one of:
- course_lessons
- stg_course_lessons

Use <search_tables> to search, or <fetch_schema> with the corrected name.
```

---

## GUI Components

### Table Selector

Before submitting a question, the analyst selects tables from a searchable list
of all tables in the active BigQuery project/dataset. The orchestration layer
fetches schemas for all selected tables and assembles the `## Tables` section.

This is the primary way tables enter the prompt. The model's `<search_tables>`
and `<fetch_schema>` requests are fallbacks for when the analyst missed a table.

### Question Input

Free-text input for the analyst's data question. No specific format required.
The orchestration layer inserts it into the `## Question` section of the prompt.

### Reasoning Display

The model's full reasoning trace is displayed in the GUI as it streams. If the
response parser detects a `<search_tables>` or `<fetch_schema>` tag, it:

1. Pauses the stream.
2. Displays the request with the model's `reason` field to the analyst.
3. For `<search_tables>`: executes the search, displays results, lets the
   analyst select tables.
4. For `<fetch_schema>`: displays the fetched schema for confirmation.
5. On analyst approval, resubmits the prompt with additional context.

The analyst can also reject a request (e.g., "no, that table doesn't exist" or
"you don't need that") — in which case an explicit rejection message is injected
into the resubmitted prompt so the model adjusts its approach.

**Rejection format:**

```
## Request Rejected

The analyst rejected your request for "course_lesson_progress" with the note:
"That table tracks daily snapshots, not cumulative progress. You want
user_course_lesson_progress instead."

Use this feedback to adjust your reasoning.
```

### SQL Output

The final SQL block from the model's response is extracted and displayed in a
dedicated panel with syntax highlighting. The analyst can copy, edit, or execute
it directly against BigQuery from the GUI.

---

## Training Data Implications

Training samples for the SQLLM model must reflect this interaction format:

1. **Standard samples** — complete schemas provided, model reasons straight
   through to SQL. These are the majority of training data.

2. **Search request samples** — schemas are deliberately incomplete. The model
   identifies the gap and emits `<search_tables>`. The training example includes
   the resubmitted prompt with additional tables and the completed reasoning.

3. **Fetch request samples** — the model knows or infers a table name and emits
   `<fetch_schema>`. Same structure as above.

4. **Rejection samples** — the model requests a table, the analyst rejects it
   with a correction, and the model adjusts. These teach the model to recover
   from wrong assumptions.

Aim for roughly:
- 80% standard samples (schema complete, no requests)
- 10% search request samples
- 5% fetch request samples
- 5% rejection/recovery samples

---

## Orchestration Layer Responsibilities

- Fetch table schemas from `INFORMATION_SCHEMA.COLUMNS` and format them as
  markdown tables in the prompt
- Assemble the full prompt from system message + tables + question
- Parse model output for `<search_tables>` and `<fetch_schema>` tags
- Execute search/fetch requests against BigQuery metadata
- Manage the resubmission loop (prompt -> model -> request -> analyst -> prompt)
- Track conversation state so resubmitted prompts include prior context
- Enforce a maximum of 5 request/resubmission cycles per question to prevent
  infinite loops

The orchestration layer is application code. It does not use the model for any
of these operations. Schema fetching is a metadata query. Table search is a
string match. Prompt assembly is template concatenation. Keep it simple.

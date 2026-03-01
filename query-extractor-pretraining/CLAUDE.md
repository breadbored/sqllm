# SQLLM Reasoning Extractor

Takes a directory of `.sqlx` files, sends each one to Opus 4.6 via `claude -p`,
and asks it to reverse-engineer a SQLLM reasoning trace for the query. Output is
a single append-only JSONL file of training records in standard chat format,
compatible with Unsloth/QLoRA fine-tuning.

The key distinction from the working-copy generator: Opus is **not solving
problems from scratch**. It is given a validated, human-written SQL query and
asked to articulate the reasoning a SQL analyst would follow to arrive at it.
This produces accurate reasoning traces because the answer is already known —
Opus cannot choose the wrong aggregation approach or wrong dialect pattern.

---

## Project Structure

```
~/sqllm/reasoning-extractor/
├── src/
│   └── main.ts               # main script
├── system-prompt.txt         # SQLLM reasoning system prompt (shared with working-copy)
├── extraction-prompt.txt     # instruction given to Opus alongside each sqlx file
├── output/
│   └── training_data.jsonl   # append-only output, one record per sqlx file
├── CLAUDE.md
├── package.json
└── tsconfig.json
```

---

## How It Works

1. Script accepts a directory path as a CLI argument
2. Recursively walks the directory finding all `*.sqlx` files
3. For each file, checks whether it has already been processed by looking up its
   relative path in a `.processed` state file — if found, skips it
4. Strips the Dataform `config { ... }` block from the top of each file before
   sending to Opus, as it is boilerplate and not part of the SQL reasoning
5. Sends the system prompt + extraction prompt + raw SQL to Opus via `claude -p`
6. Parses the response and appends a JSONL record to `output/training_data.jsonl`
7. Marks the file as processed in `.processed`

The `.processed` file makes runs resume-safe — interrupted batches can be
restarted without re-processing completed files or duplicating records.

---

## File Roles

**`system-prompt.txt`** — the full SQLLM reasoning system prompt, identical to
the one used in the working-copy generator. Defines the notation and the 8-step
reasoning structure Opus must follow.

**`extraction-prompt.txt`** — the per-file instruction template. Tells Opus that
it is being given a finished, validated SQL query and must write the reasoning
trace an analyst would follow to produce it. Must instruct Opus not to modify the
SQL, and to produce the natural-language user prompt as part of the output.

**`output/training_data.jsonl`** — append-only. Each line is a JSON object with:
```json
{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "natural language description of the problem" },
    { "role": "assistant", "content": "full reasoning trace + SQL" }
  ],
  "source_file": "relative/path/to/file.sqlx"
}
```
The `source_file` field is metadata — not part of the fine-tuning format but
useful for debugging and tracing which SQL produced which training record.

**`.processed`** — newline-separated list of relative file paths that have been
successfully processed. Created automatically. Do not edit manually.

---

## Setup

```bash
npm install
npm install --save-dev ts-node typescript @types/node
```

Requires Claude Code to be installed and authenticated with a Max subscription.

---

## Running

```bash
npx ts-node src/main.ts <path-to-sqlx-directory> [output-file]
```

`output-file` defaults to `output/training_data.jsonl` if not specified.

Examples:

```bash
# process all sqlx files under a dataform project
npx ts-node src/main.ts ~/projects/my-dataform-project

# write to a specific output file
npx ts-node src/main.ts ~/projects/my-dataform-project output/my_project.jsonl
```

The script logs each file as it is processed, skipped, or errored. Errors on
individual files do not stop the run — they are logged and the file is not marked
as processed, so it will be retried on the next run.

---

## Extraction Prompt Guidelines

The `extraction-prompt.txt` should instruct Opus to:

1. Write a short natural-language user prompt describing what the query produces,
   as if a developer were asking for it — this becomes the `user` turn in the
   training record
2. Then write the full 8-step SQLLM reasoning trace as the `assistant` turn
3. Include the original SQL verbatim at step 7 (compose the final query) — do
   not paraphrase or rewrite it
4. If the query has multiple UNION ALL branches, reason about the shared CTE
   structure first, then explain each branch's tag/variant logic separately
5. Not invent schema details not present in the SQL — if a column's purpose is
   unclear, describe it structurally rather than guessing its business meaning

The output format Opus must return so the script can parse it:

```
--- USER PROMPT ---
<natural language description>
--- ASSISTANT RESPONSE ---
<full reasoning trace + SQL>
```

---

## Notes

- `--model claude-haiku-4-5` is hardcoded — do not change to a cheaper model
- The Dataform `config { ... }` block is stripped before sending to Opus because
  it is identical boilerplate across all files and adds no reasoning value
- `${ref("table_name")}` references are left intact — Opus understands them as
  table references and they carry useful naming context
- Rate limiting: the script adds a 2s delay between calls. Increase this in
  `src/main.ts` if you see errors on large directories
- The `.processed` file uses relative paths so the project is portable — moving
  the sqlx directory will invalidate the state file

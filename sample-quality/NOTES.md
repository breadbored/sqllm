This is a thorough audit. Here's the summary:
---
Training Data Quality Audit — Key Findings

CRITICAL: No schema in any user prompt (100% of files)

Not a single sample provides table schemas or column definitions in the user prompt. The agent response references specific columns
(sub_session_id, action_meta, course_progress_percentage) that appear nowhere in the prompt. This trains the model to confidently
fabricate column names — the exact hallucination failure mode you're worried about.

The reasoning samples (1912+) partially mitigate this by listing assumed schemas in Step 1, but the training signal is still "guess
the schema, then reason about it" rather than "reason about the provided schema."

HIGH: Two patterns dominate ~40% of the dataset

- COALESCE client_ids pattern — 85 files (21%) all teach the same COALESCE(cc.client_ids, [1]) AS client_ids enrichment with trivial
variation
- Bucket behavioral tagging — ~63 files teach identical SELECT sub_session_id, '<event>' as tag, 'behavior' as class with only the
event name string changing

HIGH: Vague "Show me" prompts (population 1)

~139 files use "Show me an example of..." prompts that are interchangeable. Files 1720 and 1725 have nearly identical prompts but
produce different SQL — the only disambiguator is the # source: comment, which won't exist at inference time.

MEDIUM: Trivial samples waste training signal

~30-40 files are simple SELECT * WHERE or single-filter queries. File 1995 applies the full 8-step reasoning framework to SELECT *
FROM ${ref("all_events")}.

LOW: SQL correctness issues

- Files 1714-1726: redundant WHERE name != 'x' AND name = 'y' clauses
- File 1800: suspect clientId IN (SELECT * FROM uc.client_id) syntax
- File 1725: missing code fence

---
Recommendations (priority order)

1. Add schemas to user prompts. This is the single most impactful fix. Even minimal inline schemas like Tables:
agg_transactions(created TIMESTAMP, user_id INT64), stg_users(id INT64, created TIMESTAMP) would eliminate the hallucination training
signal.
2. Deduplicate aggressively. Cut the COALESCE client_ids pattern from 85 to ~5-10 examples (varying join depths). Cut bucket tagging
from ~63 to ~3-5 examples. You're burning 40% of your training budget teaching two trivial patterns.
3. Rewrite population 1 prompts to be deterministic — specific enough that only one correct SQL answer exists. The "Show me an
example" framing teaches the model that any plausible SQL is acceptable.
4. Remove or simplify trivial samples. Don't apply the 8-step reasoning framework to SELECT * queries. Either drop them or use a
lighter format.
5. Fix SQL errors in files 1714-1726 and 1800.

Want me to start on any of these — e.g., generating schema-enriched user prompts, or identifying the exact files to deduplicate?

# SQLLM — Executive Summary

## What It Is

SQLLM is a domain-specific language model fine-tuned to reason about and generate
analytical SQL queries. It is not a general-purpose coding assistant. Its target
competency is the class of problems that require multi-level aggregation, complex
join resolution, and data reshaping — the kind of queries that take an experienced
analyst significant time to reason through correctly.

The model is designed to accept a natural language description of a data
transformation problem, reason through it step by step using a structured
pseudocode notation, and produce correct SQL as the output of that reasoning
process rather than as a first-pass guess.

---

## The Problem It Solves

Existing LLMs produce SQL that is syntactically plausible but structurally wrong
for complex analytical problems. Common failure modes include:

- Averaging averages instead of carrying aggregate components
- Collapsing multi-level aggregation into a single GROUP BY
- Choosing the wrong join strategy for indirect table relationships
- Using verbose or incorrect patterns for argmax/argmin (e.g. ARRAY_AGG structs
  instead of MAX_BY)
- Failing to recognize when a pre-aggregation CTE is required before a join can
  be expressed

These failures are not fixable by prompt engineering alone. They reflect a gap
between how frontier models were trained — on broad SQL corpora — and the
specific reasoning patterns required for analytical data work.

---

## The Approach

SQLLM is trained on reasoning traces, not just SQL. Each training example teaches
the model to:

1. Identify the input and output data shapes explicitly
2. Resolve table relationships and join strategies before writing any SQL
3. Express the full aggregation plan in a structured arrow notation that maps
   directly to CTE layers
4. Plan and justify each CTE before writing it
5. Verify the output shape matches the stated target

This reasoning-first approach means the model externalizes its working memory
into the context window, compensating for the capacity limitations of a 12B
parameter student model on problems that would otherwise require larger models
to hold the full transformation plan implicitly.

---

## The Notation

The core artifact of SQLLM is a pseudocode notation for describing multi-level
aggregation problems. Each level maps to one CTE, and arrows separate levels:

```
user_id, course_id, lesson_id, MAX(progress_seconds) as lesson_progress
-> user_id, course_id, SUM(lesson_progress) as course_progress
```

A column that disappears after `->` was aggregated away at that step. Aliases
chain by name across levels. The number of arrows equals the number of CTEs
required. This notation forces the model to commit to the aggregation structure
before writing SQL, which is where most analytical query errors originate.

---

## The Training Pipeline

Training data is produced in three stages:

**Stage 1 — Human seed examples**
Experienced analysts write 50-100 high-quality reasoning traces by hand, covering
the core decision points: weighted aggregation, argmax identity, pre-aggregation
join dependencies, window functions, and session-window correlation. These
establish the ground truth for what correct reasoning looks like.

**Stage 2 — Opus reasoning extraction**
Existing validated SQL queries are sent to Claude Opus alongside the reasoning
framework. Opus reverse-engineers the reasoning trace for each query — a more
reliable task than generating SQL from scratch, since the correct answer is
already known. These traces are reviewed and used to fine-tune an intermediate
Qwen3.5:27B model.

**Stage 3 — Synthetic volume generation**
The fine-tuned Qwen3.5:27B model, running locally via Ollama, generates 50k-100k
training examples at zero marginal cost. These are used to fine-tune the final
student model.

---

## The Student Model

The target student model is `Qwen2.5-Coder-12B` fine-tuned with QLoRA. At INT4
quantization it fits within 16GB VRAM, making it feasible to run locally on
consumer hardware. Its training goal is not to match frontier model SQL quality
across all domains — it is to reliably apply the SQLLM reasoning pattern to
analytical SQL problems involving multi-level aggregation and complex joins.

---

## Intended Use Cases

**Internal analytics** — data mining queries against proprietary event tracking
schemas, behavioral tagging systems, and learning platform data warehouses.

**Client data work** — correlating user session events from third-party trackers
(PostHog, GA4, Datadog, Sentry) with transactional data using session-window
join patterns.

**Lift analysis and data mining** — generating population-level behavioral tags,
segmentation queries, and conversion analysis queries that follow consistent
structural patterns across different client schemas.

**Reasoning assistance** — helping analysts break down complex reshaping problems
into CTE layers before writing any SQL, using the arrow notation as a planning
tool independent of the final model output.

---

## What It Is Not

SQLLM is not a replacement for an experienced SQL analyst. It is a reasoning
accelerator for problems the analyst already understands. It does not handle
schema discovery, data quality assessment, or business logic interpretation. It
assumes the analyst knows what question they are asking and needs help expressing
the answer in correctly structured SQL.

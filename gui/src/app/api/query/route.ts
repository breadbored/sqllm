import { NextRequest } from "next/server";
import { buildMessages } from "@/lib/prompt";
import type { QueryRequest } from "@/lib/types";

/**
 * POST /api/query
 *
 * Streams model output as newline-delimited JSON chunks.
 * Each line is a QueryChunk: { type: "delta", text } | { type: "done" } | { type: "error", message }
 *
 * The model endpoint is configured via SQLLM_API_URL and SQLLM_API_KEY env vars.
 * It must be an OpenAI-compatible chat completions endpoint.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as QueryRequest;
  const { tables, question, turns } = body;

  // Build conversation — if this is the first turn, create the initial user message
  const allTurns =
    turns.length === 0
      ? [
          {
            role: "user" as const,
            content: (await import("@/lib/prompt")).buildUserMessage(
              tables,
              question,
            ),
          },
        ]
      : turns;

  const messages = buildMessages(allTurns);

  const apiUrl =
    process.env.SQLLM_API_URL ??
    "http://100.123.65.9:11434/v1/chat/completions";
  const apiKey = process.env.SQLLM_API_KEY ?? "ollama";
  const model = "sqllm"; // process.env.SQLLM_MODEL ?? "sqllm";

  let upstream: Response;
  try {
    upstream = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to connect to model API";
    return new Response(
      JSON.stringify({
        type: "error",
        message,
        where: "Failed in a try/catch",
      }) + "\n",
      {
        status: 502,
        headers: { "Content-Type": "application/x-ndjson" },
      },
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text();
    console.log("[DEBUG]", text);
    return new Response(
      JSON.stringify({
        type: "error",
        message: `Model API error: ${upstream.status} ${text}`,
        where: "Failed in a response",
      }) + "\n",
      { status: 502, headers: { "Content-Type": "application/x-ndjson" } },
    );
  }

  // Proxy the SSE stream from the model, re-emitting as ndjson chunks
  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();

      function emit(chunk: object) {
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
      }

      try {
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (typeof delta === "string") {
                emit({ type: "delta", text: delta });
              }
            } catch {
              // malformed SSE line — skip
            }
          }
        }
        emit({ type: "done" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        emit({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
    },
  });
}

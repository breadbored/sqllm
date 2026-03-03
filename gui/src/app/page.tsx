"use client";

import { useCallback, useRef, useState } from "react";
import { TableSelector } from "@/components/TableSelector";
import { QuestionInput } from "@/components/QuestionInput";
import { ReasoningDisplay } from "@/components/ReasoningDisplay";
import { SqlOutput } from "@/components/SqlOutput";
import {
  buildUserMessage,
  buildSearchResultsInjection,
  buildFetchedSchemaInjection,
  buildFetchErrorInjection,
  buildRejectionInjection,
  formatTablesSection,
} from "@/lib/prompt";
import { extractRequest, extractSql, isStreamMidRequest } from "@/lib/parser";
import type {
  ConversationState,
  ConversationTurn,
  ModelRequest,
  QueryChunk,
  SelectedTable,
} from "@/lib/types";

const MAX_CYCLES = 5;

export default function Home() {
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationState | null>(null);
  // Keep a mutable ref so the stream handler can always read the latest state
  const convRef = useRef<ConversationState | null>(null);

  function setConv(updater: (prev: ConversationState) => ConversationState) {
    setConversation((prev) => {
      const next = updater(prev!);
      convRef.current = next;
      return next;
    });
  }

  // Stream a request to /api/query, appending deltas to streamBuffer
  const runStream = useCallback(
    async (turns: ConversationTurn[], tables: SelectedTable[]) => {
      setConv((prev) => ({
        ...prev,
        streaming: true,
        streamBuffer: "",
        pendingRequest: null,
      }));

      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables, question, turns }),
      });

      if (!res.ok || !res.body) {
        setConv((prev) => ({ ...prev, streaming: false }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let chunk: QueryChunk;
          try {
            chunk = JSON.parse(line);
          } catch {
            continue;
          }

          if (chunk.type === "delta") {
            fullText += chunk.text;
            setConv((prev) => ({ ...prev, streamBuffer: fullText }));

            // Check for a complete request tag mid-stream
            if (!isStreamMidRequest(fullText)) {
              const request = extractRequest(fullText);
              if (request) {
                // Pause: surface the request to the analyst
                const assistantTurn: ConversationTurn = {
                  role: "assistant",
                  content: fullText,
                };
                setConv((prev) => ({
                  ...prev,
                  streaming: false,
                  streamBuffer: fullText,
                  pendingRequest: request,
                  turns: [...prev.turns, assistantTurn],
                }));
                return;
              }
            }
          } else if (chunk.type === "done") {
            const sql = extractSql(fullText);
            const assistantTurn: ConversationTurn = {
              role: "assistant",
              content: fullText,
            };
            setConv((prev) => ({
              ...prev,
              streaming: false,
              streamBuffer: fullText,
              pendingRequest: null,
              sql,
              turns: [...prev.turns, assistantTurn],
            }));
            return;
          } else if (chunk.type === "error") {
            setConv((prev) => ({ ...prev, streaming: false }));
            return;
          }
        }
      }

      // Stream ended without a "done" chunk — finalize anyway
      const sql = extractSql(fullText);
      const assistantTurn: ConversationTurn = { role: "assistant", content: fullText };
      setConv((prev) => ({
        ...prev,
        streaming: false,
        streamBuffer: fullText,
        pendingRequest: null,
        sql,
        turns: [...prev.turns, assistantTurn],
      }));
    },
    [question]
  );

  // Submit the initial question
  function handleSubmit() {
    const userMessage = buildUserMessage(selectedTables, question);
    const userTurn: ConversationTurn = { role: "user", content: userMessage };
    const initialState: ConversationState = {
      turns: [userTurn],
      streamBuffer: "",
      streaming: false,
      pendingRequest: null,
      sql: null,
      cycleCount: 0,
    };
    setConversation(initialState);
    convRef.current = initialState;
    runStream([userTurn], selectedTables);
  }

  // Analyst approved a model request — add the new tables, inject context, resubmit
  function handleRequestApprove(additionalTables: SelectedTable[]) {
    const current = convRef.current;
    if (!current?.pendingRequest) return;
    if (current.cycleCount >= MAX_CYCLES) return;

    const request: ModelRequest = current.pendingRequest;
    const allTables = [
      ...selectedTables.filter(
        (t) => !additionalTables.find((a) => a.name === t.name)
      ),
      ...additionalTables,
    ];
    setSelectedTables(allTables);

    let injection: string;
    if (request.type === "search_tables") {
      const selectedNames = additionalTables.map((t) => t.name);
      const allMatches = additionalTables.map((t) => t.name);
      injection = buildSearchResultsInjection(request.query, allMatches, selectedNames);
    } else {
      const found = additionalTables.length > 0;
      injection = found
        ? buildFetchedSchemaInjection(request.table)
        : buildFetchErrorInjection(request.table, []);
    }

    // Rebuild the tables section with the new schemas
    const updatedTablesSection = formatTablesSection(allTables);
    const injectionTurn: ConversationTurn = {
      role: "user",
      content: `${updatedTablesSection}\n\n${injection}`,
    };
    const newTurns = [...current.turns, injectionTurn];

    setConv((prev) => ({
      ...prev,
      turns: newTurns,
      pendingRequest: null,
      cycleCount: prev.cycleCount + 1,
    }));

    runStream(newTurns, allTables);
  }

  // Analyst rejected a model request — inject rejection message, resubmit
  function handleRequestReject(note: string) {
    const current = convRef.current;
    if (!current?.pendingRequest) return;
    if (current.cycleCount >= MAX_CYCLES) return;

    const request: ModelRequest = current.pendingRequest;
    const tableName =
      request.type === "search_tables" ? request.query : request.table;
    const injection = buildRejectionInjection(tableName, note || "(no note provided)");

    const rejectionTurn: ConversationTurn = { role: "user", content: injection };
    const newTurns = [...current.turns, rejectionTurn];

    setConv((prev) => ({
      ...prev,
      turns: newTurns,
      pendingRequest: null,
      cycleCount: prev.cycleCount + 1,
    }));

    runStream(newTurns, selectedTables);
  }

  return (
    <div className="flex h-screen bg-moria-900 overflow-hidden">
      {/* Left: table selector */}
      <TableSelector selected={selectedTables} onChange={setSelectedTables} />

      {/* Right: main workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Question bar */}
        <div className="shrink-0 border-b border-moria-700 px-6 py-5">
          <QuestionInput
            value={question}
            onChange={setQuestion}
            selectedTables={selectedTables}
            onSubmit={handleSubmit}
            loading={conversation?.streaming ?? false}
          />
        </div>

        {/* Scrollable output */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <ReasoningDisplay
            conversation={conversation}
            onRequestApprove={handleRequestApprove}
            onRequestReject={handleRequestReject}
          />
          <SqlOutput conversation={conversation} />
        </div>
      </div>
    </div>
  );
}

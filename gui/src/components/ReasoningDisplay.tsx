"use client";

import { useEffect, useRef } from "react";
import { EmptyState, SkeletonText } from "doriath";
import { BrainCircuit } from "lucide-react";
import { RequestPanel } from "./RequestPanel";
import type { ConversationState, SelectedTable } from "@/lib/types";

interface Props {
  conversation: ConversationState | null;
  onRequestApprove: (additionalTables: SelectedTable[]) => void;
  onRequestReject: (note: string) => void;
}

export function ReasoningDisplay({ conversation, onRequestApprove, onRequestReject }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as streaming text arrives
  useEffect(() => {
    if (conversation?.streaming) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [conversation?.streamBuffer, conversation?.streaming]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={BrainCircuit}
          title="No query yet"
          description="Select tables, describe your question, and click Run."
        />
      </div>
    );
  }

  // Collect completed assistant turns + the current stream buffer
  const completedTurns = conversation.turns.filter((t) => t.role === "assistant");
  const hasStream = conversation.streamBuffer.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide px-6 py-5 space-y-6">
      {/* Completed assistant turns (prior cycles) */}
      {completedTurns.slice(0, -1).map((turn, i) => (
        <div key={i} className="space-y-1">
          <div className="text-xs font-medium text-moria-500 uppercase tracking-widest">
            Reasoning — cycle {i + 1}
          </div>
          <pre className="text-sm text-moria-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {turn.content}
          </pre>
        </div>
      ))}

      {/* Current streaming turn */}
      {hasStream && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-moria-500 uppercase tracking-widest">
            Reasoning
          </div>
          <pre className="text-sm text-moria-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {conversation.streamBuffer}
            {conversation.streaming && (
              <span className="inline-block w-1.5 h-4 bg-moria-500 animate-pulse ml-0.5 translate-y-0.5" />
            )}
          </pre>
        </div>
      )}

      {/* Loading skeleton when streaming hasn't started yet */}
      {conversation.streaming && !hasStream && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-moria-500 uppercase tracking-widest">
            Reasoning
          </div>
          <SkeletonText lines={4} />
        </div>
      )}

      {/* Pending request panel */}
      {conversation.pendingRequest && (
        <RequestPanel
          request={conversation.pendingRequest}
          onApprove={onRequestApprove}
          onReject={onRequestReject}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}

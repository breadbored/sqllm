"use client";

import { CodeBlock } from "doriath";
import type { ConversationState } from "@/lib/types";

interface Props {
  conversation: ConversationState | null;
}

export function SqlOutput({ conversation }: Props) {
  const sql = conversation?.sql ?? null;
  if (!sql) return null;

  return (
    <div className="border-t border-moria-700">
      <div className="px-6 py-3 border-b border-moria-700">
        <span className="text-xs font-semibold text-moria-500 uppercase tracking-widest">
          SQL
        </span>
      </div>
      <div className="p-4">
        <CodeBlock language="sql" code={sql} />
      </div>
    </div>
  );
}

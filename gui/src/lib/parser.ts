import type { ModelRequest } from "./types";

/** Extract the first complete <search_tables> or <fetch_schema> block from text. */
export function extractRequest(text: string): ModelRequest | null {
  const searchMatch = text.match(
    /<search_tables>\s*query:\s*(.+?)\s*reason:\s*([\s\S]+?)\s*<\/search_tables>/
  );
  if (searchMatch) {
    return {
      type: "search_tables",
      query: searchMatch[1].trim(),
      reason: searchMatch[2].trim(),
    };
  }

  const fetchMatch = text.match(
    /<fetch_schema>\s*table:\s*(.+?)\s*reason:\s*([\s\S]+?)\s*<\/fetch_schema>/
  );
  if (fetchMatch) {
    return {
      type: "fetch_schema",
      table: fetchMatch[1].trim(),
      reason: fetchMatch[2].trim(),
    };
  }

  return null;
}

/**
 * Returns true if the text contains the opening tag of a request but the
 * closing tag has not yet appeared (i.e. the stream is mid-tag).
 */
export function isStreamMidRequest(text: string): boolean {
  const hasOpenSearch = text.includes("<search_tables>");
  const hasCloseSearch = text.includes("</search_tables>");
  const hasOpenFetch = text.includes("<fetch_schema>");
  const hasCloseFetch = text.includes("</fetch_schema>");

  return (hasOpenSearch && !hasCloseSearch) || (hasOpenFetch && !hasCloseFetch);
}

/** Extract the last fenced SQL block from completed model output. */
export function extractSql(text: string): string | null {
  const matches = [...text.matchAll(/```sql\s*([\s\S]+?)```/gi)];
  if (matches.length === 0) return null;
  return matches[matches.length - 1][1].trim();
}

/** Strip request tags from text for display purposes. */
export function stripRequestTags(text: string): string {
  return text
    .replace(/<search_tables>[\s\S]*?<\/search_tables>/g, "")
    .replace(/<fetch_schema>[\s\S]*?<\/fetch_schema>/g, "")
    .trim();
}

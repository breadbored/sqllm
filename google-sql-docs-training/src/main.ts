import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error(
    "Usage: ts-node src/main.ts <path-to-md-directory> [output-file]",
  );
  process.exit(1);
}

const mdDir = path.resolve(args[0]);
if (!fs.existsSync(mdDir) || !fs.statSync(mdDir).isDirectory()) {
  console.error(`Not a directory: ${mdDir}`);
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, "..");
const outputFile = path.resolve(
  args[1] ?? path.join(projectRoot, "output", "training_data.jsonl"),
);
const processedFile = path.join(projectRoot, ".processed");

// ---------------------------------------------------------------------------
// Load prompts
// ---------------------------------------------------------------------------

const systemPrompt = fs
  .readFileSync(path.join(projectRoot, "system-prompt.txt"), "utf-8")
  .trim();
const extractionPrompt = fs
  .readFileSync(path.join(projectRoot, "extraction-prompt.txt"), "utf-8")
  .trim();

// ---------------------------------------------------------------------------
// Load processed set
// ---------------------------------------------------------------------------

const processed = new Set<string>();
if (fs.existsSync(processedFile)) {
  for (const line of fs.readFileSync(processedFile, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed) processed.add(trimmed);
  }
}

// ---------------------------------------------------------------------------
// Ensure output directory exists
// ---------------------------------------------------------------------------

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Strip the Dataform `config { ... }` block from the top of a .md file.
 * The block may span multiple lines and uses nested braces — we match the
 * outermost balanced pair starting at the first `config {`.
 */
function stripConfigBlock(content: string): string {
  return content;
  const start = content.search(/^config\s*\{/m);
  if (start === -1) return content.trim();

  let depth = 0;
  let i = content.indexOf("{", start);
  for (; i < content.length; i++) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }

  return content.slice(i + 1).trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Invoke `claude -p` as a subprocess and return the text result.
 * The user prompt is written to stdin to avoid shell argument length limits.
 */
function callClaude(userPrompt: string): string {
  const result = spawnSync(
    "claude",
    [
      "-p",
      "--model",
      "claude-haiku-4-5",
      "--output-format",
      "json",
      "--system-prompt",
      systemPrompt,
      "--max-turns",
      "1",
    ],
    {
      input: userPrompt,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `claude exited with status ${result.status}:\n${result.stderr}`,
    );
  }

  const parsed = JSON.parse(result.stdout) as { result?: string };
  if (typeof parsed.result !== "string") {
    throw new Error(
      `Unexpected claude output shape: ${result.stdout.slice(0, 200)}`,
    );
  }
  return parsed.result;
}

interface Parsed {
  userPrompt: string;
  assistantContent: string;
}

/**
 * Split the response on the expected delimiter markers.
 * Returns one Parsed object per USER PROMPT / ASSISTANT RESPONSE pair found.
 */
function parseResponse(response: string): Parsed[] {
  // Split on any "--- USER PROMPT ---" marker (keeping the delimiter for indexing).
  const userSections = response.split(/---\s*USER PROMPT\s*---/i).slice(1);

  if (userSections.length === 0) {
    throw new Error(
      "Response did not contain expected delimiters (--- USER PROMPT --- / --- ASSISTANT RESPONSE ---)",
    );
  }

  const results: Parsed[] = [];
  for (const section of userSections) {
    const parts = section.split(/---\s*ASSISTANT RESPONSE\s*---/i);
    if (parts.length < 2) {
      throw new Error(
        "Found a USER PROMPT section with no matching ASSISTANT RESPONSE",
      );
    }
    const userPrompt = parts[0].trim();
    // Everything after the ASSISTANT RESPONSE marker up to the next USER PROMPT
    // (already handled by the outer split) is the assistant content.
    const assistantContent = parts[1].trim();
    if (userPrompt && assistantContent) {
      results.push({ userPrompt, assistantContent });
    }
  }

  if (results.length === 0) {
    throw new Error("No valid USER PROMPT / ASSISTANT RESPONSE pairs found");
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const allFiles = findMarkdownFiles(mdDir);
  console.log(`Found ${allFiles.length} .md file(s) in ${mdDir}`);

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const absPath of allFiles) {
    const relPath = path.relative(mdDir, absPath);

    if (processed.has(relPath)) {
      console.log(`[skip]  ${relPath}`);
      skippedCount++;
      continue;
    }

    process.stdout.write(`[proc]  ${relPath} ... `);

    try {
      const rawContent = fs.readFileSync(absPath, "utf-8");
      const sqlContent = stripConfigBlock(rawContent);

      const userPrompt = `${extractionPrompt}\n\n<doc>\n${sqlContent}\n</doc>`;
      const response = callClaude(userPrompt);
      const pairs = parseResponse(response);

      for (const { userPrompt: naturalPrompt, assistantContent } of pairs) {
        const record = {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: naturalPrompt },
            { role: "assistant", content: assistantContent },
          ],
          source_file: relPath,
        };
        fs.appendFileSync(outputFile, JSON.stringify(record) + "\n", "utf-8");
      }

      fs.appendFileSync(processedFile, relPath + "\n", "utf-8");
      processed.add(relPath);

      processedCount++;
      console.log(`done (${pairs.length} example(s))`);
    } catch (err) {
      errorCount++;
      console.log("ERROR");
      console.error(
        `        ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    await sleep(2000);
  }

  console.log(
    `\nDone. processed=${processedCount}, skipped=${skippedCount}, errors=${errorCount}`,
  );
  console.log(`Output: ${outputFile}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

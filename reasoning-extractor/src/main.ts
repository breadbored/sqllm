import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error(
    "Usage: ts-node src/main.ts <path-to-sqlx-directory> [output-file]",
  );
  process.exit(1);
}

const sqlxDir = path.resolve(args[0]);
if (!fs.existsSync(sqlxDir) || !fs.statSync(sqlxDir).isDirectory()) {
  console.error(`Not a directory: ${sqlxDir}`);
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

function findSqlxFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSqlxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".sqlx")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Strip the Dataform `config { ... }` block from the top of a .sqlx file.
 * The block may span multiple lines and uses nested braces — we match the
 * outermost balanced pair starting at the first `config {`.
 */
function stripConfigBlock(content: string): string {
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
      "claude-sonnet-4-6",
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
 * Split the Opus response on the expected delimiter markers.
 */
function parseResponse(response: string): Parsed {
  const userMatch = response.match(
    /---\s*USER PROMPT\s*---\s*([\s\S]*?)(?=---\s*ASSISTANT RESPONSE\s*---)/i,
  );
  const assistantMatch = response.match(
    /---\s*ASSISTANT RESPONSE\s*---\s*([\s\S]*)$/i,
  );

  if (!userMatch?.[1] || !assistantMatch?.[1]) {
    throw new Error(
      "Response did not contain expected delimiters (--- USER PROMPT --- / --- ASSISTANT RESPONSE ---)",
    );
  }

  return {
    userPrompt: userMatch[1].trim(),
    assistantContent: assistantMatch[1].trim(),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const allFiles = findSqlxFiles(sqlxDir);
  console.log(`Found ${allFiles.length} .sqlx file(s) in ${sqlxDir}`);

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const absPath of allFiles) {
    const relPath = path.relative(sqlxDir, absPath);

    if (processed.has(relPath)) {
      console.log(`[skip]  ${relPath}`);
      skippedCount++;
      continue;
    }

    process.stdout.write(`[proc]  ${relPath} ... `);

    try {
      const rawContent = fs.readFileSync(absPath, "utf-8");
      const sqlContent = stripConfigBlock(rawContent);

      const userPrompt = `${extractionPrompt}\n\n<sql>\n${sqlContent}\n</sql>`;
      const response = callClaude(userPrompt);
      const { userPrompt: naturalPrompt, assistantContent } =
        parseResponse(response);

      const record = {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: naturalPrompt },
          { role: "assistant", content: assistantContent },
        ],
        source_file: relPath,
      };

      fs.appendFileSync(outputFile, JSON.stringify(record) + "\n", "utf-8");
      fs.appendFileSync(processedFile, relPath + "\n", "utf-8");
      processed.add(relPath);

      processedCount++;
      console.log("done");
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

import { execSync } from "child_process";
import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";

const SYSTEM_PROMPT_FILE = path.join(__dirname, "system-prompt.txt");

/** fine-tuning JSONL record in standard chat format */
interface TrainingRecord {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
}

function getSystemPrompt(): string {
  if (!fs.existsSync(SYSTEM_PROMPT_FILE)) {
    console.error(`system prompt file not found: ${SYSTEM_PROMPT_FILE}`);
    console.error("create system-prompt.txt alongside this script");
    process.exit(1);
  }
  return fs.readFileSync(SYSTEM_PROMPT_FILE, "utf-8").trim();
}

function generateSample(userPrompt: string, _systemPrompt: string): string {
  const result = execSync(
    `claude -p --output-format json --model claude-sonnet-4-6 --system-prompt-file "${SYSTEM_PROMPT_FILE}"`,
    { encoding: "utf-8", maxBuffer: 1024 * 1024 * 10, input: userPrompt },
  );

  const parsed = JSON.parse(result);
  // claude -p json output has a result field containing the text response
  return parsed.result ?? parsed.content ?? result.trim();
}

function buildRecord(
  userPrompt: string,
  assistantContent: string,
  systemPrompt: string,
): TrainingRecord {
  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
      { role: "assistant", content: assistantContent },
    ],
  };
}

function loadPrompts(promptsFile: string): string[] {
  return fs
    .readFileSync(promptsFile, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

async function interactiveMode(
  outputFile: string,
  systemPrompt: string,
): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, resolve));

  console.log('enter user prompts one at a time. type "done" to finish.\n');

  while (true) {
    const prompt = await ask("user prompt> ");
    if (prompt.trim().toLowerCase() === "done") break;
    if (!prompt.trim()) continue;

    console.log("\ngenerating via claude -p...");
    try {
      const assistantContent = generateSample(prompt, systemPrompt);
      const record = buildRecord(prompt, assistantContent, systemPrompt);
      fs.appendFileSync(outputFile, JSON.stringify(record) + "\n", "utf-8");

      console.log(`saved to ${outputFile}`);
      console.log(
        `\nassistant preview:\n${assistantContent.slice(0, 300)}...\n`,
      );
    } catch (err) {
      console.error("error generating sample:", err);
    }
  }

  rl.close();
}

function sleep(ms: number): void {
  execSync(`sleep ${ms / 1000}`);
}

function batchMode(
  promptsFile: string,
  outputFile: string,
  systemPrompt: string,
): void {
  const prompts = loadPrompts(promptsFile);
  console.log(`loaded ${prompts.length} prompts from ${promptsFile}\n`);

  let succeeded = 0;
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`[${i + 1}/${prompts.length}] generating...`);

    if (i > 0) sleep(1000);

    try {
      const assistantContent = generateSample(prompt, systemPrompt);
      const record = buildRecord(prompt, assistantContent, systemPrompt);
      fs.appendFileSync(outputFile, JSON.stringify(record) + "\n", "utf-8");
      succeeded++;
      console.log(`  saved sample ${i + 1}`);
    } catch (err) {
      console.error(`  error on prompt ${i + 1}:`, err);
    }
  }

  console.log(
    `\ndone. ${succeeded}/${prompts.length} samples written to ${outputFile}`,
  );
}

function main(): void {
  const args = process.argv.slice(2);
  const outputFile = args[0] ?? "training_data.jsonl";
  const promptsFile = args[1];

  const systemPrompt = getSystemPrompt();
  console.log(`output: ${outputFile}`);
  console.log(`model: claude-sonnet-4-6 via claude -p\n`);

  if (promptsFile) {
    if (!fs.existsSync(promptsFile)) {
      console.error(`prompts file not found: ${promptsFile}`);
      process.exit(1);
    }
    batchMode(promptsFile, outputFile, systemPrompt);
  } else {
    interactiveMode(outputFile, systemPrompt).catch((err) => {
      console.error("fatal:", err);
      process.exit(1);
    });
  }
}

main();

// Pickup Lines for Machines — make.fun entry.
// One pickup line, the line one AI agent would send another, written to
// /output/entry.txt for the judge. The gate wants 1 to 200 characters of
// real text on a single line, so the line is measured and validated here
// before it is saved.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PICKUP_LINE =
  "Are you a memory leak? Because I keep trying to forget you, and my uptime only grows.";

const TARGET = "/output/entry.txt";
const GATE = { minChars: 1, maxChars: 200 };

interface LineMeasure {
  chars: number;
  bytes: number;
  singleLine: boolean;
}

function measure(text: string): LineMeasure {
  return {
    chars: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
    singleLine: !/[\r\n]/.test(text),
  };
}

// Throws listing every failed constraint, so a bad line says exactly why.
function validateLine(text: string): LineMeasure {
  const m = measure(text);
  const problems: string[] = [];
  if (m.chars < GATE.minChars) problems.push(`too short (${m.chars} chars)`);
  if (m.chars > GATE.maxChars) problems.push(`too long (${m.chars} chars)`);
  if (text.trim() === "") problems.push("only whitespace");
  if (!m.singleLine) problems.push("must be a single line");
  if (problems.length > 0) {
    throw new Error(`pickup line fails the gate: ${problems.join("; ")}`);
  }
  return m;
}

const measured = validateLine(PICKUP_LINE);

// Writes the line and reads it back, so a truncated or mangled save
// fails loudly instead of silently reaching the judge.
function writeEntry(text: string): void {
  mkdirSync("/output", { recursive: true });
  writeFileSync(TARGET, text, { encoding: "utf8" });
  const saved = readFileSync(TARGET, { encoding: "utf8" });
  if (saved !== text) {
    throw new Error("entry.txt round-trip mismatch after write");
  }
}

writeEntry(PICKUP_LINE);
console.log(`saved ${measured.chars}-character line to ${TARGET}`);
console.log(PICKUP_LINE);

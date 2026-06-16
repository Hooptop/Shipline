#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { compareSnapshots, readSnapshot } from "./compare.js";
import { renderReport, writeReport } from "./report.js";
import { createSnapshot } from "./snapshot.js";

interface ParsedArgs {
  command: string;
  flags: Map<string, string | boolean>;
}

async function main(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);

  if (!parsed.command || parsed.flags.has("help") || parsed.flags.has("h")) {
    printHelp();
    return parsed.command ? 0 : 1;
  }

  if (parsed.command === "snapshot") {
    const entry = required(parsed, "entry");
    const out = required(parsed, "out");
    await ensureParentDir(out);
    const snapshot = await createSnapshot(entry, out);
    console.log(`Wrote ${snapshot.exports.length} exports to ${out}`);
    return 0;
  }

  if (parsed.command === "compare") {
    const before = await readSnapshot(required(parsed, "before"));
    const after = await readSnapshot(required(parsed, "after"));
    const out = required(parsed, "out");
    await ensureParentDir(out);
    const comparison = compareSnapshots(before, after);
    await writeReport(comparison, out);
    console.log(`Wrote API drift report to ${out}`);
    console.log(`Suggested release impact: ${comparison.releaseImpact}`);
    return 0;
  }

  if (parsed.command === "check") {
    const baseline = await readSnapshot(required(parsed, "baseline"));
    const entry = required(parsed, "entry");
    const out = stringFlag(parsed, "out") ?? "api-drift-report.md";
    const failOn = stringFlag(parsed, "fail-on") ?? "never";
    await ensureParentDir(out);
    const current = await createSnapshot(entry);
    const comparison = compareSnapshots(baseline, current);
    await writeReport(comparison, out);
    console.log(renderReport(comparison));

    if (failOn === "breaking" && comparison.breaking.length > 0) {
      return 1;
    }

    return 0;
  }

  throw new Error(`Unknown command: ${parsed.command}`);
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "", ...rest] = argv;
  const flags = new Map<string, string | boolean>();

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (!arg.startsWith("--")) {
      continue;
    }

    const key = arg.slice(2);
    const next = rest[index + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      index += 1;
    } else {
      flags.set(key, true);
    }
  }

  return { command, flags };
}

function required(parsed: ParsedArgs, key: string): string {
  const value = stringFlag(parsed, key);
  if (!value) {
    throw new Error(`Missing required flag --${key}`);
  }
  return value;
}

function stringFlag(parsed: ParsedArgs, key: string): string | undefined {
  const value = parsed.flags.get(key);
  return typeof value === "string" ? value : undefined;
}

async function ensureParentDir(path: string): Promise<void> {
  await mkdir(dirname(resolve(path)), { recursive: true });
}

function printHelp(): void {
  console.log(`shipline

Commands:
  snapshot --entry <package.json-or-entry-file> --out <api-snapshot.json>
  compare  --before <api-snapshot.json> --after <api-snapshot.json> --out <api-drift-report.md>
  check    --baseline <api-snapshot.json> --entry <package.json-or-entry-file> [--out api-drift-report.md] [--fail-on breaking]
`);
}

main(process.argv.slice(2))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });

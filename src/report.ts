import { writeFile } from "node:fs/promises";
import type { ApiChange, ApiComparison } from "./types.js";

export async function writeReport(comparison: ApiComparison, outPath: string): Promise<string> {
  const markdown = renderReport(comparison);
  await writeFile(outPath, markdown, "utf8");
  return markdown;
}

export function renderReport(comparison: ApiComparison): string {
  const status = comparison.breaking.length > 0
    ? `Shipline found ${comparison.breaking.length} breaking public API change${plural(comparison.breaking.length)}.`
    : comparison.compatible.length > 0
      ? `Shipline found ${comparison.compatible.length} compatible public API addition${plural(comparison.compatible.length)}.`
      : "Shipline found no public API changes.";

  return [
    "# API Drift Report",
    "",
    `${status} Suggested release impact: **${comparison.releaseImpact}**.`,
    "",
    `- Before: \`${comparison.beforePackage}\``,
    `- After: \`${comparison.afterPackage}\``,
    `- Breaking changes: ${comparison.breaking.length}`,
    `- Compatible additions: ${comparison.compatible.length}`,
    `- Informational changes: ${comparison.informational.length}`,
    "",
    "## Breaking Changes",
    "",
    tableForChanges(comparison.breaking, "No breaking changes detected."),
    "",
    "## Compatible Additions",
    "",
    tableForChanges(comparison.compatible, "No compatible additions detected."),
    "",
    "## Informational Changes",
    "",
    tableForChanges(comparison.informational, "No informational changes detected."),
    "",
    "## Maintainer Checklist",
    "",
    checklistForImpact(comparison.releaseImpact),
    "",
  ].join("\n");
}

function tableForChanges(changes: ApiChange[], emptyText: string): string {
  if (changes.length === 0) {
    return emptyText;
  }

  const rows = [
    "| Export | Kind | Reason | Before | After |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const change of changes) {
    rows.push([
      `\`${escapeCell(change.name)}\``,
      change.kind,
      escapeCell(change.reason),
      change.before ? `\`${escapeCell(change.before.signature)}\`` : "",
      change.after ? `\`${escapeCell(change.after.signature)}\`` : "",
    ].join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }

  return rows.join("\n");
}

function checklistForImpact(impact: ApiComparison["releaseImpact"]): string {
  if (impact === "major") {
    return [
      "- [ ] Confirm each breaking change is intentional.",
      "- [ ] Add or update migration notes.",
      "- [ ] Update changelog with a major-version entry.",
      "- [ ] Check README and docs examples for old API usage.",
      "- [ ] Consider downstream smoke tests before release.",
    ].join("\n");
  }

  if (impact === "minor") {
    return [
      "- [ ] Confirm new exports are documented.",
      "- [ ] Add changelog entries for new public APIs.",
      "- [ ] Add examples or tests for new exports.",
    ].join("\n");
  }

  return [
    "- [ ] No public API release action needed.",
    "- [ ] Continue normal patch release checks.",
  ].join("\n");
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function plural(count: number): string {
  return count === 1 ? "" : "s";
}

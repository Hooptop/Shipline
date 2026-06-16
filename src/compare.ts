import { readFile } from "node:fs/promises";
import type { ApiChange, ApiComparison, ApiExport, ApiSnapshot } from "./types.js";

export async function readSnapshot(path: string): Promise<ApiSnapshot> {
  return JSON.parse(await readFile(path, "utf8")) as ApiSnapshot;
}

export function compareSnapshots(before: ApiSnapshot, after: ApiSnapshot): ApiComparison {
  const beforeByName = indexByName(before.exports);
  const afterByName = indexByName(after.exports);
  const breaking: ApiChange[] = [];
  const compatible: ApiChange[] = [];
  const informational: ApiChange[] = [];

  for (const [name, beforeExport] of beforeByName) {
    const afterExport = afterByName.get(name);
    if (!afterExport) {
      breaking.push({
        name,
        kind: beforeExport.kind,
        before: beforeExport,
        reason: "Export was removed.",
      });
      continue;
    }

    if (beforeExport.kind !== afterExport.kind || beforeExport.signature !== afterExport.signature) {
      breaking.push({
        name,
        kind: afterExport.kind,
        before: beforeExport,
        after: afterExport,
        reason: "Public signature changed.",
      });
      continue;
    }

    if (beforeExport.sourceFile !== afterExport.sourceFile) {
      informational.push({
        name,
        kind: afterExport.kind,
        before: beforeExport,
        after: afterExport,
        reason: "Export source file changed without a signature change.",
      });
    }
  }

  for (const [name, afterExport] of afterByName) {
    if (!beforeByName.has(name)) {
      compatible.push({
        name,
        kind: afterExport.kind,
        after: afterExport,
        reason: "Export was added.",
      });
    }
  }

  return {
    beforePackage: `${before.packageName}@${before.packageVersion}`,
    afterPackage: `${after.packageName}@${after.packageVersion}`,
    breaking: sortChanges(breaking),
    compatible: sortChanges(compatible),
    informational: sortChanges(informational),
    releaseImpact: breaking.length > 0 ? "major" : compatible.length > 0 ? "minor" : "patch",
  };
}

function indexByName(exportsList: ApiExport[]): Map<string, ApiExport> {
  return new Map(exportsList.map((apiExport) => [apiExport.name, apiExport]));
}

function sortChanges(changes: ApiChange[]): ApiChange[] {
  return [...changes].sort((a, b) => a.name.localeCompare(b.name));
}

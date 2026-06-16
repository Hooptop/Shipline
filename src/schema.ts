import { z } from "zod";
import type { ApiSnapshot } from "./types.js";

export const apiExportSchema = z
  .object({
    name: z.string().min(1),
    kind: z.enum(["function", "class", "interface", "type", "const", "unknown"]),
    sourceFile: z.string().min(1),
    signature: z.string(),
  })
  .strict();

export const apiSnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    packageName: z.string().min(1),
    packageVersion: z.string().min(1),
    generatedAt: z.string().datetime(),
    entry: z.string(),
    exports: z.array(apiExportSchema),
  })
  .strict();

export function parseApiSnapshot(value: unknown): ApiSnapshot {
  return apiSnapshotSchema.parse(value);
}

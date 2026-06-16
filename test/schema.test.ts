import { describe, expect, it } from "vitest";
import { parseApiSnapshot } from "../src/schema.js";

describe("parseApiSnapshot", () => {
  it("accepts a valid strict snapshot", () => {
    const snapshot = parseApiSnapshot({
      schemaVersion: 1,
      packageName: "fixture-library",
      packageVersion: "1.0.0",
      generatedAt: "2026-06-16T12:00:00.000Z",
      entry: "package.json",
      exports: [
        {
          name: "createClient",
          kind: "function",
          sourceFile: "src/client.ts",
          signature: "export function createClient(): Client",
        },
      ],
    });

    expect(snapshot.exports).toHaveLength(1);
  });

  it("rejects unknown fields at the snapshot boundary", () => {
    expect(() =>
      parseApiSnapshot({
        schemaVersion: 1,
        packageName: "fixture-library",
        packageVersion: "1.0.0",
        generatedAt: "2026-06-16T12:00:00.000Z",
        entry: "package.json",
        unexpected: true,
        exports: [],
      }),
    ).toThrow();
  });

  it("rejects unknown fields on export rows", () => {
    expect(() =>
      parseApiSnapshot({
        schemaVersion: 1,
        packageName: "fixture-library",
        packageVersion: "1.0.0",
        generatedAt: "2026-06-16T12:00:00.000Z",
        entry: "package.json",
        exports: [
          {
            name: "createClient",
            kind: "function",
            sourceFile: "src/client.ts",
            signature: "export function createClient(): Client",
            hidden: "not allowed",
          },
        ],
      }),
    ).toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { renderReport } from "../src/report.js";
import type { ApiComparison } from "../src/types.js";

describe("renderReport", () => {
  it("renders a maintainer-ready Markdown report", () => {
    const comparison: ApiComparison = {
      beforePackage: "pkg@1.0.0",
      afterPackage: "pkg@2.0.0",
      releaseImpact: "major",
      compatible: [],
      informational: [],
      breaking: [
        {
          name: "createClient",
          kind: "function",
          reason: "Public signature changed.",
          before: {
            name: "createClient",
            kind: "function",
            sourceFile: "src/index.ts",
            signature: "export function createClient(options: Options): Client",
          },
          after: {
            name: "createClient",
            kind: "function",
            sourceFile: "src/index.ts",
            signature: "export function createClient(options: Options, timeoutMs: number): Client",
          },
        },
      ],
    };

    const report = renderReport(comparison);

    expect(report).toContain("# API Drift Report");
    expect(report).toContain("Suggested release impact: **major**");
    expect(report).toContain("Confirm each breaking change is intentional");
    expect(report).toContain("createClient");
  });
});

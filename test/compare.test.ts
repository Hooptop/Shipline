import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compareSnapshots } from "../src/compare.js";
import { createSnapshot } from "../src/snapshot.js";

const root = process.cwd();

describe("compareSnapshots", () => {
  it("marks added exports as compatible", async () => {
    const before = await createSnapshot(join(root, "fixtures/before/package.json"));
    const after = await createSnapshot(join(root, "fixtures/after-compatible/package.json"));
    const comparison = compareSnapshots(before, after);

    expect(comparison.releaseImpact).toBe("minor");
    expect(comparison.compatible.map((change) => change.name)).toEqual(["RetryPolicy"]);
    expect(comparison.breaking).toEqual([]);
  });

  it("marks removed exports and changed signatures as breaking", async () => {
    const before = await createSnapshot(join(root, "fixtures/before/package.json"));
    const after = await createSnapshot(join(root, "fixtures/after-breaking/package.json"));
    const comparison = compareSnapshots(before, after);

    expect(comparison.releaseImpact).toBe("major");
    expect(comparison.breaking.map((change) => change.name)).toEqual([
      "ApiError",
      "ClientOptions",
      "createClient",
      "RequestContext",
    ]);
  });
});

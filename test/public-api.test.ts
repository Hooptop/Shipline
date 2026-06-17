import { describe, expect, it } from "vitest";
import { apiSnapshotSchema, compareSnapshots, createSnapshot, parseApiSnapshot, renderReport } from "../src/index.js";

describe("public API", () => {
  it("exposes the core maintainer workflow primitives", () => {
    expect(typeof createSnapshot).toBe("function");
    expect(typeof compareSnapshots).toBe("function");
    expect(typeof renderReport).toBe("function");
    expect(typeof parseApiSnapshot).toBe("function");
    expect(apiSnapshotSchema.safeParse).toBeTypeOf("function");
  });
});

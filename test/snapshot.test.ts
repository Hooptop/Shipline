import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createSnapshot } from "../src/snapshot.js";

const root = process.cwd();

describe("createSnapshot", () => {
  it("extracts public exports from package exports and re-exports", async () => {
    const snapshot = await createSnapshot(join(root, "fixtures/before/package.json"));

    expect(snapshot.packageName).toBe("fixture-library");
    expect(snapshot.packageVersion).toBe("1.0.0");
    expect(snapshot.exports.map((apiExport) => apiExport.name)).toEqual([
      "ApiError",
      "ClientOptions",
      "createClient",
      "RequestContext",
      "version",
    ]);
    expect(snapshot.exports.find((apiExport) => apiExport.name === "createClient")).toMatchObject({
      kind: "function",
      sourceFile: "src/client.ts",
    });
    expect(snapshot.exports.find((apiExport) => apiExport.name === "ClientOptions")).toMatchObject({
      kind: "interface",
      sourceFile: "src/client.ts",
    });
  });
});

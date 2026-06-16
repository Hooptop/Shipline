import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const root = process.cwd();

describe("cli", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "shipline-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("writes snapshots and reports through the built CLI", async () => {
    const before = join(tempDir, "before.json");
    const after = join(tempDir, "after.json");
    const report = join(tempDir, "report.md");

    await execFileAsync(
      "node",
      ["dist/cli.js", "snapshot", "--entry", "fixtures/before/package.json", "--out", before],
      { cwd: root },
    );
    await execFileAsync(
      "node",
      ["dist/cli.js", "snapshot", "--entry", "fixtures/after-compatible/package.json", "--out", after],
      { cwd: root },
    );
    await execFileAsync("node", ["dist/cli.js", "compare", "--before", before, "--after", after, "--out", report], {
      cwd: root,
    });

    await expect(readFile(report, "utf8")).resolves.toContain("Suggested release impact: **minor**");
  });

  it("exits non-zero when breaking changes are configured to fail", async () => {
    const before = join(tempDir, "before.json");
    await execFileAsync(
      "node",
      ["dist/cli.js", "snapshot", "--entry", "fixtures/before/package.json", "--out", before],
      { cwd: root },
    );

    await expect(
      execFileAsync(
        "node",
        [
          "dist/cli.js",
          "check",
          "--baseline",
          before,
          "--entry",
          "fixtures/after-breaking/package.json",
          "--out",
          join(tempDir, "report.md"),
          "--fail-on",
          "breaking",
        ],
        { cwd: root },
      ),
    ).rejects.toMatchObject({ code: 1 });
  });
});

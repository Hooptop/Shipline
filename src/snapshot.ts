import { dirname, extname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { readFile, stat, writeFile } from "node:fs/promises";
import ts from "typescript";
import type { ApiExport, ApiSnapshot, ExportKind } from "./types.js";

interface PackageInfo {
  packageName: string;
  packageVersion: string;
  rootDir: string;
  entries: string[];
}

export async function createSnapshot(entryPath: string, outPath?: string): Promise<ApiSnapshot> {
  const absoluteEntry = resolve(entryPath);
  const packageInfo = await resolvePackageInfo(absoluteEntry);
  const seenFiles = new Set<string>();
  const exportsByName = new Map<string, ApiExport>();

  for (const entry of packageInfo.entries) {
    await collectExports(entry, packageInfo.rootDir, seenFiles, exportsByName);
  }

  const snapshot: ApiSnapshot = {
    schemaVersion: 1,
    packageName: packageInfo.packageName,
    packageVersion: packageInfo.packageVersion,
    generatedAt: new Date().toISOString(),
    entry: normalizePath(relative(packageInfo.rootDir, absoluteEntry)),
    exports: [...exportsByName.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };

  if (outPath) {
    await writeFile(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  }

  return snapshot;
}

async function resolvePackageInfo(entryPath: string): Promise<PackageInfo> {
  const entryStats = await stat(entryPath);
  const packageJsonPath = entryStats.isDirectory() ? join(entryPath, "package.json") : entryPath;

  if (packageJsonPath.endsWith("package.json")) {
    const packageRoot = dirname(packageJsonPath);
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
      name?: string;
      version?: string;
      exports?: unknown;
      main?: string;
      types?: string;
      typings?: string;
    };

    const entries = resolvePackageEntries(packageRoot, packageJson);
    return {
      packageName: packageJson.name ?? basenameFallback(packageRoot),
      packageVersion: packageJson.version ?? "0.0.0",
      rootDir: packageRoot,
      entries,
    };
  }

  return {
    packageName: basenameFallback(dirname(entryPath)),
    packageVersion: "0.0.0",
    rootDir: dirname(entryPath),
    entries: [entryPath],
  };
}

function resolvePackageEntries(
  packageRoot: string,
  packageJson: { exports?: unknown; main?: string; types?: string; typings?: string },
): string[] {
  const candidates = new Set<string>();
  collectExportTargets(packageJson.exports, candidates);

  for (const field of [packageJson.types, packageJson.typings, packageJson.main]) {
    if (field) {
      candidates.add(field);
    }
  }

  if (candidates.size === 0) {
    candidates.add("src/index.ts");
    candidates.add("index.ts");
  }

  return [...candidates]
    .map((candidate) => resolveModulePath(packageRoot, candidate))
    .filter((candidate): candidate is string => Boolean(candidate));
}

function collectExportTargets(value: unknown, targets: Set<string>): void {
  if (typeof value === "string") {
    targets.add(value);
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (key === "node" || key === "browser" || key === "development" || key === "production") {
      continue;
    }
    collectExportTargets(nested, targets);
  }
}

async function collectExports(
  filePath: string,
  rootDir: string,
  seenFiles: Set<string>,
  exportsByName: Map<string, ApiExport>,
): Promise<ApiExport[]> {
  const absoluteFile = resolve(filePath);
  if (seenFiles.has(absoluteFile)) {
    return [...exportsByName.values()];
  }
  seenFiles.add(absoluteFile);

  const sourceText = await readFile(absoluteFile, "utf8");
  const sourceFile = ts.createSourceFile(absoluteFile, sourceText, ts.ScriptTarget.Latest, true);

  for (const statement of sourceFile.statements) {
    if (isExportedDeclaration(statement)) {
      for (const apiExport of exportsFromDeclaration(statement, sourceFile, rootDir)) {
        exportsByName.set(apiExport.name, apiExport);
      }
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      await collectFromExportDeclaration(statement, sourceFile, rootDir, seenFiles, exportsByName);
    }
  }

  return [...exportsByName.values()];
}

async function collectFromExportDeclaration(
  statement: ts.ExportDeclaration,
  sourceFile: ts.SourceFile,
  rootDir: string,
  seenFiles: Set<string>,
  exportsByName: Map<string, ApiExport>,
): Promise<void> {
  const modulePath =
    statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
      ? resolveModulePath(dirname(sourceFile.fileName), statement.moduleSpecifier.text)
      : undefined;

  if (modulePath && !statement.exportClause) {
    await collectExports(modulePath, rootDir, seenFiles, exportsByName);
    return;
  }

  if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
    return;
  }

  if (!modulePath) {
    for (const element of statement.exportClause.elements) {
      exportsByName.set(element.name.text, {
        name: element.name.text,
        kind: "unknown",
        sourceFile: normalizePath(relative(rootDir, sourceFile.fileName)),
        signature: `export { ${element.name.text} }`,
      });
    }
    return;
  }

  const nested = new Map<string, ApiExport>();
  await collectExports(modulePath, rootDir, new Set(seenFiles), nested);

  for (const element of statement.exportClause.elements) {
    const importedName = element.propertyName?.text ?? element.name.text;
    const exportedName = element.name.text;
    const nestedExport = nested.get(importedName);
    exportsByName.set(
      exportedName,
      nestedExport
        ? { ...nestedExport, name: exportedName }
        : {
            name: exportedName,
            kind: "unknown",
            sourceFile: normalizePath(relative(rootDir, modulePath)),
            signature: `export { ${importedName === exportedName ? exportedName : `${importedName} as ${exportedName}`} }`,
          },
    );
  }
}

function exportsFromDeclaration(node: ts.Statement, sourceFile: ts.SourceFile, rootDir: string): ApiExport[] {
  const sourceFilePath = normalizePath(relative(rootDir, sourceFile.fileName));
  const signature = compactSignature(node.getText(sourceFile));

  if (
    (ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node)) &&
    node.name
  ) {
    return [
      {
        name: node.name.text,
        kind: kindForDeclaration(node),
        sourceFile: sourceFilePath,
        signature,
      },
    ];
  }

  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations
      .filter((declaration): declaration is ts.VariableDeclaration & { name: ts.Identifier } =>
        ts.isIdentifier(declaration.name),
      )
      .map((declaration) => ({
        name: declaration.name.text,
        kind: "const" as const,
        sourceFile: sourceFilePath,
        signature: compactSignature(
          `export const ${declaration.name.text}${declaration.type ? `: ${declaration.type.getText(sourceFile)}` : ""}`,
        ),
      }));
  }

  return [];
}

function isExportedDeclaration(node: ts.Node): boolean {
  return Boolean(ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export);
}

function kindForDeclaration(node: ts.Node): ExportKind {
  if (ts.isFunctionDeclaration(node)) return "function";
  if (ts.isClassDeclaration(node)) return "class";
  if (ts.isInterfaceDeclaration(node)) return "interface";
  if (ts.isTypeAliasDeclaration(node)) return "type";
  return "unknown";
}

function resolveModulePath(baseDir: string, modulePath: string): string | undefined {
  const absoluteBase = isAbsolute(modulePath) ? modulePath : resolve(baseDir, modulePath);
  const candidates = extname(absoluteBase)
    ? [absoluteBase]
    : [
        `${absoluteBase}.ts`,
        `${absoluteBase}.tsx`,
        `${absoluteBase}.d.ts`,
        `${absoluteBase}.js`,
        join(absoluteBase, "index.ts"),
        join(absoluteBase, "index.tsx"),
        join(absoluteBase, "index.d.ts"),
        join(absoluteBase, "index.js"),
      ];

  for (const candidate of candidates) {
    if (ts.sys.fileExists(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function compactSignature(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*$/, "")
    .trim();
}

function normalizePath(value: string): string {
  return normalize(value).replace(/\\/g, "/");
}

function basenameFallback(pathValue: string): string {
  return normalizePath(pathValue).split("/").filter(Boolean).at(-1) ?? "unknown-package";
}

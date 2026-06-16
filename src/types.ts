export type ExportKind = "function" | "class" | "interface" | "type" | "const" | "unknown";

export interface ApiExport {
  name: string;
  kind: ExportKind;
  sourceFile: string;
  signature: string;
}

export interface ApiSnapshot {
  schemaVersion: 1;
  packageName: string;
  packageVersion: string;
  generatedAt: string;
  entry: string;
  exports: ApiExport[];
}

export interface ApiChange {
  name: string;
  kind: ExportKind;
  before?: ApiExport;
  after?: ApiExport;
  reason: string;
}

export interface ApiComparison {
  beforePackage: string;
  afterPackage: string;
  breaking: ApiChange[];
  compatible: ApiChange[];
  informational: ApiChange[];
  releaseImpact: "major" | "minor" | "patch";
}

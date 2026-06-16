# Shipline v0.1.0

Initial public release of Shipline, a maintainer automation tool for catching breaking API changes before release.

## Highlights

- CLI commands for `snapshot`, `compare`, and `check`.
- TypeScript compiler-based export extraction for common JS/TS library APIs.
- Strict Zod validation for snapshot JSON boundaries.
- Markdown API drift reports with release-impact guidance.
- GitHub Actions examples for PR and release workflows.
- Maintainer workflow, security model, and release checklist docs.
- TypeScript, ESLint, Prettier, build, and Vitest verification through `bun run verify`.

## Validation

- `bun run verify`
- 5 test files passing
- 10 tests passing
- GitHub Actions CI passing on `main`

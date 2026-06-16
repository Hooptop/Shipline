# Security Model

Shipline is a static analysis tool for maintainer automation. It should inspect package source files, not execute them.

## Trust Boundaries

Potentially untrusted inputs:

- Pull request source files.
- Package metadata.
- Export paths.
- Generated report content.

Trusted inputs:

- Maintainer-provided CLI flags.
- Committed baseline snapshots.
- CI workflow configuration controlled by maintainers.

## Current Safety Properties

- Shipline uses TypeScript parsing for source analysis.
- Shipline does not execute analyzed package code.
- The GitHub Actions examples use `contents: read`.
- Reports are uploaded as artifacts by default.

## Security Requirements For Future PR Comments

Before Shipline posts comments automatically:

- Use the minimum required GitHub token permissions.
- Avoid duplicate or spammy comments.
- Keep forked PR behavior explicit.
- Do not include secrets or environment values in reports.
- Treat report Markdown as untrusted output when rendering.

## Codex Security Review Areas

Deeper security review should focus on:

- Path traversal in package entry resolution.
- Symlink and workspace boundary handling.
- Safe parsing of package metadata.
- GitHub token permission minimization.
- Safe handling of forked pull requests.

# Starter Issues

These issues define the first maintainer roadmap items for Shipline.

## Add pull request comment reporter

Shipline currently writes API drift reports as Markdown artifacts. Add an optional reporter that posts a concise PR comment with release impact, breaking changes, and maintainer checklist.

Requirements:

- Keep default GitHub token permissions minimal.
- Avoid posting duplicate comments on repeated runs.
- Preserve artifact output as the safe default.
- Document forked PR safety considerations.

Labels: `enhancement`, `maintainer-workflow`

## Generate migration-note drafts from API drift reports

Use API drift results to draft maintainer-friendly migration notes for intentional breaking changes.

Initial scope:

- Input: existing API drift comparison JSON/report.
- Output: Markdown migration-note draft.
- Include before/after signatures and suggested user action.
- Keep deterministic report generation available without AI.

Labels: `enhancement`, `release`

## Support monorepo package baselines

Add first-class support for repositories that publish multiple JS/TS packages.

Initial scope:

- Discover package manifests under configurable workspace globs.
- Generate one snapshot per package.
- Compare package baselines independently.
- Produce one combined maintainer report for release review.

Labels: `enhancement`, `monorepo`

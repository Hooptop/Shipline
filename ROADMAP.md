# Roadmap

## Near Term

- Post API drift summaries as pull request comments with minimum GitHub token permissions.
- Add OpenAI-powered API diff explanations.
- Generate migration-note drafts for breaking changes.
- Suggest changelog entries from API drift reports.
- Add release-impact confidence scoring.

## Later

- Support monorepos with multiple package baselines.
- Generate downstream smoke-test matrices.
- Detect stale README and documentation examples.
- Add package ecosystem adapters beyond JS/TS.
- Publish a reusable GitHub Action wrapper.

## Design Principle

The deterministic core must remain useful without AI. API-backed features should help maintainers explain, review, and release changes more clearly.

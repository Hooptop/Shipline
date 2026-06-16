# Maintainer Workflows

Shipline is designed for maintainers who need fast, reviewable release evidence without running project code from a pull request.

## Pull Request Review

Use Shipline when a pull request touches exported TypeScript or JavaScript APIs.

Recommended flow:

1. Keep a committed baseline snapshot for the package.
2. Run `shipline check` in CI.
3. Upload `api-drift-report.md` as an artifact.
4. Review breaking changes before approving the PR.
5. Require migration notes for intentional breaking changes.

This keeps the first release gate deterministic. AI-backed PR comments can be added later without changing the core check.

## Release Review

Before publishing:

1. Generate a fresh snapshot from the release branch.
2. Compare it with the previous release snapshot.
3. Use Shipline's suggested release impact as the review starting point.
4. Update changelog and docs before publishing.

Release impact mapping:

- `major`: removed exports or changed public signatures.
- `minor`: added exports only.
- `patch`: no public API surface changes.

## Maintainer Checklist

For breaking changes:

- Confirm the break is intentional.
- Add migration notes.
- Update docs and examples.
- Consider downstream smoke tests.
- Record the decision in the release notes.

For compatible additions:

- Add docs or examples.
- Add changelog entries.
- Confirm tests cover the new public API.

## Planned API-Backed Automation

The deterministic report is the source of truth. API credits would help maintainers convert it into:

- PR review comments.
- Migration-note drafts.
- Changelog entries.
- Plain-English compatibility summaries.
- Downstream risk summaries.

# Release Checklist

Use this checklist before publishing a package release with Shipline.

## Before Merge

- Run `shipline check` against the committed baseline.
- Review `api-drift-report.md`.
- Confirm each breaking change is intentional.
- Update docs and README examples for changed public APIs.
- Add migration notes for breaking changes.

## Before Publish

- Run the full project test suite.
- Generate a fresh API snapshot for the release branch.
- Compare the release snapshot against the last published version.
- Confirm the changelog matches the suggested release impact.
- Tag the release after CI passes.

## After Publish

- Commit or archive the release API snapshot.
- Link the API drift report from release notes when useful.
- Open follow-up issues for migration docs, downstream smoke tests, or PR automation improvements.

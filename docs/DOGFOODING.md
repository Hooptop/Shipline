# Dogfooding Shipline

Shipline tracks its own public programmatic API with a committed `api-snapshot.json` baseline.

Why this matters:

- Maintainers can see the tool running on a real package.
- Pull requests can detect accidental changes to Shipline's exported API.
- Release reviews have a concrete artifact to compare against.

## Updating The Baseline

Only update the baseline when a public API change is intentional.

```bash
bun install
bun run build
bun run snapshot:self
```

Then review the diff in `api-snapshot.json` before committing it.

## CI Behavior

The API Drift workflow builds Shipline, runs `shipline check` against `api-snapshot.json`, and uploads an API drift report artifact. A breaking public API change should be accompanied by release notes or migration guidance before the baseline is updated.

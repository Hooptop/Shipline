# Contributing

Thanks for helping improve Shipline.

## Local Setup

```bash
bun install
bun run typecheck
bun run test
bun run build
```

## Fixtures

Fixtures live under `fixtures/` and model package states:

- `before`
- `after-compatible`
- `after-breaking`

When changing extraction or comparison behavior, update or add fixtures and include tests that show the maintainer-facing impact.

## Pull Request Checklist

- [ ] Tests cover the behavior change.
- [ ] CLI behavior is documented if it changed.
- [ ] README or ROADMAP is updated when the maintainer workflow changes.
- [ ] Security-sensitive automation changes use minimum GitHub token permissions.

# API Drift Report

Shipline found 4 breaking public API changes. Suggested release impact: **major**.

- Before: `fixture-library@1.0.0`
- After: `fixture-library@2.0.0`
- Breaking changes: 4
- Compatible additions: 0
- Informational changes: 0

## Breaking Changes

| Export | Kind | Reason | Before | After |
| --- | --- | --- | --- | --- |
| `ApiError` | class | Export was removed. | `export class ApiError extends Error { ... }` |  |
| `ClientOptions` | interface | Public signature changed. | `token?: string` | `token: string` |
| `createClient` | function | Public signature changed. | `createClient(options)` | `createClient(options, timeoutMs)` |
| `RequestContext` | interface | Public signature changed. | `requestId` | `requestId, traceId` |

## Maintainer Checklist

- [ ] Confirm each breaking change is intentional.
- [ ] Add or update migration notes.
- [ ] Update changelog with a major-version entry.
- [ ] Check README and docs examples for old API usage.
- [ ] Consider downstream smoke tests before release.

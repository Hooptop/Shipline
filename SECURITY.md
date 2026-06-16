# Security Policy

## Supported Versions

The latest minor release receives security fixes.

## Reporting A Vulnerability

Please open a private security advisory on GitHub or contact the maintainer by email if listed on the GitHub profile. Do not open a public issue for active vulnerabilities.

## Automation Safety

Shipline may run in GitHub Actions on pull request content. Treat source files, package metadata, and generated reports as untrusted inputs.

Security expectations:

- Do not execute analyzed package code.
- Keep GitHub Actions permissions to `contents: read` unless a workflow explicitly needs more.
- Do not print secrets into API drift reports.
- Avoid shelling out with user-controlled paths.
- Keep generated reports as artifacts by default before enabling write-capable PR comments.

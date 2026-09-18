# Security Policy

## Supported versions

Security fixes are applied to the default branch (`main`) of this repository. Preview / feature branches are not supported for production use.

## Reporting a vulnerability

If you discover a security issue, please **do not** open a public GitHub issue.

Email: **ghostcat.0to1@ik.me** (security)  
Product / licensing: **hqe.moreira@gmail.com**

Include:

- A short description of the issue
- Steps to reproduce (if possible)
- Affected URL, commit SHA, or package version
- Impact assessment (what an attacker could do)

You should receive an acknowledgement within a few days. Please allow reasonable time for assessment and remediation before any public disclosure.

## Scope

In scope (examples):

- Exposure of secrets or PII through this application or its API routes
- Auth bypass on Advisor unlock / magic-link verification
- Injection or XSS in user-controlled fields that reach stored or rendered output
- Dependency vulnerabilities that are exploitable in this deployment

Out of scope (examples):

- Denial of service against third-party APIs (Neon, Mistral, Resend, Vercel)
- Issues that require already-compromised cloud credentials
- Social engineering of the operator’s personal accounts

## Secrets & configuration

- Never commit API keys, tokens, service-account JSON, or live connection strings.
- Use `.env.local` locally (gitignored) and platform secret stores (Vercel / GitHub Actions) for deployed environments.
- Placeholders only in [`.env.example`](./.env.example).
- Required runtime secrets: `NEON_DATABASE_URL`, optional `MISTRAL_API_KEY`, `RESEND_API_KEY` / `RESEND_FROM`.
- SEO ops scripts may use Google credentials under `~/.config/gryps/` (never under the repo tree).

## Application notes

- GRYPS is a **non-commercial research prototype**. Advisor runs may store abbreviated assessments and optional email for unlock — treat as personal data under GDPR-style minimization.
- Deterministic Signature scores are not AI-generated; optional Mistral prose must not invent availability %, SLAs, or live telemetry.
- Rate limiting on `/api/advise` is soft / prototype-grade — not a hardened edge WAF.

## Dependency updates

Dependabot opens weekly PRs for npm and GitHub Actions. Review majors separately (Next.js / React are ignored for automatic major bumps).

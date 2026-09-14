# Security Policy

## Supported versions

Security fixes are applied to the default branch (`main`) of this repository.

## Reporting a vulnerability

If you discover a security issue, please **do not** open a public GitHub issue.

Email: ghostcat.0to1@ik.me

Include:

- A short description of the issue
- Steps to reproduce (if possible)
- Impact assessment (what an attacker could do)

You should receive an acknowledgement within a few days. Please allow reasonable time for assessment and remediation before any public disclosure.

## Secrets

Never commit API keys, tokens, or credentials. Use environment variables and platform secret stores (e.g. Vercel / GitHub Actions secrets). See `.env.example` when present.

# Next.js security upgrade — 2026-11-19

Branch: `chore/next-security-upgrade` (worktree `gryps-next-security`)  
Base: `aeb9a61` (Plan 1 mining reference)  
Status: **ready for review — do not merge until approved**

## Original vulnerability (prompt that stopped `next dev`)

Installed: **next@16.4.0** (affected).

| Advisory | Severity | Issue | Patched |
| --- | --- | --- | --- |
| [GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr) | Critical | Unauthenticated RCE in `use cache` returning typed arrays | ≥16.4.1 |
| [GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw) | Critical | RCE in Image Optimization when SVG used (upstream / sharp path) | ≥16.4.1 (full line fixes through 16.4.5+) |
| [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r) | High | DoS via Server Actions / App Router | ≥16.4.1 |
| [GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h) | High | Cross-tenant cache disclosure (`unstable_cache` + `use cache`) | ≥16.4.5 |
| [GHSA-vc7v-qv4w-wrv8](https://github.com/advisories/GHSA-vc7v-qv4w-wrv8) + related Nov 2026 cache/SVG/cookie issues | Medium | Nested `use cache` / shell poisoning / SVG / Edge cookie | ≥16.4.5 |

References: [Oct 14 2026 security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026), [Nov 2026 security release](https://nextjs.org/blog/november-2026-security-release).

## Packages upgraded

| Package | From | To |
| --- | --- | --- |
| `next` | ^16.4.0 (resolved 16.4.0) | **16.4.6** (exact) |
| `eslint-config-next` | ^16.4.0 | **16.4.6** (exact) |
| `zod` (override) | 4.4.3 (transitive via `@mistralai/mistralai`) | **4.6.7** |

Unchanged: `react` / `react-dom` **19.3.0**, Vercel config (`vercel.json` empty `{}`), App Router usage. No major framework migration.

## Security audit

- `npm audit --omit=dev`: **0 vulnerabilities** after upgrade + zod override.
- Full `npm audit`: **8 moderate** remaining — `minimatch` via `typescript-eslint` (dev) and `qs` via `googleapis` (SEO scripts). Not Next.js production runtime.

## Compatibility notes

- GRYPS does not use `"use cache"`, `unstable_cache`, or Server Actions in app code (grep clean) — still upgraded because advisories recommend patching regardless.
- Existing `sharp` override `0.35.5` retained (SVG/image path guidance).
- Stay on Next **16.4.x** Active LTS patch line (avoid 17 / major).
- React remains **19.3.0**; `vercel.json` unchanged (`{}`).

## Verification results (this worktree)

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass (0 errors; 12 pre-existing warnings) |
| `npm run test:score` | Pass |
| `npm run build` (Next 16.4.6) | Pass — 56 routes |
| `npm audit --omit=dev` | **0** vulnerabilities |
| Hero engine | Score **83 · B**, first option **OneWeb · 85** |
| `POST /api/advise` (same inputs) | Score **83 · B**, OneWeb · 85, `modelVersion=gryps-signature-v0.4`, empty top_risks |
| Homepage (prod `next start :3001`) | Mining reference + model register + Advisor prefills |
| Mobile nav | Menu expands Explore / Assess / Research links |
| FI copy in data | Present in `HERO_CLAIMS_REGISTER` / `COPY.fi` (automation lang toggle flaky; strings verified in source) |

## Outstanding risks (accept for merge review)

1. **8 moderate** (dev/tooling): `minimatch` via `typescript-eslint`; `qs` via `googleapis` SEO scripts — not Next production runtime.
2. Dependabot may still flag GitHub repo-level advisories until this branch is merged.
3. No merge / deploy performed from this branch.

## Recommended merge decision

**Approve merge when ready** — Next critical/high advisories for 16.4.0–16.4.4 are resolved by **16.4.6**; production audit clean; Plan 1 Signature parity unchanged. Merge as a **separate** PR from product UI work; do not combine with feature development.

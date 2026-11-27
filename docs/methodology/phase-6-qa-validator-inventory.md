# Phase 6 — QA validator inventory

**Document version:** `gryps-qa-validator-inventory-v0`  
**Sprint:** P6-S2  
**Recorded:** 2026-11-27  
**Baseline:** `development/phase-4-evidence-integrity` @ `dc73abc`

## Summary

| Command                                    | Deterministic      | Network | Credentials        | Writes DB/files                              | CI (after P6-S2)     |
| ------------------------------------------ | ------------------ | ------- | ------------------ | -------------------------------------------- | -------------------- |
| `npm run lint`                             | Yes                | No      | No                 | No                                           | Yes                  |
| `npm run format:check`                     | Yes                | No      | No                 | No                                           | Yes                  |
| `npm run typecheck`                        | Yes                | No      | No                 | No                                           | Yes                  |
| `npm run test:score`                       | Yes                | No*     | No                 | No                                           | Yes                  |
| `npm run test:fixtures`                    | Yes                | No*     | No                 | No                                           | **Added**            |
| `npm run test:evidence-pack`               | Yes                | No*     | No                 | No                                           | **Added**            |
| `npm run test:evidence-intake`             | Yes                | No*     | No                 | No                                           | **Added**            |
| `npm run test:dependency-lab`              | Yes                | No*     | No                 | No                                           | **Added**            |
| `npm run test:evidence`                    | Yes                | No*     | No                 | No                                           | **Added**            |
| `npm run test:boundaries`                  | Yes                | No*     | No                 | No                                           | **Added** (new)      |
| `npm run test:workflow`                    | Yes                | No*     | No                 | No                                           | **Added** (P6-S3)    |
| `npm run test:qa-agents`                   | Yes                | No*     | No                 | No                                           | **Added** (P6-S4)    |
| `npm run test:research-qa`                 | Yes                | No*     | No                 | No                                           | Local aggregate only |
| `npm run build`                            | Yes                | No*     | Placeholders in CI | No                                           | Yes                  |
| `scripts/compare-historical-vs-current.ts` | Yes (offline JSON) | No      | No                 | Writes optional out JSON if invoked that way | **Not in CI**        |

\* `npx --yes tsx` may fetch the `tsx` package on first use if not cached; no application network I/O. Prefer warm npm cache in CI (`npm ci`).

---

## Detail

### `npm run lint`

- **Checks:** ESLint across the repo
- **CI:** Yes (pre-existing)

### `npm run format:check`

- **Checks:** Prettier formatting
- **CI:** Yes (pre-existing)

### `npm run typecheck`

- **Checks:** `tsc --noEmit`
- **CI:** Yes (pre-existing)

### `npm run test:score` → `scripts/verify-deterministic.ts`

- **Checks:** `assertSanityCases()` + printed sanity scores (41·D, 78·B, 46·D, 95·A)
- **Homepage 83 · B:** Not equality-locked here (range sanity only)
- **CI:** Yes (pre-existing)

### `npm run test:fixtures` → `scripts/verify-provider-dependency-fixtures.ts`

- **Checks:** JSON schema/consistency of fixtures A–E; no Signature calculation
- **CI:** Added in P6-S2

### `npm run test:evidence-pack` → `scripts/verify-nordic-lapland-evidence-pack.ts`

- **Checks:** P5-S2 pack structure, unknowns, public-only rules; homepage **83 · B**
- **CI:** Added in P6-S2

### `npm run test:evidence-intake` → `scripts/verify-evidence-intake.ts`

- **Checks:** Synthetic intake cases A–G lifecycle rules; no Neon; homepage **83 · B**
- **CI:** Added in P6-S2

### `npm run test:dependency-lab` → `scripts/verify-dependency-research-panel.ts`

- **Checks:** Lab notices, fixture conclusions, separation from scoring imports; homepage **83 · B**
- **CI:** Added in P6-S2

### `npm run test:evidence` → `scripts/verify-evidence-integrity.ts`

- **Checks:** Evidence chain provenance, historical vs current labelling, Research Library notes; homepage **83 · B**
- **CI:** Added in P6-S2

### `npm run test:boundaries` → `scripts/verify-protected-boundaries.ts` (**new**)

- **Checks:** LICENSE + P5-S2 pack/trace SHA-256 locks; homepage input + recomputed **83 · B**; optional REVIEW BASELINE hashes if present; scoring watchlist hashes (informational)
- **CI:** Added in P6-S2
- **Limitation:** REVIEW packages absent from this worktree → `MANUAL` lines (not FAIL)

### `npm run test:research-qa` (**new aggregate**)

- Runs fixtures → pack → intake → dependency-lab → evidence → boundaries
- **CI:** Not a separate step (individual steps used instead for clearer logs)

### Not CI-integrated

| Item                               | Reason                                           |
| ---------------------------------- | ------------------------------------------------ |
| `compare-historical-vs-current.ts` | Offline research script; not a gate for every PR |
| SEO scripts                        | External APIs / credentials                      |
| Multi-agent orchestrator           | Explicitly excluded from P6-S2                   |

---

## Verification status (2026-11-27 local)

All of `test:score`, `test:fixtures`, `test:evidence-pack`, `test:evidence-intake`, `test:dependency-lab`, `test:evidence` returned exit 0 before CI wiring. Homepage regression observed as **83 · B**.

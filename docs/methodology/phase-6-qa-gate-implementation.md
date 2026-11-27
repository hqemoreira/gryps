# Phase 6 — QA gate implementation (P6-S2)

**Document version:** `gryps-qa-gate-implementation-v0`  
**Sprint:** P6-S2  
**Recorded:** 2026-11-27  
**Status:** Deterministic foundation implemented. Multi-agent orchestration **not** implemented.

## What changed

| Artefact                                                       | Change                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                                     | Added research validators + `test:boundaries` as named failing steps    |
| `package.json`                                                 | Added `test:boundaries`, `test:research-qa`                             |
| `scripts/verify-protected-boundaries.ts`                       | New boundary verifier                                                   |
| `docs/methodology/fixtures/protected-boundaries-manifest.json` | Expected LICENSE + P5-S2 hashes; homepage scenario; optional REVIEW     |
| Task / QA templates                                            | `phase-6-development-task-template.md`, `phase-6-qa-report-template.md` |
| Inventory                                                      | `phase-6-qa-validator-inventory.md`                                     |

## Gate mapping (A–F → P6-S2 reality)

| Gate                         | Implementation now                                        |
| ---------------------------- | --------------------------------------------------------- |
| **A** Task definition        | Template: `phase-6-development-task-template.md` (manual) |
| **B** Automated verification | CI steps + local npm scripts; fail on nonzero exit        |
| **C** Specialist agents      | **Not activated** — deferred to later QA phases           |
| **D** Adversarial agent      | **Not activated**                                         |
| **E** QA decision            | Human fills `phase-6-qa-report-template.md` from evidence |
| **F** Human approval         | Still required for scoring/pack/Neon/REVIEW/deploy        |

## CI step order

1. ESLint
2. Prettier check
3. TypeScript
4. `test:score`
5. `test:fixtures`
6. `test:evidence-pack`
7. `test:evidence-intake`
8. `test:dependency-lab`
9. `test:evidence`
10. `test:boundaries`
11. Production build (placeholder secrets only)

Any nonzero exit fails the job. Steps are named for log readability. Aggregate `test:research-qa` is for local use and is **not** duplicated as one CI step (avoids opaque combined logs).

## Protected-boundary behaviour

| Asset                                           | Automation                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| LICENSE                                         | SHA-256 must match manifest → **FAIL** on drift                                                                                       |
| P5-S2 `pack.json` + `sources-traceability.json` | SHA-256 must match → **FAIL** on drift                                                                                                |
| Homepage **83 · B**                             | Export + recomputed Signature must match → **FAIL**                                                                                   |
| REVIEW-01/02 BASELINE.md                        | If found (worktree or `../gryps/`), hash-checked; if absent → **MANUAL** note (not FAIL)                                              |
| Scoring engine files                            | Watchlist hashes printed; drift alone does **not** FAIL (prevents brittle lock). Scoring changes still need Gate F + must keep 83 · B |
| Neon                                            | Verifiers perform no writes; intake asserts `writesToNeon: false`                                                                     |

### Manual verification still required

1. Before REVIEW handover: confirm REVIEW BASELINE hashes on the main checkout if this worktree lacks `review-package*`.
2. Before any scoring edit: human Gate F + update acceptance criteria; do **not** change expected 83 · B to greenwash.
3. Manifest hash updates for LICENSE/P5-S2 are themselves Gate F events — update only with explicit approval and recorded reason.

## Explicit non-goals (still out)

- Multi-agent QA orchestrator
- Autonomous code-modifying agents
- Model v0.5
- Closing D-01–D-13
- External outreach

## How to run locally

```bash
npm run test:score
npm run test:research-qa
npm run lint
npm run typecheck
npm run build
```

Or rely on CI after a PR to `main`.

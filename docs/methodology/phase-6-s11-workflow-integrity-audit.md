# P6-S11 — Research Workflow Integrity Audit

**Date:** 2026-11-27  
**Branch:** `development/phase-4-evidence-integrity` @ `dc73abc`  
**Method:** Code inspection + deterministic journey simulation (no live AI)

## Initial findings (before changes)

| Stage | Pre-fix status | Evidence |
| --- | --- | --- |
| 1 Site | PASS | Explicit save; fields required; session localStorage |
| 2 Scenario | PASS | Explicit save; UNKNOWN providers preserved (P6-S8) |
| 3 Dependencies | PASS | Explicit ack; lab deep-link with `from=workflow` |
| 4 Evidence | PARTIAL | Binder + annotations (S9/S10); association counts not surfaced; ack honest |
| 5 Assessment | PARTIAL | Match-based link (S8); **stale linked id still marked complete** |
| 6 Comparison | PARTIAL | Needs ≥2 assessments; **missing compare ids not warned** |
| 7 Report | PARTIAL | Export distinctions (S9/S10); **no explicit support-intent section** |

### Cross-cutting gaps (concrete)

1. `linkKind` was only `associated` — no explicit support-intent (S10 recommendation).
2. `stageStatus(assessment)` treated `assessmentLinked` as complete even when the assessment id was deleted.
3. Workspace deep-link with missing `id` did not warn (could appear empty without explanation).
4. Compare UI did not state that missing selected ids are not substituted.
5. No automated seven-stage journey / audit matrix test.

## Stage-by-stage audit matrix (after P6-S11)

| Stage | Status | Notes |
| --- | --- | --- |
| Site | **PASS** | Coords/session restore; no auto-complete on view |
| Scenario | **PASS** | Sector/autonomy/criticality; UNKNOWN providers not invented |
| Dependencies | **PASS** | Explicit ack; lab context preserved |
| Evidence | **PASS** | Binder + association counts visible; counts ≠ complete |
| Assessment | **PASS** | Match link; stale detected; clear-stale control; Advisor deep-link |
| Comparison | **PASS** | ≥2 required; missing-id warning; no silent substitute |
| Report | **PASS** | Export associations + support intent + classifications + disclaimer |

Verified by `npm run test:workflow-integrity` (all seven rows PASS).

## Existing functionality reused

- P6-S8 workflow session, Advisor/Lab/Workspace deep-links, match-based assessment link  
- P6-S9 evidence binder catalog + export distinctions  
- P6-S10 annotation store + persisted associations  
- Existing workspace assessment array (no new registry)

## Implemented changes (gap-only)

- `supportIntent` on associations (`none` default; explicit `setAssociationSupportIntent`)
- `resolveLinkedAssessment` + stale-aware `stageStatus`
- Workflow UI: stale banner, clear link, association count honesty
- Workspace: stale initial id banner; compare missing-id warning
- Export: Explicit support intent section
- `lib/research/workflow-integrity.ts` + `test:workflow-integrity`

## Remaining limitations (not FAIL)

- Comparison engine still pairwise UI (no deeper engine) — deferred by design  
- Browser-local persistence only  
- Live AI paused  
- Manual browser click-path not automated (Playwright N/A this phase)  

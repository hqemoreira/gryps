# Phase 6 — Platform completion audit (P6-S8)

**Document version:** `gryps-platform-completion-audit-v0`  
**Recorded:** 2026-11-27  
**Baseline branch:** `development/phase-4-evidence-integrity`  
**HEAD:** `dc73abc` (does **not** include accumulated uncommitted Phase 1–6 work)  
**Working tree:** Dirty (~56 short-status lines at audit start) — preserve; do not treat as one new task.

## Classification key

| Label        | Meaning                                             |
| ------------ | --------------------------------------------------- |
| **COMPLETE** | Implemented and verified by code + automated checks |
| **PARTIAL**  | Present but incomplete vs target                    |
| **MISSING**  | Not implemented                                     |
| **BLOCKED**  | External dependency prevents completion             |
| **DEFERRED** | Deliberately out of current prototype scope         |

Documentation alone is never COMPLETE.

---

## 1. Phase 6 sprint stack

| Sprint                               | Status                                   | Evidence                                                             |
| ------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------- |
| P6-S1 Architecture / roadmap / gates | COMPLETE (docs)                          | `phase-6-*-architecture*.md`, quality gates, roadmap                 |
| P6-S2 CI validators + boundaries     | COMPLETE                                 | `scripts/verify-*.ts`, `.github/workflows/ci.yml`, `test:boundaries` |
| P6-S3 Research workflow              | COMPLETE (integration) / PARTIAL (depth) | `/research/workflow`, `workflow-context.ts`, `test:workflow`         |
| P6-S4 Mock multi-agent QA            | COMPLETE                                 | `lib/qa/*`, seeded defects, `test:qa-agents`                         |
| P6-S5 Change-aware task QA           | COMPLETE                                 | task definition, inventory, impact map, `test:task-qa`               |
| P6-S6 Execution + snapshots          | COMPLETE                                 | validator-execution, snapshots, attribution, `test:qa-execution`     |
| P6-S7 Live AI reviewers              | BLOCKED                                  | Adapters exist; Mistral 402 billing; live paused by product choice   |

---

## 2. Target research workflow (7 stages)

| Stage        | Status           | Evidence                                                                            |
| ------------ | ---------------- | ----------------------------------------------------------------------------------- |
| Site         | COMPLETE         | Workflow form + explicit save; lat/lng gate                                         |
| Scenario     | COMPLETE         | Sector / autonomy / criticality; empty providers = UNKNOWN                          |
| Dependencies | COMPLETE         | Dependency Lab deep-link + ack; non-scoring                                         |
| Evidence     | PARTIAL          | Library/knowledge/methodology links + ack; no session↔pack binder UI                |
| Assessment   | PARTIAL→improved | Advisor deep-link; **P6-S8:** UNKNOWN providers preserved; matching assessment link |
| Comparison   | PARTIAL          | Workspace compare reused; deeper engine DEFERRED                                    |
| Report       | PARTIAL→improved | Markdown export; **P6-S8:** `mode=export` deep-link; hashed package DEFERRED        |

---

## 3. Target platform components

| Component                          | Status                                | Notes                                            |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------ |
| Assessment engine (v0.4)           | COMPLETE                              | Frozen; `test:score`; homepage **83 · B**        |
| Dependency Lab + fixtures          | COMPLETE                              | Routes + CI validators                           |
| Evidence intake / packs            | COMPLETE (libs) / PARTIAL (UI binder) | Synthetic intake + P5-S2 pack immutable          |
| Research Library / Knowledge       | COMPLETE                              | Content surfaces                                 |
| Workspace compare / export         | COMPLETE (basic)                      | Limitations/assumptions in markdown              |
| Unified workflow UI                | COMPLETE (P6-S3)                      | `/research/workflow`                             |
| First-class site registry          | DEFERRED                              | Architecture target                              |
| Versioned scenario records         | DEFERRED                              |                                                  |
| Reproducible hashed report package | DEFERRED                              |                                                  |
| Sensitivity simulation UI          | DEFERRED                              |                                                  |
| Live multi-agent QA                | BLOCKED                               | P6-S7; EU/retention/training/free capacity unmet |

---

## 4. QA infrastructure

| Capability                   | Status   | Label rule                           |
| ---------------------------- | -------- | ------------------------------------ |
| Deterministic validators     | COMPLETE | Real exit codes required for PASS    |
| Mock agents                  | COMPLETE | Always MOCK — never “independent AI” |
| Task snapshots / attribution | COMPLETE | P6-S6                                |
| Decision gate                | COMPLETE | Authoritative                        |
| Live providers               | BLOCKED  | Do not call in P6-S8                 |

---

## 5. Critical gaps addressed in P6-S8

1. UNKNOWN providers no longer left as Advisor hero defaults (`buildAdvisorHref` + `app/page.tsx`).
2. Report stage deep-links `mode=export`.
3. Assessment link requires input match (not blind “latest”).
4. Workspace `from=workflow` return banner.
5. `test:workflow` extended for these contracts + export integrity.

## 6. Remaining / deferred

- Evidence binder UI; knowledge/library return banners.
- Hashed reproducible report package.
- Live AI (P6-S7) until provider policy satisfied.
- D-01–D-13, Model v0.5, Neon evidence vault, outreach — DEFERRED / protected.

## 7. Protected boundaries (unchanged)

Model v0.4 · homepage **83 · B** · P5-S2 v0 · REVIEW-01/02 · LICENSE · no Neon schema/data writes · no unsupported independence claims.

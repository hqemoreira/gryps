# P6-S12 — Phase 1–6 Development Inventory

**Audit date:** 2026-11-27  
**Branch:** `development/phase-4-evidence-integrity` @ `dc73abc`  
**Method:** Code + docs + automated validators (not documentation alone)  
**VCS note:** All Phase 1–6 GRYPS development remains **uncommitted** relative to HEAD.

---

## Phase 1–3 — Foundational implementation

| Field | Record |
| --- | --- |
| Objective | Next.js research prototype: Advisor, Model v0.4 Signature, Research Library, map, methodology |
| Main implementation | `app/`, `components/`, `lib/deterministic-score.ts`, `lib/scoring.ts`, `lib/hero-demo.ts`, `lib/research-library.ts`, workspace assessments |
| Documentation | Site pages `/methodology`, `/research-prototype`, `/limitations`, `/assumptions` |
| Automated verification | `test:score` (deterministic cases); homepage 83 · B |
| Known limitations | Optional Mistral prose in scoring path when key present; Neon optional for stored signatures |
| Status | **COMPLETE** (as research foundation; uncommitted) |

## Phase 4 — Evidence integrity

| Field | Record |
| --- | --- |
| Objective | Evidence kinds, provenance, integrity validators |
| Main implementation | `lib/evidence-kinds.ts`, `lib/evidence-model.ts`, `scripts/verify-evidence-integrity.ts` |
| Documentation | Methodology evidence sections |
| Automated verification | `test:evidence` |
| Known limitations | Display-chain notices; not field validation |
| Status | **COMPLETE** |

## Phase 5 — Methodology and research evidence pack

| Field | Record |
| --- | --- |
| Objective | Provider-dependency fixtures; Nordic Lapland public pack; intake lifecycle |
| Main implementation | `lib/research/dependency-fixtures.ts`, `lib/research/evidence-packs.ts`, `lib/research/evidence-intake.ts`, pack JSON under `docs/methodology/evidence-packs/` |
| Documentation | Pack + fixture methodology docs |
| Automated verification | `test:fixtures`, `test:evidence-pack`, `test:evidence-intake`, `test:dependency-lab` |
| Known limitations | Pack does not establish dual-path independence; D-01–D-13 open |
| Status | **COMPLETE** (research envelope; D-items **DEFERRED**) |

## P6-S1 — Architecture and QA foundations

| Field | Record |
| --- | --- |
| Objective | Target research-platform architecture; QA gate concepts |
| Main implementation | Docs + early `lib/qa/` scaffolding |
| Documentation | `phase-6-target-research-platform-architecture.md`, `phase-6-research-platform-architecture-audit.md`, quality-gate docs |
| Automated verification | Later suites built on this foundation |
| Known limitations | Architecture aspirational in places; map below reflects as-built |
| Status | **COMPLETE** (foundational docs/gates) |

## P6-S2 — Validator and boundary integration

| Field | Record |
| --- | --- |
| Objective | Protected boundaries; CI wiring; immutable pack/LICENSE hashes |
| Main implementation | `scripts/verify-protected-boundaries.ts`, `.github/workflows/ci.yml` |
| Documentation | QA validator inventory |
| Automated verification | `test:boundaries` |
| Known limitations | Scoring-engine hashes informational (drift does not fail) |
| Status | **COMPLETE** |

## P6-S3 — Research workflow

| Field | Record |
| --- | --- |
| Objective | Seven-stage local research workflow |
| Main implementation | `lib/research/workflow-context.ts`, `components/ResearchWorkflowView.tsx`, `/research/workflow` |
| Documentation | `phase-6-research-workflow-integration.md`, `phase-6-s3-qa-completion-report.md` |
| Automated verification | `test:workflow` |
| Known limitations | Explicit stage acks; no Neon |
| Status | **COMPLETE** |

## P6-S4 — Mock multi-agent QA

| Field | Record |
| --- | --- |
| Objective | Deterministic mock multi-agent QA pipeline |
| Main implementation | `lib/qa/mock-agents.ts`, `scripts/verify-multi-agent-qa.ts` |
| Documentation | `phase-6-multi-agent-qa-*.md` |
| Automated verification | `test:qa-agents` (mock mode) |
| Known limitations | **Not** independent live AI review |
| Status | **COMPLETE** |

## P6-S5 — Change intelligence

| Field | Record |
| --- | --- |
| Objective | Task-level change-aware QA decisions |
| Main implementation | `lib/qa/change-aware-agents.ts`, `scripts/verify-task-qa.ts` |
| Documentation | `phase-6-task-qa-integration.md` |
| Automated verification | `test:task-qa` |
| Known limitations | Synthetic/mock scenarios |
| Status | **COMPLETE** |

## P6-S6 — Execution hardening

| Field | Record |
| --- | --- |
| Objective | Snapshot attribution; execution gates; refuse illicit synthetic PASS |
| Main implementation | QA execution/snapshot modules; `scripts/verify-qa-execution.ts` |
| Documentation | `phase-6-execution-hardening.md` |
| Automated verification | `test:qa-execution` |
| Known limitations | Local snapshot store under `.qa/` (gitignored) |
| Status | **COMPLETE** |

## P6-S7 — Live AI infrastructure

| Field | Record |
| --- | --- |
| Objective | Live reviewer adapters (Mistral + OpenAI-compatible) with cost gates |
| Main implementation | `lib/qa/live/*`, `scripts/verify-live-qa.ts` |
| Documentation | `phase-6-live-ai-agents.md` |
| Automated verification | `test:qa-live` → infrastructure **PASS**; genuine live reviews **BLOCKED** without `GRYPS_QA_LIVE=1` + approve + billing |
| Known limitations | Prior live attempt blocked (billing/402); EU/retention posture; free capacity |
| Status | **BLOCKED** (live execution) / infrastructure **COMPLETE** |

## P6-S8 — Research platform integration

| Field | Record |
| --- | --- |
| Objective | UNKNOWN→Advisor honesty; export deep-link; matching assessment link; return banners |
| Main implementation | Workflow + workspace + Advisor hydration fixes |
| Documentation | `phase-6-platform-completion-*.md` |
| Automated verification | `test:workflow` extensions |
| Known limitations | None material beyond local-only |
| Status | **COMPLETE** |

## P6-S9 — Evidence Binder

| Field | Record |
| --- | --- |
| Objective | Structured binder catalog tying evidence to research contexts |
| Main implementation | `lib/research/evidence-binder.ts`, `EvidenceBinderPanel.tsx`, `test:evidence-binder` |
| Documentation | `phase-6-s9-*.md` |
| Automated verification | `test:evidence-binder` |
| Known limitations | Derived catalog; export companion non-crypto |
| Status | **COMPLETE** |

## P6-S10 — Persistent annotations

| Field | Record |
| --- | --- |
| Objective | USER_SUPPLIED annotations + assessment associations (local) |
| Main implementation | `lib/research/evidence-annotation-store.ts`, `EvidenceAnnotationPanel.tsx`, `test:evidence-annotations` |
| Documentation | `phase-6-s10-*.md` |
| Automated verification | `test:evidence-annotations` |
| Known limitations | Browser localStorage sibling store; no cloud sync |
| Status | **COMPLETE** |

## P6-S11 — Workflow integrity

| Field | Record |
| --- | --- |
| Objective | E2E stage audit; support intent; stale assessment handling |
| Main implementation | `lib/research/workflow-integrity.ts`, supportIntent, stale UI, `test:workflow-integrity` |
| Documentation | `phase-6-s11-*.md` |
| Automated verification | `test:workflow-integrity` (7/7 PASS) |
| Known limitations | No Playwright |
| Status | **COMPLETE** |

## P6-S12 — Release-readiness (this phase)

| Field | Record |
| --- | --- |
| Objective | Inventory, journey verification, technical readiness, freeze |
| Main implementation | Audit docs only (no product-scope expansion) |
| Documentation | `phase-6-s12-*.md` |
| Automated verification | Full `test:research-qa` + `test:qa-live` + `tsc` + `build` |
| Known limitations | See readiness report |
| Status | **COMPLETE** (audit/freeze) |

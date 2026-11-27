# Phase 6 — Development roadmap

**Document version:** `gryps-phase-6-development-roadmap-v0`  
**Sprint:** P6-S1 (planning complete)  
**Recorded:** 2026-11-27  
**Baseline:** `development/phase-4-evidence-integrity` @ `dc73abc`

## Immediate next implementation phase

**P6-S2 — QA-Phase 1 + research platform stabilisation (foundation)**

Stabilize the already-built but largely uncommitted Phase 4–5 research stack under Gate A–B discipline, **without** activating multi-agent orchestration yet and **without** changing Model v0.4.

Suggested scope (implementation sprint — not this document):

1. Task template + protected-file checklist + QA report stub (QA-Phase 1).  
2. Wire Dependency Lab into IA navigation (discoverability only).  
3. Add Phase 4/5 validators to CI when those paths are committed (`test:fixtures`, `test:dependency-lab`, `test:evidence-pack`, `test:evidence-intake`, `test:evidence` as applicable).  
4. Confirm homepage **83 · B** remains locked across those gates.  
5. Do **not** start Model v0.5; do **not** mutate P5-S2 v0; do **not** outreach.

---

## Dependencies

| Depends on | Why |
| --- | --- |
| Preserved uncommitted Phase 1–5 / ENG work | Source of Lab, intake, packs, ENG docs |
| Existing CI on `main` | Extend, do not replace |
| P5-S4/S5 gates | Any later live evidence |
| ENG-01 permission gates | Before REVIEW-02 distribution |
| ENG-02 Stage 3+ gates | Before industrial contact |
| Human Gate F | Scoring, packs, Neon, deploy |

---

## Protected boundaries (all Phase 6 work)

- REVIEW-01 / REVIEW-02  
- LICENSE  
- Model v0.4 scoring rules / weights / thresholds (unless Gate F)  
- P5-S2 nordic-lapland-dual-path-**v0** immutability  
- Neon / production data (no historical rewrites)  
- No agent self-approval, commit, push, merge, deploy  
- No claiming external validation complete  
- Public posture: Research · Prototype · Experimental  

---

## Acceptance criteria for P6-S1 (this sprint)

| Criterion | Met? |
| --- | --- |
| Architecture audit of actual implementation | Yes — audit doc |
| Target layered architecture defined | Yes |
| Eight QA agent roles + permissions defined | Yes |
| Mandatory quality gates A–F defined | Yes |
| Roadmap with next phase + external deps | Yes |
| No production code / scoring / Neon / pack / REVIEW / LICENSE changes | Yes |
| No agents activated; no commits/pushes/deploys | Yes |

---

## QA requirements for all subsequent Phase 6 tasks

Per `phase-6-development-quality-gates.md`:

- Gate A brief with acceptance criteria and protected list  
- Gate B applicable automated checks (always include `test:score` when assessment/UI paths touched)  
- Gate C: Requirements + Test + Regression auditors always; Domain/Evidence/Security as triggered  
- Gate D adversarial review  
- Gate E orchestrator status  
- Gate F human when scoring/DB/security/pack/release  

Homepage regression input must remain **83 · B** for relevant changes.

---

## Phased agent implementation (QA-Phase 1–5)

| Phase | Focus | Exit criterion |
| --- | --- | --- |
| **QA-1** | Task template, acceptance criteria, test requirements, QA report format, protected-file checks | Template used on next real change |
| **QA-2** | CI: typecheck/lint/build + research validators + regression fail-closed | PR cannot merge with failed mandatory checks |
| **QA-3** | Specialist agent instructions; permissions; reports; drill on known defects | Agents catch seeded failures |
| **QA-4** | Orchestration; aggregate PASS/FAIL/BLOCKED | Orchestrator refuses PASS on missing reviews |
| **QA-5** | Escaped-defect tracking; reduce false positives; evaluate multi-model only if justified | Metrics show useful independent findings |

Do **not** claim QA reliability until QA-3 known-failure drills pass.

---

## Product build sequence (after QA foundation starts)

| Order | Theme | Notes |
| --- | --- | --- |
| 1 | Stabilise Lab + fixtures + pack loaders under CI | Layer 2/3 |
| 2 | Research-site / scenario versioning (thin) | No Signature mutation |
| 3 | Evidence binder UI (public/synthetic) | Intake lifecycle |
| 4 | Comparison bench (historical vs current) | Script → UI |
| 5 | Reproducible report export | Hashes + unknowns |
| 6 | Optional simulation / sensitivity | Disclosed as simulated |

---

## What remains dependent on external validation

| Item | Dependency |
| --- | --- |
| Phase 3 engine critique findings | Named reviewers + signed REVIEW-02 permission |
| Provider architecture confirmation (L3+) | P5 T-xx outreach after gates |
| Site-confirmed dependencies / pilot | ENG-02 industrial Stages 3–9; willing participant |
| Operational measurements | Explicit site consent + safety/security |
| Closing D-01–D-13 | Human + review evidence — not agent alone |
| Model v0.5 | Separate approved programme after review inputs |
| “Field-validated Signature” claims | **Never** from QA alone; requires evidence ladder + human approval — and still must not over-claim |

---

## Stop (P6-S1)

Planning documents only. Next implementation work begins only under a new task with Gate A completed.

# Phase 6 — Multi-agent QA architecture

**Document version:** `gryps-phase-6-multi-agent-qa-v0`  
**Sprint:** P6-S1 design; **P6-S4 mock pipeline activated** (see `phase-6-multi-agent-qa-implementation.md`)  
**Recorded:** 2026-11-27 · Updated 2026-11-27

## Purpose

Every future GRYPS development change must be **traceable, automatically tested, independently challenged, and explicitly approved** before acceptance. Agents interpret gaps and attack assumptions; **deterministic tests** own pass/fail for regressions.

Multiple agents do **not** automatically equal independent verification. Prefer tests for hard gates; agents for interpretation, coverage gaps and adversarial challenge.

---

## 1. Agent roles

### Agent 1 — QA Orchestrator

| | |
| --- | --- |
| **Receives** | Task brief, acceptance criteria, risk class, diff summary, list of required agents |
| **Does** | Assigns roles; collects reports; emits final QA status |
| **Must not** | Mark PASS if a required test or reviewer failed or did not run; grant human approvals; commit/push/deploy |

### Agent 2 — Requirements and Acceptance Auditor

| | |
| --- | --- |
| **Does** | Trace each acceptance criterion; detect scope creep and missing requirements; confirm prohibited files untouched |
| **Output** | Requirement-by-requirement table: Pass / Fail / Blocked + evidence (paths, commands) |

### Agent 3 — Test Engineer

| | |
| --- | --- |
| **Does** | Review coverage; propose/add tests in a **test-only** workflow; run unit/integration/edge cases |
| **Must not** | Silently change production logic to make tests pass |
| **Standard** | Tests must fail on incorrect behaviour, not only exercise code |

### Agent 4 — Domain and Model Auditor

| | |
| --- | --- |
| **Triggers** | Assessment logic, dependency semantics, resilience terminology |
| **Does** | Check provider-diversity vs independence; conclusions vs evidence; open D-items |
| **Rule** | Scoring/model changes → **human approval** mandatory; agent only recommends |

### Agent 5 — Evidence and Provenance Auditor

| | |
| --- | --- |
| **Triggers** | Evidence packs, intake, library notes, historical labels |
| **Does** | Source dates, maturity/status, synthetic flags, UNKNOWN/contradiction visibility, pack immutability |

### Agent 6 — Security and Privacy Auditor

| | |
| --- | --- |
| **Triggers** | Auth, env, DB, restricted evidence, dependency upgrades |
| **Does** | Secrets, exposure, restricted handling, sensitive infrastructure disclosure |
| **Rule** | Findings stand even though GRYPS is a research prototype |

### Agent 7 — Regression and Integration Auditor

| | |
| --- | --- |
| **Does** | Affected routes/workflows; `test:score` / research validators; homepage **83 · B**; protected modules |
| **Must** | Fail if homepage baseline or Model v0.4 behaviour regresses unexpectedly |

### Agent 8 — Adversarial Reviewer

| | |
| --- | --- |
| **Does** | Falsify the change; find misleading UX; hidden assumptions; failures happy-path tests miss |
| **Must not** | Be instructed to approve; rubber-stamp the authoring agent |

---

## 2. Independence and permissions

| Rule | Enforcement |
| --- | --- |
| Task + acceptance criteria + relevant diff only | Orchestrator strips unrelated secrets |
| No unnecessary secrets / restricted evidence | Agents never receive `.env` contents or confidential vault data |
| Independent reports before synthesis | Orchestrator aggregates after all required reports land |
| Cite verifiable evidence | Code paths, test logs, hashes — not vibes |
| No self-approval | Authoring agent ≠ sole Requirements or Adversarial reviewer |
| No production logic edits during review | Fix proposals = **new** change, re-enter gates |
| No commit / push / merge / deploy | Hard ban for all QA agents |
| No model weight / threshold / scoring edits without approval | Domain Auditor + Gate F |
| No “external validation complete” mark | Orchestrator cannot close ENG/P5 validation |

---

## 3. Technology options (evaluate; do not lock prematurely)

| Approach | Fit | Caution |
| --- | --- | --- |
| Existing npm scripts + GitHub Actions CI | Deterministic Gate B | Extend CI to Phase 4/5 tests; already on `main` |
| Repository QA instructions / Cursor rules / skills | Role prompts + Gate A templates | Not independent unless paired with tests |
| Cursor multi-agent / Task subagents | Parallel specialist reviews | Same-vendor correlation risk; still need tests |
| Structured Markdown/JSON QA reports in `docs/` or CI artefacts | Audit trail | Keep out of production bundles |
| Future multi-model orchestration | Optional challenge diversity | Only if escaped-defect metrics justify cost |

**Preference:** deterministic automated tests for PASS/FAIL; agents for interpretation, gap detection, adversarial review. Avoid unnecessary paid infrastructure until benefits are measured (QA-Phase 5).

---

## 4. Report formats (required fields)

### Per-agent report

- Agent id and role  
- Task id  
- Scope reviewed (paths)  
- Findings (blocking / non-blocking)  
- Evidence citations  
- Status: Pass | Fail | Blocked | Not run  

### Orchestrator summary

- Required agents and statuses  
- Automated check matrix  
- Final status: PASS | PASS WITH NON-BLOCKING FINDINGS | FAIL | BLOCKED  
- Human approval required? (list Gate F triggers)  

---

## 5. Known-defect proving (before claiming reliability)

QA-Phase 3 must test agents against **seeded failures**, e.g.:

- Homepage score silently changed  
- Synthetic fixture treated as operational independence  
- P5-S2 pack mutated  
- Scoring constant edited without approval flag  
- Evidence UNKNOWN removed  

Until those drills pass, do **not** claim the QA system is reliable.

---

## 6. Activation status

**P6-S1:** architecture documented.  
**P6-S4:** mock-agent pipeline + seeded-defect suite + CI (`test:qa-agents`) activated.  
**Live LLM agents:** not activated; selecting `live_unimplemented` yields **BLOCKED**, never silent PASS.

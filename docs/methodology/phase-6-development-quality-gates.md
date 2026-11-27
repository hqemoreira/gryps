# Phase 6 — Development quality gates

**Document version:** `gryps-phase-6-quality-gates-v0`  
**Sprint:** P6-S1 (specification only)  
**Recorded:** 2026-11-27  
**Companion:** `phase-6-multi-agent-qa-architecture.md`

## Rule

No development task is accepted without completing Gates A–E. Gate F applies whenever listed triggers fire. A blocked or failed check must **never** be reported as passed.

---

## Gate A — Task definition

Before implementation:

| Required | Content |
| --- | --- |
| Approved scope | What will change / what will not |
| Acceptance criteria | Testable checklist |
| Protected files / boundaries | Scoring, Neon, REVIEW, LICENSE, P5-S2 v0, secrets, … |
| Risk classification | Low / Medium / High / Scoring-critical / Security-critical |
| Expected test coverage | Which npm scripts + new tests |

**Output:** task brief stored with the change (PR description or methodology note).

---

## Gate B — Automated verification

Run **applicable** checks from:

| Check | Command / artefact |
| --- | --- |
| Unit / research validators | `test:score`, `test:evidence`, `test:fixtures`, `test:dependency-lab`, `test:evidence-pack`, `test:evidence-intake` as relevant |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Format | `npm run format:check` |
| Build | `npm run build` (with CI placeholders for secrets) |
| Schema / data validation | Fixture/pack/intake verifiers |
| Security | Dependency review / secret scan where relevant |
| Regression | Homepage **83 · B**; affected route smoke |

**CI today:** lint, format:check, typecheck, test:score, build (on `main`).  
**Target:** fail CI when mandatory research validators for touched paths are missing or failing.

Missing mandatory check ⇒ **FAIL** or **BLOCKED**, not PASS.

---

## Gate C — Specialist agent review

### Always required

1. Requirements and Acceptance Auditor  
2. Test Engineer  
3. Regression and Integration Auditor  

### Mandatory when domain affected

| Change touches… | Also require |
| --- | --- |
| Scoring, caps, grades, model constants | Domain and Model Auditor (+ Gate F) |
| Evidence, packs, intake, provenance | Evidence and Provenance Auditor |
| Auth, env, DB, restricted data, deps | Security and Privacy Auditor |
| Dependency Lab / resilience terminology | Domain and Model Auditor |

Agents report independently; orchestrator synthesises later.

---

## Gate D — Independent challenge

Adversarial Reviewer examines implementation **and** test results.

Must attempt to falsify the feature. Must not be instructed to approve.

---

## Gate E — QA decision (Orchestrator)

| Status | Meaning |
| --- | --- |
| **PASS** | All mandatory automated checks + required reviews Pass |
| **PASS WITH NON-BLOCKING FINDINGS** | Pass, with documented non-blocking issues |
| **FAIL** | Any mandatory check/review Fail |
| **BLOCKED** | Cannot complete (missing env, missing review, protected conflict) |

Orchestrator **must not** PASS if a required test or reviewer failed or did not run.

---

## Gate F — Human approval

Agents may **recommend**; only a human may **approve** when any of:

- Scoring / Model-version changes  
- Database migrations  
- Production data changes  
- Security-sensitive changes  
- Evidence-pack changes (including new versions)  
- Release / deployment  
- Closing external validation or D-items  

---

## GRYPS-specific regression requirements

### Homepage baseline (every relevant change)

| Field | Value |
| --- | --- |
| Latitude | 67 |
| Longitude | 26 |
| Industry | mining |
| Operating mode | remote-operated |
| Criticality | high |
| Providers | Starlink, Iridium |
| Expected Signature | **83** |
| Expected grade | **B** |

Regression correctness ≠ scientific validity. Do not add tests that claim Model v0.4 is field-validated.

### Always protect

- Model v0.4 scoring behaviour  
- Evidence provenance and historical labels  
- Dependency Lab separation from scoring  
- Synthetic fixture identification  
- UNKNOWN semantics  
- P5-S2 v0 immutability  
- REVIEW-01/02 integrity  
- LICENSE integrity  

---

## Standard task → QA pipeline

```text
Gate A (brief)
  → implement
  → Gate B (automated)
  → Gate C (specialists)
  → Gate D (adversarial)
  → Gate E (orchestrator status)
  → Gate F (human, if triggered)
  → accept or return
```

Proposed code fixes from agents re-enter at Gate A/B as a **new** change.

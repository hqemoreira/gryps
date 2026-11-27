# Phase 6 — Platform completion plan (P6-S8)

**Document version:** `gryps-platform-completion-plan-v0`  
**Recorded:** 2026-11-27  
**Companion:** `phase-6-platform-completion-audit.md`

## Posture

Bring the **research prototype** to a coherent, internally verifiable end-to-end path. Live AI reviewers remain **paused** (P6-S7 BLOCKED / policy). Mock reviews stay labelled MOCK/SYNTHETIC.

---

## Priority tiers

### Critical for prototype completion

| Item                                                       | Action in P6-S8                                                   | Status   |
| ---------------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| UNKNOWN catalogue providers must survive Advisor deep-link | Emit `providers=` + `providersUnknown=1`; Advisor clears defaults | Done     |
| Report stage must open export                              | `buildWorkspaceHref(..., "export")`                               | Done     |
| Do not link unrelated “latest” assessment                  | `findMatchingSavedAssessment`                                     | Done     |
| Workflow honesty tests                                     | Extend `test:workflow`                                            | Done     |
| Keep deterministic QA green                                | Re-run research QA suite                                          | Required |

### Important for research quality

| Item                                                | Notes                                 |
| --------------------------------------------------- | ------------------------------------- |
| Workspace return banner from workflow               | Done (P6-S8)                          |
| Evidence/knowledge `from=workflow` banners          | Optional follow-up                    |
| Export always shows Assumptions / Limitations       | Covered by export + tests             |
| Comparison disclaimer (score ≠ measured resilience) | Existing copy; deepen later if needed |

### Useful but optional

| Item                                    | Notes |
| --------------------------------------- | ----- |
| Session `setup` field in workflow UI    | Low   |
| Pre-select linked assessment in compare | Low   |
| Richer missing-information panel        | Low   |

### Future development (DEFERRED)

| Item                                                              | Gate                      |
| ----------------------------------------------------------------- | ------------------------- |
| Hashed reproducible report package                                | Separate sprint           |
| Evidence binder UI + pack attach                                  | After public/synthetic UX |
| First-class site registry / scenario versioning                   | Architecture target       |
| Live AI reviewers (EU host, no retention/training, free capacity) | Provider policy           |
| Model v0.5 / close D-01–D-13                                      | Human + review programme  |
| Field / industrial validation                                     | ENG-02 gates              |

---

## Implementation rules (ongoing)

1. Prefer modular fixes over redesign.
2. Reuse Advisor, Lab, Workspace, Library.
3. No Model v0.4 / P5-S2 / REVIEW / LICENSE / Neon mutations.
4. No live model API calls in this phase.
5. Every meaningful change gets an automated assertion.
6. Never treat MOCK/SYNTHETIC as live independent review.

---

## Recommended next development phase (after P6-S8)

**P6-S9 candidate:** Evidence binder (public/synthetic) + workflow return banners on Library/Knowledge + optional export package v0 (JSON companion with input snapshot + model id + open unknowns — still without claiming certification).

Live AI remains out of scope until a provider meets the stated European / retention / training / capacity criteria.

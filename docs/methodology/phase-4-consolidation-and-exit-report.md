# Phase 4 — Consolidation and exit readiness

Sprint 12 consolidation report. Worktree `C:\GitHub\Projects\gryps-phase-4-evidence`, branch `development/phase-4-evidence-integrity`, HEAD `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`.

**This report does not claim** that Phase 4 establishes real-world satellite resilience or validates Model v0.4 as an operational product.

## Baseline confirmed (Sprint 12)

| Check | Result |
| --- | --- |
| Active worktree / branch | `gryps-phase-4-evidence` · `development/phase-4-evidence-integrity` |
| HEAD | `dc73abc` (unchanged; Sprints 1–11 remain uncommitted on this branch) |
| `lib/deterministic-score.ts` / `lib/scoring.ts` | Diff empty vs HEAD — Model v0.4 arithmetic untouched |
| REVIEW-01 / REVIEW-02 | Not present in this worktree; live under main checkout `C:\GitHub\Projects\gryps\review-package*` — **not modified by this worktree** |
| LICENSE | Not modified |
| Neon writes | None in Phase 4 sprints (read-only audits only) |
| D-01–D-13 | Remain open (status not changed) |

### Sprint 1–11 change surface (summary)

Uncommitted / new artefacts spanning evidence provenance, Research Library honesty, historical comparison scripts, dependency specification, Fixtures A–E, Dependency Research Lab, terminology corrections, and validators. Production scoring modules were deliberately excluded from edits.

## Completed

### Evidence provenance and historical attribution

- Evidence kinds including STORED; grafted display chains marked `chainOrigin: display`
- Research Library seed notes: historical stored vs fresh v0.4 miss path
- Composite `real_data_score` removed from primary Signature presentation
- Dual-path / unrecorded model-version disclosures on seed assessments

### Stored versus current assessment distinctions

- Sprint 5 historical-vs-current comparison (33 `signature_sites`) documented
- Sprint 6 Research Library provenance correction (catalogue claims vs engine)
- Display chains do not rewrite stored scores or invent model versions

### Historical database provenance audit

- Live Neon read-only counts and enrichment provenance documented in Phase 4 methodology notes
- No historical score recalculation; no Neon mutation

### Dependency model specification and terminology

- Hybrid catalogue + dependency graph research model specified
- Canonical glossary: **Catalogue confidence** · **Provider diversity** · **Catalogue-based orbit mix** · **Unknown** · evidenced independence only with evidence
- UI remaps for Signature component labels (engine payload strings frozen)

### Fixtures A–E and validation

| Fixture | Role |
| --- | --- |
| A | Architecture-class contrast; independence UNKNOWN |
| B | Catalogue orbit mix; independence UNKNOWN |
| C | Synthetic shared infrastructure |
| D | Synthetic scoped positive separation |
| E | Synthetic contradictory / temporal evidence |

Validators: `verify-provider-dependency-fixtures.ts`, `verify-dependency-research-panel.ts`

### Dependency Research Lab

- Route `/research/dependency-lab` (research preview, `noindex`, not in main nav)
- Sections A–E; Reference Signature vs research scenario separation (Sprint 11)
- Synthetic labelling; UNKNOWN copy; contradiction and scoped separation callouts

### Separation of research scenarios from homepage regression Signature

- Fixed **83 · B** reference strip labelled *Reference Signature — Homepage regression scenario*
- Fixture providers listed separately; notices forbid attributing 83 · B to the selected fixture

### Sprint 12 consolidation corrections

1. **Historical presentation:** Research assessment meta line no longer always prints `Deterministic Model v0.4`; stored rows show `Stored model · {displayModelVersion(...)}`.
2. **Glossary consistency:** Remaining “Catalog confidence” user-facing strings aligned to **Catalogue confidence**.
3. **Contradiction principles:** Added to `phase-4-dependency-data-model-specification.md` (human adjudication; no newer-always-wins).
4. **Lab discoverability:** Research Library aside link to `/research/dependency-lab` with experimental / non-scoring wording; route remains noindex; not in main nav.

## Still open

### Discrepancy register D-01 through D-13

Unchanged and **OPEN**. Notably D-01 (independent-path definition vs v0.4 encoding) and D-06 (path count = distinct catalogue ids). Engine composition labels still emit legacy “independent paths” / “path independence” strings (UI-remapped only).

### External independent review

REVIEW packages and external reviewer engagement were not executed or altered in this worktree. Phase 3 review artefacts remain on the main checkout.

### Database / historical evidence limitations

- Many `signature_sites` rows lack recorded `modelVersion` (`unrecorded`)
- Historical recommendation prose in Neon may still use “independent paths” language (display annotation deferred; no DB rewrite)
- Stored scores often differ from current-engine reproduction for free-text / legacy payloads (Sprint 5)

### Dependency relationships lacking real-world evidence

- Gateways, PoPs, backhaul, NOC, site power/terminals: **Unknown** in product data
- Fixtures A/B use only catalogue + architecture-class public sources; C–E are synthetic
- No field-validated dual-path independence claims

### Items requiring field or operational validation

- Site terminal counts and power domains
- Account-specific landing / gateway exposure
- Failover automation and traffic-class fit (broadband vs narrowband)
- Wholesale / MVNO resale chains

## Contradiction-handling principles (summary)

Documented in the dependency data model specification (Sprint 12 section):

- Assess claim specificity, authority, method, scope, and validity windows
- Choose supersede / qualify / contradict / leave unresolved — explicitly
- Human adjudication with a preserved decision record
- **No** automated ranking that picks a winner; **no** newer-always-wins rule
- Fixture E remains the structural demonstration of unresolved contradiction

## Historical presentation audit (Sprint 12)

| Path | Finding | Action |
| --- | --- | --- |
| `ResearchLibraryView` disclosure / CTA | Distinguishes fresh v0.4 from library cards | None required |
| Seed provenance notes | “Not recalculated or independently validated” | Correct as written (negation) |
| `ResearchAssessmentView` meta line | Always showed `SCORING_MODEL_LABEL` (v0.4) | **Corrected** to stored/fresh-aware label |
| `ResilienceOutput` provenance | Display-chain notice; STORED kind; model version via `displayModelVersion` | Adequate |
| Neon recommendation text | May still say “independent paths” | **Unresolved** — separate display-annotation sprint; no Neon write |
| Engine payload labels | Legacy independence wording | **Unresolved** — requires authorised engine-string pass without arithmetic change |

## Dependency Research Lab discoverability decision

**Decision: add a Research Library aside link.**

Rationale: Phase 4 produced a substantive research artefact that was otherwise URL-only; a labelled “Research preview” card clarifies experimental / non-scoring status without entering the Advisor journey or main navigation. Route stays `robots: noindex`.

## Phase 5 prerequisites

1. **Data required for validation** — Site terminal/power inventories; landing/PoP diversity attestations where disclosable; failover procedure evidence; traffic-class mapping.
2. **Public vs provider vs operational** — Catalogue/architecture-class public sources ≠ operator account docs ≠ measured RF / outage telemetry. Keep layers separate in provenance.
3. **Provenance recording** — Every claim needs source, retrieval date, geographic/technical scope, validity window, confidence class, and limitations; UNKNOWN remains first-class.
4. **What public evidence can test** — Constellation architecture-class contrasts; catalogue orbit/class mix behaviour; UI honesty / regression (83 · B).
5. **What needs external access or field collaboration** — Gateway exposure for a site account; shared teleport/fibre; site power topology; live dual-path continuity tests.

Phase 5 must **not** silently fold dependency edges into Model v0.4 weights. Any scoring change requires a named model bump and discrepancy-register decisions.

## Phase 4 exit assessment

Phase 4 is **research-complete for its stated scope**: evidence integrity presentation, historical honesty, dependency research model + fixtures + lab, terminology and contradiction principles, consolidation documentation.

Phase 4 is **not** an operational validation of satellite resilience, not closure of D-01–D-13, and not a substitute for external independent review.

**Exit posture:** ready to hand off artefacts for review and to plan Phase 5 evidence acquisition — without committing, deploying, or claiming product validation.

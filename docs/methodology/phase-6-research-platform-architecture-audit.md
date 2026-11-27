# Phase 6 — Research platform architecture audit

**Document version:** `gryps-phase-6-architecture-audit-v0`  
**Sprint:** P6-S1 (planning only)  
**Recorded:** 2026-11-27  
**Worktree:** `C:\GitHub\Projects\gryps-phase-4-evidence`  
**Branch:** `development/phase-4-evidence-integrity`  
**HEAD:** `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`

## Non-implementation statement

This audit documents **verified repository state**. It does not implement features, activate agents, change scoring, Neon, REVIEW packages, LICENSE, or the P5-S2 v0 pack. GRYPS remains a non-commercial research prototype — not operationally validated or independently certified.

## Classification key

| Label | Meaning |
| --- | --- |
| **Implemented** | Code and (where applicable) UI exist and are used |
| **Partial** | Present but incomplete, uncommitted, or not wired into CI/nav |
| **Spec only** | Methodology docs without product implementation |
| **Missing** | Required for the target research workflow; not found |
| **Blocked** | Depends on external evidence, participants, or signed permissions |

---

## 1. Baseline and working tree

| Item | Value |
| --- | --- |
| Branch | `development/phase-4-evidence-integrity` |
| HEAD | `dc73abc` — Merge branch `ui/prototype-status-chip` |
| Uncommitted | Large Phase 1–5 + ENG-01/02 tree preserved (modified app/components/lib + untracked `docs/methodology/`, `lib/research/`, Dependency Lab, verify scripts) |
| Commits this sprint | None |

---

## 2. Application

### 2.1 Routes and pages (verified `app/**/page.tsx`)

| Route | Role | Status |
| --- | --- | --- |
| `/` | Homepage + Advisor funnel + hero Signature | Implemented |
| `/map` | Map of assessed sites | Implemented |
| `/providers` | Provider landscape | Implemented |
| `/scenarios`, `/scenarios/[slug]` | Operational scenario pages | Implemented |
| `/signatures`, `/signatures/[slug]` | Stored / seed Signature pages | Implemented |
| `/research`, `/research/[slug]` | Research Library catalog + detail | Implemented |
| `/research/dependency-lab` | Dependency Research Lab (non-scoring) | **Partial** — page + view untracked; not in IA nav |
| `/workspace` | Local research assessments | Implemented |
| `/methodology`, `/knowledge`, `/data-sources`, `/assumptions`, `/limitations`, `/changelog` | Research quality docs | Implemented |
| `/research-prototype` | Public posture | Implemented |
| `/about`, `/case-study`, `/fi` | About / portfolio / Finnish summary | Implemented |
| Privacy / terms | Prototype legal pages | Implemented |

### 2.2 Main navigation

| Capability | Status | Notes |
| --- | --- | --- |
| Explore · Assess · Research IA (`lib/ia-nav.ts`) | Implemented | Map, Providers, Research Library, Scenarios, Advisor, Workspace, Methodology, Evidence, … |
| Dependency Lab in mega-menu | **Missing** | Route exists; not listed in `IA_MODES` |
| Prototype status chip | Implemented | Header |

### 2.3 Research workflows (user-facing)

| Workflow | Status |
| --- | --- |
| Score a site via Advisor (`/#advisor`) | Implemented — Model v0.4 |
| Save assessment locally (`lib/research-workspace.ts` → localStorage) | Implemented |
| Browse curated Research Library | Implemented — client catalog; server resolve in `lib/research-resolve.ts` |
| View methodology / limitations / data provenance | Implemented |
| Explore provider / infrastructure dependencies (Lab) | **Partial** — Lab UI + fixtures/pack loaders; uncommitted |
| Attach live site evidence to an assessment | **Missing** / **Blocked** (no named industrial volunteer; intake is research-only) |
| Export reproducible research report package | **Missing** |
| Compare historical vs current engine outcomes in UI | **Partial** — offline script `scripts/compare-historical-vs-current.ts` + JSON snapshot; no first-class UI |
| Scenario versioning as research objects | **Partial** — content scenarios exist; not a versioned research-site graph |

---

## 3. Data

| Domain | Implementation | Status |
| --- | --- | --- |
| Provider catalogue / redundancy tiers | `lib` catalog + Advisor inputs | Implemented |
| Mission / example scenarios | `lib/mission-scenarios.ts`, `/scenarios` | Implemented |
| Signature sites (Neon `signature_sites`) | `lib/signatures-db.ts` read path; CI uses placeholder URL | Implemented (read); writes outside this audit |
| Advisor / notify schemas | `lib/db-schema.ts` | Implemented |
| Mimir conversation log (optional Neon) | `lib/mimir/log.ts` | Partial — optional |
| Research Library catalog | `lib/research-library.ts` (client-safe) | Implemented |
| Research resolve (DB + scoring, server) | `lib/research-resolve.ts` | Implemented |
| Workspace persistence | Browser localStorage only | Implemented — no server sync |
| Dependency fixture model | `lib/research/dependency-fixtures.ts` + JSON fixtures | **Partial** (untracked tree) |
| Evidence packs (P5-S2) | `lib/research/evidence-packs.ts` + `docs/.../nordic-lapland-dual-path-v0/` | **Partial** (untracked); pack content immutable by policy |
| Evidence intake lifecycle | `lib/research/evidence-intake.ts` + synthetic cases | **Partial** — research-only; `writesToNeon: false` |
| Historical assessment provenance | Methodology docs + comparison script snapshot | Partial |
| Restricted / confidential vault | Spec in P5-S5 restricted handling | **Missing** operationally |

**Neon interactions observed:** Signature site reads; advisor schema ensure; optional Mimir logs. Evidence intake and dependency fixtures explicitly must **not** write Neon.

---

## 4. Assessment

| Item | Status |
| --- | --- |
| Model v0.4 deterministic engine | Implemented — `lib/deterministic-score.ts`, `lib/scoring.ts`, `lib/model-constants.ts`, `lib/hero-demo.ts` |
| Homepage regression **83 · B** | Implemented — `HERO_DEMO_*`; asserted in Lab/pack/intake verify scripts |
| Hard caps / Advisor `applyHardRules` | Implemented — D-02 remains open |
| D-01–D-13 | Spec + short form in REVIEW-02; **all open** — not closed in code |
| Current vs historical assessment labelling | Partial — Research Library notes; D-09/D-10 open |
| Dependency Lab separated from scoring | Implemented in design/notices; verified by `test:dependency-lab` script |
| Synthetic fixture identification | Implemented in fixture helpers |
| UNKNOWN semantics in dependency model | Implemented in fixtures / pack |
| Model v0.5 | **Missing** (correctly deferred) |

---

## 5. Quality and operations

| Capability | Status | Notes |
| --- | --- | --- |
| `npm run test:score` | Implemented | Sanity ranges + engine; in CI |
| `npm run typecheck` / `lint` / `format:check` / `build` | Implemented | CI on `main` PRs |
| `test:evidence`, `test:dependency-lab`, `test:evidence-pack`, `test:evidence-intake`, `test:fixtures` | **Partial** | Scripts in package.json / untracked tree — **not** in `.github/workflows/ci.yml` |
| Terrain / homepage equality script | Partial | Development-side; not REVIEW-02 |
| Multi-agent QA | **Missing** | Designed in P6 docs only |
| Structured QA report format | **Missing** | Spec in Phase 6 |
| Secrets | Env vars (`NEON_DATABASE_URL`, Mistral, Resend); CI placeholders | Implemented pattern; never commit `.env` |
| Logging / auditability of evidence decisions | Spec + intake model | Partial — no production audit store |
| Security / privacy boundaries | Prototype disclaimers; restricted-handling docs | Partial — no live confidential vault |

### CI (`.github/workflows/ci.yml`)

Runs on push/PR to `main`: lint → format:check → typecheck → **test:score** → build.  
Does **not** yet run Phase 4/5 research validators.

---

## 6. Capability matrix (summary)

| Capability | Class |
| --- | --- |
| Advisor + Model v0.4 Signature | Implemented |
| Research Library + methodology pages | Implemented |
| Local research workspace | Implemented |
| Neon signature reads | Implemented |
| Dependency Research Lab | Partial |
| Provider dependency fixtures A–E | Partial |
| P5-S2 Lapland pack (immutable) | Partial (present; policy-frozen) |
| Evidence intake (synthetic) | Partial |
| Field validation / industrial pilot | Spec + ENG-02; **Blocked** on participants |
| Phase 3 independent review handover | Spec; **Blocked** on permission + reviewers |
| Reproducible research export | Missing |
| Unified site→report research workflow UI | Missing / Partial |
| Multi-agent QA orchestration | Missing (this sprint designs it) |
| Model v0.5 | Missing (deferred) |

---

## 7. What remains to be developed (product)

1. Wire Dependency Lab into IA navigation and CI.  
2. Commit/stabilize Phase 4–5 research modules under quality gates.  
3. Research-site / scenario versioning layer (without mutating Signature).  
4. Evidence attachment UI bound to intake lifecycle (public/synthetic first).  
5. Comparison UI (historical vs current; scenario vs scenario).  
6. Reproducible report export.  
7. QA foundation → automated gates → agent roles (Phase 6 roadmap).  
8. External validation tracks remain gated (ENG-01/02, P5-S4).

---

## 8. Protected boundaries (unchanged this sprint)

REVIEW-01/02 · LICENSE · Model v0.4 scoring rules · P5-S2 v0 pack · Neon production data · no agent activation · no commit/push/deploy.

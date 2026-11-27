# Phase 4 — Resilience terminology audit

Sprint 8 audit on `development/phase-4-evidence-integrity` at HEAD `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`. Records UI/copy inspections and terminology corrections that accompany `phase-4-dependency-data-model-specification.md`.

**Scoring preserved.** `lib/deterministic-score.ts` and `lib/scoring.ts` were not modified. `hasOrbitMix`, provider counting, remaps, caps, and grades are unchanged. D-01 and D-06 remain OPEN.

## 1. UI locations inspected

| Area | Paths |
| --- | --- |
| Signature output | `components/ResilienceOutput.tsx` |
| Advisor explanations | `lib/advisor-intelligence.ts`, `lib/redundancy-tiers.ts`, `lib/compliance.ts` |
| Evidence package copy | `lib/evidence-model.ts` |
| Methodology | `app/methodology/MethodologyView.tsx`, `app/methodology/page.tsx` |
| Mimir retrieval | `lib/mimir/retrieve.ts` |
| Research Library / examples | `lib/research-library.ts`, `lib/example-signatures.ts` |
| Knowledge / scenarios | `lib/knowledge-articles.ts`, `lib/mission-scenarios.ts` |
| Provenance / FI summary | `lib/research-docs.ts`, `app/fi/FiSummaryView.tsx` |
| Hero comment | `lib/hero-demo.ts` |
| Engine payload (read-only) | `lib/deterministic-score.ts` composition labels and gap strings |

Also verified catalogue fields against `lib/providers.ts` and scoring provider list in `lib/deterministic-score.ts` (no field inventing).

## 2. Misleading terminology identified

| Claim implied by old copy | What v0.4 actually does |
| --- | --- |
| “Redundancy (independent paths)” | Counts distinct catalogue provider ids + optional catalogue orbit/class mix |
| “Provider / path independence” | Remapped mean catalog confidence — does not read `hasOrbitMix` (D-11) |
| “Correlated outage risk remains” when mix is false | Only shared orbit/class *labels* are known; shared outage is not verified |
| “Multiple independent paths strengthen failover” | Multiple catalogue ids raise the diversity indicator |
| Methodology: “An independent path requires … ground segment…” as if scored | Research definition conflated with what the engine counts |
| Mimir chunk equating independence to orbit/ground/failure mode as current scoring | Oversold v0.4 semantics |

## 3. Exact terminology changes

### Primary Signature UI (`ResilienceOutput.tsx`)

| Before | After |
| --- | --- |
| Redundancy (independent paths) | Redundancy (provider diversity indicator) |
| Provider / path independence | Catalog provider confidence |
| (none) | Added `componentDiversityNote`: catalogue characteristics ≠ independent ground/backhaul/ops/site dependencies |
| FI: Redundanssi (riippumattomat polut) | Redundanssi (toimittajien monimuotoisuusindikaattori) |
| FI: Toimittaja- / polkuriippumattomuus | Hakemiston toimittajaluottamus |
| Engine gap detail displayed as-is | Display remap for orbital-class concentration and “No independent failover path” strings (engine payload unchanged) |

### Explanations and adjacent copy

| File | Change summary |
| --- | --- |
| `lib/advisor-intelligence.ts` | Redundancy explanations no longer claim verified independent paths or correlated outage from labels alone |
| `lib/evidence-model.ts` | Connectivity characteristics and scoring summary use catalogue / diversity-indicator wording |
| `lib/redundancy-tiers.ts` | “Independent backup” → catalogue narrowband / diversity language with UNKNOWN caveats |
| `lib/compliance.ts` | “no independent failover path” → “no second catalogue-documented provider path” |
| `app/methodology/*` | Layer titles and formula prose distinguish research independence definition from v0.4 catalogue scoring |
| `lib/mimir/retrieve.ts` | Model-layer and independent-path chunks rewritten |
| `lib/research-docs.ts` | Provenance source string updated |
| `lib/knowledge-articles.ts` | Scoring component names and independence caveats |
| `lib/mission-scenarios.ts` | Scenario bullets avoid “independent paths” as proven fact |
| `lib/research-library.ts` / `lib/example-signatures.ts` | Pedagogical copy: catalogue mix ≠ end-to-end independence |
| `app/fi/FiSummaryView.tsx` | FI summary layer names aligned |
| `lib/hero-demo.ts` | Comment: dual catalogue LEO providers |

## 4. Remaining legitimate provider / orbit diversity language

These remain intentional and are **not** independence claims:

- Mentions of dual-path / dual-provider **catalogue** setups in Research Library pedagogy
- “Orbital diversity” / “orbital-class mix” as **catalogue classification** language
- Research definition of independence on Methodology (now explicitly *not* what v0.4 verifies)
- Sprint 7/8 methodology docs discussing independence as an open research question
- Code comments / variable names such as `provider_independence` (internal id; UI label remapped)
- “Terrain score is independent of the Resilience Score” (unrelated meaning)

## 5. Engine payload strings left unchanged (by design)

`lib/deterministic-score.ts` still emits:

- composition label `"Redundancy (independent paths)"`
- composition label `"Provider / path independence"`
- gap detail `"Providers share the same orbital class — correlated outage risk remains."`
- lever phrasing `"independent path"` vs `"backup path"`

**Reason.** Sprint scope forbids modifying that file. UI remaps composition labels via `componentLabel()` and remaps selected gap details on display. A future sprint that is allowed to touch engine strings (still without changing arithmetic) should align the payload labels with the UI.

## 6. Confirmation — scoring semantics unchanged

- No edits to `lib/deterministic-score.ts` or `lib/scoring.ts`
- No weight, remap, cap, grade, or `hasOrbitMix` changes
- Homepage regression target remains **83 · B** (Starlink + Iridium at 67°N hero demo)
- D-01 / D-06 / D-11 remain OPEN in the discrepancy register (not edited)
- No Neon writes; no historical score recalculation; no REVIEW package edits

## 7. Residual open copy questions

1. When may engine composition labels be renamed without a model version bump?
2. Should Research Library historical *stored* recommendation prose (Neon/DB) be re-authored in a later sprint, or left as historical language with provenance notes only?
3. Finnish Knowledge articles beyond the scoring-component string may still use older pedagogical phrasing — audit remaining FI bodies if a localisation pass is scheduled.

## 8. Sprint 9 terminology consistency correction

Sprint 8 renamed the v0.4 `provider_confidence` UI label to **“Catalog provider confidence”**. That wording still risked blending **Catalogue confidence** (the scoring component) with **provider diversity** (distinct selected providers / redundancy layer).

### Canonical glossary (required)

| Concept | Required terminology |
| --- | --- |
| Existing v0.4 scoring component (`provider_confidence` / remapped 0–25) | **Catalogue confidence** |
| Different selected catalogue provider ids | **Provider diversity** |
| Combination of catalogue orbit/class labels (`hasOrbitMix`) | **Catalogue-based orbit mix** |
| Demonstrated infrastructure independence | Only when supported by sufficient evidence |
| Missing dependency information | **Unknown** |

### Sprint 9 UI remaps

| Location | Correction |
| --- | --- |
| `ResilienceOutput` EN | `Catalog provider confidence` → **Catalogue confidence**; redundancy short label → **Redundancy (provider diversity)** |
| `ResilienceOutput` FI | → **Hakemistoluottamus**; **Redundanssi (toimittajien monimuotoisuus)** |
| Diversity note | States that provider diversity, catalogue-based orbit mix, and Catalogue confidence are distinct; none prove infrastructure independence |
| Methodology / Mimir / Knowledge / evidence / research-docs / FI summary | Aligned to the glossary |

### Still unchanged (engine payload)

`lib/deterministic-score.ts` still emits `"Provider / path independence"` and `"Redundancy (independent paths)"`. UI remapping remains the only correction path until an explicitly authorised engine-string pass (no arithmetic change).

### Remaining ambiguous wording

- Internal field id `provider_independence` / `provider_confidence` (code identifiers — not user-facing once remapped)
- Historical Neon recommendation prose may still say “independent paths” (see `phase-4-dependency-fixture-validation.md` §9 — no rewrite this sprint)
- Engine gap string “correlated outage risk remains” still remapped only on display

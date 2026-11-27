# Phase 4 — Dependency research validation

Sprint 11. Branch `development/phase-4-evidence-integrity` @ `dc73abc`. Extends the Dependency Research Lab with Signature/fixture context correction and Fixtures D–E. No Model v0.5; no v0.4 scoring changes; no Neon writes.

## 1. Signature / fixture context correction

**Problem.** Sprint 10 showed the homepage regression Signature (83 · B, Starlink + Iridium) beside selectable fixtures whose providers could differ, risking the implication that 83 · B came from the selected fixture.

**Correction.**

| UI element | Label / behaviour |
| --- | --- |
| Section A | **Reference Signature — Homepage regression scenario** |
| Notice | States providers/inputs are not necessarily those of the selected fixture; research does not contribute to the score |
| New block | **Dependency research scenario** with fixture id, purpose, and **Fixture providers** |
| Catalogue section | Explicitly “(fixture)” so classifications belong to the research scenario |

Reference providers and fixture providers are listed separately. No recalculation; fixtures remain disconnected from the scoring engine.

## 2. Fixture D — positive separation

`fixture-d-synthetic-positive-separation.json`

- Fictional providers: FrostPeak Link, GlacierMesh  
- Distinct fictional landings: North Yard vs South Yard  
- `separated_from` with `confidence: documented` scoped to ground landing yards  
- Network, operations, and site layers remain **Unknown**  
- All evidence `synthetic_test` / `isSynthetic: true`  

**Conclusion:** Evidence supports separation of the specified infrastructure dependency within the stated scope. This does not establish complete end-to-end independence.

## 3. Fixture E — contradictory evidence

`fixture-e-synthetic-contradictory-evidence.json`

- Fictional providers: Norrsken Path, MidnightSun Link  
- Contested `depends_on` Kola Test Fibre hop with `confidence: contradicted`  
- Earlier synthetic evidence (published 2024-03-15, valid 2024–2025) claims shared hop  
- Later synthetic evidence (published 2026-06-01, valid from 2026) claims MidnightSun alternate hop  
- Later record **qualifies** earlier; it does **not** `supersedes` as resolved truth  
- Both evidence rows retained  

**Conclusion:** Available evidence conflicts. The dependency relationship cannot currently be classified as established or absent.

## 4. Temporal evidence and supersession

Fixture E demonstrates:

1. Earlier record preserved (`ev-synth-e-earlier-shared`).  
2. Later record linked via `qualifies` / `qualifiedBy`, not silent overwrite.  
3. Different scopes (account-wide 2024 vs MidnightSun 2026).  
4. Publication and validity dates shown in the evidence panel.  
5. Explicit rule: newer date alone does not select the correct claim.

## 5. UNKNOWN semantics validation

Validators and fixtures enforce:

| Rule | Enforcement |
| --- | --- |
| UNKNOWN ≠ independent | `mustNotInfer` + panel copy |
| UNKNOWN ≠ shared | Same |
| Absence ≠ evidence of absence | Empty `evidenceIds` on unknown rows |
| Separation is scoped | Fixture D scope label + remaining Unknown layers |
| Shared does not imply all layers shared | Fixture C keeps site Unknown; Fixture D separates only ground |
| Contradiction stays unresolved | Fixture E `contradicted` + conclusion text |
| No scores/probabilities | `containsScoreOrProbability: false` on all fixtures |

## 6. Interface changes

- Fixtures A–E selectable tabs  
- Reference vs research scenario labelling  
- Fixture providers list  
- Positive separation callout (scoped)  
- Contradiction / unresolved status callout  
- Evidence validity window + temporal link fields  
- Synthetic banner for C/D/E  

Route remains `/research/dependency-lab` (noindex, not in main nav).

## 7. Validator and test results

Commands:

- `npx tsx scripts/verify-provider-dependency-fixtures.ts` — A–E  
- `npm run test:dependency-lab`  
- `npm run test:evidence` — homepage **83 · B**  
- `npm run test:score`  
- `npm run typecheck`  
- `npm run build`  

## 8. Remaining limitations

- No production dependency graph or Neon persistence  
- No automated authority ranking for conflicting sources (by design)  
- Real-world gateway/PoP evidence still absent  
- Engine payload labels in `deterministic-score.ts` still legacy (UI remapped elsewhere)  
- Historical Neon recommendation prose still deferred  

## 9. Recommendations for Phase 4 consolidation

1. Freeze the dependency research glossary and fixture schema (`gryps-dependency-fixture-v0.1`) as the Phase 4 research artefact set.  
2. Keep Model v0.4 arithmetic frozen; treat D-01/D-06 as open until a named future model bump.  
3. Optionally add a one-line “open research lab” link from methodology docs only — still not main nav.  
4. Schedule a separate historical-prose display annotation sprint if needed.  
5. Do not promote fixtures into scoring inputs without an explicit model version change.  

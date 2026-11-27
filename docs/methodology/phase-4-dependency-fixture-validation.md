# Phase 4 — Dependency fixture validation

Sprint 9 validation of the hybrid catalogue + dependency-graph research model using three non-scoring fixtures. Branch `development/phase-4-evidence-integrity` @ `dc73abc`. No Model v0.5; no v0.4 scoring changes; no Neon writes.

Fixtures: `docs/methodology/fixtures/provider-dependency-fixtures/`  
Validator: `scripts/verify-provider-dependency-fixtures.ts`

## 1. What each fixture demonstrates

| Fixture | Demonstrates | Does **not** demonstrate |
| --- | --- | --- |
| **A** Starlink + OneWeb | Different providers, different constellations, different architecture *classes* (ISL mesh vs bent-pipe). Provider diversity true; catalogue-based orbit mix **false**. | End-to-end independence; shared or separate gateways/backhaul/site |
| **B** Starlink + Iridium | Different providers, different service classes (broadband vs narrowband), catalogue-based orbit mix **true**. Catalogue labels ≠ infrastructure proof. | Verified path independence; Catalogue confidence as independence; narrowband as broadband substitute |
| **C** Synthetic shared dependency | Two fictional providers with distinct constellations that both `connects_through` one shared fictional landing; common failure domain | Anything about real operators; probabilities; Signature impact |

**Research conclusions (from fixtures):**

- A: *Different constellation architecture classes are represented. End-to-end infrastructure independence remains UNKNOWN.*
- B: *The catalogue represents different provider and service characteristics. End-to-end infrastructure independence remains UNKNOWN.*
- C: *Two otherwise distinct paths depend on the same explicitly modelled infrastructure entity. A failure of that entity could affect both paths.*

## 2. Entity model sufficiency

**Sufficient** for A–C with Sprint 8 kinds: `service_provider`, `constellation`, `ground_facility`, `failure_domain`.

GroundFacility was correctly **omitted** in A/B (no evidence → do not invent). Instantiated only in C with synthetic evidence.

**Missing concept discovered:** a first-class **`catalogueClassification` snapshot** on the fixture/assessment, so provider diversity and catalogue-based orbit mix are not stored only as tribal knowledge about `hasOrbitMix`. Added to the specification in Sprint 9.

## 3. Relationship types sufficiency

**Sufficient.** Used: `offers`, `exposed_to`, `connects_through`, `shares_infrastructure_with`.

No new verb required. Explicit **`direction`** and **`unknownRelationships[]`** were missing from the Sprint 8 prose and are now required.

## 4. Evidence provenance sufficiency

**Mostly sufficient** after adding:

- `isSynthetic` + `evidenceType: synthetic_test` (Fixture C)
- Retrieval dates and limitations on every row
- Ban on citing UNKNOWN rows with evidence ids

Geographic scope and temporal validity were useful as fixture metadata even when precision is `global` / `unspecified`. They prevent silent site binding.

## 5. How UNKNOWN was represented

Explicit `unknownRelationships[]` entries for ground, network, operations, and site layers in A/B (and site in C), each with `mustNotInfer`. Validator rejects UNKNOWN rows that carry evidence ids or that promote `separated_from` without evidence.

**Absence of an edge is no longer treated as enough** — fixtures must declare the UNKNOWN questions.

## 6. Distinctions enforced (not interchangeable)

| Claim type | Fixture A | Fixture B | Fixture C |
| --- | --- | --- | --- |
| Different providers | yes | yes | yes (fictional) |
| Different constellations | yes | yes | yes (fictional) |
| Different service types | no (both broadband) | yes (broadband vs narrowband) | no |
| Different infrastructure | Unknown | Unknown | Shared landing evidenced (synthetic) |
| Demonstrated separation of a named dependency | no | no | no (demonstrates *shared* dependency) |
| End-to-end independence | UNKNOWN | UNKNOWN | Not claimed; shared entity couples paths |

## 7. Specification revisions required

Yes — see Sprint 9 additions in `phase-4-dependency-data-model-specification.md`:

1. `catalogueClassification` snapshot  
2. `unknownRelationships[]` with `mustNotInfer`  
3. `direction` on relationships  
4. `isSynthetic` / `synthetic_test` evidence  
5. Fixture metadata flags (`researchConclusion`, `claimsNotToMake`, no score/probability)

## 8. Limitations remaining unresolved

- No real gateway/PoP evidence pipeline  
- No conflicted-evidence fixture yet (`contradicted` status unused)  
- No `separated_from` positive example (would need real or synthetic separation evidence)  
- Wholesale/MVNO resale still unmodelled  
- Fixtures are not wired to UI (correct for this sprint)

## 9. Limited audit — historical recommendation prose

**No Neon rewrite in this sprint.**

| Risk | Finding |
| --- | --- |
| Current UI labels vs historical stored prose | UI now says **Catalogue confidence**, **provider diversity**, **catalogue-based orbit mix**. Historical Neon recommendation paragraphs (where present) may still say “independent paths” from older model eras. |
| Research Library seed notes (repo) | Sprint 6 dual-path provenance notes remain; context copy for Inari now states catalogue mix ≠ end-to-end independence. Phrase “independently validated” in provenance notes means *not re-validated by GRYPS*, not path independence — low confusion risk. |
| Authored example signatures | Sprint 8 softened independence overclaims in `lib/example-signatures.ts`. |
| Interpretation risk | A user reading a **stored** historical recommendation beside the new UI labels could still hear “independent” as verified infrastructure independence. Mitigation belongs in a **separately scoped** historical-prose audit that preserves the record (display annotation / provenance), not silent DB rewrite. |

## 10. Validation run

```text
OK  fixture-a-starlink-oneweb
OK  fixture-b-starlink-iridium
OK  fixture-c-synthetic-shared-dependency
Provider dependency fixtures validated (3 files).
No Signature calculated. Research-only.
```

## 11. Scoring / data confirmation

- `lib/deterministic-score.ts` / `lib/scoring.ts` unchanged  
- D-01–D-13 remain open  
- REVIEW packages and LICENSE untouched  
- No database writes  

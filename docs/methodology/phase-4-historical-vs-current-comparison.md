# Phase 4 — Historical vs current assessment comparison

Sprint 5 diagnostic on `development/phase-4-evidence-integrity` at HEAD `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`. Read-only Neon inspection and local recalculation only. No database writes. No scoring-formula changes. REVIEW-01 and REVIEW-02 untouched.

Labels:

- **Verified.** Observed from Neon aggregates or from a local `scoreSiteSync` run on this branch.
- **Interpretation.** An explanation of those observations. Not a claim that the current engine is “correct.”

## 1. Data retrieval method

1. Shell env had no `NEON_DATABASE_URL`. `.env` was not opened.
2. Read-only SQL via Neon MCP against project `gryps` (`billowing-glade-14791411`), default branch.
3. Selected columns only: `id`, `slug`, coordinates, sector, autonomy, criticality, `current_setup`, country/municipality, enrichment numerics, and from `output` only score, grade, modelVersion presence, evidence presence, risk/gap/caveat/option counts, and top provider name. Recommendation bodies were truncated prefixes for diagnosis and are not reproduced here.
4. A compact input snapshot was written locally as `scripts/_sprint5-historical-inputs.json` for reproducible recalculation without re-querying Neon.
5. For each row with complete inputs, this branch’s `scoreSiteSync` was run with those exact stored field values (`scripts/compare-historical-vs-current.ts`). Fresh results use `MODEL_VERSION` = `gryps-signature-v0.4`.

No personal or account data was queried. Site names and free-text setups are research seed content already present in the repository’s `lib/seed-sites.ts` pattern.

## 2. Records examined

| Item | Count |
| --- | ---: |
| `signature_sites` rows examined | **33** |
| Rows with populated `output` | **33** |
| Rows with recorded `output.modelVersion` | **0** |
| Rows with stored `output.evidence` | **0** |
| Rows with enrichment (`real_data_score` or terrain/gap components) | **32** |

## 3. Reproducible with exact inputs

| Item | Count |
| --- | ---: |
| Valid comparisons (lat, lng, sector, autonomy, criticality present) | **33** |
| Non-reproducible (missing required inputs) | **0** |

`current_setup` was present on all 33 rows. The comparison uses that string as stored. It does **not** claim the historical score was produced by today’s free-text provider parser.

## 4. Non-reproducible

None. Category F count: **0**.

## 5. Historical vs current scores (valid comparisons)

All 33 reproducible rows differ in score and/or grade from a fresh `scoreSiteSync` on the same stored inputs.

| Aggregate | Value |
| --- | --- |
| Rows with score or grade difference (class B) | **33 / 33** |
| Rows with identical score and grade | **0** |
| Grade changed | **16** |
| Top recommended provider string changed | **24** |
| Mean absolute score delta | **14.09** |
| Minimum score delta (fresh − historical) | **−42** |
| Maximum score delta | **+35** |

Score-delta buckets (fresh − historical):

| Bucket | Count |
| --- | ---: |
| ≤ −30 | 2 |
| −29 … −15 | 7 |
| −14 … −1 | 3 |
| +1 … +14 | 16 |
| +15 … +29 | 4 |
| ≥ +30 | 1 |

Largest absolute deltas (slugs only; no recommendation prose):

| Slug | Historical | Fresh | Δ |
| --- | --- | ---: | ---: |
| `site-15-bodo-arctic-port` | 65 · C | 23 · F | −42 |
| `site-25-jokkmokk-power-station` | 65 · C | 27 · F | −38 |
| `site-30-nuorgam-northernmost` | 25 · F | 60 · C | +35 |
| `site-27-kemijarvi-pulp-mill` | 45 · D | 19 · F | −26 |
| `site-32-akureyri-fishing-fleet` | 55 · C | 79 · B | +24 |
| `site-20-lycksele-sawmill` | 72 · B | 50 · D | −22 |
| `site-13-gallivare-mine-fleet` | 40 · D | 19 · F | −21 |
| `site-26-vardo-radar-station` | 35 · D | 15 · F | −20 |

Research Library seed rows (8), all stored-row path when Neon is available:

| Slug | Historical | Fresh | Δ |
| --- | --- | ---: | ---: |
| `site-04-inari-forestry-block` | 78 · B | 75 · B | −3 |
| `site-07-lofoten-fishing-fleet` | 65 · C | 79 · B | +14 |
| `site-09-svalbard-outpost` | 40 · D | 47 · D | +7 |
| `site-12-hammerfest-lng-terminal` | 65 · C | 71 · B | +6 |
| `site-22-kittila-gold-mine` | 78 · B | 75 · B | −3 |
| `site-25-jokkmokk-power-station` | 65 · C | 27 · F | −38 |
| `site-31-straumsvik-aluminum-smelter` | 35 · D | 50 · D | +15 |
| `site-32-akureyri-fishing-fleet` | 55 · C | 79 · B | +24 |

**Interpretation.** A score difference under identical column values does not by itself prove the current formula is right or that the historical value is wrong. Verified facts that support a non-identity reading:

- No historical row records `modelVersion`. The producer is not attested as `gryps-signature-v0.4`.
- Historical top providers include strings outside today’s catalog aliases in several rows (e.g. `O3b mPOWER`, `Starlink Maritime`, `SpaceX Starlink`). Fresh tops are catalog ids such as `Iridium Certus`, `Starlink`, `OneWeb`.
- Spot check: setup text `Fiber primary, satellite disaster backup` yields a fresh summary of “no documented connectivity path” and score 23. The historical score for that row was 65. The free-text was the same; the historical process did not behave like today’s provider parser.
- `scoreSiteSync` does not read `real_data_score` or other enrichment columns. Signature deltas are not caused by those fields.

## 6. Non-score output differences

Verified structural pattern on historical `output` (all 33):

- Always two risk factors, one redundancy gap, two caveats, three connectivity options.
- No `evidence`, `intelligence`, `score_composition`, `issuedAt`, or `inputHash`.

Fresh `scoreSiteSync` always attaches current evidence, intelligence, composition, `modelVersion`, and `issuedAt`.

Top-provider string differs on 24 / 33 rows. Historical recommendation prefixes are imperative deployment language. Fresh recommendations follow the current model-commentary style. Those prose differences are category C material even when scores also differ; because every row already carries class B, class C was not counted separately in the aggregate table (C would understate overlap). For reporting: **every row has material non-score differences**, and **24 have a different top provider label**.

## 7. Classification of discrepancies

Class counts are multi-label (one row can carry several classes).

| Class | Meaning | Count of rows carrying it |
| --- | --- | ---: |
| A | Same relevant result | **0** |
| B | Same inputs, different score or grade | **33** |
| C | Same score, different prose/structure | **0** (no same-score rows; see §6) |
| D | Retired enrichment present on the row | **32** |
| E | Missing provenance (`modelVersion` / no evidence chain) | **33** |
| F | Non-reproducible inputs | **0** |

Supporting evidence:

- **B.** Every fresh score differs from the stored Signature integer. Sixteen also change grade.
- **D.** Thirty-two rows retain `real_data_score` and/or terrain/gap components from the retired enrichment pass. Those fields are separate from the Signature comparison. They explain parallel historical columns, not the Signature delta.
- **E.** Zero rows store `modelVersion` or `evidence`. Origin of the historical Signature cannot be established as Model v0.4 from the row itself.
- **A / F.** None.

## 8. Research Library presentation findings

Code paths (verified in `lib/research-resolve.ts`, Sprint 3–4 helpers):

| Entry source | When Neon has the seed row | Displayed score | Displayed model version | Static catalogue “Model v0.4” notes |
| --- | --- | --- | --- | --- |
| `example` (4) | N/A | Authored example body | Stored `v1` or `unrecorded` | Already corrected in Sprint 3 |
| `seed` (8) | Always, for these 33 rows | **Stored historical output** | `unrecorded` | Filtered at render if they claim v0.4 |
| `seed` | Database miss only | Fresh `scoreSiteSync` | `gryps-signature-v0.4` | May remain |

Findings:

1. With Neon available, all eight seed Research Library pages show **historical** scores, not fresh v0.4 calculations. Fresh recalculation on the same inputs differs for all eight (deltas −38 … +24).
2. Runtime provenance line + note filtering prevent the page from claiming the shown score was generated by v0.4 when `fromDatabase` and version ≠ current.
3. Static catalogue `evidenceNotes` for several seed entries still **contain** Model v0.4 generation language. Filtering hides them on the stored-row path; the source text remains misleading if read from the catalogue module or if the filter regresses.
4. Render-time filtering is necessary and already correct for the happy path. It is **not sufficient** as the only control: the source descriptions should be rewritten so the catalogue itself does not assert that the stored seed score is a current-engine product.

**Smallest maintainable recommendation (not implemented in this sprint):**

1. Rewrite seed `MODELLED` notes that claim Model v0.4 generation so they describe a stored Research Library assessment whose engine version was not recorded, or describe the dual path explicitly (stored row vs fresh calculation).
2. Keep `seedLibraryProvenance` and `visibleEvidenceNotes` as runtime guards.
3. Do not silently replace stored scores with fresh v0.4 numbers on Research Library pages without a separate, approved product decision. That would rewrite what the page presents as the assessment.

## 9. Limitations and next actions

Limitations:

- Historical process that wrote `output` is not named in the row. Git history suggests an earlier seed/enrichment era; that remains an association, not a per-row certificate.
- Comparison uses today’s free-text provider parsing. Historical authors may have intended provider sets that the string no longer maps to.
- Enrichment medians use period `2026-07` on some Finnish rows; the curated Research Library Bittimittari snapshot is period `2026-10`. Those are different surfaces.
- This sprint did not re-score the four authored examples against the current engine (they are not `signature_sites` rows).

Recommended next actions (priority order):

1. **Catalogue copy.** Correct seed Research Library `evidenceNotes` that assert Model v0.4 generation for entries that display stored unrecorded rows.
2. **Product decision.** Decide whether Research Library seed pages should continue to show the stored historical Signature, show a fresh v0.4 recalculation beside it, or replace the stored score after archival.
3. **Parser honesty.** Document that free-text setups such as fiber-primary / unspecified satellite backup may parse as zero catalog providers under v0.4 — relevant to large negative deltas, not a silent fix.
4. Leave D-01–D-13 open pending formal register approval. D-09 / D-10 remain especially relevant.

Verification performed this sprint:

- Neon read-only aggregates and field select (MCP).
- Local `npx tsx scripts/compare-historical-vs-current.ts` (33 / 33 compared).
- Spot `scoreSiteSync` check for fiber-primary and Inari dual-path inputs.
- No `npm` scoring-formula edit. `lib/deterministic-score.ts` and `lib/scoring.ts` were not modified.

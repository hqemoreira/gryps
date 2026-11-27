# Phase 4 — Historical evidence and data provenance audit

Sprint 2 investigation on `development/phase-4-evidence-integrity` at HEAD `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`, with the uncommitted Sprint 1 working tree left in place. No historical record was rewritten. Neon was not queried. REVIEW-01 and REVIEW-02 were not opened for edits.

Labels used below:

- **Verified.** Read from the current tree or from `git show` / `git log`.
- **Claim.** Stated by a commit message or comment, and not re-checked against an external system.
- **Unknown.** Not present in the repository, and not inspected elsewhere.

## 1. Inventory of historical records

No file in this repository stores an evidence-chain JSON document, a database dump, or a `signature_sites` row. Stored assessment bodies that the application can show come from three places.

### Authored examples — `lib/example-signatures.ts`

Four objects. None has an `evidence` field. Scores are authored literals, not a saved call to `scoreDeterministic`.

| Id | Research slug | Recorded `modelVersion` | Stored score | Evidence chain in the file | Shown |
| --- | --- | --- | --- | --- | --- |
| `maritime-offshore` | `norwegian-arctic-maritime-offshore` | absent | 35 · D | none | Research Library, source `example` |
| `mining-autonomous` | `arctic-mining-northern-sweden` | absent | 78 · B | none | Research Library, source `example` |
| `forestry-mixed` | `finnish-arctic-forestry-lapland` | `gryps-signature-v1` | 38 · D | none | Research Library, source `example` |
| `iceland-autonomous-fleet` | `icelandic-autonomous-coastal` | `gryps-signature-v1` | 72 · B | none | Research Library, source `example` |

`issuedAt` is set only on `forestry-mixed` (`2026-08-12`) and `iceland-autonomous-fleet` (`2026-09-01`). Those timestamps are part of the authored object. They are not a build log.

The original arithmetic that produced 35, 78, 38, and 72 is not in the objects. Reproducing them from today’s engine would be a new calculation, not a reading of the record. This audit does not do that.

### Seed inputs — `lib/seed-sites.ts`

Thirty-three sites, `site-01` through `site-33`. Each row is coordinates, sector, autonomy, criticality, and setup text. No score, no `modelVersion`, and no evidence chain.

`lib/site-geography.ts` maps those slugs to a country code. Verified counts: Finland 11, Sweden 8, Norway 11, Iceland 3. Municipality is set only for the 11 Finnish slugs. The file says this table is not a reverse geocoder.

### Research Library catalogue — `lib/research-library.ts`

Twelve entries. Four use `source: "example"` (the table above). Eight use `source: "seed"` and point at a seed slug. The catalogue stores prose `evidenceNotes`. It does not store an evidence-chain object or a score.

### Database rows — not in Git

`lib/signatures-db.ts` reads `signature_sites`. The row type includes `output` (an `AdvisoryResult`), `last_scored_at`, and the enrichment columns below. There is no `CREATE TABLE signature_sites` in the current tree. The only schema statement found is the `ALTER TABLE` inside the deleted route `app/api/enrich-real-data/route.ts` (removed in `f658e16`, 2026-07-27).

That commit message **claims** that all 33 `signature_sites` rows were enriched before the route was deleted. This audit did not read Neon, so the claim is not a verified row inventory. Current cell values, current `output.modelVersion`, and whether any `output.evidence` chain exists are **unknown**.

### Other score fields the UI can show

| Field | Where it lives | Kind, from the code | Reproducible from this tree | Displayed |
| --- | --- | --- | --- | --- |
| `resilience_signature.score` on an example | `lib/example-signatures.ts` | stored authored literal | no calculation trace | yes, Research Library |
| `resilience_signature.score` on a fresh `scoreSiteSync` | generated at request time | modelled, `gryps-signature-v0.4` | yes, for the same inputs | yes, when the database row is missing |
| `output` on `signature_sites` | Neon | unknown until the row is read | unknown | signature and research pages when the row loads |
| `real_data_score` | Neon column | stored blend; see section 3 | no, raw inputs were not kept | `/signatures/[slug]` when non-null |
| `real_world_gap_score`, `terrain_penalty_score` | Neon columns | component scores of that removed blend | same limit | passed into the signature panel with `real_data_score` |
| Bittimittari medians | `lib/bittimittari-reference.ts` | curated snapshot of a measurement aggregate | the snapshot is in Git; the raw CSV is not | Research Library for three slugs |
| Map status `ok` / `degraded` / `down` | derived from the stored Signature grade | derived | from the stored grade, not from `real_data_score` | `/map` |

`app/map/page.tsx` copies `real_data_score`, `terrain_penalty_score`, and `real_world_gap_score` onto the map payload. `components/CapacityMapView.tsx` declares those fields and does not render them. `app/api/advise/route.ts` sets `realData: null`, so a newly generated Advisor result does not show the panel.

## 2. Model-version distribution

| Identifier | Where it actually appears | Count in Git |
| --- | --- | --- |
| `gryps-signature-v1` | `modelVersion` on `forestry-mixed` and `iceland-autonomous-fleet` only | 2 records |
| absent on an authored result | `maritime-offshore`, `mining-autonomous` | 2 records |
| `gryps-signature-v0.4` | `MODEL_VERSION` in `lib/model-constants.ts`. `versionSignature` writes it onto a newly generated result | constant, not a stored historical row |
| `model-v04` | catalog source id in `BASE_SOURCES` | one source row |
| `model-v03` | committed HEAD chain steps `scoring` and `recommendation` (`sourceIds`) | not a catalog row |

Sprint 1, still uncommitted, changes newly built chains so those two steps cite `model-v04`. It does not edit the four example bodies. `displayModelVersion` shows a stored id as written, or `unrecorded` when the field is missing. It does not write `gryps-signature-v0.4` onto a blank historical payload.

No in-repository record is labelled `gryps-signature-v0.4` as its original `modelVersion`. Fresh generations are.

Research Library notes still say “Model v0.4” for `forestry-mixed` (`lib/research-library.ts`, `kind: "MODELLED"`). That sentence is prose. The stored object says `gryps-signature-v1`. Those two statements are both on the page after resolution.

## 3. `real_data_score` provenance

**Verified historical calculation.** Before `f658e16` (2026-07-27), `app/api/enrich-real-data/route.ts` updated `signature_sites` by slug from `SEED_SITES`. For each site it:

1. Took the Finnish municipality from `SITE_GEOGRAPHY`, or no municipality outside Finland.
2. Fetched the then-latest Traficom Bittimittari period and computed municipality medians (`getBittimittariStatsForMunicipalities`).
3. Fetched an EU-DEM five-point sample from OpenTopoData (`getElevationSamples`).
4. Set `real_world_gap_score` from `scoreRealWorldGap`: `round(0.6 × clamped download + 0.4 × clamped (100 − latency))`, or null when Bittimittari did not apply.
5. Set `terrain_penalty_score` from `scoreTerrainPenalty`: `round(100 − elevationVarianceM × 2)`, clamped, or null when variance was null.
6. Set `real_data_score` to `round(0.55 × gap + 0.45 × terrain)` when both existed; otherwise to whichever one existed; otherwise null.

The route comment says a null result must not be fabricated. The two helper functions are still in `lib/real-data.ts`. Nothing in the current tree calls them, constructs a `RealDataScore`, or writes `real_data_score`.

**What that integer is.** It is a stored blend of two derived scores. One input was a measurement aggregate (Bittimittari medians). The other was a terrain statistic (EU-DEM variance). The blend weights 0.55 / 0.45 are a GRYPS heuristic, not a Traficom or Copernicus product. It is not an original measurement, and it is not the 0–100 Signature. `scoreDeterministic` does not read the column.

**What cannot be recovered.** The raw CSV rows and the elevation samples from that run are not in Git. The Bittimittari period string would have been whatever the discovery API returned that day. It was not copied into the repository. Re-running the helpers now would call today’s Traficom file and today’s elevation service. That would be a new value, not a reproduction of the stored integer.

**Database.** Unknown. The deletion commit claims the 33 rows were already enriched. This audit did not connect to Neon and did not read `.env`.

**Sprint 1 label.** The signature panel now uses `STORED`, and the caption says the repository has no writer and no measurement record. The second half is right: there is no measurement record. The first half is true of the current tree and incomplete as history: a writer existed and was removed. The classification `STORED` is still the accurate one. `MEASURED` is not.

**Recommendation.** Keep `STORED`. In a later, separately approved change, adjust the caption so it names a removed one-time blend and states that the inputs were not retained. Do not recompute the column. Removing the number from the signature page is reasonable if a stored blend without its inputs should not sit beside an assessment. That removal is a separate task.

## 4. Bittimittari classification

Inspected, not changed.

**Verified from `lib/bittimittari-reference.ts` and `lib/real-data.ts`.**

- Source named in code: Traficom open data, discovery URL `https://opendata.traficom.fi/api/v13/Bittimittari`, CC BY 4.0.
- Columns read: `Kunta`, `Latausnopeus Mbit/s`, `MediaaniViive ms`. Operator column `VerkkoOperaattori` is skipped.
- The curated file copies municipality medians, not individual tests.
- Snapshot commit `91dbfbf` (2026-10-16), message “Finnish Bittimittari numbers”. The file header says period `2026-10`, fetched 2026-10-16. This audit did not download the ZIP again, so equality with the Traficom file of that day is a **claim in the header**, supported by the commit date, not by a retained CSV.

| Research slug | Municipality | Period | n | Median download | Median latency | Geographic note in the same file |
| --- | --- | --- | --- | --- | --- | --- |
| `finnish-arctic-forestry-lapland` | Sodankylä | 2026-10 | 6 | 47.0 Mbit/s | 47 ms | Adjacent municipality for the scenario coordinates. Fixed-network context only. |
| `finnish-arctic-forestry-inari` | Inari | 2026-10 | 21 | 170.8 Mbit/s | 49 ms | Same municipality as the seed coordinates. |
| `finnish-arctic-mining-kittila` | Kittilä | 2026-10 | 7 | 31.4 Mbit/s | 49 ms | Same municipality as the seed coordinates. |

The Research Library chip is `MEASURED`, with the line “Measured reference · Traficom Bittimittari” and “Not blended into the 0–100 Signature score.” The note text already says fixed-network context and gives period and *n*.

**Assessment.** `MEASURED` fits the underlying figures: they are medians of Traficom measurement rows, not numbers invented for the page and not Signature outputs. It does not mean GRYPS measured satellite connectivity at the scenario coordinate. Sodankylä is explicitly an adjacent municipality. Sample sizes are 6, 21, and 7. The chip is justified only together with those limits.

`DERIVED` would mis-describe the median. `STORED` would describe the fact that the page shows a copied snapshot, and would hide that the source is a measurement programme. No change in this sprint. A later copy edit can say “fixed-network municipality aggregate” on the chip itself. Do not add municipalities that are not in this three-row snapshot.

`BITTIMITTARI_BY_RESEARCH_SLUG` has those three slugs only. `SITE_GEOGRAPHY` has eleven Finnish municipalities. The curated evidence is narrower than the old enrichment geography. That is a scope fact, not a reason to extend the snapshot.

## 5. Historical evidence-chain handling

`withEvidence` in `lib/research-resolve.ts` is the only builder call for stored or example results.

**Verified preservation.** If `result.evidence` is already set, the function returns the result unchanged. A chain that already cites `model-v03` would stay `model-v03`. No such chain exists in Git. Whether any Neon `output.evidence` exists is unknown.

**Verified new chains.** If `evidence` is missing, the function builds a package with the current `buildEvidencePackage`. After Sprint 1, the scoring and recommendation steps cite `model-v04`. The four examples all take this path, because they have no `evidence` field. Their `modelVersion` is left as `gryps-signature-v1` or absent (`unrecorded` on display). The attached chain is not marked as “built now for display” versus “the chain that produced this score.”

**Fresh scores.** `scoreSiteSync` calls `versionSignature`, which sets `modelVersion` to `gryps-signature-v0.4`, and the score path builds an evidence package in the same run. For that path, the version and the chain refer to the current engine together. The seed fallback in `resolveResearchAssessment` uses this path only when no database row is found. It does not relabel an example.

**What a reviewer can misread.**

- An example stored as `gryps-signature-v1`, or with no version, can appear with a chain whose source id is `model-v04`.
- The Lapland Research Library note says the score is a Model v0.4 output, while the stored body says `gryps-signature-v1` and score 38.
- The Sweden and Norway example notes also say Model v0.4, while those bodies have no `modelVersion`.
- Committed HEAD still cites `model-v03` on new chains. That mismatch remains until Sprint 1 is kept. This audit does not treat the uncommitted edit as released.

The interface shows the display version and the chain sources as separate blocks. It does not say that the chain was attached later.

**Correction identified, not made.** When a stored or example result has no `evidence` object, the attached package should be labelled as generated by the current engine for display, and not as the provenance of the stored score. Do not rewrite the stored `modelVersion` or the stored score. Do not backfill `evidence` into `lib/example-signatures.ts`.

## 6. Verified sources and unresolved provenance

**Verified**

- Four authored examples, two of them `gryps-signature-v1`, two with no model id, none with an evidence chain.
- Thirty-three seed inputs, no scores.
- Twelve Research Library entries.
- Three Bittimittari snapshot rows, commit date 2026-10-16, fixed-network municipality medians.
- Removed enrichment route and the 0.55 / 0.45 blend, commit `f658e16`.
- Current tree does not write `real_data_score`.
- `withEvidence` does not modify an existing chain.
- Sprint 1 new chains cite `model-v04`. Committed HEAD still cites `model-v03` on those steps.
- Homepage path does not attach Bittimittari. Attachment for research resolution is the three-slug map, not latitude.

**Unknown**

- Any `signature_sites` cell, including `real_data_score` and `output.modelVersion`.
- Whether any stored `output.evidence` still cites `model-v03`.
- The Bittimittari period string that the July 2026 enrichment fetch actually received.
- Byte-level identity of the October snapshot with the Traficom ZIP. The raw file is not in Git.

**Hypothesis, not used**

- That the 33 database rows still hold the July 2026 blend. The commit message says so. The database was not read.

## 7. Recommended implementation actions

Formal edits to the discrepancy register are a separate approval. Recommended status after this audit: leave D-05, D-09, D-10, and D-12 open.

1. **Label grafted chains.** Highest. Stop a `model-v04` chain from being readable as the producer of a `gryps-signature-v1` or `unrecorded` body. Preserve the body.
2. **Align Research Library “Model v0.4” sentences** on the four example entries with the stored `modelVersion`. Do not recompute 35, 78, 38, or 72.
3. **Keep `real_data_score` as `STORED`.** Correct the caption so it records the removed blend and the missing inputs. Do not recalculate. Decide separately whether the number stays on `/signatures/[slug]`.
4. **Leave the Bittimittari chip as `MEASURED`.** Optional later wording: fixed-network municipality aggregate, with period and *n* already shown. Do not add municipalities.
5. **Register update, after approval.** D-05: new chains can cite `model-v04`, but grafted chains and committed `model-v03` mean it is not closed. D-09: writer found in history; stored values and raw inputs still unreproduced; `STORED` stands. D-10: silent relabel to v0.4 is already stopped in the working tree; example prose and stored bodies still disagree. D-12: latitude attachment is already stopped in the working tree; the live snapshot is three Finnish research slugs, not every Finnish seed and not a Nordic latitude band.

No scoring-formula change follows from this audit.

## Sprint 4 — 2026-11-26 — Live records and score presentation

### Database inspection

Method. Shell env had no `NEON_DATABASE_URL` / `DATABASE_URL`. `.env` was not opened and no connection string was printed. Read-only aggregates were run through the authenticated Neon MCP against project `gryps` (`billowing-glade-14791411`), default branch. Statements were `SELECT` aggregates and `jsonb_object_keys` only. No writes, migrations, or row dumps of site content.

Verified totals on `signature_sites`:

| Metric | Count |
| --- | ---: |
| Total rows | 33 |
| Rows with `output` | 33 |
| Rows with a non-empty `output.modelVersion` | 0 |
| Rows with missing `modelVersion` | 33 |
| Rows with `output.evidence` | 0 |
| Rows with `issuedAt` / `inputHash` | 0 |
| Rows with `real_data_score` | 32 |
| Rows with `real_world_gap_score` | 7 |
| Rows with `terrain_penalty_score` | 32 |
| Country `FI` | 11 |
| Country non-FI | 22 |

`output` top-level keys on every row: `caveats`, `connectivity_options`, `recommendation`, `redundancy_gaps`, `resilience_signature`, `risk_factors`. No stored evidence chain. No recorded model version. Blend shape: 7 rows have both gap and terrain components; 25 have terrain-only `real_data_score`; 1 row has null `real_data_score`.

Association with a known process. The missing version fields and the enrichment column set match the early seed + July 2026 `enrich-real-data` writer described in Sprint 2. That is an association from structure and Git history, not a per-row generation log.

### Seed-library provenance

Code path (unchanged in Sprint 4):

- `example` → authored body. Sprint 3 wording stays.
- `seed` → `getSiteBySlug`. With the live 33 rows present, every current seed `sourceId` resolves to a stored row when Neon is reachable. Displayed `modelVersion` is `unrecorded`. The page states the score was not recomputed. Catalogue notes that claim Model v0.4 generation are omitted for that render (`visibleEvidenceNotes`). The catalogue text itself was not rewritten in this sprint.
- Database miss / throw → `scoreSiteSync` + `gryps-signature-v0.4`. That path alone may keep a Model v0.4 description.

So in production with Neon available, seed-library pages show **stored historical output without a recorded model version**, not a fresh v0.4 calculation. Calling them current Model v0.4 examples would be false on that path. The runtime filter already prevents that claim on screen.

### `real_data_score` decision

Recommendation adopted. The composite is not a current assessment result and must not sit beside the Signature as a comparable 0–100 figure. The database column stays. The composite integer is not rendered. The evidence tab may still show stored component fields (gap, terrain, medians, elevation) under `STORED`, without blend-weight percentage labels. Caption states the composite remains in the database and is not shown as a current Signature result.

### Implementation changes

- `RealDataEvidence.realDataScore` optional and unused in render.
- Panel gated by `hasHistoricalEnrichment` (components / medians / elevation), not by the composite alone.
- `/signatures/[slug]` passes historical fields when components exist; does not use the composite as the gate.
- Labels no longer say “55%” / “45%”.
- `EVIDENCE_KINDS.STORED` caption updated accordingly.
- Evidence-integrity tests assert the composite is not rendered and composite-only payloads do not open the panel.

### Remaining unknowns

- Exact engine that produced each stored Signature body (pre-`modelVersion` era; no generation log in the row).
- Whether any row’s stored score still matches today’s `scoreSiteSync` for the same inputs (not recomputed in this sprint).
- Whether the remaining component fields on thin signature pages should later leave that page entirely.


# Phase 4 — Research Library provenance correction

Sprint 6 on `development/phase-4-evidence-integrity` at HEAD `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`. Provenance copy only. No scoring change. No database writes. REVIEW-01 / REVIEW-02 untouched.

## 1. Files inspected

- `lib/research-library.ts` — catalogue entries and `evidenceNotes`
- `components/ResearchLibraryView.tsx` — index disclosure, card badge, CTA
- `components/ResearchAssessmentView.tsx` — render of notes + `seedLibraryProvenance` / `visibleEvidenceNotes`
- `lib/research-resolve.ts` — stored-row vs seed fallback pathways (no logic change this sprint)
- `lib/example-signatures.ts` — authored example scores (preserved; no score edits)
- `scripts/verify-evidence-integrity.ts` — provenance assertions
- Grep across Research components for `Model v0.4` / `mallin v0.4` / `mallista v0.4`

## 2. Unsupported historical claims identified

| Location | Claim type | Issue |
| --- | --- | --- |
| 8 seed `MODELLED` notes | “from / scored by Model v0.4” | Live `signature_sites` rows have no `modelVersion`; Sprint 5 showed all 8 scores differ from fresh v0.4 |
| 4 seed `DERIVED` notes | “same deterministic Advisor composition/path” | Implies current-engine identity with the historical payload |
| `ResearchLibraryView` disclosure | “Each assessment uses deterministic Model v0.4” | False for historical stored seed rows and unrecorded/v1 examples |
| Card badge `Model v0.4` | Per-card engine label | Implied every library card is a v0.4 product |
| CTA subcopy | “Same scoring model as the research assessments above” | Equated historical cards with the fresh Advisor engine |

Not corrected (legitimate current-engine references):

- Fresh Advisor / `scoreSiteSync` still uses Model v0.4.
- Dual-path seed notes may name `gryps-signature-v0.4` only for the **database-miss** calculation.
- Authored example notes already stated `gryps-signature-v1` or “version not recorded” (Sprint 3).

## 3. Corrections made

Seed `MODELLED` notes (all 8) now state:

- Historical stored assessment (with a short scenario qualifier).
- Original model version was not recorded.
- Result has not been recalculated or independently validated.
- Database miss calculates a fresh `gryps-signature-v0.4` Signature for the same seed inputs.

Seed `DERIVED` notes that claimed Advisor identity now say risks/ranks belong to the page payload and are not a claim that the current engine reproduces the historical score.

`ResearchLibraryView`:

- Disclosure distinguishes historical stored / authored metadata from fresh Advisor Model v0.4.
- Card badge: “Research assessment” / “Tutkimusarvio”.
- CTA: fresh Signatures use Model v0.4; not every library card was produced by that engine.

Runtime guards (`seedLibraryProvenance`, `visibleEvidenceNotes`, display-chain origin) remain.

## 4. Historical scores and grades preserved

No score or grade values were edited in catalogue code, examples, or the database.

Research Library seed `sourceId` rows (historical when Neon is available):

| Seed slug | Historical score · grade (Sprint 5) |
| --- | --- |
| `site-04-inari-forestry-block` | 78 · B |
| `site-07-lofoten-fishing-fleet` | 65 · C |
| `site-09-svalbard-outpost` | 40 · D |
| `site-12-hammerfest-lng-terminal` | 65 · C |
| `site-22-kittila-gold-mine` | 78 · B |
| `site-25-jokkmokk-power-station` | 65 · C |
| `site-31-straumsvik-aluminum-smelter` | 35 · D |
| `site-32-akureyri-fishing-fleet` | 55 · C |

Authored examples remain 35, 78, 38, 72 with prior Sprint 3 version wording.

## 5. Pathway verification

**Stored-row path** (`getSiteBySlug` succeeds): page shows stored `output`; `modelVersion` displays as `unrecorded`; provenance line states the score was not recomputed; catalogue `MODELLED` note describes historical unrecorded storage; display chains remain `chainOrigin: "display"` when grafted.

**Fallback path** (no DB row / throw): `scoreSiteSync` + `gryps-signature-v0.4`; provenance line states calculation for this request; catalogue note’s database-miss clause matches that path.

**Homepage:** `HERO_DEMO_SCORE` / `scoreDeterministic` still 83 · B (verified by `test:evidence`).

## 6. Test results

Recorded after this sprint’s edits:

- `npm run test:evidence` — exit 0; homepage regression 83 · B
- `npm run test:score` — exit 0; 41 · D, 78 · B, 46 · D, 95 · A
- `npm run typecheck` — exit 0
- `npm run build` — exit 0

## 7. Remaining limitations

- Whether Research Library pages should **replace** historical scores with fresh v0.4 (or show both) remains a product decision. This sprint only corrects attribution.
- Catalogue cards still show the stored score/grade from the page data loader; they no longer label that figure as Model v0.4.
- D-01–D-13 stay open.

## 8. Confirmation

- `lib/deterministic-score.ts` — unchanged this sprint
- `lib/scoring.ts` — unchanged this sprint
- Neon — no writes
- `review-package/` / `review-package-02/` — not modified
- `LICENSE` — not modified

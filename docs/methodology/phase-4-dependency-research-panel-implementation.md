# Phase 4 — Dependency research panel implementation

Sprint 10. Branch `development/phase-4-evidence-integrity` @ `dc73abc`. Research UI only. Model v0.4 scoring, Neon, and REVIEW packages unchanged.

## 1. Interface purpose and boundaries

**Purpose.** Demonstrate how GRYPS could show provider dependencies, shared infrastructure, and Unknown relationships beside an existing Model v0.4 Signature — without treating catalogue labels as path independence.

**Boundaries**

- Route is a research preview, not an operational assessment.
- Fixture data never contributes to the Signature.
- No Neon writes, no auth changes, not listed in main navigation.
- `robots: noindex` on the page metadata.
- Adapter must not be imported by `lib/deterministic-score.ts` or `lib/scoring.ts`.

## 2. Route and component architecture

| Piece | Role |
| --- | --- |
| `app/research/dependency-lab/page.tsx` | Server page shell (Header/Footer + metadata) |
| `components/DependencyResearchLabView.tsx` | Client panel: fixture tabs + sections A–E |
| `lib/research/dependency-fixtures.ts` | Research-only JSON import + layer presentation helpers |

Signature numbers come from existing `lib/hero-demo.ts` exports (`HERO_DEMO_SCORE` / `HERO_DEMO_GRADE` = 83 · B). The panel does not reimplement scoring.

## 3. Fixture data source and adapter

Source JSON (Sprint 9):

- `docs/methodology/fixtures/provider-dependency-fixtures/fixture-a-starlink-oneweb.json`
- `…/fixture-b-starlink-iridium.json`
- `…/fixture-c-synthetic-shared-dependency.json`

Adapter responsibilities: type the fixture schema, expose `getDependencyFixture`, build layered views, detect synthetic / shared-infrastructure cases. Transformation is limited to grouping entities/relationships/unknowns by layer — no invented edges.

## 4. Sections and displayed information

| Section | Content |
| --- | --- |
| A Existing Signature | Fixed homepage regression profile; notice that dependency research does not contribute |
| B Catalogue classifications | Provider diversity, catalogue-based orbit mix, Catalogue confidence (not used here), infrastructure independence not established; provider rows from fixture |
| C Dependency layers | Space, ground, network, operations, site, failure domains — entities, relationships, Unknown copy |
| D Evidence | Full provenance fields; synthetic badge when `isSynthetic` |
| E Interpretation | Fixture `researchConclusion`, claims not to make, Unknown layers, shared-domain yes/no, why no score |

## 5. Terminology implementation

Sprint 9 glossary enforced in UI labels and tests: Catalogue confidence · Provider diversity · Catalogue-based orbit mix · Unknown. The string “independent paths” is forbidden in the panel source.

## 6. Evidence and UNKNOWN presentation

- Relationships link to evidence anchors by id.
- Missing publication dates render as em dash `—`.
- Unknown blocks use: *Unknown — insufficient evidence to determine whether these providers share this dependency.*
- Unknown is styled as incomplete evidence, not as a detected outage.

## 7. Synthetic fixture treatment

Fixture C shows a persistent amber “Synthetic fixture” banner. Every evidence card with `isSynthetic` shows “Synthetic test evidence”. Entity list marks fictional attributes.

## 8. Test results

Commands run in Sprint 10:

- `npm run test:score` — pass
- `npm run test:evidence` — pass (homepage 83 · B)
- `npm run typecheck` — pass
- `npm run build` — pass
- `npx tsx scripts/verify-provider-dependency-fixtures.ts` — pass
- `npm run test:dependency-lab` — pass  
- Build route list includes `/research/dependency-lab`

## 9. Accessibility and responsive checks

- Fixture controls use `role="tablist"` / `role="tab"` with `aria-selected`.
- Section headings (`h1`–`h4`) provide hierarchy; synthetic status uses `role="status"`.
- Layout uses flex/grid with `minmax` so panels wrap on narrow viewports; page padding uses `--pad-x`.
- Focusable tabs are native `<button>` elements.

Manual check recommended in browser: keyboard tab through fixtures; Unknown text readable at mobile width.

## 10. Known limitations and future improvements

- Signature strip stays on the hero regression even when Fixture A/C providers differ — intentional boundary, may need clearer “fixture providers ≠ Signature providers” callout later.
- No graph visualisation (by design).
- Not in sitemap or main nav. Sprint 12 adds a Research Library aside link (research preview wording); route remains noindex.
- Engine composition labels in `deterministic-score.ts` still use legacy “independent paths” strings (UI-remapped elsewhere).
- Historical Neon recommendation prose not addressed (Sprint 9 deferred).

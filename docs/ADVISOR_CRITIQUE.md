# Advisor ship-ui critique (Floor / Reflex) — 2026-10-30

Scope: first Advisor job only (`/#advisor`). Not a full-site redesign.

## P0 (Floor)

- Focus/loading: CTA now `aria-busy` while analysing.
- Errors: `role="alert"` + next-action copy (bounds / engine / unlock).

## P1 (Reflex — fixed)

- Tracked-caps eyebrow “RESILIENCE ADVISOR · CONSOLE” removed above Advisor heading.
- Support copy capped with `max-width: 65ch`.

## P2 (Finish — done this pass)

- Initial Assessment shows two-layer composition bars (hiring clarity for Model v0.4).
- Model version + short input hash on teaser.
- Empty-providers amber nudge before submit.

## Deferred

- Extract shared `CompositionBars` component (hero + teaser still duplicated patterns).
- Full mobile smoke screenshots per `docs/smoke/`.

# Advisor → Signature path (orient map)

Lead: five steps. Deterministic Model **v0.4** owns score/grade/risks/ranks. Optional Mistral prose never changes numbers.

1. **UI intake** — Home `#advisor` (`app/page.tsx` → `AdvisorForm`): lat/lng, sector, providers, autonomy, criticality, priorities; optional `ai_interpretation`.
2. **API** — `POST /api/advise` (`app/api/advise/route.ts`): validate fields, rate-limit via Neon, call `scoreSite`, persist submission, return **abbreviated** teaser via `abbreviateResult`.
3. **Score orchestration** — `lib/scoring.ts` `scoreSite` → `scoreDeterministic` (`lib/deterministic-score.ts`) + hard rules (`lib/signature-meta.ts`); optional `enrichRecommendation` (Mistral) only if opted in.
4. **Model v0.4** — Two layers: Site Conditions (max 20) + Mitigation (max 80). Constants in `lib/model-constants.ts` (`MODEL_VERSION = gryps-signature-v0.4`). Priorities re-rank recommendations only.
5. **Result UI** — Abbreviated: `InitialAssessment` in `components/AdvisorFunnel.tsx`. Full (unlock/email or research library): `ResilienceOutput`. Share restore via `sid` query + `/api/submissions/[id]`.

## Deterministic vs AI

| Deterministic | Optional AI |
|---------------|-------------|
| Score, grade, layers, caps, risks, ranked options, evidence package | Recommendation paragraph polish (`ai_interpretation`) |
| Same inputs → same Signature | Never overrides numeric fields |

## Key files

- `lib/deterministic-score.ts` — engine
- `lib/scoring.ts` — advise entry
- `lib/abbreviate-result.ts` — teaser shape
- `lib/model-constants.ts` — version + grade bands
- `app/page.tsx` — Advisor form + `#advisor`
- `components/AdvisorFunnel.tsx` — Initial Assessment
- `components/ResilienceOutput.tsx` — full Signature
- `scripts/verify-deterministic.ts` — sanity samples

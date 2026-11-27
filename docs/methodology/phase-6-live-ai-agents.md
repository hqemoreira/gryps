# Phase 6 — Live AI agent integration (P6-S7)

**Document version:** `gryps-qa-live-agents-v0`  
**Recorded:** 2026-11-27

## Provider architecture

| Adapter                | Module                                       | Credential                              |
| ---------------------- | -------------------------------------------- | --------------------------------------- |
| Mistral (primary)      | `lib/qa/live/providers/mistral.ts`           | `MISTRAL_API_KEY`                       |
| OpenAI-compatible HTTP | `lib/qa/live/providers/openai-compatible.ts` | `GRYPS_QA_OPENAI_COMPAT_BASE_URL` + key |

Uses existing `@mistralai/mistralai` (already in package.json). No new paid SDK added in P6-S7.

Default model: `mistral-small-latest` (same family as optional scoring prose).

Expected cost (informational): roughly \$0.10 / \$0.30 per 1M input/output tokens for mistral-small — verify current Mistral pricing before batch runs. Soft ceiling default \$0.50/task; batch requires `GRYPS_QA_LIVE_APPROVE=1`.

## Three live reviewers (separate calls)

| Agent | Role id        | Focus                                                                        |
| ----- | -------------- | ---------------------------------------------------------------------------- |
| A     | `requirements` | Task vs implementation, AC, scope, test sincerity                            |
| B     | `domain_model` | Model v0.4, UNKNOWN, evidence provenance, no invented domain facts           |
| C     | `adversarial`  | Security + adversarial challenge (receives peer summaries; cannot overwrite) |

Orchestrator remains deterministic (`decideQaStatus`).

## Commands

```bash
# CI-safe infrastructure (BLOCKED without credentials; no paid calls)
npm run test:qa-live

# Genuine live batch (costs money — explicit approval)
# Set MISTRAL_API_KEY via environment / Vercel env — never commit secrets.
set GRYPS_QA_LIVE=1
set GRYPS_QA_LIVE_APPROVE=1
npm run test:qa-live
```

## Status rule

Missing credentials or provider failure ⇒ **BLOCKED**, never PASS.

## Expansion

Remaining roles (test_engineer, evidence_provenance, regression_integration, full domain split, model orchestrator) are deferred until the first three prove useful. The orchestrator must stay deterministic.

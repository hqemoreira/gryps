# Phase 6 — Multi-agent QA implementation (P6-S4)

**Document version:** `gryps-multi-agent-qa-implementation-v0`  
**Recorded:** 2026-11-27  
**Status:** Mock pipeline implemented and seeded-defect validated. Live LLM agents **not** required for CI and **not** claimed as independent human-equivalent review.

## Architecture implemented

```text
QaTask → Orchestrator → Provider (mock | live_unimplemented)
                      → Peer agents (7) → Findings
                      → Deterministic check records
                      → Decision gate → QaReport
```

| Module                         | Path                                                          |
| ------------------------------ | ------------------------------------------------------------- |
| Types / finding schema         | `lib/qa/types.ts`                                             |
| Decision gate                  | `lib/qa/decision.ts`                                          |
| Roles                          | `lib/qa/roles.ts`                                             |
| Provider abstraction           | `lib/qa/provider.ts`                                          |
| Mock rule agents               | `lib/qa/mock-agents.ts`                                       |
| Orchestrator + markdown report | `lib/qa/orchestrator.ts`                                      |
| Seed catalog + sandboxes       | `docs/methodology/qa-fixtures/seeded-defects/`                |
| Suite                          | `scripts/verify-multi-agent-qa.ts` (`npm run test:qa-agents`) |

## Agent execution status

| Role                     | Interface            | CI execution                           |
| ------------------------ | -------------------- | -------------------------------------- |
| Orchestrator             | `runQaOrchestrator`  | Yes (synthesis)                        |
| Requirements             | mock detector        | Yes (mock)                             |
| Test Engineer            | mock detector        | Yes (mock)                             |
| Domain / Model           | mock detector        | Yes (mock)                             |
| Evidence / Provenance    | mock detector        | Yes (mock)                             |
| Security / Privacy       | mock detector        | Yes (mock)                             |
| Regression / Integration | mock detector        | Yes (mock)                             |
| Adversarial              | mock detector        | Yes (mock)                             |
| Live LLM provider        | `live_unimplemented` | Forces **BLOCKED** — never silent PASS |

**Independence note:** Mock agents are separate rule functions with distinct finding IDs. They are **not** live multi-model reviews. Do not describe the system as ready to replace human review of every GRYPS change until live providers are approved and proven against the same seed suite.

## Decision gate

PASS · PASS_WITH_NON_BLOCKING_FINDINGS · FAIL · BLOCKED — see `lib/qa/decision.ts`.

Missing required agent execution ⇒ **BLOCKED**.

## Seeded-defect matrix (2026-11-27)

| Seed                        | Expected                              | Detected          | Decision |
| --------------------------- | ------------------------------------- | ----------------- | -------- |
| SD-01 scoring weight        | DOM-SCORE-01                          | Yes               | FAIL     |
| SD-02 regression broken     | REG-83-01                             | Yes               | FAIL     |
| SD-03 missing provenance    | EV-PROV-01                            | Yes               | FAIL     |
| SD-04 UNKNOWN→positive      | DOM-UNKNOWN-01                        | Yes               | FAIL     |
| SD-05 false independence    | DOM-INDEP-01                          | Yes               | FAIL     |
| SD-06 broken workflow link  | REG-NAV-01                            | Yes               | FAIL     |
| SD-07 false-green validator | TEST-FALSEGREEN-01, ADV-FALSEGREEN-01 | Yes               | FAIL     |
| SD-08 secret exposed        | SEC-SECRET-01                         | Yes               | FAIL     |
| SD-00 clean control         | none                                  | 0 false positives | PASS     |

## CI

`.github/workflows/ci.yml` adds `npm run test:qa-agents` after workflow checks. No paid API keys required.

## Protected actions (still human-only)

Scoring · Model v0.5 · D-item closure · P5-S2 · REVIEW · LICENSE · Neon · commit/push/merge/deploy · outreach.

## Dependencies

**None new.** Uses Node `fs`/`path` and existing `tsx` runner.

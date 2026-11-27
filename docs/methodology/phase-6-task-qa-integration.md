# Phase 6 — Development change intelligence and QA integration (P6-S5)

**Document version:** `gryps-task-qa-integration-v0`  
**Recorded:** 2026-11-27  
**Status:** Change-aware mock QA pipeline implemented. Live LLM agents not introduced.

## What was added

| Module                          | Role                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `lib/qa/task-definition.ts`     | Structured task schema + validation (incomplete ⇒ BLOCKED) |
| `lib/qa/change-inventory.ts`    | Read-only `git status --porcelain` + synthetic inventories |
| `lib/qa/impact-map.ts`          | Path → component → existing npm validators                 |
| `lib/qa/test-selection.ts`      | Mandatory baseline + impact + task-required selection      |
| `lib/qa/change-aware-agents.ts` | Mock agents reviewing task + changes + content markers     |
| `lib/qa/task-pipeline.ts`       | End-to-end task QA run + markdown report                   |
| `scripts/verify-task-qa.ts`     | Ten synthetic scenarios (`npm run test:task-qa`)           |

## Execution sequence

1. Validate task definition
2. Capture / inject change inventory
3. Classify in-scope / out-of-scope / protected
4. Impact map + test selection
5. Record deterministic results (real or scenario overrides)
6. Change-aware mock agents
7. Decision gate
8. Report

## Mandatory baseline checks

Always selected: `test:score`, `test:boundaries`.

Skipped **required** checks are recorded as `not_run` and cannot yield PASS.

## Scenario matrix (synthetic)

| ID    | Case                       | Decision                        |
| ----- | -------------------------- | ------------------------------- |
| TS-01 | In-scope correct           | PASS                            |
| TS-02 | Out of scope               | FAIL                            |
| TS-03 | Incomplete task            | BLOCKED                         |
| TS-04 | Scoring file modified      | FAIL                            |
| TS-05 | Provenance removed         | FAIL                            |
| TS-06 | Regression test fails      | FAIL                            |
| TS-07 | Unmapped file              | PASS_WITH_NON_BLOCKING_FINDINGS |
| TS-08 | Required validator skipped | FAIL                            |
| TS-09 | Untracked out of scope     | FAIL                            |
| TS-10 | Multiple defects           | FAIL                            |

## Limitations

- Agents remain rule-based mocks.
- Scenario suite injects deterministic overrides; production task runs should execute real npm validators.
- Live working-tree inventory is available via `captureWorkingTreeInventory()` but the scenario suite uses synthetic inventories so the real dirty tree is not polluted.

# Phase 6 — Development task template

**Template version:** `gryps-dev-task-template-v0`  
**Use:** Copy into the task brief / PR description before implementation.  
**Related:** `phase-6-development-quality-gates.md`, `phase-6-qa-report-template.md`

---

## Task ID

`P6-Sx` / `ENG-xx` / other: _______________

## Objective

One paragraph: what must be true when the task is done.

## Scope

- In scope:
  - …
- Out of scope / **explicit exclusions**:
  - Model v0.5
  - Closing D-01–D-13
  - P5-S2 v0 pack mutation
  - REVIEW-01/02 mutation
  - LICENSE change
  - Neon production writes
  - External outreach
  - Multi-agent orchestrator (unless this task is that phase)
  - Commit / push / merge / deploy (unless explicitly requested)

## Baseline

| Field             | Value                                        |
| ----------------- | -------------------------------------------- |
| Branch            |                                              |
| HEAD              |                                              |
| Worktree          |                                              |
| Working-tree note | Preserve existing uncommitted work: yes / no |

## Acceptance criteria

Checklist (testable):

- [ ] …
- [ ] Homepage regression remains **83 · B** when assessment/UI paths touched
- [ ] Required validators listed below pass
- [ ] Protected boundaries unchanged or Gate F recorded

## Protected boundaries

Must not change without Gate F human approval:

- [ ] Model v0.4 scoring / weights / caps
- [ ] `docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/*`
- [ ] REVIEW-01 / REVIEW-02
- [ ] LICENSE
- [ ] Neon data / production schema
- [ ] Homepage regression expected result (83 · B)

## Required tests

Mark applicable:

- [ ] `npm run lint`
- [ ] `npm run format:check`
- [ ] `npm run typecheck`
- [ ] `npm run test:score`
- [ ] `npm run test:fixtures`
- [ ] `npm run test:evidence-pack`
- [ ] `npm run test:evidence-intake`
- [ ] `npm run test:dependency-lab`
- [ ] `npm run test:evidence`
- [ ] `npm run test:boundaries`
- [ ] `npm run build`
- [ ] Other: _______________

Default for research-platform PRs: all of the above.

## Risk classification

Low / Medium / High / Scoring-critical / Security-critical: _______________

## Completion evidence

- Diff summary / file list
- Command outputs (or CI job URLs)
- QA report filled from `phase-6-qa-report-template.md`
- Final QA decision: PASS | PASS WITH NON-BLOCKING FINDINGS | FAIL | BLOCKED

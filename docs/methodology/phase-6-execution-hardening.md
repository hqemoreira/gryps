# Phase 6 — Production QA execution hardening (P6-S6)

**Document version:** `gryps-qa-execution-hardening-v0`  
**Recorded:** 2026-11-27  
**Status:** Real validator execution adapter + task-start snapshots implemented. Live LLM agents not introduced.

## Assumed-pass elimination

Real task runs must either:

1. Execute validators via `lib/qa/validator-execution.ts`, or
2. Record `NOT_RUN` / `BLOCKED` / `TIMED_OUT` (decision ⇒ **BLOCKED**).

Synthetic outcomes require `allowSyntheticResults: true` and are labelled **SYNTHETIC**. They are fixture-only.

## Execution statuses

`PASSED` | `FAILED` | `NOT_RUN` | `BLOCKED` | `TIMED_OUT`

Only a completed process with exit code **0** yields `PASSED`.

## Task-start snapshots

- Stored under `.qa/task-snapshots/<taskId>/` (gitignored).
- Content fingerprints (sha256); sensitive paths (`.env`, keys) store metadata only.
- Read-only after creation; overwrite refused.
- Obsolete snapshot JSON may be deleted — never development source files.

## Attribution

| Status                       | Meaning                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `NEW_TASK_CHANGE`            | Appeared or changed after a clean task-start observation |
| `PRE_EXISTING_CHANGE`        | Dirty at start; unchanged at completion                  |
| `MODIFIED_PRE_EXISTING_FILE` | Dirty at start; changed again during the task            |
| `AMBIGUOUS`                  | Unreadable / missing fingerprint                         |
| `UNCHANGED`                  | Same fingerprint; not dirty-at-start                     |

Critical/protected ambiguity ⇒ **BLOCKED**.

## Commands

- `npm run test:qa-execution` — adapter + snapshot matrices + temp FS integration
- Existing: `test:task-qa`, `test:qa-agents`, P6-S2 validators

## Limitations

- Full dirty working tree is not treated as one development task.
- Agents remain mock/rule-based.
- Snapshot walk of the whole monorepo is opt-in; prefer scoped path lists.

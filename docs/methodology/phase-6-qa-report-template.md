# Phase 6 — QA report template

**Template version:** `gryps-qa-report-template-v0`  
**Rule:** Do not record **PASS** if a required check was not executed. Decisions need evidence.

---

## Identifiers

| Field        | Value                  |
| ------------ | ---------------------- |
| Task ID      |                        |
| Branch       |                        |
| HEAD (start) |                        |
| HEAD (end)   | same / _______________ |
| Report date  |                        |
| Reporter     |                        |

## Files changed

List paths (or attach `git status` / `git diff --stat`):

-

## Scope compliance

| Check                                                         | Result                | Evidence |
| ------------------------------------------------------------- | --------------------- | -------- |
| Matches approved scope                                        | Pass / Fail / Blocked |          |
| Explicit exclusions respected                                 | Pass / Fail / Blocked |          |
| No prohibited scoring / pack / REVIEW / LICENSE / Neon writes | Pass / Fail / Blocked |          |

## Checks executed

| Check                          | Ran? | Exit | Result | Log / note |
| ------------------------------ | ---- | ---- | ------ | ---------- |
| `npm run lint`                 | Y/N  |      |        |            |
| `npm run format:check`         | Y/N  |      |        |            |
| `npm run typecheck`            | Y/N  |      |        |            |
| `npm run test:score`           | Y/N  |      |        |            |
| `npm run test:fixtures`        | Y/N  |      |        |            |
| `npm run test:evidence-pack`   | Y/N  |      |        |            |
| `npm run test:evidence-intake` | Y/N  |      |        |            |
| `npm run test:dependency-lab`  | Y/N  |      |        |            |
| `npm run test:evidence`        | Y/N  |      |        |            |
| `npm run test:boundaries`      | Y/N  |      |        |            |
| `npm run build`                | Y/N  |      |        |            |
| Other                          |      |      |        |            |

## Regression status

| Item               | Expected                                                    | Observed | Result |
| ------------------ | ----------------------------------------------------------- | -------- | ------ |
| Homepage Signature | 83 · B                                                      |          |        |
| Homepage input     | 67°N, 26°E, mining, remote-operated, high, starlink+iridium |          |        |

## Protected-boundary status

| Boundary                  | Result | Evidence                    |
| ------------------------- | ------ | --------------------------- |
| LICENSE hash              |        | `test:boundaries` / manual  |
| P5-S2 pack + traceability |        |                             |
| REVIEW-01/02 (if present) |        | OK / MANUAL / FAIL          |
| Scoring watchlist         |        | Informational unless Gate F |
| Neon writes               | None   |                             |

## Known limitations

-

## Non-blocking findings

-

## Final QA decision

Choose one:

- [ ] **PASS**
- [ ] **PASS WITH NON-BLOCKING FINDINGS**
- [ ] **FAIL**
- [ ] **BLOCKED**

**Rationale (required):**

-

**Human Gate F required?** Yes / No — if yes, what for:

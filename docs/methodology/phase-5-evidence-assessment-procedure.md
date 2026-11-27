# Phase 5 — Evidence assessment procedure

**Document version:** `gryps-evidence-assessment-procedure-v0`  
**Sprint:** P5-S5  
**Companions:** intake model; restricted-evidence handling; P5-S3 protocol  
**Recorded:** 2026-11-26

## Non-validation statement

This procedure assesses **individual claims/relationships**. It does not certify dual-path independence, does not score sites, and does not promote an entire envelope because one edge is supported.

---

## 1. When to assess

After lifecycle reaches `received` → move to `under_review`. Assessment completes by transitioning to a terminal state (`supported_within_scope`, `partially_supported`, `contradicted`, `unresolved`, `superseded`, `unavailable`).

For `no_response` / `declined`, record assessment notes that **no claim is supported**.

---

## 2. Claim-level questions (mandatory)

Complete `claimAssessment` on every intake that leaves `under_review` with a substantive outcome:

| # | Question | Record in |
| --- | --- | --- |
| 1 | What **exact** claim does it support? | `exactClaimSupported` |
| 2 | What is the source’s competence for *that* claim? | `sourceCompetence` |
| 3 | Primary or secondary? | `primaryOrSecondary` |
| 4 | Independent of other evidence on file? | `independentOfOtherEvidence` |
| 5 | Geographic scope? | `geographicScope` |
| 6 | Technical scope? | `technicalScope` |
| 7 | Is the information current for the claim window? | `isCurrent` |
| 8 | What limitations remain? | `limitations` |
| 9 | Contradict or qualify existing evidence? | `contradictsOrQualifies` + cross-id arrays |

Independence rules follow P5-S3 §4 (common corporate origin ≠ independent).

---

## 3. Relationship isolation

1. Map intake → one or more `relationshipIds` / `claimIds`  
2. Assess **each** relationship separately  
3. If only architecture is supported, leave serving-path / backhaul / power UNKNOWNs listed in `whatRemainsUnknown`  
4. Never set a global “site validated” flag  

| Supported facet | Must not auto-conclude |
| --- | --- |
| Architecture class | Site-serving path |
| Facility existence / role | Customer routing |
| Site terminals / power | Backhaul separation or e2e independence |
| Measurements | Infrastructure independence |
| No response | Confirmation or contradiction |

---

## 4. Choosing the terminal status

| Status | Use when |
| --- | --- |
| `supported_within_scope` | Exact claim held inside stated geo/tech/temporal scope |
| `partially_supported` | Some requested facets held; material residues UNKNOWN |
| `contradicted` | Retained conflicting intakes; neither deleted |
| `unresolved` | Reviewed; evidence insufficient or conflict without adjudication close |
| `superseded` | Later valid intake changes standing; keep history |
| `unavailable` | Cannot obtain / known blocked |
| `no_response` | Wait policy elapsed without reply |
| `declined` | Explicit refusal |

Absence of evidence ≠ evidence of absence.

---

## 5. Contradiction handling

1. Keep both intakes  
2. Cross-link `contradictsIntakeIds`  
3. Optional `qualifiesIntakeIds` without deletion  
4. No newer-always-wins  
5. Human adjudication note in `assessmentNotes` (Template D when elevating publicly)  

Synthetic Case D demonstrates unresolved contradiction.

---

## 6. Maturity assignment

| Situation | Typical maturity |
| --- | --- |
| Public doc retrieval | L1 |
| Independent dual-channel | L2 |
| Written operator/host reply | L3 |
| Site inventory / config | L4 |
| Instrumented campaign | L5 |
| No substantive material | `none` |

Maturity does not imply `supported_within_scope` — a weak L1 may be `unresolved` or `contradicted`.

---

## 7. Synthetic drill outcomes (P5-S5)

| Case | Outcome teaching point |
| --- | --- |
| A | L3 architecture support; serving path UNKNOWN |
| B | L3 facility role; routing UNKNOWN |
| C | L4 partial site; backhaul UNKNOWN |
| D | Two L1 notes contradicted; relationship unresolved |
| E | `no_response`; no support |
| F | Confidential L4; public handle only |
| G | L5 performance period; independence UNKNOWN |

---

## 8. Versioning

| Version | Date | Notes |
| --- | --- | --- |
| v0 | 2026-11-26 | Initial P5-S5 procedure |

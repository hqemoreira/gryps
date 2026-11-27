# Phase 5 — Evidence intake model

**Document version:** `gryps-evidence-intake-model-v0`  
**Sprint:** P5-S5  
**Implementation:** `lib/research/evidence-intake.ts`  
**Synthetic fixtures:** `docs/methodology/fixtures/evidence-intake/synthetic-intake-cases.json`  
**Envelope:** references `nordic-lapland-dual-path-v0` — **does not modify it**  
**Recorded:** 2026-11-26

## Non-ingestion statement

This model defines how external evidence *would* be received and assessed. P5-S5 exercises it with **synthetic** records only. No outreach, no real provider statements, no v0 pack mutation, no Neon writes, no Signature generation.

---

## 1. Design goals

1. Claim-scoped intake — one relationship’s support does not promote a whole site or network  
2. **Maturity ≠ status ≠ lifecycle** — three distinct concepts  
3. Append-only transition history  
4. Restricted content referenced by handle, not pasted into public docs  
5. Synthetic fixtures unmistakably labelled  

---

## 2. Core record fields

| Field | Purpose |
| --- | --- |
| `intakeId` | Stable intake identifier |
| `claimIds` | Acquisition-register claim ids (e.g. `CLAIM-C-01`) |
| `relationshipIds` | Envelope relationship ids when applicable (e.g. `rel-oneweb-offers`) |
| `respondingOrganisationCategory` | Source category — fictional for synthetics |
| `sourceCategory` | Enum of intake kinds |
| `evidenceSourceReference` | URI/handle/document id |
| `dateReceived` | When the response/material arrived |
| `publicationDate` | Source publication date if any |
| `validFrom` / `validTo` | Validity period |
| `geographicScope` | Label + precision |
| `technicalScope` | What technical facet is covered |
| `maturityLevel` | **L1–L5** or `none` (P5-S3) |
| `evidenceStatus` | Assessment/lifecycle outcome field (mirrors terminal state when set) |
| `lifecycleState` | Current process/assessment state |
| `lifecycleHistory` | Ordered transitions with timestamps and notes |
| `accessClassification` | `public` \| `restricted` \| `confidential` \| `synthetic` |
| `reusePermission` | Publication/reuse rule |
| `restrictedHandle` | Controlled pointer when raw content is not public |
| `publicSummary` | Safe summary for public research notes |
| `assessmentNotes` | Curator notes |
| `reviewer` / `assessmentDate` | Human assessment metadata |
| `contradictsIntakeIds` / `qualifiesIntakeIds` / `supersedesIntakeIds` / `supersededByIntakeIds` | Cross-links — earlier records retained |
| `claimAssessment` | Structured claim-level assessment (§ assessment procedure) |
| `whatRemainsUnknown` | Explicit UNKNOWN residues |
| `relatedEnvelope` | Always `nordic-lapland-dual-path-v0` for this pilot track |
| `entersProductionAssessment` | Always `false` |
| `containsScoreOrProbability` | Always `false` |
| `writesToNeon` | Always `false` |
| `isSynthetic` / `syntheticLabel` | Required true / non-empty for fixtures |

Schema constant: `gryps-evidence-intake-v0`.

---

## 3. Maturity vs status (must remain separate)

| Concept | Field | Meaning |
| --- | --- | --- |
| **Maturity** | `maturityLevel` | How the evidence was obtained (L1 public … L5 measured) |
| **Status** | `evidenceStatus` / terminal `lifecycleState` | What assessment concluded (supported, contradicted, no_response, …) |
| **Lifecycle** | `lifecycleState` + `lifecycleHistory` | Where the request/response sits in the process |

Examples:

- L3 + `supported_within_scope` — provider-confirmed architecture fact  
- L5 + `supported_within_scope` — measurements support a performance claim, **not** independence  
- `none` + `no_response` — nothing received; claim stays UNKNOWN  
- L1 + `contradicted` — documented but contested  

No confidence percentages or Signature mapping.

---

## 4. Lifecycle states and transitions

States: `prepared` → `approved` → `sent` → `received` → `under_review` → terminal assessment states  
also: `no_response`, `declined`, `unavailable`, `superseded`, …

Permitted transitions are coded in `INTAKE_TRANSITIONS` (`lib/research/evidence-intake.ts`).

| Rule | Detail |
| --- | --- |
| History starts at `prepared` | Required |
| Append-only | Prior steps never deleted |
| `no_response` | Not confirmation; not contradiction |
| `declined` | Not contradiction of the underlying fact |
| `received` | Not verified — must enter `under_review` |
| `superseded` | Later standing changes; earlier record retained |
| Support after silence | Forbidden — validator enforces |

A claim may remain UNKNOWN in `whatRemainsUnknown` even when another facet is `supported_within_scope`.

---

## 5. Relation to P5-S2 / future v1

| Artefact | Role |
| --- | --- |
| `nordic-lapland-dual-path-v0` | Immutable public baseline |
| Intake records | Research workflow objects — synthetic in P5-S5 |
| Future `v1` pack | Only after real approved intake + separate authorisation (P5-S4) |

Intake **must not** write into production assessments, Research Library historical records, or Neon.

---

## 6. Synthetic catalog

File: `docs/methodology/fixtures/evidence-intake/synthetic-intake-cases.json`  
Cases A–G exercise architecture-only support, facility-only support, partial site support, unresolved contradiction, no response, confidential handle, and measurements-without-independence.

All use fictional organisation categories. None attribute quotes to real companies.

---

## 7. Versioning

| Version | Date | Notes |
| --- | --- | --- |
| v0 | 2026-11-26 | Initial P5-S5 model + synthetic fixtures |

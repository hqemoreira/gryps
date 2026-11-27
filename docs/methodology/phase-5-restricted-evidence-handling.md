# Phase 5 — Restricted evidence handling

**Document version:** `gryps-restricted-evidence-handling-v0`  
**Sprint:** P5-S5  
**Companions:** intake model; assessment procedure; P5-S4 approval gates  
**Recorded:** 2026-11-26

## Non-disclosure statement

This document defines controls for restricted and confidential research evidence. Synthetic Case F exercises the **public handle** pattern. No real confidential material is stored in the repository.

---

## 1. Access classes

| Class | Meaning | Public research docs may contain |
| --- | --- | --- |
| `public` | Citeable source | URL, dates, short factual extract where permitted |
| `restricted` | Limited reuse | Redacted summary + handle; not full source |
| `confidential` | Site/provider sensitive | Handle + high-level outcome only |
| `synthetic` | Test fixture | Full fixture JSON (explicitly labelled synthetic) |

Reuse permissions: `public_cite_ok` | `redacted_summary_ok` | `internal_only` | `not_disclosable` | `synthetic_test_only`.

---

## 2. What must never be stored in public methodology or git-tracked public packs

- Credentials, API keys, account passwords, MFA secrets  
- Unnecessary personal names, national IDs, private emails of individuals  
- Full confidential questionnaires, BOMs, or circuit diagrams without redaction authority  
- Neon connection strings or `.env` contents  
- REVIEW package contents attached as “evidence”  

Prefer organisational mailboxes and role titles over personal data.

---

## 3. Restricted handle pattern

For `restricted` / `confidential` intakes:

| Public field | Content |
| --- | --- |
| `restrictedHandle` | Opaque id, e.g. `vault://p5/intake/…` or `synth-handle://…` |
| `publicSummary` | One–three sentences: what claim class was assessed, scope, outcome |
| `evidenceSourceReference` | May point to the same handle — not to pasted secrets |
| Raw body | **Off-repo** authorised store only |

Public pack / Lab / methodology must not embed the confidential body.

---

## 4. How a reviewer verifies without unauthorised access

1. Public review uses `publicSummary`, scopes, maturity, status, and handle id  
2. Arms-length reviewer confirms the handle exists in the authorised store under dual-control (process — not implemented as software in P5-S5)  
3. If the reviewer lacks clearance, they mark claim `unresolved` for lack of inspectable public evidence — they do **not** invent support  
4. Phase 3 engine REVIEW packages remain a separate track; do not use them as a vault for P5 site secrets  

---

## 5. Provider-confirmed but non-public

| Step | Rule |
| --- | --- |
| Intake | `accessClassification: restricted` (or confidential) |
| Maturity | May be L3 |
| Independence | Provider self-confirm ≠ L2 |
| Publication | Only with explicit reuse permission from approval gate |
| v1 pack (future) | Store summary + handle; link prior v0 claim ids |

---

## 6. Confidential site evidence

| Step | Rule |
| --- | --- |
| Default identity | Region + sector only in public summaries |
| Coordinates / firm name | Omit unless written permission |
| Personal data | Minimise; delete when purpose ends |
| Measurements | Summaries (period, method class, outcome class) — not raw PCAP dumps in public git |

---

## 7. Synthetic confidential drill (Case F)

- `accessClassification: confidential`  
- `restrictedHandle: synth-handle://case-f/confidential-site-reply`  
- `publicSummary` present; no account numbers or personal names in fixture  
- Validator asserts confidential cases expose no credential-like patterns and require a handle  

---

## 8. Incident expectations (future live use)

If restricted material is accidentally committed: stop, rotate any exposed secrets, remove from history only under explicit user authorisation, and re-classify the intake.

P5-S5 does not perform secret scanning beyond fixture lint rules.

---

## 9. Versioning

| Version | Date | Notes |
| --- | --- | --- |
| v0 | 2026-11-26 | Initial P5-S5 controls |

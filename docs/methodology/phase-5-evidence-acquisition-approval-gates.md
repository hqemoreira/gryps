# Phase 5 — Evidence acquisition approval gates

**Document version:** `gryps-evidence-acquisition-approval-gates-v0`  
**Sprint:** P5-S4  
**Status:** Mandatory checklist **before** any external engagement  
**Non-send:** No messages, invitations, requests, or attachments are sent or shared in this sprint.

---

## 1. Purpose

External evidence acquisition can disclose research posture, create confidentiality obligations, and blur Phase 3 scoring-engine review with P5 dependency evidence. These gates force an explicit human approval per engagement.

Default decision until a completed checklist is signed: **do not send**.

---

## 2. Engagement types (choose one primary)

| Type | Allowed artefacts | Forbidden |
| --- | --- | --- |
| **Research evidence request** | Template A/B/C excerpt; redacted claim table; public URL cites | REVIEW-01/02 packages; Neon exports; secrets; unpublished Signature claims as “validation” |
| **Independent evidence adjudication** | Template D; public pack excerpts; redacted claim table | Asking reviewer to also “sell” or certify a provider |
| **Phase 3 model engine review** | REVIEW packages only under that track’s rules | Mixing P5 site/provider questionnaires into the same send without dual-mandate disclosure |
| **Combined** | Only if checklist records **both** mandates and conflict handling | Treating provider L3 answers as Phase 3 independence |

---

## 3. Pre-send checklist (copy per request)

**Gate ID:** `GATE-P5-____`  
**Date:** ________  
**Approver (user):** ________  

### 3.1 Target

| # | Item | Yes / No / N/A | Notes |
| --- | --- | --- | --- |
| G1 | Target organisation named (from target register id, e.g. T-01) | | |
| G2 | Target register entry re-checked for conflicts and “cannot establish” | | |
| G3 | Recipient or **official contact channel** identified (URL or published mailbox) — not an invented personal address | | |
| G4 | Channel re-verified on the live page within 7 days of send | | |

### 3.2 Request content

| # | Item | Yes / No / N/A | Notes |
| --- | --- | --- | --- |
| G5 | Exact request body attached (final text) | | |
| G6 | Claim IDs / REQ ids listed (from acquisition register / matrix) | | |
| G7 | Questions are factual and bounded — **no** ask to “certify independence” from another provider | | |
| G8 | Geographic and technical scope stated | | |
| G9 | Template A/B/C/D basis recorded | | |

### 3.3 Disclosure about GRYPS

| # | Item | Yes / No / N/A | Notes |
| --- | --- | --- | --- |
| G10 | Short non-commercial research description approved (Research · Prototype · Experimental) | | |
| G11 | No sales / customer / pricing language | | |
| G12 | No claim that Model v0.4 or a Signature has been field-validated | | |
| G13 | No implication that a Lapland dual-path site already participates | | |

### 3.4 Attachments

| # | Item | Yes / No / N/A | Notes |
| --- | --- | --- | --- |
| G14 | Attachment list finalised | | |
| G15 | **REVIEW-01 / REVIEW-02 not attached** unless this is an authorised Phase 3 send | | |
| G16 | No `.env`, secrets, Neon dumps, or private personal data | | |
| G17 | P5-S2 pack shared only as public methodology excerpt if needed — not as “validated site evidence” | | |

### 3.5 Confidentiality and data handling

| # | Item | Yes / No / N/A | Notes |
| --- | --- | --- | --- |
| G18 | Expected access class (`public` / `restricted` / `confidential`) recorded | | |
| G19 | Storage location for replies approved | | |
| G20 | Retention / deletion rule set | | |
| G21 | GDPR / personal-data minimisation considered | | |
| G22 | Traficom or other official channels: no request for unauthorized register extracts | | |

### 3.6 Publication and reuse

| # | Item | Yes / No / N/A | Notes |
| --- | --- | --- | --- |
| G23 | Request asks for reuse permission explicitly | | |
| G24 | Default: treat reply as restricted until permission clear | | |
| G25 | Plan for redacted public summary (if any) approved | | |

### 3.7 Role clarity

| # | Item | Yes / No / N/A | Notes |
| --- | --- | --- | --- |
| G26 | Engagement type selected (§2) | | |
| G27 | If provider: noted that reply is **not** independent corroboration alone | | |
| G28 | If reviewer: conflicts of interest disclosure requested | | |
| G29 | Phase 3 vs P5 roles not conflated | | |

### 3.8 Pack and scoring boundaries

| # | Item | Yes / No / N/A | Notes |
| --- | --- | --- | --- |
| G30 | v0 pack remains immutable; any intake goes to a future v1 only after separate approval | | |
| G31 | No Model v0.4 / v0.5 scoring change authorised by this send | | |
| G32 | No D-01–D-13 closure authorised by this send | | |

### Decision

| Field | Value |
| --- | --- |
| Decision | `APPROVED TO SEND` / `HOLD` / `REJECTED` |
| Approver signature / initials | |
| Earliest send date | |
| Wait policy (days) | |

---

## 4. Post-response mini-gate (before pack intake)

Before any material enters `nordic-lapland-dual-path-v1` (future):

| # | Check |
| --- | --- |
| R1 | Response class recorded (`no_response`, `declined`, `confidential`, etc.) |
| R2 | Claim mapping complete; insufficient claims stay UNKNOWN |
| R3 | Contradiction check against v0 |
| R4 | Maturity L3/L4/L5 assigned without silent upgrade of unrelated claims |
| R5 | Reuse permission documented |
| R6 | Template D adjudication if elevating site-serving or independence-adjacent claims |
| R7 | Explicit: outcomes not mapped to Signature points |

---

## 5. Hard prohibitions (P5-S4 and until lifted)

- No external messages during P5-S4  
- No sharing of REVIEW packages under P5 evidence pretext  
- No invented site, contact, or participation claim  
- No Neon access for acquisition  
- No commit/push/deploy required for checklist use — checklist may live in private notes until a future authorised sprint  

---

## 6. Versioning

| Version | Date | Notes |
| --- | --- | --- |
| v0 | 2026-11-26 | Initial P5-S4 gates |

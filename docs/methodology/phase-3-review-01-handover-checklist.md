# Phase 3 — REVIEW-02 handover checklist

**Document version:** `gryps-review-02-handover-checklist-v0`  
**Task:** ENG-01 (preparation only)  
**Filename note:** Deliverable path is `phase-3-review-01-handover-checklist.md` per ENG-01; **content is for REVIEW-02 only**. REVIEW-01 is not the handover target.  
**Recorded:** 2026-11-26  
**Status:** Checklist for the copyright holder. Not a signed permission. Package files and hashes were not modified by this document.

## Non-action statement

No package has been distributed. No permission has been signed. No repository access has been granted. Confidential P5 evidence is not part of this handover. The Lapland pilot is **not** in reviewer scope and is not implied as something the reviewer must validate.

---

## 1. Package identity and baseline hash

| Item | Value |
| --- | --- |
| Identifier | **GRYPS-MODEL-v0.4-ENGINE-REVIEW-02** |
| Folder (main checkout) | `review-package-02/` |
| Inventory | `review-package-02/BASELINE.md` |
| SHA-256 of `BASELINE.md` | `01ca1f4cb59ad91c741442a7000ff8ecb4ebc83ba00404bd60a5e311b3c0585a` |
| Verified this task | 2026-11-26 — hash unchanged |
| Named HEAD in baseline | `dc73abc5e644bbe117e79b8b57733bf5e9f432b4` |
| Tag / package commit | none |
| Predecessor (do **not** hand over under this permission) | REVIEW-01 in `review-package/` (contains Kittilä EU-DEM extract); SHA-256 of that `BASELINE.md`: `b1bd89f54ed33b5790d8f5bf33ca2cd0d07b990546cf18a9b4e6ee6ddaf08310` |

**Gate:** Before any copy leaves the holder’s control, re-hash `BASELINE.md` and confirm it still equals the value above. Do not alter package files to “refresh” the hash.

---

## 2. Reproduction instructions and supported checks

From `review-package-02/`, after a clean tree without shipping `node_modules`:

```bash
npm ci
npm run test:score
npm run typecheck
```

Recorded runtime (in `BASELINE.md`): Node.js v24.15.0, npm 11.12.1.

| Supported | Not supported |
| --- | --- |
| `npm ci` | `npm run test:terrain` (script absent; package.json may still name it) |
| `npm run test:score` | Reference-scenario reproduction |
| `npm run typecheck` | `npm run build` / Next.js application |
| Reading `applyHardRules` vs `applyCaps` in the copied sources | Validation of live networks, Lapland pilot, or P5 evidence packs |

Reading order for the reviewer: `README.md` → `REVIEW-GUIDE.md` → `BASELINE.md` → scoring sources → optional annex questionnaire if listed on the signed permission.

---

## 3. Known limitations of REVIEW-02

- Engine-only; no EU-DEM samples; no elevation import into the score.
- No application, stored Signature UI, or `real_data_score` writer.
- Full `discrepancy-register.md` withheld (D-07 quotes an OpenStreetMap centroid); short form is in `REVIEW-GUIDE.md`.
- Sanity cases are **range-locked**; printed 41 / 46 can move inside ranges and still pass (D-08, D-13).
- Homepage **83 · B** equality is recorded by importing `HERO_DEMO_SCORE` on the staged package; the development terrain script that equality-locks 83 is **not** in the package.
- Passing supported checks proves install + deterministic outputs for those inputs — **not** site resilience.

---

## 4. D-01 through D-13 — all explicitly open

Do not present any discrepancy as closed. Short form for the reviewer (from package guide / outreach materials):

| Id | Open issue (summary) |
| --- | --- |
| D-01 | Mix / “path” bonus is orbit names or LEO broadband+narrowband at exactly two catalog ids — not ground segment or failure mode |
| D-02 | `applyCaps` vs `applyHardRules` can publish two integers for one Advisor-style input |
| D-03 | GEO confidence above 72°N follows the above-70 half-catalog branch |
| D-04 | Extra GEO risk line above 72°N unreachable; cap at 45 still runs |
| D-05 | Evidence-chain steps cite `model-v03` while catalog id is `model-v04` |
| D-06 | Path count = distinct catalog ids, not terminals / gateways |
| D-07 | Ivalo label / centroid / query mismatch — coordinates **not** in package |
| D-08 | Sanity tests lock ranges, not the printed integers |
| D-09 | `real_data_score` display / storage — not reproducible from this package |
| D-10 | Stored / example payloads and missing `modelVersion` labelling — application, not package |
| D-11 | 0–25 term is catalog confidence under a path-independence label |
| D-12 | Bittimittari attachment by latitude band without country check |
| D-13 | Homepage 83 equality-lock lives in development terrain script, not in REVIEW-02 `test:score` |

Reviewer may confirm, reject, or add rows. Open status is intentional.

---

## 5. Model v0.4 scoring vs historical stored assessments

| Topic | What to tell the reviewer |
| --- | --- |
| Authority for this review | Implemented Model v0.4 in the hashed package (`scoreDeterministic`, constants, caps) |
| Stored / example Signatures in the full app | May reflect earlier inputs, missing `modelVersion`, or display paths (D-09, D-10) — **out of package** |
| Neon / production rows | Not in scope; do not grant DB access for this review |
| Historical vs current comparison work in Phase 4 | Holder-side research; not a REVIEW-02 deliverable |

Do not ask the reviewer to reconcile production database rows with the package.

---

## 6. Homepage regression baseline — 83 · B

| Field | Value |
| --- | --- |
| Input | lat 67, lng 26, mining, remote-operated, criticality high, providers `starlink` + `iridium` |
| Composition | 12 + 33 + 23 + 15 = **83 · B** |
| Meaning | Regression result for that hard-coded object |
| Not meaning | Measured resilience of a mine, network, or place at 67°N 26°E |
| Comment trap | File comment “dual independent LEO paths” ≠ engine input (two catalog ids) |

---

## 7. What the reviewer can and cannot conclude

**Can conclude (examples the holder must accept):**

- The Signature concept is not valid for the stated purpose.
- The score is misleading or insufficiently evidenced.
- Methodology needs substantial revision; some claims should be removed or narrowed.
- Catalog diversity is not infrastructure independence.
- Caps / grades / remaps are bookkeeping rather than physical facts.
- Reproducibility claims exceed what `test:score` locks.

**Cannot conclude from this package alone:**

- That any real site’s connectivity was measured or validated.
- That REVIEW-01 / EU-DEM / terrain / reference scenarios are correct (they are not handed over).
- That the Lapland pilot or P5 evidence packs are sound.
- That GRYPS, the EU, or the reviewer endorses the method.
- That Model v0.5 should be built (out of scope; findings do not rewrite v0.4).

This review is **criticism of a research prototype**, not certification or endorsement.

---

## 8. Confidentiality, access, and reuse restrictions

Governed by `LICENSE` (all rights reserved) plus a **signed** copy of `phase-3-engine-review-permission-template.md` (main checkout). Until signed:

- No copy distribution
- No repo grant beyond what the reviewer already has for personal evaluation under LICENSE (viewing / local eval is not a substitute for package distribution permission)

Once signed (holder action, not this task):

- Named reviewers only; start and expiry dates required
- Private non-commercial technical evaluation only
- No redistribution, publication of package contents, commercial use, or third-party deployment
- No REVIEW-01 / elevation archive under this permission
- Delete or cease use of copies after expiry except feedback already returned
- Annexes only if listed on the signed instrument

---

## 9. Permission signature and reviewer acknowledgement

**Holder gates (before send):**

1. Name reviewer(s) and contact on the template  
2. Set start and expiry  
3. Confirm annex lines kept or deleted  
4. Copyright holder signs  
5. Retain unsigned template unchanged in repo; signed copy is an executed instrument outside this checklist’s edit scope  

**Reviewer acknowledgement (questionnaire annex, when included):** reviewer confirms understanding that 83 · B and sanity scores are engine outputs for stated inputs, not measurements of operational resilience, and that rejecting the approach is a valid outcome.

**ENG-01 stop:** Do not sign, fill names, or send from this task.

---

## 10. Pre-handover holder checklist (tick when ready)

- [ ] `BASELINE.md` SHA-256 re-verified = `01ca1f4c…c0585a`  
- [ ] REVIEW-01 **not** included in the drop  
- [ ] Permission template filled and **signed**  
- [ ] Reviewer COI disclosures received and accepted  
- [ ] Scope letter / invitation states criticism-first outcomes (see engagement decision)  
- [ ] Annex questionnaire + framework attached only if listed  
- [ ] No P5 confidential evidence, no Lapland pilot validation ask  
- [ ] Delivery channel and expiry deletion instructions agreed  

Until every gate above is complete, REVIEW-02 is **technically packaged** but **not ready to send**.

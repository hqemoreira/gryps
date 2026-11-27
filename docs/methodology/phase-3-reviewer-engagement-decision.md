# Phase 3 — Reviewer engagement decision

**Document version:** `gryps-reviewer-engagement-decision-v0`  
**Task:** ENG-01  
**Companions:** `phase-3-reviewer-candidate-shortlist.md`, `phase-3-reviewer-candidate-evaluation.md`, `phase-3-review-01-handover-checklist.md`  
**Recorded:** 2026-11-26  
**Status:** Holder decision support. **No invitation issued.** No candidate contacted.

---

## 1. Decision summary

| Question | Recommendation |
| --- | --- |
| Who merits further consideration? | **Jianping Pan**, **John Rushby**, with **Leonardo Dueñas-Osorio** and **Jaan Praks** as strong alternates; **Paolo Gardoni** / **Nancy Leveson** as secondary alternates |
| How many reviewers? | **Two**, complementary Profiles |
| Preferred pair | **Pan (A / partial B) + Rushby (C)** |
| Fallback pairs | Praks + Rushby; or Pan + Dueñas-Osorio if Profile C unavailable |
| Three-reviewer panel? | Only if the permission template is extended and coordination cost is accepted — **not** the default |
| REVIEW-02 ready to hand over? | **Technically ready** (hash intact, supported checks documented). **Not ready to send** until permission is signed, reviewers named, COIs cleared, and invitation gates pass |
| Outreach from this task? | **None** — stop after these deliverables |

---

## 2. Candidates that merit further consideration

### Primary shortlist for approach (after confirmation gates)

1. **Jianping Pan** — University of Victoria — Profile **A** (strong), **B** (partial). Best public evidence for LEO retail architecture, landing/PoP behaviour, and challenging brand-as-independence narratives.  
   Sources: https://www.cs.uvic.ca/~pan/ ; LEO-NET / Starlink@PanLab pages (retrieved 2026-11-26).

2. **John Rushby** — SRI International — Profile **C** (strong), **B** (partial). Best public evidence for assurance-case / evidential-sufficiency scrutiny of composite claims.  
   Sources: https://www.sri.com/people/john-rushby/ ; https://www.csl.sri.com/~rushby/assurance-cases.html (retrieved 2026-11-26).

### Alternates (same standard of evidence; not ranked numerically)

3. **Leonardo Dueñas-Osorio** — Rice University — Profile **B** (strong). Interdependent infrastructure / cascading failure. Prefer if the holder wants heavier shared-failure-mode theory than Pan alone supplies, or if Rushby is unavailable and a second reviewer must stress independence claims.  
   Source: https://profiles.rice.edu/faculty/leonardo-duenas-osorio

4. **Jaan Praks** — Aalto University — Profile **A** (strong), Nordic/high-latitude space systems. Prefer if Pan declines or COI blocks.  
   Source: https://research.aalto.fi/en/persons/jaan-praks/

5. **Paolo Gardoni** — UIUC — Profile **B** alternate to Dueñas-Osorio.  
6. **Nancy Leveson** — MIT — Profile **B/C** alternate if Rushby unavailable; availability **Unknown**.

Candidates not elevated: general software engineers without modelling/resilience publication record; PanLab students as primary Phase 3 reviewers.

---

## 3. Expertise coverage and remaining gaps

| Profile | Coverage with preferred pair (Pan + Rushby) | Residual gap |
| --- | --- | --- |
| A — Satellite architecture | Covered by Pan | Live industrial OT dual-path ops experience still thin |
| B — Resilience / dependency | Partial via Pan’s empirical shared-landing work + Rushby’s dependability arguments | Deep civil-style interdependency theory thinner than Dueñas-Osorio alone |
| C — Deterministic modelling / auditability | Covered by Rushby | Native TypeScript app review out of REVIEW-02 scope |

**Across the whole shortlist**, A+B+C are coverable. **No single candidate** has strong public evidence for all three. Criteria were **not** lowered to invent a perfect individual.

---

## 4. Conflict-of-interest assessment

| Candidate | Verified fact | Reasonable concern | Independence |
| --- | --- | --- | --- |
| Pan | Public LEO measurement work; tools noted as adopted by Starlink (lab pages); P5 T-08 research contact | Dual mandate (evidence research + Phase 3 criticism); operator-adjacent lab | **Unknown** until written COI |
| Praks | Aalto space leadership; news notes startups from his team | Finnish commercial space proximity | **Unknown** |
| Dueñas-Osorio | Civil infrastructure resilience research | Lower retail-operator proximity than LEO labs | **Unknown** (still confirm) |
| Gardoni | Risk/resilience / CIRI-linked pages | Certification-language culture must not infect GRYPS review framing | **Unknown** |
| Rushby | Formal methods / assurance cases at SRI | Prior critical-systems consulting — confirm no competing product stake | **Unknown** |
| Leveson | Systems safety at MIT | Industry consulting; availability | **Unknown** |

**Rule:** Academic title ≠ independence. Do not invite until COI questionnaire answers are on file and accepted by the holder.

---

## 5. Proposed review scope (criticism invited)

The invitation (when later drafted and sent by the holder — **not** this task) must explicitly invite challenge on:

1. Conceptual validity of the GRYPS Signature  
2. Scoring logic and mathematical assumptions  
3. Provider diversity versus genuine infrastructure independence  
4. Catalogue confidence and its interpretation  
5. Hard caps and score / grade consistency  
6. Evidence provenance and historical data treatment (within what REVIEW-02 can show; D-09/D-10 as package limits)  
7. Reproducibility, implementation, and test coverage  
8. Limitations and suitability for future research  

**Valid reviewer conclusions the holder must accept:**

- The model is not valid for its stated purpose  
- The score is misleading or insufficiently supported  
- The methodology requires substantial revision  
- Some claims should be removed or narrowed  

**Framing ban:** not certification, not endorsement, not a decision to ship Model v0.5.

---

## 6. What must be confirmed before any invitation

1. Re-verify public affiliation pages and contact channels (do not invent emails)  
2. Written COI disclosure (operators, insurers, competing scores, prior GRYPS / P5 roles)  
3. Employer / institutional permission for unpaid private technical criticism  
4. Explicit acceptance of criticism-first outcomes and REVIEW-02 scope limits  
5. Permission template: legal names, contacts, start/expiry, annex lines, **holder signature**  
6. Re-hash `BASELINE.md` = `01ca1f4cb59ad91c741442a7000ff8ecb4ebc83ba00404bd60a5e311b3c0585a`  
7. Delivery and post-expiry deletion plan  
8. Separation from P5 evidence outreach (especially if Pan is also on T-08)

---

## 7. REVIEW-02 handover readiness

| Gate | Status |
| --- | --- |
| Package exists at `review-package-02/` | Yes (main checkout) |
| Baseline hash verified this task | Yes — unchanged |
| Supported checks documented | Yes (`npm ci`, `test:score`, `typecheck`) |
| D-01–D-13 presented as open | Yes (guide short form) |
| Permission template | Exists, **unsigned** |
| Reviewers named on template | **No** |
| COI cleared | **No** |
| Package distributed | **No** |

**Verdict:** REVIEW-02 is **ready for handover after the existing permission gates** (name reviewers, dates, annexes, holder signature, COI). It is **not** ready to distribute today. REVIEW-01 remains excluded.

---

## 8. Boundaries observed by ENG-01

- No candidate contact, invitation, or material distribution  
- No repository access granted  
- REVIEW-01 / REVIEW-02 package files not modified  
- Scoring engine, Neon, P5-S2 evidence pack, LICENSE not modified  
- No commit, push, merge, or deploy  
- No Model v0.5 start; no P5 evidence requests  

---

## 9. Holder next actions (outside ENG-01)

1. Choose preferred pair (default: Pan + Rushby) or fallback  
2. Complete COI and confirmation gates  
3. Sign permission only when ready to send  
4. Then — and only then — issue a private invitation using the existing invitation wording as a base  

ENG-01 **stops** here.

# Phase 5 — External validation readiness assessment

**Document version:** `gryps-external-validation-readiness-v0`  
**Sprint:** P5-S6  
**Worktree:** `development/phase-4-evidence-integrity` @ `dc73abc`  
**Recorded:** 2026-11-26

## Non-engagement statement

This assessment does **not** contact organisations, distribute REVIEW packages or GRYPS material, acquire live evidence, or claim site-level validation. It decides whether the current research stack is clear enough for the *user* to approve an initial external engagement later.

---

## 1. Baseline

| Check | Result |
| --- | --- |
| Branch / HEAD | `development/phase-4-evidence-integrity` @ `dc73abc` |
| P5-S2 pack | Immutable; 12 relationships / 8 UNKNOWNs |
| P5-S1–S5 docs | Present |
| Intake / synthetics | Research-only; `isSynthetic: true` |
| Scoring / Neon / REVIEW / LICENSE | Untouched this sprint |
| Commit / push / deploy | None |

---

## 2. Cross-document consistency audit

Sources compared: Phase 3 permission plan + REVIEW guides; P5-S1 feasibility; P5-S2 pack/report; P5-S3 protocol/templates/pilot; P5-S4 registers/matrix/gates; P5-S5 intake/assessment/restricted handling.

### 2.1 Findings (aligned)

| Topic | Status |
| --- | --- |
| L1–L5 maturity definitions | Consistent P5-S3 → S4 → S5 |
| Provider confirmation ≠ independent corroboration | Consistent across S3–S5 and gates |
| Public / restricted / confidential / synthetic | Consistent; handle pattern in S5 |
| Phase 3 engine review vs P5 evidence roles | Explicitly separated in target register + gates |
| Historical / contradicted / superseded retention | Consistent (no newer-wins; qualify links) |
| No Signature from evidence outcomes | Consistent |
| P5-S2 immutability + future v1 | Consistent |
| Approval before send | Gates checklist sufficient as a control *design* |

### 2.2 Ambiguities (documented, not expanded)

| Topic | Note |
| --- | --- |
| Maturity vs status vs lifecycle | Three concepts; at rest `evidenceStatus` mirrors terminal `lifecycleState` by design (S5). Process steps use lifecycle; maturity stays orthogonal. |
| P5-S2 `verificationStatus` / `confidence` vs L1–L5 | Mapped in S3 §2.2; pack rows remain L1-class documentation, not auto-upgraded |
| Pack relationship `confidence: documented` vs intake `supported_within_scope` | Different artefacts — pack is public baseline; intake is workflow. Do not conflate when briefing externals |
| Envelope UNKNOWN ids vs claim ids | Both appear in intake `whatRemainsUnknown`; assessment procedure allows either |

### 2.3 Demonstrable error corrected this sprint

| Issue | Fix |
| --- | --- |
| P5-S4 used `refusal` while P5-S5 canonical state is `declined` | Matrix + approval gates aligned to `declined` (alias noted) |

No other methodology expansion performed.

### 2.4 Missing controls (prerequisites, not blockers for *planning*)

| Gap | Impact |
| --- | --- |
| Phase 3 permission template unsigned; reviewers unnamed | Engine review not send-ready |
| No authorised vault for live confidential handles | Live L4 confidential intake not operationally ready |
| No named industrial site volunteer | Site track blocked |
| Starlink research channel may be sales-form only | Provider track needs channel strategy before send |
| REVIEW packages live on main checkout; Phase 5 worktree has heavy uncommitted tree | Handover must use frozen REVIEW-02 inventory, not ad-hoc worktree zip |

---

## 3. Engagement readiness by category

### A. Independent technical reviewers

| Dimension | Assessment |
| --- | --- |
| What GRYPS can explain | Model v0.4 arithmetic via REVIEW-02; D-01–D-13 open; P5 dependency research is separate (fixtures + Lapland L1 pack) |
| What is requested | Challenge of scoring assumptions; optional Template D on *public* P5 claims |
| Safe to disclose | REVIEW-02 after signed permission; public methodology URLs; P5-S2 public pack |
| Must not share | Neon, secrets, confidential site handles, REVIEW-01 if EU-DEM extract redistribution undecided for that recipient, unsigned wider tree |
| Approval | Phase 3 permission plan + gates if also P5 |
| Useful response | Written challenge of D-items / path-independence labelling; not rubber-stamp |
| Impossible without them | Arms-length critique of over-claim |
| Readiness | **Requires further preparation** (sign permission, name reviewer) — methodology clear |

### B. Satellite network operators

| Dimension | Assessment |
| --- | --- |
| What GRYPS can explain | Research envelope; L1 architecture/facility public facts; UNKNOWN site paths |
| What is requested | Templates A — architecture, roles, disclosable landing-scope classes |
| Safe to disclose | Short non-commercial brief; public claim table; public URL cites |
| Must not share | REVIEW packages as default; “validated dual-path” language; other providers’ confidential replies |
| Approval | Full P5-S4 gate |
| Useful response | Dated scoped L3 architecture/facility-class answers + reuse permission |
| Impossible without them | Account-scoped routing; current inventory beyond public docs |
| Readiness | **Requires further preparation** (exact body + channel strategy) — not blocked by methodology gaps |

### C. Ground-station / teleport / SNP operators

| Dimension | Assessment |
| --- | --- |
| What GRYPS can explain | Facility-existence leads; non-conflation of SNP/PoP/GS |
| What is requested | Template B — role, owner/operator, disclosable hosting |
| Safe to disclose | Named *public* facility questions only |
| Must not share | Invented tenant lists; Traficom confidential register asks |
| Approval | Gate + dual-source relevance for leads (SSC/Space Norway) |
| Useful response | Role confirmation with as-of date |
| Impossible without them | Host-side ops/backhaul class |
| Readiness | **Ready for user approval** for KSAT-class Svalbard *role* questions after gate fill-in; SSC/Space Norway **not appropriate** until dual-sourced into a claim |

### D. Terrestrial backhaul / network infrastructure operators

| Dimension | Assessment |
| --- | --- |
| What GRYPS can explain | PoP names from PeeringDB; UNKNOWN shared fibre |
| What is requested | Qualitative upstream/redundancy if tenant-authorised |
| Safe to disclose | Minimal |
| Must not share | Third-party circuit speculation as fact |
| Approval | Gate + usually site/provider intro |
| Useful response | Scoped backhaul class |
| Impossible without them / tenant | Shared-fibre confirmation |
| Readiness | **Blocked** until a facility/site claim authorises a specific ask |

### E. Finnish regulatory / public-data authorities (Traficom)

| Dimension | Assessment |
| --- | --- |
| What GRYPS can explain | Licence regime; non-public register existence |
| What is requested | What is lawfully public; open-data pointers |
| Safe to disclose | Research purpose; no demand for secret locations |
| Must not share / ask | Unauthorized register extract |
| Approval | Gate; prefer published mailboxes |
| Useful response | Process clarity |
| Impossible without policy change | Open FI gateway coordinate inventory |
| Readiness | **Ready for user approval** of a carefully worded public-data clarification (after gate) |

### F. Industrial-site research participants

| Dimension | Assessment |
| --- | --- |
| What GRYPS can explain | Envelope research goals; L4/L5 needs |
| What is requested | Template C inventory; optional measurement plan |
| Safe to disclose | Anonymised publication options |
| Must not share | Other sites’ confidential data; REVIEW packages |
| Approval | Gate + consent + storage plan |
| Useful response | L4 inventory; path to L5 |
| Impossible without them | Serving path, power domains, real failover |
| Readiness | **Blocked** — no volunteer; do not invent one |

---

## 4. Phase 3 independent-review readiness

| Question | Finding |
| --- | --- |
| Reproducible? | REVIEW-02 designed for `npm ci` + `test:score` + `typecheck`; homepage 83 · B recorded. This sprint did not re-run inside `review-package-02/` (no package mutation). Permission plan documents supported checks. |
| Scope/limitations clear? | Yes — README/GUIDE/THIRD-PARTY-NOTICES; no app, no terrain, no full discrepancy register |
| D-01–D-13 disclosed? | Summarised in REVIEW-GUIDE without OSM centroid; full register stays in development checkout |
| Permission/acknowledgement enough? | **Template exists; unsigned; reviewers unnamed** → not send-ready |
| Without confidential P5 evidence? | **Yes** — engine review is separable; P5 synthetics/public pack optional annex only if listed |
| Can challenge not merely confirm? | Design intent yes (open D-items, questionnaire annexes); success depends on reviewer selection |

**Do not alter or distribute REVIEW-01/02 in this sprint.**

Preferred engine-review vehicle per permission plan: **REVIEW-02** (`review-package-02/`), not REVIEW-01 (EU-DEM extract).

---

## 5. Overall decision

**Methodology and repository controls are sufficiently consistent to support planning of an initial external engagement.**

**They are not sufficient to send anything today** without:

1. Signed Phase 3 permission + named reviewer (for engine review), and/or  
2. Completed P5-S4 approval gate with final request body and channel (for evidence requests), and  
3. Explicit user decision per engagement row in the decision register.

**Overall:** Ready for **user approval decisions** on a shortlist; **not** ready for autonomous outreach.

See `phase-5-external-engagement-sequence.md` and `phase-5-external-engagement-decision-register.md`.

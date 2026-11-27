# Phase 5 — Lapland pilot validation plan

**Document version:** `gryps-lapland-pilot-validation-plan-v0`  
**Status:** Research proposal only  
**Sprint:** P5-S3  
**Envelope:** Nordic Lapland — Public Evidence Research Envelope (`nordic-lapland-dual-path-v0`)  
**Companions:** `phase-5-field-validation-protocol.md`, `phase-5-evidence-request-templates.md`, P5-S2 pack + report  
**Recorded:** 2026-11-26

## Non-validation statement

This plan proposes *how* a future pilot could raise evidence maturity for Lapland-relevant dependency claims.

It does **not**:

- Assert that a real dual-path industrial installation exists in Finnish Lapland
- Name a participating site, provider agreement, contact person, or field campaign
- Add relationships to the P5-S2 pack
- Conduct measurements or send Templates A–D
- Claim end-to-end independence or produce a Signature / probability from outcomes

The pilot remains a **research envelope**, not a fictional site with invented infrastructure.

---

## 1. Pilot objective

Starting from P5-S2 Level 1 (publicly documented) architecture and facility-existence material, define what would be required to investigate — claim-by-claim — whether selected services in a Finnish Lapland industrial context share or separate infrastructure dependencies.

Success for a future execution would be a **traceable evidence dossier** with explicit UNKNOWN residues, not a pass/fail resilience certificate.

---

## 2. Starting point — already documented (P5-S2)

Pack path: `docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/`.

| Area | What is already on file | Maturity |
| --- | --- | --- |
| Catalogue snapshot | Starlink, OneWeb, Iridium Certus as distinct catalogue ids; catalogue-based orbit mix true | Internal / L1 metadata |
| Starlink architecture class | Optical ISL mesh (operator pages / Progress 2025) | L1 primary |
| Iridium architecture class | Cross-linked LEO mesh; teleport≠gateway roles (operator + IMO) | L1 primary |
| OneWeb architecture class | Phase 1 without ISLs (TMA 2025 secondary) | L1 secondary |
| Iridium facility existence | Svalbard commercial ground station named in 2019-03-28 IR | L1 primary, **historical** |
| OneWeb SNP existence | Svalbard, Piteå, Nuuk compiled May 2025 (TMA) | L1 secondary |
| OneWeb PoP existence | AMS17, LD8 via PeeringDB AS800 | L1 community self-publish |
| Finnish regulatory context | Earth-station licensing; register not open inventory | L1 primary context |
| Site-serving paths | **None** — envelope not connected to facilities | UNKNOWN |
| Shared backhaul / power / ops | **None evidenced** | UNKNOWN |
| End-to-end independence | Explicitly UNKNOWN | UNKNOWN |

---

## 3. Proposed investigation workstreams

### Workstream W1 — Refresh and corroborate public facility facts (L1→L2)

| Action | Target claims | Needs |
| --- | --- | --- |
| Re-retrieve Iridium ground inventory from a post-2019 primary | Svalbard (and peer stations) currency | Public IR / network docs |
| Dual-source OneWeb Nordic SNPs against regulator or operator primary | Svalbard / Piteå / Nuuk SNP existence | Template B and/or filings — **not invented** |
| Keep PoP ≠ SNP ≠ ground station labels | Non-conflation | Reviewer (Template D) |

**Outcome if successful:** Stronger L1/L2 facility-existence rows. Still **no** Lapland serving path.

### Workstream W2 — Provider architecture and landing scope (L3)

| Action | Target claims | Template |
| --- | --- | --- |
| Confirm architecture class wording for stated Nordic scope | ISL vs bent-pipe class | A |
| Ask whether geographic scope of interest maps to a disclosable landing set | Routing scope — expect many “not disclosable” | A |
| Ask what must not be inferred about dual-brand deployments | Independence caution | A |

**Must remain UNKNOWN** until answered: actual customer traffic routing for any Lapland terminal.

### Workstream W3 — Infrastructure operator facility roles (L3)

| Action | Target claims | Template |
| --- | --- | --- |
| Confirm role/ownership for any facility the pilot is authorised to discuss | Role; owner vs operator | B |
| Qualitative backhaul redundancy at facility — if disclosable | Backhaul class | B |

Do not solicit Traficom register contents beyond published materials.

### Workstream W4 — Site participation (L4)

| Action | Target claims | Template |
| --- | --- | --- |
| Document installed services, terminals, primary/secondary roles | Site service inventory | C |
| Power domain mapping per path | Shared vs separate power | C |
| Outage co-occurrence notes (redacted) | Shared outage leads | C |
| Consent for anonymised publication | Access class | C |

**Prerequisite.** A real site volunteer. Until then, W4 is `not_investigated` — **do not invent a site**.

### Workstream W5 — Operational observation (L5)

Only after W4 consent and a separate measurement plan:

| Measurement class | Purpose | Limitation |
| --- | --- | --- |
| Availability / shared outage correlation | Generate hypotheses of coupling | Not proof of shared fibre/SNP |
| Failover exercise observation | Document intended secondary behaviour | Does not prove full independence |
| Latency/loss/throughput under stated conditions | Characterise paths | Not Signature input; no universal thresholds |

Minimum interpretation requirements: duration, season, instrumentation, concurrent site activity (protocol §E.2).

### Workstream W6 — Independent review

| Action | Template |
| --- | --- |
| Review claim pack before any public “supported” elevation of site-serving edges | D |
| Adjudicate contradictions without newer-wins | D |

---

## 4. Relationship triage (from P5-S2 UNKNOWN set)

| Relationship / question | Potentially confirmable by | Remains UNKNOWN until |
| --- | --- | --- |
| Architecture-class differences (Starlink / OneWeb / Iridium) | Public (done) + provider refresh (A) | — (already L1; refresh optional) |
| Named Nordic facility existence | Public / B / dual-source | Currency refresh for 2019 Iridium list; primary for TMA SNPs |
| Lapland terminal → named gateway/SNP | Provider (A) + site (C); never from map alone | Direct serving-path evidence |
| Actual customer routing | A + C (+ measurement lead) | Account-scoped disclosure or controlled observation |
| Shared terrestrial backhaul | B + A + C | Explicit confirmation or traced path evidence |
| Shared site power | C (+ electrical drawings) | Site confirmation |
| Shared NOC / control / wholesale | A (+ contract review) | Provider/site disclosure |
| End-to-end path independence | Combination of L3–L5 across layers | Multi-layer supported findings — still scoped, never absolute |
| Site availability / performance | C + L5 campaign | Measurement plan + duration |
| Public FI earth-station inventory | Not available via open Traficom data today | Policy change or lawful disclosure channel |

---

## 5. Confidentiality and data protection

| Topic | Pilot rule |
| --- | --- |
| Default public identity | Region + sector only (Finnish Lapland industrial research envelope) |
| Site name / coordinates | Restricted unless written permission |
| Terminal serials, account ids | Restricted; minimise retention |
| Provider non-public answers | Restricted; redacted summaries only with Template A/B reuse consent |
| Traficom earth-station register | Do not attempt unauthorized access |
| Cross-border transfer | Prefer EU/EEA storage for site personal data if any is collected |
| Publication | Prefer claim tables with scopes over raw configs |

---

## 6. Proposed validation outcomes for the pilot dossier

Use protocol outcome vocabulary only — **no numeric independence score**:

- Architecture-class claims: expect `supported_within_scope` at L1 (already) / L2–L3 if refreshed  
- Facility existence: `supported_within_scope` or `outdated` / `unresolved` after refresh  
- Site-serving and independence claims: remain `not_investigated` or `evidence_unavailable` until W2–W5 produce scoped evidence; then `supported_within_scope`, `partially_supported`, `contradicted`, or `unresolved`

---

## 7. Explicit non-goals

- No Model v0.5 and no Signature from pilot outcomes  
- No closure of D-01–D-13 by this plan alone  
- No production ingestion pipeline  
- No assertion that Starlink + OneWeb + Iridium catalogue diversity equals dual-path independence  
- No conflation of Iridium Svalbard ground station with OneWeb Svalbard SNP  
- No conflation of PeeringDB PoPs with SNPs or gateways  

---

## 8. Dependencies on external parties

| Party | Needed for | Blocking if absent |
| --- | --- | --- |
| Satellite providers | L3 landing/architecture confirmation | Site-serving claims stay UNKNOWN |
| Infrastructure operators | L3 facility role / backhaul class | Facility currency and role precision |
| Industrial site volunteer | L4 configuration / power / outages | Entire site layer stays UNKNOWN |
| Independent technical reviewer | Adjudication before public elevation | Over-claim risk |
| Legal / ethics review (as needed) | Templates, consent, anonymisation | Publication of restricted material |

---

## 9. Suggested sequence (future execution only)

1. Freeze P5-S2 pack as baseline (already done)  
2. W1 public refresh + Template D dry-run on public pack  
3. If authorised: send Templates A/B for named public facilities only — still no invented site  
4. If a site volunteers: Template C → restricted L4 dossier  
5. Optional L5 measurement plan under separate approval  
6. Template D adjudication → public redacted note  
7. Still no scoring feed; still no silent UNKNOWN→separated inference  

**P5-S3 stop line:** steps 3–6 are **not** started in this sprint.

---

## 10. Limitations

- Plan quality ≠ field evidence  
- Secondary SNP compilation may age before any pilot runs  
- Provider “not disclosable” answers are expected and valid  
- Environmental extremes in Lapland may limit measurement seasons  
- Research prototype posture: no commercial validation product  

---

## 11. Versioning

| Version | Date | Notes |
| --- | --- | --- |
| v0 | 2026-11-26 | Initial P5-S3 research proposal from P5-S2 envelope |

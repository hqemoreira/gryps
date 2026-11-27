# Phase 5 — Evidence acquisition register

**Document version:** `gryps-evidence-acquisition-register-v0`  
**Sprint:** P5-S4  
**Baseline pack:** `nordic-lapland-dual-path-v0` (immutable this sprint)  
**Companions:** P5-S1 feasibility; P5-S2 pack/report; P5-S3 protocol / templates / pilot plan; this sprint’s target register, request matrix, approval gates  
**Worktree:** `development/phase-4-evidence-integrity` @ `dc73abc`  
**Recorded:** 2026-11-26

## Non-acquisition statement

This register prepares claim-specific external evidence acquisition. It does **not** send requests, acquire provider-confidential data, upgrade P5-S2 statuses, invent a Lapland site, or validate site-level dependencies.

Maturity labels follow `phase-5-field-validation-protocol.md` (L1–L5). Categories **A–F** below classify *what kind of next step* a claim needs — not a re-grade of the frozen pack.

---

## 1. Pack baseline (unchanged)

| Item | Count / note |
| --- | --- |
| Documented relationships | 12 — all `documented`, assertion kinds `architecture_class` or `facility_existence` |
| UNKNOWN relationships | 8 |
| Evidence rows | 12 — `accessClass: public` |
| Site-serving edges | **None** (`env-lapland` not connected to facilities) |
| Scores / probabilities | None |

Do not retrospectively upgrade pack `verificationStatus` or confidence in this sprint.

---

## 2. Category legend

| Cat | Meaning |
| --- | --- |
| **A** | Publicly documented fact already in P5-S2 |
| **B** | Needs independent corroboration (L2) |
| **C** | Needs provider confirmation (L3) |
| **D** | Needs infrastructure-operator confirmation (L3) |
| **E** | Needs industrial-site participation (L4) |
| **F** | Needs operational measurements (L5) |

A claim may appear in more than one category over time; the **priority** column states the next useful step.

**Priority scale:** P1 (highest contribution to site-level dependency understanding) … P4 (context / hygiene).

---

## 3. Category A — Already in P5-S2 (public L1)

| Claim ID | Rel / entity IDs | Status / maturity | Established | Remains unknown | Next evidence that would help | Org type | Access class likely | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLAIM-A-01 | `rel-starlink-offers`, `const-starlink` | documented / L1 primary | Starlink offers optical-ISL constellation class | Nordic gateway inventory; Lapland path | Optional refresh of operator wording | Satellite operator | Public | P3 |
| CLAIM-A-02 | `rel-oneweb-offers`, `const-oneweb` | documented / L1 **secondary** | OneWeb Phase 1 class without ISLs (TMA) | Operator primary attestation of Phase 1/ISL roadmap for Nordic scope | Provider architecture confirmation | Satellite operator | Public or restricted | P1 |
| CLAIM-A-03 | `rel-iridium-offers`, `const-iridium` | documented / L1 primary | Iridium cross-link LEO class | Current ground inventory currency | Optional IR/network refresh | Satellite operator | Public | P2 |
| CLAIM-A-04 | `rel-*-exposed-const` (×3) | documented / L1 | Each brand exposed to constellation FD class | Shared vs distinct fleet impact at a site | Site + measurement (later) | Site / measurement | Restricted | P4 |
| CLAIM-A-05 | `rel-iridium-uses-svalbard` | documented / L1 primary **historical** | Iridium named Svalbard commercial GS (2019-03-28) | 2026 currency; owner vs operator; Lapland serving | Provider + infra operator refresh | Operator + ground host | Public / restricted | P2 |
| CLAIM-A-06 | `rel-oneweb-uses-snp-{svalbard,pitea,nuuk}` | documented / L1 secondary | Compiled SNP place names May 2025 | Primary attestation; currency; Lapland serving | Dual-source / operator / host | Operator + SNP host | Public / restricted | P1 |
| CLAIM-A-07 | `rel-oneweb-uses-pop-{ams,ldn}` | documented / L1 PeeringDB | AS800 lists AMS17 & LD8 interconnect facilities | Whether PoP serves Lapland traffic; backhaul behind PoP | Provider + facility/carrier | Operator / DC / carrier | Public / restricted | P2 |
| CLAIM-A-08 | Traficom context evidence (no rel edge) | documented / L1 | FI earth-station licence regime; register not open inventory | Public FI gateway coordinates | Lawful public clarification only | Regulator | Public | P3 |

---

## 4. Category B — Independent corroboration

| Claim ID | Related IDs | Current | Established | Remains unknown | Resolving evidence | Org type | Access | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLAIM-B-01 | OneWeb SNP Nordic set | L1 secondary only | TMA appendix names | Independence from TMA compilation chain | Regulator filing and/or operator/host primary distinct from TMA | Regulator / operator / host; academic review | Public / restricted | P1 |
| CLAIM-B-02 | OneWeb no-ISL Phase 1 | L1 secondary | TMA + cited filings in paper | Operator-current status for Nordic enterprise service | Operator written architecture class (not sales pitch) | Satellite operator | Restricted possible | P1 |
| CLAIM-B-03 | Iridium Svalbard currency | L1 historical | 2019 IR list | Post-2019 primary inventory | Newer Iridium primary **or** independent host confirmation | Operator / KSAT-class host | Public / restricted | P2 |
| CLAIM-B-04 | Gateway vs PoP vs SNP taxonomy | L1 mixed | Starlink Progress + IMO + TMA distinctions | Consistent applied taxonomy on Nordic facilities | Independent technical review of claim wording | Independent reviewer | Public review | P2 |

Provider self-confirmation alone does **not** satisfy Category B.

---

## 5. Category C — Provider confirmation (Template A)

| Claim ID | Related UNKNOWN / rel | Current | Established | Remains unknown | Resolving evidence | Org | Access | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLAIM-C-01 | Architecture Nordic scope for OneWeb | L1 sec. | Secondary no-ISL class | Current architecture for services usable in FI Lapland | Written A1/A2 answers scoped to region/time | Eutelsat OneWeb | Restricted likely | P1 |
| CLAIM-C-02 | Starlink landing / gateway dependency class for high-latitude FI | L1 arch. only | ISL class public | Whether / how gateway diversity applies to Lapland-class users | Bounded A2/A3 — expect many “not disclosable” | SpaceX / Starlink | Restricted likely | P1 |
| CLAIM-C-03 | Iridium ground roles for Nordic user traffic | L1 + 2019 GS | Cross-links; historical Svalbard name | Teleport vs gateway roles for Certus user traffic in Nordic scope | A2/A3 with IMO role vocabulary | Iridium | Restricted possible | P2 |
| CLAIM-C-04 | `unk-customer-routing` | UNKNOWN | — | Actual landing set for Lapland-class accounts | A3 routing scope (named set / region / not disclosable) | Each provider | Confidential likely | P1 |
| CLAIM-C-05 | `unk-shared-ops` | UNKNOWN | — | Shared NOC / wholesale / MVNO | A4/A5 factual dependency classes — **not** “certify independence” | Each provider | Restricted | P2 |
| CLAIM-C-06 | Dual-brand failure-domain guidance | UNKNOWN | Catalogue diversity only | Whether any published dual-path guidance exists | A5 — may be “none offered” | Each provider | Public / restricted | P3 |

---

## 6. Category D — Infrastructure-operator confirmation (Template B)

| Claim ID | Related | Current | Established | Remains unknown | Resolving evidence | Org type | Access | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLAIM-D-01 | Iridium Svalbard facility role / host | L1 historical name | Named commercial GS 2019 | Owner vs operator; RF role; services hosted | B1–B3 | Ground-station operator (e.g. KSAT-class) | Restricted | P2 |
| CLAIM-D-02 | OneWeb SNP hosts (Svalbard / Piteå / Nuuk) | L1 secondary names | Place names in TMA | Who operates SNP; user-traffic vs TT&C | B1–B3 | SNP / teleport host | Restricted | P1 |
| CLAIM-D-03 | `unk-shared-backhaul` at facility | UNKNOWN | PoP names only | Upstream fibre / shared metro | B4–B5 qualitative | Teleport / DC / fibre | Restricted / confidential | P1 |
| CLAIM-D-04 | Space Norway Nittedal (P5-S1 lead) | Lead only — **not in pack** | Public teleport page | Any link to Starlink/OneWeb/Iridium Lapland paths | Only if dual-sourced relevance first | Teleport operator | Restricted | P4 |
| CLAIM-D-05 | SSC Nordic sites (P5-S1 lead) | Lead only — **not in pack** | Partner PR | SNP vs monitoring terminal hosting | B1 with dual-source | Ground host | Restricted | P3 |

---

## 7. Category E — Industrial site (Template C)

| Claim ID | Related | Current | Established | Remains unknown | Resolving evidence | Org | Access | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLAIM-E-01 | `unk-lapland-to-any-gateway` | UNKNOWN | Envelope only | Any serving path to named facilities | Installed services + provider account context | Industrial site volunteer | Confidential | P1 |
| CLAIM-E-02 | Site service inventory / primary–secondary | UNKNOWN | — | What is installed vs used | C1–C3 | Site | Restricted / confidential | P1 |
| CLAIM-E-03 | `unk-shared-power` | UNKNOWN | — | Shared UPS/breaker | C4 | Site | Restricted | P1 |
| CLAIM-E-04 | Outage co-occurrence | UNKNOWN | — | Shared incident pattern | C5 redacted logs | Site | Restricted | P2 |
| CLAIM-E-05 | Failover arrangement | UNKNOWN | — | Auto/manual/none; drills | C6 | Site | Restricted | P2 |

**No site is named or assumed willing.** Until a volunteer exists, Category E stays `not_investigated`.

---

## 8. Category F — Operational measurements

| Claim ID | Related | Current | Established | Remains unknown | Resolving evidence | Org | Access | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLAIM-F-01 | `unk-site-performance` | UNKNOWN | — | Availability/latency/throughput under Lapland conditions | Timed campaign per protocol §E | Site + measurement lead | Restricted | P2 |
| CLAIM-F-02 | Failover / recovery behaviour | UNKNOWN | — | Observed secondary take-over | Controlled failover exercise | Site | Restricted | P2 |
| CLAIM-F-03 | Shared outage correlation | UNKNOWN | — | Simultaneous impairment across brands | Dual-path logging | Site | Restricted | P2 |
| CLAIM-F-04 | `unk-e2e-independence` | UNKNOWN | — | Multi-layer independence | **Cannot** be established by F alone — needs C–E + adjudication | Combined | Mixed | P1 (as open research question) |

Measurements never alone prove infrastructure independence (P5-S3).

---

## 9. Priority summary (acquisition order)

| Rank | Focus | Primary claims | Why |
| --- | --- | --- | --- |
| 1 | OneWeb architecture + Nordic SNP/PoP facts | A-02, B-01, B-02, C-01, D-02 | Bent-pipe/SNP topology dominates Nordic landing risk narratives; pack weakest (secondary) here |
| 2 | Starlink high-latitude gateway dependency class | C-02, A-01 | ISL class known; site landing still opaque |
| 3 | Iridium architecture + Svalbard currency | A-03, A-05, B-03, C-03, D-01 | Strong architecture L1; facility list aged |
| 4 | SNP / gateway / teleport / PoP role clarity | B-04, matrix REQ role questions | Prevents entity conflation in later packs |
| 5 | Terrestrial backhaul / upstream | D-03, C-04 | Shared fibre is a prime false-independence failure |
| 6 | Facility ownership / operation / sharing | D-01–D-03 | Separates host from brand |
| 7 | Site terminal / service configuration | E-01, E-02 | Only path to serving relationships |
| 8 | Site power / backup | E-03 | Classic shared site domain |
| 9 | Ops / control / wholesale | C-05 | Brand diversity ≠ ops diversity |
| 10 | Failover + operational measurements | F-01–F-03 | Behavioural leads — not independence certificates |

---

## 10. What each evidence type can establish

| Evidence type | Can establish | Cannot establish alone |
| --- | --- | --- |
| Documented architecture fact | Space-segment class; role taxonomy | Site path; shared backhaul; independence |
| Specific facility relationship | Named facility existence / role / host | That Lapland traffic uses it |
| Site-serving relationship | Terminal → landing (scoped) | Full e2e independence |
| Shared dependency | Explicit shared entity affecting ≥2 paths | Probability of failure |
| Scoped separation | `separated_from` inside stated layer/scope | “Complete dual-path independence” |
| Operational observation | Behaviour under recorded conditions | Architecture truth; hidden shared fibre |

---

## 11. Versioning pointer

P5-S2 pack remains immutable baseline. Future approved evidence → separate `nordic-lapland-dual-path-v1` (see request matrix § versioning and approval gates). No v1 created this sprint.

## 12. Limitations

- Register is planning, not fieldwork  
- Org willingness unknown  
- Traficom register locations remain non-public  
- Phase 3 REVIEW packages address Model v0.4 engine review — not these acquisition claims (keep roles separate)

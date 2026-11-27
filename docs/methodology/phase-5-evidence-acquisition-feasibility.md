# Phase 5 — Evidence acquisition feasibility

Sprint 1 (Phase 5). Worktree `C:\GitHub\Projects\gryps-phase-4-evidence`, branch `development/phase-4-evidence-integrity`, HEAD `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`.

**Scope.** Investigate how GRYPS could move from synthetic dependency fixtures toward *real* infrastructure evidence. This document does **not** claim operational validation of Model v0.4, does **not** assert site dual-path independence, and does **not** invent gateway or backhaul relationships.

Retrieval / verification date for external URLs in this note: **2026-11-26**, unless a source’s own publication date is cited.

Claim labels:

| Label | Meaning |
| --- | --- |
| **Verified (repo)** | Observed in this repository |
| **Verified (source)** | Page/document retrieved and inspected for this sprint |
| **Documented (source)** | Stated by a cited publisher; not re-proven by GRYPS field work |
| **Lead** | Promising avenue; content or access not fully confirmed for GRYPS reuse |
| **Absent** | Not available in GRYPS data / not found as usable public inventory |

---

## 1. Baseline

| Check | Result |
| --- | --- |
| Branch | `development/phase-4-evidence-integrity` |
| HEAD | `dc73abc` — Phase 1–4 uncommitted work preserved |
| Scoring modules | `lib/deterministic-score.ts` / `lib/scoring.ts` not modified this sprint |
| Neon | Not accessed; no writes |
| REVIEW-01 / REVIEW-02 | Present on main checkout `C:\GitHub\Projects\gryps\review-package*` — not modified from this worktree |
| Commit / push / deploy | None |

---

## 2. Repository evidence audit

### 2.1 What GRYPS actually holds

| Capability | Status | Notes |
| --- | --- | --- |
| Advisor scoring catalogue (`ADVISOR_PROVIDERS`) | **Verified (repo)** | Fields: `id`, `name`, `orbit`, `class`, `confidence`, `aliases`. Heuristic confidence integers (65–90). No gateway/backhaul/ownership graph. |
| Display index (`INDEXED_PROVIDERS`) | **Verified (repo)** | Adds `operator`, `coverage70N`, `coverageNote`, `status`. Editorial; “not a live coverage database.” |
| Evidence package (`lib/evidence-model.ts`) | **Verified (repo)** | Curated source cards (model, catalogue, EU-DEM, Bittimittari, orbital reference, knowledge). Assessment confidence band is a *data-basis* heuristic, not infrastructure proof. |
| Data provenance UI (`DATA_PROVENANCE` in `lib/research-docs.ts`) | **Verified (repo)** | Named sources with `dateAccessed`, optional `license`, how-used text. |
| Geographic reference — EU-DEM via OpenTopoData | **Verified (repo)** | Adjacent terrain evidence; explicitly not blended into 0–100 Signature. |
| Geographic / quality reference — Bittimittari | **Verified (repo)** | Finnish municipality seeds only; CC BY 4.0 noted in provenance. |
| Dependency research fixtures A–E | **Verified (repo)** | Research-only JSON; C–E synthetic; A–B catalogue + architecture-class citations. |
| Dependency schema (Phase 4 spec) | **Verified (repo)** | Entities, relationships, evidence, UNKNOWN, contradiction principles. |
| Gateway / teleport / landing inventory | **Absent** | No production entities or IDs. |
| Backhaul / PoP / ASN binding | **Absent** | Not in Signature inputs. |
| Operator ownership graph | **Absent** (except display `operator` string) | Inmarsat listed under “Viasat / Inmarsat” in index only. |
| Site terminal / power fields | **Absent** | Not modelled in v0.4. |
| Live ingestion / enrichment pipeline for infrastructure | **Absent** | Historical enrichment route retired; no gateway feed. |
| Source verification workflow for third-party infra claims | **Partial** | Fixture validators + Phase 4 contradiction principles; no production evidence CMS. |

### 2.2 Descriptive metadata vs infrastructure fact

| Item | Classification |
| --- | --- |
| Orbit / broadband–narrowband labels | Catalogue **metadata** used by scoring |
| Catalogue confidence integer | Research **heuristic**, not availability % |
| Coverage notes (“polar shell”, “GEO elevation”) | Editorial / architecture **commentary** |
| Public ISL vs bent-pipe statements | Architecture-class **documentation** (when cited) — not site independence |
| Coverage maps (if used later) | **Do not** by themselves prove a specific gateway, PoP, or shared failure domain for a pin |

### 2.3 Existing timestamps / confidence representations

- Provenance records use `dateAccessed` (often month-level).
- Fixture evidence uses `publicationDate`, `retrievalDate`, optional `validFrom` / `validTo`, `verificationStatus`, `isSynthetic`.
- Signature confidence ranges: High/Medium/Low half-widths from evidence band — **not** infrastructure confidence.

---

## 3. Verified source inventory

Sources below were retrieved or confirmed via public pages/PDFs on 2026-11-26. Each row states what claim class it can support for GRYPS — not what GRYPS has already asserted as site fact.

### 3.1 Satellite operators / provider technical documentation

| Source | Owner | URL / reference | Could support | Scope | Dates | Access / reuse | Limitations | Claim class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Iridium Network | Iridium | https://www.iridium.com/network | LEO mesh / cross-link architecture class; polar reach narrative | Global constellation design | Page live 2026-11-26 (content revised over time) | Public marketing/tech page; cite with retrieval date | No site gateway map; no account landing proof | Documented (architecture class) |
| Iridium press — Punta Arenas ground station | Iridium IR | https://investor.iridium.com/2019-03-28-Iridium-Enhances-Network-with-New-Southern-Hemisphere-Ground-Station | Named commercial ground stations: Fairbanks AK, Svalbard Norway, Tempe AZ, Punta Arenas Chile; ISL routing narrative | Named sites + global ops | Published 2019-03-28 | Public press release | May be incomplete vs 2026 network; not site-serving proof for a Finnish pin | Documented (named facilities, historical) |
| Starlink Technology | SpaceX / Starlink | https://starlink.com/technology | Optical ISL / laser mesh claims (architecture class) | Constellation design | Retrieved 2026-11-26 (page fetch returned limited body in tool; treat as primary operator page requiring human re-check of current wording before citation lock) | Public | Coverage map ≠ gateway inventory; marketing framing | Documented / Lead (re-verify wording before fixture lock) |
| ESA eoPortal — OneWeb | ESA / eoPortal | https://www.eoportal.org/satellite-missions/oneweb | Mission/architecture secondary technical description | Constellation | Retrieved 2026-11-26 | Public technical encyclopaedia style | Secondary compilation; not operator attestation of current SNP set | Documented (secondary) |

### 3.2 Regulatory filings and authorities

| Source | Owner | URL / reference | Could support | Scope | Dates | Access / reuse | Limitations | Claim class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FCC IBFS earth-station licences (SpaceX Services examples) | FCC | e.g. https://fcc.report/IBFS/SES-LIC-20221229-01546/… ; search via FCC IBFS / fcc.report | Named US gateway site ID, lat/long, grant/expiry for licensed stations | United States (licensed sites) | Grant examples 2024-12-23; PN SES-02850 dated 2026-04-08 lists further applications | Public US regulatory records | **Does not** prove which gateway serves a Nordic user terminal; incomplete for non-US sites; third-party mirrors (fcc.report) should be cross-checked against FCC | Documented (facility existence / licence) |
| FCC OneWeb Talkeetna SNP narrative | FCC / WorldVu | https://www.fcc.report/IBFS/SES-LIC-20180604-01082/1412443.pdf | OneWeb Alaska gateway coordinates and Ka-band SNP role | Talkeetna, AK | Filing content verified via PDF text 2026-11-26 | Public | US site only | Documented |
| Traficom earth-station / radar licensing guidelines | Traficom | https://www.traficom.fi/files/media/file/Guidelines%20earth%20station%20and%20radar%20operation%20licencing%201.1.2023.pdf (filename variant `1.11.2023`) | Legal requirement for earth-station ops in Finland; licence ≠ conventional terminal use | Finland | Issued 1 Nov 2023 | Public PDF | **No public inventory of licensed stations** in guidelines | Documented (regulatory regime) |
| Traficom privacy statement — earth station register | Traficom | https://www.traficom.fi/files/media/file/Privacy%20statement%20earth%20station%20and%20radar%20operations.pdf | Confirms Traficom maintains a licence/supervision register including location of earth station | Finland | Retrieved 2026-11-26 | Public privacy notice | Register is for official duties — **not published as open data** for third-party scraping | Documented (register exists; public bulk access **Absent**) |
| SpaceFinland — earth station ops | SpaceFinland / Traficom briefing | https://spacefinland.fi/en/earth-station-and-radar-operations | Points to Traficom as competent authority | Finland | Fetch 403 in this environment; existence corroborated via search snippets | Public | Treat as Lead until unblocked fetch | Lead |
| IMO MSC.1/Circ.1613/Rev.2 (Iridium GMDSS description) | IMO | https://wwwcdn.imo.org/localresources/en/OurWork/Safety/Documents/Documents%20relevant%20to%20GMDSS/MSC.1-Circ.1613-Rev.2.pdf | Teleport vs gateway roles; ISL; MES–teleport–gateway architecture | Global Iridium system description for GMDSS context | Circ. Rev.2 effective from 2023-07-01 | Public IMO circular | Safety-service framing; may lag commercial SKU detail | Documented (architecture roles) |

### 3.3 Public gateway / teleport / landing records (compiled)

| Source | Owner | URL / reference | Could support | Scope | Dates | Access / reuse | Limitations | Claim class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TMA 2025 — Measuring the OneWeb Satellite Network | Zhao et al., Univ. Victoria | https://tma.ifip.org/2025/wp-content/uploads/sites/14/2025/06/tma2025-paper3.pdf | Compiled SNP/PoP list (May 2025); bent-pipe / no-ISL Phase 1 implication; Nordic SNPs e.g. Svalbard, Piteå, Nuuk | Global compilation + measurement study | Paper 2025; SNP list “as of May 2025” | Academic PDF; cite properly | Authors compile from AWS dataset + regulators — **not** OneWeb primary attestation; ages quickly | Documented (secondary compilation) |
| SSC Space news — OneWeb SNP installations | Swedish Space Corporation | https://sscspace.com/news/empowering-one-of-the-largest-constellation-operators-with-site-installations/ | Partner confirmation of multiple SNP installs; mentions SSC Sweden sites hosting OneWeb end-user terminals (Stockholm Teleport, Esrange) | Named partner sites | Published 2025-02-05 | Public corporate news | Hosting/terminal monitoring ≠ user traffic SNP map; commercial self-interest | Documented (partner claim) |
| Space Norway — Nittedal Teleport | Space Norway | https://spacenorway.com/infrastructure/ground-services/nittedal-teleport/ | Existence of major Nordic teleport / fibre interconnect narrative | Nittedal, Norway | Retrieved via search 2026-11-26 | Public | Does not bind Starlink/OneWeb/Iridium user paths to this teleport without further evidence | Documented (facility existence) |

### 3.4 Internet routing / peering

| Source | Owner | URL / reference | Could support | Scope | Dates | Access / reuse | Limitations | Claim class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PeeringDB ASN 800 (OneWeb) | PeeringDB / OneWeb | https://www.peeringdb.com/asn/800 | PoP / interconnection **facilities** list (Equinix, etc.); ASN identity | Facilities self-published by network | Page last updated fields include 2026-11-02 (ASN meta); facility list retrieved 2026-11-26 | PeeringDB terms; community data | Facilities ≠ SNPs; does **not** prove which PoP a terminal uses; voluntary/incomplete | Documented (interconnect presence) |
| PeeringDB AS43905 Space Norway Satcom | PeeringDB | https://www.peeringdb.com/asn/43905 | ASN existence for Space Norway Satcom | Org-level | Updated 2025-08-01 | PeeringDB terms | Little peering detail disclosed | Lead / weak facility signal |

### 3.5 Government and research datasets (already or adjacent)

| Source | Owner | URL / reference | Could support | Scope | Dates | Access / reuse | Limitations | Claim class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Traficom open data portal — Bittimittari | Traficom | https://tieto.traficom.fi/en/open-data | Terrestrial/mobile broadband quality measurements (municipality aggregates in GRYPS seeds) | Finland | Open-data page verified 2026-11-26; monthly updates described | Free use with attribution (portal text); GRYPS already notes CC BY 4.0 | **Not** satellite path independence; Finland-only | Documented (adjacent quality evidence) |
| Traficom frequency allocation / radio station open data | Traficom | Listed on same open-data page (OData) | Spectrum / radio station inventories (broadcast-oriented sets verified as published) | Finland | Updated per portal | Attribution required | Unlikely to list LEO gateway SNPs as such without careful filtering — treat as Lead for exploration, not as gateway graph | Lead |
| EU-DEM / Copernicus via OpenTopoData | EEA / Copernicus | Already wired in GRYPS | Terrain adjacency | Europe | On-demand | Copernicus/EEA terms | Not infrastructure dependency | Documented (adjacent) |

### 3.6 Independent technical studies

| Source | Owner | URL / reference | Could support | Scope | Dates | Access / reuse | Limitations | Claim class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TMA 2025 OneWeb measurement paper | Academia | See §3.3 | Bent-pipe implications; SNP/PoP topology hypotheses; outage case studies | Measurement + compilation | 2025 | Cite academic norms | Secondary; measurement vantage points limited | Documented / Lead |
| OneWeb@PanLab Yellowknife SNP outage note | UVic community | https://onlineacademiccommunity.uvic.ca/oneweb/oneweb-yellowknife-snp-outage/ | Example that SNP outages are observable research events; references curated SNP map | Measurement narrative | References Sept 2026 outage in page text | Academic community site | Not primary operator status page | Lead (event methodology) |

### 3.7 Site-level evidence (requires partner / field)

| Need | Public? | Access |
| --- | --- | --- |
| Dual outdoor units / mounts | No | Site survey / BOM / photos with consent |
| Distinct power domains / UPS topology | No | Electrical drawings / operator attestation |
| Which gateway/PoP actually serves the account | Rarely public | Provider NOC / contract / traceroute under controlled experiment |
| Failover automation timing | No | Ops procedure + drill logs |
| Wholesale / MVNO resale chain | Sometimes contractual | Provider disclosure |

---

## 4. Evidence gaps (explicit)

| Gap | Why it matters |
| --- | --- |
| No public Finnish earth-station **location inventory** from Traficom open data | Cannot map domestic gateways from regulator bulk data today |
| No binding from a Nordic user terminal to a specific SNP/PoP | Blocks `connects_through` at site scope |
| No GRYPS backhaul fibre / IX membership graph | Shared landing risk stays UNKNOWN |
| No terminal-count / power-domain fields in assessment inputs | Site layer stays UNKNOWN |
| Starlink non-US gateways poorly covered by FCC IBFS alone | Geographic bias if US licences are over-weighted |
| Secondary SNP lists age quickly | Must re-retrieve before any “documented” edge |
| Operator marketing pages omit complete ground inventories | Incomplete by design |

---

## 5. Priority acquisition plan

Ranked by value for *real infrastructure dependency* understanding (not for raising Signature scores):

| Priority | Layer | Publicly approachable? | Requires disclosure / field? |
| --- | --- | --- | --- |
| P1 | Constellation / service architecture (ISL vs bent-pipe, orbit class) | **Yes** — operator + secondary technical sources | No for architecture-class edges |
| P2 | Named gateway / SNP / teleport existence (global + Nordic-relevant) | **Partial** — FCC IBFS, academic compilations, partner press | Operator confirmation for completeness |
| P3 | PoP / peering facility presence (ASN) | **Partial** — PeeringDB | Does not equal user path binding |
| P4 | Backhaul / shared metro fibre under landings | **Weak publicly** | Provider / carrier disclosure |
| P5 | Ownership / wholesale / MVNO | **Partial** (corporate filings) | Contractual |
| P6 | Site terminal + power independence | **No** | Field partner |
| P7 | Shared NOC / cyber / provisioning | **No** at useful precision | Operator security disclosure |

**Rule.** Public coverage maps and catalogue orbit mix remain **insufficient** for P2–P7 independence claims.

---

## 6. Minimum real-world evidence record

Phase 4 fixture schema (`gryps-dependency-fixture-v0.1`) is **nearly sufficient** for research packs if extended with a few fields. Do **not** migrate Neon or change Advisor inputs yet.

### 6.1 Required fields (conceptual)

Reuse fixture `EvidenceRecord` + `DependencyRelationship`, and add:

| Field | Purpose |
| --- | --- |
| `accessClass` | `public` \| `restricted` \| `synthetic` |
| `jurisdiction` | e.g. `FI`, `US-FCC`, `global` |
| `primaryVsSecondary` | `primary_operator` \| `regulator` \| `peer_reviewed` \| `partner_pr` \| `community_db` |
| `supportsClaimType` | `systems_different` \| `dependency_not_shared` \| `continues_through_failure` \| `architecture_class` \| `facility_existence` |
| `retrievalHash` or archived copy pointer | Optional integrity for PDFs |
| `humanReviewStatus` | `unreviewed` \| `accepted` \| `rejected` \| `contradicted_open` |

Existing fields already cover: ids, relationship type/direction, claim, source URL, publication/retrieval dates, validity, scope, verificationStatus, limitations, isSynthetic.

### 6.2 Schema gaps vs production

| Gap | Recommendation |
| --- | --- |
| No store for real evidence packs in app | Keep **research JSON packs** under `docs/methodology/fixtures/` or a new `docs/methodology/evidence-packs/` — not Neon |
| No UI beyond Dependency Lab | Optional: load a “real evidence pack” beside fixtures in a later sprint |
| Scoring still catalogue-only | **Keep** — real edges must not auto-feed v0.4 |

---

## 7. Recommended pilot case

### Finnish Lapland dual-path research envelope (forestry / remote industrial)

**Why suitable (evidence availability, not convenience alone)**

1. **Product fit** — GRYPS Research Library and hero scenarios already centre high-latitude Nordic ops; Finnish seeds exist for adjacent Bittimittari context (**Verified (repo)**).
2. **Regulatory clarity** — Traficom earth-station licensing regime is documented; open-data culture is strong for *adjacent* telecom measurements (**Verified (source)**). Gap: earth-station *locations* not open (**Absent** as inventory).
3. **Nordic-relevant public ground facts exist nearby** — Iridium Svalbard station (**Documented**, Iridium 2019 IR); OneWeb SNP compilations include Svalbard / Piteå / Nuuk (**Documented**, secondary TMA 2025). These support *facility existence / architecture* research — **not** “this Lapland terminal lands at Svalbard.”
4. **Architecture-class contrast is publishable** — Starlink ISL-class vs OneWeb bent-pipe-class vs Iridium cross-link-class can be bound as **documented** constellation traits with citations already used in Phase 4.

**What can be investigated publicly**

- Constellation architecture-class edges for Starlink / OneWeb / Iridium  
- Catalogue classification snapshots (provider diversity, catalogue-based orbit mix)  
- Nordic-adjacent named facilities as *existence* entities with scoped evidence  
- PeeringDB PoP facilities for OneWeb ASN 800 as interconnect leads  
- Finnish terrain (EU-DEM) and municipality broadband quality (Bittimittari) as **adjacent**, non-scoring context  

**What remains UNKNOWN without cooperation**

- Which SNP/PoP serves a specific Lapland terminal session  
- Shared fibre under any landing used by two brands  
- Site dual-terminal and dual-power domains  
- Wholesale resale  
- Continuity through a named failure scenario  

**Cooperation / access required for stronger claims**

- Remote-ops partner willing to document terminals, power, and failover drills  
- Optional provider/account confirmation of landing diversity (likely NDA)  
- Legal review before republishing any restricted material  

**Pilot could demonstrate**

- End-to-end process: retrieve → classify → attach to Phase 4 schema → show Unknown vs documented in Dependency Lab  
- Honest separation of architecture-class evidence from site independence  

**Pilot could not demonstrate**

- Validated operational resilience  
- Model v0.4 correctness  
- Closure of D-01 / D-06  

---

## 8. Explicit limitations

- No ingestion implemented this sprint.  
- No real-world edges asserted as site-verified.  
- Secondary compilations (TMA SNP list, fcc.report mirrors) require primary cross-check before any “verified” status.  
- Starlink Technology page body was thin in automated fetch — human re-read required before locking wording.  
- Finnish earth-station register privacy notice confirms data sensitivity; do not attempt unauthorized access.  
- Phase 4 synthetic fixtures remain synthetic — never promote them to real claims.  

---

## 9. Recommended next implementation milestone

**Milestone P5-S2 (research-only): “Nordic architecture + facility evidence pack v0”**

1. Create `docs/methodology/evidence-packs/nordic-lapland-dual-path-v0.json` using the Phase 4 schema + `accessClass` / `supportsClaimType` extensions.  
2. Include only:
   - Architecture-class relationships for Starlink / OneWeb / Iridium with retrieved citations  
   - A small set of **facility_existence** entities (e.g. Iridium Svalbard from IR press; selected OneWeb SNPs only where dual-sourced)  
   - Explicit `unknownRelationships` for site-serving gateway, backhaul, and site power  
3. Extend Dependency Lab to load this pack beside fixtures A–E, labelled **REAL EVIDENCE PACK · research**, never as Signature input.  
4. Extend validators: every non-synthetic evidence row must have retrieval date, URL, and `accessClass: public`.  
5. Still **no** Neon, **no** scoring change, **no** D-01 closure.

**Stop condition for this feasibility sprint:** sources and permitted uses established above; ingestion waits for P5-S2 authorisation.

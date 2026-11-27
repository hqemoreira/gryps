# Phase 5 — Nordic Lapland dual-path evidence pack (P5-S2)

Worktree `C:\GitHub\Projects\gryps-phase-4-evidence`, branch `development/phase-4-evidence-integrity`, HEAD `dc73abc`. No commit, push, merge, deploy, Neon write, scoring change, REVIEW, or LICENSE edit.

**Verdict.** A research-only public evidence pack is loaded in the Dependency Research Lab beside Fixtures A–E. It documents selected architecture-class and facility-existence facts with source passages. Finnish Lapland site-to-gateway routing and end-to-end independence remain **UNKNOWN**.

---

## 1. Baseline

| Check | Result |
| --- | --- |
| Branch / HEAD | `development/phase-4-evidence-integrity` @ `dc73abc` |
| Phase 1–4 + P5-S1 work | Preserved (uncommitted) |
| Model v0.4 scoring files | Untouched |
| Neon / REVIEW / LICENSE | Untouched |
| Homepage regression | **83 · B** |

---

## 2. Source-to-claim traceability

Full matrix: `docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/sources-traceability.json`.

### Included (passage-verified 2026-11-26)

| Source | Claim class | Key passage focus |
| --- | --- | --- |
| Iridium Network | Architecture (cross-links, LEO) | “each satellite is cross-linked to four others” |
| Iridium IR 2019-03-28 | Facility existence (Svalbard commercial ground station) | “Fairbanks… Svalbard, Norway and Tempe” |
| Starlink Technology | Architecture (optical ISL) | “3 space lasers (Optical Intersatellite Links…” |
| Starlink Progress 2025 PDF | Gateway vs PoP distinction | “multiple gateway sites and internet Points of-Presence” |
| TMA 2025 OneWeb paper | Phase 1 no ISL; Nordic SNPs May 2025 | Appendix: Svalbard, Piteå, Nuuk; “do not utilize ISLs” |
| PeeringDB AS800 | PoP-class interconnect (AMS17, LD8) | Interconnection Facilities list |
| IMO MSC.1/Circ.1613/Rev.2 | Teleport ≠ gateway role taxonomy | Definitions of Teleport / Gateway |
| Traficom guidelines 1.11.2023 | FI earth-station licence regime (context) | Licence required; conventional terminals generally out of scope |
| Traficom privacy notice | Register exists; not open inventory (context) | “Location of the earth station or radar” |
| GRYPS catalogue | Catalogue classification snapshot | Advisor / indexed providers |

### Excluded unverified leads (no supported relationships)

| Lead | Reason |
| --- | --- |
| FCC Talkeetna PDF via fcc.report | Body text not reliably retrieved this sprint |
| SSC OneWeb install PR | Partner PR; not dual-sourced for SNP rows |
| Space Norway Nittedal | No provider binding for Lapland paths |
| SpaceFinland earth-station page | HTTP 403; Traficom primaries already cover regime |

---

## 3. Pack structure and entities

Path: `docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/`

| File | Role |
| --- | --- |
| `pack.json` | Versioned dependency-compatible pack (`gryps-evidence-pack-v0`) |
| `sources-traceability.json` | Source → claim → evidence id mapping + excluded leads |

**Entity summary (18)**

- Research envelope: `env-lapland` (`assessment_site`, `research_envelope_only` — no invented terminals/gateways)
- Providers: Starlink, OneWeb, Iridium Certus
- Constellations: optical-ISL / bent-pipe Phase 1 / cross-link classes
- Ground facilities: Iridium Svalbard commercial ground station; OneWeb SNPs Svalbard / Piteå / Nuuk (compiled)
- Network PoPs: OneWeb AMS17, LD8 (explicitly `network_pop`, not SNP)
- Failure-domain labels for exposition only

**Non-conflation controls**

- `facilityClass`: `commercial_ground_station` | `snp` | `pop`
- Iridium Svalbard ≠ OneWeb SNP Svalbard (separate entities)
- PoP edges cite PeeringDB; SNP edges cite TMA appendix only

---

## 4. Supported relationships (12)

All `documented`, non-inferred, with evidence ids and scope:

- `offers` / `exposed_to` architecture-class edges for the three providers
- Iridium `uses` Svalbard commercial ground station (validFrom **2019-03-28**)
- OneWeb `uses` SNP Svalbard / Piteå / Nuuk (validFrom **2025-05**, secondary)
- OneWeb `uses` PoP AMS17 / LD8 (PeeringDB)

**No** `connects_through` from `env-lapland` to any facility.

---

## 5. Explicit UNKNOWN relationships (8)

| Id | Question (abbrev.) |
| --- | --- |
| `unk-lapland-to-any-gateway` | Lapland terminal → named gateway/SNP? |
| `unk-customer-routing` | Actual customer traffic routing? |
| `unk-shared-backhaul` | Shared terrestrial backhaul? |
| `unk-shared-power` | Shared site power? |
| `unk-shared-ops` | Shared NOC / control / wholesale? |
| `unk-e2e-independence` | End-to-end path independence? |
| `unk-site-performance` | Site availability / performance? |
| `unk-fi-earth-station-inventory` | Public FI earth-station inventory? |

Missing evidence is **not** treated as independence or as shared infrastructure.

---

## 6. Temporal and provenance treatment

- Every evidence row: `retrievalDate`, `publicationDate` where known, `validFrom`/`validTo` where stated, scope, `verificationStatus`, `limitations`, `accessClass: public`
- Iridium Svalbard: publication **2019-03-28** — not silently treated as current inventory
- OneWeb SNPs: compilation **May 2025**
- No contradictory pair in this pack; validator forbids silent supersession if contradicted confidence appears
- Short factual extracts only; no full-text redistribution of PDFs

---

## 7. Lab integration

- Scenario tab: **Lapland · Public evidence** beside A–E
- Display name: **Nordic Lapland — Public Evidence Research Envelope**
- Notices: public evidence pack; incomplete customer-serving path; **no Signature for the pack**
- Reference Signature remains homepage regression **83 · B** only
- Not added to Research Library, research-resolve, main nav, or production assessment inputs
- Adapter: `lib/research/evidence-packs.ts`

---

## 8. Validation results

| Check | Result |
| --- | --- |
| `npm run test:fixtures` | Pass (5 fixtures) |
| `npm run test:evidence-pack` | Pass (18 entities / 12 rels / 8 unknowns / 12 evidence) |
| `npm run test:dependency-lab` | Pass |
| `npm run test:evidence` | Pass |
| `npm run test:score` | Pass |
| `npm run typecheck` | Pass |
| Homepage | **83 · B** |

Validator: `scripts/verify-nordic-lapland-evidence-pack.ts` — entity refs, source linkage, scopes, facility-class non-conflation, required UNKNOWNs, no score fields, synthetic vs public distinction, production-workflow isolation.

---

## 9. Limitations and unresolved evidence needs

- Secondary SNP list needs primary OneWeb / regulator re-check before elevating beyond `documented`
- Iridium ground inventory needs a post-2019 primary refresh
- Finnish gateway coordinates remain unavailable from open Traficom data
- Site dual-terminal / power / failover need a field partner
- Customer-serving path binding needs provider disclosure or controlled measurement
- Live ingestion pipeline **not** started (per sprint stop)

---

## 10. Stop

P5-S2 complete. Next work (only if authorised): re-verify excluded leads, refresh facility vintages, or a partner-scoped site evidence addendum — **not** automatic production ingestion.

# Phase 4 — Provider dependencies and shared failure modes

Sprint 7 research note on `development/phase-4-evidence-integrity` at HEAD `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`. Analysis only. Model v0.4 scoring, Neon, and REVIEW packages were not modified.

Label every claim as one of:

- **Verified (code).** Observed in this repository’s scoring or catalogue modules.
- **Documented (public).** Stated in a cited public source with retrieval date 2026-11-26.
- **Hypothesis.** Plausible from architecture, not established for a GRYPS site.
- **Unknown.** Not available in GRYPS data and not asserted here.

Central question: when do two connectivity providers represent genuinely independent paths, and what evidence is required before GRYPS may say so?

## 1. Executive summary

**Verified (code).** Model v0.4 “redundancy (independent paths)” awards points from (a) the count of distinct catalog provider ids and (b) a boolean `hasOrbitMix` based only on orbit name and, for LEO, broadband vs narrowband class. The scoring engine stores no ground-segment, backhaul, power, NOC, terminal-count, or shared-operator fields.

**Verified (code).** Therefore a dual-provider Signature can rise when brands or orbit/class labels differ even when end-to-end independence is unknown. Starlink + OneWeb (two LEO broadband ids) does **not** receive the orbit-mix bonus; Starlink + Iridium (LEO broadband + LEO narrowband) does. Neither case proves independent gateways, fibre, or operations.

**Documented (public) vs Unknown.** Public constellation literature shows architectural contrasts (for example Iridium cross-links vs OneWeb bent-pipe gateway dependence), but GRYPS does not currently bind those facts to a site assessment. Specific gateway locations, PoP diversity, and site power/terminal independence remain **Unknown** in the product data model.

**Recommendation.** Treat path independence as a multi-layer evidence problem. Keep v0.4 arithmetic frozen. Next substantive step is a research schema for dependency entities and evidence confidence — not new weights.

## 2. Existing v0.4 implementation findings

Sources: `lib/deterministic-score.ts`, `lib/scoring.ts`, `lib/model-constants.ts`, `lib/evidence-model.ts`.

### What the engine consumes

| Input | Role in Signature |
| --- | --- |
| Distinct `ProviderMeta` rows from `parseProviders` | Path count for redundancy and caps |
| `ProviderMeta.orbit` (`LEO` / `MEO` / `GEO`) | `hasOrbitMix`; GEO latitude demerit in confidence |
| `ProviderMeta.class` (`broadband` / `narrowband`) | LEO class mix inside `hasOrbitMix` |
| `ProviderMeta.confidence` (integer) | Mean → remapped “provider / path independence” 0–25 |
| Latitude, sector, elevation default, autonomy, criticality | Site conditions, profile points, hard caps |

### Redundancy arithmetic (verified)

```text
n = distinct catalog providers
raw redundancy =
  0 if n = 0
  8 if n = 1
  22 + (hasOrbitMix ? 6 : 0) if n = 2
  28 if n ≥ 3
Layer B points = round(raw × 35 / 30), clamped 0–35
```

`hasOrbitMix` is true if:

1. selected rows use ≥2 distinct orbit strings, or
2. among LEO rows, both `broadband` and `narrowband` appear.

Examples (verified):

| Combination | Mix? | Raw | Remapped ≈ |
| --- | --- | ---: | ---: |
| Starlink only | — | 8 | 9 |
| Starlink + OneWeb | false | 22 | 26 |
| Starlink + Iridium | true | 28 | 33 |
| Starlink + Inmarsat | true (LEO+GEO) | 28 | 33 |
| Three catalog ids | no mix bonus | 28 | 33 |

### Related UI / evidence behaviour (verified)

- Component id `provider_confidence` is labelled “Provider / path independence” but is remapped mean catalog confidence; it does **not** read `hasOrbitMix` (discrepancy D-11).
- Evidence-package confidence *does* add +8 when `providerCount ≥ 2` and `hasOrbitMix` (`lib/evidence-model.ts`). That number is not part of the 0–100 Signature.
- Redundancy gap copy when mix is false: “Providers share the same orbital class — correlated outage risk remains.” That statement is stronger than the data model supports: GRYPS has not verified correlated outage; it has verified shared orbit/class labels.

## 3. Current provider catalogue capabilities and limitations

### Scoring catalogue — `ADVISOR_PROVIDERS` (verified)

| Field present | Values |
| --- | --- |
| `id` | `oneweb`, `starlink`, `iridium`, `inmarsat`, `vsat` |
| `name` | Display string |
| `orbit` | LEO or GEO only (no MEO id in the scoring catalogue) |
| `class` | broadband or narrowband |
| `confidence` | 65–90 heuristic integer |
| `aliases` | Free-text matching strings |

**Missing from scoring catalogue (verified absent):** constellation ownership beyond name, ISL capability, gateway/teleport ids, backhaul providers, PoPs, NOC locations, power model, terminal/modem count, service SKU, coverage polygons, SLA, failure-mode tags, evidence citations per field.

### Display index — `INDEXED_PROVIDERS` in `lib/providers.ts` (verified)

Additional fields: `operator`, `coverage70N`, `coverageNote`, `status` (operational/planned). Still no ground-segment graph. Includes MEO (O3b mPOWER) and many GEO brands that are **not** in `ADVISOR_PROVIDERS`, so they cannot enter v0.4 redundancy unless free-text maps to `vsat`/`inmarsat`.

| Concept | In scoring catalogue | In display index | Used by Signature |
| --- | --- | --- | --- |
| Provider id / name | yes | name only | yes |
| Operator | no | yes | no |
| Orbit | yes | yes | yes |
| Broadband/narrowband | yes | yes (+ broadcast) | yes (LEO mix only) |
| High-latitude coverage note | no | yes | no (GEO demerit is latitude rule, not this field) |
| Gateway / backhaul / NOC | no | no | no |
| ISL / bent-pipe | no | no | no |
| Terminal count | no | no | no |

## 4. Dependency-layer model

Layers below are a research frame for future methodology. They are not scored today.

### A. Space segment

| Dependency | Effect if shared | Effect if separated |
| --- | --- | --- |
| Same constellation / fleet | Correlated spacecraft or spectrum events | Different spacecraft fleets |
| Same orbit class only | Similar elevation / weather geometry; not same fleet | Different geometry (e.g. LEO vs GEO) |
| ISL mesh vs bent-pipe | Changes *which* ground assets matter | Does not by itself prove dual-provider independence |
| Payload / network architecture | Shared onboard routing risk within one fleet | Different architectures across fleets |

### B. Ground segment

Gateways, teleports, feeder antennas, geographic concentration. A bent-pipe LEO user link fails if the serving satellite cannot see a usable gateway (**Documented** for OneWeb-class bent-pipe designs; see §5). An ISL mesh can route around some ground outages but still needs eventual landing (**Documented** for Starlink and Iridium architectures; see §5). **Unknown** for any GRYPS site: which gateways serve that site, whether two brands share a teleport campus, diversity of gateway power.

### C. Network and backhaul

Gateway → fibre / microwave → IXP / transit → customer destination. Two “independent” satellite brands can still land on the same metro fibre or the same regional outage. **Unknown** in GRYPS: PoP identity, transit providers, IX membership.

### D. Operations and control

Provisioning, authentication, NOC, software config, cyber posture. Same corporate group or shared OSS/BSS can correlate outages even with different orbits. **Documented** example in catalogue: Inmarsat listed under “Viasat / Inmarsat” in `INDEXED_PROVIDERS` — ownership consolidation is named, but scoring still treats `inmarsat` as an independent catalog id from `vsat`. **Unknown:** operational coupling between any Advisor pair.

### E. Site-level dependencies

Power, mounts, terminals, local LAN, weather, sky view, maintenance access. Two RF paths that share one UPS or one roof mount fail together. **Verified (code):** GRYPS Signature ignores site power and terminal count. EU-DEM / terrain evidence is adjacent only (not blended into the 0–100 score).

Cross-cutting: a dependency can hit one provider (gateway outage for brand A), multiple providers (regional fibre cut under both landings), or the whole site (site power). Orbit diversity does not address site power.

## 5. Provider-combination investigation

Combinations below use only (a) GRYPS catalogue facts and (b) cited public architecture statements. Site-specific independence is never claimed.

### 5.1 Starlink + OneWeb

| Question | Finding | Status |
| --- | --- | --- |
| Demonstrably different in GRYPS? | Distinct ids; both LEO broadband; same orbit string; `hasOrbitMix` **false**; raw redundancy 22 | Verified (code) |
| Space segment | Different operators (SpaceX vs Eutelsat OneWeb per index). Both LEO broadband. | Documented (catalogue) |
| ISL vs bent-pipe | Starlink publishes optical ISL mesh on current satellites ([Starlink Technology](https://starlink.com/technology); Progress Report 2024/2025 PDFs, retrieved 2026-11-26). OneWeb user literature and technical comparisons describe bent-pipe / no ISL designs requiring simultaneous user+gateway visibility ([eoPortal OneWeb](https://www.eoportal.org/satellite-missions/oneweb); del Portillo et al. IAC 2018 comparison PDF; TMA 2025 measurement talk noting lack of ISL, retrieved 2026-11-26). | Documented (public) architecture class contrast |
| Shared ground / backhaul? | Not in GRYPS. Possible co-location or shared terrestrial transit is **Unknown**. | Unknown |
| Before claiming independence | Need: distinct terminal hardware; distinct gateway exposure for the site’s traffic; distinct landing/PoP or proven alternate landing; site power independence; confirmation neither path is a wholesale resale of the other. | Evidence requirement |

**Interpretation.** GRYPS currently treats this pair as *weaker* redundancy than Starlink + Iridium solely because LEO class labels match. That is a catalogue-label rule, not a measured independence result. Public architecture contrast (ISL-capable broadband vs bent-pipe broadband) is real at constellation-design level, but **does not** by itself prove a Nordic industrial site has two independent end-to-end paths.

### 5.2 Starlink + Iridium

| Question | Finding | Status |
| --- | --- | --- |
| Demonstrably different in GRYPS? | Distinct ids; LEO broadband + LEO narrowband; `hasOrbitMix` **true**; raw redundancy 28 | Verified (code) |
| Space segment | Different operators; different service class (broadband vs narrowband Certus). Iridium publishes cross-linked mesh ([iridium.com/network](https://www.iridium.com/network); Microwave Journal 2022-02-09 overview; NASA NTRS aeronautical communications architecture paper, retrieved 2026-11-26). | Documented (public + catalogue) |
| Capacity / mission fit | Narrowband Certus is not a substitute for broadband LEO throughput; independence for *control* traffic ≠ independence for *bulk* traffic. | Hypothesis / design practice |
| Shared ground / backhaul? | Different historical gateway models (Iridium fewer regional GES; Starlink many gateways). Specific pairing for a site: **Unknown**. | Unknown |
| Site terminal | Usually separate RF hardware — **Hypothesis** unless the assessment records two terminals. GRYPS has no terminal field. | Unknown in data model |
| Before claiming independence | Need terminal inventory; which traffic classes each path carries; Iridium landing/GES exposure for the account; Starlink gateway/PoP exposure; site power; whether “failover” is automatic. | Evidence requirement |

**Interpretation.** This is the strongest *catalogue-label* dual in v0.4 among LEO-only pairs. It is still not end-to-end independence evidence.

### 5.3 Starlink + Inmarsat (LEO + GEO)

| Question | Finding | Status |
| --- | --- | --- |
| GRYPS behaviour | Orbit mix true (LEO+GEO); GEO confidence halved for lat > 70 | Verified (code) |
| Different geometry | GEO elevation vs LEO sky geometry — different space-segment failure modes for weather/elevation | Documented (catalogue coverage notes + code demerit) |
| Corporate / ground | Index lists Inmarsat under Viasat / Inmarsat; Starlink separate. Shared terrestrial landing still **Unknown**. | Documented operator string; Unknown coupling |
| Before claiming independence | Same as above, plus honest GEO latitude limitation at Arctic sites | Evidence requirement |

### 5.4 VSAT + Iridium (common Research Library free-text)

| Question | Finding | Status |
| --- | --- | --- |
| Parsing | Free-text “VSAT + Iridium” maps to catalog `vsat` + `iridium` → mix true | Verified (code) |
| What “VSAT” is | Generic GEO placeholder (confidence 65). Not a named fleet. | Verified (code) |
| Independence | Cannot assess ground/teleport diversity of an unnamed VSAT. | Unknown |

### 5.5 Three-provider rows

**Verified (code).** `n ≥ 3` locks raw redundancy at 28 with **no** mix bonus. Adding orbit diversity beyond two ids does not increase the redundancy component further. That is a formula ceiling, not an independence measurement.

## 6. Failure-domain taxonomy

| Domain | Layer | Can hit multiple providers? | Evidence of exposure | Evidence of separation | Scope | Unknowns in GRYPS |
| --- | --- | --- | --- | --- | --- | --- |
| Constellation / spacecraft | Space | Same fleet: yes. Different fleets: usually no for the same fault | Fleet identity | Distinct constellation ids + operators | Regional to global within fleet | No fleet health feed |
| Orbit-geometry / elevation | Space | Same orbit class: correlated weather/elevation | Orbit labels | Mixed orbits or classes | Site-local geometry | No site RF survey in Signature |
| Gateway / teleport | Ground | Yes if shared campus or shared bent-pipe visibility | Gateway ids serving the site | Distinct gateway sets; ISL routing that avoids failed gateway | Local–regional | No gateway binding |
| Terrestrial backhaul / IX | Network | Yes (shared fibre, shared metro) | PoP / transit map | Diverse landings and diverse transit | Local–regional (sometimes wider) | No PoP data |
| Power (site) | Site | Yes — both RF paths die | Single UPS/genset topology | Dual power domains per terminal | Site | Not modelled |
| Terminal / modem | Site | Only if shared hardware | BOM / install record | Two independent outdoor units | Site | No terminal count |
| NOC / provisioning / cyber | Ops | Yes if shared OSS or supplier | Operator / MSSP identity | Separate ops domains | Potentially wide | Not modelled |
| Provider operational failure | Ops | Brand-scoped unless wholesale dependency | Contract / wholesale chain | No resale relationship | Brand to regional | Wholesale chain Unknown |
| Environmental / geographic | Site + ground | Can hit co-located antennas or regional gateways | Siting survey | Spatial separation of antennas and of gateways | Local–regional | Partial terrain evidence only |

No probabilities or weights are assigned. Absence of evidence is not evidence of independence.

## 7. Evidence and confidence framework (proposed research classes)

These classes are **not** scoring categories and are **not** approved for production chips without a later decision.

| Class | Meaning | Required evidence | Insufficient | May support a resilience claim? | Uncertainty communication |
| --- | --- | --- | --- | --- | --- |
| Verified dependency | Coupling confirmed for this assessment | Primary source or operator attestation tied to the site or account | Brand rumour; orbit co-label alone | Yes — as a *risk* fact | State the coupling and the source date |
| Documented dependency | Public architecture implies coupling class | Cited public architecture + explicit scope limits | Blog without primary source | Only as architecture context, not site proof | “Architecture class, not site-verified” |
| Plausible dependency | Reasonable shared failure without proof | Explicit hypothesis + what would falsify it | Silent assumption in a score | No numerical claim | Label **Hypothesis** |
| Unknown dependency | No data | Honest gap list | Filling with orbit mix | No | Em dash / UNKNOWN |
| Demonstrated separation | Specific dependency shown *not* shared | Positive evidence of distinct assets (e.g. two gateway sets, two power domains) | “Different logos” | Yes — for that dependency only | Name the dependency that was separated |
| Unverified independence | Claim of independence without separation evidence | — | Orbit mix bonus; dual brand | **No** | Do not allow as a Signature justification |

Three non-equivalent claims (must not be collapsed):

1. Systems are **different** (ids, orbits, classes).
2. Systems **do not share** a named dependency (requires positive separation evidence).
3. Systems **continue** through a named failure scenario (requires scenario test or attested design + operations).

v0.4 today mostly encodes (1). Methodology text sometimes reads as (2) or (3). That mismatch is D-01.

## 8. Limitations of current redundancy logic (D-01, D-06)

### How provider ids are counted (D-06)

**Verified.** `parseProviders` deduplicates by catalog id. Unknown strings drop. Free-text adds each catalog hit once. Path count = distinct ids, never modem count. Two `starlink` strings → one path. Starlink + OneWeb → two paths without mix bonus.

### Why different ids ≠ independent paths (D-01)

**Verified.** No ground, backhaul, power, or terminal fields enter `redundancyPoints`. The component label “independent paths” oversells the arithmetic.

### Why orbit diversity ≠ ground/backhaul independence

**Verified + Documented.** Orbit/class mix only inspects `orbit` and LEO `class`. Public ISL vs bent-pipe differences show that *ground* criticality can differ by constellation design, but GRYPS never loads that attribute. Two GEO brands could share a teleport; two LEO brands could share metro fibre. Orbit mix is silent on both.

### Relationship to the discrepancy register

| Id | Role of this sprint |
| --- | --- |
| D-01 | Supplies the technical basis: independence must be layered and evidenced; v0.4 encodes labels only. Register stays **open**. |
| D-06 | Confirms path count is distinct catalog ids, not terminals. Register stays **open**. |
| D-11 | Reminds that “path independence” also appears as a mislabelled confidence component. Out of scope to fix here. |

No register rows were edited.

## 9. Proposed future dependency architecture

### Option A — Enriched flat provider list

Add optional columns to each provider (ISL flag, operator group, notes).  
**Pros:** Small change. **Cons:** Cannot express “Starlink gateway X and OneWeb gateway Y share fibre Z”; forces independence into per-provider booleans.

### Option B — Typed dependency graph (recommended research direction)

Entities: `ServiceOffer`, `Constellation`, `SpaceSegmentTraits`, `GroundFacility`, `BackhaulPath`, `NetworkOperator`, `SiteTerminal`, `SitePowerDomain`, `DependencyEdge`, `EvidenceRecord`, `FailureDomain`.

Edges carry: dependency type, confidence class (§7), evidence refs, scope (global / regional / site).

Assessment then asks: for failure domain F, which edges couple the selected offers? Which edges are Unknown?

**Pros:** Matches the real question; supports UNKNOWN explicitly; separates “different” from “separated.” **Cons:** Heavier modelling; needs evidence ops; must not silently invent edges.

### Option C — Scenario checklist only (non-numeric)

Structured questions for assessors (two terminals? two power domains? attested gateway diversity?).  
**Pros:** Honest. **Cons:** Not reproducible without discipline; easy to game.

**Recommendation.** Pursue Option B as a research schema and Option C as the human evidence capture UI. Do **not** pick Option A as the long-term model merely because it is easy to bolt onto `ADVISOR_PROVIDERS`. Do **not** implement schemas, migrations, or weights in this sprint.

Implementation implications if later approved: version the dependency schema separately from `gryps-signature-v0.4`; keep Signature arithmetic frozen until a named model bump; never auto-fill edges from orbit labels alone.

## 10. Open research questions

1. Which failure domains must be in MVP vs later (site power and dual terminal are candidates for early honesty)?
2. How should GRYPS treat wholesale/MVNO resale when the RF brand differs from the network operator?
3. Should bent-pipe vs ISL be a first-class constellation trait in the research schema?
4. How to evidence gateway diversity without collecting sensitive infrastructure coordinates?
5. When may dual-path claims apply only to control-plane traffic (narrowband) vs full mission traffic?
6. How should historical Research Library dual-path prose be audited against this framework (separate sprint)?
7. Should the orbit-mix bonus remain a *diversity heuristic* with renamed UI, or be removed in a future model? (Decision only — no change now.)

## 11. Recommendations for the next development stage

1. **Do not change v0.4 redundancy weights.**
2. Draft a research JSON schema for Option B entities/edges/evidence classes (documentation + types only, or a non-scoring prototype module if a later sprint authorises code).
3. Rename or annotate UI copy that says “independent paths” so it matches what v0.4 actually counts (aligns with D-01 communication, still without closing the register).
4. Add constellation-architecture traits (ISL / bent-pipe / GEO) as **documented** metadata for research display — never as automatic independence.
5. Keep UNKNOWN as a first-class output in any future independence panel.

## Sources cited (public, retrieved 2026-11-26)

- GRYPS code: `lib/deterministic-score.ts`, `lib/providers.ts`, `lib/evidence-model.ts`, `lib/model-constants.ts`, `docs/methodology/discrepancy-register.md` (D-01, D-06, D-11) on the main working tree.
- Iridium cross-links: [iridium.com/network](https://www.iridium.com/network); Microwave Journal 2022-02-09; NASA NTRS “Architecture for Aeronautical Communications” PDF.
- OneWeb bent-pipe / gateway dependence: ESA eoPortal OneWeb mission page; del Portillo et al., “A Technical Comparison of Three LEO…” (IAC 2018 PDF); TMA 2025 OneWeb measurement presentation (University of Victoria community site).
- Starlink optical ISL / gateway role: [starlink.com/technology](https://starlink.com/technology); Starlink Progress Report 2024 and 2025 PDFs on starlink.com/public-files.

Where these sources describe constellation *design classes*, they do not verify a specific GRYPS site’s dual-path independence.

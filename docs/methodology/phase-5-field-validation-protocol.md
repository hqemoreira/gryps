# Phase 5 — Field validation protocol

**Document version:** `gryps-field-validation-protocol-v0`  
**Status:** Research methodology (not operational validation)  
**Sprint:** P5-S3  
**Worktree baseline:** `development/phase-4-evidence-integrity` @ `dc73abc`  
**Builds on:** P5-S1 feasibility; P5-S2 Nordic Lapland Public Evidence Research Envelope  
**Recorded:** 2026-11-26

## Non-validation statement

This protocol prepares how GRYPS *would* validate site-level satellite-connectivity infrastructure dependencies if authorised site, provider, and reviewer cooperation became available.

It does **not**:

- Conduct field validation or operational measurement
- Assert that a real dual-path installation exists in Finnish Lapland
- Contact organisations or send evidence requests
- Change Model v0.4 scoring, close D-01–D-13, or produce a Resilience Signature from validation outcomes
- Treat provider names, orbit classes, or catalogue-based orbit mix as proof of end-to-end independence

Absence of evidence is not evidence of absence. Missing evidence is not evidence of independence.

---

## 1. Purpose and scope

**Purpose.** Move, claim-by-claim, from publicly documented architecture and facility existence (P5-S2 Level 1 material) toward independently reviewable site-level relationships — without inventing paths, scores, or participants.

**In scope.** Methodology for industrial satellite-connectivity dependency claims: constellation, gateway / SNP / teleport, PoP, backhaul, ops/control, site terminal, site power, environmental/physical constraints.

**Out of scope.** Production ingestion, Neon schema, UI routes, automated ranking engines, commercial contracting, or universal performance pass/fail thresholds.

**Audience.** Independent technical reviewers, future research partners, and GRYPS maintainers who need a reproducible validation procedure.

---

## 2. Evidence maturity levels

Levels describe *how a specific claim is supported*, not a universal quality score for a site or provider. A single assessment may mix levels across relationships.

| Level | Name | Meaning | Typical sources | Not sufficient alone for |
| --- | --- | --- | --- | --- |
| **L1** | Publicly documented | Claim appears in a public primary or clearly cited secondary source, with retrieval date and scope | Operator pages, regulatory filings, published facility lists, peer-reviewed / workshop papers | Site-serving path; end-to-end independence |
| **L2** | Independently corroborated | Same claim supported by sources that are independent of each other under §5, with independence assessed explicitly | L1 + independent regulator / academic / measurement study | Site-serving path without site/provider confirmation |
| **L3** | Provider-confirmed | Written technical confirmation from the relevant operator or infrastructure owner, scoped and dated | Letters, signed questionnaires, ticketed engineering responses | Independent verification; may still be incomplete or self-interested |
| **L4** | Site-confirmed | Site-specific service, terminal, and infrastructure arrangements evidenced by the site (or its authorised agent), with identity/scope protections as needed | Bills of materials, configs, contracts excerpts, photos with consent, outage logs | Population-level performance claims |
| **L5** | Operationally measured | Observations from actual site operations with method, instrumentation, period, and conditions recorded | Availability logs, latency/jitter/loss/throughput series, failover drills, correlated outages | Proof of full infrastructure independence by themselves |

### 2.1 Additional status flags (orthogonal to level)

Levels alone are insufficient. Attach one or more flags to every claim record:

| Flag | Meaning |
| --- | --- |
| `contradicted` | Two or more retained assertions conflict within stated scopes; human adjudication required |
| `outdated` | Publication or confirmation date is outside the claim’s accepted validity window, or a later valid source qualifies it |
| `restricted` | Evidence exists but cannot be published or can only be summarised under confidentiality |
| `unavailable` | Reasonable request made (or known channel exhausted); evidence not obtainable |
| `not_investigated` | Claim listed but no collection attempted yet |
| `synthetic` | Test / fixture material only — never promote to L1–L5 site claims |

**Rule.** Do not collapse flags into a single numeric “confidence score.” Do not apply newer-source-always-wins. Prefer retaining both assertions and recording adjudication (§5).

### 2.2 Mapping to P5-S2 pack statuses

| P5-S2 / fixture confidence | Typical maturity |
| --- | --- |
| `documented` with primary public source | L1 |
| `documented` with secondary-only compilation | L1 (secondary) — escalate to L2 only after independent corroboration |
| Provider written confirmation (future) | L3 |
| Site BOM / config (future) | L4 |
| Site measurement campaign (future) | L5 |
| `unknown` / empty evidence | No level — outcome `not_investigated` or `evidence unavailable` |

---

## 3. Site-validation protocol

Execute sections A→E in order for a candidate industrial context. Stop and mark remaining claims `not_investigated` or `unavailable` rather than inventing answers.

### A. Site context

Record:

1. Industrial vertical and operating environment (e.g. forestry, mining, maritime-adjacent logistics)
2. Geographic location at a precision appropriate to research and confidentiality (region / municipality / coordinates — choose the coarsest usable level)
3. Environmental and operational constraints (latitude, seasonality, power reliability, access windows)
4. Critical services and connectivity requirements (control traffic vs bulk data; autonomy expectations)
5. Public identifiability: `public` | `pseudonymous` | `confidential` — and the justification

**Must not.** Invent a named site, invent coordinates for a fictional plant, or imply participation without a recorded consent basis.

### B. Connectivity services

For each service under study, investigate separately:

| Field | Notes |
| --- | --- |
| Service provider brand | Catalogue / commercial name |
| Underlying network operator | May differ from reseller / MVNO |
| Service type and technology | Broadband / narrowband; LEO / MEO / GEO; bent-pipe vs ISL class (architecture claim) |
| Terminal model and configuration | Only if disclosed; store as restricted if needed |
| Activation and validity dates | Distinguish installed, contracted, and actually used |
| Primary vs secondary designation | Site’s intended role — not inferred from brand prestige |
| Actual usage | Traffic / ops use vs shelf spare |

**Must not.** Assume two services are independent because provider names or satellite architectures differ.

### C. Infrastructure dependencies

Investigate **each layer separately**. Reuse P5-S2 entity distinctions:

| Layer | Entity classes (examples) | Independence question |
| --- | --- | --- |
| Space | Constellation | Shared spacecraft / constellation failure domain? |
| Ground | Gateway, ground station, SNP, teleport | Shared landing / ground facility? |
| Network | Terrestrial backhaul, PoP, IX | Shared fibre / metro / PoP? |
| Operations | NOC, control plane, wholesale chain | Shared ops or provisioning? |
| Site | Terminal, outdoor unit, site network | Shared radio path / single ODU? |
| Power | Mains, UPS, generator | Shared power domain? |
| Environment / physical | Mount, weather, obstruction, access | Shared physical exposure? |

For each potential relationship (`uses`, `connects_through`, `shares_infrastructure_with`, `separated_from`, `depends_on`, `controlled_by`):

- Require an explicit claim id, entity ids, direction, geographic scope, technical scope, and evidence maturity level
- Default to **UNKNOWN** until evidence supports a scoped outcome (§7)
- Never derive `separated_from` solely from catalogue-based orbit mix or provider diversity

### D. Evidence collection record

Minimum fields per claim (align with P5-S2 evidence extensions):

| Field | Required |
| --- | --- |
| `claimId` | Yes |
| `entityIds` / `relationshipId` | Yes |
| `claimStatement` | Yes — precise, scoped |
| `sourceOrRespondent` | Yes |
| `exactReference` | Yes — URL, filing, document id, or internal restricted handle |
| `relevantPassageOrAnswer` | Yes — short extract or paraphrase with permission |
| `acquisitionDate` | Yes |
| `publicationDate` | If applicable |
| `validityPeriod` | If known (`validFrom` / `validTo`) |
| `geographicScope` | Yes |
| `technicalScope` | Yes |
| `verificationMethod` | Yes — e.g. public retrieval, dual-source check, provider questionnaire, site walkdown, measurement |
| `maturityLevel` | L1–L5 or none |
| `statusFlags` | As applicable |
| `accessClass` | `public` \| `restricted` \| `synthetic` |
| `restrictionsConfidentiality` | Yes if not fully public |
| `contradictoryOrMissing` | Yes — pointer or “none observed” |
| `reviewerAdjudication` | If human review occurred |

Retain withdrawn or superseded records; link with `qualifies` / `qualifiedBy` rather than deleting history (Phase 4 contradiction principles).

### E. Operational measurements

Measurements support **L5** observations about behaviour under stated conditions. They do **not** by themselves prove that two paths share no infrastructure.

#### E.1 Useful measurement classes (no universal thresholds)

| Class | Examples of what to record | Typical use |
| --- | --- | --- |
| Availability / outages | Start/end, suspected cause, affected service id | Correlate dual-path behaviour |
| Latency / jitter | Method (ICMP/TCP/app), peer, sampling | Characterise path behaviour — not independence |
| Packet loss | Same as above | Same |
| Throughput | Direction, concurrent load, time of day | Capacity under test conditions |
| Failover / recovery | Trigger, detection time, recovery time, which path carried traffic | Tests intended secondary behaviour |
| Shared outage events | Simultaneous impairment across services | *Hypothesis* of shared dependency — needs infrastructure evidence to confirm |
| Power interruptions | UPS logs, generator starts, terminal reboot | Site power domain coupling |
| Environmental disruption | Weather, obstruction, physical damage | Physical co-exposure |

#### E.2 Before interpreting measurements

Record and disclose:

1. **Duration** — campaign length and duty cycle (spot check vs multi-week)
2. **Context** — season, latitude, concurrent site operations, maintenance windows
3. **Instrumentation** — tools, placement (LAN-side vs WAN-side), clock sync
4. **Limitations** — NAT, QoS, terminal CPU, Wi‑Fi hops, probe destination bias
5. **Hypothesis under test** — e.g. “during known SNP maintenance, Service B degrades” — not “prove independence”

**Must not.** Convert a clean measurement week into an independence certificate. Correlated outages are leads for L3/L4 investigation, not automatic `shares_infrastructure_with`.

---

## 4. Independent corroboration and contradiction handling

### 4.1 What counts as an independent source

Two sources are **independent** for a claim when:

- They do not share the same corporate authoring chain for that claim, **and**
- One is not merely a republication / mirror / press rewrite of the other, **and**
- Their data generation processes differ (e.g. regulator filing vs academic measurement vs site BOM)

### 4.2 Ownership and common origin

| Situation | Independence treatment |
| --- | --- |
| Operator page + operator IR press | **Not** independent of each other for architecture claims — both primary-operator |
| Operator + national regulator filing | Independent channels; still may share operator-supplied facts |
| Academic compilation of regulator + AWS data | Secondary; not independent of its cited primaries |
| PeeringDB self-publish + operator marketing | Related voluntary disclosures — treat as weakly independent; prefer regulator/measurement for L2 |
| Subsidiary and parent statements | Treat as **common origin** unless distinct technical artefacts are shown |

### 4.3 Primary vs secondary

| Class | Definition |
| --- | --- |
| Primary | Originating publisher of the fact (operator, regulator, site, measurement team’s raw method) |
| Secondary | Compilation, commentary, or restatement of others’ facts |

Secondary sources may support L1 documentation. L2 requires independence assessment, not volume of secondary cites.

### 4.4 Contradictory claims

1. Preserve both assertions with dates, scopes, and sources  
2. Mark relationship confidence / flag `contradicted`  
3. Do **not** auto-supersede by publication date  
4. Human adjudication record must state: claims compared, scopes compared, decision (`supported` / `contradicted` / `partially supported` / `unresolved`), rationale, adjudicator id, date  
5. Later valid evidence may **qualify** earlier evidence without deleting it

### 4.5 Authority and competence

Assess qualitatively (prose, not a score):

- Mandate (regulator vs marketer vs academic)
- Access to ground truth (licence file, NOC, site electrician)
- Technical specificity of the statement
- Conflict of interest

### 4.6 Dates and validity

- Always store publication date and retrieval/acquisition date  
- Prefer explicit validity windows from the source  
- Historical facility lists (e.g. 2019 ground stations) remain historical until refreshed — flag `outdated` when used beyond their defensible window for “current inventory” claims

---

## 5. Validation outcomes (per relationship)

| Outcome | Meaning |
| --- | --- |
| `supported_within_scope` | Evidence at stated maturity supports the claim inside geographic/technical/temporal scope |
| `contradicted` | Retained conflicting evidence; claim not established |
| `partially_supported` | Some facets supported; others unknown or weaker |
| `superseded` | Later valid evidence qualifies or replaces the claim’s standing — prior record retained |
| `unresolved` | Investigated; evidence insufficient or conflicting without adjudication |
| `not_investigated` | Listed; no collection yet |
| `evidence_unavailable` | Attempted or known-blocked; cannot obtain |

**Distinction.** `not_investigated` / `evidence_unavailable` ≠ `supported` of independence or of sharing. Evidence of absence requires an affirmative, scoped negative finding (e.g. provider confirms Service A never lands at Facility X during period T) at L3+ with clear limitations.

**Scoring boundary.** Outcomes must not be mapped to Signature points, grades, probabilities, or Model v0.5 arithmetic in this protocol.

---

## 6. Roles, ethics, and confidentiality

| Role | Responsibility |
| --- | --- |
| Research lead | Protocol adherence; no invented participants |
| Evidence curator | Records, provenance, access class |
| Independent technical reviewer | Template D review; no commercial sales role |
| Site / provider respondents | Voluntary disclosure only |

- Prefer anonymised or regional publication when site identity is sensitive  
- Do not scrape or attempt access to Traficom earth-station registers beyond published materials  
- Restricted evidence stays out of public packs unless redacted and licensed for reuse  
- GDPR / Finnish data protection: personal data in contacts and logs minimised; retain only what the research purpose requires

---

## 7. Relation to GRYPS artefacts

| Artefact | Role under this protocol |
| --- | --- |
| Fixtures A–E | Synthetic / architecture demos — not site validation |
| P5-S2 Lapland pack | L1 starting inventory for the pilot plan |
| Dependency Research Lab | Research UI only — no Signature from validation outcomes |
| Model v0.4 | Unchanged; not fed by field outcomes in this phase |

---

## 8. Limitations

- Protocol is untested in the field (by design for P5-S3)  
- Does not guarantee provider or site cooperation  
- Does not enumerate every possible shared dependency  
- Does not certify safety-of-life or regulatory compliance  
- Nordic Lapland remains a **research envelope**, not a validated dual-path case

---

## 9. Versioning

| Version | Date | Notes |
| --- | --- | --- |
| v0 | 2026-11-26 | Initial P5-S3 methodology |

Next methodology revision only after pilot feedback or reviewer adjudication experience — not after speculative software work.

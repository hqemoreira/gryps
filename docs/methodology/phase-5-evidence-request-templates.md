# Phase 5 — Evidence request templates

**Document version:** `gryps-evidence-request-templates-v0`  
**Status:** Research methodology — templates only  
**Sprint:** P5-S3  
**Companion:** `phase-5-field-validation-protocol.md`  
**Recorded:** 2026-11-26

## Non-contact statement

These templates are **not sent** in P5-S3. No organisation is contacted. No GRYPS material is shared externally by virtue of this document.

Requests are written to be **neutral**: they invite voluntary disclosure, acknowledge confidentiality limits, and do not presume answers that establish independence or shared infrastructure.

Tone: Research · Prototype · Experimental · Assessment · Methodology · Evidence.

---

## How to use

1. Copy the relevant template into a dated request record (restricted store if needed).  
2. Fill bracketed fields `[like this]`.  
3. Attach a claim table limited to questions the respondent can reasonably answer.  
4. Record send/withhold decision separately — default for this sprint: **withheld**.  
5. Map any future reply into the protocol’s evidence collection fields (maturity L3 for provider/infra owner written replies; L4 for site; reviewer notes as adjudication, not L5).

---

## Common header (all templates)

```text
Subject: Research evidence request — satellite connectivity infrastructure dependencies (non-commercial)

From: [Research lead name / affiliation]
Date: [YYYY-MM-DD]
Reference: [GRYPS-P5-REQ-####]
Protocol: gryps-field-validation-protocol-v0

Context (one paragraph):
GRYPS is a non-commercial research prototype studying how publicly documented and
site-specific evidence can describe infrastructure dependencies for satellite
connectivity. This request is for research methodology development. It is not a
procurement, sales, certification, or resilience-scoring engagement.

Voluntary disclosure:
You may decline any question. Please mark answers as public, restricted, or
not disclosable. We will not publish restricted material without a separate
written permission that states the allowed scope.

Claim identifiers under discussion:
[List claimId / relationshipId / short statement — or “see attached table”]

Requested response format:
- Short written answers keyed to question numbers
- Document references (title, date, version) rather than full confidential dumps
- Explicit “unknown” or “not disclosable” where applicable
- Confirmation date and name/role of the respondent
```

---

## Template A — Satellite provider

**Intended respondent:** Satellite network operator or branded connectivity provider for a named service under study.  
**Typical maturity if answered in writing:** L3 (provider-confirmed), subject to scope and limitations stated by the respondent.

### Body

```text
[Common header]

We are studying infrastructure dependency claims for research purposes. We do not
assume that distinct service brands imply independent end-to-end paths.

Please answer only what you can confirm for the stated scope.

Scope proposed by requester (edit freely / correct us):
- Service / product name: [e.g. brand + SKU]
- Geographic scope of interest: [e.g. Finnish Lapland region — not a demand for
  a specific customer account unless you agree]
- Time scope: [e.g. as of YYYY-MM or period YYYY-MM → YYYY-MM]
- Customer / account: [none named / anonymised site id / not applicable]

Questions

A1. Architecture class
For the service above, what space-segment architecture class applies in the
stated scope (e.g. optical ISL mesh, bent-pipe without ISL, hybrid)? Please cite
a public document if possible, or state if confirmation is internal-only.

A2. Ground landing roles
Which of the following roles are used for user traffic in the stated scope, and
how do you distinguish them in your terminology: gateway, ground station,
satellite network portal (SNP), teleport, other?

A3. Routing scope
Can you confirm whether customer traffic for the stated geographic scope is
constrained to a known set of landing facilities? If yes, what is the precision
of that set (named facilities, region, or “not disclosable”)?

A4. Shared infrastructure (neutral)
Without asserting a conclusion: are there known classes of shared terrestrial
infrastructure (for example common PoPs, backhaul providers, or teleports) that
commonly appear with this service in the stated region? If this cannot be
answered, please say so.

A5. Dual-service deployments
If a customer also uses [other provider/service under study], do you publish or
can you confirm any guidance about independence or common failure domains? If
none exists, please state that none is offered.

A6. Confirmation limitations
What should researchers not infer from your answers (validity period, account
specificity, change control)?

A7. Evidence reuse
May we cite a redacted summary of your answers in a public research note?
(yes / no / yes with conditions: […])

Thank you. No response is required if you prefer not to participate.
```

### Claim-table columns (attach)

`claimId | relationshipId | claimStatement | why we ask you | public source already on file (if any)`

---

## Template B — Infrastructure operator

**Intended respondent:** Owner or operator of a ground facility, teleport, SNP host, fibre landing, or data-centre PoP facility.  
**Typical maturity if answered in writing:** L3 for facility role/ownership facts within their mandate.

### Body

```text
[Common header]

We distinguish facility existence from customer-serving paths. A published
facility name does not, by itself, prove that a given industrial terminal uses
that facility.

Facility under discussion (correct if wrong):
- Name / designation: [e.g. place + role]
- Country / region: […]
- Role as we currently label it: [gateway | ground station | SNP | teleport |
  PoP | other | unknown]
- Sources we already hold (public): [URLs / filings — short list]

Questions

B1. Role confirmation
What is the accurate technical role of this facility for satellite connectivity
services (your terminology)? Which labels are incorrect?

B2. Ownership vs operation
Who owns the facility assets? Who operates day-to-day RF / network functions?
Are these the same organisation?

B3. Services hosted
Which satellite network operators or service brands are you willing to confirm
as using this facility for (a) user traffic landing, (b) TT&C only,
(c) monitoring / other? Mark not disclosable where required.

B4. Upstream / backhaul
What terrestrial upstream classes apply (fibre owners, diverse routes, IX/PoP
hand-off)? Name them only if disclosable; otherwise describe redundancy at a
qualitative level you can stand behind.

B5. Redundancy
What facility-level redundancy exists (power, antennas, backhaul diversity)?
What failure modes remain single-threaded?

B6. Evidence dates
As-of date for these answers: [YYYY-MM-DD]. Planned changes that would invalidate
them: [none known / describe].

B7. Independence caution
Please state any wording you require us to use so that facility confirmation is
not misread as proof of a specific customer path.

B8. Evidence reuse
May we cite a redacted summary publicly? (yes / no / conditions)
```

---

## Template C — Industrial site

**Intended respondent:** Site owner, OT/IT lead, or authorised integrator for an industrial location in the research envelope.  
**Typical maturity if answered:** L4 (site-confirmed), with optional path to L5 if measurement permission is granted later.

### Body

```text
[Common header]

This request concerns site-level connectivity arrangements. The research envelope
is geographic / industrial-context based. Participating is voluntary. The site
may remain confidential in public materials.

Proposed public identification level:
[ ] Region only (e.g. Finnish Lapland)
[ ] Sector + region
[ ] Named organisation
[ ] Other: […]

Questions

C1. Services installed
Which satellite connectivity services are installed at the site? For each:
provider/brand, underlying operator if known, activation date, contract end or
review date, and whether the service is primary, secondary, spare, or unused.

C2. Terminals
Terminal make/model, outdoor unit count, mount locations (description, not
necessarily coordinates), and whether terminals share a single physical path or
structure.

C3. Configuration
Any known settings relevant to routing or failover (as you are willing to
disclose). Mark restricted items clearly.

C4. Power
Power source for each terminal path (mains circuit ids if sharable, UPS,
generator). Do two satellite paths share a single UPS or breaker?

C5. Outage and incident records
What outage or incident records exist for the last [N] months? Which services
were affected together? (Dates and short descriptions; redact customer data.)

C6. Failover arrangements
Is failover automatic, manual, or not implemented? Has it been exercised? When?

C7. Measurement permission
Would the site allow a time-bounded, non-intrusive measurement campaign under a
separate written plan (latency/loss/throughput/failover observation)? 
(yes / no / discuss)

C8. Anonymised publication
May anonymised evidence be used in public research documentation?
(yes / no / conditions)

C9. Unknowns
Which of the above can you not answer, and why (unknown vs confidential)?
```

---

## Template D — Independent technical reviewer

**Intended respondent:** External or arms-length reviewer with relevant RF / network / OT competence.  
**Output:** Adjudication and critique — not an L3–L5 fact source unless the reviewer also supplies primary evidence.

### Body

```text
[Common header]

Please review the attached claim pack. We ask for critical assessment, not
endorsement.

Materials provided:
- Claim table with maturity levels and sources
- [P5-S2 pack excerpt / redacted site pack]
- Known contradictions and gaps list

Review questions

D1. Claim clarity
Which claims are underspecified (missing scope, entity conflation, or ambiguous
verbs such as “uses”)?

D2. Source quality
For each major claim: is the source primary or secondary? Are independence
assumptions between sources justified?

D3. Gaps
Which high-value relationships remain UNKNOWN, and what evidence class would be
required to change that (L2–L5)?

D4. Alternative explanations
What alternative infrastructure explanations remain plausible given the same
evidence?

D5. Over-claim risk
Which conclusions does the evidence *not* support, especially regarding
end-to-end independence, dual-path resilience, or performance?

D6. Contradictions
If contradictions exist, what adjudication would you recommend, and why should
neither claim be deleted?

D7. Next measurement or request
Which single next evidence request or measurement would most reduce uncertainty?

Please return:
- Written answers D1–D7
- Optional markup on the claim table (supported_within_scope / contradicted /
  partially_supported / unresolved / not_investigated / evidence_unavailable)
- Reviewer name/role, date, conflicts of interest disclosure
```

---

## Response logging checklist (future use)

When a reply is received (post-P5-S3, only if authorised):

1. Store raw reply as `restricted` unless explicitly public  
2. Extract claim-keyed answers into evidence records  
3. Set maturity L3/L4 as appropriate; do not auto-upgrade to L5  
4. Run contradiction check against P5-S2 / prior records  
5. Independent reviewer (Template D) before any public “supported” elevation of site-serving paths  
6. Still do **not** feed Model v0.4 Signature arithmetic

---

## Limitations

- Templates cannot compel disclosure  
- Provider marketing language may be incomplete or optimistic — treat as L3 with conflict-of-interest noted  
- Translators / legal review may be required for Finnish / Norwegian / EU contexts  
- No requests are issued in this sprint

## Versioning

| Version | Date | Notes |
| --- | --- | --- |
| v0 | 2026-11-26 | Initial P5-S3 templates |

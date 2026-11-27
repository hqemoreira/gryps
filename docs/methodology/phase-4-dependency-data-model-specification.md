# Phase 4 — Dependency data model specification

Sprint 8 research specification on `development/phase-4-evidence-integrity` at HEAD `dc73abc5e644bbe117e79b8b57733bf5e9f432b4`. Conceptual only. No production schemas, migrations, APIs, Neon writes, or Model v0.4 scoring changes.

Companion: Sprint 7 analysis in `phase-4-provider-dependencies-and-shared-failure-modes.md`. UI terminology corrections are tracked in `phase-4-resilience-terminology-audit.md`.

Claim labels used below:

- **Verified (code).** Observed in this repository.
- **Documented (public).** Cited public architecture with retrieval date where used.
- **Hypothesis.** Plausible; not site-proven.
- **Unknown.** No GRYPS data; not asserted.

## 1. Purpose and design principles

**Purpose.** Define how GRYPS *could* represent infrastructure dependencies and uncertainty so that future methodology can ask whether two connectivity providers are independent — without treating brand or orbit diversity as proof.

**Design principles**

1. **Difference ≠ separation ≠ continuity.** Distinct catalogue ids, distinct orbits, and survival through a named failure are three different claims (Sprint 7 §7). The model must not collapse them.
2. **UNKNOWN is first-class.** Absence of an edge is not evidence of independence. UNKNOWN must not map to numerical zero or to a resilience bonus.
3. **Evidence before edges.** Every dependency relationship is either linked to evidence or explicitly marked as an assumption / inference.
4. **Temporal honesty.** New evidence appends; it does not silently overwrite prior claims. Conflicting evidence coexists with status.
5. **Non-scoring in this sprint.** Confidence classes are research classifications, not Signature multipliers. Model v0.4 arithmetic stays frozen.
6. **No invented infrastructure.** Illustrative examples may name Starlink, OneWeb, or Iridium only for catalogue-known facts; unsupported ground/backhaul links remain UNKNOWN.

## 2. Existing catalogue limitations

**Verified (code)** against `lib/deterministic-score.ts` (`ADVISOR_PROVIDERS`), `lib/providers.ts` (`INDEXED_PROVIDERS`), `lib/evidence-model.ts`, `lib/model-constants.ts`.

| Concept | Scoring catalogue | Display index | Used by Signature |
| --- | --- | --- | --- |
| Provider id / name | yes | name | yes |
| Operator string | no | yes | no |
| Orbit (LEO/MEO/GEO) | yes (LEO/GEO only in Advisor) | yes | yes (`hasOrbitMix`, GEO demerit) |
| Class (broadband/narrowband) | yes | yes (+ broadcast) | yes (LEO mix only) |
| Catalog confidence integer | yes | no | yes → remapped 0–25 component |
| Coverage note / status | no | yes | no |
| Constellation / ISL / bent-pipe | no | no | no |
| Gateway / teleport / PoP | no | no | no |
| Backhaul / IX / transit | no | no | no |
| NOC / ops / cyber domain | no | no | no |
| Site terminal / power | no | no | no |
| Failure-domain tags | no | no | no |
| Evidence refs per field | no | no | no |

v0.4 redundancy therefore encodes **distinct catalog ids** plus a **catalogue-based orbit/class mix boolean**. It does not encode end-to-end path independence (D-01 / D-06 remain OPEN).

## 3. Entity model

Not every concept needs its own table. Prefer distinct entities when they participate in many-to-many relationships or carry independent evidence; otherwise use attributes or typed references.

| Proposed entity | Distinct record? | Rationale |
| --- | --- | --- |
| **ServiceProvider** | Yes | Commercial / catalogue offer identity (`starlink`, `oneweb`, …). What GRYPS selects today. |
| **SatelliteConstellation** | Yes | Fleet identity (may outlive a product brand). Multiple ServiceProviders could eventually map to one constellation (resale) or one provider to multiple fleets. |
| **SpaceSegmentProfile** | Attribute / 1:1 on constellation | Orbit architecture, ISL vs bent-pipe, payload class — traits, not separate graph nodes unless evidence differs by plane. |
| **GroundFacility** | Yes (when known) | Gateway, teleport, or ground station with location scope. Only instantiate when evidence exists; do not invent coordinates. |
| **Teleport** | Subtype of GroundFacility | Same entity with `facilityKind: teleport \| gateway \| ges \| other`. Avoid duplicate types. |
| **TerrestrialBackhaul** | Yes (when known) | Fibre / microwave / transit path segment between landing and destination. |
| **NetworkOperator** | Yes (when known) | Entity that operates space, ground, or terrestrial segments; ownership edges link here. |
| **NetworkControlInfrastructure** | Optional entity or attribute | NOC / OSS / identity systems. Separate entity only when shared across providers; otherwise attribute on NetworkOperator. |
| **SiteTerminal** | Yes (site-scoped) | Physical outdoor unit / modem at the assessed site. |
| **SitePowerInfrastructure** | Yes (site-scoped) | UPS, genset, feed domains that power terminals. |
| **SiteNetworkEquipment** | Optional | Local LAN / failover box — only if assessments need to model shared L2/L3 choke points. |
| **FailureDomain** | Yes (catalogued taxonomy) | Named failure classes (constellation, gateway, backhaul, power, …). Not a physical asset. |
| **AssessmentSite** | Existing concept | Latitude/sector/profile already exist; dependency graph hangs off a site assessment, not a global rewrite of Signature inputs. |

**Minimum viable entity set for a research prototype:** ServiceProvider, SatelliteConstellation, GroundFacility, TerrestrialBackhaul, SiteTerminal, SitePowerInfrastructure, FailureDomain, plus Evidence and Relationship records (§4–5). NetworkOperator and NetworkControl can start as attributes until evidence warrants nodes.

## 4. Relationship model

Relationships are directed edges. Inference must be labelled separately from direct evidence.

| Type | Direction | Meaning |
| --- | --- | --- |
| `operates` | Operator → asset | Day-to-day operation of constellation, facility, or network. |
| `owns` | Owner → asset | Legal / corporate ownership (may differ from operates). |
| `offers` | ServiceProvider → Constellation (or Service) | What the catalogue id sells access to. |
| `uses` | ServiceProvider / SiteTerminal → asset | Runtime use without ownership (e.g. terminal uses constellation). |
| `connects_through` | Space/ground asset → GroundFacility / Backhaul | Traffic landing or transport hop. |
| `depends_on` | Subject → dependency | Hard operational dependency (bent-pipe user link depends_on visible gateway). |
| `shares_infrastructure_with` | Asset ↔ Asset | Explicit shared facility, fibre, campus, or control plane. |
| `located_at` | Asset → geographic scope | Site, region, or facility campus (precision varies). |
| `controlled_by` | Asset → NetworkControl / Operator | Provisioning, auth, config authority. |
| `exposed_to` | Asset / ServiceProvider → FailureDomain | Declared exposure class (often inferred until evidenced). |
| `separated_from` | Asset ↔ Asset (scoped) | Positive claim that a *named* dependency is not shared. Requires evidence. |

**Direct vs inferred**

- **Direct:** Edge cites primary or operator attestation for the assessment scope.
- **Inferred:** Edge derived from architecture class or corporate ownership heuristics; must set confidence `inferred` and never auto-promote to verified.
- **Assumed:** Explicit modelling assumption for research scenarios; not evidence.

Do not emit `separated_from` from orbit-label mismatch alone.

## 5. Evidence model

Evidence is a separate record. Relationships and claims *reference* evidence; they do not embed opaque URLs only.

| Field | Purpose |
| --- | --- |
| `id` | Stable evidence identifier |
| `title` | Short source title |
| `urlOrReference` | URL, DOI, internal doc id, or “operator attestation” |
| `publisher` | Publisher / authoring org |
| `publicationDate` | When the source was published (if known) |
| `retrievalDate` | When GRYPS retrieved or recorded it |
| `evidenceType` | e.g. `primary_operator`, `regulatory`, `peer_reviewed`, `technical_report`, `catalogue_note`, `site_survey`, `attestation`, **`synthetic_test`** |
| `isSynthetic` | **Required boolean.** `true` only for structural test evidence; never cite as real-world proof |
| `claim` | The specific claim the source supports |
| `scope` | Geographic / service / account scope |
| `validFrom` / `validTo` | Temporal validity when known |
| `limitations` | What the source does *not* prove |
| `verificationStatus` | `unverified` \| `spot_checked` \| `operator_confirmed` \| `withdrawn` |

**Do not fabricate real-world evidence records.** Empty evidence sets are valid; they force UNKNOWN on dependent edges. Synthetic fixtures must set `isSynthetic: true` and `evidenceType: synthetic_test` on every evidence row.

## 6. Confidence and uncertainty model

These statuses apply to **relationships and claims**, not to the 0–100 Signature.

| Status | Meaning | Evidence required | Insufficient | May support a resilience claim? |
| --- | --- | --- | --- | --- |
| **verified** | Coupling or separation confirmed for the assessment scope | Primary source or operator/site attestation with retrieval date | Brand rumour; orbit co-label alone | Yes — for that named dependency only |
| **documented** | Public architecture supports the claim as a *class* | Cited public source + explicit scope limits | Unsourced blog paraphrase | Architecture context only — not site proof |
| **inferred** | Reasonable hypothesis from architecture or ownership | Stated inference rule + falsification condition | Silent score assumption | No numerical independence claim |
| **unknown** | No usable evidence | Honest gap | Filling with orbit mix or provider count | No — communicate UNKNOWN |
| **contradicted** | Credible sources conflict | Both sources retained; claim marked contradicted | Deleting the older source | No — surface conflict |

**UNKNOWN is not zero and not independence.** It blocks “demonstrated separation” claims.

Communicate uncertainty in prose and structured fields (`confidence`, `limitations`), never by inventing a fake independence score.

### Contradiction-handling principles (Sprint 12)

When two or more evidence records conflict about the same named relationship, reviewers must **not** auto-resolve by recency alone. Assess, in order:

1. **Claim specificity** — Do both sources address the same dependency, layer, and providers, or only adjacent topics?
2. **Source authority and competence** — Operator attestation, primary technical documentation, secondary literature, or synthetic/test material? Competence for *this* claim matters more than brand prestige.
3. **Evidence method and provenance** — Measurement, architecture class statement, catalogue note, or modelling assumption? Record retrieval date and limitations.
4. **Scope** — Geographic, technical, organisational, and account scope. A later claim with narrower scope may *qualify* an earlier wider claim without falsifying it for the earlier period.
5. **Publication date versus validity period** — A 2026 publication may describe 2024 conditions, or vice versa. Prefer `validFrom` / `validTo` over the calendar of discovery.
6. **Relation to prior evidence** — Explicitly choose one of: `supersedes` (replaces for overlapping scope after a stated date), `qualifies` (narrows or conditions), `contradicts` (irreconcilable for overlapping scope), or **leave unresolved**.
7. **Human adjudication** — Record the decision, decision date, adjudicator role, and rationale. Keep earlier evidence rows; never silently overwrite.

**Forbidden automations (Phase 4):** ranked trust scores that pick a winner; “newer always wins”; numerical confidence that collapses contradiction into a single float.

Fixture E demonstrates unresolved contradiction with temporal qualify links and preserved earlier evidence.

## 7. Provenance and temporal validity

Every dependency relationship must carry:

- `evidenceIds[]` (may be empty only if `confidence === unknown` or `assertionKind === assumption`)
- `assertionKind`: `shared_dependency` \| `separation` \| `architecture_class` \| `assumption`
- `confidence` (verified / documented / inferred / unknown / contradicted)
- `scope` (global constellation class / regional / site / account)
- `recordedAt`, optional `validFrom` / `validTo`
- `supersedes` / `supersededBy` optional links for explicit revision

**Distinctions the model must keep**

| Situation | Representation |
| --- | --- |
| Verified shared dependency | Edge `shares_infrastructure_with` or `depends_on`, confidence `verified` |
| Documented shared dependency | Same edge types, confidence `documented`, limitations note “architecture class, not site-verified” |
| Inferred possible dependency | Edge with confidence `inferred` |
| Demonstrated separation | Edge `separated_from` scoped to a named dependency + failure domain, confidence `verified` or strong `documented` |
| Unknown relationship | **Required explicit `unknownRelationships[]` record** for each named layer under investigation (not mere absence of edges) |

**Conflicting or outdated evidence.** Append new Evidence records. Mark the claim `contradicted` or set `validTo` on the older claim. Never silently replace prior evidence rows.

### Sprint 9 additions (fixture-validated)

Fixtures in `docs/methodology/fixtures/provider-dependency-fixtures/` showed that the Sprint 8 sketch was insufficient without:

1. **`catalogueClassification` snapshot** — records `providerDiversity`, `catalogueBasedOrbitMix`, orbits, and service classes *separately* from infrastructure edges. Prevents conflating Catalogue confidence, provider diversity, and catalogue-based orbit mix.
2. **`unknownRelationships[]`** — first-class UNKNOWN edges with `mustNotInfer` text. Absence of a positive edge alone was too easy to misread as independence.
3. **`direction` on every relationship** — fixtures require explicit `from→to` (or documented bidirectional meaning for `shares_infrastructure_with`).
4. **Fixture metadata** — `researchConclusion`, `claimsNotToMake`, `isOperationalAssessment: false`, `containsScoreOrProbability: false`.
5. **`isSynthetic` on evidence** — Fixture C cannot be mistaken for real operators.

Relationship types from Sprint 8 were sufficient for Fixtures A–C (`offers`, `connects_through`, `shares_infrastructure_with`, `exposed_to`). No new relation verb was required. Entity kinds were sufficient; GroundFacility was only instantiated when evidence (synthetic) existed.

## 8. TypeScript interface proposal

Illustrative research types only. **Not** application production interfaces. Do not import into scoring.

```ts
/** Research proposal — not wired into Model v0.4 */

type ConfidenceStatus =
  | "verified"
  | "documented"
  | "inferred"
  | "unknown"
  | "contradicted";

type AssertionKind =
  | "shared_dependency"
  | "separation"
  | "architecture_class"
  | "assumption";

type RelationType =
  | "operates"
  | "owns"
  | "offers"
  | "uses"
  | "connects_through"
  | "depends_on"
  | "shares_infrastructure_with"
  | "located_at"
  | "controlled_by"
  | "exposed_to"
  | "separated_from";

type EntityKind =
  | "service_provider"
  | "constellation"
  | "ground_facility"
  | "terrestrial_backhaul"
  | "network_operator"
  | "network_control"
  | "site_terminal"
  | "site_power"
  | "site_network"
  | "failure_domain"
  | "assessment_site";

interface GeographicScope {
  label: string; // e.g. "Nordic", "site", "global constellation class"
  precision: "point" | "region" | "global" | "unspecified";
  // coordinates only when evidenced — never invented
}

interface EvidenceRecord {
  id: string;
  title: string;
  urlOrReference: string;
  publisher?: string;
  publicationDate?: string; // ISO date
  retrievalDate: string; // ISO date
  evidenceType: string; // include "synthetic_test" for fixtures only
  isSynthetic: boolean;
  claim: string;
  scope: GeographicScope;
  validFrom?: string;
  validTo?: string;
  limitations: string;
  verificationStatus:
    | "unverified"
    | "spot_checked"
    | "operator_confirmed"
    | "withdrawn";
}

/** Catalogue labels only — never treat as infrastructure independence */
interface CatalogueClassificationSnapshot {
  providerIds: string[];
  providerDiversity: boolean;
  orbits: string[];
  serviceClasses: string[];
  catalogueBasedOrbitMix: boolean;
  note: string;
}

interface UnknownRelationship {
  id: string;
  between: [string, string] | string[];
  layer: "space" | "ground" | "network" | "operations" | "site";
  question: string;
  confidence: "unknown";
  evidenceIds: []; // must stay empty
  mustNotInfer: string;
}

interface DependencyEntity {
  id: string;
  kind: EntityKind;
  name: string;
  /** Free-form traits; prefer typed profiles when stable */
  attributes?: Record<string, string | boolean | number | null>;
}

interface DependencyRelationship {
  id: string;
  type: RelationType;
  fromId: string;
  toId: string;
  direction: string; // e.g. "from→to" — required in fixtures
  assertionKind: AssertionKind;
  confidence: ConfidenceStatus;
  scope: GeographicScope;
  evidenceIds: string[];
  limitations: string;
  recordedAt?: string;
  validFrom?: string;
  validTo?: string;
  supersedes?: string;
  supersededBy?: string;
  /** true when derived by a rule rather than direct citation */
  inferred: boolean;
}

interface FailureDomainRecord {
  id: string;
  name: string;
  layer:
    | "space"
    | "ground"
    | "network"
    | "operations"
    | "site";
  typicalImpact: "local" | "regional" | "wide" | "unknown";
}

interface IndependenceClaim {
  id: string;
  providerAId: string;
  providerBId: string;
  failureDomainId: string;
  /**
   * different | not_shared | continues_through — never treat as equivalent
   */
  claimType: "systems_different" | "dependency_not_shared" | "continues_through_failure";
  confidence: ConfidenceStatus;
  evidenceIds: string[];
  limitations: string;
}
```

## 9. Worked provider-combination examples

Catalogue facts below are **Verified (code)** from Advisor providers. Architecture-class notes reuse Sprint 7 public citations (retrieved 2026-11-26) as **Documented (public)** constellation-design context only.

### 9.1 Starlink + OneWeb — different constellations, end-to-end independence UNKNOWN

| Layer | Finding | Confidence |
| --- | --- | --- |
| Service providers | Distinct ids `starlink`, `oneweb` | verified (catalogue) |
| Constellations | Distinct operators (SpaceX vs Eutelsat OneWeb per index) | documented (catalogue) |
| Orbit / class | Both LEO broadband; v0.4 `hasOrbitMix` false | verified (code) |
| Space architecture class | Starlink optical ISL mesh vs OneWeb bent-pipe / gateway-dependent designs (public literature; Sprint 7 sources) | documented (public) — class only |
| Gateways serving a Nordic site | — | **unknown** |
| Shared teleport / campus | — | **unknown** |
| Terrestrial backhaul / PoP diversity | — | **unknown** |
| Site terminals / power domains | — | **unknown** (no fields in Signature) |
| End-to-end independence | Not claimable | **unknown** |

**IndependenceClaim example (illustrative):**

```text
claimType: systems_different
  → yes for provider id + constellation identity (catalogue)

claimType: dependency_not_shared (ground / backhaul)
  → confidence: unknown — no evidenceIds

claimType: continues_through_failure (regional fibre cut under both landings)
  → confidence: unknown
```

This is the required “different constellations, independence UNKNOWN” case.

### 9.2 Starlink + Iridium — catalogue orbit/class mix without proven separation

| Layer | Finding | Confidence |
| --- | --- | --- |
| Providers / classes | LEO broadband + LEO narrowband; `hasOrbitMix` true | verified (code) |
| Space segment | Distinct fleets; Iridium cross-link mesh is documented publicly | documented (public) architecture class |
| Throughput independence | Narrowband is not a broadband substitute | hypothesis / design practice |
| Ground / backhaul / site power | — | **unknown** |

v0.4 awards the orbit-mix redundancy bonus here. That is a **catalogue classification combination**, not demonstrated separation of ground, backhaul, or power.

### 9.3 Starlink + Inmarsat — orbit diversity with corporate and landing unknowns

LEO + GEO mix is verified in code. GEO elevation demerit at high latitude is verified. Index lists Inmarsat under “Viasat / Inmarsat”. Shared terrestrial landing and ops coupling remain **unknown**.

### 9.4 Explicit non-claims

- Do not invent gateway coordinates, PoP ids, or shared-fibre edges for demos.
- Do not treat `separated_from` as true because `hasOrbitMix` is true.
- Do not score UNKNOWN.

## 10. Architecture alternatives and recommendation

| Criterion | A. Extended flat catalogue | B. Typed dependency graph | C. Hybrid (catalogue + graph) |
| --- | --- | --- | --- |
| Shared dependencies | Poor (booleans per provider) | Strong (edges between assets) | Strong for new data; catalogue stays for scoring inputs |
| Evidence traceability | Weak unless bolted on | Native via EvidenceRecord | Native on graph side |
| Maintainability | Easy short-term; lies accumulate | Higher modelling cost | Medium — clear boundary required |
| Unknown relationships | Easy to forget | First-class UNKNOWN | First-class on graph |
| Future geographic analysis | Awkward | Natural (`located_at`, scopes) | Natural on graph |
| Complexity | Low | High | Medium–high |
| Research / assessment fit | Insufficient for D-01 | Best match to the research question | Best *incremental* path while v0.4 freezes |

**Recommendation: Option C (hybrid) with graph as the research system of record for independence claims; flat catalogue remains the v0.4 scoring input.**

Rationale: Option A cannot express “two brands share fibre Z.” Option B alone risks a premature rewrite of Signature inputs. Hybrid keeps `ADVISOR_PROVIDERS` stable for reproducible scores while a parallel research graph accumulates evidenced edges and UNKNOWN gaps.

**Limitations of the recommendation**

- Dual models can drift if catalogue ids and graph ServiceProvider ids diverge.
- Graph empty-state must not be mistaken for “no shared risk.”
- Implementation cost is real; do not ship fake edges to look complete.
- UI must not imply the graph is already assessing production Signatures.

## 11. Future implementation considerations

If a later sprint authorises code (still non-scoring unless a named model bump):

1. Version a `gryps-dependency-schema-v0.x` separately from `gryps-signature-v0.4`.
2. Start with read-only JSON / TypeScript fixtures for 2–3 Research Library examples — all UNKNOWN edges explicit.
3. Capture site-level terminal count and power-domain questions in assessment UX before inventing gateway databases.
4. Bent-pipe vs ISL as **documented constellation traits** for display and research filters — never as automatic independence.
5. Keep D-01 / D-06 open until evidenced independence criteria are approved.
6. No Neon migrations until the schema is reviewed as research infrastructure, not as a silent score change.

## 12. Explicit exclusions from current v0.4

This specification does **not**:

- Change `lib/deterministic-score.ts` or `lib/scoring.ts`
- Alter `hasOrbitMix`, provider counting, remaps, caps, or grades
- Introduce Model v0.5 or new weights
- Treat catalogue orbit mix as proven path independence
- Close D-01–D-13
- Persist dependency graphs or write to Neon
- Recalculate historical Research Library scores
- Modify REVIEW packages or LICENSE

v0.4 remains a catalogue-diversity heuristic. Honest communication of that fact is a terminology task (Sprint 8 audit), not a formula change.

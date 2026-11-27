/**
 * Research-only adapter for Sprint 9–11 provider-dependency fixtures.
 *
 * Boundaries:
 * - Loads JSON from docs/methodology/fixtures/provider-dependency-fixtures/
 * - Must NOT be imported by lib/deterministic-score.ts or lib/scoring.ts
 * - Must NOT write to Neon or alter Model v0.4 arithmetic
 * - Presentation helpers only; no resilience score is derived from fixtures
 */

import fixtureA from "@/docs/methodology/fixtures/provider-dependency-fixtures/fixture-a-starlink-oneweb.json";
import fixtureB from "@/docs/methodology/fixtures/provider-dependency-fixtures/fixture-b-starlink-iridium.json";
import fixtureC from "@/docs/methodology/fixtures/provider-dependency-fixtures/fixture-c-synthetic-shared-dependency.json";
import fixtureD from "@/docs/methodology/fixtures/provider-dependency-fixtures/fixture-d-synthetic-positive-separation.json";
import fixtureE from "@/docs/methodology/fixtures/provider-dependency-fixtures/fixture-e-synthetic-contradictory-evidence.json";

export type DependencyLayerId =
  | "space"
  | "ground"
  | "network"
  | "operations"
  | "site"
  | "failure_domains";

export type FixtureId =
  | "fixture-a-starlink-oneweb"
  | "fixture-b-starlink-iridium"
  | "fixture-c-synthetic-shared-dependency"
  | "fixture-d-synthetic-positive-separation"
  | "fixture-e-synthetic-contradictory-evidence";

export type GeographicScope = {
  label: string;
  precision: string;
  geographicNote?: string;
};

export type FixtureEntity = {
  id: string;
  kind: string;
  name: string;
  attributes?: Record<string, string | boolean | number | null | undefined>;
};

export type FixtureRelationship = {
  id: string;
  type: string;
  fromId: string;
  toId: string;
  direction: string;
  assertionKind: string;
  confidence: string;
  inferred: boolean;
  scope: GeographicScope;
  evidenceIds: string[];
  limitations: string;
  recordedAt?: string;
  validFrom?: string | null;
  validTo?: string | null;
  supersedes?: string | null;
  supersededBy?: string | null;
};

export type FixtureUnknown = {
  id: string;
  between: string[];
  layer: string;
  question: string;
  confidence: "unknown";
  evidenceIds: string[];
  mustNotInfer: string;
};

export type FixtureEvidence = {
  id: string;
  title: string;
  urlOrReference: string;
  publisher?: string | null;
  publicationDate?: string | null;
  retrievalDate: string;
  evidenceType: string;
  isSynthetic: boolean;
  claim: string;
  scope: GeographicScope;
  limitations: string;
  verificationStatus: string;
  validFrom?: string | null;
  validTo?: string | null;
  supersedes?: string | null;
  supersededBy?: string | null;
  qualifies?: string | null;
  qualifiedBy?: string | null;
  /** Phase 5 evidence-pack extensions (optional on synthetic fixtures). */
  accessClass?: "public" | "restricted" | "synthetic";
  primaryVsSecondary?: string;
  supportsClaimType?: string;
  relevantPassage?: string;
};

export type CatalogueClassification = {
  providerIds: string[];
  providerDiversity: boolean;
  orbits: string[];
  serviceClasses: string[];
  catalogueBasedOrbitMix: boolean;
  note: string;
};

export type DependencyFixture = {
  schemaVersion: string;
  /** Fixture id (A–E) or evidence-pack id. */
  id: string;
  purpose: string;
  researchConclusion: string;
  scope: GeographicScope;
  temporalValidity: {
    recordedAt: string;
    validFrom: string;
    validTo: string | null;
    note: string;
  };
  catalogueClassification: CatalogueClassification;
  entities: FixtureEntity[];
  relationships: FixtureRelationship[];
  unknownRelationships: FixtureUnknown[];
  evidence: FixtureEvidence[];
  claimsNotToMake: string[];
  limitations: string[];
  isOperationalAssessment: boolean;
  containsScoreOrProbability: boolean;
  displayName?: string;
  packKind?: string;
  entersProductionAssessmentWorkflow?: boolean;
};

export const FIXTURE_OPTIONS: {
  id: FixtureId;
  label: string;
  shortLabel: string;
}[] = [
  {
    id: "fixture-a-starlink-oneweb",
    label: "Fixture A — Starlink + OneWeb",
    shortLabel: "A · Starlink + OneWeb",
  },
  {
    id: "fixture-b-starlink-iridium",
    label: "Fixture B — Starlink + Iridium",
    shortLabel: "B · Starlink + Iridium",
  },
  {
    id: "fixture-c-synthetic-shared-dependency",
    label: "Fixture C — Synthetic shared infrastructure",
    shortLabel: "C · Synthetic shared",
  },
  {
    id: "fixture-d-synthetic-positive-separation",
    label: "Fixture D — Synthetic positive separation",
    shortLabel: "D · Separation",
  },
  {
    id: "fixture-e-synthetic-contradictory-evidence",
    label: "Fixture E — Synthetic contradictory evidence",
    shortLabel: "E · Contradiction",
  },
];

const FIXTURES: Record<FixtureId, DependencyFixture> = {
  "fixture-a-starlink-oneweb": fixtureA as unknown as DependencyFixture,
  "fixture-b-starlink-iridium": fixtureB as unknown as DependencyFixture,
  "fixture-c-synthetic-shared-dependency": fixtureC as unknown as DependencyFixture,
  "fixture-d-synthetic-positive-separation": fixtureD as unknown as DependencyFixture,
  "fixture-e-synthetic-contradictory-evidence": fixtureE as unknown as DependencyFixture,
};

export const LAYER_LABELS: Record<DependencyLayerId, string> = {
  space: "Space segment",
  ground: "Ground infrastructure",
  network: "Backhaul and network",
  operations: "Operations and control",
  site: "Site equipment and power",
  failure_domains: "Failure domains",
};

const ENTITY_LAYER: Record<string, DependencyLayerId | null> = {
  service_provider: null,
  constellation: "space",
  ground_facility: "ground",
  terrestrial_backhaul: "network",
  network_pop: "network",
  network_operator: "operations",
  network_control: "operations",
  site_terminal: "site",
  site_power: "site",
  site_network: "site",
  failure_domain: "failure_domains",
  assessment_site: "site",
};

export function listFixtureIds(): FixtureId[] {
  return FIXTURE_OPTIONS.map((o) => o.id);
}

export function getDependencyFixture(id: FixtureId): DependencyFixture {
  const f = FIXTURES[id];
  if (!f) throw new Error(`Unknown dependency fixture: ${id}`);
  return f;
}

export function isFixtureId(id: string): id is FixtureId {
  return id in FIXTURES;
}

export function entityById(fixture: DependencyFixture, id: string): FixtureEntity | undefined {
  return fixture.entities.find((e) => e.id === id);
}

export function evidenceById(
  fixture: DependencyFixture,
  id: string
): FixtureEvidence | undefined {
  return fixture.evidence.find((e) => e.id === id);
}

export function isSyntheticFixture(fixture: DependencyFixture): boolean {
  if (fixture.packKind === "public_evidence_pack") return false;
  return (
    fixture.id === "fixture-c-synthetic-shared-dependency" ||
    fixture.id === "fixture-d-synthetic-positive-separation" ||
    fixture.id === "fixture-e-synthetic-contradictory-evidence" ||
    (fixture.evidence.length > 0 && fixture.evidence.every((e) => e.isSynthetic))
  );
}

export function fixtureHasSharedFailureDomain(fixture: DependencyFixture): boolean {
  return fixture.relationships.some(
    (r) =>
      r.type === "shares_infrastructure_with" ||
      (r.type === "connects_through" &&
        fixture.relationships.filter((x) => x.type === "connects_through" && x.toId === r.toId)
          .length >= 2 &&
        r.confidence !== "contradicted")
  );
}

export function fixtureHasPositiveSeparation(fixture: DependencyFixture): boolean {
  return fixture.relationships.some(
    (r) => r.type === "separated_from" && r.confidence !== "unknown" && r.confidence !== "contradicted"
  );
}

export function fixtureHasContradiction(fixture: DependencyFixture): boolean {
  return fixture.relationships.some((r) => r.confidence === "contradicted");
}

export function separationRelationships(fixture: DependencyFixture): FixtureRelationship[] {
  return fixture.relationships.filter(
    (r) => r.type === "separated_from" && r.confidence !== "unknown" && r.confidence !== "contradicted"
  );
}

export function contradictedRelationships(fixture: DependencyFixture): FixtureRelationship[] {
  return fixture.relationships.filter((r) => r.confidence === "contradicted");
}

export type LayerView = {
  id: DependencyLayerId;
  label: string;
  entities: FixtureEntity[];
  relationships: FixtureRelationship[];
  unknowns: FixtureUnknown[];
};

function entityLayer(entity: FixtureEntity): DependencyLayerId | null {
  if (entity.kind === "failure_domain") return "failure_domains";
  return ENTITY_LAYER[entity.kind] ?? null;
}

function relationshipTouchesLayer(
  fixture: DependencyFixture,
  rel: FixtureRelationship,
  layer: DependencyLayerId
): boolean {
  const from = entityById(fixture, rel.fromId);
  const to = entityById(fixture, rel.toId);
  if (!from || !to) return false;
  if (layer === "failure_domains") {
    return from.kind === "failure_domain" || to.kind === "failure_domain";
  }
  if (layer === "space") {
    return from.kind === "constellation" || to.kind === "constellation";
  }
  if (layer === "ground") {
    return (
      from.kind === "ground_facility" ||
      to.kind === "ground_facility" ||
      (rel.type === "separated_from" &&
        (from.kind === "ground_facility" || to.kind === "ground_facility"))
    );
  }
  if (layer === "network") {
    return (
      from.kind === "terrestrial_backhaul" ||
      to.kind === "terrestrial_backhaul" ||
      from.kind === "network_pop" ||
      to.kind === "network_pop"
    );
  }
  if (layer === "operations") {
    return (
      from.kind === "network_operator" ||
      to.kind === "network_operator" ||
      from.kind === "network_control" ||
      to.kind === "network_control" ||
      (to.kind === "failure_domain" && to.attributes?.layer === "operations")
    );
  }
  if (layer === "site") {
    return (
      from.kind === "site_terminal" ||
      to.kind === "site_terminal" ||
      from.kind === "site_power" ||
      to.kind === "site_power" ||
      from.kind === "site_network" ||
      to.kind === "site_network" ||
      from.kind === "assessment_site" ||
      to.kind === "assessment_site"
    );
  }
  return false;
}

export function buildLayerViews(fixture: DependencyFixture): LayerView[] {
  const layers: DependencyLayerId[] = [
    "space",
    "ground",
    "network",
    "operations",
    "site",
    "failure_domains",
  ];

  return layers.map((id) => {
    const entities = fixture.entities.filter((e) => {
      if (id === "failure_domains") return e.kind === "failure_domain";
      if (id === "space") return e.kind === "constellation";
      if (id === "ground") return e.kind === "ground_facility";
      if (id === "network")
        return e.kind === "terrestrial_backhaul" || e.kind === "network_pop";
      if (id === "operations")
        return e.kind === "network_operator" || e.kind === "network_control";
      if (id === "site")
        return (
          e.kind === "site_terminal" ||
          e.kind === "site_power" ||
          e.kind === "site_network" ||
          e.kind === "assessment_site"
        );
      return entityLayer(e) === id;
    });

    const relationships = fixture.relationships.filter((r) =>
      relationshipTouchesLayer(fixture, r, id)
    );

    const unknowns = fixture.unknownRelationships.filter((u) => {
      if (id === "failure_domains") return false;
      return u.layer === id;
    });

    return {
      id,
      label: LAYER_LABELS[id],
      entities,
      relationships,
      unknowns,
    };
  });
}

/** Fixed Model v0.4 homepage regression — not derived from research fixtures. */
export const DEPENDENCY_LAB_SIGNATURE_NOTICE =
  "Reference Signature only. Generated by the existing Model v0.4 scoring engine for the homepage regression scenario. Its providers and inputs are not necessarily those of the selected dependency research fixture. The research below does not contribute to this score.";

export const DEPENDENCY_LAB_FIXTURE_CONTEXT_NOTICE =
  "Dependency research scenario — providers and relationships below come from the selected fixture only. They are not inputs to the Reference Signature.";

export const UNKNOWN_RELATIONSHIP_COPY =
  "Unknown — insufficient evidence to determine whether these providers share this dependency.";

export const REFERENCE_SIGNATURE_LABEL = "Reference Signature — Homepage regression scenario";
export const RESEARCH_SCENARIO_LABEL = "Dependency research scenario";

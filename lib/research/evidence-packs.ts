/**
 * Research-only public evidence packs (Phase 5).
 *
 * Boundaries:
 * - Must NOT be imported by lib/deterministic-score.ts or lib/scoring.ts
 * - Must NOT write to Neon or alter Model v0.4 arithmetic
 * - Must NOT enter production assessment inputs
 */

import packNordicLapland from "@/docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/pack.json";
import {
  FIXTURE_OPTIONS,
  getDependencyFixture,
  isFixtureId,
  type DependencyFixture,
  type FixtureEvidence,
  type FixtureId,
} from "@/lib/research/dependency-fixtures";

export type EvidencePackId = "nordic-lapland-dual-path-v0";

export type LabScenarioId = FixtureId | EvidencePackId;

export type EvidencePackRecord = DependencyFixture & {
  packSchemaVersion: string;
  displayName: string;
  packKind: "public_evidence_pack";
  entersProductionAssessmentWorkflow: false;
};

export const EVIDENCE_PACK_OPTIONS: {
  id: EvidencePackId;
  label: string;
  shortLabel: string;
}[] = [
  {
    id: "nordic-lapland-dual-path-v0",
    label: "Nordic Lapland — Public Evidence Research Envelope",
    shortLabel: "Lapland · Public evidence",
  },
];

export const EVIDENCE_PACK_NOTICE =
  "Public evidence research pack — not a synthetic fixture. Documented architecture and facility-existence relationships only. This scenario does not establish a complete customer-serving path, dual-path independence, or operational availability.";

export const EVIDENCE_PACK_NO_SCORE_NOTICE =
  "No Resilience Signature is calculated for this evidence pack. The Reference Signature above remains the homepage regression scenario only.";

const PACKS: Record<EvidencePackId, EvidencePackRecord> = {
  "nordic-lapland-dual-path-v0": packNordicLapland as unknown as EvidencePackRecord,
};

export function isEvidencePackId(id: string): id is EvidencePackId {
  return id === "nordic-lapland-dual-path-v0";
}

export function listEvidencePackIds(): EvidencePackId[] {
  return EVIDENCE_PACK_OPTIONS.map((o) => o.id);
}

export function getEvidencePack(id: EvidencePackId): EvidencePackRecord {
  const pack = PACKS[id];
  if (!pack) throw new Error(`Unknown evidence pack: ${id}`);
  return pack;
}

export function isPublicEvidencePack(fixture: DependencyFixture): boolean {
  return (
    isEvidencePackId(fixture.id) &&
    (fixture as EvidencePackRecord).packKind === "public_evidence_pack"
  );
}

export function evidenceAccessClass(ev: FixtureEvidence): string | undefined {
  return (ev as FixtureEvidence & { accessClass?: string }).accessClass;
}

export const LAB_SCENARIO_OPTIONS: {
  id: LabScenarioId;
  label: string;
  shortLabel: string;
  kind: "fixture" | "evidence_pack";
}[] = [
  ...FIXTURE_OPTIONS.map((o) => ({ ...o, kind: "fixture" as const })),
  ...EVIDENCE_PACK_OPTIONS.map((o) => ({ ...o, kind: "evidence_pack" as const })),
];

export function getLabScenario(id: LabScenarioId): DependencyFixture {
  if (isEvidencePackId(id)) return getEvidencePack(id);
  if (isFixtureId(id)) return getDependencyFixture(id);
  throw new Error(`Unknown lab scenario: ${id}`);
}

export function listLabScenarioIds(): LabScenarioId[] {
  return LAB_SCENARIO_OPTIONS.map((o) => o.id);
}

export function isLabScenarioId(id: string): id is LabScenarioId {
  return isFixtureId(id) || isEvidencePackId(id);
}

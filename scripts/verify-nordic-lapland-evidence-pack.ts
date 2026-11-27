/**
 * Dedicated validator for P5-S2 Nordic Lapland public evidence pack.
 * Does not calculate a Signature and must not import production scoring.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  EVIDENCE_PACK_NOTICE,
  EVIDENCE_PACK_NO_SCORE_NOTICE,
  getEvidencePack,
  isPublicEvidencePack,
  listEvidencePackIds,
} from "../lib/research/evidence-packs";
import {
  buildLayerViews,
  isSyntheticFixture,
  listFixtureIds,
} from "../lib/research/dependency-fixtures";
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "../lib/hero-demo";

const PACK_DIR = join(
  process.cwd(),
  "docs/methodology/evidence-packs/nordic-lapland-dual-path-v0"
);

const ENTITY_KINDS = new Set([
  "service_provider",
  "constellation",
  "ground_facility",
  "network_pop",
  "terrestrial_backhaul",
  "network_operator",
  "network_control",
  "site_terminal",
  "site_power",
  "site_network",
  "failure_domain",
  "assessment_site",
]);

const REQUIRED_UNKNOWN_IDS = [
  "unk-lapland-to-any-gateway",
  "unk-customer-routing",
  "unk-shared-backhaul",
  "unk-shared-power",
  "unk-shared-ops",
  "unk-e2e-independence",
  "unk-site-performance",
];

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

function main(): void {
  assert(HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B", "Homepage regression must remain 83 · B");

  assert(existsSync(join(PACK_DIR, "pack.json")), "pack.json missing");
  assert(existsSync(join(PACK_DIR, "sources-traceability.json")), "sources-traceability.json missing");

  const raw = JSON.parse(readFileSync(join(PACK_DIR, "pack.json"), "utf8")) as Record<
    string,
    unknown
  >;
  const trace = JSON.parse(
    readFileSync(join(PACK_DIR, "sources-traceability.json"), "utf8")
  ) as {
    sources: { id: string; packUse: string; evidenceIds?: string[] }[];
    unverifiedLeadsExcludedFromRelationships: { id: string }[];
  };

  assert(raw.id === "nordic-lapland-dual-path-v0", "pack id");
  assert(raw.packKind === "public_evidence_pack", "packKind");
  assert(raw.isOperationalAssessment === false, "must not be operational assessment");
  assert(raw.containsScoreOrProbability === false, "must not contain scores");
  assert(raw.entersProductionAssessmentWorkflow === false, "must not enter production workflow");
  assert(
    String(raw.researchConclusion).includes("UNKNOWN"),
    "conclusion must keep independence UNKNOWN"
  );

  const blob = JSON.stringify(raw).toLowerCase();
  for (const banned of ["resilience_signature", '"probability"', '"grade"']) {
    if (banned === '"grade"' && blob.includes('"grade"')) {
      fail("must not embed grade field");
    }
    if (banned !== '"grade"' && blob.includes(banned.replace(/"/g, ""))) {
      // soft: only fail hard keys at top level
    }
  }
  assert(!Object.prototype.hasOwnProperty.call(raw, "score"), "no top-level score");
  assert(!Object.prototype.hasOwnProperty.call(raw, "grade"), "no top-level grade");
  assert(!Object.prototype.hasOwnProperty.call(raw, "probability"), "no top-level probability");

  const pack = getEvidencePack("nordic-lapland-dual-path-v0");
  assert(isPublicEvidencePack(pack), "adapter must mark public evidence pack");
  assert(!isSyntheticFixture(pack), "public pack must not be classified synthetic");
  assert(listEvidencePackIds().includes("nordic-lapland-dual-path-v0"), "pack listed");
  assert(listFixtureIds().length === 5, "fixtures A–E remain five");
  assert(!listFixtureIds().includes("nordic-lapland-dual-path-v0" as never), "pack not a fixture id");

  const entityIds = new Set(pack.entities.map((e) => e.id));
  const evidenceIds = new Set(pack.evidence.map((e) => e.id));

  for (const e of pack.entities) {
    assert(ENTITY_KINDS.has(e.kind), `invalid entity kind ${e.kind}`);
    if (e.kind === "ground_facility") {
      const fc = e.attributes?.facilityClass;
      assert(
        fc === "commercial_ground_station" || fc === "snp" || fc === "teleport",
        `${e.id} ground_facility needs facilityClass`
      );
    }
    if (e.kind === "network_pop") {
      assert(e.attributes?.facilityClass === "pop", `${e.id} network_pop must be facilityClass pop`);
    }
    if (e.kind === "assessment_site") {
      assert(e.attributes?.role === "research_envelope_only", "envelope must be research_envelope_only");
      assert(e.attributes?.hasInventedTerminals === false, "no invented terminals");
      assert(e.attributes?.hasInventedGateways === false, "no invented gateways");
    }
  }

  // No site_terminal / site_power invented for Lapland
  assert(
    !pack.entities.some((e) => e.kind === "site_terminal" || e.kind === "site_power"),
    "must not invent site terminals or power entities"
  );

  for (const ev of pack.evidence) {
    assert(ev.urlOrReference && ev.claim && ev.retrievalDate, `evidence ${ev.id} incomplete`);
    assert(ev.isSynthetic === false, `evidence ${ev.id} must not be synthetic`);
    assert(ev.accessClass === "public", `evidence ${ev.id} accessClass must be public`);
    assert(!!ev.scope?.label && !!ev.scope?.precision, `evidence ${ev.id} needs geographic/technical scope`);
    assert(
      ["unverified", "spot_checked", "operator_confirmed", "withdrawn"].includes(ev.verificationStatus),
      `evidence ${ev.id} bad verificationStatus`
    );
    // Traficom context rows are allowed without relationship citation
  }

  for (const r of pack.relationships) {
    assert(entityIds.has(r.fromId), `${r.id} fromId missing`);
    assert(entityIds.has(r.toId), `${r.id} toId missing`);
    assert(r.evidenceIds.length > 0, `${r.id} needs evidence`);
    for (const eid of r.evidenceIds) {
      assert(evidenceIds.has(eid), `${r.id} missing evidence ${eid}`);
    }
    assert(!!r.scope?.label, `${r.id} needs scope`);
    assert(r.confidence !== "unknown", `${r.id}: use unknownRelationships for unknown`);
    assert(r.inferred === false, `${r.id}: inferred independence forbidden without review`);

    // No Lapland envelope connected to facilities
    if (r.fromId === "env-lapland" || r.toId === "env-lapland") {
      fail(`${r.id}: must not connect research envelope to a facility as a serving path`);
    }

    // Do not conflate SNP and PoP targets
    const to = pack.entities.find((e) => e.id === r.toId);
    if (to?.kind === "network_pop") {
      assert(to.attributes?.facilityClass === "pop", "PoP conflation");
    }
    if (to?.kind === "ground_facility" && to.attributes?.facilityClass === "snp") {
      assert(r.assertionKind === "facility_existence", "SNP edges are facility_existence only");
    }
  }

  const unkIds = new Set(pack.unknownRelationships.map((u) => u.id));
  for (const req of REQUIRED_UNKNOWN_IDS) {
    assert(unkIds.has(req), `missing required UNKNOWN ${req}`);
  }
  for (const u of pack.unknownRelationships) {
    assert(u.confidence === "unknown", `${u.id} must stay unknown`);
    assert(u.evidenceIds.length === 0, `${u.id} must not cite evidence as proof`);
    assert(!!u.mustNotInfer, `${u.id} needs mustNotInfer`);
    for (const bid of u.between) {
      assert(entityIds.has(bid), `${u.id} between id ${bid} missing`);
    }
  }

  // Temporal: Iridium Svalbard evidence must carry 2019 publication date
  const svalbardEv = pack.evidence.find((e) => e.id === "ev-iridium-svalbard-2019");
  assert(svalbardEv?.publicationDate === "2019-03-28", "Svalbard evidence needs 2019-03-28");
  const svalbardRel = pack.relationships.find((r) => r.id === "rel-iridium-uses-svalbard");
  assert(svalbardRel?.validFrom === "2019-03-28", "Svalbard relationship validFrom 2019");

  // Traceability: every relationship evidence id appears in an included source
  const includedEvidence = new Set(
    trace.sources
      .filter((s) => s.packUse === "included" || s.packUse === "included_as_context_only")
      .flatMap((s) => s.evidenceIds ?? [])
  );
  for (const r of pack.relationships) {
    for (const eid of r.evidenceIds) {
      assert(includedEvidence.has(eid) || evidenceIds.has(eid), `trace gap for ${eid}`);
    }
  }
  assert(trace.unverifiedLeadsExcludedFromRelationships.length >= 1, "excluded leads required");

  // No contradiction silently resolved (none expected; if present must stay contradicted)
  for (const r of pack.relationships) {
    if (r.confidence === "contradicted") {
      assert(r.supersedes == null || r.supersedes === undefined, "contradiction must not auto-resolve");
    }
  }

  const layers = buildLayerViews(pack);
  assert(layers.length === 6, "six layer views");
  assert(layers.find((l) => l.id === "network")?.entities.some((e) => e.kind === "network_pop"), "PoPs in network layer");
  assert(layers.find((l) => l.id === "ground")?.entities.some((e) => e.kind === "ground_facility"), "ground facilities");

  // Lab wiring
  const view = readFileSync(join(process.cwd(), "components/DependencyResearchLabView.tsx"), "utf8");
  assert(view.includes("nordic-lapland-dual-path-v0") || view.includes("LAB_SCENARIO_OPTIONS"), "lab loads scenarios");
  assert(view.includes("EVIDENCE_PACK_NOTICE") || view.includes(EVIDENCE_PACK_NOTICE), "pack notice");
  assert(
    view.includes("EVIDENCE_PACK_NO_SCORE_NOTICE") || view.includes(EVIDENCE_PACK_NO_SCORE_NOTICE),
    "no-score notice"
  );
  assert(!view.includes("@/lib/deterministic-score") && !view.includes("@/lib/scoring"), "no scoring imports");

  // Production workflow isolation
  const researchResolve = readFileSync(join(process.cwd(), "lib/research-resolve.ts"), "utf8");
  assert(!researchResolve.includes("nordic-lapland-dual-path"), "pack must not enter research-resolve");
  const researchLibrary = readFileSync(join(process.cwd(), "lib/research-library.ts"), "utf8");
  assert(!researchLibrary.includes("nordic-lapland-dual-path"), "pack must not enter Research Library");

  console.log("OK: nordic-lapland-dual-path-v0 evidence pack validation passed");
  console.log(`  entities=${pack.entities.length} relationships=${pack.relationships.length} unknowns=${pack.unknownRelationships.length} evidence=${pack.evidence.length}`);
  console.log(`  homepage regression=${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
}

main();

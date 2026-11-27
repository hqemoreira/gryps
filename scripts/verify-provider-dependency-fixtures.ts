/**
 * Research-only validation of Sprint 9 provider-dependency fixtures.
 * Does not calculate a GRYPS Signature and does not import production scoring.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const FIXTURE_DIR = join(
  process.cwd(),
  "docs/methodology/fixtures/provider-dependency-fixtures"
);

const ENTITY_KINDS = new Set([
  "service_provider",
  "constellation",
  "ground_facility",
  "terrestrial_backhaul",
  "network_operator",
  "network_control",
  "site_terminal",
  "site_power",
  "site_network",
  "failure_domain",
  "assessment_site",
]);

const RELATION_TYPES = new Set([
  "operates",
  "owns",
  "offers",
  "uses",
  "connects_through",
  "depends_on",
  "shares_infrastructure_with",
  "located_at",
  "controlled_by",
  "exposed_to",
  "separated_from",
]);

const CONFIDENCES = new Set([
  "verified",
  "documented",
  "inferred",
  "unknown",
  "contradicted",
]);

type Json = Record<string, unknown>;

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function asArray(v: unknown, label: string): unknown[] {
  if (!Array.isArray(v)) fail(`${label} must be an array`);
  return v;
}

function asObj(v: unknown, label: string): Json {
  if (!v || typeof v !== "object" || Array.isArray(v)) fail(`${label} must be an object`);
  return v as Json;
}

function loadFixtures(): { file: string; data: Json }[] {
  const files = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith(".json"));
  if (files.length < 5) fail(`Expected ≥5 JSON fixtures, found ${files.length}`);
  return files.map((file) => ({
    file,
    data: JSON.parse(readFileSync(join(FIXTURE_DIR, file), "utf8")) as Json,
  }));
}

function validateFixture(file: string, data: Json): void {
  const id = String(data.id ?? "");
  if (!id) fail(`${file}: missing id`);
  if (data.schemaVersion !== "gryps-dependency-fixture-v0.1") {
    fail(`${file}: unexpected schemaVersion`);
  }
  if (!data.purpose || !data.researchConclusion) {
    fail(`${file}: purpose and researchConclusion required`);
  }
  if (data.isOperationalAssessment !== false) {
    fail(`${file}: isOperationalAssessment must be false`);
  }
  if (data.containsScoreOrProbability !== false) {
    fail(`${file}: containsScoreOrProbability must be false`);
  }

  const bannedKeys = ["score", "grade", "weight", "probability", "resilienceSignature"];
  const blob = JSON.stringify(data).toLowerCase();
  for (const k of bannedKeys) {
    // Allow prose mentioning "score" only in claimsNotToMake / limitations via explicit flags above.
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      fail(`${file}: must not contain top-level scoring field '${k}'`);
    }
  }
  if (/"resilience_signature"\s*:/.test(blob) || /"probability"\s*:/.test(blob)) {
    fail(`${file}: must not embed resilience_signature or probability fields`);
  }

  const scope = asObj(data.scope, `${file}.scope`);
  if (!scope.label) fail(`${file}: scope.label required`);
  if (!data.limitations || !Array.isArray(data.limitations) || data.limitations.length === 0) {
    fail(`${file}: limitations required`);
  }
  if (!data.claimsNotToMake || !Array.isArray(data.claimsNotToMake)) {
    fail(`${file}: claimsNotToMake required`);
  }

  const catalogue = asObj(data.catalogueClassification, `${file}.catalogueClassification`);
  if (typeof catalogue.providerDiversity !== "boolean") {
    fail(`${file}: catalogueClassification.providerDiversity required`);
  }
  if (typeof catalogue.catalogueBasedOrbitMix !== "boolean") {
    fail(`${file}: catalogueClassification.catalogueBasedOrbitMix required`);
  }

  const entities = asArray(data.entities, `${file}.entities`).map((e) => asObj(e, "entity"));
  const entityIds = new Set<string>();
  for (const e of entities) {
    const eid = String(e.id ?? "");
    if (!eid) fail(`${file}: entity missing id`);
    if (entityIds.has(eid)) fail(`${file}: duplicate entity id ${eid}`);
    entityIds.add(eid);
    if (!ENTITY_KINDS.has(String(e.kind))) fail(`${file}: invalid entity kind ${e.kind}`);
    if (!e.name) fail(`${file}: entity ${eid} missing name`);
  }

  const evidence = asArray(data.evidence, `${file}.evidence`).map((e) => asObj(e, "evidence"));
  const evidenceIds = new Set<string>();
  for (const ev of evidence) {
    const evid = String(ev.id ?? "");
    if (!evid) fail(`${file}: evidence missing id`);
    if (evidenceIds.has(evid)) fail(`${file}: duplicate evidence id ${evid}`);
    evidenceIds.add(evid);
    if (!ev.title || !ev.urlOrReference || !ev.claim || !ev.retrievalDate) {
      fail(`${file}: evidence ${evid} incomplete`);
    }
    if (typeof ev.isSynthetic !== "boolean") fail(`${file}: evidence ${evid} needs isSynthetic`);
    if (ev.evidenceType === "synthetic_test" && ev.isSynthetic !== true) {
      fail(`${file}: synthetic_test evidence must set isSynthetic true`);
    }
    const vs = String(ev.verificationStatus);
    if (!["unverified", "spot_checked", "operator_confirmed", "withdrawn"].includes(vs)) {
      fail(`${file}: evidence ${evid} bad verificationStatus`);
    }
  }

  const relationships = asArray(data.relationships, `${file}.relationships`).map((r) =>
    asObj(r, "relationship")
  );
  for (const r of relationships) {
    const rid = String(r.id ?? "");
    if (!rid) fail(`${file}: relationship missing id`);
    if (!RELATION_TYPES.has(String(r.type))) fail(`${file}: bad relation type ${r.type}`);
    if (!r.direction) fail(`${file}: relationship ${rid} missing direction`);
    if (!entityIds.has(String(r.fromId))) fail(`${file}: ${rid} fromId unknown`);
    if (!entityIds.has(String(r.toId))) fail(`${file}: ${rid} toId unknown`);
    if (!CONFIDENCES.has(String(r.confidence))) fail(`${file}: ${rid} bad confidence`);
    const eids = asArray(r.evidenceIds, `${file}.${rid}.evidenceIds`);
    for (const eid of eids) {
      if (!evidenceIds.has(String(eid))) fail(`${file}: ${rid} evidence ${eid} missing`);
    }
    if (r.confidence === "unknown" && eids.length > 0) {
      // allowed but unusual — ok
    }
    if (r.type === "separated_from" && r.confidence === "unknown") {
      fail(`${file}: separated_from must not be unknown (use unknownRelationships)`);
    }
    // UNKNOWN must not become inferred independence
    if (String(r.type) === "separated_from" && r.inferred === true && !eids.length) {
      fail(`${file}: inferred separated_from without evidence forbidden`);
    }
  }

  const unknowns = asArray(data.unknownRelationships, `${file}.unknownRelationships`).map((u) =>
    asObj(u, "unknown")
  );
  for (const u of unknowns) {
    if (u.confidence !== "unknown") fail(`${file}: unknownRelationships must have confidence unknown`);
    const eids = asArray(u.evidenceIds ?? [], `${file}.unk.evidenceIds`);
    if (eids.length > 0) fail(`${file}: UNKNOWN relationship must not cite evidence as proof`);
    if (!u.mustNotInfer) fail(`${file}: unknownRelationships need mustNotInfer`);
    const between = asArray(u.between, `${file}.unk.between`);
    for (const bid of between) {
      if (!entityIds.has(String(bid))) fail(`${file}: unknown between id ${bid} missing`);
    }
  }

  // Fixture-specific expectations
  if (id === "fixture-a-starlink-oneweb") {
    if (catalogue.catalogueBasedOrbitMix !== false) {
      fail(`${file}: Fixture A must record catalogueBasedOrbitMix false`);
    }
    if (!String(data.researchConclusion).includes("UNKNOWN")) {
      fail(`${file}: Fixture A conclusion must keep independence UNKNOWN`);
    }
    const realNames = blob.includes("auroralink") || blob.includes("borealisrelay");
    if (realNames) fail(`${file}: Fixture A must not use synthetic providers`);
  }
  if (id === "fixture-b-starlink-iridium") {
    if (catalogue.catalogueBasedOrbitMix !== true) {
      fail(`${file}: Fixture B must record catalogueBasedOrbitMix true`);
    }
    if (!String(data.researchConclusion).includes("UNKNOWN")) {
      fail(`${file}: Fixture B conclusion must keep independence UNKNOWN`);
    }
  }
  if (id === "fixture-c-synthetic-shared-dependency") {
    const synthEv = evidence.filter((e) => e.isSynthetic === true);
    if (synthEv.length < 2) fail(`${file}: Fixture C needs synthetic evidence`);
    if (evidence.some((e) => e.isSynthetic !== true)) {
      fail(`${file}: Fixture C evidence must all be synthetic (no real-world mix-in)`);
    }
    const shared = relationships.filter((r) => r.type === "connects_through");
    if (shared.length < 2) fail(`${file}: Fixture C needs ≥2 connects_through to shared entity`);
    const landing = String(shared[0].toId);
    if (!shared.every((r) => String(r.toId) === landing)) {
      fail(`${file}: Fixture C connects_through must target the same shared facility`);
    }
    if (blob.includes("starlink") || blob.includes("oneweb") || blob.includes("iridium")) {
      // claimsNotToMake may mention them — check entities only
      const entityBlob = JSON.stringify(entities).toLowerCase();
      if (
        entityBlob.includes("starlink") ||
        entityBlob.includes("oneweb") ||
        entityBlob.includes("iridium")
      ) {
        fail(`${file}: Fixture C entities must not name real operators`);
      }
    }
    if (!String(data.researchConclusion).includes("same explicitly modelled")) {
      fail(`${file}: Fixture C conclusion mismatch`);
    }
  }
  if (id === "fixture-d-synthetic-positive-separation") {
    if (evidence.some((e) => e.isSynthetic !== true)) {
      fail(`${file}: Fixture D evidence must all be synthetic`);
    }
    const sep = relationships.filter((r) => r.type === "separated_from");
    if (sep.length < 1) fail(`${file}: Fixture D needs separated_from`);
    if (sep.some((r) => r.confidence === "unknown" || r.confidence === "contradicted")) {
      fail(`${file}: Fixture D separation must not be unknown/contradicted`);
    }
    if (!String(data.researchConclusion).includes("does not establish complete end-to-end")) {
      fail(`${file}: Fixture D conclusion must limit separation scope`);
    }
    if (unknowns.length < 1) fail(`${file}: Fixture D must keep other layers UNKNOWN`);
  }
  if (id === "fixture-e-synthetic-contradictory-evidence") {
    if (evidence.some((e) => e.isSynthetic !== true)) {
      fail(`${file}: Fixture E evidence must all be synthetic`);
    }
    const contradicted = relationships.filter((r) => r.confidence === "contradicted");
    if (contradicted.length < 1) fail(`${file}: Fixture E needs contradicted relationships`);
    const earlier = evidence.find((e) => e.id === "ev-synth-e-earlier-shared");
    const later = evidence.find((e) => e.id === "ev-synth-e-later-separate");
    if (!earlier || !later) fail(`${file}: Fixture E missing temporal evidence pair`);
    if (!earlier.publicationDate || !later.publicationDate) {
      fail(`${file}: Fixture E temporal evidence needs publication dates`);
    }
    if (String(earlier.publicationDate) >= String(later.publicationDate)) {
      fail(`${file}: Fixture E earlier evidence must predate later evidence`);
    }
    // Both records must remain present (no deletion / overwrite)
    if (!evidenceIds.has("ev-synth-e-earlier-shared") || !evidenceIds.has("ev-synth-e-later-separate")) {
      fail(`${file}: Fixture E must preserve both evidence records`);
    }
    if (later.supersedes === "ev-synth-e-earlier-shared") {
      fail(`${file}: Fixture E must not auto-supersede earlier evidence as resolved truth`);
    }
    if (!String(data.researchConclusion).includes("cannot currently be classified")) {
      fail(`${file}: Fixture E conclusion must remain unresolved`);
    }
  }

  // UNKNOWN semantics: never treat unknownRelationships as independence
  for (const u of unknowns) {
    const mni = String(u.mustNotInfer).toLowerCase();
    if (mni.includes("are independent") && !mni.includes("not")) {
      fail(`${file}: mustNotInfer must not assert independence`);
    }
  }

  console.log(`OK  ${id} (${file})`);
}

function main(): void {
  const fixtures = loadFixtures();
  const ids = new Set<string>();
  for (const { file, data } of fixtures) {
    validateFixture(file, data);
    const id = String(data.id);
    if (ids.has(id)) fail(`duplicate fixture id ${id}`);
    ids.add(id);
  }
  for (const required of [
    "fixture-a-starlink-oneweb",
    "fixture-b-starlink-iridium",
    "fixture-c-synthetic-shared-dependency",
    "fixture-d-synthetic-positive-separation",
    "fixture-e-synthetic-contradictory-evidence",
  ]) {
    if (!ids.has(required)) fail(`missing required fixture ${required}`);
  }
  console.log(`Provider dependency fixtures validated (${fixtures.length} files).`);
  console.log("No Signature calculated. Research-only.");
}

main();

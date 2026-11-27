/**
 * P5-S5 evidence intake validator — synthetic fixtures only.
 * Does not calculate Signatures, touch Neon, or mutate P5-S2 pack.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  EVIDENCE_INTAKE_SCHEMA,
  NON_SUPPORT_TERMINALS,
  TERMINAL_SUPPORT_STATES,
  assertValidHistory,
  historyEndsWith,
  supportMustNotFollowNoResponseOrDeclined,
  type EvidenceIntakeRecord,
  type IntakeLifecycleState,
} from "../lib/research/evidence-intake";
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "../lib/hero-demo";

const FIXTURE = join(
  process.cwd(),
  "docs/methodology/fixtures/evidence-intake/synthetic-intake-cases.json"
);
const PACK = join(
  process.cwd(),
  "docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/pack.json"
);

const KNOWN_CLAIMS = new Set([
  "CLAIM-A-01",
  "CLAIM-A-02",
  "CLAIM-A-03",
  "CLAIM-A-04",
  "CLAIM-A-05",
  "CLAIM-A-06",
  "CLAIM-A-07",
  "CLAIM-A-08",
  "CLAIM-B-01",
  "CLAIM-B-02",
  "CLAIM-B-03",
  "CLAIM-B-04",
  "CLAIM-C-01",
  "CLAIM-C-02",
  "CLAIM-C-03",
  "CLAIM-C-04",
  "CLAIM-C-05",
  "CLAIM-C-06",
  "CLAIM-D-01",
  "CLAIM-D-02",
  "CLAIM-D-03",
  "CLAIM-D-04",
  "CLAIM-D-05",
  "CLAIM-E-01",
  "CLAIM-E-02",
  "CLAIM-E-03",
  "CLAIM-E-04",
  "CLAIM-E-05",
  "CLAIM-F-01",
  "CLAIM-F-02",
  "CLAIM-F-03",
  "CLAIM-F-04",
]);

const REQUIRED_CASE_IDS = [
  "SYN-INTAKE-A-ARCH",
  "SYN-INTAKE-B-FACILITY",
  "SYN-INTAKE-C-SITE",
  "SYN-INTAKE-D1-EARLIER",
  "SYN-INTAKE-D2-LATER",
  "SYN-INTAKE-E-NORESP",
  "SYN-INTAKE-F-CONF",
  "SYN-INTAKE-G-MEASURE",
];

const REAL_ORG_BANS = [
  "spacex",
  "starlink",
  "oneweb",
  "eutelsat",
  "iridium",
  "ksat",
  "traficom",
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
  assert(existsSync(FIXTURE), "synthetic intake fixture missing");
  assert(existsSync(PACK), "P5-S2 pack must still exist");

  const pack = JSON.parse(readFileSync(PACK, "utf8")) as {
    id: string;
    relationships: { id: string }[];
    unknownRelationships: { id: string }[];
  };
  assert(pack.id === "nordic-lapland-dual-path-v0", "pack id drift");
  const packRelIds = new Set(pack.relationships.map((r) => r.id));
  const packUnkIds = new Set(pack.unknownRelationships.map((u) => u.id));

  const catalog = JSON.parse(readFileSync(FIXTURE, "utf8")) as {
    isSyntheticCatalog: boolean;
    entersProductionAssessment: boolean;
    containsScoreOrProbability: boolean;
    writesToNeon: boolean;
    cases: EvidenceIntakeRecord[];
  };

  assert(catalog.isSyntheticCatalog === true, "catalog must be synthetic");
  assert(catalog.entersProductionAssessment === false, "no production assessment");
  assert(catalog.containsScoreOrProbability === false, "no scores");
  assert(catalog.writesToNeon === false, "no Neon");

  const cases = catalog.cases;
  assert(cases.length >= 7, "expected synthetic cases A–G");
  const byId = new Map(cases.map((c) => [c.intakeId, c]));
  for (const id of REQUIRED_CASE_IDS) {
    assert(byId.has(id), `missing required case ${id}`);
  }

  for (const rec of cases) {
    assert(rec.schemaVersion === EVIDENCE_INTAKE_SCHEMA, `${rec.intakeId} schema`);
    assert(rec.isSynthetic === true, `${rec.intakeId} must be synthetic`);
    assert(!!rec.syntheticLabel && /synthetic/i.test(rec.syntheticLabel), `${rec.intakeId} syntheticLabel`);
    assert(rec.relatedEnvelope === "nordic-lapland-dual-path-v0", `${rec.intakeId} envelope`);
    assert(rec.entersProductionAssessment === false, `${rec.intakeId} production flag`);
    assert(rec.containsScoreOrProbability === false, `${rec.intakeId} score flag`);
    assert(rec.writesToNeon === false, `${rec.intakeId} neon flag`);

    // Maturity ≠ status: both fields present and typed
    assert(typeof rec.maturityLevel === "string", `${rec.intakeId} maturityLevel`);
    assert(typeof rec.evidenceStatus === "string", `${rec.intakeId} evidenceStatus`);
    assert(typeof rec.lifecycleState === "string", `${rec.intakeId} lifecycleState`);
    assert(
      rec.evidenceStatus === rec.lifecycleState,
      `${rec.intakeId}: evidenceStatus should mirror lifecycleState at rest`
    );

    for (const cid of rec.claimIds) {
      assert(KNOWN_CLAIMS.has(cid), `${rec.intakeId}: unknown claim id ${cid}`);
    }
    for (const rid of rec.relationshipIds) {
      assert(packRelIds.has(rid), `${rec.intakeId}: relationship ${rid} not in P5-S2 pack`);
    }
    for (const u of rec.whatRemainsUnknown) {
      assert(
        packUnkIds.has(u) || KNOWN_CLAIMS.has(u) || u.startsWith("unk-") || u.startsWith("CLAIM-"),
        `${rec.intakeId}: unexpected unknown ref ${u}`
      );
    }

    assert(!!rec.geographicScope?.label && !!rec.geographicScope?.precision, `${rec.intakeId} geo scope`);
    assert(!!rec.technicalScope, `${rec.intakeId} technical scope`);
    assert(!!rec.assessmentNotes, `${rec.intakeId} assessment notes`);
    assert(!!rec.claimAssessment?.exactClaimSupported, `${rec.intakeId} exact claim`);
    assert(!!rec.claimAssessment?.limitations, `${rec.intakeId} limitations`);

    if (rec.lifecycleState !== "no_response" && rec.lifecycleState !== "declined") {
      // substantive paths need source reference
      assert(!!rec.evidenceSourceReference, `${rec.intakeId} source reference`);
    }

    const histErr = assertValidHistory(rec.lifecycleHistory);
    assert(!histErr, `${rec.intakeId}: ${histErr}`);
    assert(
      historyEndsWith(rec.lifecycleHistory, rec.lifecycleState),
      `${rec.intakeId}: history must end at lifecycleState`
    );

    const supportErr = supportMustNotFollowNoResponseOrDeclined(rec);
    assert(!supportErr, supportErr ?? "");

    // Dates: if received, dateReceived required except pure no_response
    if (rec.lifecycleHistory.some((h) => h.to === "received")) {
      assert(!!rec.dateReceived, `${rec.intakeId}: dateReceived required after received`);
    }

    // No real org attribution in synthetic responding category
    const orgLower = rec.respondingOrganisationCategory.toLowerCase();
    for (const ban of REAL_ORG_BANS) {
      assert(
        !orgLower.includes(ban),
        `${rec.intakeId}: respondingOrganisationCategory must not name real org (${ban})`
      );
    }

    // Confidential / restricted controls
    if (rec.accessClassification === "confidential" || rec.accessClassification === "restricted") {
      assert(!!rec.restrictedHandle, `${rec.intakeId}: restrictedHandle required`);
      assert(!!rec.publicSummary, `${rec.intakeId}: publicSummary required`);
      const blob = JSON.stringify(rec).toLowerCase();
      assert(!blob.includes("password"), `${rec.intakeId}: password-like content banned`);
      assert(!blob.includes("api_key"), `${rec.intakeId}: api_key banned`);
      assert(!blob.includes("bearer "), `${rec.intakeId}: bearer token banned`);
    }

    // Support states must list remaining unknowns for envelope honesty (except pure contradiction pair may list one)
    if (TERMINAL_SUPPORT_STATES.has(rec.lifecycleState as IntakeLifecycleState)) {
      assert(rec.whatRemainsUnknown.length > 0, `${rec.intakeId}: support must still list UNKNOWN residues`);
    }

    if (NON_SUPPORT_TERMINALS.has(rec.lifecycleState) && rec.lifecycleState === "no_response") {
      assert(rec.maturityLevel === "none", `${rec.intakeId}: no_response → maturity none`);
      assert(
        /none/i.test(rec.claimAssessment.exactClaimSupported),
        `${rec.intakeId}: no_response must not claim support`
      );
    }
  }

  // Case-specific expectations
  const a = byId.get("SYN-INTAKE-A-ARCH")!;
  assert(a.maturityLevel === "L3", "A maturity L3");
  assert(a.whatRemainsUnknown.includes("unk-lapland-to-any-gateway"), "A keeps serving path unknown");

  const b = byId.get("SYN-INTAKE-B-FACILITY")!;
  assert(b.maturityLevel === "L3", "B maturity");
  assert(b.whatRemainsUnknown.includes("unk-customer-routing"), "B routing unknown");

  const c = byId.get("SYN-INTAKE-C-SITE")!;
  assert(c.maturityLevel === "L4", "C maturity L4");
  assert(c.lifecycleState === "partially_supported", "C partial");
  assert(c.whatRemainsUnknown.includes("unk-shared-backhaul"), "C backhaul unknown");

  const d1 = byId.get("SYN-INTAKE-D1-EARLIER")!;
  const d2 = byId.get("SYN-INTAKE-D2-LATER")!;
  assert(d1.lifecycleState === "contradicted" && d2.lifecycleState === "contradicted", "D contradicted");
  assert(d1.contradictsIntakeIds.includes(d2.intakeId), "D1 links D2");
  assert(d2.contradictsIntakeIds.includes(d1.intakeId), "D2 links D1");
  assert(d2.qualifiesIntakeIds.includes(d1.intakeId), "D2 qualifies without delete");
  assert(String(d1.publicationDate) < String(d2.publicationDate), "D earlier < later pub");

  const e = byId.get("SYN-INTAKE-E-NORESP")!;
  assert(e.lifecycleState === "no_response", "E no_response");
  assert(e.dateReceived === null, "E no received date");

  const f = byId.get("SYN-INTAKE-F-CONF")!;
  assert(f.accessClassification === "confidential", "F confidential");
  assert(!!f.restrictedHandle && !!f.publicSummary, "F handle+summary");

  const g = byId.get("SYN-INTAKE-G-MEASURE")!;
  assert(g.maturityLevel === "L5", "G L5");
  assert(g.whatRemainsUnknown.includes("unk-e2e-independence"), "G no independence proof");

  // Isolation from scoring / production
  const intakeMod = readFileSync(join(process.cwd(), "lib/research/evidence-intake.ts"), "utf8");
  assert(
    !intakeMod.includes('from "@/lib/deterministic-score"') &&
      !intakeMod.includes('from "@/lib/scoring"') &&
      !intakeMod.includes("@neondatabase"),
    "intake module must not import scoring or Neon"
  );

  // P5-S2 pack not modified by this sprint's fixture (relationship count sanity)
  assert(pack.relationships.length === 12, "P5-S2 relationship count should remain 12");
  assert(pack.unknownRelationships.length === 8, "P5-S2 UNKNOWN count should remain 8");

  console.log("OK: evidence intake synthetic validation passed");
  console.log(`  cases=${cases.length} homepage=${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
  console.log("  P5-S2 pack untouched; no Signature; no Neon.");
}

main();

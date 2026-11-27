/**
 * P6-S9 evidence binder integrity checks.
 * Deterministic · no live model APIs · does not mutate packs or Neon.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "../lib/hero-demo";
import { resetAnnotationStoreForTests } from "../lib/research/evidence-annotation-store";
import {
  EVIDENCE_BINDER_EXPORT_SCHEMA,
  EVIDENCE_BINDER_SCHEMA,
  associateEvidenceWithAssessment,
  binderIntegrityViolations,
  buildEvidenceExportCompanion,
  distinguishAssessmentEvidence,
  evidenceForAssessment,
  evidenceForLabScenario,
  evidenceForLibrarySlug,
  formatEvidenceExportCompanionMarkdown,
  getEvidenceBinderRecord,
  listCatalogEvidenceBinderRecords,
  listEvidenceBinderRecords,
  listPublicEvidence,
  listSyntheticEvidence,
  listUnresolvedConflicts,
  missingEvidenceForSession,
  recordsWithMissingMetadata,
} from "../lib/research/evidence-binder";
import {
  buildEvidenceBinderHref,
  homepageRegressionSession,
} from "../lib/research/workflow-context";
import { exportAssessmentMarkdown, type SavedResearchAssessment } from "../lib/research-workspace";
import { MODEL_VERSION } from "../lib/model-constants";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

function main(): void {
  assert(
    HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B",
    "Homepage regression must remain 83 · B"
  );

  // Isolate from P6-S10 annotation memory left by other scripts
  resetAnnotationStoreForTests();

  const all = listCatalogEvidenceBinderRecords();
  assert(all.length > 0, "binder catalog non-empty");
  assert(
    all.every((r) => r.schema === EVIDENCE_BINDER_SCHEMA),
    "schema stamp"
  );
  assert(listEvidenceBinderRecords().length === all.length, "empty annotations merge");

  // Creation / retrieval
  const first = all[0];
  assert(getEvidenceBinderRecord(first.id)?.id === first.id, "retrieve by id");

  // Provenance — every record has provenance notes
  assert(
    all.every((r) => r.provenanceNotes.trim().length > 0),
    "provenance notes present"
  );

  // Public vs synthetic
  const synthetic = listSyntheticEvidence();
  const pub = listPublicEvidence();
  assert(synthetic.length > 0, "synthetic records exist");
  assert(pub.length > 0, "public records exist");
  assert(
    synthetic.every((r) => /SYNTHETIC|synthetic/i.test(r.title + r.provenanceNotes)),
    "synthetic visibly labelled"
  );
  assert(
    !synthetic.some((r) => r.verificationStatus === ("independently_validated" as never)),
    "no independent validation claim on synthetic"
  );

  // Missing metadata remains unspecified (library notes omit dates)
  const missingMeta = recordsWithMissingMetadata();
  assert(missingMeta.length > 0, "some records omit publication/retrieval dates");
  const libNote = all.find((r) => r.id.startsWith("lib:"));
  assert(libNote, "library-derived records exist");
  assert(libNote!.publicationDate === undefined, "library note publication not invented");
  assert(libNote!.retrievalDate === undefined, "library note retrieval not invented");

  // Conflicting evidence identifiable
  const conflicts = listUnresolvedConflicts();
  assert(conflicts.length >= 1, "conflict pair retained");
  const conflictA = getEvidenceBinderRecord("synthetic:conflict:path-a");
  const conflictB = getEvidenceBinderRecord("synthetic:conflict:path-b");
  assert(conflictA && conflictB, "conflict records present");
  assert(conflictA!.contradictsIds.includes(conflictB!.id), "A points to B");
  assert(conflictB!.contradictsIds.includes(conflictA!.id), "B points to A");

  // Evidence-to-dependency / lab association
  const fixtureB = evidenceForLabScenario("fixture-b-starlink-iridium");
  assert(fixtureB.length > 0, "fixture-b binder association");
  assert(
    fixtureB.every((r) => r.associations.labScenarioId === "fixture-b-starlink-iridium"),
    "lab scenario association"
  );

  const pack = evidenceForLabScenario("nordic-lapland-dual-path-v0");
  assert(pack.length > 0, "read-only pack evidence in binder");
  assert(
    pack.every((r) => r.origin === "PUBLIC" || r.origin === "SYNTHETIC"),
    "pack origins classified"
  );

  // Library association
  const libHits = evidenceForLibrarySlug("finnish-arctic-mining-kittila");
  assert(libHits.length > 0, "library slug association");

  // Assessment association (non-mutating helper)
  const linked = associateEvidenceWithAssessment(fixtureB[0], "assessment-test-1");
  assert(linked.associations.assessmentId === "assessment-test-1", "assessment association");
  assert(
    evidenceForAssessment("assessment-test-1").length === 0,
    "catalog itself not silently overwritten"
  );

  // UNKNOWN preservation
  const hero = homepageRegressionSession();
  const unknownSession = { ...hero, providers: [] as string[], linkedAssessmentId: undefined };
  const missing = missingEvidenceForSession(unknownSession);
  assert(
    missing.some((m) => /UNKNOWN|providers/i.test(m)),
    "UNKNOWN providers preserved as missing"
  );
  assert(
    missing.some((m) => /No linked assessment/i.test(m)),
    "missing assessment flagged"
  );

  // Integrity: no duplicates, no unlabelled synthetic, no forbidden validation
  const violations = binderIntegrityViolations();
  assert(violations.length === 0, `integrity violations: ${violations.join(", ")}`);

  // Report references
  const distinction = distinguishAssessmentEvidence({
    session: hero,
    labScenarioId: "fixture-b-starlink-iridium",
  });
  assert(distinction.evidenceSupported.length > 0, "evidence-supported findings");
  assert(distinction.assumptions.length > 0, "assumptions listed");
  assert(distinction.unknownDependencies.length > 0, "UNKNOWN deps listed");

  const fakeAssessment: SavedResearchAssessment = {
    id: "binder-report-test",
    title: "Binder report test",
    savedAt: new Date().toISOString(),
    depth: "abbreviated",
    inputs: {
      lat: 67,
      lng: 26,
      sector: "mining",
      autonomy_level: "remote_operated",
      operation_criticality: "high",
    },
  };
  const md = exportAssessmentMarkdown(fakeAssessment);
  assert(/Evidence associations and distinctions/i.test(md), "report binder section");
  assert(/infrastructure independence/i.test(md), "non-independence disclaimer");
  assert(!/cryptographic verification/i.test(md), "no crypto claim in assessment export");

  // Export companion integrity
  const companion = buildEvidenceExportCompanion({
    session: hero,
    assessment: fakeAssessment,
  });
  assert(companion.schema === EVIDENCE_BINDER_EXPORT_SCHEMA, "companion schema");
  assert(companion.model.version === MODEL_VERSION, "model version locked");
  assert(/Non-certifying/i.test(companion.nonCertifyingNotice), "non-certifying notice");
  assert(companion.homepageRegressionLock === "83 · B", "homepage lock in companion");
  assert(Array.isArray(companion.unknownFields), "unknown fields array");
  assert(Array.isArray(companion.assumptions), "assumptions array");
  assert(Array.isArray(companion.evidenceReferences), "evidence references");
  const companionMd = formatEvidenceExportCompanionMarkdown(companion);
  assert(/Evidence Export Companion/i.test(companionMd), "companion markdown");
  assert(/Non-certifying/i.test(companionMd), "companion disclaimer");

  // Navigation / return context
  const href = buildEvidenceBinderHref(hero);
  assert(href.includes("from=workflow"), "binder href from workflow");
  assert(href.includes("binder=1"), "binder focus");
  assert(href.includes("lab=fixture-b-starlink-iridium"), "lab context preserved");
  assert(href.includes("#evidence-binder"), "deep-link anchor");

  // Pack file must remain unmodified (content hash of known id string)
  const packPath = join(
    process.cwd(),
    "docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/pack.json"
  );
  const packRaw = readFileSync(packPath, "utf8");
  assert(packRaw.includes('"id": "nordic-lapland-dual-path-v0"'), "pack still present");
  assert(packRaw.includes('"packKind": "public_evidence_pack"'), "pack kind intact");

  // Protected scoring engine string still present in deterministic module
  const scoreSrc = readFileSync(join(process.cwd(), "lib/model-constants.ts"), "utf8");
  assert(scoreSrc.includes('MODEL_VERSION = "gryps-signature-v0.4"'), "Model v0.4 unchanged");

  console.log("OK evidence-binder");
  console.log(`  records=${all.length} public=${pub.length} synthetic=${synthetic.length}`);
  console.log(`  conflicts=${conflicts.length} missingMeta=${missingMeta.length}`);
  console.log(`  fixture-b=${fixtureB.length} pack=${pack.length}`);
}

main();

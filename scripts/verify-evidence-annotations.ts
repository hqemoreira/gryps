/**
 * P6-S10 persistent USER_SUPPLIED annotations + assessment associations.
 * Deterministic · local memory store · no live APIs · no Neon.
 */
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "../lib/hero-demo";
import { MODEL_VERSION } from "../lib/model-constants";
import {
  associateEvidenceToAssessment,
  createAnnotation,
  disassociateEvidenceFromAssessment,
  emptyAnnotationStore,
  getAnnotation,
  listAnnotations,
  listAssociations,
  listAssociationsForAssessment,
  loadAnnotationStore,
  parseAnnotationStore,
  removeAnnotation,
  resetAnnotationStoreForTests,
  saveAnnotationStore,
  setAssociationSupportIntent,
  updateAnnotation,
  EVIDENCE_ANNOTATION_STORE_SCHEMA,
} from "../lib/research/evidence-annotation-store";
import {
  buildEvidenceExportCompanion,
  distinguishAssessmentEvidence,
  formatEvidenceExportCompanionMarkdown,
  getEvidenceBinderRecord,
  listAssociatedEvidenceForAssessment,
  listCatalogEvidenceBinderRecords,
  listEvidenceBinderRecords,
} from "../lib/research/evidence-binder";
import {
  exportAssessmentMarkdown,
  type SavedResearchAssessment,
} from "../lib/research-workspace";
import { WORKSPACE_STORAGE_KEY } from "../lib/research-workspace";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

function sampleAssessment(id: string, title: string): SavedResearchAssessment {
  return {
    id,
    title,
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
}

function main(): void {
  assert(HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B", "homepage 83 · B");

  resetAnnotationStoreForTests();
  assert(listAnnotations().length === 0, "store starts empty");

  // --- Annotation management ---
  const a1 = createAnnotation({
    title: "Site note A",
    description: "Observed dual terminal placement (research note).",
    dependencyIds: ["dep-terminal-a"],
  });
  assert(a1.origin === "USER_SUPPLIED", "origin USER_SUPPLIED");
  assert(a1.verificationStatus === "unverified", "unverified");
  assert(/USER_SUPPLIED/i.test(a1.provenanceNotes), "provenance labelled");
  assert(a1.documentReference === undefined, "optional metadata omitted");
  assert(a1.dateSupplied === undefined, "optional date not invented");
  assert(a1.id.startsWith("ann_"), "stable id prefix");

  const a1Again = getAnnotation(a1.id);
  assert(a1Again?.title === "Site note A", "retrieve annotation");

  const edited = updateAnnotation(a1.id, {
    title: "Site note A (edited)",
    description: "Updated observation.",
  });
  assert(edited?.title === "Site note A (edited)", "edit title");
  assert((edited?.history?.length ?? 0) >= 1, "history snapshot retained");
  assert(edited?.origin === "USER_SUPPLIED", "origin unchanged after edit");

  // Confirm deletion behaviour
  assert(removeAnnotation(a1.id, false) === false, "delete without confirm rejected");
  assert(getAnnotation(a1.id), "still present without confirm");
  assert(removeAnnotation(a1.id, true) === true, "delete with confirm");
  assert(!getAnnotation(a1.id), "removed after confirm");

  // Recreate for persistence / association tests
  const ann = createAnnotation({
    title: "Reload note",
    description: "Persisted annotation for round-trip.",
    sourceUrl: "https://example.test/note",
  });
  const catalogId = listCatalogEvidenceBinderRecords().find((r) => r.origin === "PUBLIC")?.id;
  assert(catalogId, "catalog public record exists");

  // --- Persistence: save/reload ---
  const snap = loadAnnotationStore();
  assert(snap.schema === EVIDENCE_ANNOTATION_STORE_SCHEMA, "store schema");
  const raw = JSON.stringify(snap);
  resetAnnotationStoreForTests();
  assert(listAnnotations().length === 0, "cleared");
  const restored = parseAnnotationStore(raw);
  saveAnnotationStore(restored);
  assert(listAnnotations().some((a) => a.id === ann.id), "reload restores annotation");
  assert(listAnnotations().filter((a) => a.id === ann.id).length === 1, "no duplicate after reload");

  // Repeated save without duplicates
  saveAnnotationStore(loadAnnotationStore());
  saveAnnotationStore(loadAnnotationStore());
  assert(listAnnotations().filter((a) => a.id === ann.id).length === 1, "repeated save no dupes");

  // Older / malformed compatibility
  assert(parseAnnotationStore(null).annotations.length === 0, "null → empty");
  assert(parseAnnotationStore("not-json").annotations.length === 0, "malformed → empty");
  assert(parseAnnotationStore("[]").annotations.length === 0, "array rejected");
  assert(
    parseAnnotationStore(JSON.stringify({ schema: "other-v9", annotations: [{ id: "x" }] }))
      .annotations.length === 0,
    "unknown schema → empty"
  );
  // Partial annotation objects skipped
  const partial = parseAnnotationStore(
    JSON.stringify({
      schema: EVIDENCE_ANNOTATION_STORE_SCHEMA,
      annotations: [{ id: "bad" }, { id: "ok1", title: "Ok" }],
      associations: [],
    })
  );
  assert(partial.annotations.length === 1 && partial.annotations[0].id === "ok1", "partial skip");

  // Isolation from workspace assessment key — writing annotation store must not use workspace key
  assert(
    String(WORKSPACE_STORAGE_KEY) !== "gryps-evidence-annotation-store-v0",
    "keys isolated"
  );

  // --- Assessment associations ---
  const assessA = "assessment-a";
  const assessB = "assessment-b";
  const link1 = associateEvidenceToAssessment(assessA, ann.id, "linked for research");
  assert(link1.linkKind === "associated", "linkKind associated not support");
  assert(link1.supportIntent === "none", "associate does not infer support intent");
  const intent = setAssociationSupportIntent(assessA, ann.id, "supports_finding");
  assert(intent?.supportIntent === "supports_finding", "explicit support intent");
  associateEvidenceToAssessment(assessA, catalogId!);
  // Reuse same evidence across assessments
  associateEvidenceToAssessment(assessB, ann.id);
  assert(listAssociationsForAssessment(assessA).length === 2, "A has two links");
  assert(listAssociationsForAssessment(assessB).length === 1, "B has one link");
  assert(listAssociationsForEvidenceCount(ann.id) === 2, "evidence reused across assessments");

  // Idempotent associate
  associateEvidenceToAssessment(assessA, ann.id);
  assert(listAssociationsForAssessment(assessA).length === 2, "idempotent associate");

  // Remove association without deleting evidence
  assert(disassociateEvidenceFromAssessment(assessA, catalogId!) === true, "disassociate");
  assert(getEvidenceBinderRecord(catalogId!), "catalog evidence retained");
  assert(getAnnotation(ann.id), "annotation retained after disassociate");
  assert(listAssociationsForAssessment(assessA).length === 1, "one link left on A");

  // Reload preserves associations
  const mid = loadAnnotationStore();
  resetAnnotationStoreForTests();
  saveAnnotationStore(mid);
  assert(listAssociationsForAssessment(assessA).some((l) => l.evidenceId === ann.id), "assoc reload");

  // Missing evidence reference handled
  associateEvidenceToAssessment(assessA, "missing-evidence-id-xyz");
  const linked = listAssociatedEvidenceForAssessment(assessA);
  assert(
    linked.some((x) => x.missing && x.record.id === "missing-evidence-id-xyz"),
    "missing ref visible"
  );

  // Binder merge shows USER_SUPPLIED
  const merged = listEvidenceBinderRecords();
  assert(merged.some((r) => r.id === ann.id && r.origin === "USER_SUPPLIED"), "merged binder");
  assert(/^USER_SUPPLIED/i.test(getEvidenceBinderRecord(ann.id)!.title), "title labelled");

  // --- Export integrity ---
  const assessment = sampleAssessment(assessA, "Export round-trip assessment");
  // Ensure association present
  associateEvidenceToAssessment(assessA, ann.id);
  const distinction = distinguishAssessmentEvidence({ assessment });
  assert(distinction.associated.some((r) => r.id === ann.id), "export associated includes ann");
  assert(distinction.userSupplied.some((r) => r.id === ann.id), "userSupplied distinct");
  assert(
    distinction.assumptions.some((x) => /Association with an assessment/i.test(x)),
    "association ≠ support assumption"
  );

  const md = exportAssessmentMarkdown(assessment);
  assert(/Associated evidence \(persisted\)/i.test(md), "export associated section");
  assert(md.includes(ann.id), "export retains evidence id");
  assert(/USER_SUPPLIED/i.test(md), "USER_SUPPLIED distinct in export");
  assert(/infrastructure independence/i.test(md), "non-independence disclaimer");
  assert(/Association with an assessment does not mean/i.test(md), "assoc disclaimer");

  // Save → reload → export round trip
  const storeBeforeExport = loadAnnotationStore();
  resetAnnotationStoreForTests();
  saveAnnotationStore(storeBeforeExport);
  const md2 = exportAssessmentMarkdown(assessment);
  assert(md2.includes(ann.id), "round-trip export retains id");

  const companion = buildEvidenceExportCompanion({ assessment });
  assert(companion.model.version === MODEL_VERSION, "companion model version");
  assert(companion.evidenceReferences.some((e) => e.id === ann.id), "companion refs annotation");
  assert(/Non-certifying/i.test(companion.nonCertifyingNotice), "non-certifying");
  const companionMd = formatEvidenceExportCompanionMarkdown(companion);
  assert(/USER_SUPPLIED/i.test(companionMd), "companion marks USER_SUPPLIED");

  // Synthetic still distinct in catalog path
  const synthetic = listCatalogEvidenceBinderRecords().filter((r) => r.origin === "SYNTHETIC");
  assert(synthetic.length > 0, "synthetic catalog remains");
  assert(
    synthetic.every((r) => /SYNTHETIC|synthetic/i.test(r.title + r.provenanceNotes)),
    "synthetic labelled"
  );

  // Conflicts remain visible in catalog
  assert(
    listCatalogEvidenceBinderRecords().some((r) => r.contradictsIds.length > 0),
    "conflicts retained"
  );

  // Empty store helper
  assert(emptyAnnotationStore().annotations.length === 0, "empty helper");
  assert(listAssociations().every((l) => l.linkKind === "associated"), "all links associated");

  console.log("OK evidence-annotations");
  console.log(`  annotations=${listAnnotations().length} associations=${listAssociations().length}`);
  console.log(`  homepage=${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
}

function listAssociationsForEvidenceCount(evidenceId: string): number {
  return listAssociations().filter((a) => a.evidenceId === evidenceId).length;
}

main();

/**
 * P6-S11 end-to-end research workflow integrity.
 * Deterministic · no live AI · no Neon · Model v0.4 unchanged.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { HERO_DEMO_GRADE, HERO_DEMO_INPUT, HERO_DEMO_SCORE } from "../lib/hero-demo";
import { MODEL_VERSION } from "../lib/model-constants";
import {
  associateEvidenceToAssessment,
  createAnnotation,
  listAssociationsForAssessment,
  resetAnnotationStoreForTests,
  setAssociationSupportIntent,
} from "../lib/research/evidence-annotation-store";
import {
  auditStageMatrix,
  assertExportDistinctions,
  assertJourneyHomepageRegression,
  assertStaleLinkNotSubstituted,
  simulateSevenStageJourney,
} from "../lib/research/workflow-integrity";
import {
  buildAdvisorHref,
  buildDependencyLabHref,
  buildEvidenceBinderHref,
  buildWorkspaceHref,
  emptyWorkflowSession,
  findMatchingSavedAssessment,
  homepageRegressionSession,
  resolveLinkedAssessment,
  stageStatus,
} from "../lib/research/workflow-context";
import { exportAssessmentMarkdown } from "../lib/research-workspace";
import { listCatalogEvidenceBinderRecords } from "../lib/research/evidence-binder";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

function main(): void {
  assert(HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B", "homepage 83 · B");
  resetAnnotationStoreForTests();

  // --- Full seven-stage journey ---
  const journey = simulateSevenStageJourney();
  assert(assertJourneyHomepageRegression(journey), "journey preserves homepage regression inputs");
  assert(journey.stageStatuses.site === "complete", "site complete");
  assert(journey.stageStatuses.scenario === "complete", "scenario complete");
  assert(journey.stageStatuses.dependencies === "complete", "dependencies complete");
  assert(journey.stageStatuses.evidence === "complete", "evidence complete");
  assert(journey.stageStatuses.assessment === "complete", "assessment complete");
  assert(journey.stageStatuses.comparison === "complete", "comparison complete");
  assert(journey.stageStatuses.report === "complete", "report complete");
  assert(journey.associationCount >= 1, "journey has associations");
  assert(journey.supportIntents.includes("supports_finding"), "explicit support intent set");

  const matrix = auditStageMatrix(journey);
  assert(matrix.length === 7, "seven stage audit rows");
  assert(
    matrix.every((r) => r.status === "PASS"),
    `stage audit: ${matrix
      .filter((r) => r.status !== "PASS")
      .map((r) => `${r.stage}:${r.status}`)
      .join(", ")}`
  );

  // --- Navigation / context preservation ---
  const hero = homepageRegressionSession();
  assert(buildAdvisorHref(hero).includes("lat=67"), "advisor lat");
  assert(buildAdvisorHref(hero).includes("from=workflow"), "advisor from");
  assert(buildDependencyLabHref(hero).includes("lab=fixture-b"), "lab context");
  assert(buildEvidenceBinderHref(hero).includes("binder=1"), "binder focus");
  assert(buildWorkspaceHref(hero, "compare").includes("mode=compare"), "compare mode");
  assert(buildWorkspaceHref(hero, "export").includes("mode=export"), "export mode");

  // --- Opening pages does not auto-complete ---
  const fresh = emptyWorkflowSession();
  fresh.lat = String(HERO_DEMO_INPUT.lat);
  fresh.lng = String(HERO_DEMO_INPUT.lng);
  assert(stageStatus(fresh, "site", 0) === "ready", "fields alone ≠ complete without stage flag");
  assert(stageStatus(fresh, "dependencies", 0) === "unavailable", "deps unavailable before save");

  // --- Stale assessment isolation ---
  assert(assertStaleLinkNotSubstituted(), "stale link not complete / not substituted");
  const staleSession = homepageRegressionSession();
  staleSession.linkedAssessmentId = "gone";
  staleSession.stages.assessmentLinked = true;
  assert(
    resolveLinkedAssessment(staleSession, ["alive"]).status === "stale",
    "resolve stale"
  );
  assert(
    stageStatus(staleSession, "report", 2, ["alive"]) === "unavailable",
    "report unavailable when link stale"
  );

  // --- Assessment isolation / match ---
  const match = findMatchingSavedAssessment(hero, [
    {
      id: "ok",
      title: "ok",
      inputs: {
        lat: HERO_DEMO_INPUT.lat,
        lng: HERO_DEMO_INPUT.lng,
        sector: HERO_DEMO_INPUT.sector,
        autonomy_level: HERO_DEMO_INPUT.autonomy,
        operation_criticality: HERO_DEMO_INPUT.criticality,
      },
    },
    {
      id: "other",
      title: "other",
      inputs: {
        lat: 60,
        lng: 24,
        sector: "forestry",
        autonomy_level: HERO_DEMO_INPUT.autonomy,
        operation_criticality: HERO_DEMO_INPUT.criticality,
      },
    },
  ]);
  assert(match?.id === "ok", "match prefers intended assessment");

  // --- Association + support intent integrity ---
  resetAnnotationStoreForTests();
  const ann = createAnnotation({ title: "S11 note", description: "obs" });
  const link = associateEvidenceToAssessment("assess-1", ann.id);
  assert(link.supportIntent === "none", "associate defaults intent none");
  const set = setAssociationSupportIntent("assess-1", ann.id, "assumption_only");
  assert(set?.supportIntent === "assumption_only", "explicit intent");
  assert(
    listAssociationsForAssessment("assess-1")[0].supportIntent === "assumption_only",
    "intent persists"
  );
  // Classification unchanged
  assert(ann.origin === "USER_SUPPLIED", "origin unchanged by intent");

  // Multi-assessment reuse
  associateEvidenceToAssessment("assess-2", ann.id);
  assert(listAssociationsForAssessment("assess-1").length === 1, "A isolated");
  assert(listAssociationsForAssessment("assess-2").length === 1, "B isolated");
  assert(
    listAssociationsForAssessment("assess-2")[0].supportIntent === "none",
    "B intent independent"
  );

  // --- Export completeness ---
  const assess = journey.assessments[0];
  const md = exportAssessmentMarkdown(assess);
  assert(/Associated evidence \(persisted\)/i.test(md), "export associated");
  assert(/Explicit support intent/i.test(md), "export support intent");
  assert(/USER_SUPPLIED/i.test(md), "export USER_SUPPLIED");
  assert(/Assumptions/i.test(md), "export assumptions");
  assert(/Missing evidence/i.test(md), "export missing");
  assert(/UNKNOWN/i.test(md), "export UNKNOWN");
  assert(/infrastructure independence/i.test(md), "non-independence");
  assert(md.includes(MODEL_VERSION) || /v0\.4|gryps-signature-v0\.4/i.test(md), "model version");
  const gaps = assertExportDistinctions(assess.id);
  assert(gaps.length === 0, `export distinction gaps: ${gaps.join(",")}`);

  // --- USER_SUPPLIED / SYNTHETIC / conflicts ---
  assert(
    listCatalogEvidenceBinderRecords().some((r) => r.origin === "SYNTHETIC"),
    "synthetic retained"
  );
  assert(
    listCatalogEvidenceBinderRecords().some((r) => r.contradictsIds.length > 0),
    "conflicts retained"
  );

  // --- Static navigation honesty ---
  const workflowView = readFileSync(
    join(process.cwd(), "components/ResearchWorkflowView.tsx"),
    "utf8"
  );
  assert(workflowView.includes("STALE"), "stale banner in workflow UI");
  assert(workflowView.includes("Clear stale link"), "clear stale control");
  assert(workflowView.includes("Counts do not mark this stage complete"), "assoc count honesty");
  assert(
    !workflowView.includes("@/lib/deterministic-score"),
    "workflow must not import scoring engine"
  );

  const workspaceView = readFileSync(
    join(process.cwd(), "components/ResearchWorkspaceView.tsx"),
    "utf8"
  );
  assert(/substitute assessment was selected/i.test(workspaceView), "workspace stale");
  assert(/will not silently substitute/i.test(workspaceView), "compare stale");

  console.log("OK workflow-integrity");
  console.log(
    `  stages=${matrix.map((m) => `${m.stage}:${m.status}`).join(" · ")}`
  );
  console.log(`  homepage=${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE} · model=${MODEL_VERSION}`);
}

main();

/**
 * P6-S11 — End-to-end research workflow integrity helpers.
 * Deterministic checks over session + workspace + annotation store.
 * Does not import scoring engines or Neon.
 */

import {
  associateEvidenceToAssessment,
  createAnnotation,
  listAssociationsForAssessment,
  setAssociationSupportIntent,
  type EvidenceSupportIntent,
} from "@/lib/research/evidence-annotation-store";
import {
  distinguishAssessmentEvidence,
  listAssociatedEvidenceForAssessment,
} from "@/lib/research/evidence-binder";
import {
  WORKFLOW_STAGES,
  buildAdvisorHref,
  buildDependencyLabHref,
  buildEvidenceBinderHref,
  buildWorkspaceHref,
  emptyWorkflowSession,
  findMatchingSavedAssessment,
  homepageRegressionSession,
  resolveLinkedAssessment,
  stageStatus,
  type ResearchWorkflowSession,
  type WorkflowStageId,
  type WorkflowStageStatus,
} from "@/lib/research/workflow-context";
import {
  exportAssessmentMarkdown,
  type SavedResearchAssessment,
} from "@/lib/research-workspace";
import { HERO_DEMO_GRADE, HERO_DEMO_INPUT, HERO_DEMO_SCORE } from "@/lib/hero-demo";
import { MODEL_VERSION } from "@/lib/model-constants";

export type StageAuditResult = {
  stage: WorkflowStageId;
  status: "PASS" | "PARTIAL" | "FAIL" | "NOT_APPLICABLE";
  notes: string;
};

export type JourneySnapshot = {
  session: ResearchWorkflowSession;
  assessments: SavedResearchAssessment[];
  stageStatuses: Record<WorkflowStageId, WorkflowStageStatus>;
  exportMarkdown: string;
  associationCount: number;
  supportIntents: EvidenceSupportIntent[];
};

/** Simulate the seven-stage journey with local in-memory assessments (no localStorage UI). */
export function simulateSevenStageJourney(): JourneySnapshot {
  let session = homepageRegressionSession();
  session = {
    ...session,
    stages: {
      ...session.stages,
      siteDefined: true,
      scenarioDefined: true,
      dependenciesReviewed: true,
      evidenceReviewed: true,
    },
  };

  const assessmentA: SavedResearchAssessment = {
    id: "journey-a",
    title: "Journey assessment A",
    savedAt: new Date().toISOString(),
    depth: "abbreviated",
    inputs: {
      lat: HERO_DEMO_INPUT.lat,
      lng: HERO_DEMO_INPUT.lng,
      sector: HERO_DEMO_INPUT.sector,
      autonomy_level: HERO_DEMO_INPUT.autonomy,
      operation_criticality: HERO_DEMO_INPUT.criticality,
    },
    abbreviated: {
      depth: "abbreviated",
      resilience_signature: {
        score: HERO_DEMO_SCORE,
        grade: HERO_DEMO_GRADE,
        summary: "Journey A summary",
      },
      modelVersion: MODEL_VERSION,
      top_risks: [],
      recommended: {
        provider: "Starlink + Iridium",
        type: "dual-path",
        confidence: 70,
        confidenceBand: "Medium",
        latencyEstimate: null,
        orbitalType: "LEO",
        why: "Homepage regression inputs",
      },
    },
  };
  const assessmentB: SavedResearchAssessment = {
    ...assessmentA,
    id: "journey-b",
    title: "Journey assessment B",
    inputs: {
      ...assessmentA.inputs,
      lat: 65,
      lng: 25,
      sector: "forestry",
    },
  };

  const match = findMatchingSavedAssessment(session, [assessmentA, assessmentB]);
  if (match?.id === assessmentA.id) {
    session = {
      ...session,
      linkedAssessmentId: assessmentA.id,
      stages: { ...session.stages, assessmentLinked: true },
    };
  }

  const assessments = [assessmentA, assessmentB];
  const ids = assessments.map((a) => a.id);

  // Evidence association + explicit support intent (not inferred)
  const ann = createAnnotation({
    title: "Journey USER_SUPPLIED note",
    description: "Researcher observation for journey integrity.",
  });
  associateEvidenceToAssessment(assessmentA.id, ann.id);
  setAssociationSupportIntent(assessmentA.id, ann.id, "supports_finding");

  session = {
    ...session,
    stages: { ...session.stages, comparisonReviewed: true, reportExported: true },
  };

  const stageStatuses = {} as Record<WorkflowStageId, WorkflowStageStatus>;
  for (const s of WORKFLOW_STAGES) {
    stageStatuses[s.id] = stageStatus(session, s.id, assessments.length, ids);
  }

  const exportMarkdown = exportAssessmentMarkdown(assessmentA);
  const links = listAssociationsForAssessment(assessmentA.id);

  return {
    session,
    assessments,
    stageStatuses,
    exportMarkdown,
    associationCount: links.length,
    supportIntents: links.map((l) => l.supportIntent),
  };
}

export function auditStageMatrix(snapshot?: JourneySnapshot): StageAuditResult[] {
  const snap = snapshot ?? simulateSevenStageJourney();
  const session = snap.session;
  const results: StageAuditResult[] = [];

  // Site
  results.push({
    stage: "site",
    status:
      session.stages.siteDefined &&
      Number(session.lat) === HERO_DEMO_INPUT.lat &&
      Number(session.lng) === HERO_DEMO_INPUT.lng
        ? "PASS"
        : "FAIL",
    notes: "Site coords preserved; complete only via explicit stage flag + fields",
  });

  // Scenario
  results.push({
    stage: "scenario",
    status:
      session.stages.scenarioDefined &&
      session.sector === HERO_DEMO_INPUT.sector &&
      session.autonomy === HERO_DEMO_INPUT.autonomy
        ? "PASS"
        : "FAIL",
    notes: "Scenario fields preserved; providers may be set without inventing UNKNOWN",
  });

  // Dependencies
  const labHref = buildDependencyLabHref(session);
  results.push({
    stage: "dependencies",
    status:
      session.stages.dependenciesReviewed &&
      labHref.includes("from=workflow") &&
      labHref.includes(`lab=${session.preferredLabScenario}`)
        ? "PASS"
        : "FAIL",
    notes: "Explicit ack required; deep-link preserves lab + from=workflow",
  });

  // Evidence
  const binderHref = buildEvidenceBinderHref(session);
  results.push({
    stage: "evidence",
    status:
      session.stages.evidenceReviewed &&
      binderHref.includes("binder=1") &&
      binderHref.includes("from=workflow")
        ? "PASS"
        : "FAIL",
    notes: "Explicit ack; binder deep-link; viewing does not auto-complete",
  });

  // Assessment
  const advisor = buildAdvisorHref(session);
  const linked = resolveLinkedAssessment(
    session,
    snap.assessments.map((a) => a.id)
  );
  results.push({
    stage: "assessment",
    status:
      linked.status === "linked" &&
      snap.stageStatuses.assessment === "complete" &&
      advisor.includes("from=workflow")
        ? "PASS"
        : "FAIL",
    notes: "Match-based link only; Advisor deep-link preserves inputs; stale not complete",
  });

  // Comparison
  const compareHref = buildWorkspaceHref(session, "compare");
  results.push({
    stage: "comparison",
    status:
      snap.assessments.length >= 2 &&
      snap.stageStatuses.comparison === "complete" &&
      compareHref.includes("mode=compare")
        ? "PASS"
        : "FAIL",
    notes: "Requires ≥2 assessments; explicit ack; intended assessments selected by user",
  });

  // Report
  const exportHref = buildWorkspaceHref(session, "export");
  const md = snap.exportMarkdown;
  const exportOk =
    /Explicit support intent/i.test(md) &&
    /USER_SUPPLIED/i.test(md) &&
    /infrastructure independence/i.test(md) &&
    md.includes(MODEL_VERSION);
  results.push({
    stage: "report",
    status:
      snap.stageStatuses.report === "complete" &&
      exportHref.includes("mode=export") &&
      exportOk
        ? "PASS"
        : "FAIL",
    notes: "Export reflects persisted associations + support intent + model version",
  });

  return results;
}

export function assertStaleLinkNotSubstituted(): boolean {
  const session = emptyWorkflowSession();
  session.linkedAssessmentId = "deleted-id";
  session.stages.assessmentLinked = true;
  session.stages.siteDefined = true;
  session.stages.scenarioDefined = true;
  session.lat = "67";
  session.lng = "26";
  const resolved = resolveLinkedAssessment(session, ["other-id"]);
  if (resolved.status !== "stale") return false;
  const status = stageStatus(session, "assessment", 1, ["other-id"]);
  return status === "ready";
}

export function assertJourneyHomepageRegression(snap: JourneySnapshot): boolean {
  return (
    HERO_DEMO_SCORE === 83 &&
    HERO_DEMO_GRADE === "B" &&
    Number(snap.session.lat) === HERO_DEMO_INPUT.lat &&
    Number(snap.session.lng) === HERO_DEMO_INPUT.lng &&
    snap.assessments[0]?.abbreviated?.resilience_signature.score === HERO_DEMO_SCORE
  );
}

export function assertExportDistinctions(assessmentId: string): string[] {
  const assessment: SavedResearchAssessment = {
    id: assessmentId,
    title: "Export check",
    savedAt: new Date().toISOString(),
    depth: "abbreviated",
    inputs: {
      lat: HERO_DEMO_INPUT.lat,
      lng: HERO_DEMO_INPUT.lng,
      sector: HERO_DEMO_INPUT.sector,
      autonomy_level: HERO_DEMO_INPUT.autonomy,
      operation_criticality: HERO_DEMO_INPUT.criticality,
    },
  };
  const d = distinguishAssessmentEvidence({ assessment });
  const gaps: string[] = [];
  if (!Array.isArray(d.associated)) gaps.push("associated");
  if (!Array.isArray(d.explicitSupportIntent)) gaps.push("explicitSupportIntent");
  if (!Array.isArray(d.userSupplied)) gaps.push("userSupplied");
  if (!Array.isArray(d.synthetic)) gaps.push("synthetic");
  if (!Array.isArray(d.assumptions)) gaps.push("assumptions");
  if (!Array.isArray(d.missingEvidence)) gaps.push("missingEvidence");
  if (!Array.isArray(d.unknownDependencies)) gaps.push("unknownDependencies");
  if (!Array.isArray(d.unresolvedConflicts)) gaps.push("unresolvedConflicts");
  const linked = listAssociatedEvidenceForAssessment(assessmentId);
  if (linked.some((l) => l.supportIntent === "supports_finding") && !d.explicitSupportIntent.length) {
    gaps.push("support-intent-not-exported");
  }
  return gaps;
}

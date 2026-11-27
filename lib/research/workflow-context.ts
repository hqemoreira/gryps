/**
 * Research workflow session — local-first site/scenario context.
 * Does not write Neon. Does not alter Model v0.4 scoring.
 * Stages are complete only when explicitly recorded — opening a page is not enough.
 */

import type { AssessmentInputs } from "@/lib/resilience-colors";
import { HERO_DEMO_INPUT } from "@/lib/hero-demo";
import type { LabScenarioId } from "@/lib/research/evidence-packs";

export const WORKFLOW_STORAGE_KEY = "gryps-research-workflow-v0";

export type WorkflowStageId =
  "site" | "scenario" | "dependencies" | "evidence" | "assessment" | "comparison" | "report";

export type WorkflowStageStatus = "not_started" | "ready" | "complete" | "unavailable";

export type ResearchWorkflowSession = {
  schema: "gryps-research-workflow-v0";
  id: string;
  updatedAt: string;
  siteLabel: string;
  lat: string;
  lng: string;
  sector: string;
  autonomy: string;
  criticality: string;
  /** Catalogue provider ids — empty means UNKNOWN / not specified */
  providers: string[];
  setup: string;
  notes: string;
  preferredLabScenario: LabScenarioId;
  linkedAssessmentId?: string;
  stages: {
    siteDefined: boolean;
    scenarioDefined: boolean;
    dependenciesReviewed: boolean;
    evidenceReviewed: boolean;
    assessmentLinked: boolean;
    comparisonReviewed: boolean;
    reportExported: boolean;
  };
};

export const WORKFLOW_STAGES: {
  id: WorkflowStageId;
  en: string;
  summaryEn: string;
}[] = [
  {
    id: "site",
    en: "Site",
    summaryEn: "Location envelope for the research assessment",
  },
  {
    id: "scenario",
    en: "Scenario",
    summaryEn: "Sector, operating mode, criticality, catalogue providers",
  },
  {
    id: "dependencies",
    en: "Dependencies",
    summaryEn: "Non-scoring Dependency Research Lab · UNKNOWN allowed",
  },
  {
    id: "evidence",
    en: "Evidence",
    summaryEn: "Research Library · public pack · provenance (not proof of independence)",
  },
  {
    id: "assessment",
    en: "Assessment",
    summaryEn: "Model v0.4 deterministic Signature · research output only",
  },
  {
    id: "comparison",
    en: "Comparison",
    summaryEn: "Workspace compare of saved assessments (later phases deepen this)",
  },
  {
    id: "report",
    en: "Report",
    summaryEn: "Markdown export from Local Workspace · not a certification pack",
  },
];

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyWorkflowSession(): ResearchWorkflowSession {
  return {
    schema: "gryps-research-workflow-v0",
    id: newId(),
    updatedAt: new Date().toISOString(),
    siteLabel: "",
    lat: "",
    lng: "",
    sector: "mining",
    autonomy: "remote-operated",
    criticality: "high",
    providers: [],
    setup: "",
    notes: "",
    preferredLabScenario: "fixture-b-starlink-iridium",
    stages: {
      siteDefined: false,
      scenarioDefined: false,
      dependenciesReviewed: false,
      evidenceReviewed: false,
      assessmentLinked: false,
      comparisonReviewed: false,
      reportExported: false,
    },
  };
}

export function homepageRegressionSession(): ResearchWorkflowSession {
  const base = emptyWorkflowSession();
  return {
    ...base,
    siteLabel: "Homepage regression · research example",
    lat: String(HERO_DEMO_INPUT.lat),
    lng: String(HERO_DEMO_INPUT.lng),
    sector: HERO_DEMO_INPUT.sector,
    autonomy: HERO_DEMO_INPUT.autonomy,
    criticality: HERO_DEMO_INPUT.criticality,
    providers: [...HERO_DEMO_INPUT.providers],
    preferredLabScenario: "fixture-b-starlink-iridium",
    stages: {
      ...base.stages,
      siteDefined: true,
      scenarioDefined: true,
    },
  };
}

export function loadWorkflowSession(): ResearchWorkflowSession {
  if (typeof window === "undefined") return emptyWorkflowSession();
  try {
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) return emptyWorkflowSession();
    const parsed = JSON.parse(raw) as ResearchWorkflowSession;
    if (parsed?.schema !== "gryps-research-workflow-v0") return emptyWorkflowSession();
    return {
      ...emptyWorkflowSession(),
      ...parsed,
      stages: { ...emptyWorkflowSession().stages, ...parsed.stages },
      providers: Array.isArray(parsed.providers) ? parsed.providers : [],
    };
  } catch {
    return emptyWorkflowSession();
  }
}

export function saveWorkflowSession(session: ResearchWorkflowSession): ResearchWorkflowSession {
  const next = { ...session, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearWorkflowSession(): ResearchWorkflowSession {
  if (typeof window !== "undefined") {
    localStorage.removeItem(WORKFLOW_STORAGE_KEY);
  }
  return emptyWorkflowSession();
}

export function parseLatLng(session: ResearchWorkflowSession): {
  lat?: number;
  lng?: number;
  missing: string[];
} {
  const missing: string[] = [];
  const lat = session.lat.trim() === "" ? undefined : Number(session.lat);
  const lng = session.lng.trim() === "" ? undefined : Number(session.lng);
  if (lat == null || Number.isNaN(lat)) missing.push("latitude");
  if (lng == null || Number.isNaN(lng)) missing.push("longitude");
  return {
    lat: lat != null && !Number.isNaN(lat) ? lat : undefined,
    lng: lng != null && !Number.isNaN(lng) ? lng : undefined,
    missing,
  };
}

export function siteFieldsComplete(session: ResearchWorkflowSession): boolean {
  const { missing } = parseLatLng(session);
  return missing.length === 0;
}

export function scenarioFieldsComplete(session: ResearchWorkflowSession): boolean {
  return Boolean(session.sector && session.autonomy && session.criticality);
}

/** Providers may be empty (= UNKNOWN). Completeness is about scenario fields, not inventing providers. */
export function providersUnknown(session: ResearchWorkflowSession): boolean {
  return session.providers.length === 0;
}

export function toAssessmentInputs(session: ResearchWorkflowSession): AssessmentInputs {
  const { lat, lng } = parseLatLng(session);
  return {
    lat,
    lng,
    sector: session.sector || "other",
    autonomy_level: session.autonomy || "manual",
    operation_criticality: session.criticality || "standard",
    current_setup: session.setup || undefined,
  };
}

export function buildAdvisorHref(session: ResearchWorkflowSession): string {
  const params = new URLSearchParams();
  params.set("from", "workflow");
  if (session.lat.trim()) params.set("lat", session.lat.trim());
  if (session.lng.trim()) params.set("lng", session.lng.trim());
  if (session.sector) params.set("sector", session.sector);
  if (session.autonomy) params.set("autonomy", session.autonomy);
  if (session.criticality) params.set("criticality", session.criticality);
  // Always emit providers so Advisor can clear hero defaults when UNKNOWN (empty).
  params.set("providers", session.providers.join(","));
  if (session.providers.length === 0) params.set("providersUnknown", "1");
  if (session.setup.trim()) params.set("setup", session.setup.trim());
  const qs = params.toString();
  return qs ? `/?${qs}#advisor` : "/#advisor";
}

export function buildDependencyLabHref(session: ResearchWorkflowSession): string {
  const params = new URLSearchParams();
  params.set("from", "workflow");
  params.set("lab", session.preferredLabScenario);
  if (session.lat.trim()) params.set("lat", session.lat.trim());
  if (session.lng.trim()) params.set("lng", session.lng.trim());
  if (session.sector) params.set("sector", session.sector);
  if (session.providers.length > 0) params.set("providers", session.providers.join(","));
  if (session.siteLabel.trim()) params.set("label", session.siteLabel.trim());
  return `/research/dependency-lab?${params.toString()}`;
}

export function buildEvidenceLibraryHref(): string {
  return "/research?from=workflow";
}

/** Deep-link to Research Library with binder focus (same library — not a second catalog). */
export function buildEvidenceBinderHref(session?: ResearchWorkflowSession): string {
  const params = new URLSearchParams();
  params.set("from", "workflow");
  params.set("binder", "1");
  if (session?.preferredLabScenario) params.set("lab", session.preferredLabScenario);
  return `/research?${params.toString()}#evidence-binder`;
}

export function buildKnowledgeHref(): string {
  return "/knowledge?from=workflow";
}

export function buildWorkspaceHref(
  session: ResearchWorkflowSession,
  mode?: "compare" | "export"
): string {
  const params = new URLSearchParams();
  params.set("from", "workflow");
  if (mode) params.set("mode", mode);
  if (session.linkedAssessmentId) params.set("id", session.linkedAssessmentId);
  return `/workspace?${params.toString()}`;
}

/**
 * Prefer a saved assessment whose core inputs match the workflow session.
 * AssessmentInputs has no providers[] field — provider catalogue is not matched here.
 * Does not invent a match — returns undefined when none fit.
 */
export function findMatchingSavedAssessment(
  session: ResearchWorkflowSession,
  assessments: Array<{
    id: string;
    title: string;
    inputs: {
      lat?: number;
      lng?: number;
      sector?: string;
      autonomy_level?: string;
      operation_criticality?: string;
    };
  }>
): { id: string; title: string } | undefined {
  const { lat, lng } = parseLatLng(session);
  if (lat == null || lng == null) return undefined;
  for (const a of assessments) {
    if (a.inputs.lat == null || a.inputs.lng == null) continue;
    if (Math.abs(a.inputs.lat - lat) > 0.01 || Math.abs(a.inputs.lng - lng) > 0.01) continue;
    if ((a.inputs.sector || "") !== session.sector) continue;
    if ((a.inputs.autonomy_level || "") !== session.autonomy) continue;
    if ((a.inputs.operation_criticality || "") !== session.criticality) continue;
    return { id: a.id, title: a.title };
  }
  return undefined;
}

/**
 * Linked assessment resolution — never silently substitutes the latest unrelated record.
 */
export type LinkedAssessmentResolution =
  | { status: "none" }
  | { status: "linked"; id: string }
  | { status: "stale"; id: string };

export function resolveLinkedAssessment(
  session: ResearchWorkflowSession,
  assessmentIds: string[]
): LinkedAssessmentResolution {
  if (!session.linkedAssessmentId) return { status: "none" };
  if (assessmentIds.includes(session.linkedAssessmentId)) {
    return { status: "linked", id: session.linkedAssessmentId };
  }
  return { status: "stale", id: session.linkedAssessmentId };
}

export function stageStatus(
  session: ResearchWorkflowSession,
  stage: WorkflowStageId,
  workspaceCount: number,
  /** Optional saved assessment ids — when provided, stale links are not treated as complete */
  assessmentIds?: string[]
): WorkflowStageStatus {
  switch (stage) {
    case "site":
      if (session.stages.siteDefined && siteFieldsComplete(session)) return "complete";
      if (siteFieldsComplete(session) || session.lat || session.lng) return "ready";
      return "not_started";
    case "scenario":
      if (session.stages.scenarioDefined && scenarioFieldsComplete(session)) return "complete";
      if (scenarioFieldsComplete(session)) return "ready";
      return "not_started";
    case "dependencies":
      if (!session.stages.siteDefined || !session.stages.scenarioDefined) return "unavailable";
      if (session.stages.dependenciesReviewed) return "complete";
      return "ready";
    case "evidence":
      if (!session.stages.siteDefined || !session.stages.scenarioDefined) return "unavailable";
      if (session.stages.evidenceReviewed) return "complete";
      return "ready";
    case "assessment": {
      if (!session.stages.siteDefined || !session.stages.scenarioDefined) return "unavailable";
      if (!session.stages.assessmentLinked) return "ready";
      if (assessmentIds) {
        const linked = resolveLinkedAssessment(session, assessmentIds);
        if (linked.status === "stale" || linked.status === "none") return "ready";
      }
      return "complete";
    }
    case "comparison":
      if (workspaceCount < 2) return "unavailable";
      if (session.stages.comparisonReviewed) return "complete";
      return "ready";
    case "report": {
      if (!session.stages.assessmentLinked) return "unavailable";
      if (assessmentIds) {
        const linked = resolveLinkedAssessment(session, assessmentIds);
        if (linked.status !== "linked") return "unavailable";
      }
      if (session.stages.reportExported) return "complete";
      return "ready";
    }
    default:
      return "not_started";
  }
}

export function missingInformation(session: ResearchWorkflowSession): string[] {
  const missing: string[] = [];
  const coords = parseLatLng(session);
  missing.push(...coords.missing);
  if (!session.sector) missing.push("sector");
  if (!session.autonomy) missing.push("operating mode");
  if (!session.criticality) missing.push("criticality");
  if (providersUnknown(session)) {
    missing.push("catalogue providers (UNKNOWN — not invented)");
  }
  if (!session.stages.dependenciesReviewed) {
    missing.push("dependency review acknowledgement");
  }
  if (!session.stages.evidenceReviewed) {
    missing.push("evidence review acknowledgement");
  }
  if (!session.stages.assessmentLinked) {
    missing.push("linked Model v0.4 assessment");
  }
  return missing;
}

export const WORKFLOW_DISCLAIMER_EN =
  "Research workflow · experimental prototype. Model v0.4 outputs are deterministic research-model results — not independently validated operational assessments, certifications, or procurement advice. Catalogue providers are not proof of infrastructure independence. UNKNOWN remains a valid result.";

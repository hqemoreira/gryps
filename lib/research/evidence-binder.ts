/**
 * Evidence binder (P6-S9) — structured association of research evidence to
 * sites, scenarios, dependencies, assessments and reports.
 *
 * Boundaries:
 * - Does not import scoring / alter Model v0.4
 * - Does not mutate P5-S2 pack files
 * - Does not write Neon
 * - Does not invent missing publication/retrieval dates
 * - Synthetic items always labelled SYNTHETIC
 * - Never claims independent field validation
 */

import { MODEL_VERSION, SCORING_ENGINE_DISPLAY } from "@/lib/model-constants";
import { RESEARCH_LIBRARY } from "@/lib/research-library";
import {
  FIXTURE_OPTIONS,
  getDependencyFixture,
  type FixtureEvidence,
} from "@/lib/research/dependency-fixtures";
import {
  EVIDENCE_PACK_OPTIONS,
  getEvidencePack,
} from "@/lib/research/evidence-packs";
import type { ResearchWorkflowSession } from "@/lib/research/workflow-context";
import type { SavedResearchAssessment } from "@/lib/research-workspace";
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "@/lib/hero-demo";
import {
  getAnnotation,
  listAnnotations,
  listAssociationsForAssessment,
  type EvidenceSupportIntent,
  type UserEvidenceAnnotation,
} from "@/lib/research/evidence-annotation-store";

export const EVIDENCE_BINDER_SCHEMA = "gryps-evidence-binder-v0" as const;
export const EVIDENCE_BINDER_EXPORT_SCHEMA = "gryps-evidence-export-companion-v0" as const;

export type EvidenceOrigin = "PUBLIC" | "SYNTHETIC" | "USER_SUPPLIED";

/** How the binder classifies the epistemic role of the record. */
export type EvidenceSupportClass =
  | "directly_documented"
  | "indirect"
  | "synthetic_demonstration"
  | "user_supplied"
  | "assumption"
  | "unknown";

/**
 * Verification posture — never use independently_validated unless true independent
 * validation exists (it does not for this prototype catalog).
 */
export type EvidenceVerificationStatus =
  | "documented"
  | "unverified"
  | "insufficient"
  | "conflicting"
  | "unknown";

export type EvidenceBinderAssociations = {
  researchSiteLabel?: string;
  scenarioKey?: string;
  infrastructureDependencyIds: string[];
  providerOrComponent?: string;
  assessmentId?: string;
  reportId?: string;
  researchLibrarySlug?: string;
  labScenarioId?: string;
};

export type EvidenceBinderRecord = {
  schema: typeof EVIDENCE_BINDER_SCHEMA;
  id: string;
  title: string;
  description: string;
  sourceOrganisation?: string;
  sourceUrl?: string;
  documentReference?: string;
  /** ISO date or omitted when unspecified — never invent */
  publicationDate?: string;
  retrievalDate?: string;
  evidenceType: string;
  origin: EvidenceOrigin;
  supportClass: EvidenceSupportClass;
  supportedClaim: string;
  limitations: string[];
  verificationStatus: EvidenceVerificationStatus;
  provenanceNotes: string;
  associations: EvidenceBinderAssociations;
  contradictsIds: string[];
  whatRemainsUnknown: string[];
};

export type EvidenceExportCompanion = {
  schema: typeof EVIDENCE_BINDER_EXPORT_SCHEMA;
  generatedAt: string;
  nonCertifyingNotice: string;
  model: { identifier: string; version: string; engineDisplay: string };
  homepageRegressionLock: string;
  siteAndScenario: {
    siteLabel?: string;
    lat?: string;
    lng?: string;
    sector?: string;
    autonomy?: string;
    criticality?: string;
    providers: string[] | "UNKNOWN";
  };
  assessmentInputs?: SavedResearchAssessment["inputs"];
  assessmentId?: string;
  assessmentTitle?: string;
  evidenceReferences: Array<{
    id: string;
    title: string;
    origin: EvidenceOrigin;
    supportClass: EvidenceSupportClass;
    verificationStatus: EvidenceVerificationStatus;
    supportedClaim: string;
  }>;
  assumptions: string[];
  unknownFields: string[];
  knownLimitations: string[];
  unresolvedConflicts: Array<{ a: string; b: string }>;
};

function kindToSupportClass(
  kind: string
): EvidenceSupportClass {
  switch (kind) {
    case "MEASURED":
      return "directly_documented";
    case "RESEARCH":
      return "indirect";
    case "MODELLED":
    case "DERIVED":
      return "indirect";
    case "ILLUSTRATIVE":
      return "indirect";
    case "STORED":
      return "indirect";
    default:
      return "unknown";
  }
}

function buildLibraryRecords(): EvidenceBinderRecord[] {
  const out: EvidenceBinderRecord[] = [];
  for (const entry of RESEARCH_LIBRARY) {
    const notes = entry.evidenceNotes ?? [];
    notes.forEach((note, idx) => {
      out.push({
        schema: EVIDENCE_BINDER_SCHEMA,
        id: `lib:${entry.slug}:note:${idx}`,
        title: `${entry.title} · ${note.kind}`,
        description: note.en,
        sourceOrganisation: "GRYPS Research Library",
        sourceUrl: `/research/${entry.slug}`,
        documentReference: `research-library:${entry.slug}`,
        // Do not invent publication/retrieval dates for authored notes
        evidenceType: note.kind,
        origin: "PUBLIC",
        supportClass: kindToSupportClass(note.kind),
        supportedClaim: `Library evidence note (${note.kind}) for ${entry.slug}`,
        limitations: [
          "Library evidence notes are research hygiene labels — not operational validation.",
          "Publication as a library card is not proof of infrastructure independence.",
        ],
        verificationStatus: note.kind === "MEASURED" ? "documented" : "unverified",
        provenanceNotes: `Derived from RESEARCH_LIBRARY evidenceNotes for ${entry.slug}`,
        associations: {
          researchLibrarySlug: entry.slug,
          scenarioKey: entry.vertical,
          researchSiteLabel: entry.locationLabel,
          infrastructureDependencyIds: [],
          providerOrComponent: undefined,
        },
        contradictsIds: [],
        whatRemainsUnknown: [
          "Site-confirmed serving path",
          "Independence of infrastructure dependencies",
        ],
      });
    });
  }
  return out;
}

function mapScenarioEvidence(
  scenarioId: string,
  ev: FixtureEvidence,
  kind: "fixture" | "evidence_pack"
): EvidenceBinderRecord {
  const synthetic = Boolean(ev.isSynthetic) || ev.accessClass === "synthetic";
  const prefix = kind === "evidence_pack" ? "pack" : "fixture";
  return {
    schema: EVIDENCE_BINDER_SCHEMA,
    id: `${prefix}:${scenarioId}:${ev.id}`,
    title: synthetic ? `SYNTHETIC · ${ev.title}` : ev.title,
    description: ev.claim,
    sourceOrganisation: ev.publisher ?? undefined,
    sourceUrl: ev.urlOrReference?.startsWith("http") ? ev.urlOrReference : undefined,
    documentReference: ev.urlOrReference,
    publicationDate: ev.publicationDate ?? undefined,
    retrievalDate: ev.retrievalDate || undefined,
    evidenceType: ev.evidenceType,
    origin: synthetic ? "SYNTHETIC" : "PUBLIC",
    supportClass: synthetic
      ? "synthetic_demonstration"
      : kind === "evidence_pack"
        ? "directly_documented"
        : "directly_documented",
    supportedClaim: ev.claim,
    limitations: [
      ev.limitations,
      kind === "evidence_pack"
        ? "Public pack evidence does not certify operational resilience or dual-path independence."
        : "Fixture evidence does not certify operational resilience.",
    ].filter(Boolean) as string[],
    verificationStatus:
      ev.verificationStatus === "conflicting"
        ? "conflicting"
        : synthetic
          ? "unverified"
          : "documented",
    provenanceNotes: synthetic
      ? "SYNTHETIC demonstration fixture — not a real organisational statement."
      : kind === "evidence_pack"
        ? `Read-only map of public evidence pack ${scenarioId} — pack file not mutated.`
        : `Mapped from dependency fixture ${scenarioId} without modifying source files.`,
    associations: {
      labScenarioId: scenarioId,
      infrastructureDependencyIds: [ev.id],
      providerOrComponent: undefined,
    },
    contradictsIds: [],
    whatRemainsUnknown: ["Whether the documented relationship is a complete customer-serving path"],
  };
}

function buildFixtureRecords(): EvidenceBinderRecord[] {
  const out: EvidenceBinderRecord[] = [];
  for (const opt of FIXTURE_OPTIONS) {
    const fixture = getDependencyFixture(opt.id);
    for (const ev of fixture.evidence) {
      out.push(mapScenarioEvidence(opt.id, ev, "fixture"));
    }
  }
  // Read-only inclusion of public packs — never mutates pack JSON on disk
  for (const opt of EVIDENCE_PACK_OPTIONS) {
    const pack = getEvidencePack(opt.id);
    for (const ev of pack.evidence) {
      out.push(mapScenarioEvidence(opt.id, ev, "evidence_pack"));
    }
  }
  // Explicit conflict pair for integrity tests (synthetic, labelled)
  const conflictA: EvidenceBinderRecord = {
    schema: EVIDENCE_BINDER_SCHEMA,
    id: "synthetic:conflict:path-a",
    title: "SYNTHETIC · Conflict demo A",
    description: "Synthetic demonstration claim: dual-path independence is confirmed.",
    evidenceType: "synthetic_conflict_demo",
    origin: "SYNTHETIC",
    supportClass: "synthetic_demonstration",
    supportedClaim: "Dual-path independence confirmed (synthetic false claim for QA)",
    limitations: ["SYNTHETIC — must not be treated as verified fact"],
    verificationStatus: "conflicting",
    provenanceNotes: "Injected conflict pair for binder integrity tests only.",
    associations: {
      infrastructureDependencyIds: ["synthetic-conflict"],
      labScenarioId: "fixture-b-starlink-iridium",
    },
    contradictsIds: ["synthetic:conflict:path-b"],
    whatRemainsUnknown: ["Actual independence — UNKNOWN outside this synthetic demo"],
  };
  const conflictB: EvidenceBinderRecord = {
    ...conflictA,
    id: "synthetic:conflict:path-b",
    title: "SYNTHETIC · Conflict demo B",
    description: "Synthetic demonstration claim: dual-path independence is not established.",
    supportedClaim: "Dual-path independence not established (synthetic counter-claim for QA)",
    contradictsIds: ["synthetic:conflict:path-a"],
  };
  out.push(conflictA, conflictB);
  return out;
}

let _catalog: EvidenceBinderRecord[] | null = null;

/** Static derived catalog only (no USER_SUPPLIED annotations). */
export function listCatalogEvidenceBinderRecords(): EvidenceBinderRecord[] {
  if (!_catalog) {
    _catalog = [...buildLibraryRecords(), ...buildFixtureRecords()];
  }
  return _catalog;
}

export function annotationToBinderRecord(ann: UserEvidenceAnnotation): EvidenceBinderRecord {
  return {
    schema: EVIDENCE_BINDER_SCHEMA,
    id: ann.id,
    title: `USER_SUPPLIED · ${ann.title}`,
    description: ann.description,
    sourceUrl: ann.sourceUrl,
    documentReference: ann.documentReference,
    // Do not invent publication dates for user annotations
    publicationDate: undefined,
    retrievalDate: ann.dateSupplied,
    evidenceType: "user_annotation",
    origin: "USER_SUPPLIED",
    supportClass: ann.supportClass,
    supportedClaim: ann.description.slice(0, 240) || ann.title,
    limitations: ann.limitations,
    verificationStatus: ann.verificationStatus,
    provenanceNotes: ann.provenanceNotes,
    associations: {
      infrastructureDependencyIds: [...ann.dependencyIds],
      assessmentId: ann.assessmentIds[0],
    },
    contradictsIds: [],
    whatRemainsUnknown: [
      "Whether this observation is independently corroborated",
      "Whether it establishes a complete customer-serving path",
    ],
  };
}

/** Catalog + persisted USER_SUPPLIED annotations (same binder — not a second library). */
export function listEvidenceBinderRecords(): EvidenceBinderRecord[] {
  return [
    ...listCatalogEvidenceBinderRecords(),
    ...listAnnotations().map(annotationToBinderRecord),
  ];
}

export function getEvidenceBinderRecord(id: string): EvidenceBinderRecord | undefined {
  const fromCatalog = listCatalogEvidenceBinderRecords().find((r) => r.id === id);
  if (fromCatalog) return fromCatalog;
  const ann = getAnnotation(id);
  return ann ? annotationToBinderRecord(ann) : undefined;
}

/**
 * Resolve evidence linked to an assessment via persisted associations.
 * Association does not imply the evidence supports the assessment.
 */
export function listAssociatedEvidenceForAssessment(
  assessmentId: string
): Array<{
  associationId: string;
  record: EvidenceBinderRecord;
  missing: boolean;
  supportIntent: EvidenceSupportIntent;
}> {
  const links = listAssociationsForAssessment(assessmentId);
  return links.map((link) => {
    const supportIntent = link.supportIntent ?? "none";
    const record = getEvidenceBinderRecord(link.evidenceId);
    if (record) {
      return { associationId: link.id, record, missing: false, supportIntent };
    }
    // Unknown / deleted reference — preserve visibility
    const placeholder: EvidenceBinderRecord = {
      schema: EVIDENCE_BINDER_SCHEMA,
      id: link.evidenceId,
      title: `Missing evidence reference · ${link.evidenceId}`,
      description:
        "Associated evidence id is not present in the catalog or annotation store. Association retained; evidence UNKNOWN.",
      evidenceType: "missing_reference",
      origin: "USER_SUPPLIED",
      supportClass: "unknown",
      supportedClaim: "UNKNOWN — referenced evidence missing",
      limitations: ["Missing reference preserved — not silently dropped."],
      verificationStatus: "unknown",
      provenanceNotes: "Persisted association points to an unresolved evidence id.",
      associations: {
        infrastructureDependencyIds: [],
        assessmentId,
      },
      contradictsIds: [],
      whatRemainsUnknown: ["Content of the missing evidence record"],
    };
    return { associationId: link.id, record: placeholder, missing: true, supportIntent };
  });
}

export function evidenceForLibrarySlug(slug: string): EvidenceBinderRecord[] {
  return listEvidenceBinderRecords().filter((r) => r.associations.researchLibrarySlug === slug);
}

export function evidenceForLabScenario(labId: string): EvidenceBinderRecord[] {
  return listEvidenceBinderRecords().filter((r) => r.associations.labScenarioId === labId);
}

export function evidenceForAssessment(assessmentId: string): EvidenceBinderRecord[] {
  const persisted = listAssociatedEvidenceForAssessment(assessmentId).map((x) => x.record);
  if (persisted.length) return persisted;
  // Legacy non-persisting helper path (catalog association field only)
  return listCatalogEvidenceBinderRecords().filter(
    (r) => r.associations.assessmentId === assessmentId
  );
}

export function listSyntheticEvidence(): EvidenceBinderRecord[] {
  return listEvidenceBinderRecords().filter((r) => r.origin === "SYNTHETIC");
}

export function listPublicEvidence(): EvidenceBinderRecord[] {
  return listEvidenceBinderRecords().filter((r) => r.origin === "PUBLIC");
}

export function recordsWithMissingMetadata(records = listEvidenceBinderRecords()): EvidenceBinderRecord[] {
  return records.filter((r) => !r.publicationDate || !r.retrievalDate);
}

export function listUnresolvedConflicts(
  records = listEvidenceBinderRecords()
): Array<{ a: string; b: string }> {
  const pairs: Array<{ a: string; b: string }> = [];
  const seen = new Set<string>();
  for (const r of records) {
    for (const other of r.contradictsIds) {
      const key = [r.id, other].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ a: r.id, b: other });
    }
  }
  return pairs;
}

export function binderIntegrityViolations(records = listEvidenceBinderRecords()): string[] {
  const violations: string[] = [];
  const ids = new Set<string>();
  for (const r of records) {
    if (ids.has(r.id)) violations.push(`duplicate:${r.id}`);
    ids.add(r.id);
    if (r.origin === "SYNTHETIC" && !/SYNTHETIC|synthetic/i.test(r.title + r.provenanceNotes)) {
      violations.push(`unlabelled-synthetic:${r.id}`);
    }
    if (r.verificationStatus === ("independently_validated" as EvidenceVerificationStatus)) {
      violations.push(`forbidden-validated:${r.id}`);
    }
    if (r.supportClass === "unknown" && r.verificationStatus === "documented") {
      violations.push(`unknown-marked-documented:${r.id}`);
    }
  }
  return violations;
}

export function associateEvidenceWithAssessment(
  record: EvidenceBinderRecord,
  assessmentId: string
): EvidenceBinderRecord {
  return {
    ...record,
    associations: { ...record.associations, assessmentId },
  };
}

export function missingEvidenceForSession(session: ResearchWorkflowSession): string[] {
  const missing: string[] = [];
  if (!session.stages.evidenceReviewed) {
    missing.push("Evidence stage not acknowledged");
  }
  if (session.providers.length === 0) {
    missing.push("Catalogue providers UNKNOWN — no binder record invents them");
  }
  if (!session.linkedAssessmentId) {
    missing.push("No linked assessment for evidence association");
  }
  const libHits = listEvidenceBinderRecords().filter(
    (r) => r.associations.labScenarioId === session.preferredLabScenario
  );
  if (libHits.length === 0) {
    missing.push(`No binder evidence for lab scenario ${session.preferredLabScenario}`);
  }
  return missing;
}

export function buildEvidenceExportCompanion(options: {
  session?: ResearchWorkflowSession;
  assessment?: SavedResearchAssessment;
  evidenceIds?: string[];
}): EvidenceExportCompanion {
  const { session, assessment } = options;
  const all = listEvidenceBinderRecords();
  const selected = options.evidenceIds?.length
    ? options.evidenceIds
        .map((id) => getEvidenceBinderRecord(id))
        .filter((r): r is EvidenceBinderRecord => !!r)
    : assessment
      ? (() => {
          const linked = listAssociatedEvidenceForAssessment(assessment.id).map((x) => x.record);
          if (linked.length) return linked;
          return all.filter(
            (r) =>
              r.associations.assessmentId === assessment.id ||
              (session?.preferredLabScenario &&
                r.associations.labScenarioId === session.preferredLabScenario)
          );
        })()
      : session
        ? evidenceForLabScenario(session.preferredLabScenario).slice(0, 12)
        : [];

  const unknownFields: string[] = [];
  if (session && session.providers.length === 0) unknownFields.push("catalogue providers");
  if (!assessment) unknownFields.push("linked assessment");
  for (const r of selected) {
    if (!r.publicationDate) unknownFields.push(`publicationDate:${r.id}`);
    if (!r.retrievalDate) unknownFields.push(`retrievalDate:${r.id}`);
    unknownFields.push(...r.whatRemainsUnknown.map((u) => `${r.id}:${u}`));
  }

  return {
    schema: EVIDENCE_BINDER_EXPORT_SCHEMA,
    generatedAt: new Date().toISOString(),
    nonCertifyingNotice:
      "Non-certifying research export companion. Not independent validation, procurement advice, or proof of infrastructure independence.",
    model: {
      identifier: "gryps-model",
      version: MODEL_VERSION,
      engineDisplay: SCORING_ENGINE_DISPLAY,
    },
    homepageRegressionLock: `${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`,
    siteAndScenario: {
      siteLabel: session?.siteLabel,
      lat: session?.lat,
      lng: session?.lng,
      sector: session?.sector,
      autonomy: session?.autonomy,
      criticality: session?.criticality,
      providers: session ? (session.providers.length ? session.providers : "UNKNOWN") : "UNKNOWN",
    },
    assessmentInputs: assessment?.inputs,
    assessmentId: assessment?.id,
    assessmentTitle: assessment?.title,
    evidenceReferences: selected.map((r) => ({
      id: r.id,
      title: r.title,
      origin: r.origin,
      supportClass: r.supportClass,
      verificationStatus: r.verificationStatus,
      supportedClaim: r.supportedClaim,
    })),
    assumptions: [
      "Catalogue confidence is not measured availability.",
      "Synthetic demonstration evidence is not field evidence.",
    ],
    unknownFields: [...new Set(unknownFields)],
    knownLimitations: [
      "Model v0.4 outputs are experimental research results.",
      "Evidence binder does not certify sites or dual-path independence.",
      ...selected.flatMap((r) => r.limitations).slice(0, 8),
    ],
    unresolvedConflicts: listUnresolvedConflicts(selected),
  };
}

/** Distinguishes assessment report sections without upgrading claims. */
export type AssessmentEvidenceDistinction = {
  /** Persisted associations only — not an automatic support claim */
  associated: EvidenceBinderRecord[];
  /** Explicit supportIntent === supports_finding (user action required) */
  explicitSupportIntent: Array<{
    evidenceId: string;
    supportIntent: EvidenceSupportIntent;
    record: EvidenceBinderRecord;
  }>;
  evidenceSupported: EvidenceBinderRecord[];
  userSupplied: EvidenceBinderRecord[];
  synthetic: EvidenceBinderRecord[];
  assumptions: string[];
  missingEvidence: string[];
  unknownDependencies: string[];
  unresolvedConflicts: Array<{ a: string; b: string }>;
};

export function distinguishAssessmentEvidence(options: {
  session?: ResearchWorkflowSession;
  assessment?: SavedResearchAssessment;
  labScenarioId?: string;
}): AssessmentEvidenceDistinction {
  const labId =
    options.labScenarioId ||
    options.session?.preferredLabScenario ||
    "fixture-b-starlink-iridium";
  const labRecords = evidenceForLabScenario(labId);
  const linked = options.assessment
    ? listAssociatedEvidenceForAssessment(options.assessment.id)
    : [];
  const associated = linked.map((x) => x.record);
  const explicitSupportIntent = linked
    .filter((x) => x.supportIntent !== "none")
    .map((x) => ({
      evidenceId: x.record.id,
      supportIntent: x.supportIntent,
      record: x.record,
    }));
  const pool = associated.length ? associated : labRecords;
  // PUBLIC documented/indirect — classification only; still not a field-validation claim
  const evidenceSupported = pool.filter(
    (r) =>
      r.origin === "PUBLIC" &&
      (r.supportClass === "directly_documented" || r.supportClass === "indirect")
  );
  const userSupplied = pool.filter((r) => r.origin === "USER_SUPPLIED");
  const synthetic = pool.filter((r) => r.origin === "SYNTHETIC");
  const assumptions = [
    "Catalogue confidence is not measured availability.",
    "Publication of architecture evidence is not proof of a customer-serving path.",
    "Association with an assessment is not automatic evidence of support.",
    "Support intent requires an explicit researcher action and does not change evidence origin.",
    ...(options.assessment?.result?.evidence?.assumptions ?? []).slice(0, 6),
  ];
  const missingEvidence: string[] = [];
  if (options.session) missingEvidence.push(...missingEvidenceForSession(options.session));
  if (options.assessment) {
    for (const m of linked.filter((x) => x.missing)) {
      missingEvidence.push(`Missing associated evidence: ${m.record.id}`);
    }
    if (!associated.length) {
      missingEvidence.push("No persisted evidence associations for this assessment");
    }
  } else if (labRecords.length === 0) {
    missingEvidence.push(`No binder evidence for lab scenario ${labId}`);
  }
  const unknownDependencies = pool.flatMap((r) => r.whatRemainsUnknown);
  if (options.session && options.session.providers.length === 0) {
    unknownDependencies.push("Catalogue providers UNKNOWN");
  }
  return {
    associated,
    explicitSupportIntent,
    evidenceSupported,
    userSupplied,
    synthetic,
    assumptions: [...new Set(assumptions)],
    missingEvidence: [...new Set(missingEvidence)],
    unknownDependencies: [...new Set(unknownDependencies)],
    unresolvedConflicts: listUnresolvedConflicts(pool),
  };
}

export function formatEvidenceExportCompanionMarkdown(c: EvidenceExportCompanion): string {
  const lines = [
    "# GRYPS Evidence Export Companion",
    "",
    `**${c.nonCertifyingNotice}**`,
    "",
    `Generated: ${c.generatedAt}`,
    `Model: ${c.model.version} · ${c.model.engineDisplay}`,
    `Homepage regression lock: ${c.homepageRegressionLock}`,
    "",
    "## Site · scenario",
    "",
    `- Site: ${c.siteAndScenario.siteLabel || "—"}`,
    `- Coordinates: ${c.siteAndScenario.lat || "—"}, ${c.siteAndScenario.lng || "—"}`,
    `- Sector: ${c.siteAndScenario.sector || "—"}`,
    `- Autonomy: ${c.siteAndScenario.autonomy || "—"}`,
    `- Criticality: ${c.siteAndScenario.criticality || "—"}`,
    `- Providers: ${
      c.siteAndScenario.providers === "UNKNOWN"
        ? "UNKNOWN"
        : c.siteAndScenario.providers.join(", ") || "UNKNOWN"
    }`,
    "",
    "## Assessment",
    "",
    `- Id: ${c.assessmentId || "—"}`,
    `- Title: ${c.assessmentTitle || "—"}`,
    "",
    "## Evidence references",
    "",
  ];
  if (!c.evidenceReferences.length) lines.push("_None selected_");
  for (const e of c.evidenceReferences) {
    lines.push(
      `- \`${e.id}\` · **${e.origin}** · ${e.supportClass} · ${e.verificationStatus} — ${e.title}`
    );
    lines.push(`  - Claim: ${e.supportedClaim}`);
  }
  lines.push("", "## Assumptions", "");
  for (const a of c.assumptions) lines.push(`- ${a}`);
  lines.push("", "## UNKNOWN fields", "");
  for (const u of c.unknownFields.slice(0, 40)) lines.push(`- ${u}`);
  lines.push("", "## Known limitations", "");
  for (const l of c.knownLimitations.slice(0, 20)) lines.push(`- ${l}`);
  if (c.unresolvedConflicts.length) {
    lines.push("", "## Unresolved conflicts", "");
    for (const p of c.unresolvedConflicts) lines.push(`- ${p.a} ↔ ${p.b}`);
  }
  lines.push("", "---", "", "*Research prototype · Non-commercial · Non-certifying*");
  return lines.join("\n");
}

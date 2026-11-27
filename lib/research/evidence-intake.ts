/**
 * Research-only evidence intake model (P5-S5).
 *
 * Boundaries:
 * - Synthetic fixtures for workflow validation only
 * - Must NOT import scoring modules or write to Neon
 * - Must NOT mutate nordic-lapland-dual-path-v0
 * - Must NOT fabricate real-organisation statements
 */

export const EVIDENCE_INTAKE_SCHEMA = "gryps-evidence-intake-v0" as const;

/** How the evidence was obtained (P5-S3 levels). Not a quality score. */
export type EvidenceMaturityLevel = "L1" | "L2" | "L3" | "L4" | "L5" | "none";

/**
 * Intake lifecycle / assessment states.
 * Process states and terminal assessment states share one field so history is linear;
 * maturityLevel remains a separate field.
 */
export type IntakeLifecycleState =
  | "prepared"
  | "approved"
  | "sent"
  | "received"
  | "under_review"
  | "supported_within_scope"
  | "partially_supported"
  | "contradicted"
  | "unresolved"
  | "superseded"
  | "unavailable"
  | "no_response"
  | "declined";

export type AccessClassification =
  | "public"
  | "restricted"
  | "confidential"
  | "synthetic";

export type ReusePermission =
  | "public_cite_ok"
  | "redacted_summary_ok"
  | "internal_only"
  | "not_disclosable"
  | "synthetic_test_only";

export type SourceCategory =
  | "synthetic_provider_response"
  | "synthetic_facility_operator_response"
  | "synthetic_industrial_site_response"
  | "synthetic_measurement_log"
  | "synthetic_no_response"
  | "synthetic_contradiction_pair";

export type LifecycleTransition = {
  to: IntakeLifecycleState;
  at: string;
  note: string;
};

export type ClaimAssessment = {
  exactClaimSupported: string;
  sourceCompetence: string;
  primaryOrSecondary: "primary" | "secondary" | "not_applicable";
  independentOfOtherEvidence: "yes" | "no" | "partial" | "not_assessed";
  geographicScope: string;
  technicalScope: string;
  isCurrent: "yes" | "no" | "unknown" | "not_applicable";
  limitations: string;
  contradictsOrQualifies: string;
};

export type EvidenceIntakeRecord = {
  schemaVersion: typeof EVIDENCE_INTAKE_SCHEMA;
  intakeId: string;
  isSynthetic: boolean;
  syntheticLabel: string;
  claimIds: string[];
  relationshipIds: string[];
  /** Fictional category label for synthetic fixtures — never a real legal name. */
  respondingOrganisationCategory: string;
  sourceCategory: SourceCategory;
  evidenceSourceReference: string;
  dateReceived: string | null;
  publicationDate: string | null;
  validFrom: string | null;
  validTo: string | null;
  geographicScope: { label: string; precision: string };
  technicalScope: string;
  /** Separate from lifecycleState / evidenceStatus. */
  maturityLevel: EvidenceMaturityLevel;
  /**
   * Assessment outcome when review completed; mirrors terminal lifecycle for
   * open process states use "pending" conceptually via lifecycle only.
   * Kept explicit so maturity ≠ status.
   */
  evidenceStatus: IntakeLifecycleState;
  lifecycleState: IntakeLifecycleState;
  lifecycleHistory: LifecycleTransition[];
  accessClassification: AccessClassification;
  reusePermission: ReusePermission;
  restrictedHandle: string | null;
  publicSummary: string | null;
  assessmentNotes: string;
  reviewer: string | null;
  assessmentDate: string | null;
  contradictsIntakeIds: string[];
  qualifiesIntakeIds: string[];
  supersededByIntakeIds: string[];
  supersedesIntakeIds: string[];
  claimAssessment: ClaimAssessment;
  whatRemainsUnknown: string[];
  relatedEnvelope: "nordic-lapland-dual-path-v0";
  entersProductionAssessment: false;
  containsScoreOrProbability: false;
  writesToNeon: false;
};

/** Permitted single-step transitions. History is append-only. */
export const INTAKE_TRANSITIONS: Record<IntakeLifecycleState, IntakeLifecycleState[]> = {
  prepared: ["approved", "unavailable", "declined"],
  approved: ["sent", "declined", "unavailable"],
  sent: ["received", "no_response", "declined"],
  received: ["under_review"],
  under_review: [
    "supported_within_scope",
    "partially_supported",
    "contradicted",
    "unresolved",
    "superseded",
    "unavailable",
  ],
  supported_within_scope: ["superseded"],
  partially_supported: ["superseded", "under_review"],
  contradicted: ["under_review", "superseded"],
  unresolved: ["under_review", "superseded"],
  superseded: [],
  unavailable: [],
  no_response: [],
  declined: [],
};

export const TERMINAL_SUPPORT_STATES = new Set<IntakeLifecycleState>([
  "supported_within_scope",
  "partially_supported",
]);

export const NON_SUPPORT_TERMINALS = new Set<IntakeLifecycleState>([
  "no_response",
  "declined",
  "unavailable",
  "contradicted",
  "unresolved",
  "superseded",
]);

export function isTransitionAllowed(
  from: IntakeLifecycleState,
  to: IntakeLifecycleState
): boolean {
  return INTAKE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertValidHistory(history: LifecycleTransition[]): string | null {
  if (history.length === 0) return "lifecycleHistory empty";
  let prev: IntakeLifecycleState | null = null;
  for (const step of history) {
    if (!prev) {
      if (step.to !== "prepared") return "history must start at prepared";
    } else if (!isTransitionAllowed(prev, step.to)) {
      return `illegal transition ${prev} → ${step.to}`;
    }
    prev = step.to;
  }
  return null;
}

export function historyEndsWith(
  history: LifecycleTransition[],
  state: IntakeLifecycleState
): boolean {
  return history.length > 0 && history[history.length - 1]!.to === state;
}

export function supportMustNotFollowNoResponseOrDeclined(
  record: EvidenceIntakeRecord
): string | null {
  const hadNoResponse = record.lifecycleHistory.some((h) => h.to === "no_response");
  const hadDeclined = record.lifecycleHistory.some((h) => h.to === "declined");
  if (
    (hadNoResponse || hadDeclined) &&
    TERMINAL_SUPPORT_STATES.has(record.lifecycleState)
  ) {
    return `${record.intakeId}: no_response/declined cannot yield support`;
  }
  if (record.lifecycleState === "no_response" || record.lifecycleState === "declined") {
    if (TERMINAL_SUPPORT_STATES.has(record.evidenceStatus)) {
      return `${record.intakeId}: evidenceStatus must not be support when lifecycle is no_response/declined`;
    }
  }
  return null;
}

/**
 * Validate and normalise live-model JSON into QaFinding records.
 * Reject malformed / unsupported responses — do not invent defects from vague prose.
 */
import { isBlockingSeverity } from "@/lib/qa/decision";
import type { QaAgentId, QaFinding, QaFindingKind, QaSeverity } from "@/lib/qa/types";
import { QA_FINDING_SCHEMA } from "@/lib/qa/types";

export type LiveFindingDraft = {
  findingId?: string;
  severity?: string;
  kind?: string;
  affected?: string;
  description?: string;
  evidence?: string[] | string;
  reproduction?: string;
  recommendedCorrection?: string;
  confidence?: string;
  humanApprovalRequired?: boolean;
  blocking?: boolean;
  classification?: string;
};

export type ParsedLiveResponse = {
  ok: boolean;
  summary?: string;
  findings: QaFinding[];
  disagreements?: string[];
  errors: string[];
  rawClassifications: string[];
};

const SEVERITIES: QaSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"];
const KINDS: QaFindingKind[] = ["verified_defect", "potential_risk", "suggestion"];
const CONF = ["high", "medium", "low"] as const;

function asKind(v: unknown): QaFindingKind | null {
  if (typeof v !== "string") return null;
  if (KINDS.includes(v as QaFindingKind)) return v as QaFindingKind;
  // Map extended classifications into kinds without promoting vague text to verified defects
  if (v === "confirmed_defect" || v === "confirmed") return "verified_defect";
  if (v === "potential_risk" || v === "missing_evidence" || v === "false_positive")
    return "potential_risk";
  if (v === "recommendation" || v === "suggestion") return "suggestion";
  return null;
}

function asSeverity(v: unknown): QaSeverity | null {
  if (typeof v !== "string") return null;
  const u = v.toUpperCase() as QaSeverity;
  return SEVERITIES.includes(u) ? u : null;
}

export function parseLiveAgentJson(
  agent: QaAgentId,
  content: string,
  meta: { provider: string; model: string }
): ParsedLiveResponse {
  const errors: string[] = [];
  const rawClassifications: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return {
      ok: false,
      findings: [],
      errors: ["Response is not valid JSON"],
      rawClassifications: [],
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      ok: false,
      findings: [],
      errors: ["JSON root must be an object"],
      rawClassifications: [],
    };
  }

  const root = parsed as {
    summary?: string;
    findings?: LiveFindingDraft[];
    disagreements?: string[];
  };

  if (!Array.isArray(root.findings)) {
    return {
      ok: false,
      findings: [],
      errors: ["Missing findings array"],
      rawClassifications: [],
    };
  }

  const findings: QaFinding[] = [];
  let idx = 0;
  for (const draft of root.findings) {
    idx += 1;
    if (!draft || typeof draft !== "object") {
      errors.push(`Finding ${idx}: not an object`);
      continue;
    }
    const severity = asSeverity(draft.severity);
    const kind = asKind(draft.kind ?? draft.classification);
    if (draft.classification) rawClassifications.push(String(draft.classification));
    if (!severity) {
      errors.push(`Finding ${idx}: invalid severity`);
      continue;
    }
    if (!kind) {
      errors.push(`Finding ${idx}: invalid kind/classification`);
      continue;
    }
    const description = typeof draft.description === "string" ? draft.description.trim() : "";
    if (description.length < 8) {
      errors.push(`Finding ${idx}: description too short`);
      continue;
    }
    const evidenceArr = Array.isArray(draft.evidence)
      ? draft.evidence.map(String)
      : typeof draft.evidence === "string"
        ? [draft.evidence]
        : [];
    // Vague commentary without evidence cannot be verified_defect
    if (kind === "verified_defect" && evidenceArr.length === 0) {
      errors.push(`Finding ${idx}: verified_defect requires evidence`);
      continue;
    }

    const confidence = CONF.includes(draft.confidence as (typeof CONF)[number])
      ? (draft.confidence as (typeof CONF)[number])
      : "low";

    const findingId =
      typeof draft.findingId === "string" && draft.findingId.trim()
        ? draft.findingId.trim()
        : `LIVE-${agent.toUpperCase()}-${idx}`;

    const blocking = draft.blocking ?? (kind === "verified_defect" && isBlockingSeverity(severity));

    const finding: QaFinding = {
      schema: QA_FINDING_SCHEMA,
      findingId,
      agent,
      severity,
      kind,
      affected: typeof draft.affected === "string" ? draft.affected : "unspecified",
      description,
      evidence: [...evidenceArr, `provider=${meta.provider}`, `model=${meta.model}`],
      reproduction: typeof draft.reproduction === "string" ? draft.reproduction : undefined,
      recommendedCorrection:
        typeof draft.recommendedCorrection === "string" && draft.recommendedCorrection.trim()
          ? draft.recommendedCorrection
          : "Review and correct with human approval.",
      confidence,
      humanApprovalRequired: draft.humanApprovalRequired ?? blocking,
      blocking,
    };
    findings.push(finding);
  }

  // Partial success: valid findings kept; structural errors recorded
  const ok = errors.length === 0 || findings.length > 0;
  return {
    ok: errors.length === 0 ? true : ok && findings.length > 0,
    summary: typeof root.summary === "string" ? root.summary : undefined,
    findings,
    disagreements: Array.isArray(root.disagreements) ? root.disagreements.map(String) : undefined,
    errors,
    rawClassifications,
  };
}

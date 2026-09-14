import type { AdvisoryResult } from "@/lib/resilience-colors";
import type { AdvisorPriorityId } from "@/lib/advisor-priorities";

/** Anonymous / gated teaser — enough to prove value, not the full research dump. */
export type AbbreviatedAssessment = {
  depth: "abbreviated";
  resilience_signature: {
    score: number;
    grade: string;
    summary: string;
  };
  recommended: {
    provider: string;
    type: string;
    confidence: number;
    confidenceBand: "High" | "Medium" | "Low";
    latencyEstimate: string | null;
    orbitalType: string;
    why: string;
    primary_reason?: string;
    best_if?: { provider: string; condition: string }[];
  };
  top_risks: { label: string; severity: string }[];
  priorities_applied?: AdvisorPriorityId[];
  overall_score_explanation?: string;
  evidence_theme?: string;
  evidence_confidence?: { band: "High" | "Medium" | "Low"; score: number };
  methodology_blurb?: string;
  issuedAt?: string;
  modelVersion?: string;
  inputHash?: string;
};

function confidenceBand(n: number): "High" | "Medium" | "Low" {
  if (n >= 80) return "High";
  if (n >= 60) return "Medium";
  return "Low";
}

function orbitalTypeFrom(type: string): string {
  const t = type.toUpperCase();
  if (t.includes("LEO")) return "LEO";
  if (t.includes("MEO")) return "MEO";
  if (t.includes("GEO")) return "GEO";
  if (t.includes("POLAR")) return "Polar";
  return type.split(/\s+/)[0] || type;
}

/** Typical latency bands from publicly known orbital-class conventions (reference — not SLA or site measurement). */
function latencyEstimateFor(type: string, provider: string): string | null {
  const p = provider.toLowerCase();
  const t = type.toLowerCase();
  if (
    p.includes("iridium") ||
    p.includes("certus") ||
    p.includes("globalstar") ||
    t.includes("polar") ||
    t.includes("narrowband")
  ) {
    return "~150–300 ms (orbital-class reference)";
  }
  if (
    p.includes("starlink") ||
    p.includes("oneweb") ||
    p.includes("kuiper") ||
    p.includes("telesat") ||
    (t.includes("leo") && t.includes("broadband"))
  ) {
    return "~20–50 ms (orbital-class reference)";
  }
  if (t.includes("meo")) return "~100–150 ms (orbital-class reference)";
  if (t.includes("geo") || p.includes("inmarsat") || p.includes("viasat") || p.includes("vsat")) {
    return "~500–700 ms (orbital-class reference)";
  }
  if (t.includes("leo")) return "~20–50 ms (orbital-class reference)";
  return null;
}

function shortWhy(full: AdvisoryResult, topNote: string | undefined): string {
  const intel = full.intelligence?.recommendation;
  if (intel?.primary_reason) {
    const s = intel.primary_reason.trim();
    return s.length > 200 ? `${s.slice(0, 197)}…` : s;
  }
  const note = (topNote ?? "").trim();
  if (note) return note.length > 160 ? `${note.slice(0, 157)}…` : note;
  const rec = (full.recommendation ?? "").trim();
  if (!rec) return full.resilience_signature.summary;
  const sentence = rec.split(/(?<=\.)\s+/)[0] ?? rec;
  return sentence.length > 200 ? `${sentence.slice(0, 197)}…` : sentence;
}

/** Strip a full AdvisoryResult to the anonymous Initial Assessment surface. */
export function abbreviateResult(full: AdvisoryResult): AbbreviatedAssessment {
  const top = full.connectivity_options[0];
  const intel = full.intelligence?.recommendation;
  const provider = intel?.provider ?? top?.provider ?? "—";
  const type = intel?.type ?? top?.type ?? "—";
  const confidence = intel?.confidence ?? top?.confidence ?? 0;

  return {
    depth: "abbreviated",
    resilience_signature: {
      score: full.resilience_signature.score,
      grade: full.resilience_signature.grade,
      summary: full.resilience_signature.summary,
    },
    recommended: {
      provider,
      type,
      confidence,
      confidenceBand: intel?.confidenceBand ?? confidenceBand(confidence),
      latencyEstimate: latencyEstimateFor(type, provider),
      orbitalType: orbitalTypeFrom(type),
      why: shortWhy(full, top?.note),
      primary_reason: intel?.primary_reason,
      best_if: intel?.best_if?.slice(0, 1),
    },
    top_risks: full.risk_factors.slice(0, 2).map((r) => ({
      label: r.label,
      severity: r.severity,
    })),
    priorities_applied: intel?.priorities_applied,
    overall_score_explanation: full.intelligence?.overall_score_explanation,
    evidence_theme: full.evidence?.environment_theme,
    evidence_confidence: full.evidence
      ? {
          band: full.evidence.confidence.band,
          score: full.evidence.confidence.score,
        }
      : undefined,
    methodology_blurb: full.evidence?.methodology_summary
      ? full.evidence.methodology_summary.length > 180
        ? `${full.evidence.methodology_summary.slice(0, 177)}…`
        : full.evidence.methodology_summary
      : undefined,
    issuedAt: full.issuedAt,
    modelVersion: full.modelVersion,
    inputHash: full.inputHash,
  };
}

export function isAbbreviatedAssessment(value: unknown): value is AbbreviatedAssessment {
  return (
    typeof value === "object" &&
    value != null &&
    (value as AbbreviatedAssessment).depth === "abbreviated" &&
    typeof (value as AbbreviatedAssessment).recommended?.provider === "string"
  );
}

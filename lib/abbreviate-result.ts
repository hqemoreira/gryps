import type { AdvisoryResult } from "@/lib/resilience-colors"

/** Anonymous / gated teaser — enough to prove value, not the full research dump. */
export type AbbreviatedAssessment = {
  depth: "abbreviated"
  resilience_signature: {
    score: number
    grade: string
    summary: string
  }
  recommended: {
    provider: string
    type: string
    confidence: number
    confidenceBand: "High" | "Medium" | "Low"
    latencyEstimate: string | null
    orbitalType: string
    why: string
  }
  top_risks: { label: string; severity: string }[]
  issuedAt?: string
  modelVersion?: string
  inputHash?: string
}

function confidenceBand(n: number): "High" | "Medium" | "Low" {
  if (n >= 80) return "High"
  if (n >= 60) return "Medium"
  return "Low"
}

function orbitalTypeFrom(type: string): string {
  const t = type.toUpperCase()
  if (t.includes("LEO")) return "LEO"
  if (t.includes("MEO")) return "MEO"
  if (t.includes("GEO")) return "GEO"
  if (t.includes("POLAR")) return "Polar"
  return type.split(/\s+/)[0] || type
}

/** Typical latency bands from publicly known orbital-class conventions (not SLA claims). */
function latencyEstimateFor(type: string, provider: string): string | null {
  const p = provider.toLowerCase()
  const t = type.toLowerCase()
  if (p.includes("iridium") || p.includes("certus") || p.includes("globalstar") || t.includes("polar") || t.includes("narrowband")) {
    return "~150–300 ms"
  }
  if (p.includes("starlink") || p.includes("oneweb") || p.includes("kuiper") || p.includes("telesat") || (t.includes("leo") && t.includes("broadband"))) {
    return "~20–50 ms"
  }
  if (t.includes("meo")) return "~100–150 ms"
  if (t.includes("geo") || p.includes("inmarsat") || p.includes("viasat") || p.includes("vsat")) {
    return "~500–700 ms"
  }
  if (t.includes("leo")) return "~20–50 ms"
  return null
}

function shortWhy(full: AdvisoryResult, topNote: string | undefined): string {
  const note = (topNote ?? "").trim()
  if (note) return note.length > 160 ? `${note.slice(0, 157)}…` : note
  const rec = (full.recommendation ?? "").trim()
  if (!rec) return full.resilience_signature.summary
  const sentence = rec.split(/(?<=\.)\s+/)[0] ?? rec
  return sentence.length > 200 ? `${sentence.slice(0, 197)}…` : sentence
}

/** Strip a full AdvisoryResult to the anonymous Initial Assessment surface. */
export function abbreviateResult(full: AdvisoryResult): AbbreviatedAssessment {
  const top = full.connectivity_options[0]
  const provider = top?.provider ?? "—"
  const type = top?.type ?? "—"
  const confidence = top?.confidence ?? 0

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
      confidenceBand: confidenceBand(confidence),
      latencyEstimate: latencyEstimateFor(type, provider),
      orbitalType: orbitalTypeFrom(type),
      why: shortWhy(full, top?.note),
    },
    top_risks: full.risk_factors.slice(0, 2).map(r => ({
      label: r.label,
      severity: r.severity,
    })),
    issuedAt: full.issuedAt,
    modelVersion: full.modelVersion,
    inputHash: full.inputHash,
  }
}

export function isAbbreviatedAssessment(value: unknown): value is AbbreviatedAssessment {
  return (
    typeof value === "object" &&
    value != null &&
    (value as AbbreviatedAssessment).depth === "abbreviated" &&
    typeof (value as AbbreviatedAssessment).recommended?.provider === "string"
  )
}

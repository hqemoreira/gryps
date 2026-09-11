/**
 * Advisor Intelligence Layer — structured recommendation, score explanations,
 * priority-weighted ranking, and comparison rows.
 * Deterministic model commentary — not live RF / SLA claims.
 */

import {
  type RankedProvider,
  type RiskFactor,
  type ScoreComposition,
  type SectorId,
} from "@/lib/deterministic-score"
import type { AdvisorPriorityId } from "@/lib/advisor-priorities"

export type Band = "High" | "Medium" | "Low"

export type ScoreExplanation = {
  id: string
  label: string
  points: number
  max: number
  explanation: string
}

export type BestIfAlternative = {
  provider: string
  condition: string
}

export type RecommendationPackage = {
  provider: string
  type: string
  confidence: number
  confidenceBand: Band
  headline: string
  primary_reason: string
  secondary_reasons: string[]
  trade_offs: string[]
  best_if: BestIfAlternative[]
  priorities_applied: AdvisorPriorityId[]
}

export type ComparisonRow = {
  provider: string
  type: string
  coverage: Band
  latency: Band
  resilience: Band
  hardware: Band
  best_for: string
}

export type AdvisorIntelligence = {
  recommendation: RecommendationPackage
  score_explanations: ScoreExplanation[]
  comparison: ComparisonRow[]
  overall_score_explanation: string
}

type ProviderAttr = {
  coverage: Band
  latency: Band
  resilience: Band
  hardware: Band // High = more complex / demanding
  best_for: string
  mobility: Band
  bandwidth: Band
  uptime: Band
  deployment: Band // High = simpler
}

const PROVIDER_ATTRS: Record<string, ProviderAttr> = {
  starlink: {
    coverage: "High", latency: "High", resilience: "Medium", hardware: "Medium",
    best_for: "Remote high-mobility ops", mobility: "High", bandwidth: "High",
    uptime: "Medium", deployment: "High",
  },
  oneweb: {
    coverage: "High", latency: "High", resilience: "Medium", hardware: "Medium",
    best_for: "High-latitude broadband", mobility: "Medium", bandwidth: "High",
    uptime: "Medium", deployment: "Medium",
  },
  iridium: {
    coverage: "High", latency: "Medium", resilience: "High", hardware: "Low",
    best_for: "Polar backup / control", mobility: "High", bandwidth: "Low",
    uptime: "High", deployment: "High",
  },
  inmarsat: {
    coverage: "Medium", latency: "Low", resilience: "Medium", hardware: "High",
    best_for: "Maritime GEO primary", mobility: "Medium", bandwidth: "Medium",
    uptime: "Medium", deployment: "Medium",
  },
  vsat: {
    coverage: "Medium", latency: "Low", resilience: "Medium", hardware: "High",
    best_for: "Fixed GEO link", mobility: "Low", bandwidth: "Medium",
    uptime: "Medium", deployment: "Low",
  },
}

function bandFromScore(points: number, max: number): Band {
  const pct = max > 0 ? points / max : 0
  if (pct >= 0.75) return "High"
  if (pct >= 0.45) return "Medium"
  return "Low"
}

function confidenceBand(n: number): Band {
  if (n >= 80) return "High"
  if (n >= 60) return "Medium"
  return "Low"
}

function attrFor(providerName: string): ProviderAttr {
  const key = providerName.toLowerCase()
  for (const [id, attr] of Object.entries(PROVIDER_ATTRS)) {
    if (key.includes(id)) return attr
  }
  return {
    coverage: "Medium", latency: "Medium", resilience: "Medium", hardware: "Medium",
    best_for: "General connectivity", mobility: "Medium", bandwidth: "Medium",
    uptime: "Medium", deployment: "Medium",
  }
}

function bandScore(b: Band): number {
  return b === "High" ? 3 : b === "Medium" ? 2 : 1
}

/** Priority bonuses applied to backup ranking (additive to catalog confidence). */
export function priorityRankBonus(providerName: string, type: string, priorities: AdvisorPriorityId[]): number {
  if (!priorities.length) return 0
  const attr = attrFor(providerName)
  const t = type.toLowerCase()
  let bonus = 0
  for (const p of priorities) {
    switch (p) {
      case "latency":
        bonus += bandScore(attr.latency) * 4
        if (t.includes("leo") && t.includes("broadband")) bonus += 3
        break
      case "bandwidth":
        bonus += bandScore(attr.bandwidth) * 4
        if (t.includes("broadband")) bonus += 3
        break
      case "redundancy":
      case "uptime":
        bonus += bandScore(attr.resilience) * 4
        if (t.includes("narrowband") || t.includes("polar")) bonus += 4
        break
      case "coverage":
        bonus += bandScore(attr.coverage) * 4
        if (t.includes("leo") || t.includes("polar")) bonus += 3
        break
      case "mobility":
        bonus += bandScore(attr.mobility) * 4
        if (t.includes("leo")) bonus += 2
        break
      case "deployment_simplicity":
        bonus += bandScore(attr.deployment) * 4
        break
    }
  }
  return bonus
}

function explainComponent(
  id: string,
  label: string,
  points: number,
  max: number,
  ctx: { lat: number; sector: SectorId; providerCount: number },
): ScoreExplanation {
  const band = bandFromScore(points, max)
  let explanation = ""
  switch (id) {
    case "redundancy":
      explanation =
        ctx.providerCount === 0
          ? "No documented path — redundancy contributes nothing to the Signature."
          : ctx.providerCount === 1
            ? "Single-provider setup limits redundancy; correlated outage risk remains."
            : band === "High"
              ? "Multiple independent paths strengthen failover posture in the model."
              : "Some redundancy is documented, but orbital-class concentration still limits diversity."
      break
    case "latitude":
      explanation =
        ctx.lat > 70
          ? `High latitude (${ctx.lat.toFixed(1)}°N) reduces GEO usefulness and weights polar-capable LEO more heavily.`
          : ctx.lat > 65
            ? `Sub-Arctic latitude (${ctx.lat.toFixed(1)}°N) — LEO paths remain favourable; GEO elevation is constrained.`
            : `Mid-high latitude (${ctx.lat.toFixed(1)}°N) — orbital geometry is comparatively favourable in the model.`
      break
    case "operational_profile":
      explanation =
        band === "High"
          ? "Lower autonomy dependency leaves more operational margin when connectivity degrades."
          : band === "Medium"
            ? "Mixed or remote-operated profiles increase sensitivity to path loss."
            : "Autonomous / high-dependency profiles penalize weak redundancy in the Signature."
      break
    case "provider_confidence":
      explanation =
        band === "High"
          ? "Catalog confidence for the selected providers is comparatively strong at this latitude."
          : "Provider catalog confidence is moderate or degraded (e.g. GEO at high latitude)."
      break
    default:
      explanation = `${label} scored ${points}/${max} in Model v0.3.`
  }
  return { id, label, points, max, explanation }
}

export function buildScoreExplanations(
  composition: ScoreComposition,
  ctx: { lat: number; sector: SectorId; providerCount: number },
): ScoreExplanation[] {
  return composition.components.map(c =>
    explainComponent(c.id, c.label, c.points, c.max, ctx),
  )
}

export function buildOverallScoreExplanation(
  score: number,
  grade: string,
  topRisk: RiskFactor | undefined,
): string {
  const base =
    score >= 75
      ? `Resilience ${score}/100 · ${grade} — comparatively strong modeled posture for this profile.`
      : score >= 50
        ? `Resilience ${score}/100 · ${grade} — usable baseline with documented gaps before a stronger readiness posture.`
        : `Resilience ${score}/100 · ${grade} — below an acceptable threshold for this operational profile in the model.`
  if (!topRisk) return base
  return `${base} Primary modeled concern: ${topRisk.label.toLowerCase()}.`
}

function buildBestIf(options: RankedProvider[], top: RankedProvider | undefined): BestIfAlternative[] {
  const alts: BestIfAlternative[] = []
  for (const o of options.slice(0, 3)) {
    if (top && o.provider === top.provider) continue
    const attr = attrFor(o.provider)
    const t = o.type.toLowerCase()
    let condition: string
    if (t.includes("narrowband") || t.includes("polar")) {
      condition = "redundancy and polar reach matter more than throughput"
    } else if (t.includes("geo")) {
      condition = "a fixed GEO path is acceptable and mobility is secondary"
    } else if (attr.bandwidth === "High") {
      condition = "bandwidth and low latency matter more than independent polar backup"
    } else {
      condition = `you need a stronger fit for ${attr.best_for.toLowerCase()}`
    }
    alts.push({ provider: o.provider, condition })
    if (alts.length >= 2) break
  }
  return alts
}

export function buildRecommendationPackage(opts: {
  options: RankedProvider[]
  sector: SectorId
  lat: number
  priorities: AdvisorPriorityId[]
  score: number
  grade: string
}): RecommendationPackage {
  const top = opts.options[0]
  const provider = top?.provider ?? "—"
  const type = top?.type ?? "—"
  const confidence = top?.confidence ?? 0
  const attr = attrFor(provider)
  const sectorLabel = opts.sector.replace(/-/g, " ")

  const primary_reason = top
    ? `Best overall fit for ${sectorLabel} at ~${opts.lat.toFixed(1)}°N given ${attr.best_for.toLowerCase()}, modeled coverage (${attr.coverage}), and latency class (${attr.latency}).`
    : "No ranked provider available for this profile."

  const secondary_reasons: string[] = []
  if (top?.note) secondary_reasons.push(top.note)
  if (opts.priorities.length) {
    secondary_reasons.push(
      `Mission priorities applied: ${opts.priorities.join(", ").replace(/_/g, " ")}.`,
    )
  }
  if (opts.options[1]) {
    secondary_reasons.push(`${opts.options[1].provider} ranked second — ${opts.options[1].note}`)
  }

  const trade_offs: string[] = []
  if (attr.bandwidth === "Low") {
    trade_offs.push("Lower throughput than broadband LEO — better as control/backup than primary video.")
  }
  if (attr.latency === "Low") {
    trade_offs.push("Higher orbital-class latency (GEO) — less suited to latency-sensitive autonomy.")
  }
  if (attr.hardware === "High") {
    trade_offs.push("Hardware/sky-view demands are higher than compact LEO kits.")
  }
  if (attr.resilience === "Medium" || attr.resilience === "Low") {
    trade_offs.push("Pair with an independent orbital class if redundancy is mission-critical.")
  }
  if (!trade_offs.length) {
    trade_offs.push("Still requires on-site sky-view survey — model commentary is not a site measurement.")
  }

  const headline = top
    ? `Recommended: ${provider} — ${attr.best_for.toLowerCase()} for this ${sectorLabel} scenario.`
    : "No recommendation available."

  return {
    provider,
    type,
    confidence,
    confidenceBand: confidenceBand(confidence),
    headline,
    primary_reason,
    secondary_reasons: secondary_reasons.slice(0, 3),
    trade_offs: trade_offs.slice(0, 3),
    best_if: buildBestIf(opts.options, top),
    priorities_applied: opts.priorities,
  }
}

export function buildComparison(options: RankedProvider[]): ComparisonRow[] {
  return options.slice(0, 3).map(o => {
    const attr = attrFor(o.provider)
    return {
      provider: o.provider,
      type: o.type,
      coverage: attr.coverage,
      latency: attr.latency,
      resilience: attr.resilience,
      hardware: attr.hardware,
      best_for: attr.best_for,
    }
  })
}

export function buildAdvisorIntelligence(opts: {
  composition: ScoreComposition
  options: RankedProvider[]
  risks: RiskFactor[]
  sector: SectorId
  lat: number
  providerCount: number
  score: number
  grade: string
  priorities: AdvisorPriorityId[]
}): AdvisorIntelligence {
  return {
    recommendation: buildRecommendationPackage({
      options: opts.options,
      sector: opts.sector,
      lat: opts.lat,
      priorities: opts.priorities,
      score: opts.score,
      grade: opts.grade,
    }),
    score_explanations: buildScoreExplanations(opts.composition, {
      lat: opts.lat,
      sector: opts.sector,
      providerCount: opts.providerCount,
    }),
    comparison: buildComparison(opts.options),
    overall_score_explanation: buildOverallScoreExplanation(opts.score, opts.grade, opts.risks[0]),
  }
}

/** Re-sort ranked options using mission priority bonuses. */
export function applyPriorityRanking(
  options: RankedProvider[],
  priorities: AdvisorPriorityId[],
): RankedProvider[] {
  if (!priorities.length) return options
  return [...options]
    .map(o => ({
      o,
      rank: o.confidence + priorityRankBonus(o.provider, o.type, priorities),
    }))
    .sort((a, b) => b.rank - a.rank)
    .map(x => x.o)
}

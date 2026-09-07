import { Mistral } from "@mistralai/mistralai"
import { scoreDeterministic, type ScoreInput } from "@/lib/deterministic-score"
import { applyHardRules, versionSignature } from "@/lib/signature-meta"
import type { AdvisoryResult } from "@/lib/resilience-colors"

export type ResilienceOutput = AdvisoryResult

type AdviseBody = {
  site_coordinates?: { lat?: number; lng?: number }
  vertical?: string
  sector?: string
  current_setup?: string
  providers?: string[]
  autonomy_level?: string
  operation_criticality?: string
  elevation_m?: number
  email?: string
}

function toScoreInput(body: AdviseBody): ScoreInput {
  return {
    lat: body.site_coordinates?.lat,
    lng: body.site_coordinates?.lng,
    sector: body.vertical ?? body.sector ?? "other",
    autonomy: body.autonomy_level ?? "mixed",
    criticality: body.operation_criticality ?? "standard",
    providers: body.providers,
    current_setup: body.current_setup,
    elevation_m: body.elevation_m,
  }
}

/** Optional prose enrichment — never overrides numeric score / structured fields. */
async function enrichRecommendation(base: AdvisoryResult, body: AdviseBody): Promise<string> {
  if (!process.env.MISTRAL_API_KEY) return base.recommendation
  try {
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
    const response = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content:
            "You write a 2–3 sentence connectivity resilience recommendation for Nordic/Arctic ops. Do not invent a score or grade. Stay consistent with the JSON facts provided. Plain prose only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            site: body.site_coordinates,
            sector: body.vertical ?? body.sector,
            autonomy: body.autonomy_level,
            criticality: body.operation_criticality,
            signature: base.resilience_signature,
            top_risks: base.risk_factors.slice(0, 2),
            top_options: base.connectivity_options.slice(0, 2),
          }),
        },
      ],
      temperature: 0.3,
    })
    const text = response.choices?.[0]?.message?.content
    if (typeof text === "string" && text.trim().length > 20) return text.trim()
  } catch (err) {
    console.error("Mistral prose enrichment skipped:", err)
  }
  return base.recommendation
}

/**
 * Single source of truth for resilience scoring — deterministic Model v0.3.
 * Used by /api/advise and site seeding.
 */
export async function scoreSite(body: object): Promise<ResilienceOutput> {
  const input = body as AdviseBody
  const det = scoreDeterministic(toScoreInput(input))
  const structured: AdvisoryResult = {
    resilience_signature: det.resilience_signature,
    risk_factors: det.risk_factors,
    redundancy_gaps: det.redundancy_gaps,
    connectivity_options: det.connectivity_options,
    recommendation: det.recommendation,
    caveats: det.caveats,
  }

  const withProse: AdvisoryResult = {
    ...structured,
    recommendation: await enrichRecommendation(structured, input),
  }

  return versionSignature(
    applyHardRules(withProse, {
      autonomy_level: input.autonomy_level,
      operation_criticality: input.operation_criticality,
      current_setup: input.current_setup,
      providers: input.providers,
    }),
    body,
  ) as ResilienceOutput
}

/** Sync path for tests / seeding without awaiting prose */
export function scoreSiteSync(body: object): ResilienceOutput {
  const input = body as AdviseBody
  const det = scoreDeterministic(toScoreInput(input))
  const structured: AdvisoryResult = {
    resilience_signature: det.resilience_signature,
    risk_factors: det.risk_factors,
    redundancy_gaps: det.redundancy_gaps,
    connectivity_options: det.connectivity_options,
    recommendation: det.recommendation,
    caveats: det.caveats,
  }
  return versionSignature(
    applyHardRules(structured, {
      autonomy_level: input.autonomy_level,
      operation_criticality: input.operation_criticality,
      current_setup: input.current_setup,
      providers: input.providers,
    }),
    body,
  ) as ResilienceOutput
}

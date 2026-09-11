/**
 * Server-only Research Library resolution.
 * Keep Mistral / Neon / scoring out of client bundles — import this only from
 * Server Components and Route Handlers.
 */
import { EXAMPLE_SIGNATURES } from "@/lib/example-signatures"
import { SEED_SITES } from "@/lib/seed-sites"
import { scoreSiteSync } from "@/lib/scoring"
import { getSiteBySlug } from "@/lib/signatures-db"
import { MODEL_VERSION } from "@/lib/signature-meta"
import { buildEvidencePackage } from "@/lib/evidence-model"
import { parseProviders, normalizeSector } from "@/lib/deterministic-score"
import { normalizePriorities } from "@/lib/advisor-priorities"
import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors"
import {
  getResearchEntry,
  type ResolvedResearchAssessment,
} from "@/lib/research-library"

export type { ResolvedResearchAssessment }

/** Attach Sprint 5 evidence when older stored/example results lack it. */
function withEvidence(result: AdvisoryResult, input: AssessmentInputs): AdvisoryResult {
  if (result.evidence) return result
  const lat = input.lat ?? 68.2
  const sector = normalizeSector(input.sector)
  const providers = parseProviders({
    sector: input.sector,
    autonomy: input.autonomy_level,
    criticality: input.operation_criticality,
    providers: undefined,
    current_setup: input.current_setup,
    lat,
  })
  const priorities = normalizePriorities(input.priorities)
  const evidence = buildEvidencePackage({
    lat,
    sector,
    providers,
    priorities,
    recommendedProvider: result.intelligence?.recommendation.provider
      ?? result.connectivity_options[0]?.provider,
    score: result.resilience_signature.score,
    grade: result.resilience_signature.grade,
  })
  return { ...result, evidence }
}

export async function resolveResearchAssessment(slug: string): Promise<ResolvedResearchAssessment | null> {
  const entry = getResearchEntry(slug)
  if (!entry) return null

  if (entry.source === "example") {
    const ex = EXAMPLE_SIGNATURES.find(e => e.id === entry.sourceId)
    if (!ex) return null
    const result = withEvidence(ex.result, ex.input)
    return {
      entry,
      input: ex.input,
      result,
      modelVersion: result.modelVersion ?? MODEL_VERSION,
      fromDatabase: false,
    }
  }

  try {
    const row = await getSiteBySlug(entry.sourceId)
    if (row) {
      const input: AssessmentInputs = {
        lat: row.lat,
        lng: row.lng,
        sector: row.sector,
        autonomy_level: row.autonomy_level,
        operation_criticality: row.operation_criticality,
        current_setup: row.current_setup ?? undefined,
      }
      const result = withEvidence(row.output, input)
      return {
        entry,
        input,
        result,
        modelVersion: result.modelVersion ?? MODEL_VERSION,
        fromDatabase: true,
      }
    }
  } catch {
    // fall through to deterministic seed score
  }

  const seed = SEED_SITES.find(s => s.slug === entry.sourceId)
  if (!seed) return null
  const result = scoreSiteSync({
    site_coordinates: { lat: seed.lat, lng: seed.lng },
    sector: seed.sector,
    autonomy_level: seed.autonomy_level,
    operation_criticality: seed.operation_criticality,
    current_setup: seed.current_setup,
  })
  return {
    entry,
    input: {
      lat: seed.lat,
      lng: seed.lng,
      sector: seed.sector,
      autonomy_level: seed.autonomy_level,
      operation_criticality: seed.operation_criticality,
      current_setup: seed.current_setup,
    },
    result,
    modelVersion: result.modelVersion ?? MODEL_VERSION,
    fromDatabase: false,
  }
}

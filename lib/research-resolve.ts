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
import {
  getResearchEntry,
  type ResolvedResearchAssessment,
} from "@/lib/research-library"

export type { ResolvedResearchAssessment }

export async function resolveResearchAssessment(slug: string): Promise<ResolvedResearchAssessment | null> {
  const entry = getResearchEntry(slug)
  if (!entry) return null

  if (entry.source === "example") {
    const ex = EXAMPLE_SIGNATURES.find(e => e.id === entry.sourceId)
    if (!ex) return null
    return {
      entry,
      input: ex.input,
      result: ex.result,
      modelVersion: ex.result.modelVersion ?? MODEL_VERSION,
      fromDatabase: false,
    }
  }

  try {
    const row = await getSiteBySlug(entry.sourceId)
    if (row) {
      return {
        entry,
        input: {
          lat: row.lat,
          lng: row.lng,
          sector: row.sector,
          autonomy_level: row.autonomy_level,
          operation_criticality: row.operation_criticality,
          current_setup: row.current_setup ?? undefined,
        },
        result: row.output,
        modelVersion: row.output.modelVersion ?? MODEL_VERSION,
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

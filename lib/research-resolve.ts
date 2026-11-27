/**
 * Server-only Research Library resolution.
 * Keep Mistral / Neon / scoring out of client bundles — import this only from
 * Server Components and Route Handlers.
 */
import { EXAMPLE_SIGNATURES } from "@/lib/example-signatures";
import { SEED_SITES } from "@/lib/seed-sites";
import { scoreSiteSync } from "@/lib/scoring";
import { getSiteBySlug } from "@/lib/signatures-db";
import { displayModelVersion, MODEL_VERSION } from "@/lib/model-constants";
import { buildEvidencePackage, DISPLAY_CHAIN_NOTICE } from "@/lib/evidence-model";
import { BITTIMITTARI_BY_RESEARCH_SLUG } from "@/lib/bittimittari-reference";
import { parseProviders, normalizeSector } from "@/lib/deterministic-score";
import { normalizePriorities } from "@/lib/advisor-priorities";
import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors";
import { getResearchEntry, type ResolvedResearchAssessment } from "@/lib/research-library";

export type { ResolvedResearchAssessment };

/**
 * Keep a stored chain as stored. If none exists, attach a display chain from the
 * current engine without changing the score or modelVersion.
 */
export function withEvidence(
  result: AdvisoryResult,
  input: AssessmentInputs,
  finnishMunicipalitySeed = false
): AdvisoryResult {
  if (result.evidence) return result;
  const lat = input.lat ?? 68.2;
  const sector = normalizeSector(input.sector);
  const providers = parseProviders({
    sector: input.sector,
    autonomy: input.autonomy_level,
    criticality: input.operation_criticality,
    providers: undefined,
    current_setup: input.current_setup,
    lat,
  });
  const priorities = normalizePriorities(input.priorities);
  const built = buildEvidencePackage({
    lat,
    sector,
    providers,
    priorities,
    recommendedProvider:
      result.intelligence?.recommendation.provider ?? result.connectivity_options[0]?.provider,
    score: result.resilience_signature.score,
    grade: result.resilience_signature.grade,
    finnishMunicipalitySeed,
  });
  return {
    ...result,
    evidence: {
      ...built,
      chainOrigin: "display",
      limitations: [DISPLAY_CHAIN_NOTICE.en, ...built.limitations],
    },
  };
}

export async function resolveResearchAssessment(
  slug: string
): Promise<ResolvedResearchAssessment | null> {
  const entry = getResearchEntry(slug);
  if (!entry) return null;

  if (entry.source === "example") {
    const ex = EXAMPLE_SIGNATURES.find((e) => e.id === entry.sourceId);
    if (!ex) return null;
    const result = withEvidence(
      ex.result,
      ex.input,
      Boolean(BITTIMITTARI_BY_RESEARCH_SLUG[entry.slug])
    );
    return {
      entry,
      input: ex.input,
      result,
      modelVersion: displayModelVersion(result.modelVersion),
      fromDatabase: false,
    };
  }

  try {
    const row = await getSiteBySlug(entry.sourceId);
    if (row) {
      const input: AssessmentInputs = {
        lat: row.lat,
        lng: row.lng,
        sector: row.sector,
        autonomy_level: row.autonomy_level,
        operation_criticality: row.operation_criticality,
        current_setup: row.current_setup ?? undefined,
      };
      const result = withEvidence(
        row.output,
        input,
        Boolean(BITTIMITTARI_BY_RESEARCH_SLUG[entry.slug])
      );
      return {
        entry,
        input,
        result,
        modelVersion: displayModelVersion(result.modelVersion),
        fromDatabase: true,
      };
    }
  } catch {
    // fall through to deterministic seed score
  }

  const seed = SEED_SITES.find((s) => s.slug === entry.sourceId);
  if (!seed) return null;
  const result = scoreSiteSync({
    site_coordinates: { lat: seed.lat, lng: seed.lng },
    sector: seed.sector,
    autonomy_level: seed.autonomy_level,
    operation_criticality: seed.operation_criticality,
    current_setup: seed.current_setup,
  });
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
  };
}

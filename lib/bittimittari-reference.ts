/**
 * Versioned Traficom Bittimittari municipality medians for Finnish Research Library
 * assessments. Shown as MEASURED reference evidence — never blended into the 0–100 score.
 *
 * Snapshot: Traficom open data period 2026-10 (fetched 2026-10-16 via lib/real-data.ts).
 * Re-fetch: npx tsx scripts/fetch-bittimittari-snapshot.mts
 *
 * CC BY 4.0 · Traficom. Operator columns are never retained (see lib/real-data.ts).
 */

export type BittimittariReference = {
  municipality: string;
  municipalityFi: string;
  period: string;
  sampleCount: number;
  medianDownloadMbps: number;
  medianLatencyMs: number;
  /** Why this municipality maps to the research site */
  adjacencyEn: string;
  adjacencyFi: string;
};

/** Curated Finnish Research Library → municipality reference. */
export const BITTIMITTARI_BY_RESEARCH_SLUG: Record<string, BittimittariReference> = {
  "finnish-arctic-forestry-lapland": {
    municipality: "Sodankylä",
    municipalityFi: "Sodankylä",
    period: "2026-10",
    sampleCount: 6,
    medianDownloadMbps: 47.0,
    medianLatencyMs: 47,
    adjacencyEn:
      "Adjacent municipality for the ~68.2°N 27.4°E Lapland scenario coordinates — fixed-network context only.",
    adjacencyFi:
      "Viereinen kunta ~68.2°N 27.4°E Lappi-skenaariolle — vain kiinteän verkon konteksti.",
  },
  "finnish-arctic-forestry-inari": {
    municipality: "Inari",
    municipalityFi: "Inari",
    period: "2026-10",
    sampleCount: 21,
    medianDownloadMbps: 170.8,
    medianLatencyMs: 49,
    adjacencyEn: "Same municipality as the Inari forestry seed coordinates.",
    adjacencyFi: "Sama kunta kuin Inarin metsäsieemen koordinaatit.",
  },
  "finnish-arctic-mining-kittila": {
    municipality: "Kittilä",
    municipalityFi: "Kittilä",
    period: "2026-10",
    sampleCount: 7,
    medianDownloadMbps: 31.4,
    medianLatencyMs: 49,
    adjacencyEn: "Same municipality as the Kittilä mining seed coordinates.",
    adjacencyFi: "Sama kunta kuin Kittilän kaivossiemenen koordinaatit.",
  },
};

export function getBittimittariReference(slug: string): BittimittariReference | undefined {
  return BITTIMITTARI_BY_RESEARCH_SLUG[slug];
}

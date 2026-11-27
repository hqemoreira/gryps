/**
 * Historical enrichment fields stored on illustrative signature rows.
 * Pure / server-safe — no browser APIs.
 *
 * The composite real_data_score is kept for callers but is never rendered as a
 * current Signature score.
 */
export type RealDataEvidence = {
  /** Preserved for callers; not rendered as a current score. */
  realDataScore?: number | null;
  terrainPenaltyScore: number | null;
  elevationCenterM: number | null;
  elevationVarianceM: number | null;
  realWorldGapScore: number | null;
  municipality: string | null;
  bittimittariPeriod: string | null;
  bittimittariSampleCount: number | null;
  bittimittariMedianDownloadMbps: number | null;
  bittimittariMedianLatencyMs: number | null;
};

/** True when any stored enrichment field can be shown without the composite score. */
export function hasHistoricalEnrichment(data: RealDataEvidence): boolean {
  return (
    data.terrainPenaltyScore != null ||
    data.realWorldGapScore != null ||
    data.elevationCenterM != null ||
    data.bittimittariMedianDownloadMbps != null ||
    data.bittimittariSampleCount != null
  );
}

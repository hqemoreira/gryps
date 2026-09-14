import { neon } from "@neondatabase/serverless";
import type { AdvisoryResult } from "@/components/ResilienceOutput";

export type SignatureSiteRow = {
  id: number;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  sector: string;
  autonomy_level: string;
  operation_criticality: string;
  current_setup: string | null;
  output: AdvisoryResult;
  last_scored_at: string;
  // Real-data enrichment layer — see lib/real-data.ts. Nullable: not every
  // site has Finnish (Bittimittari) coverage, and rows created before the
  // enrichment ran will have these as null.
  municipality: string | null;
  country: string | null;
  bittimittari_period: string | null;
  bittimittari_sample_count: number | null;
  bittimittari_median_download_mbps: number | null;
  bittimittari_median_latency_ms: number | null;
  real_world_gap_score: number | null;
  elevation_center_m: number | null;
  elevation_variance_m: number | null;
  terrain_penalty_score: number | null;
  real_data_score: number | null;
};

export async function getAllSites(): Promise<SignatureSiteRow[]> {
  const sql = neon(process.env.NEON_DATABASE_URL!);
  const rows = await sql`SELECT * FROM signature_sites ORDER BY id ASC`;
  return rows as SignatureSiteRow[];
}

export async function getSiteBySlug(slug: string): Promise<SignatureSiteRow | null> {
  const sql = neon(process.env.NEON_DATABASE_URL!);
  const rows = await sql`SELECT * FROM signature_sites WHERE slug = ${slug} LIMIT 1`;
  return (rows[0] as SignatureSiteRow) ?? null;
}

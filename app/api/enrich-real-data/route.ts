import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { SEED_SITES } from "@/lib/seed-sites"
import { SITE_GEOGRAPHY } from "@/lib/site-geography"
import {
  getBittimittariStatsForMunicipalities,
  getElevationSamples,
  scoreRealWorldGap,
  scoreTerrainPenalty,
} from "@/lib/real-data"

// TEMP — one-time batch enrichment of the 33 existing signature_sites rows.
// Protected by a shared secret header. Remove this route once enrichment is
// confirmed complete for all 33 sites.
const ENRICH_SECRET = "gryps-real-data-enrich-2026"

export async function POST(req: NextRequest) {
  if (req.headers.get("x-enrich-secret") !== ENRICH_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const sql = neon(process.env.NEON_DATABASE_URL!)

  await sql`
    ALTER TABLE signature_sites
      ADD COLUMN IF NOT EXISTS municipality TEXT,
      ADD COLUMN IF NOT EXISTS country TEXT,
      ADD COLUMN IF NOT EXISTS bittimittari_period TEXT,
      ADD COLUMN IF NOT EXISTS bittimittari_sample_count INT,
      ADD COLUMN IF NOT EXISTS bittimittari_median_download_mbps DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS bittimittari_median_latency_ms DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS real_world_gap_score DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS elevation_center_m DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS elevation_variance_m DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS terrain_penalty_score DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS real_data_score DOUBLE PRECISION
  `
  // Explicitly never added, and never will be: an operator/VerkkoOperaattori column.

  // 1. Fetch Bittimittari stats once for every distinct Finnish municipality in play.
  const municipalities = [...new Set(
    Object.values(SITE_GEOGRAPHY).map(g => g.municipality).filter((m): m is string => m !== null)
  )]
  let bittimittariByMuni: Record<string, Awaited<ReturnType<typeof getBittimittariStatsForMunicipalities>>[string]> = {}
  try {
    bittimittariByMuni = await getBittimittariStatsForMunicipalities(municipalities)
  } catch (err) {
    return NextResponse.json({ error: "Bittimittari fetch failed", detail: String(err) }, { status: 502 })
  }

  // 2. Fetch elevation samples for all 33 sites in as few batched requests as possible.
  const coords = SEED_SITES.map(s => ({ lat: s.lat, lng: s.lng }))
  let elevationSamples
  try {
    elevationSamples = await getElevationSamples(coords)
  } catch (err) {
    return NextResponse.json({ error: "Elevation fetch failed", detail: String(err) }, { status: 502 })
  }

  // 3. Compute scores per site and update each row.
  const results: { slug: string; status: string; realDataScore?: number }[] = []

  for (let i = 0; i < SEED_SITES.length; i++) {
    const site = SEED_SITES[i]
    const geo = SITE_GEOGRAPHY[site.slug]
    const elevation = elevationSamples[i]
    const terrainPenaltyScore = scoreTerrainPenalty(elevation)

    const bittimittari = geo.municipality ? bittimittariByMuni[geo.municipality] : null
    const realWorldGapScore = bittimittari ? scoreRealWorldGap(bittimittari) : null

    const realDataScore = realWorldGapScore != null
      ? Math.round(0.55 * realWorldGapScore + 0.45 * terrainPenaltyScore)
      : terrainPenaltyScore // terrain-only when Bittimittari coverage doesn't apply (non-Finnish sites)

    try {
      await sql`
        UPDATE signature_sites SET
          municipality = ${geo.municipality},
          country = ${geo.country},
          bittimittari_period = ${bittimittari?.period ?? null},
          bittimittari_sample_count = ${bittimittari?.sampleCount ?? null},
          bittimittari_median_download_mbps = ${bittimittari?.medianDownloadMbps ?? null},
          bittimittari_median_latency_ms = ${bittimittari?.medianLatencyMs ?? null},
          real_world_gap_score = ${realWorldGapScore},
          elevation_center_m = ${elevation.elevationCenterM},
          elevation_variance_m = ${elevation.elevationVarianceM},
          terrain_penalty_score = ${terrainPenaltyScore},
          real_data_score = ${realDataScore}
        WHERE slug = ${site.slug}
      `
      results.push({ slug: site.slug, status: "ok", realDataScore })
    } catch (err) {
      console.error(`Enrich failed for ${site.slug}:`, err)
      results.push({ slug: site.slug, status: "failed" })
    }
  }

  return NextResponse.json({ done: true, count: results.length, results })
}

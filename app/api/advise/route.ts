import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { scoreSite } from "@/lib/scoring"
import { getElevationSamples, scoreTerrainPenalty } from "@/lib/real-data"
import type { RealDataEvidence } from "@/components/ResilienceOutput"

const RATE_LIMIT_MAX = 5
// Note: the "1 hour" window below is written directly into the SQL text, not
// interpolated via this constant. Neon's sql`` tagged template turns every
// ${} into a bound parameter, not literal text substitution -- INTERVAL '${x}'
// would produce invalid SQL (the placeholder ends up trapped inside the quoted
// literal). Since the window is a fixed constant we control, not user input,
// hardcoding it directly in the query text is both correct and safe.

function getClientIp(req: NextRequest): string {
  // Vercel's edge sets x-forwarded-for; first entry is the original client.
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}

export async function POST(req: NextRequest) {
  const input = await req.json()

  const { site_coordinates, vertical, current_setup, autonomy_level, operation_criticality, email } = input

  if (!vertical || !autonomy_level || !operation_criticality) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const ip = getClientIp(req)
  const sql = neon(process.env.NEON_DATABASE_URL!)

  // Ensure table + rate-limit column exist before anything else touches it.
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS advisor_submissions (
        id                  SERIAL PRIMARY KEY,
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        input               JSONB NOT NULL,
        output              JSONB NOT NULL,
        email               TEXT,
        autonomy_level      TEXT,
        criticality         TEXT,
        lat                 DOUBLE PRECISION,
        lng                 DOUBLE PRECISION
      )
    `
    await sql`ALTER TABLE advisor_submissions ADD COLUMN IF NOT EXISTS ip TEXT`
  } catch (err) {
    console.error("Neon schema setup error:", err)
    // Fail open — if the DB is unreachable we can neither rate-limit nor persist,
    // but a real visitor should still get their free analysis rather than a
    // hard block caused by an infra issue on our side.
  }

  // Rate limit — checked BEFORE the Mistral call, since the whole point is to
  // cap API cost exposure, not just log abuse after already paying for it.
  if (ip !== "unknown") {
    try {
      const rows = await sql`
        SELECT COUNT(*)::int AS count FROM advisor_submissions
        WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '1 hour'
      `
      const count = rows[0]?.count ?? 0
      if (count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "You've reached the free limit for now — try again in an hour." },
          { status: 429 }
        )
      }
    } catch (err) {
      console.error("Rate limit check failed, proceeding (fail open):", err)
    }
  }

  let output
  try {
    output = await scoreSite(input)
  } catch (err) {
    console.error("Mistral failed after retry:", err)
    return NextResponse.json({ error: "Analysis engine unavailable" }, { status: 502 })
  }

  // Live real-data evidence — terrain-only. Ad-hoc submitted coordinates have
  // no vetted municipality lookup (that's hardcoded for the 33 seed sites
  // only), so Bittimittari/real-world-gap doesn't apply here; OpenTopoData
  // works for any global coordinate, so we compute terrain penalty live.
  let realData: RealDataEvidence | undefined
  const lat = site_coordinates?.lat ?? null
  const lng = site_coordinates?.lng ?? null
  if (lat != null && lng != null) {
    try {
      const [elevation] = await getElevationSamples([{ lat, lng }])
      const terrainPenaltyScore = scoreTerrainPenalty(elevation)
      if (terrainPenaltyScore != null) {
        realData = {
          realDataScore: terrainPenaltyScore,
          terrainPenaltyScore,
          elevationCenterM: elevation.elevationCenterM,
          elevationVarianceM: elevation.elevationVarianceM,
          realWorldGapScore: null,
          municipality: null,
          bittimittariPeriod: null,
          bittimittariSampleCount: null,
          bittimittariMedianDownloadMbps: null,
          bittimittariMedianLatencyMs: null,
        }
      }
      // terrainPenaltyScore null (EU-DEM data gap, e.g. open water) — omit
      // real-data evidence entirely rather than showing a fabricated score.
    } catch (err) {
      console.error("Live elevation fetch failed, omitting real-data evidence:", err)
    }
  }

  // Store submission in Neon
  let submissionId: number | null = null
  try {
    const rows = await sql`
      INSERT INTO advisor_submissions (input, output, email, autonomy_level, criticality, lat, lng, ip)
      VALUES (${JSON.stringify(input)}, ${JSON.stringify(output)}, ${email ?? null}, ${autonomy_level}, ${operation_criticality}, ${lat}, ${lng}, ${ip})
      RETURNING id
    `
    submissionId = (rows[0]?.id as number) ?? null
  } catch (err) {
    console.error("Neon error:", err)
    // Don't fail the request — output still returned
  }

  return NextResponse.json({ ok: true, result: output, realData: realData ?? null, id: submissionId })
}

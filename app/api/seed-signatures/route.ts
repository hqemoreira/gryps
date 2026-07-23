import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { scoreSite } from "@/lib/scoring"
import { SEED_SITES } from "@/lib/seed-sites"

// TEMP — Iceland seeding only. Protected by a shared secret header (not a real
// credential, just a guard against random hits while this route is deployed).
// Remove this route entirely once the new sites are seeded.
const SEED_SECRET = "gryps-iceland-seed-2026"

export async function POST(req: NextRequest) {
  if (req.headers.get("x-seed-secret") !== SEED_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { offset = 0, count = 5 } = await req.json().catch(() => ({}))
  const batch = SEED_SITES.slice(offset, offset + count)

  if (batch.length === 0) {
    return NextResponse.json({ done: true, seeded: 0 })
  }

  const sql = neon(process.env.NEON_DATABASE_URL!)
  await sql`
    CREATE TABLE IF NOT EXISTS signature_sites (
      id                      SERIAL PRIMARY KEY,
      slug                    TEXT UNIQUE NOT NULL,
      name                    TEXT NOT NULL,
      lat                     DOUBLE PRECISION NOT NULL,
      lng                     DOUBLE PRECISION NOT NULL,
      sector                  TEXT NOT NULL,
      autonomy_level          TEXT NOT NULL,
      operation_criticality   TEXT NOT NULL,
      current_setup           TEXT,
      output                  JSONB NOT NULL,
      last_scored_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `

  const results: { slug: string; status: string }[] = []

  for (const site of batch) {
    try {
      const output = await scoreSite({
        vertical: site.sector,
        site_coordinates: { lat: site.lat, lng: site.lng },
        current_setup: site.current_setup,
        autonomy_level: site.autonomy_level,
        operation_criticality: site.operation_criticality,
      })

      await sql`
        INSERT INTO signature_sites (slug, name, lat, lng, sector, autonomy_level, operation_criticality, current_setup, output)
        VALUES (${site.slug}, ${site.name}, ${site.lat}, ${site.lng}, ${site.sector}, ${site.autonomy_level}, ${site.operation_criticality}, ${site.current_setup}, ${JSON.stringify(output)})
        ON CONFLICT (slug) DO UPDATE SET output = EXCLUDED.output, last_scored_at = NOW()
      `
      results.push({ slug: site.slug, status: "ok" })
    } catch (err) {
      console.error(`Seed failed for ${site.slug}:`, err)
      results.push({ slug: site.slug, status: "failed" })
    }
  }

  return NextResponse.json({ done: offset + count >= SEED_SITES.length, seeded: results.length, results })
}

import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { scoreSite } from "@/lib/scoring"

export async function POST(req: NextRequest) {
  const input = await req.json()

  const { site_coordinates, vertical, current_setup, autonomy_level, operation_criticality, email } = input

  if (!vertical || !autonomy_level || !operation_criticality) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  let output
  try {
    output = await scoreSite(input)
  } catch (err) {
    console.error("Mistral failed after retry:", err)
    return NextResponse.json({ error: "Analysis engine unavailable" }, { status: 502 })
  }

  // Store submission in Neon
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)
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
    const lat = site_coordinates?.lat ?? null
    const lng = site_coordinates?.lng ?? null
    await sql`
      INSERT INTO advisor_submissions (input, output, email, autonomy_level, criticality, lat, lng)
      VALUES (${JSON.stringify(input)}, ${JSON.stringify(output)}, ${email ?? null}, ${autonomy_level}, ${operation_criticality}, ${lat}, ${lng})
    `
  } catch (err) {
    console.error("Neon error:", err)
    // Don't fail the request — output still returned
  }

  return NextResponse.json({ ok: true, result: output })
}

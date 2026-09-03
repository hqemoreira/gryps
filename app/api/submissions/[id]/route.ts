import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)
    const rows = await sql`
      SELECT id, input, output, autonomy_level, criticality, lat, lng, created_at
      FROM advisor_submissions
      WHERE id = ${numericId}
      LIMIT 1
    `
    const row = rows[0]
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const input = row.input as Record<string, unknown>
    if (input && "email" in input) delete input.email

    return NextResponse.json({
      id: row.id,
      input,
      result: row.output,
      created_at: row.created_at,
    })
  } catch (err) {
    console.error("Load submission failed:", err)
    return NextResponse.json({ error: "Unavailable" }, { status: 502 })
  }
}

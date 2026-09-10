import { NextRequest, NextResponse } from "next/server"
import { abbreviateResult } from "@/lib/abbreviate-result"
import type { AdvisoryResult } from "@/lib/resilience-colors"
import { ensureAdvisorSchema, getSql } from "@/lib/db-schema"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const forceFull = req.nextUrl.searchParams.get("full") === "1"

  try {
    const sql = getSql()
    await ensureAdvisorSchema(sql)
    const rows = await sql`
      SELECT id, input, output, autonomy_level, criticality, lat, lng, created_at, unlocked_at, use_case
      FROM advisor_submissions
      WHERE id = ${numericId}
      LIMIT 1
    `
    const row = rows[0]
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const input = row.input as Record<string, unknown>
    if (input && "email" in input) delete input.email

    const full = row.output as AdvisoryResult
    const unlocked = row.unlocked_at != null

    // Full payload only when the assessment was unlocked via verified email
    // (or explicit full=1 for already-unlocked rows — share links after unlock).
    if (unlocked || (forceFull && unlocked)) {
      return NextResponse.json({
        id: row.id,
        input,
        depth: "full",
        result: full,
        unlocked: true,
        use_case: row.use_case ?? null,
        created_at: row.created_at,
      })
    }

    return NextResponse.json({
      id: row.id,
      input,
      depth: "abbreviated",
      result: abbreviateResult(full),
      unlocked: false,
      use_case: row.use_case ?? null,
      created_at: row.created_at,
    })
  } catch (err) {
    console.error("Load submission failed:", err)
    return NextResponse.json({ error: "Unavailable" }, { status: 502 })
  }
}

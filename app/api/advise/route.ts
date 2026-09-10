import { NextRequest, NextResponse } from "next/server"
import { scoreSite } from "@/lib/scoring"
import { abbreviateResult } from "@/lib/abbreviate-result"
import { ensureAdvisorSchema, getSql } from "@/lib/db-schema"

const RATE_LIMIT_MAX = 200
// Prototype: generous ceiling so local testing is not blocked. Still caps abuse.

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}

export async function POST(req: NextRequest) {
  const input = await req.json()

  // Pre-run email is intentionally ignored — unlock happens post-result.
  const { site_coordinates, vertical, current_setup, providers, autonomy_level, operation_criticality } = input
  delete input.email

  if (!vertical || !autonomy_level || !operation_criticality) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (Array.isArray(providers)) {
    input.providers = providers.filter((p: unknown) => typeof p === "string")
  }
  if (current_setup != null && typeof current_setup !== "string") {
    input.current_setup = undefined
  }

  const ip = getClientIp(req)
  const sql = getSql()

  try {
    await ensureAdvisorSchema(sql)
  } catch (err) {
    console.error("Neon schema setup error:", err)
  }

  if (ip !== "unknown") {
    try {
      const rows = await sql`
        SELECT COUNT(*)::int AS count FROM advisor_submissions
        WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '1 hour'
      `
      const count = rows[0]?.count ?? 0
      if (count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          {
            error:
              "You've reached the assessment rate limit for now — try again in an hour.",
          },
          { status: 429 },
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
    console.error("Scoring failed:", err)
    return NextResponse.json({ error: "Analysis engine unavailable" }, { status: 502 })
  }

  // Full output is persisted; abbreviated teaser is returned to the client.
  const lat = site_coordinates?.lat ?? null
  const lng = site_coordinates?.lng ?? null
  let submissionId: number | null = null
  try {
    const rows = await sql`
      INSERT INTO advisor_submissions (input, output, email, autonomy_level, criticality, lat, lng, ip)
      VALUES (${JSON.stringify(input)}, ${JSON.stringify(output)}, ${null}, ${autonomy_level}, ${operation_criticality}, ${lat}, ${lng}, ${ip})
      RETURNING id
    `
    submissionId = (rows[0]?.id as number) ?? null
  } catch (err) {
    console.error("Neon error:", err)
  }

  const abbreviated = abbreviateResult(output)

  return NextResponse.json({
    ok: true,
    depth: "abbreviated",
    result: abbreviated,
    realData: null,
    id: submissionId,
  })
}

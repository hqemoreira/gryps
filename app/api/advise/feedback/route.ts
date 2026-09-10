import { NextRequest, NextResponse } from "next/server"
import { ensureAdvisorSchema, getSql } from "@/lib/db-schema"

const ALLOWED = new Set([
  "forestry",
  "mining",
  "maritime",
  "arctic",
  "energy",
  "research",
  "other",
])

export async function POST(req: NextRequest) {
  let body: { submissionId?: number | string; useCase?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const submissionId = Number(body.submissionId)
  const useCase = typeof body.useCase === "string" ? body.useCase.trim().toLowerCase() : ""

  if (!Number.isInteger(submissionId) || submissionId < 1) {
    return NextResponse.json({ error: "Valid submissionId is required." }, { status: 400 })
  }
  if (!ALLOWED.has(useCase)) {
    return NextResponse.json({ error: "Invalid use case." }, { status: 400 })
  }

  const sql = getSql()
  try {
    await ensureAdvisorSchema(sql)
    const rows = await sql`
      UPDATE advisor_submissions
      SET use_case = ${useCase}
      WHERE id = ${submissionId}
      RETURNING id
    `
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Feedback save failed:", err)
    return NextResponse.json({ error: "Unavailable" }, { status: 502 })
  }
}

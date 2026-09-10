export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { ensureAdvisorSchema, ensureNotifySchema, getSql } from "@/lib/db-schema"
import { appBaseUrl, hashToken, newOpaqueToken, sendUnlockEmail } from "@/lib/mail"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: {
    submissionId?: number | string
    email?: string
    locale?: string
    topics?: unknown
    intent?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email || !EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
  }

  const submissionId = Number(body.submissionId)
  if (!Number.isInteger(submissionId) || submissionId < 1) {
    return NextResponse.json({ error: "Valid submissionId is required." }, { status: 400 })
  }

  const locale = body.locale === "fi" ? "fi" : "en"
  const intent = body.intent === "notify" || body.intent === "save" || body.intent === "both"
    ? body.intent
    : "unlock"
  const topics = Array.isArray(body.topics)
    ? body.topics.filter((t): t is string => typeof t === "string").slice(0, 8)
    : ["full_assessment"]

  const sql = getSql()
  try {
    await ensureAdvisorSchema(sql)
    await ensureNotifySchema(sql)
  } catch (err) {
    console.error("Schema setup failed:", err)
    return NextResponse.json({ error: "Database unavailable" }, { status: 502 })
  }

  const existing = await sql`
    SELECT id, unlocked_at FROM advisor_submissions WHERE id = ${submissionId} LIMIT 1
  `
  if (!existing[0]) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 })
  }

  // Already unlocked — attach email and return without re-sending.
  if (existing[0].unlocked_at) {
    try {
      await sql`
        UPDATE advisor_submissions SET email = ${email} WHERE id = ${submissionId} AND (email IS NULL OR email = '')
      `
    } catch (err) {
      console.error("Attach email failed:", err)
    }
    return NextResponse.json({ ok: true, alreadyUnlocked: true })
  }

  const token = newOpaqueToken()
  const tokenHash = hashToken(token)

  try {
    await sql`
      INSERT INTO notify_requests (email, topics, submission_id, token_hash, locale, intent)
      VALUES (${email}, ${topics}, ${submissionId}, ${tokenHash}, ${locale}, ${intent})
    `
    await sql`
      UPDATE advisor_submissions SET email = ${email} WHERE id = ${submissionId}
    `
  } catch (err) {
    console.error("notify_requests insert failed:", err)
    return NextResponse.json({ error: "Could not store unlock request." }, { status: 502 })
  }

  const verifyUrl = `${appBaseUrl(req.url)}/api/notify/verify?token=${token}`
  const sent = await sendUnlockEmail({ to: email, verifyUrl, locale })

  // Dev / missing Resend: still succeed but expose verify URL so manual testing works.
  if (!sent.ok) {
    const allowDevLink = process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_VERIFY_URL === "1"
    if (allowDevLink) {
      console.warn("Unlock email not sent:", sent.error, "devVerifyUrl=", verifyUrl)
      return NextResponse.json({
        ok: true,
        pending: true,
        emailSent: false,
        warning: sent.error,
        devVerifyUrl: verifyUrl,
      })
    }
    return NextResponse.json({ error: sent.error }, { status: 503 })
  }

  return NextResponse.json({ ok: true, pending: true, emailSent: true })
}

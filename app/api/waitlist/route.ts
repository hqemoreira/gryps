import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { Resend } from "resend"

const VERTICALS: Record<string, string> = {
  maritime:   "Maritime",
  forestry:   "Forestry",
  mining:     "Mining",
  arctic:     "Arctic / Polar",
  integrator: "Systems Integrator",
  other:      "Other",
}

export async function POST(req: NextRequest) {
  const { email, vertical } = await req.json()

  if (!email || !vertical) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const errors: string[] = []

  // ── Neon — store submission ────────────────────────────────────────────────
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)
    await sql`
      CREATE TABLE IF NOT EXISTS gryps_waitlist (
        id         SERIAL PRIMARY KEY,
        email      TEXT NOT NULL,
        vertical   TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await sql`
      INSERT INTO gryps_waitlist (email, vertical)
      VALUES (${email}, ${vertical})
      ON CONFLICT DO NOTHING
    `
  } catch (err) {
    console.error("Neon error:", err)
    errors.push("db")
  }

  // ── Resend — notify founder ────────────────────────────────────────────────
  // TODO: gryps.fi registers early August — once DNS/email routing is live,
  // switch from/to addresses to the gryps.fi domain (e.g. noreply@gryps.fi /
  // hello@gryps.fi). Left on the working address until then since hello@gryps.fi
  // cannot receive mail yet. Display copy already updated to hello@gryps.fi.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from:    "GRYPS <noreply@henriquemoreira.eu>",
      to:      "hqe.moreira@gmail.com",
      subject: `New GRYPS waitlist — ${email}`,
      html: `
        <div style="font-family:monospace;background:#070B12;color:#F7FAFC;padding:24px;border-radius:8px;max-width:480px">
          <p style="color:#4FA8FF;font-size:11px;letter-spacing:0.12em;margin-bottom:16px">GRYPS · WAITLIST NOTIFICATION</p>
          <p style="font-size:18px;font-weight:700;margin-bottom:4px">${email}</p>
          <p style="color:#64748B;font-size:13px;margin-bottom:20px">Sector — ${VERTICALS[vertical] ?? vertical}</p>
          <hr style="border:none;border-top:1px solid #1E293B;margin-bottom:20px"/>
          <p style="color:#64748B;font-size:11px">gryps.vercel.app · ${new Date().toUTCString()}</p>
        </div>
      `,
    })
  } catch (err) {
    console.error("Resend error:", err)
    errors.push("email")
  }

  // Return success even if email failed — submission is saved
  return NextResponse.json({ ok: true, warnings: errors })
}

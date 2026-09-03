import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()

  if (!email || !message) {
    return NextResponse.json({ error: "Email and message are required" }, { status: 400 })
  }

  if (message.length > 2000 || email.length > 200 || (name && name.length > 100)) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 })
  }

  const sql = neon(process.env.NEON_DATABASE_URL!)

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id          SERIAL PRIMARY KEY,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        name        TEXT,
        email       TEXT NOT NULL,
        message     TEXT NOT NULL
      )
    `
    await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name ?? null}, ${email}, ${message})
    `
  } catch (err) {
    console.error("Contact form DB error:", err)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from "next/server"
import { Mistral } from "@mistralai/mistralai"
import { neon } from "@neondatabase/serverless"

const SYSTEM_PROMPT = `You are GRYPS, a satellite connectivity resilience analyst for Nordic and Arctic industrial operations.

Given a site profile, return ONLY valid JSON matching this exact schema — no markdown, no explanation:

{
  "resilience_signature": {
    "score": <integer 0-100>,
    "grade": <"A" | "B" | "C" | "D" | "F">,
    "summary": <string, 1-2 sentences>
  },
  "risk_factors": [{ "label": string, "severity": "low" | "medium" | "high" | "critical", "detail": string }],
  "redundancy_gaps": [{ "label": string, "detail": string }],
  "connectivity_options": [{ "provider": string, "type": string, "confidence": integer, "note": string }],
  "recommendation": string,
  "caveats": [string]
}

Score and grade must reflect operational autonomy level and criticality. Safety-critical autonomous operations with single-provider setups should score 30-50 max. High redundancy with diverse orbital types should score 75-90. Grade mirrors score: A=85+, B=70-84, C=50-69, D=30-49, F=<30. Always include at least 2 risk factors, 1 redundancy gap, 3 connectivity options, and 2 caveats.`

async function callMistral(body: object): Promise<object> {
  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(body) },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0.3,
  })

  const text = response.choices?.[0]?.message?.content
  if (typeof text !== "string") throw new Error("Empty response from Mistral")
  return JSON.parse(text)
}

export async function POST(req: NextRequest) {
  const input = await req.json()

  const { site_coordinates, vertical, current_setup, autonomy_level, operation_criticality, email } = input

  if (!vertical || !autonomy_level || !operation_criticality) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Call Mistral — one retry on parse failure
  let output: object
  try {
    output = await callMistral(input)
  } catch {
    try {
      output = await callMistral(input)
    } catch (err) {
      console.error("Mistral failed after retry:", err)
      return NextResponse.json({ error: "Analysis engine unavailable" }, { status: 502 })
    }
  }

  // Store submission in Neon
  try {
    const sql = neon(process.env.DATABASE_URL!)
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

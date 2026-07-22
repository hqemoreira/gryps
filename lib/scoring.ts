import { Mistral } from "@mistralai/mistralai"

export const SYSTEM_PROMPT = `You are GRYPS, a satellite connectivity resilience analyst for Nordic and Arctic industrial operations.

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

export type ResilienceOutput = {
  resilience_signature: { score: number; grade: string; summary: string }
  risk_factors: { label: string; severity: string; detail: string }[]
  redundancy_gaps: { label: string; detail: string }[]
  connectivity_options: { provider: string; type: string; confidence: number; note: string }[]
  recommendation: string
  caveats: string[]
}

async function callMistralOnce(body: object): Promise<ResilienceOutput> {
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
  return JSON.parse(text) as ResilienceOutput
}

/** Single source of truth for resilience scoring — used by /api/advise and site seeding. One retry on failure. */
export async function scoreSite(body: object): Promise<ResilienceOutput> {
  try {
    return await callMistralOnce(body)
  } catch (firstErr) {
    console.error("Mistral first attempt:", firstErr)
    return await callMistralOnce(body)
  }
}

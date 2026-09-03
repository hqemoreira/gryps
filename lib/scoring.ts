import { Mistral } from "@mistralai/mistralai"
import { applyHardRules, versionSignature } from "@/lib/signature-meta"

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
  "connectivity_options": [{ "provider": string, "type": string, "confidence": integer, "note": string, "elevation": string, "coverage": string, "failover_latency": string }],
  "recommendation": string,
  "caveats": [string]
}

Score and grade must reflect operational autonomy level and criticality. Safety-critical autonomous operations with single-provider setups should score 30-50 max. High redundancy with diverse orbital types should score 75-90. Grade mirrors score: A=85+, B=70-84, C=50-69, D=30-49, F=<30. Always include at least 2 risk factors, 1 redundancy gap, 3 connectivity options, and 2 caveats.
For each connectivity option, populate elevation (typical terminal elevation / sky-view constraint at the site latitude), coverage (high-latitude coverage claim), and failover_latency (what failover would cost in time if this were a backup path). These must be structured fields, not only prose in note.

Provider coverage validation rules:
- Starlink: confirmed LEO broadband coverage at 70°N+ (polar shell expansion since 2023). Confidence 70-95.
- OneWeb: confirmed LEO broadband with polar-optimized orbit (87.9° inclination). High-latitude confidence 75-90.
- Iridium Certus: confirmed polar-orbit narrowband, true global coverage including poles. Confidence 80-95.
- Inmarsat (GEO): elevation angle degrades significantly above ~70°N. Confidence should drop to 40-60 at high Arctic latitudes.
- VSAT/GEO providers: do NOT recommend as primary above 75°N — elevation angle too low for reliable service.
- Globalstar: coverage gaps above ~70°N due to orbital inclination. Confidence 30-50 at Arctic latitudes.
- Telesat Lightspeed / Kuiper: not yet operational — mark as "planned" with confidence 40-60.
Do not fabricate providers. Only reference real, publicly known satellite operators.`

export type ResilienceOutput = {
  resilience_signature: { score: number; grade: string; summary: string }
  risk_factors: { label: string; severity: string; detail: string }[]
  redundancy_gaps: { label: string; detail: string }[]
  connectivity_options: {
    provider: string
    type: string
    confidence: number
    note: string
    elevation?: string
    coverage?: string
    failover_latency?: string
  }[]
  recommendation: string
  caveats: string[]
  issuedAt?: string
  modelVersion?: string
  inputHash?: string
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
  let raw: ResilienceOutput
  try {
    raw = await callMistralOnce(body)
  } catch (firstErr) {
    console.error("Mistral first attempt:", firstErr)
    raw = await callMistralOnce(body)
  }
  const input = body as {
    autonomy_level?: string
    operation_criticality?: string
    current_setup?: string
  }
  return versionSignature(applyHardRules(raw, input), body) as ResilienceOutput
}

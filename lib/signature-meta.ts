import { createHash } from "crypto"
import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors"
import { gradeFromDeterministicScore } from "@/lib/deterministic-score"
import { MODEL_VERSION, SCORING_ENGINE, METHODOLOGY_LABEL } from "@/lib/model-constants"

export { MODEL_VERSION, SCORING_ENGINE, METHODOLOGY_LABEL }

export function gradeFromScore(score: number): "A" | "B" | "C" | "D" | "F" {
  return gradeFromDeterministicScore(score)
}

export function hashInputs(input: object): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 16)
}

export function isSingleProviderSetup(setup?: string): boolean {
  if (!setup || !setup.trim()) return true
  const s = setup.toLowerCase()
  if (/\bno backup\b|\bsingle[- ]provider\b|\bno redundancy\b|\bno failover\b|\bnone\b/.test(s)) return true
  if (/\bdual\b|\bredundan|\bbackup\b|\bfailover\b|\band\b|\+/.test(s) && !/\bno backup\b/.test(s)) return false
  return true
}

export function hardCapApplies(body: {
  autonomy_level?: string
  operation_criticality?: string
  current_setup?: string
  providers?: string[]
}): boolean {
  const autonomy = body.autonomy_level ?? ""
  const crit = body.operation_criticality ?? ""
  const fromArr = (body.providers ?? []).filter(p => p && p !== "none")
  const single =
    fromArr.length > 0 ? fromArr.length < 2 : isSingleProviderSetup(body.current_setup)
  return (
    (autonomy === "autonomous" || autonomy === "mixed") &&
    crit === "safety-critical" &&
    single
  )
}

/** Legacy post-processor — deterministic engine already applies caps; kept for safety. */
export function applyHardRules(
  output: AdvisoryResult,
  body: {
    autonomy_level?: string
    operation_criticality?: string
    current_setup?: string
    providers?: string[]
  },
): AdvisoryResult {
  let score = Math.round(Number(output.resilience_signature?.score) || 0)
  score = Math.max(0, Math.min(100, score))
  const caveats = Array.isArray(output.caveats) ? [...output.caveats] : []
  const cap = hardCapApplies(body)
  if (cap && score > 50) {
    score = 50
    const note =
      "Hard rule applied: safety-critical autonomous operations without documented redundancy cannot score above 50."
    if (!caveats.includes(note)) caveats.push(note)
  }
  return {
    ...output,
    resilience_signature: {
      ...output.resilience_signature,
      score,
      grade: gradeFromScore(score),
    },
    caveats,
  }
}

export function versionSignature(
  output: AdvisoryResult,
  inputs: AssessmentInputs | object,
): AdvisoryResult {
  return {
    ...output,
    issuedAt: new Date().toISOString(),
    modelVersion: MODEL_VERSION,
    inputHash: hashInputs(inputs),
  }
}

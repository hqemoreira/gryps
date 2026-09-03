// Plain utility functions/types, deliberately NOT "use client" — Server Components
// (e.g. /signatures/[slug]/page.tsx) call gradeColor() directly, which is invalid
// if this module is bundled as a client boundary. Keep this file free of any
// "use client" directive, hooks, or browser APIs.

export type ConnectivityOption = {
  provider: string
  type: string
  confidence: number
  note: string
  elevation?: string
  coverage?: string
  failover_latency?: string
}

export type AdvisoryResult = {
  resilience_signature: { score: number; grade: string; summary: string }
  risk_factors: { label: string; severity: string; detail: string }[]
  redundancy_gaps: { label: string; detail: string }[]
  connectivity_options: ConnectivityOption[]
  recommendation: string
  caveats: string[]
  issuedAt?: string
  modelVersion?: string
  inputHash?: string
}

export type AssessmentInputs = {
  lat?: number
  lng?: number
  sector: string
  autonomy_level: string
  operation_criticality: string
  current_setup?: string
}

// Vivid, theme-independent — for BACKGROUND fills (buttons, decorative dots) where
// dark (#070B12) text sits permanently on top. Do not use for text drawn directly
// on var(--surface)/var(--bg) — use gradeTextColor() below for that.
export function gradeColor(grade: string) {
  return { A: "#2ED47A", B: "#4FA8FF", C: "#D97706", D: "#D97706", F: "#EF4444" }[grade] ?? "#64748B"
}

// Theme-aware — for grade/severity TEXT rendered directly on a surface. Resolves
// to a CSS var so it automatically gets the light-mode-safe darker shade.
export function gradeTextColor(grade: string) {
  return { A: "var(--accent-green)", B: "var(--accent-blue)", C: "var(--accent-amber)", D: "var(--accent-amber)", F: "var(--accent-red)" }[grade] ?? "var(--text-muted)"
}

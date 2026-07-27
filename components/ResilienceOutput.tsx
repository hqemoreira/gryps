"use client"
import Link from "next/link"
import { ShieldAlert, AlertTriangle, AlertCircle, ShieldCheck, Download } from "lucide-react"

export type AdvisoryResult = {
  resilience_signature: { score: number; grade: string; summary: string }
  risk_factors: { label: string; severity: string; detail: string }[]
  redundancy_gaps: { label: string; detail: string }[]
  connectivity_options: { provider: string; type: string; confidence: number; note: string }[]
  recommendation: string
  caveats: string[]
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

const SEV_COLOR: Record<string, string> = {
  low: "var(--accent-green)", medium: "var(--accent-amber)", high: "var(--accent-amber)", critical: "var(--accent-red)",
}

// Vivid, theme-independent — same pattern as gradeColor(), needed for alpha-blended
// tint backgrounds/borders (string-concatenated hex+alpha), which can't be built
// from a CSS var since its resolved value isn't known at string-concat time.
const SEV_COLOR_VIVID: Record<string, string> = {
  low: "#2ED47A", medium: "#D97706", high: "#D97706", critical: "#EF4444",
}

const SEV_ICON: Record<string, typeof ShieldAlert> = {
  critical: ShieldAlert, high: AlertTriangle, medium: AlertCircle, low: ShieldCheck,
}

function AssessmentInputsPanel({ input }: { input: AssessmentInputs }) {
  const strictAutonomy = input.autonomy_level === "autonomous" || input.autonomy_level === "mixed"
  const strictCriticality = input.operation_criticality === "safety-critical" || input.operation_criticality === "high"

  const rows: { label: string; value: string; note?: string }[] = [
    ...(input.lat != null && input.lng != null
      ? [{ label: "COORDINATES", value: `${input.lat.toFixed(2)}°N · ${input.lng.toFixed(2)}°E` }]
      : []),
    { label: "SECTOR", value: input.sector },
    { label: "AUTONOMY LEVEL", value: input.autonomy_level, note: strictAutonomy ? "stricter threshold applied" : undefined },
    { label: "CRITICALITY", value: input.operation_criticality, note: strictCriticality ? "stricter threshold applied" : undefined },
    { label: "CURRENT SETUP", value: input.current_setup?.trim() ? input.current_setup : "Not specified" },
  ]

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 4 }}>ASSESSMENT INPUTS</p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", marginBottom: 14 }}>
        The deterministic parameters provided for this scoring run.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", flexShrink: 0 }}>{row.label}</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text)", textAlign: "right" }}>
              {row.value}
              {row.note && (
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-amber)", marginLeft: 8 }}>↑ {row.note}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResilienceOutput({ result, input }: { result: AdvisoryResult; input?: AssessmentInputs }) {
  const { resilience_signature: sig, risk_factors, redundancy_gaps, connectivity_options, recommendation, caveats } = result
  const gc = gradeColor(sig.grade)
  const gtc = gradeTextColor(sig.grade)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
      {/* Download PDF — hidden in the printed output itself */}
      <button
        className="gryps-no-print"
        onClick={() => window.print()}
        style={{
          alignSelf: "flex-end", display: "inline-flex", alignItems: "center", gap: 6,
          backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
          borderRadius: 6, padding: "8px 14px", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)",
        }}
      >
        <Download size={13} /> Download PDF
      </button>

      {/* Signature score */}
      <div className="gryps-signature-card" style={{
        backgroundColor: "var(--surface)",
        border: `1px solid ${gc}44`,
        borderRadius: 12,
        padding: "28px 32px",
        display: "flex", alignItems: "center", gap: 32,
      }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 72, fontWeight: 900, color: gtc, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {sig.score}
          </div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", marginTop: 4 }}>RESILIENCE SCORE</div>
        </div>
        <div className="gryps-signature-divider" style={{ width: 1, height: 64, backgroundColor: "var(--border)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{
              fontFamily: "var(--font-data)", fontSize: 18, fontWeight: 900, color: gtc,
              border: `1px solid ${gc}55`, borderRadius: 6, padding: "2px 12px",
            }}>{sig.grade}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em" }}>RESILIENCE SIGNATURE</span>
          </div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{sig.summary}</p>
        </div>
      </div>

      {/* Assessment inputs */}
      {input && <AssessmentInputsPanel input={input} />}

      {/* Recommendation */}
      <div style={{
        backgroundColor: "rgba(79,168,255,0.06)", border: "1px solid rgba(79,168,255,0.2)",
        borderRadius: 8, padding: "16px 20px",
      }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-blue)", letterSpacing: "0.12em", marginBottom: 8 }}>RECOMMENDATION</p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{recommendation}</p>
      </div>

      {/* Risk factors + Redundancy gaps */}
      <div className="gryps-output-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>RISK FACTORS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {risk_factors.map((r, i) => {
              const vivid = SEV_COLOR_VIVID[r.severity] ?? "#64748B"
              const textColor = SEV_COLOR[r.severity] ?? "var(--text-muted)"
              const Icon = SEV_ICON[r.severity] ?? AlertCircle
              return (
                <div key={i} style={{
                  display: "flex", gap: 10,
                  backgroundColor: `${vivid}14`,
                  border: `1px solid ${vivid}40`,
                  borderLeft: `3px solid ${vivid}`,
                  borderRadius: 6, padding: "10px 12px",
                }}>
                  <Icon size={16} color={textColor} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)" }}>{r.label}</span>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: textColor, marginLeft: "auto", flexShrink: 0 }}>{r.severity.toUpperCase()}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{r.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>REDUNDANCY GAPS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {redundancy_gaps.map((g, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)" }}>{g.label}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-red)", marginLeft: "auto" }}>↓ SCORE IMPACT</span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{g.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connectivity options */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>CONNECTIVITY OPTIONS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {connectivity_options.map((o, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16,
              backgroundColor: "var(--surface2)", border: `1px solid ${i === 0 ? "rgba(79,168,255,0.2)" : "var(--border)"}`,
              borderRadius: 6, padding: "10px 14px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{o.provider}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", backgroundColor: "var(--border)", padding: "1px 6px", borderRadius: 3 }}>{o.type}</span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}>{o.note}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 22, fontWeight: 700, color: i === 0 ? "var(--accent-blue)" : "var(--text)", lineHeight: 1 }}>
                  {o.confidence}<span style={{ fontSize: 10, color: "var(--text-muted)" }}>%</span>
                </div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.1em" }}>CONFIDENCE</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caveats */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)", border: "1px solid var(--border)", borderRadius: 3, padding: "2px 5px", flexShrink: 0, marginTop: 2 }}>AI</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>
          {caveats.join(" · ")} · <Link href="/legal/terms#section-04" style={{ color: "var(--text-dim)", textDecoration: "underline" }}>Art. 50 EU AI Act</Link>
        </p>
      </div>

      {/* Print-only — generated date + attribution, invisible on screen */}
      <div className="gryps-print-only" style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>
          Generated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · GRYPS — Connectivity Resilience Advisor · gryps.vercel.app
        </p>
      </div>
    </div>
  )
}

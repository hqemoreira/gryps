import Link from "next/link"

export type AdvisoryResult = {
  resilience_signature: { score: number; grade: string; summary: string }
  risk_factors: { label: string; severity: string; detail: string }[]
  redundancy_gaps: { label: string; detail: string }[]
  connectivity_options: { provider: string; type: string; confidence: number; note: string }[]
  recommendation: string
  caveats: string[]
}

export function gradeColor(grade: string) {
  return { A: "#2ED47A", B: "#4FA8FF", C: "#D97706", D: "#D97706", F: "#EF4444" }[grade] ?? "#64748B"
}

const SEV_COLOR: Record<string, string> = {
  low: "#2ED47A", medium: "#D97706", high: "#D97706", critical: "#EF4444",
}

export function ResilienceOutput({ result }: { result: AdvisoryResult }) {
  const { resilience_signature: sig, risk_factors, redundancy_gaps, connectivity_options, recommendation, caveats } = result
  const gc = gradeColor(sig.grade)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
      {/* Signature score */}
      <div className="gryps-signature-card" style={{
        backgroundColor: "var(--surface)",
        border: `1px solid ${gc}44`,
        borderRadius: 12,
        padding: "28px 32px",
        display: "flex", alignItems: "center", gap: 32,
      }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 72, fontWeight: 900, color: gc, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {sig.score}
          </div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", marginTop: 4 }}>RESILIENCE SCORE</div>
        </div>
        <div className="gryps-signature-divider" style={{ width: 1, height: 64, backgroundColor: "var(--border)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{
              fontFamily: "var(--font-data)", fontSize: 18, fontWeight: 900, color: gc,
              border: `1px solid ${gc}55`, borderRadius: 6, padding: "2px 12px",
            }}>{sig.grade}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em" }}>RESILIENCE SIGNATURE</span>
          </div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{sig.summary}</p>
        </div>
      </div>

      {/* Recommendation */}
      <div style={{
        backgroundColor: "rgba(79,168,255,0.06)", border: "1px solid rgba(79,168,255,0.2)",
        borderRadius: 8, padding: "16px 20px",
      }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "#4FA8FF", letterSpacing: "0.12em", marginBottom: 8 }}>RECOMMENDATION</p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{recommendation}</p>
      </div>

      {/* Risk factors + Redundancy gaps */}
      <div className="gryps-output-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>RISK FACTORS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {risk_factors.map((r, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: SEV_COLOR[r.severity] ?? "#64748B", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)" }}>{r.label}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: SEV_COLOR[r.severity] ?? "#64748B", marginLeft: "auto" }}>{r.severity.toUpperCase()}</span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, paddingLeft: 14 }}>{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>REDUNDANCY GAPS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {redundancy_gaps.map((g, i) => (
              <div key={i}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)", marginBottom: 4 }}>{g.label}</p>
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
                <div style={{ fontFamily: "var(--font-data)", fontSize: 22, fontWeight: 700, color: i === 0 ? "#4FA8FF" : "var(--text)", lineHeight: 1 }}>
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
    </div>
  )
}

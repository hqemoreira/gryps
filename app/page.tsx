"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Radio, Shield, Zap, ChevronRight, Globe2, AlertTriangle, Sun, Moon } from "lucide-react"

// ── GRYPS Mark ────────────────────────────────────────────────────────────────
function GrypsMark({ size = 36, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 18 A14 14 0 0 1 32 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none"
        className={animate ? "gryps-arc-geo" : undefined} opacity={animate ? undefined : 0.5} />
      <path d="M8 18 A10 10 0 0 1 28 18" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" fill="none"
        className={animate ? "gryps-arc-meo" : undefined} opacity={animate ? undefined : 0.75} />
      <path d="M12 18 A6 6 0 0 1 24 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none"
        className={animate ? "gryps-arc-leo" : undefined} />
      <line x1="18" y1="20" x2="18" y2="10" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 13 L18 9 L21 13" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="18" cy="21" r="1.5" fill="#4FA8FF"/>
      {animate && (
        <style>{`
          @keyframes gryps-broadcast-leo { 0% { opacity: 1; filter: drop-shadow(0 0 3px #4FA8FF); } 12%, 100% { opacity: 0.2; } }
          @keyframes gryps-broadcast-meo { 0%, 12% { opacity: 0.25; } 16% { opacity: 1; filter: drop-shadow(0 0 3px #6EE7F9); } 28%, 100% { opacity: 0.25; } }
          @keyframes gryps-broadcast-geo { 0%, 28% { opacity: 0.3; } 32% { opacity: 1; filter: drop-shadow(0 0 3px #4FA8FF); } 44%, 100% { opacity: 0.3; } }
          .gryps-arc-leo { animation: gryps-broadcast-leo 2.4s ease-in-out infinite; }
          .gryps-arc-meo { animation: gryps-broadcast-meo 2.4s ease-in-out infinite; }
          .gryps-arc-geo { animation: gryps-broadcast-geo 2.4s ease-in-out infinite; }
        `}</style>
      )}
    </svg>
  )
}

// ── Grade colour ──────────────────────────────────────────────────────────────
function gradeColor(grade: string) {
  return { A: "#2ED47A", B: "#4FA8FF", C: "#F5B84A", D: "#F5B84A", F: "#EF4444" }[grade] ?? "#64748B"
}

// ── Resilience Signature output ───────────────────────────────────────────────
type AdvisoryResult = {
  resilience_signature: { score: number; grade: string; summary: string }
  risk_factors: { label: string; severity: string; detail: string }[]
  redundancy_gaps: { label: string; detail: string }[]
  connectivity_options: { provider: string; type: string; confidence: number; note: string }[]
  recommendation: string
  caveats: string[]
}

const SEV_COLOR: Record<string, string> = {
  low: "#2ED47A", medium: "#F5B84A", high: "#F5B84A", critical: "#EF4444",
}

function ResilienceOutput({ result }: { result: AdvisoryResult }) {
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

// ── Advisor form ──────────────────────────────────────────────────────────────
function AdvisorForm({ t }: { t: typeof COPY.en }) {
  const [lat, setLat]         = useState("")
  const [lng, setLng]         = useState("")
  const [vertical, setVertical]   = useState("")
  const [setup, setSetup]     = useState("")
  const [autonomy, setAutonomy]   = useState("")
  const [criticality, setCriticality] = useState("")
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<AdvisoryResult | null>(null)
  const [error, setError]     = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vertical || !autonomy || !criticality) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
          vertical,
          current_setup: setup || undefined,
          autonomy_level: autonomy,
          operation_criticality: criticality,
          email: email || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.result) throw new Error(data.error ?? "Analysis failed")
      setResult(data.result as AdvisoryResult)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--surface2)",
    border: "1px solid var(--border2)",
    borderRadius: 6,
    padding: "10px 14px",
    fontFamily: "var(--font-data)",
    fontSize: 12,
    color: "var(--text)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" }
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)",
    letterSpacing: "0.1em", display: "block", marginBottom: 6,
  }

  if (result) {
    return (
      <div>
        <ResilienceOutput result={result} />
        <button
          onClick={() => { setResult(null); setLoading(false) }}
          style={{
            marginTop: 20, display: "flex", alignItems: "center", gap: 6,
            backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: 6, padding: "9px 16px", cursor: "pointer",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)",
          }}
        >
          ← {t.analyseAnother}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Coordinates row */}
      <div className="gryps-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>LATITUDE (optional)</label>
          <input type="number" step="any" placeholder="68.2" value={lat} onChange={e => setLat(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>LONGITUDE (optional)</label>
          <input type="number" step="any" placeholder="27.4" value={lng} onChange={e => setLng(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {/* Vertical + autonomy row */}
      <div className="gryps-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>{t.sectorLabel} *</label>
          <select value={vertical} onChange={e => setVertical(e.target.value)} required style={{ ...selectStyle, color: vertical ? "var(--text)" : "var(--text-muted)" }}>
            <option value="" disabled>{t.sectorPlaceholder}</option>
            <option value="forestry">Forestry</option>
            <option value="maritime">Maritime</option>
            <option value="mining">Mining</option>
            <option value="arctic">Arctic / Polar</option>
            <option value="integrator">Systems Integrator</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>{t.autonomyLabel} *</label>
          <select value={autonomy} onChange={e => setAutonomy(e.target.value)} required style={{ ...selectStyle, color: autonomy ? "var(--text)" : "var(--text-muted)" }}>
            <option value="" disabled>{t.autonomyPlaceholder}</option>
            <option value="manual">Manual operations</option>
            <option value="remote-operated">Remote-operated</option>
            <option value="autonomous">Autonomous</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Criticality */}
      <div>
        <label style={labelStyle}>{t.criticalityLabel} *</label>
        <select value={criticality} onChange={e => setCriticality(e.target.value)} required style={{ ...selectStyle, color: criticality ? "var(--text)" : "var(--text-muted)" }}>
          <option value="" disabled>{t.criticalityPlaceholder}</option>
          <option value="standard">Standard</option>
          <option value="high">High criticality</option>
          <option value="safety-critical">Safety-critical</option>
        </select>
      </div>

      {/* Current setup */}
      <div>
        <label style={labelStyle}>CURRENT CONNECTIVITY SETUP (optional)</label>
        <input
          type="text"
          placeholder="e.g. Starlink standard kit, no backup link"
          value={setup}
          onChange={e => setSetup(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>EMAIL (optional)</label>
        <input
          type="email"
          placeholder="your@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", marginTop: 6 }}>
          {t.emailHint}
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#EF4444" }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !vertical || !autonomy || !criticality}
        style={{
          backgroundColor: loading ? "var(--surface2)" : "#4FA8FF",
          color: loading ? "var(--text-muted)" : "#070B12",
          border: "none", borderRadius: 6, padding: "13px 20px",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
          cursor: loading ? "wait" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background 0.15s",
          opacity: (!vertical || !autonomy || !criticality) ? 0.5 : 1,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid var(--text-dim)", borderTopColor: "#4FA8FF", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            {t.analysing}
          </>
        ) : (
          <>{t.runAdvisor} <ArrowRight size={14} /></>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}

// ── Telemetry stream ──────────────────────────────────────────────────────────
const TELEMETRY_LINES = [
  { tag: "GRYPS-INIT", color: "#4FA8FF",  text: "Ingesting orbital telemetry for 68.2°N · 27.4°E…" },
  { tag: "LEO-SCAN",   color: "#6EE7F9",  text: "Starlink Shell-4 pass density: 94.2%  [OPTIMAL]" },
  { tag: "GEO-CHECK",  color: "#F5B84A",  text: "Viasat ViaSat-3 horizon angle: 8.3°   [HIGH ATTENUATION RISK]" },
  { tag: "MEO-EVAL",   color: "#6EE7F9",  text: "OneWeb elevation window: 62°–89°      [STRONG]" },
  { tag: "CANOPY",     color: "#F5B84A",  text: "Pine canopy blockage penalty applied: −6.2 dB" },
  { tag: "REDUND",     color: "#4FA8FF",  text: "Dual-orbit redundancy path: Starlink + Iridium NEXT" },
  { tag: "SCORE",      color: "#2ED47A",  text: "Deployment Confidence computed: 94 · 81 · 67" },
  { tag: "REPORT",     color: "#2ED47A",  text: "Resilience signature generated — ready for export" },
]

function TelemetryStream({ t }: { t: typeof COPY.en }) {
  const [visible, setVisible] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setVisible(v => v < TELEMETRY_LINES.length ? v + 1 : 1), 900)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{
      backgroundColor: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "16px 18px", fontFamily: "var(--font-data)",
      fontSize: 11, lineHeight: 2, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 6px #2ED47A" }} />
        <span style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.1em" }}>{t.telemetryHeader}</span>
      </div>
      {TELEMETRY_LINES.map((line, i) => (
        <div key={i} style={{
          display: "flex", gap: 12,
          opacity: i < visible ? (i === visible - 1 ? 1 : 0.45) : 0,
          transition: "opacity 0.4s ease", whiteSpace: "nowrap", overflow: "hidden",
        }}>
          <span style={{ color: line.color, minWidth: 80, flexShrink: 0 }}>[{line.tag}]</span>
          <span style={{ color: i === visible - 1 ? "var(--text)" : "var(--text-muted)" }}>{line.text}</span>
        </div>
      ))}
    </div>
  )
}

// ── Polar map ─────────────────────────────────────────────────────────────────
function PolarMap({ t }: { t: typeof COPY.en }) {
  const cx = 200, cy = 195, maxR = 160
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let raf: number
    const start = performance.now()
    function loop(now: number) { setTick((now - start) / 1000); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const latLines = [90, 80, 70, 60, 50]
  const markers = [
    { lat: 68.2, lon: 27.4, label: "68.2°N", active: true },
    { lat: 71.0, lon: 25.9, label: "71.0°N", active: false },
    { lat: 64.5, lon: -21.9, label: "64.5°N", active: false },
    { lat: 78.2, lon: 15.6, label: "78.2°N", active: false },
  ]
  function latToR(lat: number) { return ((90 - lat) / 50) * maxR }
  function toXY(lat: number, lon: number) {
    const r = latToR(lat), angle = (lon * Math.PI) / 180 - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }
  function satPos(r: number, speed: number, offset: number) {
    const a = tick * speed + offset
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const starlink = satPos(latToR(67), 1.5, 0)
  const oneweb   = satPos(latToR(71), 1.1, 2.4)
  const iridium  = satPos(latToR(74), 0.8, 4.7)
  const activePt = toXY(68.2, 27.4)
  const pulsePct = (Math.sin(tick * 2.5) + 1) / 2
  const pulseR   = 6 + pulsePct * 5
  const signalOpacity = 0.15 + 0.2 * ((Math.sin(tick * 3) + 1) / 2)

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>{t.polarHeader}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 5px #2ED47A" }} />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "#2ED47A", letterSpacing: "0.08em" }}>LIVE</span>
        </div>
      </div>
      <svg width="100%" viewBox="0 0 400 390" style={{ display: "block" }}>
        {latLines.map(lat => (
          <circle key={lat} cx={cx} cy={cy} r={latToR(lat)} fill="none"
            stroke="var(--border)" strokeWidth={lat === 70 ? 1.2 : 0.7}
            strokeDasharray={lat === 70 ? "none" : "3 4"} />
        ))}
        {[-90, -45, 0, 45, 90, 135].map(lon => {
          const angle = (lon * Math.PI) / 180 - Math.PI / 2
          return <line key={lon} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="var(--border)" strokeWidth={0.6} opacity={0.5} />
        })}
        <text x={cx + latToR(70) + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="var(--text-dim)">70°N</text>
        <text x={cx + latToR(60) + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="var(--text-dim)">60°N</text>
        <circle cx={cx} cy={cy} r={latToR(50)} fill="rgba(79,168,255,0.04)" />
        <circle cx={cx} cy={cy} r={latToR(70)} fill="rgba(110,231,249,0.05)" />
        <line x1={activePt.x} y1={activePt.y} x2={starlink.x} y2={starlink.y}
          stroke="#4FA8FF" strokeWidth={0.8} strokeDasharray="4 3" opacity={signalOpacity} />
        {markers.map((m, i) => {
          const pos = toXY(m.lat, m.lon)
          return (
            <g key={i}>
              {m.active && <circle cx={pos.x} cy={pos.y} r={pulseR} fill="rgba(79,168,255,0.08)" />}
              {m.active && <circle cx={pos.x} cy={pos.y} r={pulseR + 4} fill="none" stroke="rgba(79,168,255,0.06)" strokeWidth={1} />}
              <circle cx={pos.x} cy={pos.y} r={m.active ? 3 : 2} fill={m.active ? "#4FA8FF" : "var(--text-dim)"} />
              {m.active && <text x={pos.x + 6} y={pos.y - 5} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="#4FA8FF">{m.label}</text>}
            </g>
          )
        })}
        <circle cx={starlink.x} cy={starlink.y} r={5} fill="rgba(79,168,255,0.15)" />
        <circle cx={starlink.x} cy={starlink.y} r={2.5} fill="#4FA8FF" />
        <text x={starlink.x + 5} y={starlink.y - 4} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="#4FA8FF">SL</text>
        <circle cx={oneweb.x} cy={oneweb.y} r={4} fill="rgba(110,231,249,0.12)" />
        <circle cx={oneweb.x} cy={oneweb.y} r={2} fill="#6EE7F9" />
        <text x={oneweb.x + 4} y={oneweb.y - 3} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="#6EE7F9">OW</text>
        <circle cx={iridium.x} cy={iridium.y} r={3.5} fill="rgba(245,184,74,0.12)" />
        <circle cx={iridium.x} cy={iridium.y} r={1.8} fill="#F5B84A" />
        <text x={iridium.x + 4} y={iridium.y - 3} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="#F5B84A">IR</text>
        <circle cx={cx} cy={cy} r={2} fill="var(--text-dim)" />
        <text x={cx + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 9 }} fill="var(--text-dim)">N</text>
      </svg>
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: "var(--font-data)", fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>{label}</span>
    </div>
  )
}

const DARK: Record<string, string> = {
  "--bg": "#070B12", "--surface": "#0B1220", "--surface2": "#111827",
  "--border": "#1E293B", "--border2": "#253347",
  "--text": "#F7FAFC", "--text-muted": "#64748B", "--text-dim": "#334155",
}
const LIGHT: Record<string, string> = {
  "--bg": "#F4F6F9", "--surface": "#FFFFFF", "--surface2": "#EEF1F6",
  "--border": "#DDE2EC", "--border2": "#C8D0DE",
  "--text": "#0B1220", "--text-muted": "#5A6A84", "--text-dim": "#9AAABF",
}

// ── Copy (EN / FI) ───────────────────────────────────────────────────────────
const COPY = {
  en: {
    tag:        "CONNECTIVITY RESILIENCE · NORDIC & ARCTIC OPERATIONS",
    navCta:     "Free analysis",
    h1:         ["Connectivity resilience", "for autonomous and", "remote operations."],
    sub:        "Remote sites, autonomous fleets, and critical operations fail without connectivity. GRYPS scores, documents, and monitors that risk — giving you a Resilience Signature before deployment depends on it.",
    nis2line:   "NIS2/CER-aligned resilience reporting · Espoo, Finland · R&D prototype",
    statsL1:    "Providers indexed",
    statsL2:    "All orbital types",
    statsL3:    "Polar coverage",
    advisorCta: "Get your site's Resilience Signature",
    advisorSub: "Free · Takes 60 seconds · No account needed",
    sectorLabel:        "OPERATIONAL SECTOR",
    sectorPlaceholder:  "Select sector",
    autonomyLabel:      "AUTONOMY LEVEL",
    autonomyPlaceholder:"Select autonomy level",
    criticalityLabel:   "OPERATION CRITICALITY",
    criticalityPlaceholder: "Select criticality",
    emailHint:  "Get notified when conditions affecting your site change — seeds your monitoring profile at zero extra cost.",
    runAdvisor: "Run resilience analysis",
    analysing:  "Analysing your site…",
    analyseAnother: "Analyse another site",
    telemetryLabel:  "ILLUSTRATIVE ENGINE OUTPUT — NOT LIVE DATA",
    telemetryHeader: "ORBITAL INTELLIGENCE ENGINE · LIVE",
    problemL: "The resilience gap GRYPS closes",
    problems: [
      { title: "Autonomous operations have zero margin",    body: "A harvester fleet at −30°C. An offshore platform check-in. A remote mining sensor cluster. When connectivity fails in these environments it isn't an inconvenience — it's a safety event, an operational halt, or a regulatory incident." },
      { title: "Single-provider setups are fragile by design", body: "Most sites run one satellite provider with no documented fallback. Pass geometry, weather windows, and orbital outages are invisible risks until they materialise. GRYPS makes them legible before deployment." },
      { title: "NIS2 and CER require documented resilience",   body: "Directive compliance increasingly demands that critical operators document connectivity risk and mitigation. A Resilience Signature is evidence your site's connectivity was assessed, scored, and monitored." },
    ],
    howL:  "How the Resilience Advisor works",
    steps: [
      { n: "01", title: "Enter site profile",    body: "Coordinates, sector, and current setup. Elevation and terrain are factored automatically." },
      { n: "02", title: "Set autonomy level",    body: "Manual, remote-operated, autonomous, or mixed. Scoring weights shift with operational dependency on connectivity." },
      { n: "03", title: "Set criticality",       body: "Standard, high, or safety-critical. A safety-critical autonomous site with no redundancy cannot score above 50." },
      { n: "04", title: "Get your Signature",   body: "Score, grade, risk factors, redundancy gaps, ranked providers, and plain-language recommendation — in seconds." },
    ],
    polarHeader: "COVERAGE ZONE — NORDIC & ARCTIC",
    ctaH2:  "Resilience starts with knowing your score.",
    ctaSub: "Free Resilience Signature for any Nordic or Arctic site. No account, no sales call — just your connectivity risk, scored and documented.",
    ctaBtn: "Get your Resilience Signature",
    footerRights: "© 2026 GRYPS · Espoo, Finland · Non-commercial R&D prototype · No registered company · No revenue generated",
    footerTag:    "Built in Finland for high-latitude resilience.",
  },
  fi: {
    tag:        "YHTEYDEN RESILIENSSI · POHJOISMAAT JA ARKTINEN",
    navCta:     "Ilmainen analyysi",
    h1:         ["Yhteyden resilienssi", "autonomisille ja", "etätoiminnoille."],
    sub:        "Etäkohteet, autonomiset laivastot ja kriittiset toiminnot epäonnistuvat ilman yhteyttä. GRYPS pisteytyää, dokumentoi ja seuraa tätä riskiä — antaen sinulle Resilience Signature -todistuksen ennen kuin käyttöönotto siitä riippuu.",
    nis2line:   "NIS2/CER-yhteensopiva resilienssirapor­tointi · Espoo, Suomi · T&K-prototyyppi",
    statsL1:    "Palveluntarjoajaa indeksoitu",
    statsL2:    "Kaikki orbitaalityypit",
    statsL3:    "Napapiirin kattavuus",
    advisorCta: "Hanki kohteesi Resilience Signature",
    advisorSub: "Ilmainen · 60 sekuntia · Ei tiliä tarvita",
    sectorLabel:        "TOIMIALA",
    sectorPlaceholder:  "Valitse toimiala",
    autonomyLabel:      "AUTONOMIATASO",
    autonomyPlaceholder:"Valitse autonomiataso",
    criticalityLabel:   "TOIMINNAN KRIITTISYYS",
    criticalityPlaceholder: "Valitse kriittisyystaso",
    emailHint:  "Saa ilmoitus, kun kohteesi olosuhteet muuttuvat — käynnistää seurantaprofiilin ilman lisäkustannuksia.",
    runAdvisor: "Suorita resilienssianalyysi",
    analysing:  "Analysoidaan kohdetta…",
    analyseAnother: "Analysoi toinen kohde",
    telemetryLabel:  "HAVAINNOLLISTAVA MOOTTORILÄHTÖ — EI LIVE-DATAA",
    telemetryHeader: "ORBITAALINEN TIEDUSTELUMOOTTORI · LIVE",
    problemL: "Resilienssiaukko, jonka GRYPS sulkee",
    problems: [
      { title: "Autonomisilla toiminnoilla ei ole varaa virheisiin", body: "Harvesterilaivaston signaali katoaa −30°C:ssa. Offshore-alustan turvatarkistus epäonnistuu. Etäkaivoksen anturiklusteri menettää yhteyden. Näissä ympäristöissä yhteyskatkot eivät ole haittoja — ne ovat turvallisuustapahtumia." },
      { title: "Yhden toimittajan ratkaisut ovat rakenteellisesti haavoittuvia", body: "Useimmat kohteet käyttävät yhtä satelliittitoimittajaa ilman dokumentoitua varajärjestelmää. Ohitusgeometria, sääikkunat ja orbitaalikatkot ovat näkymättömiä riskejä, kunnes ne toteutuvat. GRYPS tekee ne näkyväksi ennen käyttöönottoa." },
      { title: "NIS2 ja CER vaativat dokumentoitua resilienssiä", body: "Direktiivien noudattaminen edellyttää yhä useammin, että kriittiset operaattorit dokumentoivat yhteysriskin ja lieventämistoimenpiteet. Resilience Signature on todiste siitä, että kohteesi yhteys on arvioitu, pisteytetty ja seurattu." },
    ],
    howL:  "Miten Resilience Advisor toimii",
    steps: [
      { n: "01", title: "Syötä kohteen profiili",  body: "Koordinaatit, toimiala ja nykyinen järjestelmä. Korkeus ja maasto huomioidaan automaattisesti." },
      { n: "02", title: "Aseta autonomiataso",      body: "Manuaalinen, etäoperoitu, autonominen tai sekoitettu. Pisteytyksen painot muuttuvat operatiivisen yhteyksiriippuvuuden mukaan." },
      { n: "03", title: "Aseta kriittisyys",        body: "Standardi, korkea tai turvallisuuskriittinen. Turvallisuuskriittinen autonominen kohde ilman redundanssia ei voi saada yli 50 pistettä." },
      { n: "04", title: "Saat Signaturesi",        body: "Pisteet, arvosana, riskitekijät, redundanssiaukot, rankatut toimittajat ja selkokielinen suositus — sekunneissa." },
    ],
    polarHeader: "KATTAVUUSALUE — POHJOISMAAT JA ARKTINEN",
    ctaH2:  "Resilienssi alkaa pisteidesi tuntemisesta.",
    ctaSub: "Ilmainen Resilience Signature mille tahansa pohjoismaiselle tai arktiselle kohteelle. Ei tiliä, ei myyntipuheluita — vain yhteyksiriskisi pisteytettynä ja dokumentoituna.",
    ctaBtn: "Hanki Resilience Signature",
    footerRights: "© 2026 GRYPS · Espoo, Suomi · Ei-kaupallinen T&K-prototyyppi · Ei rekisteröityä yritystä · Ei tuloja",
    footerTag:    "Rakennettu Suomessa korkean leveysasteen resilienssille.",
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [dark, setDark] = useState(true)
  const [lang, setLang] = useState<"en" | "fi">("en")
  const t = COPY[lang]

  useEffect(() => {
    const vars = dark ? DARK : LIGHT
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
  }, [dark])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>

      {/* Non-commercial banner */}
      <div className="gryps-banner" style={{
        backgroundColor: "rgba(245,184,74,0.06)",
        borderBottom: "1px solid rgba(245,184,74,0.2)",
        padding: "6px 32px",
        textAlign: "center",
        fontFamily: "var(--font-data)",
        fontSize: 9,
        color: "#F5B84A",
        letterSpacing: "0.07em",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        backdropFilter: "blur(12px)",
      }}>
        R&D PROTOTYPE · EARLY ACCESS · {lang === "en" ? "ESPOO, FINLAND" : "ESPOO, SUOMI"}
      </div>

      {/* Nav */}
      <header className="gryps-nav-inner" style={{
        position: "fixed", top: 28, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        backgroundColor: dark ? "rgba(7,11,18,0.92)" : "rgba(244,246,249,0.92)",
        backdropFilter: "blur(12px)",
        padding: "0 32px",
        height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GrypsMark size={28} animate />
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 15, letterSpacing: "0.12em", color: "var(--text)" }}>GRYPS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span className="gryps-nav-label" style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>CONNECTIVITY INTELLIGENCE</span>
          <div style={{ display: "flex", border: "1px solid var(--border2)", borderRadius: 6, overflow: "hidden" }}>
            {(["en", "fi"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? "var(--border2)" : "transparent",
                border: "none", padding: "5px 10px", cursor: "pointer",
                fontFamily: "var(--font-data)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.08em",
                color: lang === l ? "var(--text)" : "var(--text-muted)",
                transition: "background 0.15s",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button
            onClick={() => setDark(d => !d)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: 6, width: 32, height: 32, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <a href="#advisor" style={{
            fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 700,
            color: "#4FA8FF", textDecoration: "none",
            border: "1px solid rgba(79,168,255,0.3)",
            padding: "6px 14px", borderRadius: 5,
          }}>{t.navCta}</a>
        </div>
      </header>

      {/* Hero */}
      <section className="gryps-section-pad" style={{ paddingTop: 148, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, maxWidth: 1200, margin: "0 auto" }}>
        <div className="gryps-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 8px #2ED47A" }} />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.14em" }}>{t.tag}</span>
            </div>

            <h1 className="gryps-hero-h1" style={{
              fontFamily: "var(--font-ui)", fontSize: 44, fontWeight: 700,
              lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 20,
            }}>
              {t.h1[0]}<br />{t.h1[1]}<br />
              <span style={{ color: "#4FA8FF" }}>{t.h1[2]}</span>
            </h1>

            <p className="gryps-hero-sub" style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16, maxWidth: 440 }}>
              {t.sub}
            </p>

            <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 32 }}>
              {t.nis2line}
            </p>

            <div className="gryps-stats-row" style={{ display: "flex", gap: 36, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--border)" }}>
              <Stat value="120+" label={t.statsL1} />
              <Stat value="LEO–MEO–GEO" label={t.statsL2} />
              <Stat value="70°N+" label={t.statsL3} />
            </div>

            {/* Advisor CTA anchor */}
            <a href="#advisor" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "#4FA8FF", color: "#070B12",
              fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
              padding: "12px 22px", borderRadius: 6, textDecoration: "none",
              marginBottom: 10,
            }}>
              {t.advisorCta} <ArrowRight size={14} />
            </a>
            <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
              {t.advisorSub}
            </p>
          </div>

          {/* Right — telemetry + polar map */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={11} color="var(--text-dim)" />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{t.telemetryLabel}</span>
            </div>
            <TelemetryStream t={t} />
            <PolarMap t={t} />
          </div>
        </div>
      </section>

      {/* Problem strip */}
      <section className="gryps-section-pad" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)", padding: "48px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p className="label" style={{ textAlign: "center", marginBottom: 32, fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{t.problemL}</p>
          <div className="gryps-problem-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {t.problems.map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[<Shield key="s" size={16} color="#4FA8FF" />, <AlertTriangle key="a" size={16} color="#F5B84A" />, <Globe2 key="g" size={16} color="#6EE7F9" />][i]}
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{item.title}</span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Advisor */}
      <section id="advisor" className="gryps-section-pad" style={{ padding: "64px 32px", maxWidth: 900, margin: "0 auto", scrollMarginTop: 80 }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>FREE RESILIENCE ADVISOR</p>
        <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.01em" }}>
          {t.advisorCta}
        </h2>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>{t.advisorSub}</p>
        <AdvisorForm t={t} />
      </section>

      {/* How it works */}
      <section className="gryps-section-pad" style={{ borderTop: "1px solid var(--border)", padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 32 }}>{t.howL}</p>
        <div className="gryps-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {t.steps.map((step, i) => {
            const icons = [<MapPin key="mp" size={16} color="#4FA8FF" />, <Radio key="r" size={16} color="#4FA8FF" />, <Zap key="z" size={16} color="#4FA8FF" />, <ChevronRight key="cr" size={16} color="#4FA8FF" />]
            return (
              <div key={step.n} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  {icons[i]}
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>{step.n}</span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 8 }}>{step.title}</p>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{step.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="gryps-section-pad" style={{ borderTop: "1px solid var(--border)", padding: "64px 32px", textAlign: "center" }}>
        <GrypsMark size={44} animate />
        <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "20px 0 10px", letterSpacing: "-0.01em" }}>
          {t.ctaH2}
        </h2>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", margin: "0 auto 32px", maxWidth: 480 }}>
          {t.ctaSub}
        </p>
        <a href="#advisor" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          backgroundColor: "#4FA8FF", color: "#070B12",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
          padding: "12px 24px", borderRadius: 6, textDecoration: "none",
        }}>
          {t.ctaBtn} <ArrowRight size={14} />
        </a>
      </section>

      {/* Footer */}
      <footer className="gryps-footer gryps-section-pad" style={{ borderTop: "1px solid var(--border)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GrypsMark size={18} animate />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em" }}>GRYPS</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>{t.footerRights}</span>
          <Link href="/legal/terms" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>{lang === "en" ? "Terms" : "Ehdot"}</Link>
          <Link href="/legal/privacy" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>{lang === "en" ? "Privacy" : "Tietosuoja"}</Link>
        </div>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>{t.footerTag}</span>
      </footer>
    </div>
  )
}

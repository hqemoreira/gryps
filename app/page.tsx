"use client"
import { useState, useEffect, useMemo } from "react"
import { ArrowRight, MapPin, Radio, Shield, Zap, ChevronRight, Globe2, AlertTriangle } from "lucide-react"
import { ResilienceOutput, type AdvisoryResult, type AssessmentInputs, type RealDataEvidence } from "@/components/ResilienceOutput"
import { GrypsMark } from "@/components/GrypsMark"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { EXAMPLE_SIGNATURES } from "@/lib/example-signatures"
import { PROVIDER_INDEX_COUNT } from "@/lib/providers"
import { DriftMock } from "@/components/DriftMock"
import { gradeTextColor } from "@/lib/resilience-colors"
import { ADVISOR_PROVIDERS, providersToSetupString } from "@/lib/deterministic-score"
import { MODEL_VERSION } from "@/lib/signature-meta"

const NORDIC_LAT_MIN = 55
const NORDIC_LAT_MAX = 85
const NORDIC_LNG_MIN = -30
const NORDIC_LNG_MAX = 40
const DEFAULT_LAT = "68.2"
const DEFAULT_LNG = "27.4"

function modelVersionDisplay(): string {
  const m = MODEL_VERSION.match(/v[\d.]+/)
  return m ? m[0] : "v0.3"
}

function parseProvidersParam(raw: string | null): string[] {
  if (!raw) return []
  return raw.split(",").map(s => s.trim()).filter(Boolean)
}

function inferProvidersFromSetup(setup: string): string[] {
  const s = setup.toLowerCase()
  if (!s.trim() || /\bnone\b|\bno connectivity\b/.test(s)) return ["none"]
  const ids: string[] = []
  for (const p of ADVISOR_PROVIDERS) {
    if (p.aliases.some(a => s.includes(a)) || s.includes(p.name.toLowerCase())) {
      if (!ids.includes(p.id)) ids.push(p.id)
    }
  }
  return ids.length ? ids : []
}

function coordsInNordicBounds(lat: number, lng: number): boolean {
  return lat >= NORDIC_LAT_MIN && lat <= NORDIC_LAT_MAX && lng >= NORDIC_LNG_MIN && lng <= NORDIC_LNG_MAX
}

// ── Advisor form ──────────────────────────────────────────────────────────────
function getQueryParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

function SignatureReveal({
  result,
  assessmentInputs,
  realData,
  lang,
  t,
  onReset,
}: {
  result: AdvisoryResult
  assessmentInputs: AssessmentInputs
  realData?: RealDataEvidence
  lang: "en" | "fi"
  t: typeof COPY.en
  onReset: () => void
}) {
  const lines = useMemo(() => {
    const sig = result.resilience_signature
    const lat = assessmentInputs.lat ?? 68.2
    const lng = assessmentInputs.lng ?? 27.4
    const rows: { tag: string; color: string; text: string }[] = [
      { tag: "GRYPS-INIT", color: "var(--accent-blue)", text: `Evaluating site profile for ${lat}°N · ${lng}°E…` },
    ]
    for (const r of result.risk_factors.slice(0, 3)) {
      rows.push({ tag: "RISK-FACT", color: "var(--accent-amber)", text: `${r.label} · ${r.severity}` })
    }
    for (const g of result.redundancy_gaps.slice(0, 2)) {
      rows.push({ tag: "GAP", color: "var(--accent-amber)", text: g.label })
    }
    for (const o of result.connectivity_options.slice(0, 3)) {
      rows.push({ tag: "OPTIONS", color: "var(--accent-cyan)", text: `${o.provider} · confidence ${o.confidence}` })
    }
    rows.push({ tag: "SIGNATURE", color: "var(--accent-green)", text: `Resilience Signature computed: ${sig.score} · ${sig.grade}` })
    rows.push({ tag: "REPORT", color: "var(--accent-green)", text: "Assessment complete — advisory output ready" })
    return rows
  }, [result, assessmentInputs.lat, assessmentInputs.lng])

  const [visible, setVisible] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i += 1
      setVisible(i)
      if (i >= lines.length) {
        clearInterval(id)
        setTimeout(() => setDone(true), 400)
      }
    }, 450)
    return () => clearInterval(id)
  }, [lines])

  if (!done) {
    return (
      <div style={{
        backgroundColor: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "16px 18px", fontFamily: "var(--font-data)",
        fontSize: 11, lineHeight: 2, overflow: "hidden", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 6px #2ED47A" }} />
          <span style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.1em" }}>{t.telemetryHeader}</span>
        </div>
        {lines.map((line, idx) => (
          <div key={idx} style={{
            display: "flex", gap: 12,
            opacity: idx < visible ? (idx === visible - 1 ? 1 : 0.45) : 0,
            transition: "opacity 0.35s ease", whiteSpace: "nowrap", overflow: "hidden",
          }}>
            <span style={{ color: line.color, minWidth: 80, flexShrink: 0 }}>[{line.tag}]</span>
            <span style={{ color: idx === visible - 1 ? "var(--text)" : "var(--text-muted)" }}>{line.text}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="gryps-print-target">
        <ResilienceOutput result={result} input={assessmentInputs} realData={realData} lang={lang} />
      </div>
      <button
        className="gryps-no-print"
        onClick={onReset}
        style={{
          marginTop: 20, display: "flex", alignItems: "center", gap: 6,
          backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
          borderRadius: 6, padding: "0 16px", minHeight: 44, cursor: "pointer",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)",
        }}
      >
        ← {t.analyseAnother}
      </button>
    </div>
  )
}

function AdvisorForm({ t, lang }: { t: typeof COPY.en; lang: "en" | "fi" }) {
  const qp = getQueryParams()
  const [lat, setLat] = useState(qp.get("lat") ?? DEFAULT_LAT)
  const [lng, setLng] = useState(qp.get("lng") ?? DEFAULT_LNG)
  const [vertical, setVertical] = useState(qp.get("sector") ?? "")
  const [providers, setProviders] = useState<string[]>(() => {
    const fromParam = parseProvidersParam(qp.get("providers"))
    if (fromParam.length) return fromParam
    const legacy = qp.get("setup")
    if (legacy) return inferProvidersFromSetup(legacy)
    return []
  })
  const [legacySetup] = useState(qp.get("setup") ?? "")
  const [autonomy, setAutonomy] = useState(qp.get("autonomy") ?? "")
  const [criticality, setCriticality] = useState(qp.get("criticality") ?? "")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AdvisoryResult | null>(null)
  const [realData, setRealData] = useState<RealDataEvidence | undefined>(undefined)
  const [error, setError] = useState("")
  const [boundsError, setBoundsError] = useState("")
  const [, setShareId] = useState<string | null>(qp.get("sid"))

  useEffect(() => {
    const sid = getQueryParams().get("sid")
    if (!sid || result) return
    fetch(`/api/submissions/${sid}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (!data.result) return
        setResult(data.result as AdvisoryResult)
        const inp = data.input ?? {}
        const coords = inp.site_coordinates as { lat?: number; lng?: number } | undefined
        if (coords?.lat != null) setLat(String(coords.lat))
        if (coords?.lng != null) setLng(String(coords.lng))
        if (inp.vertical) setVertical(String(inp.vertical))
        if (inp.autonomy_level) setAutonomy(String(inp.autonomy_level))
        if (inp.operation_criticality) setCriticality(String(inp.operation_criticality))
        if (Array.isArray(inp.providers) && inp.providers.length) {
          setProviders(inp.providers.map(String))
        } else if (inp.current_setup) {
          setProviders(inferProvidersFromSetup(String(inp.current_setup)))
        }
        setShareId(String(data.id))
      })
      .catch(() => {})
  }, [result])

  function toggleProvider(id: string) {
    setProviders(prev => {
      if (id === "none") return ["none"]
      const withoutNone = prev.filter(p => p !== "none")
      if (withoutNone.includes(id)) return withoutNone.filter(p => p !== id)
      return [...withoutNone, id]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vertical || !autonomy || !criticality) return

    const latNum = lat ? parseFloat(lat) : parseFloat(DEFAULT_LAT)
    const lngNum = lng ? parseFloat(lng) : parseFloat(DEFAULT_LNG)
    if (!coordsInNordicBounds(latNum, lngNum)) {
      setBoundsError(t.boundsHint)
      return
    }
    setBoundsError("")

    const setupStr = providers.length
      ? providersToSetupString(providers)
      : legacySetup || undefined

    setLoading(true)
    setError("")
    setResult(null)
    setRealData(undefined)
    try {
      const res = await fetch("/api/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_coordinates: { lat: latNum, lng: lngNum },
          vertical,
          providers,
          current_setup: setupStr,
          autonomy_level: autonomy,
          operation_criticality: criticality,
          email: email || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.result) throw new Error(data.error ?? "Analysis failed")
      setResult(data.result as AdvisoryResult)
      setRealData(data.realData ?? undefined)
      const shareParams = new URLSearchParams()
      shareParams.set("lat", String(latNum))
      shareParams.set("lng", String(lngNum))
      if (vertical) shareParams.set("sector", vertical)
      if (autonomy) shareParams.set("autonomy", autonomy)
      if (criticality) shareParams.set("criticality", criticality)
      if (providers.length) shareParams.set("providers", providers.join(","))
      if (data.id) {
        shareParams.set("sid", String(data.id))
        setShareId(String(data.id))
      }
      const qs = shareParams.toString()
      if (qs) window.history.replaceState(null, "", `?${qs}#advisor`)
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
    minHeight: 44,
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
    const assessmentInputs: AssessmentInputs = {
      lat: lat ? parseFloat(lat) : parseFloat(DEFAULT_LAT),
      lng: lng ? parseFloat(lng) : parseFloat(DEFAULT_LNG),
      sector: vertical,
      autonomy_level: autonomy,
      operation_criticality: criticality,
      current_setup: providers.length ? providersToSetupString(providers) : legacySetup || undefined,
    }
    return (
      <SignatureReveal
        key={result.issuedAt ?? `${result.resilience_signature.score}-${result.resilience_signature.grade}`}
        result={result}
        assessmentInputs={assessmentInputs}
        realData={realData}
        lang={lang}
        t={t}
        onReset={() => { setResult(null); setRealData(undefined); setLoading(false) }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="gryps-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>{t.latLabel}</label>
          <input type="number" step="any" placeholder={DEFAULT_LAT} value={lat} onChange={e => setLat(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t.lngLabel}</label>
          <input type="number" step="any" placeholder={DEFAULT_LNG} value={lng} onChange={e => setLng(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div className="gryps-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>{t.sectorLabel} *</label>
          <select value={vertical} onChange={e => setVertical(e.target.value)} required style={{ ...selectStyle, color: vertical ? "var(--text)" : "var(--text-muted)" }}>
            <option value="" disabled>{t.sectorPlaceholder}</option>
            <option value="forestry">Forestry</option>
            <option value="mining">Mining</option>
            <option value="maritime">Maritime</option>
            <option value="energy">Energy</option>
            <option value="research">Research</option>
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

      <div>
        <label style={labelStyle}>{t.criticalityLabel} *</label>
        <select value={criticality} onChange={e => setCriticality(e.target.value)} required style={{ ...selectStyle, color: criticality ? "var(--text)" : "var(--text-muted)" }}>
          <option value="" disabled>{t.criticalityPlaceholder}</option>
          <option value="standard">Standard</option>
          <option value="high">High criticality</option>
          <option value="safety-critical">Safety-critical</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>{t.providersLabel}</label>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
          {t.providersHint}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ADVISOR_PROVIDERS.map(p => {
            const selected = providers.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProvider(p.id)}
                style={{
                  fontFamily: "var(--font-data)", fontSize: 10, letterSpacing: "0.04em",
                  padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                  border: selected ? "1px solid #4FA8FF" : "1px solid var(--border2)",
                  backgroundColor: selected ? "rgba(79,168,255,0.12)" : "var(--surface2)",
                  color: selected ? "var(--accent-blue)" : "var(--text-muted)",
                }}
              >
                {p.name}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => toggleProvider("none")}
            style={{
              fontFamily: "var(--font-data)", fontSize: 10, letterSpacing: "0.04em",
              padding: "8px 12px", borderRadius: 6, cursor: "pointer",
              border: providers.includes("none") ? "1px solid var(--accent-amber)" : "1px solid var(--border2)",
              backgroundColor: providers.includes("none") ? "rgba(217,119,6,0.12)" : "var(--surface2)",
              color: providers.includes("none") ? "var(--accent-amber)" : "var(--text-muted)",
            }}
          >
            {lang === "fi" ? "Ei yhteyttä" : "None"}
          </button>
        </div>
      </div>

      <div style={{
        backgroundColor: "rgba(79,168,255,0.06)", border: "1px solid rgba(79,168,255,0.2)",
        borderRadius: 8, padding: "14px 16px",
      }}>
        <label style={{ ...labelStyle, color: "var(--accent-blue)", display: "block", marginBottom: 4 }}>{t.emailLabel}</label>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10 }}>
          {t.emailHint}
        </p>
        <input
          type="email"
          placeholder="your@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", marginTop: 6 }}>
          {t.emailOptionalNote}
        </p>
      </div>

      {(boundsError || error) && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-red)" }}>{boundsError || error}</p>
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

// ── Hero score count-up ───────────────────────────────────────────────────────
function HeroScoreCountUp({ label }: { label: string }) {
  const [score, setScore] = useState(0)
  useEffect(() => {
    const target = 40
    const duration = 1200
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setScore(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const text = label.replace("{score}", String(score)).replace("{grade}", "D")
  return (
    <div
      className="gryps-hero-score"
      aria-live="polite"
      style={{ fontFamily: "var(--font-data)", color: gradeTextColor("D"), marginBottom: 20 }}
    >
      {text}
    </div>
  )
}

// ── Hero signature card ───────────────────────────────────────────────────────
function HeroSignatureCard({ t }: { t: typeof COPY.en }) {
  const gc = gradeTextColor("D")
  return (
    <div className="gryps-signature-card" style={{
      backgroundColor: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 4 }}>
            RESILIENCE SIGNATURE
          </p>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
            68.2°N 27.4°E · Lapland
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }} aria-label="Score 40 out of 100, grade D">
          <span className="sr-only">Score 40 out of 100, grade D</span>
          <span aria-hidden="true" style={{ fontFamily: "var(--font-data)", fontSize: 32, fontWeight: 900, color: gc, lineHeight: 1 }}>40</span>
          <span aria-hidden="true" style={{ fontFamily: "var(--font-data)", fontSize: 16, fontWeight: 900, color: gc }}>D</span>
        </div>
      </div>
      <div className="gryps-signature-divider" style={{ height: 1, backgroundColor: "var(--border)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 4 }}>{t.topRiskLabel}</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-amber)", fontWeight: 600 }}>{t.heroTopRisk}</p>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 4 }}>{t.topRecLabel}</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-cyan)", fontWeight: 600 }}>Iridium Certus · 90</p>
        </div>
      </div>
    </div>
  )
}

// ── Telemetry stream ──────────────────────────────────────────────────────────
const TELEMETRY_LINES = [
  { tag: "GRYPS-INIT", color: "var(--accent-blue)",  text: "Evaluating site profile for 68.2°N · 27.4°E…" },
  { tag: "RISK-FACT",  color: "var(--accent-amber)", text: "Single-provider dependency · critical severity" },
  { tag: "GAP",        color: "var(--accent-amber)", text: "No backup connectivity identified" },
  { tag: "OPTIONS",    color: "var(--accent-cyan)",  text: "OneWeb LEO · confidence 85" },
  { tag: "OPTIONS",    color: "var(--accent-cyan)",  text: "Iridium Certus LEO · confidence 90" },
  { tag: "OPTIONS",    color: "var(--accent-cyan)",  text: "Inmarsat Global Xpress GEO · confidence 75" },
  { tag: "SIGNATURE",  color: "var(--accent-green)", text: "Resilience Signature computed: 40 · D" },
  { tag: "REPORT",     color: "var(--accent-green)", text: "Assessment complete — advisory output ready" },
]

function TelemetryStream({ t }: { t: typeof COPY.en }) {
  const [visible, setVisible] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setVisible(v => v < TELEMETRY_LINES.length ? v + 1 : 1), 900)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="gryps-hero-terminal" style={{
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
        <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{t.polarMapLabel}</span>
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
              {m.active && <text x={pos.x + 6} y={pos.y - 5} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="var(--accent-blue)">{m.label}</text>}
            </g>
          )
        })}
        <circle cx={starlink.x} cy={starlink.y} r={5} fill="rgba(79,168,255,0.15)" />
        <circle cx={starlink.x} cy={starlink.y} r={2.5} fill="#4FA8FF" />
        <text x={starlink.x + 5} y={starlink.y - 4} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="var(--accent-blue)">SL</text>
        <circle cx={oneweb.x} cy={oneweb.y} r={4} fill="rgba(110,231,249,0.12)" />
        <circle cx={oneweb.x} cy={oneweb.y} r={2} fill="#6EE7F9" />
        <text x={oneweb.x + 4} y={oneweb.y - 3} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="var(--accent-cyan)">OW</text>
        <circle cx={iridium.x} cy={iridium.y} r={3.5} fill="rgba(245,184,74,0.12)" />
        <circle cx={iridium.x} cy={iridium.y} r={1.8} fill="#D97706" />
        <text x={iridium.x + 4} y={iridium.y - 3} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="var(--accent-amber)">IR</text>
        <circle cx={cx} cy={cy} r={2} fill="var(--text-dim)" />
        <text x={cx + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 9 }} fill="var(--text-dim)">N</text>
      </svg>
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Stat({ value, label, href }: { value: string; label: string; href?: string }) {
  const inner = (
    <>
      <span style={{ fontFamily: "var(--font-data)", fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>{label}</span>
    </>
  )
  if (href) {
    return (
      <a href={href} style={{ display: "flex", flexDirection: "column", gap: 2, textDecoration: "none" }}>{inner}</a>
    )
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{inner}</div>
  )
}

// ── Copy (EN / FI) ───────────────────────────────────────────────────────────
const COPY = {
  en: {
    tag:        "CONNECTIVITY RESILIENCE · NORDIC, ARCTIC & ICELAND OPERATIONS",
    navCta:     "Score my site — free",
    h1:         "Know your score before the Arctic finds it for you.",
    sub:        "Resilience Signatures for Nordic, Arctic, and Icelandic operations — score, grade, risks, and ranked providers in ~60 seconds. No account required.",
    scoreLabel: "Score: {score}/100 · Grade {grade}",
    heroSecondary: "See a sample Signature",
    modelChip:  "Research prototype · Model v0.3",
    sampleCta:  "See a sample Signature",
    nis2line:   "NIS2/CER-aligned resilience reporting · Espoo, Finland · R&D prototype",
    statsL1:    "Providers indexed (catalog)",
    statsL2:    "All orbital types",
    statsL3:    "Polar coverage",
    liveCounter: "sites assessed in the Nordic & Arctic portfolio",
    advisorCta: "Score my site — free",
    advisorSub: "~60 seconds · No account · Research prototype",
    sectorLabel:        "OPERATIONAL SECTOR",
    sectorPlaceholder:  "Select sector",
    autonomyLabel:      "AUTONOMY LEVEL",
    autonomyPlaceholder:"Select autonomy level",
    criticalityLabel:   "OPERATION CRITICALITY",
    criticalityPlaceholder: "Select criticality",
    latLabel:   "LATITUDE",
    lngLabel:   "LONGITUDE",
    providersLabel: "CURRENT CONNECTIVITY PROVIDERS",
    providersHint:  "Select all providers currently in use. Choose None if no satellite path is documented.",
    boundsHint: "Coordinates must be within Nordic/Arctic bounds (lat 55–85°, lng −30–40°).",
    emailLabel: "OPTIONAL EMAIL",
    emailHint:  "Email me this report + get notified when live monitoring launches",
    emailOptionalNote: "Optional — you'll see your results either way.",
    runAdvisor: "Score my site — free",
    analysing:  "Analysing your site…",
    analyseAnother: "Analyse another site",
    telemetryLabel:  "Research prototype · illustrative engine output",
    telemetryHeader: "ILLUSTRATIVE ADVISOR SEQUENCE",
    topRiskLabel: "TOP RISK",
    topRecLabel:  "REC #1",
    heroTopRisk:  "No backup",
    problemL: "The resilience gap GRYPS closes",
    problems: [
      { title: "Zero margin.", body: "A harvester at −30°C, an offshore check-in, a remote sensor cluster — when connectivity fails here, it is a safety event, not an inconvenience." },
      { title: "One provider.", body: "Most sites run a single satellite path with no documented fallback. Pass geometry and orbital outages stay invisible until they materialise." },
      { title: "Documented or fined.", body: "NIS2 and CER increasingly require critical operators to document connectivity risk. A Resilience Signature is audit-ready evidence." },
    ],
    howL:  "How the Resilience Advisor works",
    steps: [
      { n: "01", title: "Enter site profile",    body: "Coordinates, sector, and current providers. Elevation and terrain are factored automatically." },
      { n: "02", title: "Set autonomy level",    body: "Manual, remote-operated, autonomous, or mixed. Scoring weights shift with operational dependency on connectivity." },
      { n: "03", title: "Set criticality",       body: "Standard, high, or safety-critical. A safety-critical autonomous site with no redundancy cannot score above 50." },
      { n: "04", title: "Generate a Signature", body: "Score, grade, risk factors, redundancy gaps, ranked providers, and plain-language recommendation — in seconds." },
    ],
    examplesLabel: "EXAMPLE RESILIENCE SIGNATURES",
    examplesSub: "Pre-computed examples showing what the Resilience Advisor produces. Run the Advisor above for a live assessment.",
    polarHeader: "COVERAGE ZONE — NORDIC, ARCTIC & ICELAND",
    polarMapLabel: "DEMO MAP — NOT LIVE MONITORING",
    ctaH2:  "Resilience starts with knowing your score.",
    ctaSub: "Free Resilience Signature for any Nordic, Arctic, or Icelandic site. No account — connectivity risk scored in ~60 seconds.",
    ctaBtn: "Score my site — free",
    footerTag:    "Built in Finland for high-latitude resilience.",
  },
  fi: {
    tag:        "YHTEYDEN RESILIENSSI · POHJOISMAAT, ARKTINEN JA ISLANTI",
    navCta:     "Pisteytä kohteeni — ilmaiseksi",
    h1:         "Tiedä pisteesi ennen kuin Arktinen paljastaa sen puolestasi.",
    sub:        "Resilience Signature -todistukset pohjoismaisille, arktisille ja islantilaisille kohteille — pisteet, arvosana, riskit ja rankatut toimittajat ~60 sekunnissa. Ei tiliä.",
    scoreLabel: "Pisteet: {score}/100 · Arvosana {grade}",
    heroSecondary: "Katso esimerkki-Signature",
    modelChip:  "Tutkimusprototyyppi · Malli v0.3",
    sampleCta:  "Katso esimerkki-Signature",
    nis2line:   "NIS2/CER-yhteensopiva resilienssirapor­tointi · Espoo, Suomi · T&K-prototyyppi",
    statsL1:    "Palveluntarjoajaa indeksoitu",
    statsL2:    "Kaikki orbitaalityypit",
    statsL3:    "Napapiirin kattavuus",
    liveCounter: "kohdetta arvioitu pohjoismaisessa ja arktisessa portfoliossa",
    advisorCta: "Pisteytä kohteeni — ilmaiseksi",
    advisorSub: "~60 sekuntia · Ei tiliä · Tutkimusprototyyppi",
    sectorLabel:        "TOIMIALA",
    sectorPlaceholder:  "Valitse toimiala",
    autonomyLabel:      "AUTONOMIATASO",
    autonomyPlaceholder:"Valitse autonomiataso",
    criticalityLabel:   "TOIMINNAN KRIITTISYYS",
    criticalityPlaceholder: "Valitse kriittisyystaso",
    latLabel:   "LEVEYSASTE",
    lngLabel:   "PITUUSASTE",
    providersLabel: "NYKYISET YHTEYSPALVELUNTARJOAJAT",
    providersHint:  "Valitse kaikki käytössä olevat toimittajat. Valitse Ei yhteyttä, jos satelliittipolkua ei ole dokumentoitu.",
    boundsHint: "Koordinaattien on oltava pohjoismaisella/arktisella alueella (lat 55–85°, lng −30–40°).",
    emailLabel: "VALINNAINEN SÄHKÖPOSTI",
    emailHint:  "Lähetä raportti sähköpostiini + ilmoita kun live-seuranta käynnistyy",
    emailOptionalNote: "Valinnainen — näet tuloksesi joka tapauksessa.",
    runAdvisor: "Pisteytä kohteeni — ilmaiseksi",
    analysing:  "Analysoidaan kohdetta…",
    analyseAnother: "Analysoi toinen kohde",
    telemetryLabel:  "Tutkimusprototyyppi · havainnollistava moottorilähtö",
    telemetryHeader: "HAVAINNOLLISTAVA ADVISOR-SEKVENSSI",
    topRiskLabel: "PÄÄRISKI",
    topRecLabel:  "SUOS #1",
    heroTopRisk:  "Ei varayhteyttä",
    problemL: "Resilienssiaukko, jonka GRYPS sulkee",
    problems: [
      { title: "Nolla marginaalia.", body: "Harvester −30°C:ssa, offshore-tarkistus, etäanturiklusteri — yhteyskatko on turvallisuustapahtuma, ei haitto." },
      { title: "Yksi toimittaja.", body: "Useimmat kohteet käyttävät yhtä satelliittipolkua ilman dokumentoitua varajärjestelmää. Ohitusgeometria pysyy näkymättömänä, kunnes se toteutuu." },
      { title: "Dokumentoitu tai sakko.", body: "NIS2 ja CER edellyttävät yhä useammin yhteysriskin dokumentointia. Resilience Signature on auditointivalmis todiste." },
    ],
    howL:  "Miten Resilience Advisor toimii",
    steps: [
      { n: "01", title: "Syötä kohteen profiili",  body: "Koordinaatit, toimiala ja nykyiset toimittajat. Korkeus ja maasto huomioidaan automaattisesti." },
      { n: "02", title: "Aseta autonomiataso",      body: "Manuaalinen, etäoperoitu, autonominen tai sekoitettu. Pisteytyksen painot muuttuvat operatiivisen yhteyksiriippuvuuden mukaan." },
      { n: "03", title: "Aseta kriittisyys",        body: "Standardi, korkea tai turvallisuuskriittinen. Turvallisuuskriittinen autonominen kohde ilman redundanssia ei voi saada yli 50 pistettä." },
      { n: "04", title: "Luo Signature",           body: "Pisteet, arvosana, riskitekijät, redundanssiaukot, rankatut toimittajat ja selkokielinen suositus — sekunneissa." },
    ],
    examplesLabel: "ESIMERKIT RESILIENCE-SIGNATUUREISTA",
    examplesSub: "Ennalta lasketut esimerkit siitä, mitä Resilience Advisor tuottaa. Suorita Advisor yllä live-arviointia varten.",
    polarHeader: "KATTAVUUSALUE — POHJOISMAAT, ARKTINEN JA ISLANTI",
    polarMapLabel: "DEMO-KARTTA — EI LIVE-SEURANTAA",
    ctaH2:  "Resilienssi alkaa pisteidesi tuntemisesta.",
    ctaSub: "Ilmainen Resilience Signature mille tahansa pohjoismaiselle, arktiselle tai islantilaiselle kohteelle. Ei tiliä — yhteysriski pisteytetty ~60 sekunnissa.",
    ctaBtn: "Pisteytä kohteeni — ilmaiseksi",
    footerTag:    "Rakennettu Suomessa korkean leveysasteen resilienssille.",
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [lang, setLang] = useState<"en" | "fi">("en")
  const [siteCount, setSiteCount] = useState<number | null>(null)
  const t = COPY[lang]
  const modelChip = useMemo(() => t.modelChip.replace("v0.3", modelVersionDisplay()), [t.modelChip])

  useEffect(() => {
    fetch("/api/signatures")
      .then(r => r.json())
      .then(d => setSiteCount(Array.isArray(d.sites) ? d.sites.length : null))
      .catch(() => setSiteCount(null))
  }, [])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>

      {/* Non-commercial banner */}
      <div className="gryps-banner gryps-no-print" style={{
        backgroundColor: "rgba(245,184,74,0.06)",
        borderBottom: "1px solid rgba(245,184,74,0.2)",
        padding: "6px 32px",
        textAlign: "center",
        fontFamily: "var(--font-data)",
        fontSize: 9,
        color: "var(--accent-amber)",
        letterSpacing: "0.07em",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1010,
        backdropFilter: "blur(12px)",
      }}>
        R&D PROTOTYPE · NON-COMMERCIAL RESEARCH PROJECT · EARLY ACCESS · {lang === "en" ? "ESPOO, FINLAND" : "ESPOO, SUOMI"}
      </div>

      <Header
        topOffset={28}
        tagline="CONNECTIVITY INTELLIGENCE"
        lang={lang}
        onLangChange={setLang}
        ctaHref="#advisor"
        ctaLabel={t.navCta}
        extraLinks={[
          { href: "/map", label: lang === "en" ? "Capacity map" : "Kapasiteettikartta" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
          { href: "/providers", label: lang === "en" ? "Providers" : "Toimittajat" },
        ]}
      />

      {/* Hero */}
      <section className="gryps-section-pad gryps-no-print" style={{ paddingTop: 148, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, maxWidth: 1200, margin: "0 auto" }}>
        <div className="gryps-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "stretch" }}>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 8px #2ED47A" }} />
                <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.14em" }}>{t.tag}</span>
              </div>

              <HeroScoreCountUp label={t.scoreLabel} />

              <h1 className="gryps-hero-h1" style={{
                fontFamily: "var(--font-ui)", fontSize: 44, fontWeight: 700,
                lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 24,
              }}>
                {t.h1}
              </h1>

              <p className="gryps-hero-sub" style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.85, maxWidth: 440, marginBottom: 24 }}>
                {t.sub}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <a href="#advisor" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  backgroundColor: "#4FA8FF", color: "#070B12",
                  fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
                  padding: "12px 22px", borderRadius: 6, textDecoration: "none",
                }}>
                  {t.advisorCta} <ArrowRight size={14} />
                </a>
                <a href="#examples" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  backgroundColor: "transparent", color: "var(--text-muted)",
                  fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13,
                  padding: "12px 18px", borderRadius: 6, textDecoration: "none",
                  border: "1px solid var(--border2)",
                }}>
                  {t.heroSecondary}
                </a>
              </div>

              <span style={{
                display: "inline-block", fontFamily: "var(--font-data)", fontSize: 10,
                color: "var(--accent-amber)", letterSpacing: "0.06em",
                backgroundColor: "rgba(245,184,74,0.08)", border: "1px solid rgba(245,184,74,0.25)",
                borderRadius: 4, padding: "4px 10px",
              }}>
                {modelChip}
              </span>
            </div>

            <div>
              <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 16, marginTop: 32 }}>
                {t.nis2line}
              </p>

              {siteCount !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 8px #2ED47A" }} />
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--accent-green)", letterSpacing: "0.04em" }}>
                    {siteCount} {t.liveCounter}
                  </span>
                </div>
              )}

              <div className="gryps-stats-row" style={{ display: "flex", gap: 56, paddingBottom: 28, borderBottom: "1px solid var(--border)" }}>
                <Stat value={`${PROVIDER_INDEX_COUNT}`} label={t.statsL1} href="/providers" />
                <Stat value="LEO–MEO–GEO" label={t.statsL2} />
                <Stat value="70°N+" label={t.statsL3} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <HeroSignatureCard t={t} />
            <TelemetryStream t={t} />
          </div>
        </div>
      </section>

      {/* Problem strip */}
      <section className="gryps-section-pad gryps-no-print" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)", padding: "48px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p className="label" style={{ textAlign: "center", marginBottom: 32, fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{t.problemL}</p>
          <div className="gryps-problem-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {t.problems.map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[<Shield key="s" size={16} color="#4FA8FF" />, <AlertTriangle key="a" size={16} color="#D97706" />, <Globe2 key="g" size={16} color="#6EE7F9" />][i]}
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
        <p className="gryps-no-print" style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>DEMO RESILIENCE ADVISOR</p>
        <h2 className="gryps-no-print" style={{ fontFamily: "var(--font-ui)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.01em" }}>
          {t.advisorCta}
        </h2>
        <p className="gryps-no-print" style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>{t.advisorSub}</p>
        <AdvisorForm t={t} lang={lang} />
      </section>

      {/* How it works */}
      <section className="gryps-section-pad gryps-no-print" style={{ borderTop: "1px solid var(--border)", padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
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

      {/* Example signatures */}
      <section id="examples" className="gryps-section-pad gryps-no-print" style={{ borderTop: "1px solid var(--border)", padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>{t.examplesLabel}</p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", marginBottom: 28, maxWidth: 560 }}>{t.examplesSub}</p>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 24 }}>{t.telemetryLabel}</p>
        <div className="gryps-problem-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {EXAMPLE_SIGNATURES.map(ex => {
            const gc = gradeTextColor(ex.result.resilience_signature.grade)
            return (
              <div key={ex.id} style={{
                backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 900, color: gc, lineHeight: 1 }}>
                    {ex.result.resilience_signature.score}
                  </span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 14, fontWeight: 900, color: gc }}>
                    {ex.result.resilience_signature.grade}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 6 }}>
                  {lang === "fi" ? ex.titleFi : ex.title}
                </p>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
                  {ex.result.resilience_signature.summary}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", backgroundColor: "var(--surface2)", padding: "2px 8px", borderRadius: 3 }}>
                    {ex.input.sector}
                  </span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", backgroundColor: "var(--surface2)", padding: "2px 8px", borderRadius: 3 }}>
                    {ex.input.autonomy_level}
                  </span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", backgroundColor: "var(--surface2)", padding: "2px 8px", borderRadius: 3 }}>
                    {ex.input.operation_criticality}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 32, marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 12 }}>{t.sampleCta}</p>
          <PolarMap t={t} />
        </div>
        <DriftMock lang={lang} />
      </section>

      {/* CTA */}
      <section className="gryps-section-pad gryps-no-print" style={{ borderTop: "1px solid var(--border)", padding: "64px 32px", textAlign: "center" }}>
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

      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en"
          ? "Espoo, Finland · Non-commercial R&D prototype · No registered company · No revenue generated"
          : "Espoo, Suomi · Ei-kaupallinen T&K-prototyyppi · Ei rekisteröityä yritystä · Ei tuloja")}
        footerTag={t.footerTag}
        secondaryLink={{ href: "/map", label: lang === "en" ? "Capacity map" : "Kapasiteettikartta" }}
      />
    </div>
  )
}

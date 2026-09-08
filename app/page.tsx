"use client"
import { useState, useEffect, useMemo, useRef, type ReactNode } from "react"
import { ArrowRight, MapPin, Radio, Shield, Zap, ChevronRight, Globe2, AlertTriangle, LocateFixed } from "lucide-react"
import { ResilienceOutput, type AdvisoryResult, type AssessmentInputs, type RealDataEvidence } from "@/components/ResilienceOutput"
import { GrypsMark } from "@/components/GrypsMark"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { EXAMPLE_SIGNATURES } from "@/lib/example-signatures"
import { PROVIDER_INDEX_COUNT } from "@/lib/providers"
import { DriftMock } from "@/components/DriftMock"
import { gradeColor, gradeTextColor } from "@/lib/resilience-colors"
import { ADVISOR_PROVIDERS, providersToSetupString, scoreDeterministic } from "@/lib/deterministic-score"
import { MODEL_VERSION } from "@/lib/signature-meta"
import dynamic from "next/dynamic"

const OpsConsoleMap = dynamic(
  () => import("@/components/OpsConsoleMap").then(m => m.OpsConsoleMap),
  {
    ssr: false,
    loading: () => (
      <div className="gryps-ops-map-shell" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.1em",
      }}>
        LOADING OPS MAP…
      </div>
    ),
  },
)

function gradeBadgeBg(grade: string): string {
  const c = gradeColor(grade)
  return `${c}1F`
}

function FadeUp({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-inview")
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-inview")
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`gryps-fade-up ${className}`.trim()}>
      {children}
    </div>
  )
}

function LazyOpsMap({ lang }: { lang: "en" | "fi" }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true)
          io.disconnect()
        }
      },
      { rootMargin: "200px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={hostRef}>
      {ready ? (
        <OpsConsoleMap lang={lang} />
      ) : (
        <div className="gryps-ops-map-shell" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.1em",
        }}>
          OPS MAP · SCROLL TO LOAD
        </div>
      )}
    </div>
  )
}

function StickyMobileCta({ label }: { label: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const hero = document.getElementById("gryps-hero")
    const advisor = document.getElementById("advisor")
    if (!hero || !advisor) return

    let pastHero = false
    let nearAdvisor = false
    const sync = () => setVisible(pastHero && !nearAdvisor)

    const heroIo = new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0
      sync()
    }, { threshold: 0 })
    const advisorIo = new IntersectionObserver(([e]) => {
      nearAdvisor = e.isIntersecting
      sync()
    }, { rootMargin: "80px 0px", threshold: 0 })

    heroIo.observe(hero)
    advisorIo.observe(advisor)
    return () => {
      heroIo.disconnect()
      advisorIo.disconnect()
    }
  }, [])

  return (
    <div className={`gryps-sticky-cta gryps-no-print${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <a href="#advisor">{label} <ArrowRight size={14} /></a>
    </div>
  )
}

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
        borderRadius: "var(--radius)", padding: "16px 18px", fontFamily: "var(--font-data)",
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
          borderRadius: "var(--radius)", padding: "0 16px", minHeight: 44, cursor: "pointer",
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
  const [geoBusy, setGeoBusy] = useState(false)
  const [geoNote, setGeoNote] = useState("")
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

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoNote(lang === "fi" ? "Sijaintia ei tueta tällä laitteella." : "Geolocation is not available on this device.")
      return
    }
    setGeoBusy(true)
    setGeoNote("")
    navigator.geolocation.getCurrentPosition(
      pos => {
        const la = pos.coords.latitude.toFixed(4)
        const ln = pos.coords.longitude.toFixed(4)
        setLat(la)
        setLng(ln)
        setGeoBusy(false)
        if (!coordsInNordicBounds(parseFloat(la), parseFloat(ln))) {
          setBoundsError(t.boundsHint)
        } else {
          setBoundsError("")
        }
        setGeoNote(lang === "fi"
          ? "Sijainti haettu laitteelta — käytetään vain tähän arvioon."
          : "Location filled from this device — used only for this assessment.")
      },
      () => {
        setGeoBusy(false)
        setGeoNote(lang === "fi"
          ? "Sijainnin haku epäonnistui. Syötä koordinaatit manuaalisesti."
          : "Could not read location. Enter coordinates manually.")
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
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
    borderRadius: "var(--radius)",
    padding: "12px 14px",
    minHeight: 48,
    fontFamily: "var(--font-data)",
    fontSize: 16,
    color: "var(--text)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 15 }
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-data)", fontSize: "var(--text-label)", color: "var(--text-dim)",
    letterSpacing: "0.1em", display: "block", marginBottom: 8,
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

  const chipBase: React.CSSProperties = {
    fontFamily: "var(--font-data)", fontSize: 11, letterSpacing: "0.04em",
    padding: "10px 14px", minHeight: 44, borderRadius: "var(--radius)", cursor: "pointer",
  }

  return (
    <form onSubmit={handleSubmit} className="gryps-console-panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="gryps-field-group">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-label)", color: "var(--text-dim)", letterSpacing: "0.1em" }}>
            {lang === "fi" ? "KOHTEEN KOORDINAATIT" : "SITE COORDINATES"}
          </p>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={geoBusy}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
              color: "var(--accent-cyan)", background: "transparent",
              border: "1px solid rgba(110,231,249,0.35)", borderRadius: "var(--radius)",
              padding: "8px 12px", minHeight: 44, cursor: geoBusy ? "wait" : "pointer",
            }}
          >
            <LocateFixed size={14} />
            {geoBusy
              ? (lang === "fi" ? "Haetaan…" : "Locating…")
              : (lang === "fi" ? "Käytä sijaintiani" : "Use my location")}
          </button>
        </div>
        <div className="gryps-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>{t.latLabel}</label>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCapitalize="off"
              placeholder={DEFAULT_LAT}
              value={lat}
              onChange={e => setLat(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.lngLabel}</label>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCapitalize="off"
              placeholder={DEFAULT_LNG}
              value={lng}
              onChange={e => setLng(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {lang === "fi"
            ? "Sijaintia käytetään vain tähän resilienssiarvioon — ei seurata."
            : "Location is used only for this resilience assessment — not tracked."}
        </p>
        {geoNote && (
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--accent-cyan)" }}>{geoNote}</p>
        )}
      </div>

      <div className="gryps-field-group">
        <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-label)", color: "var(--text-dim)", letterSpacing: "0.1em" }}>
          {lang === "fi" ? "TOIMINTAPROFIILI" : "OPERATIONAL PROFILE"}
        </p>
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
      </div>

      <div className="gryps-field-group">
        <label style={labelStyle}>{t.providersLabel}</label>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", marginBottom: 4, lineHeight: 1.5 }}>
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
                  ...chipBase,
                  border: selected ? "1px solid var(--accent-blue)" : "1px solid var(--border2)",
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
              ...chipBase,
              border: providers.includes("none") ? "1px solid var(--accent-amber)" : "1px solid var(--border2)",
              backgroundColor: providers.includes("none") ? "rgba(217,119,6,0.12)" : "var(--surface2)",
              color: providers.includes("none") ? "var(--accent-amber)" : "var(--text-muted)",
            }}
          >
            {lang === "fi" ? "Ei yhteyttä" : "None"}
          </button>
        </div>
        <a href="/providers" style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.04em", marginTop: 4 }}>
          {t.providersCoi}
        </a>
      </div>

      <div className="gryps-field-group" style={{ backgroundColor: "rgba(79,168,255,0.05)", borderColor: "rgba(79,168,255,0.2)" }}>
        <label style={{ ...labelStyle, color: "var(--accent-blue)" }}>{t.emailLabel}</label>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 4 }}>
          {t.emailHint}
        </p>
        <input
          type="email"
          placeholder="your@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>
          {t.emailOptionalNote}
        </p>
      </div>

      {(boundsError || error) && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius)", padding: "10px 14px" }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-red)" }}>{boundsError || error}</p>
        </div>
      )}

      <button
        type="submit"
        className="gryps-cta-btn"
        disabled={loading || !vertical || !autonomy || !criticality}
        style={{
          width: "100%",
          opacity: (!vertical || !autonomy || !criticality) ? 0.5 : 1,
          background: loading ? "var(--surface2)" : "var(--cta-gradient)",
          color: loading ? "var(--text-muted)" : "#070B12",
        }}
      >
        {loading ? (
          <>
            <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid var(--text-dim)", borderTopColor: "var(--accent-blue)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
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

// ── Hero signature card ───────────────────────────────────────────────────────
const HERO_DEMO = scoreDeterministic({
  lat: 68.2,
  lng: 27.4,
  sector: "forestry",
  autonomy: "autonomous",
  criticality: "high",
  providers: ["starlink"],
})

function HeroCompositionBars({ lang }: { lang: "en" | "fi" }) {
  const labels: Record<string, { en: string; fi: string }> = {
    redundancy: { en: "Redundancy", fi: "Redundanssi" },
    latitude: { en: "Latitude", fi: "Leveysaste" },
    operational_profile: { en: "Profile", fi: "Profiili" },
    provider_confidence: { en: "Providers", fi: "Toimittajat" },
  }
  return (
    <div className="gryps-comp-bars" style={{ marginTop: 4 }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-label)", color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 4 }}>
        {lang === "fi" ? "PISTEKOMPONENTIT" : "SCORE COMPOSITION"}
      </p>
      {HERO_DEMO.score_composition.components.map(c => {
        const pct = c.max > 0 ? Math.max(0, Math.min(100, (c.points / c.max) * 100)) : 0
        const label = labels[c.id]?.[lang] ?? c.label
        return (
          <div key={c.id} className="gryps-comp-row">
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)", fontWeight: 700 }}>{c.points}/{c.max}</span>
            <div className="gryps-comp-track">
              <div className="gryps-comp-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
      {HERO_DEMO.score_composition.caps_applied.length > 0 && (
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-amber)", marginTop: 4 }}>
          {lang === "fi" ? "Katto:" : "Cap:"} {HERO_DEMO.score_composition.caps_applied.join(", ")}
        </p>
      )}
    </div>
  )
}

function HeroSignatureCard({ t, lang }: { t: typeof COPY.en; lang: "en" | "fi" }) {
  const score = HERO_DEMO.resilience_signature.score
  const grade = HERO_DEMO.resilience_signature.grade
  const gc = gradeTextColor(grade)
  const border = gradeColor(grade)
  const topRisk = t.heroTopRisk
  const topRec = HERO_DEMO.connectivity_options[0]
    ? `${HERO_DEMO.connectivity_options[0].provider} · ${HERO_DEMO.connectivity_options[0].confidence}`
    : "Iridium Certus · 90"

  return (
    <div
      className="gryps-signature-card gryps-signature-elevated gryps-hero-signature"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        width: "100%",
        minHeight: 0,
        justifyContent: "space-between",
        borderLeft: `3px solid ${border}`,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-label)", color: "var(--text-dim)", letterSpacing: "0.12em" }}>
            RESILIENCE SIGNATURE
          </p>
          <span
            className="gryps-grade-badge"
            style={{ color: gc, backgroundColor: gradeBadgeBg(grade), border: `1px solid ${border}55` }}
          >
            {lang === "fi" ? "ARVOSANA" : "GRADE"} {grade}
          </span>
        </div>

        <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-title)", color: "var(--text)", marginBottom: 4 }}>
          68.2°N 27.4°E · Lapland
        </p>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: 20 }}>
          Single Starlink · no backup path
        </p>

        <div aria-label={`Score ${score} out of 100, grade ${grade}`} style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <span className="sr-only">Score {score} out of 100, grade {grade}</span>
          <span aria-hidden="true" style={{
            fontFamily: "var(--font-data)",
            fontSize: "clamp(3.5rem, 7vw, 5rem)",
            fontWeight: 900,
            color: gc,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
          }}>{score}</span>
          <span aria-hidden="true" style={{ fontFamily: "var(--font-data)", fontSize: 16, color: "var(--text-dim)" }}>/100</span>
        </div>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em", marginBottom: 18 }}>
          deterministic-v0.3
        </p>

        <div className="gryps-signature-divider" style={{ height: 1, backgroundColor: "var(--border)", marginBottom: 16 }} />

        <HeroCompositionBars lang={lang} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
          <div>
            <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-label)", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 6 }}>{t.topRiskLabel}</p>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-amber)", fontWeight: 600, lineHeight: 1.35 }}>{topRisk}</p>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-label)", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 6 }}>{t.topRecLabel}</p>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-cyan)", fontWeight: 600, lineHeight: 1.35 }}>{topRec}</p>
          </div>
        </div>
      </div>

      <div>
        <a href="#advisor" className="gryps-cta-btn" style={{ width: "100%" }}>
          {t.advisorCta} <ArrowRight size={14} />
        </a>
      </div>
    </div>
  )
}

function TrustStrip({ lang }: { lang: "en" | "fi" }) {
  const items = lang === "fi"
    ? ["Malli v0.3", "Deterministinen", "EU AI Act Art. 50", "Espoo", "Tutkimusprototyyppi"]
    : ["Model v0.3", "Deterministic", "EU AI Act Art. 50", "Espoo", "Research prototype"]
  const links = [
    { href: "/methodology", label: lang === "fi" ? "Menetelmä" : "Methodology" },
    { href: "/about", label: lang === "fi" ? "Tietoa" : "About" },
    { href: "/privacy", label: lang === "fi" ? "Tietosuoja" : "Privacy" },
  ]
  return (
    <div className="gryps-trust-strip gryps-no-print">
      <div className="gryps-trust-inner">
        <div className="gryps-trust-items">
          {items.map((item, i) => (
            <span key={item} style={{ display: "inline-flex", alignItems: "center" }}>
              {i > 0 && <span data-sep aria-hidden="true">·</span>}
              {item}
            </span>
          ))}
        </div>
        <div className="gryps-trust-links">
          {links.map(l => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Stat({ value, label, href }: { value: string; label: string; href?: string }) {
  const inner = (
    <>
      <span style={{ fontFamily: "var(--font-data)", fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</span>
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
    navCta:     "Score my site · free",
    h1:         "Know your score before the Arctic finds it for you.",
    sub:        "Score, grade, risks, and ranked providers for Nordic, Arctic, and Icelandic sites — in ~60 seconds. Free. No account.",
    scoreLabel: "Score: {score}/100 · Grade {grade}",
    heroSecondary: "See a sample Signature",
    modelChip:  "Research prototype · Model v0.3",
    sampleCta:  "See a sample Signature",
    nis2line:   "Supports NIS2/CER readiness documentation · Espoo, Finland · R&D prototype",
    statsL1:    "Providers indexed (catalog)",
    statsL2:    "All orbital types",
    statsL3:    "Polar coverage",
    liveCounter: "sites assessed in the Nordic & Arctic portfolio",
    proofBand:  "Illustrative · not live monitoring",
    advisorCta: "Score my site · free",
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
    providersHint:  "Select all providers currently in use. Choose None if no satellite path is documented. GRYPS has no commercial relationship with any provider listed.",
    providersCoi: "No commercial relationships with ranked providers — see Providers.",
    boundsHint: "Coordinates must be within Nordic/Arctic bounds (lat 55–85°, lng −30–40°).",
    emailLabel: "OPTIONAL EMAIL",
    emailHint:  "Optional — stored with this run so we can email the report / notify when live monitoring launches. Not a newsletter.",
    emailOptionalNote: "You'll see results either way. After generate, use Copy shareable link (?sid=).",
    runAdvisor: "Score my site · free",
    analysing:  "Analysing your site…",
    analyseAnother: "Analyse another site",
    telemetryLabel:  "Research prototype · illustrative engine output",
    telemetryHeader: "ENGINE LOG",
    topRiskLabel: "TOP RISK",
    topRecLabel:  "REC #1",
    heroTopRisk:  "No backup",
    problemL: "Why sites fail without a Signature",
    problems: [
      { title: "Zero margin.", body: "A harvester at −30°C, an offshore check-in, a remote sensor cluster — when connectivity fails here, it is a safety event, not an inconvenience." },
      { title: "One path. No fallback.", body: "Most sites run a single satellite link with nothing documented behind it. Pass geometry and orbital outages stay invisible until they hit operations." },
      { title: "Undocumented risk.", body: "NIS2 and CER push critical operators to evidence connectivity risk. A Resilience Signature supports readiness documentation — not certification or legal advice." },
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
    polarHeader: "COVERAGE ZONE · NORDIC, ARCTIC & ICELAND",
    polarMapLabel: "DEMO MAP · NOT LIVE MONITORING",
    ctaH2:  "Resilience starts with knowing your score.",
    ctaSub: "Free Resilience Signature for any Nordic, Arctic, or Icelandic site. No account — connectivity risk scored in ~60 seconds.",
    ctaBtn: "Score my site · free",
    viewSample: "View sample Signature →",
    footerTag:    "Built in Finland for high-latitude resilience.",
  },
  fi: {
    tag:        "YHTEYDEN RESILIENSSI · POHJOISMAAT, ARKTINEN JA ISLANTI",
    navCta:     "Pisteytä kohteeni · ilmaiseksi",
    h1:         "Tiedä pisteesi ennen kuin Arktinen paljastaa sen puolestasi.",
    sub:        "Pisteet, arvosana, riskit ja rankatut toimittajat pohjoismaisille, arktisille ja islantilaisille kohteille — ~60 sekunnissa. Ilmaiseksi. Ei tiliä.",
    scoreLabel: "Pisteet: {score}/100 · Arvosana {grade}",
    heroSecondary: "Katso esimerkki-Signature",
    modelChip:  "Tutkimusprototyyppi · Malli v0.3",
    sampleCta:  "Katso esimerkki-Signature",
    nis2line:   "Tukee NIS2/CER-valmiusdokumentaatiota · Espoo, Suomi · T&K-prototyyppi",
    statsL1:    "Palveluntarjoajaa indeksoitu",
    statsL2:    "Kaikki orbitaalityypit",
    statsL3:    "Napapiirin kattavuus",
    liveCounter: "kohdetta arvioitu pohjoismaisessa ja arktisessa portfoliossa",
    proofBand:  "Havainnollistava · ei live-seurantaa",
    advisorCta: "Pisteytä kohteeni · ilmaiseksi",
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
    providersHint:  "Valitse kaikki käytössä olevat toimittajat. Valitse Ei yhteyttä, jos satelliittipolkua ei ole dokumentoitu. GRYPS:llä ei ole kaupallista suhdetta listattuihin toimittajiin.",
    providersCoi: "Ei kaupallisia suhteita rankattuihin toimittajiin — katso Toimittajat.",
    boundsHint: "Koordinaattien on oltava pohjoismaisella/arktisella alueella (lat 55–85°, lng −30–40°).",
    emailLabel: "VALINNAINEN SÄHKÖPOSTI",
    emailHint:  "Valinnainen — tallennetaan tähän ajoon, jotta voimme lähettää raportin / ilmoittaa kun live-seuranta käynnistyy. Ei uutiskirjettä.",
    emailOptionalNote: "Näet tulokset joka tapauksessa. Generoinnin jälkeen: Kopioi jaettava linkki (?sid=).",
    runAdvisor: "Pisteytä kohteeni · ilmaiseksi",
    analysing:  "Analysoidaan kohdetta…",
    analyseAnother: "Analysoi toinen kohde",
    telemetryLabel:  "Tutkimusprototyyppi · havainnollistava moottorilähtö",
    telemetryHeader: "MOOTTORILOKI",
    topRiskLabel: "PÄÄRISKI",
    topRecLabel:  "SUOS #1",
    heroTopRisk:  "Ei varayhteyttä",
    problemL: "Miksi kohteet kaatuvat ilman Signaturea",
    problems: [
      { title: "Nolla marginaalia.", body: "Harvester −30°C:ssa, offshore-tarkistus, etäanturiklusteri — yhteyskatko on turvallisuustapahtuma, ei haitta." },
      { title: "Yksi polku. Ei varaa.", body: "Useimmat kohteet käyttävät yhtä satelliittiyhteyttä ilman dokumentoitua varajärjestelmää. Ohitusgeometria pysyy näkymättömänä, kunnes se iskee operaatioihin." },
      { title: "Dokumentoimaton riski.", body: "NIS2 ja CER edellyttävät yhä useammin yhteysriskin näyttöä. Resilience Signature tukee valmiusdokumentaatiota — ei sertifiointia tai oikeudellista neuvontaa." },
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
    polarHeader: "KATTAVUUSALUE · POHJOISMAAT, ARKTINEN JA ISLANTI",
    polarMapLabel: "DEMO-KARTTA · EI LIVE-SEURANTAA",
    ctaH2:  "Resilienssi alkaa pisteidesi tuntemisesta.",
    ctaSub: "Ilmainen Resilience Signature mille tahansa pohjoismaiselle, arktiselle tai islantilaiselle kohteelle. Ei tiliä — yhteysriski pisteytetty ~60 sekunnissa.",
    ctaBtn: "Pisteytä kohteeni · ilmaiseksi",
    viewSample: "Katso esimerkki-Signature →",
    footerTag:    "Rakennettu Suomessa korkean leveysasteen resilienssille.",
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────
function exampleHref(ex: (typeof EXAMPLE_SIGNATURES)[number]): string {
  const p = new URLSearchParams()
  if (ex.input.lat != null) p.set("lat", String(ex.input.lat))
  if (ex.input.lng != null) p.set("lng", String(ex.input.lng))
  if (ex.input.sector) p.set("sector", ex.input.sector)
  if (ex.input.autonomy_level) p.set("autonomy", ex.input.autonomy_level)
  if (ex.input.operation_criticality) p.set("criticality", ex.input.operation_criticality)
  return `/?${p.toString()}#advisor`
}

function ExampleCard({
  ex, lang, viewSample,
}: {
  ex: (typeof EXAMPLE_SIGNATURES)[number]
  lang: "en" | "fi"
  viewSample: string
}) {
  const grade = ex.result.resilience_signature.grade
  const gc = gradeTextColor(grade)
  const border = gradeColor(grade)
  return (
    <a
      href={exampleHref(ex)}
      className="gryps-example-card"
      style={{ borderLeftColor: border }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <span
          className="gryps-grade-badge"
          style={{ color: gc, backgroundColor: gradeBadgeBg(grade), border: `1px solid ${border}44` }}
        >
          {ex.result.resilience_signature.score} · {grade}
        </span>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
          {ex.input.sector?.toUpperCase()}
        </span>
      </div>
      <p className="text-title" style={{ fontFamily: "var(--font-ui)", color: "var(--text)", marginBottom: 8, fontSize: "var(--text-title)" }}>
        {lang === "fi" ? ex.titleFi : ex.title}
      </p>
      <p className="text-small" style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)", marginBottom: 12 }}>
        {ex.result.resilience_signature.summary}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", backgroundColor: "var(--surface2)", padding: "4px 8px", borderRadius: 6 }}>
          {ex.input.autonomy_level}
        </span>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", backgroundColor: "var(--surface2)", padding: "4px 8px", borderRadius: 6 }}>
          {ex.input.operation_criticality}
        </span>
      </div>
      <div className="gryps-example-reveal">{viewSample}</div>
    </a>
  )
}

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

      {/* Non-commercial banner — single top disclosure */}
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
        R&D PROTOTYPE · ESPOO, FINLAND · {lang === "en" ? "NOT FOR SALE" : "EI MYYNNISSÄ"}
      </div>

      <Header
        topOffset={28}
        tagline="CONNECTIVITY INTELLIGENCE"
        lang={lang}
        onLangChange={setLang}
        ctaHref="#advisor"
        ctaLabel={t.navCta}
        extraLinks={[
          { href: "/about", label: lang === "en" ? "About" : "Tietoa" },
          { href: "/map", label: lang === "en" ? "Capacity map" : "Kapasiteettikartta" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
          { href: "/providers", label: lang === "en" ? "Providers" : "Toimittajat" },
        ]}
      />

      {/* Hero */}
      <section
        id="gryps-hero"
        className="gryps-section-pad gryps-hero-pad gryps-hero-aurora gryps-no-print"
        style={{ paddingTop: 148, paddingBottom: "var(--section-y)", paddingLeft: "var(--pad-x)", paddingRight: "var(--pad-x)" }}
      >
        <div className="gryps-content">
          <div className="gryps-hero-grid" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
            gap: 48,
            alignItems: "center",
          }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent-green)", boxShadow: "0 0 8px var(--accent-green)" }} />
                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-label)", color: "var(--text-muted)", letterSpacing: "0.14em" }}>{t.tag}</span>
              </div>

              <h1 className="gryps-hero-h1 text-display" style={{
                fontFamily: "var(--font-ui)", fontSize: "clamp(2rem, 4.2vw, 2.75rem)", fontWeight: 700,
                lineHeight: 1.12, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 18,
              }}>
                {t.h1}
              </h1>

              <p className="gryps-hero-sub text-body" style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)", maxWidth: 480, marginBottom: 28 }}>
                {t.sub}
              </p>

              <div className="gryps-hero-actions" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <a href="#advisor" className="gryps-cta-btn">
                  {t.advisorCta} <ArrowRight size={14} />
                </a>
                <a href="#examples" className="gryps-secondary-btn">
                  {t.heroSecondary}
                </a>
              </div>

              <span style={{
                display: "inline-block", fontFamily: "var(--font-data)", fontSize: "var(--text-label)",
                color: "var(--accent-amber)", letterSpacing: "0.06em",
                backgroundColor: "rgba(245,184,74,0.08)", border: "1px solid rgba(245,184,74,0.25)",
                borderRadius: 6, padding: "4px 10px", marginBottom: 24,
              }}>
                {modelChip}
              </span>

              {siteCount !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent-green)", boxShadow: "0 0 8px var(--accent-green)" }} />
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--accent-green)", letterSpacing: "0.04em" }}>
                    {siteCount} {t.liveCounter}
                  </span>
                </div>
              )}

              <div className="gryps-stats-row gryps-stats-row-hero" style={{ display: "flex", gap: 40, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <Stat value={`${PROVIDER_INDEX_COUNT}`} label={t.statsL1} href="/providers" />
                <Stat value="LEO–MEO–GEO" label={t.statsL2} />
                <Stat value="70°N+" label={t.statsL3} />
              </div>
            </div>

            <div className="gryps-hero-signature-col" style={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              alignSelf: "stretch",
              justifyContent: "center",
            }}>
              <HeroSignatureCard t={t} lang={lang} />
            </div>
          </div>
        </div>
      </section>

      <TrustStrip lang={lang} />

      {/* Problem strip */}
      <FadeUp>
        <section className="gryps-section gryps-section-pad gryps-no-print" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <div className="gryps-content">
            <p className="label" style={{ textAlign: "center", marginBottom: 36 }}>{t.problemL}</p>
            <div className="gryps-problem-grid-responsive">
              {t.problems.map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {[<Shield key="s" size={16} color="var(--accent-blue)" />, <AlertTriangle key="a" size={16} color="var(--accent-amber)" />, <Globe2 key="g" size={16} color="var(--accent-cyan)" />][i]}
                    <span className="text-title" style={{ fontFamily: "var(--font-ui)", color: "var(--text)", fontSize: "var(--text-title)" }}>{item.title}</span>
                  </div>
                  <p className="text-body" style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)", fontSize: "var(--text-small)" }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Live Advisor */}
      <FadeUp>
        <section id="advisor" className="gryps-section gryps-section-pad" style={{ scrollMarginTop: 80 }}>
          <div className="gryps-content-narrow">
            <p className="gryps-no-print label" style={{ marginBottom: 10 }}>
              {lang === "fi" ? "RESILIENCE ADVISOR · KONSOLI" : "RESILIENCE ADVISOR · CONSOLE"}
            </p>
            <h2 className="gryps-no-print text-display" style={{ fontFamily: "var(--font-ui)", color: "var(--text)", marginBottom: 10 }}>
              {t.advisorCta}
            </h2>
            <p className="gryps-no-print text-body" style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)", marginBottom: 28, fontSize: "var(--text-small)" }}>{t.advisorSub}</p>
            <AdvisorForm t={t} lang={lang} />
          </div>
        </section>
      </FadeUp>

      {/* How it works */}
      <FadeUp>
        <section className="gryps-section gryps-section-pad gryps-no-print" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="gryps-content">
            <p className="label" style={{ marginBottom: 32 }}>{t.howL}</p>
            <div className="gryps-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {t.steps.map((step, i) => {
                const icons = [<MapPin key="mp" size={16} color="var(--accent-blue)" />, <Radio key="r" size={16} color="var(--accent-blue)" />, <Zap key="z" size={16} color="var(--accent-blue)" />, <ChevronRight key="cr" size={16} color="var(--accent-blue)" />]
                return (
                  <div key={step.n} className="surface-card" style={{ padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      {icons[i]}
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>{step.n}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-title)", color: "var(--text)", marginBottom: 8 }}>{step.title}</p>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-small)", color: "var(--text-muted)", lineHeight: 1.6 }}>{step.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Example signatures */}
      <FadeUp>
        <section id="examples" className="gryps-section gryps-section-pad gryps-no-print" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="gryps-content">
            <p className="gryps-proof-band-label">{t.proofBand}</p>
            <p className="label" style={{ marginBottom: 10 }}>{t.examplesLabel}</p>
            <p className="text-body" style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)", marginBottom: 28, maxWidth: 560, fontSize: "var(--text-small)" }}>{t.examplesSub}</p>

            <div className="gryps-examples-grid">
              {EXAMPLE_SIGNATURES.map(ex => (
                <ExampleCard key={ex.id} ex={ex} lang={lang} viewSample={t.viewSample} />
              ))}
            </div>
            <div className="gryps-examples-snap">
              {EXAMPLE_SIGNATURES.map(ex => (
                <ExampleCard key={`snap-${ex.id}`} ex={ex} lang={lang} viewSample={t.viewSample} />
              ))}
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Full-bleed ops map */}
      <FadeUp>
        <section className="gryps-no-print" style={{ paddingTop: 8 }}>
          <div className="gryps-content gryps-section-pad" style={{ paddingBottom: 16 }}>
            <p className="gryps-proof-band-label">{t.proofBand}</p>
            <p className="label" style={{ marginBottom: 8 }}>
              {lang === "en" ? "OPS CONSOLE · EXAMPLE SITES" : "OPS-KONSOLI · ESIMERKKIKOHTEET"}
            </p>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-small)", color: "var(--text-muted)", marginBottom: 0 }}>
              {t.polarMapLabel}
            </p>
          </div>
          <LazyOpsMap lang={lang} />
          <div className="gryps-content gryps-section-pad" style={{ paddingTop: 28, paddingBottom: "var(--section-y)" }}>
            <DriftMock lang={lang} />
          </div>
        </section>
      </FadeUp>

      {/* CTA */}
      <FadeUp>
        <section className="gryps-section gryps-section-pad gryps-no-print" style={{ borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <GrypsMark size={44} animate />
          <h2 className="text-display" style={{ fontFamily: "var(--font-ui)", color: "var(--text)", margin: "20px 0 12px" }}>
            {t.ctaH2}
          </h2>
          <p className="text-body" style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)", margin: "0 auto 32px", maxWidth: 480, fontSize: "var(--text-small)" }}>
            {t.ctaSub}
          </p>
          <a href="#advisor" className="gryps-cta-btn">
            {t.ctaBtn} <ArrowRight size={14} />
          </a>
        </section>
      </FadeUp>

      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en"
          ? "Non-commercial R&D prototype"
          : "Ei-kaupallinen T&K-prototyyppi")}
        footerTag={t.footerTag}
        secondaryLink={{ href: "/map", label: lang === "en" ? "Capacity map" : "Kapasiteettikartta" }}
      />

      <StickyMobileCta label={t.navCta} />
    </div>
  )
}

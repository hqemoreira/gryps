"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Radio, Shield, Zap, ChevronRight, Globe2, AlertTriangle, Sun, Moon } from "lucide-react"

// ── GRYPS Mark ────────────────────────────────────────────────────────────────
function GrypsMark({ size = 36 }: { size?: number }) {
  const r = size / 2
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer arc — GEO */}
      <path d="M4 18 A14 14 0 0 1 32 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Mid arc — MEO */}
      <path d="M8 18 A10 10 0 0 1 28 18" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75"/>
      {/* Inner arc — LEO */}
      <path d="M12 18 A6 6 0 0 1 24 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* North arrow */}
      <line x1="18" y1="20" x2="18" y2="10" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 13 L18 9 L21 13" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Origin point */}
      <circle cx="18" cy="21" r="1.5" fill="#4FA8FF"/>
    </svg>
  )
}

// ── Waitlist form ─────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [vertical, setVertical] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !vertical) return
    setLoading(true)
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, vertical }),
      })
    } catch {}
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div style={{
        border: "1px solid rgba(46,212,122,0.3)",
        backgroundColor: "rgba(46,212,122,0.06)",
        borderRadius: 8,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2ED47A", flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, color: "#2ED47A" }}>Access request received</p>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{email} — we'll be in touch directly.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          placeholder="your@company.com"
          title="Please enter your corporate email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            flex: 1,
            backgroundColor: "var(--surface2)",
            border: "1px solid var(--border2)",
            borderRadius: 6,
            padding: "10px 14px",
            fontFamily: "var(--font-data)",
            fontSize: 12,
            color: "var(--text)",
            outline: "none",
          }}
        />
        <select
          value={vertical}
          onChange={e => setVertical(e.target.value)}
          required
          style={{
            backgroundColor: "var(--surface2)",
            border: "1px solid var(--border2)",
            borderRadius: 6,
            padding: "10px 14px",
            fontFamily: "var(--font-ui)",
            fontSize: 12,
            color: vertical ? "var(--text)" : "var(--text-muted)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="" disabled>Sector</option>
          <option value="maritime">Maritime</option>
          <option value="forestry">Forestry</option>
          <option value="mining">Mining</option>
          <option value="arctic">Arctic / Polar</option>
          <option value="integrator">Systems Integrator</option>
          <option value="other">Other</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          backgroundColor: "#4FA8FF",
          color: "#070B12",
          border: "none",
          borderRadius: 6,
          padding: "11px 20px",
          fontFamily: "var(--font-ui)",
          fontWeight: 700,
          fontSize: 13,
          cursor: loading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: loading ? 0.7 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {loading ? "Requesting access…" : <>Request early access <ArrowRight size={14} /></>}
      </button>
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
    const id = setInterval(() => {
      setVisible(v => v < TELEMETRY_LINES.length ? v + 1 : 1)
    }, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "16px 18px",
      fontFamily: "var(--font-data)",
      fontSize: 11,
      lineHeight: 2,
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 6px #2ED47A" }} />
        <span style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.1em" }}>{t.telemetryHeader}</span>
      </div>
      {TELEMETRY_LINES.map((line, i) => (
        <div key={i} style={{
          display: "flex", gap: 12,
          opacity: i < visible ? (i === visible - 1 ? 1 : 0.45) : 0,
          transition: "opacity 0.4s ease",
          whiteSpace: "nowrap", overflow: "hidden",
        }}>
          <span style={{ color: line.color, minWidth: 80, flexShrink: 0 }}>[{line.tag}]</span>
          <span style={{ color: i === visible - 1 ? "var(--text)" : "var(--text-muted)" }}>{line.text}</span>
        </div>
      ))}
    </div>
  )
}

// ── Polar map — live orbital animation ────────────────────────────────────────
function PolarMap({ t }: { t: typeof COPY.en }) {
  const cx = 200, cy = 195, maxR = 160
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let raf: number
    let start = performance.now()
    function loop(now: number) {
      setTick((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const latLines = [90, 80, 70, 60, 50]
  const markers = [
    { lat: 68.2, lon: 27.4,  label: "68.2°N",  active: true  },
    { lat: 71.0, lon: 25.9,  label: "71.0°N",  active: false },
    { lat: 64.5, lon: -21.9, label: "64.5°N",  active: false },
    { lat: 78.2, lon: 15.6,  label: "78.2°N",  active: false },
  ]

  function latToR(lat: number) { return ((90 - lat) / 50) * maxR }
  function toXY(lat: number, lon: number) {
    const r = latToR(lat)
    const angle = (lon * Math.PI) / 180 - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }
  function satPos(r: number, speed: number, offset: number) {
    const a = tick * speed + offset
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  // Three live satellites: Starlink (LEO fast), OneWeb (LEO medium), Iridium (polar)
  const starlink = satPos(latToR(67), 1.5, 0)
  const oneweb   = satPos(latToR(71), 1.1, 2.4)
  const iridium  = satPos(latToR(74), 0.8, 4.7)

  // Scan beam from active marker outward
  const activePt = toXY(68.2, 27.4)
  const pulsePct = (Math.sin(tick * 2.5) + 1) / 2
  const pulseR   = 6 + pulsePct * 5

  // Signal line from active marker to nearest sat
  const dx = starlink.x - activePt.x, dy = starlink.y - activePt.y
  const dist = Math.sqrt(dx * dx + dy * dy)
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
        {/* Latitude rings */}
        {latLines.map(lat => (
          <circle key={lat} cx={cx} cy={cy} r={latToR(lat)} fill="none"
            stroke="var(--border)" strokeWidth={lat === 70 ? 1.2 : 0.7}
            strokeDasharray={lat === 70 ? "none" : "3 4"} />
        ))}
        {/* Meridian lines */}
        {[-90, -45, 0, 45, 90, 135].map(lon => {
          const angle = (lon * Math.PI) / 180 - Math.PI / 2
          return <line key={lon} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="var(--border)" strokeWidth={0.6} opacity={0.5} />
        })}
        {/* Ring labels */}
        <text x={cx + latToR(70) + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="var(--text-dim)">70°N</text>
        <text x={cx + latToR(60) + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="var(--text-dim)">60°N</text>
        {/* Coverage shading */}
        <circle cx={cx} cy={cy} r={latToR(50)} fill="rgba(79,168,255,0.04)" />
        <circle cx={cx} cy={cy} r={latToR(70)} fill="rgba(110,231,249,0.05)" />
        {/* Signal line: active site → Starlink */}
        <line x1={activePt.x} y1={activePt.y} x2={starlink.x} y2={starlink.y}
          stroke="#4FA8FF" strokeWidth={0.8} strokeDasharray="4 3" opacity={signalOpacity} />
        {/* Location markers */}
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
        {/* Live satellite — Starlink */}
        <circle cx={starlink.x} cy={starlink.y} r={5} fill="rgba(79,168,255,0.15)" />
        <circle cx={starlink.x} cy={starlink.y} r={2.5} fill="#4FA8FF" />
        <text x={starlink.x + 5} y={starlink.y - 4} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="#4FA8FF">SL</text>
        {/* Live satellite — OneWeb */}
        <circle cx={oneweb.x} cy={oneweb.y} r={4} fill="rgba(110,231,249,0.12)" />
        <circle cx={oneweb.x} cy={oneweb.y} r={2} fill="#6EE7F9" />
        <text x={oneweb.x + 4} y={oneweb.y - 3} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="#6EE7F9">OW</text>
        {/* Live satellite — Iridium */}
        <circle cx={iridium.x} cy={iridium.y} r={3.5} fill="rgba(245,184,74,0.12)" />
        <circle cx={iridium.x} cy={iridium.y} r={1.8} fill="#F5B84A" />
        <text x={iridium.x + 4} y={iridium.y - 3} style={{ fontFamily: "var(--font-data)", fontSize: 7 }} fill="#F5B84A">IR</text>
        {/* North pole */}
        <circle cx={cx} cy={cy} r={2} fill="var(--text-dim)" />
        <text x={cx + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 9 }} fill="var(--text-dim)">N</text>
      </svg>
    </div>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const TIER_COLORS = [
  { color: "var(--text)",  accent: "var(--border2)" },
  { color: "#4FA8FF",      accent: "rgba(79,168,255,0.2)" },
  { color: "#6EE7F9",      accent: "rgba(110,231,249,0.15)" },
]

function PricingTiers({ t }: { t: typeof COPY.en }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {t.tiers.map((tier, i) => {
        const { color, accent } = TIER_COLORS[i]
        return (
          <div key={tier.name} style={{
            backgroundColor: "var(--surface)",
            border: `1px solid ${tier.highlight ? accent : "var(--border)"}`,
            borderRadius: 10,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
          }}>
            {tier.highlight && (
              <div style={{
                position: "absolute", top: -1, left: 24, right: 24,
                height: 2, backgroundColor: "#4FA8FF", borderRadius: "0 0 2px 2px",
              }} />
            )}
            <div>
              <p className="label" style={{ marginBottom: 8 }}>{tier.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 700, color, letterSpacing: "-0.02em" }}>{tier.price}</span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}>{tier.unit}</span>
              </div>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>{tier.description}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {tier.features.map((f, fi) => (
                <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)" }}>{f}</span>
                </div>
              ))}
            </div>
            <a href="#waitlist" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              backgroundColor: tier.highlight ? "#4FA8FF" : "var(--surface2)",
              color: tier.highlight ? "#070B12" : "var(--text-muted)",
              border: `1px solid ${tier.highlight ? "#4FA8FF" : "var(--border2)"}`,
              borderRadius: 6, padding: "10px", textDecoration: "none",
              fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12,
            }}>
              {tier.cta} <ArrowRight size={12} />
            </a>
          </div>
        )
      })}
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

// ── PDF download mock ─────────────────────────────────────────────────────────
function PdfToggle({ t }: { t: typeof COPY.en }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
          borderRadius: 6, padding: "8px 14px", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {t.pdfBtn}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
          backgroundColor: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "16px", width: 260,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)", marginBottom: 6 }}>{t.pdfTitle}</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>{t.pdfDesc}</p>
          <a href="#waitlist" onClick={() => setOpen(false)} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            backgroundColor: "#4FA8FF", color: "#070B12",
            borderRadius: 5, padding: "8px 14px", textDecoration: "none",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11,
          }}>
            {t.navCta} <ArrowRight size={11} />
          </a>
        </div>
      )}
    </div>
  )
}

// ── Sample advisor output ─────────────────────────────────────────────────────
const PROVIDER_STATIC = [
  { rank: 1, name: "Starlink",       type: "LEO Constellation", confidence: 94, latency: "25–45ms",   uptime: "99.3%" },
  { rank: 2, name: "OneWeb",         type: "LEO Constellation", confidence: 81, latency: "35–70ms",   uptime: "98.7%" },
  { rank: 3, name: "Iridium Certus", type: "LEO — Polar orbit", confidence: 67, latency: "150–300ms", uptime: "99.9%" },
]

function AdvisorPreview({ t }: { t: typeof COPY.en }) {
  return (
    <div style={{
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 6px #2ED47A" }} />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em" }}>{t.advisorHeader}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>{t.advisorCoords}</span>
          <PdfToggle t={t} />
        </div>
      </div>

      {/* Providers */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {PROVIDER_STATIC.map((p, i) => {
          const tr = t.providers[i]
          return (
            <div key={p.rank} style={{
              backgroundColor: "var(--surface2)",
              border: `1px solid ${p.rank === 1 ? "rgba(79,168,255,0.2)" : "var(--border)"}`,
              borderRadius: 8,
              padding: "12px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{p.name}</span>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", backgroundColor: "var(--border)", padding: "1px 6px", borderRadius: 3 }}>{p.type}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, color: tr.statusColor }}>{tr.statusLabel}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 20, fontWeight: 700, color: p.rank === 1 ? "#4FA8FF" : "var(--text)", lineHeight: 1 }}>{p.confidence}<span style={{ fontSize: 11, color: "var(--text-muted)" }}>%</span></div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginTop: 2 }}>{t.deployL}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                <div>
                  <div className="label" style={{ marginBottom: 2 }}>{t.latencyL}</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)" }}>{p.latency}</div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 2 }}>{t.uptimeL}</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)" }}>{p.uptime}</div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, flex: 1 }}>{tr.rationale}</p>
                <span title="EU AI Act Art. 50 — AI-generated analytical summary. Not a guarantee of network availability." style={{
                  flexShrink: 0, fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)",
                  border: "1px solid var(--border)", borderRadius: 3, padding: "2px 5px",
                  letterSpacing: "0.06em", cursor: "help",
                }}>AI</span>
              </div>
            </div>
          )
        })}
      </div>
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
    // Nav
    tag:        "EARLY ACCESS · NORDIC & ARCTIC OPERATIONS",
    navCta:     "Early access",
    // Hero
    h1:         ["Know which satellite", "provider to choose", "before it matters."],
    sub:        "GRYPS is a connectivity intelligence platform for industrial operators in maritime, forestry, Arctic, and mining environments. Enter your coordinates and operational requirements — get a ranked, data-backed recommendation with a Deployment Confidence score.",
    statsL1:    "Providers indexed",
    statsL2:    "All orbital types",
    statsL3:    "Polar coverage",
    waitlistL:  "Request early access",
    waitlistSub:"Non-commercial R&D prototype · No sales calls · No automated sequences.",
    // Telemetry
    telemetryLabel:  "ILLUSTRATIVE ENGINE OUTPUT — NOT LIVE DATA",
    telemetryHeader: "ORBITAL INTELLIGENCE ENGINE · LIVE",
    // Problem strip
    problemL: "The problem GRYPS solves",
    problems: [
      { title: "The market is fragmented",    body: "Starlink, OneWeb, Iridium, Inmarsat, Viasat, and dozens of regional providers—each with different orbital types, coverage claims, and pricing. Procurement teams are navigating this alone." },
      { title: "The stakes are operational",  body: "A lost IoT signal from a harvester at −30°C. A dropped safety check-in from an offshore platform. Connectivity failures in these environments are not inconveniences—they are safety events." },
      { title: "No neutral intelligence exists", body: "Provider sales reps are conflicted. Consultants are generalists. Peer recommendations are anecdotal. There is no tool that answers: for my location, my use case—which provider gives me the best chance of staying connected?" },
    ],
    // How it works
    howL:  "How the Advisor works",
    steps: [
      { n: "01", title: "Enter location",    body: "Coordinates or named region. Elevation and terrain are factored automatically." },
      { n: "02", title: "Select vertical",   body: "Forestry, maritime, mining, or Arctic. Scoring weights adjust per sector." },
      { n: "03", title: "Set priorities",    body: "Uptime, latency, bandwidth, or redundancy. Your operational requirements drive the ranking." },
      { n: "04", title: "Get your score",    body: "Three ranked providers with Deployment Confidence scores and plain-language rationale." },
    ],
    // Advisor
    advisorHeader: "ADVISOR · MISSION ANALYSIS",
    advisorCoords: "68.2°N · 27.4°E — FORESTRY — UPTIME",
    advisorLabel:  "SAMPLE OUTPUT — ILLUSTRATIVE DATA",
    latencyL:  "Latency",
    uptimeL:   "Uptime",
    deployL:   "DEPLOY CONFIDENCE",
    providers: [
      { statusLabel: "Recommended",     statusColor: "#2ED47A", rationale: "Excellent overhead coverage at 68°N. High pass frequency minimises link interruption during harvester movement. Dual-dish configuration advised for canopy environments." },
      { statusLabel: "Strong alternative", statusColor: "#4FA8FF", rationale: "Comparable polar coverage with strong EU regulatory alignment. Slightly higher latency but more predictable SLA terms for enterprise procurement." },
      { statusLabel: "Redundancy only", statusColor: "#F5B84A", rationale: "Unmatched uptime at extreme latitudes. Latency too high for telemetry but ideal as a failover for safety communications and IoT check-ins." },
    ],
    // PDF toggle
    pdfBtn:   "Download sample report",
    pdfTitle: "PDF report — early access",
    pdfDesc:  "Full PDF reports are generated per analysis and delivered to early access members. Join the waitlist to receive yours.",
    // Polar map
    polarHeader: "COVERAGE ZONE — NORDIC & ARCTIC",
    // Pricing
    pricingL:  "Pricing",
    pricingH2: "Precision pricing for industrial procurement.",
    tiers: [
      { name: "Report",   price: "€550",   unit: "per analysis",        highlight: false, cta: "Join waitlist",  description: "Single-location suitability report for procurement teams.",                              features: ["One coordinate analysis", "Top 3 provider ranking", "Deployment Confidence scores", "Plain-language rationale", "Executive PDF — board-ready"] },
      { name: "Platform", price: "€990",   unit: "per month",           highlight: true,  cta: "Join waitlist",  description: "Unlimited analyses for operations teams managing multiple sites.",                      features: ["Unlimited location analyses", "All verticals and orbital types", "Priority scoring configuration", "Historical comparison", "Team access · CSV export"] },
      { name: "API",      price: "Custom", unit: "from €2,500 / month", highlight: false, cta: "Contact us",    description: "Direct API access for systems integrators and fleet platforms.",                        features: ["REST API — full scoring engine", "Webhook provider alerts", "Custom vertical weights", "SLA-backed uptime", "Dedicated integration support"] },
    ],
    // CTA
    ctaH2:  "Built for operators, not marketers.",
    ctaSub: "Nordic and Arctic launch. Early access users help shape the scoring models.",
    ctaBtn: "Request early access",
    // Demo reel
    demoL: "See GRYPS in 60 seconds",
    demoSub: "Silent product tour — no audio required.",
    demoScenes: [
      { label: "01 · The problem", headline: "120+ providers. 0 neutral answers.", body: "Procurement teams across maritime, forestry, mining, and Arctic environments spend weeks evaluating satellite connectivity without a single source of truth." },
      { label: "02 · Your mission", headline: "Enter coordinates. Select your sector.", body: "GRYPS accepts any location on Earth. Elevation, terrain, and orbital geometry are resolved automatically against your operational vertical." },
      { label: "03 · Intelligence running", headline: "Orbital data. Real-time scoring.", body: "The engine evaluates pass density, horizon angles, canopy penalties, and SLA reliability across every major provider in your coverage zone." },
      { label: "04 · Your ranking", headline: "Three providers. Clear confidence scores.", body: "Starlink 94 · OneWeb 81 · Iridium 67. Each score is backed by plain-language rationale your board can read and your operations team can act on." },
      { label: "05 · Export & deploy", headline: "Board-ready PDF. Deployment starts.", body: "Export your analysis as a structured executive report. Share with procurement, sign the contract, and deploy with data behind every decision." },
    ],
    // Footer
    footerRights: "© 2026 GRYPS · Espoo, Finland · Non-commercial R&D prototype · No registered company · No revenue generated",
    footerTag:    "Built in Finland for high-latitude resilience.",
  },
  fi: {
    // Nav
    tag:        "VARHAINEN PÄÄSY · POHJOISMAAT JA ARKTINEN",
    navCta:     "Varhainen pääsy",
    // Hero
    h1:         ["Tiedä mikä satelliitti-", "toimittaja valita", "ennen kuin se ratkaisee."],
    sub:        "GRYPS on yhteysintelligenssiplatformi teollisuusoperaattoreille merenkululle, metsätaloudelle, arktisille alueille ja kaivostoiminnalle. Syötä koordinaatit ja operatiiviset vaatimuksesi — saat rankatun, dataan perustuvan suosituksen Deployment Confidence -pisteytyksen kera.",
    statsL1:    "Palveluntarjoajaa indeksoitu",
    statsL2:    "Kaikki orbitaalityypit",
    statsL3:    "Napapiirin kattavuus",
    waitlistL:  "Pyydä varhaista pääsyä",
    waitlistSub:"Ei-kaupallinen T&K-prototyyppi · Ei myyntipuheluita · Ei automaattisia sekvenssejä.",
    // Telemetry
    telemetryLabel:  "HAVAINNOLLISTAVA MOOTTORILÄHTÖ — EI LIVE-DATAA",
    telemetryHeader: "ORBITAALINEN TIEDUSTELUMOOTTORI · LIVE",
    // Problem strip
    problemL: "Ongelma, jonka GRYPS ratkaisee",
    problems: [
      { title: "Markkinat ovat hajautuneet",   body: "Starlink, OneWeb, Iridium, Inmarsat, Viasat ja kymmeniä alueellisia toimittajia—jokainen eri orbitaalityypeillä, kattavuusväittämillä ja hinnoittelulla. Hankintatiimit navigoivat tätä yksin." },
      { title: "Panokset ovat operatiiviset",  body: "Kadonnut IoT-signaali harvestorilta −30°C:ssa. Pudotettu turvatarkistus offshore-alustalta. Yhteyshäiriöt näissä ympäristöissä eivät ole haittoja—ne ovat turvallisuustapahtumia." },
      { title: "Neutraalia tiedustelua ei ole", body: "Toimittajien myyntiedustajat ovat eturistiriidassa. Konsultit ovat yleisosaajia. Vertaissuositukset ovat anekdoottisia. Ei ole olemassa työkalua, joka vastaisi: sijaintini, käyttötapaukseni—mikä toimittaja antaa minulle parhaan mahdollisuuden pysyä yhteydessä?" },
    ],
    // How it works
    howL:  "Miten Advisor toimii",
    steps: [
      { n: "01", title: "Syötä sijainti",       body: "Koordinaatit tai nimetty alue. Korkeus ja maasto huomioidaan automaattisesti." },
      { n: "02", title: "Valitse toimiala",      body: "Metsätalous, merenkulku, kaivostoiminta tai arktinen. Pisteytyksen painot säätyvät toimialakohtaisesti." },
      { n: "03", title: "Aseta prioriteetit",    body: "Käytettävyys, latenssi, kaistanleveys tai redundanssi. Operatiiviset vaatimuksesi ohjaavat rankingia." },
      { n: "04", title: "Saat pisteytyksen",     body: "Kolme rankattu toimittajaa Deployment Confidence -pisteillä ja selkokielisellä perusteella." },
    ],
    // Advisor
    advisorHeader: "ADVISOR · MISSION ANALYSIS",
    advisorCoords: "68.2°N · 27.4°E — METSÄTALOUS — KÄYTETTÄVYYS",
    advisorLabel:  "ESIMERKKITULOSTE — HAVAINNOLLISTAVAA DATAA",
    latencyL:  "Latenssi",
    uptimeL:   "Käytettävyys",
    deployL:   "KÄYTTÖÖNOTTOLUOTTAMUS",
    providers: [
      { statusLabel: "Suositellaan",       statusColor: "#2ED47A", rationale: "Erinomainen yläpuolinen kattavuus 68°N:ssa. Korkea passifrekvenssi minimoi linkkikatkokset harvestorin liikkuessa. Dual-dish-konfiguraatio suositellaan latvustoympäristöihin." },
      { statusLabel: "Vahva vaihtoehto",   statusColor: "#4FA8FF", rationale: "Vertailukelpoinen napapiirin kattavuus vahvalla EU-sääntelymukaisuudella. Hieman korkeampi latenssi mutta ennustettavammat SLA-ehdot yrityshankintaan." },
      { statusLabel: "Vain redundanssi",   statusColor: "#F5B84A", rationale: "Vertaansa vailla oleva käytettävyys äärileveysasteilla. Latenssi liian korkea telemetriaan mutta ihanteellinen turvaviestinnän ja IoT-kuittausten varajärjestelmäksi." },
    ],
    // PDF toggle
    pdfBtn:   "Lataa esimerkkiraportti",
    pdfTitle: "PDF-raportti — varhainen pääsy",
    pdfDesc:  "Täydelliset PDF-raportit luodaan analyysikohtaisesti ja toimitetaan varhaisille käyttäjille. Liity jonotuslistalle saadaksesi omasi.",
    // Polar map
    polarHeader: "KATTAVUUSALUE — POHJOISMAAT JA ARKTINEN",
    // Pricing
    pricingL:  "Hinnoittelu",
    pricingH2: "Selkeä hinnoittelu teollisuushankintaan.",
    tiers: [
      { name: "Raportti",  price: "€550",     unit: "per analyysi",       highlight: false, cta: "Liity jonotuslistalle", description: "Yksittäisen sijainnin soveltuvuusraportti hankintatiimeille.",                                    features: ["Yksi koordinaattianalyysi", "Top 3 -toimittajaranking", "Deployment Confidence -pisteet", "Selkokielinen perustelu", "Johdon PDF — hallituskelpoinen"] },
      { name: "Alusta",    price: "€990",     unit: "kuukaudessa",         highlight: true,  cta: "Liity jonotuslistalle", description: "Rajoittamattomat analyysit useita kohteita hallinnoiville operaatiotiimeille.",               features: ["Rajoittamattomat sijaintianalyysit", "Kaikki toimialat ja orbitaalityypit", "Prioriteettipisteytyksen konfiguraatio", "Historiallinen vertailu", "Tiimikäyttö · CSV-vienti"] },
      { name: "API",       price: "Räätälöity", unit: "alkaen €2 500 / kk", highlight: false, cta: "Ota yhteyttä",          description: "Suora API-käyttö järjestelmäintegraattoreille ja laivasto-alustoille.",                        features: ["REST API — täysi pisteytysmootori", "Webhook-toimittajahälytykset", "Räätälöidyt toimialapainot", "SLA-taattu käytettävyys", "Omistettu integraatiotuki"] },
    ],
    // CTA
    ctaH2:  "Rakennettu operaattoreille, ei markkinoijille.",
    ctaSub: "Pohjoismainen ja arktinen julkaisu. Varhaiset käyttäjät auttavat muovaamaan pisteytysmallit.",
    ctaBtn: "Pyydä varhaista pääsyä",
    // Demo reel
    demoL: "Katso GRYPS 60 sekunnissa",
    demoSub: "Hiljainen tuote-esittely — ei ääntä tarvita.",
    demoScenes: [
      { label: "01 · Ongelma", headline: "120+ toimittajaa. 0 neutraalia vastausta.", body: "Hankintatiimit merenkululle, metsätaloudelle, kaivostoiminnalle ja arktisille alueille käyttävät viikkoja satelliittiyhteyksien arviointiin ilman yhtä totuuden lähdettä." },
      { label: "02 · Tehtäväsi", headline: "Syötä koordinaatit. Valitse toimialasi.", body: "GRYPS hyväksyy minkä tahansa sijainnin maapallolla. Korkeus, maasto ja orbitaaligeometria ratkaistaan automaattisesti operatiivisen toimialasi mukaan." },
      { label: "03 · Tiedustelu käynnissä", headline: "Orbitaalidata. Reaaliaikainen pisteytys.", body: "Moottori arvioi passitiheyden, horisonttikulmät, latvustopanokset ja SLA-luotettavuuden jokaisen suuren toimittajan osalta kattavuusalueellasi." },
      { label: "04 · Rankingisi", headline: "Kolme toimittajaa. Selkeät luottamuspisteet.", body: "Starlink 94 · OneWeb 81 · Iridium 67. Jokainen pisteet on tuettu selkokielisellä perusteella, jonka hallituksesi voi lukea ja operaatiotiimisi voi toteuttaa." },
      { label: "05 · Vienti ja käyttöönotto", headline: "Hallitusvalmis PDF. Käyttöönotto alkaa.", body: "Vie analyysisi strukturoituna johtoraporttina. Jaa hankintaan, allekirjoita sopimus ja ota käyttöön dataan perustuvan jokaisen päätöksen kanssa." },
    ],
    // Footer
    footerRights: "© 2026 GRYPS · Espoo, Suomi · Ei-kaupallinen T&K-prototyyppi · Ei rekisteröityä yritystä · Ei tuloja",
    footerTag:    "Rakennettu Suomessa korkean leveysasteen resilienssille.",
  },
}

// ── Demo reel scene visualizations ───────────────────────────────────────────
const PROVIDER_NAMES = ["Starlink", "OneWeb", "Iridium", "Inmarsat", "Viasat", "SES", "Telesat", "Hughes", "Eutelsat"]
const SCENE_POSITIONS = [
  [8,30],[22,8],[38,20],[55,6],[70,25],[12,52],[28,45],[47,55],[65,48],
]

function SceneViz0() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {PROVIDER_NAMES.map((name, i) => (
        <div key={name} style={{
          position: "absolute",
          left: `${SCENE_POSITIONS[i][0]}%`,
          top: `${SCENE_POSITIONS[i][1]}%`,
          backgroundColor: "var(--surface2)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: "4px 8px",
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--text-muted)",
          animation: `drift${i % 4} ${2.2 + i * 0.25}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.18}s`,
        }}>{name}</div>
      ))}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 96, fontWeight: 900, color: "rgba(79,168,255,0.07)", lineHeight: 1 }}>?</span>
      </div>
    </div>
  )
}

function SceneViz1() {
  const COORDS = "68.2°N · 27.4°E"
  const [typed, setTyped] = useState(0)
  const [step, setStep]   = useState(0)

  useEffect(() => {
    setTyped(0); setStep(0)
  }, [])

  useEffect(() => {
    if (step === 0) {
      if (typed < COORDS.length) {
        const id = setTimeout(() => setTyped(c => c + 1), 75)
        return () => clearTimeout(id)
      }
      const id = setTimeout(() => setStep(1), 500)
      return () => clearTimeout(id)
    }
    if (step === 1) { const id = setTimeout(() => setStep(2), 900); return () => clearTimeout(id) }
    if (step === 2) { const id = setTimeout(() => setStep(3), 800); return () => clearTimeout(id) }
  }, [typed, step])

  const field = (label: string, value: string, active: boolean, filled: boolean) => (
    <div>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</p>
      <div style={{
        backgroundColor: "var(--surface2)",
        border: `1px solid ${active ? "rgba(79,168,255,0.5)" : filled ? "rgba(79,168,255,0.2)" : "var(--border)"}`,
        borderRadius: 6, padding: "9px 12px",
        fontFamily: "var(--font-data)", fontSize: 12,
        color: filled ? "var(--text)" : "var(--text-muted)",
        transition: "border-color 0.3s",
        minHeight: 38,
      }}>
        {value}{active && <span style={{ borderRight: "1.5px solid #4FA8FF", marginLeft: 1, animation: "blink 0.9s infinite" }}>&nbsp;</span>}
      </div>
    </div>
  )

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", height: "100%" }}>
      {field("COORDINATES", COORDS.slice(0, typed), step === 0, step > 0)}
      {field("SECTOR", step >= 1 ? "Forestry / Metsätalous" : "", step === 1, step > 1)}
      {field("PRIORITY WEIGHT", step >= 2 ? "Uptime  ████████░░  80%" : "", step === 2, step > 2)}
      {step >= 3 && (
        <div style={{
          backgroundColor: "rgba(79,168,255,0.08)", border: "1px solid rgba(79,168,255,0.2)",
          borderRadius: 6, padding: "10px 12px",
          fontFamily: "var(--font-data)", fontSize: 11, color: "#4FA8FF",
          display: "flex", alignItems: "center", gap: 8,
          animation: "fadeInScene 0.4s ease",
        }}>
          <span>▶</span> Running analysis…
        </div>
      )}
    </div>
  )
}

function SceneViz2() {
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    if (visible < TELEMETRY_LINES.length) {
      const id = setTimeout(() => setVisible(v => v + 1), 950)
      return () => clearTimeout(id)
    }
  }, [visible])
  return (
    <div style={{ padding: "16px 20px", fontFamily: "var(--font-data)", fontSize: 10, lineHeight: 1.9, height: "100%", overflowY: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 5px #2ED47A" }} />
        <span style={{ color: "var(--text-muted)", letterSpacing: "0.1em", fontSize: 9 }}>ORBITAL INTELLIGENCE ENGINE</span>
      </div>
      {TELEMETRY_LINES.map((line, i) => (
        <div key={i} style={{
          display: "flex", gap: 10, whiteSpace: "nowrap", overflow: "hidden",
          opacity: i < visible ? (i === visible - 1 ? 1 : 0.4) : 0,
          transition: "opacity 0.3s",
        }}>
          <span style={{ color: line.color, minWidth: 72, flexShrink: 0 }}>[{line.tag}]</span>
          <span style={{ color: i === visible - 1 ? "var(--text)" : "var(--text-muted)" }}>{line.text}</span>
        </div>
      ))}
    </div>
  )
}

function SceneViz3() {
  const PROVIDERS3 = [
    { name: "Starlink",       target: 94, color: "#4FA8FF", type: "LEO Constellation" },
    { name: "OneWeb",         target: 81, color: "#6EE7F9", type: "LEO Constellation" },
    { name: "Iridium Certus", target: 67, color: "#F5B84A", type: "LEO — Polar orbit" },
  ]
  const [scores, setScores] = useState([0, 0, 0])

  useEffect(() => {
    const id = setInterval(() => {
      setScores(prev => {
        const next = prev.map((s, i) => Math.min(s + 1.8, PROVIDERS3[i].target))
        if (next.every((s, i) => s >= PROVIDERS3[i].target)) clearInterval(id)
        return next
      })
    }, 25)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", height: "100%" }}>
      {PROVIDERS3.map((p, i) => (
        <div key={p.name}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)" }}>{p.name}</span>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", marginLeft: 8 }}>{p.type}</span>
            </div>
            <span style={{ fontFamily: "var(--font-data)", fontWeight: 700, fontSize: 16, color: p.color, letterSpacing: "-0.02em" }}>
              {Math.round(scores[i])}<span style={{ fontSize: 10, color: "var(--text-muted)" }}>%</span>
            </span>
          </div>
          <div style={{ height: 5, backgroundColor: "var(--surface2)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${scores[i]}%`, borderRadius: 3,
              backgroundColor: p.color,
              boxShadow: scores[i] > 10 ? `0 0 6px ${p.color}55` : "none",
              transition: "width 0.025s linear, box-shadow 0.3s",
            }} />
          </div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", marginTop: 3, letterSpacing: "0.06em" }}>DEPLOYMENT CONFIDENCE</p>
        </div>
      ))}
    </div>
  )
}

function SceneViz4() {
  const [step, setStep] = useState(0)
  const checks = [
    "Satellite rankings compiled",
    "Deployment Confidence scores locked",
    "Plain-language rationale generated",
    "Executive PDF — board-ready",
  ]
  useEffect(() => {
    const timers = checks.map((_, i) => setTimeout(() => setStep(s => Math.max(s, i + 1)), i * 900 + 400))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, justifyContent: "center", height: "100%" }}>
      {/* Document */}
      <div style={{
        width: 72, height: 88,
        backgroundColor: "var(--surface2)", border: `1px solid ${step >= 4 ? "rgba(46,212,122,0.4)" : "var(--border)"}`,
        borderRadius: 6, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 6,
        transition: "border-color 0.4s",
      }}>
        <GrypsMark size={28} />
        {step >= 4 && (
          <div style={{
            backgroundColor: "#2ED47A", borderRadius: 10, padding: "2px 6px",
            fontFamily: "var(--font-data)", fontSize: 8, color: "#070B12", fontWeight: 700,
            animation: "fadeInScene 0.3s ease",
          }}>PDF</div>
        )}
      </div>
      {/* Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        {checks.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
              backgroundColor: i < step ? "#2ED47A" : "var(--surface2)",
              border: `1px solid ${i < step ? "#2ED47A" : "var(--border)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s",
            }}>
              {i < step && <span style={{ color: "#070B12", fontSize: 9, fontWeight: 900 }}>✓</span>}
            </div>
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: 11,
              color: i < step ? "var(--text)" : "var(--text-dim)",
              transition: "color 0.3s",
            }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Product demo reel ────────────────────────────────────────────────────────
function DemoReel({ t }: { t: typeof COPY.en }) {
  const [scene, setScene] = useState(0)
  const [progress, setProgress] = useState(0)
  const SCENE_MS = 13000
  const scenes = t.demoScenes

  useEffect(() => {
    setProgress(0)
    const start = Date.now()
    const id = setInterval(() => {
      const pct = Math.min((Date.now() - start) / SCENE_MS, 1)
      setProgress(pct)
      if (pct >= 1) { clearInterval(id); setScene(s => (s + 1) % scenes.length) }
    }, 50)
    return () => clearInterval(id)
  }, [scene, scenes.length])

  const VIZS = [
    <SceneViz0 key="v0" />,
    <SceneViz1 key="v1" />,
    <SceneViz2 key="v2" />,
    <SceneViz3 key="v3" />,
    <SceneViz4 key="v4" />,
  ]
  const current = scenes[scene]

  return (
    <div>
      {/* Main display */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "10px 10px 0 0",
        overflow: "hidden",
        minHeight: 320,
      }}>
        {/* Left: animated viz */}
        <div key={`viz-${scene}`} style={{
          borderRight: "1px solid var(--border)",
          backgroundColor: "var(--surface2)",
          position: "relative",
          overflow: "hidden",
          animation: "fadeInScene 0.4s ease",
        }}>
          {/* Corner HUD */}
          <span style={{ position: "absolute", top: 10, left: 12, fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.1em", zIndex: 2 }}>SCENE {String(scene + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span>
          {VIZS[scene]}
        </div>

        {/* Right: text */}
        <div key={`text-${scene}`} style={{
          padding: "32px 28px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          animation: "fadeInScene 0.5s ease",
        }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "#4FA8FF", letterSpacing: "0.14em", marginBottom: 14 }}>{current.label}</p>
          <h3 style={{
            fontFamily: "var(--font-ui)", fontSize: "clamp(16px, 1.8vw, 22px)", fontWeight: 700,
            color: "var(--text)", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 14,
          }}>{current.headline}</h3>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.75 }}>{current.body}</p>
        </div>
      </div>

      {/* Progress bar + chapter nav */}
      <div style={{
        backgroundColor: "var(--surface2)", border: "1px solid var(--border)",
        borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden",
      }}>
        <div style={{ height: 2, backgroundColor: "var(--border)" }}>
          <div style={{ height: "100%", width: `${((scene + progress) / scenes.length) * 100}%`, backgroundColor: "#4FA8FF", transition: "width 0.05s linear" }} />
        </div>
        <div style={{ display: "flex" }}>
          {scenes.map((s, i) => (
            <button key={i} onClick={() => setScene(i)} style={{
              flex: 1, padding: "10px 8px", border: "none",
              borderRight: i < scenes.length - 1 ? "1px solid var(--border)" : "none",
              backgroundColor: i === scene ? "rgba(79,168,255,0.08)" : "transparent",
              cursor: "pointer", textAlign: "center",
              fontFamily: "var(--font-data)", fontSize: 9, letterSpacing: "0.06em",
              color: i === scene ? "#4FA8FF" : "var(--text-dim)",
              transition: "background 0.15s",
            }}>
              {s.label.split(" · ")[0]}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInScene { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes drift0 { from { transform:translate(0,0); } to { transform:translate(5px,-7px); } }
        @keyframes drift1 { from { transform:translate(0,0); } to { transform:translate(-6px,5px); } }
        @keyframes drift2 { from { transform:translate(0,0); } to { transform:translate(7px,4px); } }
        @keyframes drift3 { from { transform:translate(0,0); } to { transform:translate(-4px,-6px); } }
        @keyframes blink  { 0%,100% { opacity:1; } 50% { opacity:0; } }
      `}</style>
    </div>
  )
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
      <div style={{
        backgroundColor: "rgba(245,184,74,0.06)",
        borderBottom: "1px solid rgba(245,184,74,0.2)",
        padding: "8px 32px",
        textAlign: "center",
        fontFamily: "var(--font-data)",
        fontSize: 10,
        color: "#F5B84A",
        letterSpacing: "0.08em",
        position: "relative",
        zIndex: 200,
      }}>
        {lang === "en"
          ? "NON-COMMERCIAL R&D PROTOTYPE · NO REGISTERED COMPANY · NO REVENUE · FREE ACCESS · BUILT FOR RESEARCH AND LEARNING PURPOSES ONLY · ESPOO, FINLAND"
          : "EI-KAUPALLINEN T&K-PROTOTYYPPI · EI REKISTERÖITYÄ YRITYSTÄ · EI TULOJA · ILMAINEN PÄÄSY · RAKENNETTU TUTKIMUS- JA OPPIMISTARKOITUKSIIN · ESPOO, SUOMI"}
      </div>

      {/* Nav */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        backgroundColor: "rgba(7,11,18,0.92)",
        backdropFilter: "blur(12px)",
        padding: "0 32px",
        height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GrypsMark size={28} />
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 15, letterSpacing: "0.12em", color: "var(--text)" }}>GRYPS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>CONNECTIVITY INTELLIGENCE</span>
          {/* Language toggle */}
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
          <a href="#waitlist" style={{
            fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 700,
            color: "#4FA8FF", textDecoration: "none",
            border: "1px solid rgba(79,168,255,0.3)",
            padding: "6px 14px", borderRadius: 5,
          }}>{t.navCta}</a>
        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 8px #2ED47A" }} />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.14em" }}>{t.tag}</span>
            </div>

            <h1 style={{
              fontFamily: "var(--font-ui)",
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              marginBottom: 20,
            }}>
              {t.h1[0]}<br />
              {t.h1[1]}<br />
              <span style={{ color: "#4FA8FF" }}>{t.h1[2]}</span>
            </h1>

            <p style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              {t.sub}
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: 36, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--border)" }}>
              <Stat value="120+" label={t.statsL1} />
              <Stat value="LEO–MEO–GEO" label={t.statsL2} />
              <Stat value="70°N+" label={t.statsL3} />
            </div>

            {/* Waitlist */}
            <div id="waitlist" style={{ scrollMarginTop: 72 }}>
              <p className="label" style={{ marginBottom: 12 }}>{t.waitlistL}</p>
              <WaitlistForm />
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", marginTop: 10 }}>
                {t.waitlistSub}
              </p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)", border: "1px solid var(--border)", borderRadius: 3, padding: "2px 5px", flexShrink: 0, marginTop: 1 }}>AI</span>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6 }}>
                  {lang === "en"
                    ? "The Connectivity Advisor is an automated analytical model. Scores are predictive outputs, not operational guarantees. "
                    : "Connectivity Advisor on automatisoitu analyyttinen malli. Pisteet ovat ennusteita, ei operatiivisia takuita. "}
                  <Link href="/legal/terms#section-04" style={{ color: "var(--text-dim)", textDecoration: "underline" }}>
                    {lang === "en" ? "Art. 50 EU AI Act" : "50 art. EU:n tekoälylaki"}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right — Advisor preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={11} color="var(--text-dim)" />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{t.advisorLabel}</span>
            </div>
            <AdvisorPreview t={t} />
          </div>
        </div>
      </section>

      {/* Telemetry + polar map — side by side */}
      <section style={{ padding: "0 32px 64px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>
          <div>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={11} color="var(--text-dim)" />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{t.telemetryLabel}</span>
            </div>
            <TelemetryStream t={t} />
          </div>
          <div>
            <div style={{ marginBottom: 12, height: 22 }} />
            <PolarMap t={t} />
          </div>
        </div>
      </section>

      {/* Problem strip */}
      <section style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        padding: "48px 32px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p className="label" style={{ textAlign: "center", marginBottom: 32 }}>{t.problemL}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {t.problems.map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[<Globe2 key="g" size={16} color="#4FA8FF" />, <AlertTriangle key="a" size={16} color="#F5B84A" />, <Shield key="s" size={16} color="#6EE7F9" />][i]}
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{item.title}</span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo reel */}
      <section style={{ padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <p className="label" style={{ marginBottom: 8 }}>{t.demoL}</p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>{t.demoSub}</p>
        <DemoReel t={t} />
      </section>

      {/* How it works */}
      <section style={{ padding: "0 32px 64px", maxWidth: 1200, margin: "0 auto" }}>
        <p className="label" style={{ marginBottom: 32 }}>{t.howL}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {t.steps.map((step, i) => {
            const icons = [<MapPin key="mp" size={16} color="#4FA8FF" />, <Radio key="r" size={16} color="#4FA8FF" />, <Zap key="z" size={16} color="#4FA8FF" />, <ChevronRight key="cr" size={16} color="#4FA8FF" />]
            return (
              <div key={step.n} style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "20px",
              }}>
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
      <section style={{
        borderTop: "1px solid var(--border)",
        padding: "64px 32px",
        textAlign: "center",
      }}>
        <GrypsMark size={44} />
        <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "20px 0 10px", letterSpacing: "-0.01em" }}>
          {t.ctaH2}
        </h2>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", margin: "0 auto 32px", maxWidth: 480 }}>
          {t.ctaSub}
        </p>
        <a href="#waitlist" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          backgroundColor: "#4FA8FF", color: "#070B12",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
          padding: "12px 24px", borderRadius: 6, textDecoration: "none",
        }}>
          {t.ctaBtn} <ArrowRight size={14} />
        </a>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GrypsMark size={18} />
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

"use client"
import { useState, useEffect } from "react"
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

function TelemetryStream() {
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
        <span style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.1em" }}>ORBITAL INTELLIGENCE ENGINE · LIVE</span>
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

// ── Polar map wireframe ───────────────────────────────────────────────────────
function PolarMap() {
  const cx = 160, cy = 155, maxR = 130

  const latLines = [90, 80, 70, 60, 50] // degrees N
  const markers = [
    { lat: 68.2, lon: 27.4,  label: "68.2°N",  active: true  },  // Finland forestry
    { lat: 71.0, lon: 25.9,  label: "71.0°N",  active: false },  // Norway Arctic
    { lat: 64.5, lon: -21.9, label: "64.5°N",  active: false },  // Iceland maritime
    { lat: 78.2, lon: 15.6,  label: "78.2°N",  active: false },  // Svalbard
  ]

  function latToR(lat: number) {
    return ((90 - lat) / 50) * maxR
  }

  function toXY(lat: number, lon: number) {
    const r = latToR(lat)
    const angle = (lon * Math.PI) / 180 - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  return (
    <div style={{ position: "relative" }}>
      <div className="label" style={{ marginBottom: 10 }}>Coverage zone — Nordic &amp; Arctic</div>
      <svg width="320" height="200" viewBox="0 0 320 200" style={{ display: "block" }}>
        {/* Latitude rings */}
        {latLines.map(lat => (
          <circle
            key={lat}
            cx={cx} cy={cy}
            r={latToR(lat)}
            fill="none"
            stroke="var(--border)"
            strokeWidth={lat === 70 ? 1.2 : 0.7}
            strokeDasharray={lat === 70 ? "none" : "3 4"}
          />
        ))}

        {/* Meridian lines */}
        {[-90, -45, 0, 45, 90, 135].map(lon => {
          const angle = (lon * Math.PI) / 180 - Math.PI / 2
          return (
            <line
              key={lon}
              x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(angle)}
              y2={cy + maxR * Math.sin(angle)}
              stroke="var(--border)"
              strokeWidth={0.6}
              opacity={0.5}
            />
          )
        })}

        {/* 70°N label */}
        <text x={cx + latToR(70) + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="var(--text-dim)">70°N</text>
        <text x={cx + latToR(60) + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="var(--text-dim)">60°N</text>

        {/* Coverage shading — LEO constellation zone */}
        <circle cx={cx} cy={cy} r={latToR(50)} fill="rgba(79,168,255,0.04)" />
        <circle cx={cx} cy={cy} r={latToR(70)} fill="rgba(110,231,249,0.05)" />

        {/* Location markers */}
        {markers.map((m, i) => {
          const pos = toXY(m.lat, m.lon)
          return (
            <g key={i}>
              {m.active && (
                <circle cx={pos.x} cy={pos.y} r={8} fill="rgba(79,168,255,0.12)" />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={m.active ? 3 : 2}
                fill={m.active ? "#4FA8FF" : "var(--text-dim)"}
              />
              {m.active && (
                <text
                  x={pos.x + 6} y={pos.y - 4}
                  style={{ fontFamily: "var(--font-data)", fontSize: 8 }}
                  fill="#4FA8FF"
                >{m.label}</text>
              )}
            </g>
          )
        })}

        {/* North pole */}
        <circle cx={cx} cy={cy} r={2} fill="var(--text-dim)" />
        <text x={cx + 4} y={cy - 3} style={{ fontFamily: "var(--font-data)", fontSize: 8 }} fill="var(--text-dim)">N</text>
      </svg>
    </div>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function PricingTiers() {
  const tiers = [
    {
      name: "Report",
      price: "€550",
      unit: "per analysis",
      color: "var(--text)",
      accent: "var(--border2)",
      description: "Single-location suitability report for procurement teams.",
      features: [
        "One coordinate analysis",
        "Top 3 provider ranking",
        "Deployment Confidence scores",
        "Plain-language rationale",
        "Executive PDF — board-ready",
      ],
      cta: "Join waitlist",
      highlight: false,
    },
    {
      name: "Platform",
      price: "€990",
      unit: "per month",
      color: "#4FA8FF",
      accent: "rgba(79,168,255,0.2)",
      description: "Unlimited analyses for operations teams managing multiple sites.",
      features: [
        "Unlimited location analyses",
        "All verticals and orbital types",
        "Priority scoring configuration",
        "Historical comparison",
        "Team access · CSV export",
      ],
      cta: "Join waitlist",
      highlight: true,
    },
    {
      name: "API",
      price: "Custom",
      unit: "from €2,500 / month",
      color: "#6EE7F9",
      accent: "rgba(110,231,249,0.15)",
      description: "Direct API access for systems integrators and fleet platforms.",
      features: [
        "REST API — full scoring engine",
        "Webhook provider alerts",
        "Custom vertical weights",
        "SLA-backed uptime",
        "Dedicated integration support",
      ],
      cta: "Contact us",
      highlight: false,
    },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {tiers.map((t) => (
        <div key={t.name} style={{
          backgroundColor: "var(--surface)",
          border: `1px solid ${t.highlight ? t.accent : "var(--border)"}`,
          borderRadius: 10,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "relative",
        }}>
          {t.highlight && (
            <div style={{
              position: "absolute", top: -1, left: 24, right: 24,
              height: 2, backgroundColor: "#4FA8FF", borderRadius: "0 0 2px 2px",
            }} />
          )}
          <div>
            <p className="label" style={{ marginBottom: 8 }}>{t.name}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 700, color: t.color, letterSpacing: "-0.02em" }}>{t.price}</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}>{t.unit}</span>
            </div>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>{t.description}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {t.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: t.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)" }}>{f}</span>
              </div>
            ))}
          </div>
          <a href="#waitlist" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            backgroundColor: t.highlight ? "#4FA8FF" : "var(--surface2)",
            color: t.highlight ? "#070B12" : "var(--text-muted)",
            border: `1px solid ${t.highlight ? "#4FA8FF" : "var(--border2)"}`,
            borderRadius: 6, padding: "10px", textDecoration: "none",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12,
          }}>
            {t.cta} <ArrowRight size={12} />
          </a>
        </div>
      ))}
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
function PdfToggle() {
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
        Download sample report
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
          backgroundColor: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "16px", width: 260,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)", marginBottom: 6 }}>PDF report — early access</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
            Full PDF reports are generated per analysis and delivered to early access members. Join the waitlist to receive yours.
          </p>
          <a href="#waitlist" onClick={() => setOpen(false)} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            backgroundColor: "#4FA8FF", color: "#070B12",
            borderRadius: 5, padding: "8px 14px", textDecoration: "none",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11,
          }}>
            Request early access <ArrowRight size={11} />
          </a>
        </div>
      )}
    </div>
  )
}

// ── Sample advisor output ─────────────────────────────────────────────────────
function AdvisorPreview() {
  const providers = [
    {
      rank: 1,
      name: "Starlink",
      type: "LEO Constellation",
      confidence: 94,
      latency: "25–45ms",
      uptime: "99.3%",
      status: "Recommended",
      statusColor: "#2ED47A",
      rationale: "Excellent overhead coverage at 68°N. High pass frequency minimises link interruption during harvester movement. Dual-dish configuration advised for canopy environments.",
    },
    {
      rank: 2,
      name: "OneWeb",
      type: "LEO Constellation",
      confidence: 81,
      latency: "35–70ms",
      uptime: "98.7%",
      status: "Strong alternative",
      statusColor: "#4FA8FF",
      rationale: "Comparable polar coverage with strong EU regulatory alignment. Slightly higher latency but more predictable SLA terms for enterprise procurement.",
    },
    {
      rank: 3,
      name: "Iridium Certus",
      type: "LEO — Polar orbit",
      confidence: 67,
      latency: "150–300ms",
      uptime: "99.9%",
      status: "Redundancy only",
      statusColor: "#F5B84A",
      rationale: "Unmatched uptime at extreme latitudes. Latency too high for telemetry but ideal as a failover for safety communications and IoT check-ins.",
    },
  ]

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
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 6px #2ED47A" }} />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em" }}>ADVISOR · MISSION ANALYSIS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>68.2°N · 27.4°E — FORESTRY — UPTIME</span>
          <PdfToggle />
        </div>
      </div>

      {/* Providers */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {providers.map((p) => (
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
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, color: p.statusColor }}>{p.status}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 20, fontWeight: 700, color: p.rank === 1 ? "#4FA8FF" : "var(--text)", lineHeight: 1 }}>{p.confidence}<span style={{ fontSize: 11, color: "var(--text-muted)" }}>%</span></div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginTop: 2 }}>DEPLOY CONFIDENCE</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
              <div>
                <div className="label" style={{ marginBottom: 2 }}>Latency</div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)" }}>{p.latency}</div>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 2 }}>Uptime</div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)" }}>{p.uptime}</div>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 8 }}>{p.rationale}</p>
          </div>
        ))}
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
    tag:        "EARLY ACCESS · NORDIC & ARCTIC OPERATIONS",
    h1:         ["Know which satellite", "provider to choose", "before it matters."],
    sub:        "GRYPS is a connectivity intelligence platform for industrial operators in maritime, forestry, Arctic, and mining environments. Enter your coordinates and operational requirements — get a ranked, data-backed recommendation with a Deployment Confidence score.",
    statsL1:    "Providers indexed",
    statsL2:    "All orbital types",
    statsL3:    "Polar coverage",
    waitlistL:  "Request early access",
    waitlistSub:"Direct founder access. No sales calls. No automated sequences.",
    navCta:     "Early access",
    ctaH2:      "Built for operators, not marketers.",
    ctaSub:     "Nordic and Arctic launch. Early access users get direct access to the founder and shape the scoring models.",
    ctaBtn:     "Request early access",
    pricingL:   "Precision pricing for industrial procurement.",
  },
  fi: {
    tag:        "VARHAINEN PÄÄSY · POHJOISMAAT JA ARKTINEN",
    h1:         ["Tiedä mikä satelliitti-", "toimittaja valita", "ennen kuin se ratkaisee."],
    sub:        "GRYPS on yhteysintelligenssiplatformi teollisuusoperaattoreille merenkululle, metsätaloudelle, arktisille alueille ja kaivostoiminnalle. Syötä koordinaatit ja operatiiviset vaatimuksesi — saat rankatun, dataan perustuvan suosituksen Deployment Confidence -pisteytyksen kera.",
    statsL1:    "Palveluntarjoajaa indeksoitu",
    statsL2:    "Kaikki orbitaalityypit",
    statsL3:    "Napapiirin kattavuus",
    waitlistL:  "Pyydä varhaista pääsyä",
    waitlistSub:"Suora yhteys perustajaan. Ei myyntipuheluita. Ei automaattisia sekvenssejä.",
    navCta:     "Varhainen pääsy",
    ctaH2:      "Rakennettu operaattoreille, ei markkinoijille.",
    ctaSub:     "Pohjoismainen ja arktinen julkaisu. Varhaiset käyttäjät saavat suoran yhteyden perustajaan ja muovaavat pisteytysmallit.",
    ctaBtn:     "Pyydä varhaista pääsyä",
    pricingL:   "Selkeä hinnoittelu teollisuushankintaan.",
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
            <div id="waitlist">
              <p className="label" style={{ marginBottom: 12 }}>{t.waitlistL}</p>
              <WaitlistForm />
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", marginTop: 10 }}>
                {t.waitlistSub}
              </p>
            </div>
          </div>

          {/* Right — Advisor preview + polar map */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={11} color="var(--text-dim)" />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>SAMPLE OUTPUT — ILLUSTRATIVE DATA</span>
            </div>
            <AdvisorPreview />
            <PolarMap />
          </div>
        </div>
      </section>

      {/* Telemetry stream */}
      <section style={{ padding: "0 32px 64px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={11} color="var(--text-dim)" />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>ILLUSTRATIVE ENGINE OUTPUT — NOT LIVE DATA</span>
        </div>
        <TelemetryStream />
      </section>

      {/* Problem strip */}
      <section style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        padding: "48px 32px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p className="label" style={{ textAlign: "center", marginBottom: 32 }}>The problem GRYPS solves</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              {
                icon: <Globe2 size={16} color="#4FA8FF" />,
                title: "The market is fragmented",
                body: "Starlink, OneWeb, Iridium, Inmarsat, Viasat, and dozens of regional providers—each with different orbital types, coverage claims, and pricing. Procurement teams are navigating this alone."
              },
              {
                icon: <AlertTriangle size={16} color="#F5B84A" />,
                title: "The stakes are operational",
                body: "A lost IoT signal from a harvester at −30°C. A dropped safety check-in from an offshore platform. Connectivity failures in these environments are not inconveniences—they are safety events."
              },
              {
                icon: <Shield size={16} color="#6EE7F9" />,
                title: "No neutral intelligence exists",
                body: "Provider sales reps are conflicted. Consultants are generalists. Peer recommendations are anecdotal. There is no tool that answers: for my location, my use case—which provider gives me the best chance of staying connected?"
              },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.icon}
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{item.title}</span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <p className="label" style={{ marginBottom: 40 }}>How the Advisor works</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { n: "01", icon: <MapPin size={16} color="#4FA8FF" />, title: "Enter location", body: "Coordinates or named region. Elevation and terrain are factored automatically." },
            { n: "02", icon: <Radio size={16} color="#4FA8FF" />, title: "Select vertical", body: "Forestry, maritime, mining, or Arctic. Scoring weights adjust per sector." },
            { n: "03", icon: <Zap size={16} color="#4FA8FF" />, title: "Set priorities", body: "Uptime, latency, bandwidth, or redundancy. Your operational requirements drive the ranking." },
            { n: "04", icon: <ChevronRight size={16} color="#4FA8FF" />, title: "Get your score", body: "Three ranked providers with Deployment Confidence scores and plain-language rationale." },
          ].map((step) => (
            <div key={step.n} style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                {step.icon}
                <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>{step.n}</span>
              </div>
              <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 8 }}>{step.title}</p>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <p className="label" style={{ marginBottom: 8 }}>Pricing</p>
        <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 32, letterSpacing: "-0.01em" }}>
          {t.pricingL}
        </h2>
        <PricingTiers />
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
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
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
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>© 2026 GRYPS — All rights reserved</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>Designed &amp; engineered in Finland for high-latitude resilience.</span>
      </footer>
    </div>
  )
}

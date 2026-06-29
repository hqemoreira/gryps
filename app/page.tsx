"use client"
import { useState } from "react"
import { ArrowRight, MapPin, Radio, Shield, Zap, ChevronRight, Globe2, AlertTriangle } from "lucide-react"

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
    await new Promise(r => setTimeout(r, 800))
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

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: "var(--font-data)", fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>{label}</span>
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
      latency: "25–45 ms",
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
      latency: "35–70 ms",
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
      latency: "150–300 ms",
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
        <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>68.2°N 27.4°E · FORESTRY · UPTIME</span>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
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
          <a href="#waitlist" style={{
            fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 700,
            color: "#4FA8FF", textDecoration: "none",
            border: "1px solid rgba(79,168,255,0.3)",
            padding: "6px 14px", borderRadius: 5,
          }}>Early access</a>
        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", boxShadow: "0 0 8px #2ED47A" }} />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.14em" }}>EARLY ACCESS · NORDIC &amp; ARCTIC OPERATIONS</span>
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
              Know which satellite<br />
              provider to choose<br />
              <span style={{ color: "#4FA8FF" }}>before it matters.</span>
            </h1>

            <p style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              GRYPS is a connectivity intelligence platform for industrial operators in maritime, forestry, Arctic, and mining environments. Enter your coordinates and operational requirements — get a ranked, data-backed recommendation with a Deployment Confidence score.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: 36, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--border)" }}>
              <Stat value="120+" label="Providers indexed" />
              <Stat value="LEO · MEO · GEO" label="All orbital types" />
              <Stat value="70°N+" label="Polar coverage" />
            </div>

            {/* Waitlist */}
            <div id="waitlist">
              <p className="label" style={{ marginBottom: 12 }}>Request early access</p>
              <WaitlistForm />
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", marginTop: 10 }}>
                Direct founder access. No sales calls. No automated sequences.
              </p>
            </div>
          </div>

          {/* Right — Advisor preview */}
          <div>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={11} color="var(--text-dim)" />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>SAMPLE OUTPUT — ILLUSTRATIVE DATA</span>
            </div>
            <AdvisorPreview />
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
          <p className="label" style={{ textAlign: "center", marginBottom: 32 }}>The problem GRYPS solves</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              {
                icon: <Globe2 size={16} color="#4FA8FF" />,
                title: "The market is fragmented",
                body: "Starlink, OneWeb, Iridium, Inmarsat, Viasat, and dozens of regional providers — each with different orbital types, coverage claims, and pricing. Procurement teams are navigating this alone."
              },
              {
                icon: <AlertTriangle size={16} color="#F5B84A" />,
                title: "The stakes are operational",
                body: "A lost IoT signal from a harvester at -30°C. A dropped safety check-in from an offshore platform. Connectivity failures in these environments are not inconveniences — they are safety events."
              },
              {
                icon: <Shield size={16} color="#6EE7F9" />,
                title: "No neutral intelligence exists",
                body: "Provider sales reps are conflicted. Consultants are generalists. Peer recommendations are anecdotal. There is no tool that answers: for my location, my use case — which provider gives me the best chance of staying connected?"
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

      {/* CTA */}
      <section style={{
        borderTop: "1px solid var(--border)",
        padding: "64px 32px",
        textAlign: "center",
      }}>
        <GrypsMark size={44} />
        <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "20px 0 10px", letterSpacing: "-0.01em" }}>
          Built for operators, not marketers.
        </h2>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
          Nordic and Arctic launch. Early access users get direct access to the founder and shape the scoring models.
        </p>
        <a href="#waitlist" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          backgroundColor: "#4FA8FF", color: "#070B12",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
          padding: "12px 24px", borderRadius: 6, textDecoration: "none",
        }}>
          Request early access <ArrowRight size={14} />
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
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>© 2026 GRYPS — Connectivity Intelligence</span>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>Espoo, Finland</span>
      </footer>
    </div>
  )
}

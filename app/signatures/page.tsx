"use client"
import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, Map as MapIcon, List as ListIcon } from "lucide-react"
import { gradeColor } from "@/components/ResilienceOutput"

const SignaturesMap = dynamic(() => import("@/components/SignaturesMap").then(m => m.SignaturesMap), {
  ssr: false,
  loading: () => (
    <div style={{ height: 480, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>LOADING MAP…</p>
    </div>
  ),
})

type SiteSummary = {
  slug: string; name: string; lat: number; lng: number
  sector: string; autonomy_level: string; operation_criticality: string
  score: number; grade: string; summary: string
}

export default function SignaturesPage() {
  const [sites, setSites] = useState<SiteSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"map" | "list">("map")
  const [sector, setSector] = useState("")
  const [autonomy, setAutonomy] = useState("")
  const [criticality, setCriticality] = useState("")

  useEffect(() => {
    fetch("/api/signatures")
      .then(r => r.json())
      .then(d => setSites(d.sites ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => sites.filter(s =>
    (!sector || s.sector === sector) &&
    (!autonomy || s.autonomy_level === autonomy) &&
    (!criticality || s.operation_criticality === criticality)
  ), [sites, sector, autonomy, criticality])

  const selectStyle: React.CSSProperties = {
    backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
    borderRadius: 6, padding: "8px 12px", fontFamily: "var(--font-data)",
    fontSize: 11, color: "var(--text)", outline: "none", cursor: "pointer",
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", paddingTop: 90 }}>
      {/* Nav */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        backgroundColor: "rgba(7,11,18,0.92)", backdropFilter: "blur(12px)",
        padding: "0 32px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
            <path d="M4 18 A14 14 0 0 1 32 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
            <path d="M8 18 A10 10 0 0 1 28 18" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75"/>
            <path d="M12 18 A6 6 0 0 1 24 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <line x1="18" y1="20" x2="18" y2="10" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M15 13 L18 9 L21 13" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="18" cy="21" r="1.5" fill="#4FA8FF"/>
          </svg>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", color: "var(--text)" }}>GRYPS</span>
        </Link>
        <a href="/#advisor" style={{
          fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 700,
          color: "#4FA8FF", textDecoration: "none",
          border: "1px solid rgba(79,168,255,0.3)", padding: "6px 14px", borderRadius: 5,
        }}>Score your site</a>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px 80px" }}>
        {/* Title + disclosure */}
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>RESILIENCE SIGNATURES</p>
        <h1 style={{ fontFamily: "var(--font-ui)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
          Scored connectivity resilience across the Nordic and Arctic
        </h1>
        <div style={{
          backgroundColor: "rgba(245,184,74,0.06)", border: "1px solid rgba(245,184,74,0.2)",
          borderRadius: 6, padding: "10px 14px", marginBottom: 28, maxWidth: 640,
        }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#F5B84A", lineHeight: 1.6 }}>
            Illustrative, synthesized sites for demonstration — real coordinates, generated site profiles, and real Resilience Signature scores from the same scoring model as the live Advisor. R&D prototype.
          </p>
        </div>

        {/* Filters + view toggle */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 20 }}>
          <select value={sector} onChange={e => setSector(e.target.value)} style={selectStyle}>
            <option value="">All sectors</option>
            <option value="forestry">Forestry</option>
            <option value="mining">Mining</option>
            <option value="maritime">Maritime</option>
            <option value="arctic">Arctic</option>
          </select>
          <select value={autonomy} onChange={e => setAutonomy(e.target.value)} style={selectStyle}>
            <option value="">All autonomy levels</option>
            <option value="manual">Manual</option>
            <option value="remote-operated">Remote-operated</option>
            <option value="autonomous">Autonomous</option>
            <option value="mixed">Mixed</option>
          </select>
          <select value={criticality} onChange={e => setCriticality(e.target.value)} style={selectStyle}>
            <option value="">All criticality</option>
            <option value="standard">Standard</option>
            <option value="high">High</option>
            <option value="safety-critical">Safety-critical</option>
          </select>

          <div style={{ display: "flex", border: "1px solid var(--border2)", borderRadius: 6, overflow: "hidden", marginLeft: "auto" }}>
            <button onClick={() => setView("map")} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "none", cursor: "pointer",
              background: view === "map" ? "var(--border2)" : "transparent",
              color: view === "map" ? "var(--text)" : "var(--text-muted)",
              fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
            }}><MapIcon size={13} /> Map</button>
            <button onClick={() => setView("list")} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "none", cursor: "pointer",
              background: view === "list" ? "var(--border2)" : "transparent",
              color: view === "list" ? "var(--text)" : "var(--text-muted)",
              fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
            }}><ListIcon size={13} /> List</button>
          </div>
        </div>

        {loading ? (
          <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>LOADING SIGNATURES…</p>
        ) : view === "map" ? (
          <SignaturesMap sites={filtered} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(site => {
              const gc = gradeColor(site.grade)
              return (
                <Link key={site.slug} href={`/signatures/${site.slug}`} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "14px 18px", textDecoration: "none",
                }}>
                  <div style={{
                    fontFamily: "var(--font-data)", fontSize: 24, fontWeight: 900, color: gc,
                    width: 48, textAlign: "center", flexShrink: 0,
                  }}>{site.grade}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 3 }}>{site.name}</p>
                    <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.05em" }}>
                      {site.sector.toUpperCase()} · {site.autonomy_level.toUpperCase()} · {site.operation_criticality.toUpperCase()}
                    </p>
                  </div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 20, fontWeight: 700, color: gc, flexShrink: 0 }}>
                    {site.score}<span style={{ fontSize: 11, color: "var(--text-muted)" }}>%</span>
                  </div>
                </Link>
              )
            })}
            {filtered.length === 0 && (
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)" }}>No sites match these filters.</p>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 48, paddingTop: 40, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
            Score your own site
          </h2>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>
            Get a free, real-time Resilience Signature for your own coordinates — the same model that scored every site above.
          </p>
          <a href="/#advisor" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: "#4FA8FF", color: "#070B12",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
            padding: "12px 24px", borderRadius: 6, textDecoration: "none",
          }}>
            Run the free Advisor <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

"use client"
import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, Map as MapIcon, List as ListIcon } from "lucide-react"
import { gradeTextColor } from "@/lib/resilience-colors"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { useTheme } from "@/context/ThemeContext"
import { useLang } from "@/lib/use-lang"

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

const COPY = {
  en: {
    tagline:      "RESILIENCE SIGNATURES",
    title:        "Scored connectivity resilience across the Nordic, Arctic, and Iceland",
    disclosure:   "Illustrative, synthesized sites for demonstration — real coordinates, generated site profiles, and real Resilience Signature scores from the same scoring model as the Advisor. Research prototype · Non-commercial · Model-based analysis.",
    allSectors:   "All sectors", allAutonomy: "All autonomy levels", allCriticality: "All criticality",
    map: "Map", list: "List",
    loading: "LOADING SIGNATURES…", noMatch: "No sites match these filters.",
    ctaHeading: "Generate your Resilience Signature",
    ctaSub: "Free · No account required. Same deterministic model as the portfolio sites above.",
    ctaBtn: "Generate Resilience Signature",
    navCta: "Generate Resilience Signature",
  },
  fi: {
    tagline:      "RESILIENCE SIGNATURET",
    title:        "Pisteytetty yhteyden resilienssi Pohjoismaissa, arktisella alueella ja Islannissa",
    disclosure:   "Havainnollistavia, synteettisiä kohteita esittelyyn — todelliset koordinaatit, luodut kohdeprofiilit ja todelliset Resilience Signature -pisteet samasta pisteytysmallista kuin Advisorilla. Tutkimusprototyyppi · Ei-kaupallinen · Mallipohjainen analyysi.",
    allSectors:   "Kaikki toimialat", allAutonomy: "Kaikki autonomiatasot", allCriticality: "Kaikki kriittisyystasot",
    map: "Kartta", list: "Lista",
    loading: "LADATAAN SIGNATUREJA…", noMatch: "Yksikään kohde ei vastaa suodattimia.",
    ctaHeading: "Luo Resilience Signature",
    ctaSub: "Ilmainen · Ei tiliä tarvita. Sama deterministinen malli kuin yllä olevissa portfoliokohteissa.",
    ctaBtn: "Luo Resilience Signature",
    navCta: "Luo Resilience Signature",
  },
}

export default function SignaturesPage() {
  const [lang, setLang] = useLang()
  const { dark } = useTheme()
  const t = COPY[lang]

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
    borderRadius: 6, padding: "8px 12px", minHeight: 44, fontFamily: "var(--font-data)",
    fontSize: 11, color: "var(--text)", outline: "none", cursor: "pointer",
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref="/#advisor"
        ctaLabel={t.navCta}
        extraLinks={[
          { href: "/about", label: lang === "en" ? "About" : "Tietoa" },
          { href: "/map", label: lang === "en" ? "Explore Connectivity Intelligence" : "Tutki Connectivity Intelligencea" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
        ]}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px 80px", paddingTop: 90 }}>
        {/* Title + disclosure */}
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>{t.tagline}</p>
        <h1 style={{ fontFamily: "var(--font-ui)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
          {t.title}
        </h1>
        <div style={{
          backgroundColor: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)",
          borderRadius: 6, padding: "10px 14px", marginBottom: 28, maxWidth: 640,
        }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-amber)", lineHeight: 1.6 }}>
            {t.disclosure}
          </p>
        </div>

        {/* Filters + view toggle */}
        <div className="gryps-filters-row" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 20 }}>
          <select className="gryps-filter-select" value={sector} onChange={e => setSector(e.target.value)} style={selectStyle}>
            <option value="">{t.allSectors}</option>
            <option value="forestry">Forestry</option>
            <option value="mining">Mining</option>
            <option value="maritime">Maritime</option>
            <option value="arctic">Arctic</option>
          </select>
          <select className="gryps-filter-select" value={autonomy} onChange={e => setAutonomy(e.target.value)} style={selectStyle}>
            <option value="">{t.allAutonomy}</option>
            <option value="manual">Manual</option>
            <option value="remote-operated">Remote-operated</option>
            <option value="autonomous">Autonomous</option>
            <option value="mixed">Mixed</option>
          </select>
          <select className="gryps-filter-select" value={criticality} onChange={e => setCriticality(e.target.value)} style={selectStyle}>
            <option value="">{t.allCriticality}</option>
            <option value="standard">Standard</option>
            <option value="high">High</option>
            <option value="safety-critical">Safety-critical</option>
          </select>

          <div className="gryps-view-toggle" style={{ display: "flex", border: "1px solid var(--border2)", borderRadius: 6, overflow: "hidden", marginLeft: "auto" }}>
            <button onClick={() => setView("map")} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", minHeight: 44, border: "none", cursor: "pointer",
              background: view === "map" ? "var(--border2)" : "transparent",
              color: view === "map" ? "var(--text)" : "var(--text-muted)",
              fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
            }}><MapIcon size={13} /> {t.map}</button>
            <button onClick={() => setView("list")} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", minHeight: 44, border: "none", cursor: "pointer",
              background: view === "list" ? "var(--border2)" : "transparent",
              color: view === "list" ? "var(--text)" : "var(--text-muted)",
              fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
            }}><ListIcon size={13} /> {t.list}</button>
          </div>
        </div>

        {loading ? (
          <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>{t.loading}</p>
        ) : view === "map" ? (
          <SignaturesMap sites={filtered} dark={dark} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(site => {
              const gc = gradeTextColor(site.grade)
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
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)" }}>{t.noMatch}</p>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 48, paddingTop: 40, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
            {t.ctaHeading}
          </h2>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>
            {t.ctaSub}
          </p>
          <Link href="/#advisor" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: "#4FA8FF", color: "#070B12",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
            padding: "12px 24px", borderRadius: 6, textDecoration: "none",
          }}>
            {t.ctaBtn} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en" ? "Espoo, Finland · Non-commercial R&D prototype" : "Espoo, Suomi · Ei-kaupallinen T&K-prototyyppi")}
        secondaryLink={{ href: "/", label: lang === "en" ? "Back to GRYPS" : "Takaisin GRYPS:iin" }}
      />
    </div>
  )
}

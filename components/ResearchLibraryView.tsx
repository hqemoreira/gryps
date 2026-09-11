"use client"
import { useMemo, useState, type CSSProperties } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PrototypeDisclaimerBanner, ResearchDocsNav } from "@/components/ResearchDocsNav"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { useLang } from "@/lib/use-lang"
import {
  RESEARCH_LIBRARY,
  RESEARCH_REGIONS,
  RESEARCH_VERTICALS,
  type ResearchRegion,
  type ResearchVertical,
} from "@/lib/research-library"
import { gradeColor, gradeTextColor } from "@/lib/resilience-colors"

type CardMeta = {
  slug: string
  grade: string
  score: number
}

const COPY = {
  en: {
    eyebrow: "GRYPS · RESEARCH LIBRARY",
    title: "Research Library",
    lead:
      "Explore modeled satellite connectivity resilience across remote and autonomous operating environments. Curated research assessments — not customer cases or procurement reports.",
    disclosure:
      "Research prototype · Non-commercial · Model-based analysis. Each assessment uses deterministic Model v0.3. Illustrative operating scenarios with real coordinates — not live RF monitoring.",
    vertical: "Vertical",
    region: "Region",
    empty: "No assessments match these filters.",
    view: "View assessment →",
    model: "Model v0.3",
    ctaHeading: "Generate Resilience Signature",
    ctaSub: "Free · No account required. Same scoring model as the research assessments above.",
    ctaBtn: "Generate Resilience Signature",
    navCta: "Generate Resilience Signature",
    count: (n: number) => `${n} research assessments`,
  },
  fi: {
    eyebrow: "GRYPS · RESEARCH LIBRARY",
    title: "Research Library",
    lead:
      "Tutki mallinnettua satelliittiyhteyden resilienssiä etäisissä ja autonomisissa toimintaympäristöissä. Kuratoituja tutkimusarvioita — ei asiakastarinoita eikä hankintaraportteja.",
    disclosure:
      "Tutkimusprototyyppi · Ei-kaupallinen · Mallipohjainen analyysi. Jokainen arvio käyttää determinististä mallia v0.3. Havainnollistavia skenaarioita todellisilla koordinaateilla — ei reaaliaikaista RF-seurantaa.",
    vertical: "Toimiala",
    region: "Alue",
    empty: "Yksikään arvio ei vastaa suodattimia.",
    view: "Katso arvio →",
    model: "Malli v0.3",
    ctaHeading: "Luo Resilience Signature",
    ctaSub: "Ilmainen · Ei tiliä tarvita. Sama pisteytysmalli kuin yllä olevissa tutkimusarvioissa.",
    ctaBtn: "Luo Resilience Signature",
    navCta: "Luo Resilience Signature",
    count: (n: number) => `${n} tutkimusarviota`,
  },
}

export function ResearchLibraryView({ cards }: { cards: CardMeta[] }) {
  const [lang, setLang] = useLang()
  const t = COPY[lang]
  const [vertical, setVertical] = useState<ResearchVertical | "all">("all")
  const [region, setRegion] = useState<ResearchRegion | "all">("all")

  const gradeBySlug = useMemo(() => {
    const m = new Map<string, CardMeta>()
    for (const c of cards) m.set(c.slug, c)
    return m
  }, [cards])

  const filtered = useMemo(() => {
    return RESEARCH_LIBRARY.filter(e => {
      if (vertical !== "all" && e.vertical !== vertical) return false
      if (region !== "all" && e.region !== region) return false
      return true
    })
  }, [vertical, region])

  const chip = (active: boolean): CSSProperties => ({
    fontFamily: "var(--font-ui)",
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? "var(--text)" : "var(--text-muted)",
    backgroundColor: active ? "var(--surface2)" : "transparent",
    border: `1px solid ${active ? "var(--border2)" : "var(--border)"}`,
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer",
  })

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref="/#advisor"
        useIaNav
      />

      <main className="gryps-page-under-nav" style={{ maxWidth: 960, margin: "0 auto", paddingLeft: 24, paddingRight: 24, paddingBottom: 80 }}>
        <Breadcrumbs lang={lang} items={[
          { en: "Explore", fi: "Tutki" },
          { en: "Research Library", fi: "Research Library" },
        ]} />
        <ResearchDocsNav lang={lang} active="research" />
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>
          {t.eyebrow}
        </p>
        <h1 style={{
          fontFamily: "var(--font-ui)", fontSize: 36, fontWeight: 700, color: "var(--text)",
          letterSpacing: "-0.02em", margin: "12px 0 16px",
        }}>
          {t.title}
        </h1>
        <p style={{
          fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)",
          lineHeight: 1.7, maxWidth: 640, marginBottom: 16,
        }}>
          {t.lead}
        </p>
        <PrototypeDisclaimerBanner lang={lang} />
        <p style={{
          fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-dim)",
          lineHeight: 1.6, maxWidth: 640, marginBottom: 28,
        }}>
          {t.disclosure}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          <div>
            <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 8 }}>
              {t.vertical}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {RESEARCH_VERTICALS.map(v => (
                <button
                  key={v.id}
                  type="button"
                  style={chip(vertical === v.id)}
                  onClick={() => setVertical(v.id)}
                >
                  {lang === "fi" ? v.fi : v.en}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 8 }}>
              {t.region}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {RESEARCH_REGIONS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  style={chip(region === r.id)}
                  onClick={() => setRegion(r.id)}
                >
                  {lang === "fi" ? r.fi : r.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", marginBottom: 16 }}>
          {t.count(filtered.length)}
        </p>

        {filtered.length === 0 ? (
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)" }}>{t.empty}</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map(entry => {
              const meta = gradeBySlug.get(entry.slug)
              const grade = meta?.grade ?? "—"
              const score = meta?.score
              const gc = gradeColor(grade)
              const gtc = gradeTextColor(grade)
              return (
                <Link
                  key={entry.slug}
                  href={`/research/${entry.slug}`}
                  style={{
                    display: "flex", flexDirection: "column", gap: 10,
                    backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "20px 18px", textDecoration: "none",
                    minHeight: 180,
                  }}
                >
                  <p style={{
                    fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 700,
                    color: "var(--text)", lineHeight: 1.35, margin: 0,
                  }}>
                    {lang === "fi" ? entry.titleFi : entry.title}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)",
                    lineHeight: 1.5, margin: 0, flex: 1,
                  }}>
                    {lang === "fi" ? entry.subtitleFi : entry.subtitle}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: "var(--font-data)", fontSize: 12, fontWeight: 800, color: gtc,
                      border: `1px solid ${gc}44`, borderRadius: 4, padding: "2px 8px",
                    }}>
                      {score != null ? `${grade} · ${score}` : grade}
                    </span>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>
                      {t.model}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
                    color: "var(--accent-blue)", marginTop: 4,
                  }}>
                    {t.view}
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        <div style={{
          marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--border)", textAlign: "center",
        }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
            {t.ctaHeading}
          </h2>
          <p style={{
            fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)",
            maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.6,
          }}>
            {t.ctaSub}
          </p>
          <Link href="/#advisor" className="gryps-cta-btn" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            textDecoration: "none",
          }}>
            {t.ctaBtn} <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en"
          ? "Non-commercial R&D prototype"
          : "Ei-kaupallinen T&K-prototyyppi")}
        secondaryLink={{ href: "/map", label: lang === "en" ? "Explore" : "Tutki" }}
      />
    </div>
  )
}

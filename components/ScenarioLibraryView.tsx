"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { useLang } from "@/lib/use-lang"
import { MISSION_SCENARIOS } from "@/lib/mission-scenarios"

const COPY = {
  en: {
    eyebrow: "GRYPS · SCENARIO & MISSION RESEARCH",
    title: "Mission scenarios",
    lead:
      "Beyond “which provider is best?” — research scenarios that ask what connectivity architecture might suit a mission. Environment → requirements → challenges → technology → provider considerations.",
    disclosure:
      "Research scenarios only · Non-commercial · No CRM, quotations, or sales funnel. Illustrative decision-support concepts — not customer projects or procurement advice.",
    view: "Open scenario →",
    count: (n: number) => `${n} research scenarios`,
    ctaHeading: "Generate Resilience Signature",
    ctaSub: "Score a concrete Nordic / Arctic / Icelandic site with the same Model v0.3 used in these scenarios.",
    ctaBtn: "Generate Resilience Signature",
    navCta: "Generate Resilience Signature",
    chain: "Environment · Requirements · Challenges · Technology · Providers",
  },
  fi: {
    eyebrow: "GRYPS · SKENAARIO- JA TEHTÄVÄTUTKIMUS",
    title: "Tehtäväskenaariot",
    lead:
      "Pidemmälle kuin “mikä toimittaja on paras?” — tutkimusskenaariot, jotka kysyvät millainen yhteysarkkitehtuuri voisi sopia tehtävään. Ympäristö → vaatimukset → haasteet → teknologia → toimittajanäkökohdat.",
    disclosure:
      "Vain tutkimusskenaarioita · Ei-kaupallinen · Ei CRM:ää, tarjouksia eikä myyntisuppiloa. Havainnollistavia päätöstukikonsepteja — ei asiakasprojekteja eikä hankintaneuvontaa.",
    view: "Avaa skenaario →",
    count: (n: number) => `${n} tutkimusskenaariota`,
    ctaHeading: "Luo Resilience Signature",
    ctaSub: "Pisteytä konkreettinen pohjoismainen / arktinen / islantilainen kohde samalla mallilla v0.3 kuin näissä skenaarioissa.",
    ctaBtn: "Luo Resilience Signature",
    navCta: "Luo Resilience Signature",
    chain: "Ympäristö · Vaatimukset · Haasteet · Teknologia · Toimittajat",
  },
} as const

export function ScenarioLibraryView() {
  const [lang, setLang] = useLang()
  const t = COPY[lang]

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref="/#advisor"
        ctaLabel={t.navCta}
        extraLinks={[
          { href: "/research", label: "Research Library" },
          { href: "/workspace", label: "Workspace" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
          { href: "/knowledge", label: lang === "en" ? "Knowledge" : "Tieto" },
        ]}
      />

      <main className="gryps-page-under-nav" style={{ maxWidth: 960, margin: "0 auto", paddingLeft: 24, paddingRight: 24, paddingBottom: 80 }}>
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
        <p style={{
          fontFamily: "var(--font-data)", fontSize: 11, color: "var(--accent-amber)",
          lineHeight: 1.55, marginBottom: 12, maxWidth: 640,
        }}>
          {t.disclosure}
        </p>
        <p style={{
          fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)",
          letterSpacing: "0.06em", marginBottom: 28,
        }}>
          {t.chain} · {t.count(MISSION_SCENARIOS.length)}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MISSION_SCENARIOS.map(s => {
            const title = lang === "fi" ? s.titleFi : s.title
            const subtitle = lang === "fi" ? s.subtitleFi : s.subtitle
            const blurb = lang === "fi" ? s.blurbFi : s.blurb
            return (
              <Link
                key={s.slug}
                href={`/scenarios/${s.slug}`}
                style={{
                  display: "block", textDecoration: "none",
                  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "18px 20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{
                      fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700,
                      color: "var(--text)", marginBottom: 6, letterSpacing: "-0.01em",
                    }}>
                      {title}
                    </h2>
                    <p style={{
                      fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)",
                      lineHeight: 1.5, marginBottom: 8,
                    }}>
                      {subtitle}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-dim)",
                      lineHeight: 1.55,
                    }}>
                      {blurb}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-blue)",
                    flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    {t.view}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{
          marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "var(--font-ui)", fontSize: 22, fontWeight: 700,
            color: "var(--text)", marginBottom: 10,
          }}>
            {t.ctaHeading}
          </h2>
          <p style={{
            fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)",
            marginBottom: 24, maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.55,
          }}>
            {t.ctaSub}
          </p>
          <Link href="/#advisor" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--cta-gradient)", color: "#070B12",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14,
            padding: "12px 22px", borderRadius: 6, textDecoration: "none",
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
        footerTag={lang === "en"
          ? "Built in Finland for high-latitude resilience."
          : "Rakennettu Suomessa korkeiden leveysasteiden yhteysresilienssiä varten."}
      />
    </div>
  )
}

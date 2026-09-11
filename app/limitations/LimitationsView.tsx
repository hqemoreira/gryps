"use client"
import type { CSSProperties } from "react"
import { DocShell, type DocLang } from "@/components/DocShell"
import { PrototypeDisclaimerBanner, ResearchDocsNav } from "@/components/ResearchDocsNav"
import { METHODOLOGY_LABEL, RESEARCH_LIMITATIONS } from "@/lib/research-docs"

const COPY = {
  en: {
    eyebrow: `GRYPS · LIMITATIONS · ${METHODOLOGY_LABEL}`,
    h1: "Limitations",
    intro:
      "Explicit limits are a strength of a research prototype. They keep GRYPS honest as Connectivity Intelligence for learning and portfolio demonstration — not a commercial coverage product.",
    strength:
      "Stating what GRYPS is not makes the work more credible, not less.",
  },
  fi: {
    eyebrow: `GRYPS · RAJOITTEET · ${METHODOLOGY_LABEL}`,
    h1: "Rajoitteet",
    intro:
      "Eksplisiittiset rajat ovat tutkimusprototyypin vahvuus. Ne pitävät GRYPS:n rehellisenä Connectivity Intelligence -oppimis- ja portfoliodemonstraationa — ei kaupallisena kattavuustuotteena.",
    strength:
      "Sen sanoaminen, mitä GRYPS ei ole, tekee työstä uskottavampaa — ei heikompaa.",
  },
} as const

function Article({ lang }: { lang: DocLang }) {
  const t = COPY[lang]
  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
      <ResearchDocsNav lang={lang} active="limitations" />
      <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{t.eyebrow}</p>
      <h1 style={h1}>{t.h1}</h1>
      <p style={lead}>{t.intro}</p>
      <PrototypeDisclaimerBanner lang={lang} />
      <p style={{
        fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text)", lineHeight: 1.65,
        marginBottom: 24, padding: "12px 14px",
        backgroundColor: "rgba(79,168,255,0.06)", border: "1px solid rgba(79,168,255,0.2)", borderRadius: 6,
      }}>
        {t.strength}
      </p>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {RESEARCH_LIMITATIONS.map((item, i) => (
          <li key={i} style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 14 }}>
            {lang === "fi" ? item.fi : item.en}
          </li>
        ))}
      </ul>
    </article>
  )
}

export function LimitationsView() {
  return <DocShell>{(lang) => <Article lang={lang} />}</DocShell>
}

const h1: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 34, fontWeight: 700, color: "var(--text)",
  letterSpacing: "-0.02em", margin: "12px 0 16px",
}
const lead: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 8,
}

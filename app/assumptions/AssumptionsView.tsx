"use client"
import type { CSSProperties } from "react"
import { DocShell, type DocLang } from "@/components/DocShell"
import { PrototypeDisclaimerBanner, ResearchDocsNav } from "@/components/ResearchDocsNav"
import { METHODOLOGY_LABEL, RESEARCH_ASSUMPTIONS } from "@/lib/research-docs"

const COPY = {
  en: {
    eyebrow: `GRYPS · ASSUMPTIONS · ${METHODOLOGY_LABEL}`,
    h1: "Assumptions",
    intro:
      "What the research model takes as given when producing a Resilience Signature. Making assumptions explicit is part of prototype research quality.",
  },
  fi: {
    eyebrow: `GRYPS · OLETUKSET · ${METHODOLOGY_LABEL}`,
    h1: "Oletukset",
    intro:
      "Mitä tutkimusmalli pitää annettuina tuottaessaan Resilience Signaturea. Oletusten eksplisiittisyys on osa prototyypin tutkimuksen laatua.",
  },
} as const

function Article({ lang }: { lang: DocLang }) {
  const t = COPY[lang]
  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
      <ResearchDocsNav lang={lang} active="assumptions" />
      <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{t.eyebrow}</p>
      <h1 style={h1}>{t.h1}</h1>
      <p style={lead}>{t.intro}</p>
      <PrototypeDisclaimerBanner lang={lang} />
      <ol style={{ margin: 0, paddingLeft: 20 }}>
        {RESEARCH_ASSUMPTIONS.map((item, i) => (
          <li key={i} style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 14 }}>
            {lang === "fi" ? item.fi : item.en}
          </li>
        ))}
      </ol>
    </article>
  )
}

export function AssumptionsView() {
  return <DocShell>{(lang) => <Article lang={lang} />}</DocShell>
}

const h1: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 34, fontWeight: 700, color: "var(--text)",
  letterSpacing: "-0.02em", margin: "12px 0 16px",
}
const lead: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 8,
}

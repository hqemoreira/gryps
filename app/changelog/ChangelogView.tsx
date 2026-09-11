"use client"
import type { CSSProperties } from "react"
import { DocShell, type DocLang } from "@/components/DocShell"
import { PrototypeDisclaimerBanner, ResearchDocsNav } from "@/components/ResearchDocsNav"
import {
  METHODOLOGY_CHANGELOG,
  METHODOLOGY_LABEL,
  METHODOLOGY_VERSION,
} from "@/lib/research-docs"
import { MODEL_VERSION, SCORING_ENGINE } from "@/lib/model-constants"

const COPY = {
  en: {
    eyebrow: `GRYPS · CHANGELOG · ${METHODOLOGY_LABEL}`,
    h1: "Methodology changelog",
    intro:
      "How the GRYPS research model and documentation evolve. Current methodology framework is v0.4; the deterministic scoring engine remains reproducible under its own version tag.",
    current: "Current",
    scoring: "Scoring engine",
    modelTag: "Signature model tag",
  },
  fi: {
    eyebrow: `GRYPS · MUUTOSLOKI · ${METHODOLOGY_LABEL}`,
    h1: "Menetelmän muutosloki",
    intro:
      "Miten GRYPS:n tutkimusmalli ja dokumentaatio kehittyvät. Nykyinen menetelmäkehys on v0.4; deterministinen pisteytysmoottori pysyy toistettavana omalla versiotunnuksellaan.",
    current: "Nykyinen",
    scoring: "Pisteytysmoottori",
    modelTag: "Signature-mallitunnus",
  },
} as const

function Article({ lang }: { lang: DocLang }) {
  const t = COPY[lang]
  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
      <ResearchDocsNav lang={lang} active="changelog" />
      <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{t.eyebrow}</p>
      <h1 style={h1}>{t.h1}</h1>
      <p style={lead}>{t.intro}</p>
      <PrototypeDisclaimerBanner lang={lang} />

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32,
        backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px",
      }} className="gryps-output-grid">
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{t.current}</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>{METHODOLOGY_LABEL}</p>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{t.scoring}</p>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{SCORING_ENGINE}</p>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{t.modelTag}: {MODEL_VERSION}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {METHODOLOGY_CHANGELOG.map(entry => (
          <section key={entry.version} style={{
            borderLeft: entry.version === METHODOLOGY_VERSION ? "3px solid var(--accent-cyan)" : "3px solid var(--border)",
            paddingLeft: 16,
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
              <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                {entry.version}
              </h2>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>{entry.date}</span>
              {entry.version === METHODOLOGY_VERSION && (
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-cyan)",
                  border: "1px solid rgba(34,211,238,0.35)", borderRadius: 4, padding: "2px 6px",
                }}>
                  {t.current}
                </span>
              )}
            </div>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
              {lang === "fi" ? entry.titleFi : entry.title}
            </p>
            {entry.scoringEngine && (
              <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", marginBottom: 10 }}>
                {t.scoring}: {entry.scoringEngine}
              </p>
            )}
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {entry.items.map((item, i) => (
                <li key={i} style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 8 }}>
                  {lang === "fi" ? item.fi : item.en}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}

export function ChangelogView() {
  return <DocShell>{(lang) => <Article lang={lang} />}</DocShell>
}

const h1: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 34, fontWeight: 700, color: "var(--text)",
  letterSpacing: "-0.02em", margin: "12px 0 16px",
}
const lead: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 8,
}

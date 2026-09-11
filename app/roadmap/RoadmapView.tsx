"use client"
import type { CSSProperties } from "react"
import Link from "next/link"
import { DocShell, type DocLang } from "@/components/DocShell"
import { PrototypeDisclaimerBanner } from "@/components/ResearchDocsNav"
import {
  AVOID_LANGUAGE,
  COMPLETED_SPRINTS,
  DEFERRED_COMMERCIAL,
  METHODOLOGY_LABEL,
  PREFERRED_LANGUAGE,
  STRATEGIC_OBJECTIVE_EN,
  STRATEGIC_OBJECTIVE_FI,
} from "@/lib/research-roadmap"

const COPY = {
  en: {
    eyebrow: `RESEARCH ROADMAP · ${METHODOLOGY_LABEL}`,
    h1: "Roadmap",
    lead:
      "GRYPS should not become a business during this phase. It should become an increasingly sophisticated answer to a single question — and when someone opens the prototype, that answer should be yes.",
    objectiveH2: "Strategic objective",
    postureH2: "Phase posture",
    postureP:
      "Next work stays research- and prototype-focused. Monetization and commercial go-to-market are deferred on purpose.",
    sprintsH2: "Completed sprints",
    sprintsIntro: "Nine research / prototype sprints define the current career-asset surface.",
    sprint: "Sprint",
    focus: "Focus",
    nature: "Nature",
    deferH2: "Explicitly not building now",
    deferIntro:
      "Commercial and monetization features stay on the deferred list. Building any of these would change the project's nature.",
    feature: "Feature",
    decision: "Decision",
    deferLabel: "Defer",
    languageH2: "Language",
    languageIntro: "Prefer research vocabulary. Avoid sales and customer-acquisition phrasing.",
    prefer: "Prefer",
    avoid: "Avoid",
    caveatH2: "Maintainer note",
    caveatP:
      "Whether a particular activity is considered entrepreneurship can depend on the facts and on the rules applied by an unemployment fund or authorities. The “non-commercial prototype” label alone is not a legal guarantee. Keep the project's research / prototype nature clearly documented. If you are unsure how continued development affects benefit status, get confirmation from your unemployment fund before adding anything that could look like commercial activity. This note is documentation of project intent — not legal advice.",
    caseStudy: "Portfolio case study →",
    limitations: "Limitations →",
    changelog: "Methodology changelog →",
  },
  fi: {
    eyebrow: `TUTKIMUSROADMAP · ${METHODOLOGY_LABEL}`,
    h1: "Roadmap",
    lead:
      "GRYPS:n ei tule tulla liiketoiminnaksi tässä vaiheessa. Sen tulee olla yhä sofistikoituneempi vastaus yhteen kysymykseen — ja kun joku avaa prototyypin, vastauksen tulee olla kyllä.",
    objectiveH2: "Strateginen tavoite",
    postureH2: "Vaiheen asema",
    postureP:
      "Seuraava työ pysyy tutkimus- ja prototyyppikeskeisenä. Kaupallistaminen ja kaupallinen go-to-market on tarkoituksella siirretty.",
    sprintsH2: "Valmiit sprintit",
    sprintsIntro: "Yhdeksän tutkimus- / prototyyppisprinttiä määrittää nykyisen ura-assettipinnan.",
    sprint: "Sprint",
    focus: "Focus",
    nature: "Luonne",
    deferH2: "Ei rakenneta nyt",
    deferIntro:
      "Kaupalliset ja monetisaatio-ominaisuudet pysyvät deferred-listalla. Niiden rakentaminen muuttaisi hankkeen luonnetta.",
    feature: "Ominaisuus",
    decision: "Päätös",
    deferLabel: "Siirretty",
    languageH2: "Kieli",
    languageIntro: "Suosi tutkimus-sanastoa. Vältä myynti- ja asiakashankintailmaisuja.",
    prefer: "Suosi",
    avoid: "Vältä",
    caveatH2: "Ylläpitäjän huomio",
    caveatP:
      "Se, katsotaanko tietty toiminta yrittäjyydeksi, voi riippua tosiseikoista sekä työttömyyskassan tai viranomaisten soveltamista säännöistä. Pelkkä ”ei-kaupallinen prototyyppi” -leima ei ole oikeudellinen tae. Pidä hankkeen tutkimus- / prototyyppiluonne selkeästi dokumentoituna. Jos olet epävarma, miten jatkuva kehitys vaikuttaa etuuksiin, varmista asia työttömyyskassastasi ennen kuin lisäät mitään, mikä voisi näyttää kaupalliselta toiminnalta. Tämä on hankkeen tarkoituksen dokumentaatiota — ei oikeudellista neuvontaa.",
    caseStudy: "Portfoliocase study →",
    limitations: "Rajoitteet →",
    changelog: "Menetelmän muutosloki →",
  },
} as const

function Article({ lang }: { lang: DocLang }) {
  const t = COPY[lang]
  const objective = lang === "fi" ? STRATEGIC_OBJECTIVE_FI : STRATEGIC_OBJECTIVE_EN

  return (
    <article style={{ maxWidth: 840, margin: "0 auto", padding: "32px 24px 0" }}>
      <p style={eyebrow}>{t.eyebrow}</p>
      <h1 style={h1}>{t.h1}</h1>
      <p style={lead}>{t.lead}</p>
      <PrototypeDisclaimerBanner lang={lang} />

      <h2 style={h2}>{t.objectiveH2}</h2>
      <blockquote style={quote}>{objective}</blockquote>

      <h2 style={h2}>{t.postureH2}</h2>
      <p style={p}>{t.postureP}</p>

      <h2 style={h2}>{t.sprintsH2}</h2>
      <p style={p}>{t.sprintsIntro}</p>
      <div style={{ overflowX: "auto", marginBottom: 28 }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>{t.sprint}</th>
              <th style={th}>{t.focus}</th>
              <th style={th}>{t.nature}</th>
            </tr>
          </thead>
          <tbody>
            {COMPLETED_SPRINTS.map(s => (
              <tr key={s.id}>
                <td style={td}>{s.id}</td>
                <td style={td}>
                  {s.href ? (
                    <Link href={s.href} style={{ color: "var(--accent-blue)" }}>
                      {lang === "fi" ? s.focusFi : s.focus}
                    </Link>
                  ) : (
                    lang === "fi" ? s.focusFi : s.focus
                  )}
                </td>
                <td style={td}>{lang === "fi" ? s.natureFi : s.nature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>{t.deferH2}</h2>
      <p style={p}>{t.deferIntro}</p>
      <div style={{ overflowX: "auto", marginBottom: 28 }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>{t.feature}</th>
              <th style={th}>{t.decision}</th>
            </tr>
          </thead>
          <tbody>
            {DEFERRED_COMMERCIAL.map(row => (
              <tr key={row.feature}>
                <td style={td}>{lang === "fi" ? row.featureFi : row.feature}</td>
                <td style={{ ...td, color: "var(--accent-amber)" }}>{t.deferLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>{t.languageH2}</h2>
      <p style={p}>{t.languageIntro}</p>
      <p style={{ ...p, marginBottom: 8 }}>
        <span style={label}>{t.prefer}</span>
        {" · "}
        {PREFERRED_LANGUAGE.join(" · ")}
      </p>
      <p style={p}>
        <span style={label}>{t.avoid}</span>
        {" · "}
        {AVOID_LANGUAGE.map(w => `“${w}”`).join(" · ")}
      </p>

      <h2 style={h2}>{t.caveatH2}</h2>
      <p style={p}>{t.caveatP}</p>

      <p style={{ ...p, marginTop: 28 }}>
        <Link href="/case-study" style={{ color: "var(--accent-blue)" }}>{t.caseStudy}</Link>
        {" · "}
        <Link href="/limitations" style={{ color: "var(--accent-blue)" }}>{t.limitations}</Link>
        {" · "}
        <Link href="/changelog" style={{ color: "var(--accent-blue)" }}>{t.changelog}</Link>
      </p>
    </article>
  )
}

export function RoadmapView() {
  return (
    <DocShell>
      {(lang) => <Article lang={lang} />}
    </DocShell>
  )
}

const eyebrow: CSSProperties = {
  fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em",
}
const h1: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 36, fontWeight: 700, color: "var(--text)",
  letterSpacing: "-0.02em", margin: "16px 0 20px",
}
const lead: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 20, maxWidth: 680,
}
const h2: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "32px 0 12px",
}
const p: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 12, maxWidth: 680,
}
const quote: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 17, fontWeight: 500, color: "var(--text)",
  lineHeight: 1.65, margin: "0 0 16px", padding: "16px 18px",
  borderLeft: "3px solid var(--accent-blue)", backgroundColor: "rgba(79,168,255,0.06)", maxWidth: 720,
}
const table: CSSProperties = {
  width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: 14,
}
const th: CSSProperties = {
  textAlign: "left", fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)",
  letterSpacing: "0.08em", padding: "8px 12px 8px 0", borderBottom: "1px solid var(--border2)",
}
const td: CSSProperties = {
  padding: "10px 12px 10px 0", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", verticalAlign: "top",
}
const label: CSSProperties = {
  fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em",
}

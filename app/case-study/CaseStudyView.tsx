"use client"
import type { CSSProperties } from "react"
import Link from "next/link"
import { DocShell, type DocLang } from "@/components/DocShell"
import { PolarAtmosphere } from "@/components/PolarAtmosphere"
import { PrototypeDisclaimerBanner } from "@/components/ResearchDocsNav"
import { METHODOLOGY_LABEL, SCORING_ENGINE } from "@/lib/model-constants"

const APPROACH = [
  {
    en: { title: "Research", body: "High-latitude constraints, orbital classes, and operator-relevant literature distilled into Knowledge notes and a Research Library." },
    fi: { title: "Tutkimus", body: "Korkeiden leveysasteiden rajoitteet, rataluokat ja operaattoreille relevantti kirjallisuus Knowledge-muistiinpanoiksi ja Research Libraryksi." },
  },
  {
    en: { title: "Data modelling", body: "Structured inputs (location, sector, autonomy, criticality, setup) mapped to reproducible Signature outputs and evidence fields." },
    fi: { title: "Datamallinnus", body: "Rakenteiset syötteet (sijainti, toimiala, autonomia, kriittisyys, setup) mapattuna toistettaviin Signature-tulosteisiin ja näyttökenttiin." },
  },
  {
    en: { title: "Business requirements", body: "Mission priorities and scenarios capture how readiness documentation needs differ from a sales checklist." },
    fi: { title: "Liiketoimintavaatimukset", body: "Tehtävän prioriteetit ja skenaariot kuvaavat, miten valmiusdokumentaation tarpeet eroavat myyntilistasta." },
  },
  {
    en: { title: "Scoring logic", body: `Deterministic ${SCORING_ENGINE}: redundancy, latitude, operational profile, provider confidence, and hard caps — same inputs, same score.` },
    fi: { title: "Pisteytyslogiikka", body: `Deterministinen ${SCORING_ENGINE}: redundanssi, leveysaste, toimintaprofiili, toimittajaluottamus ja kovat katot — samat syötteet, sama piste.` },
  },
  {
    en: { title: "AI-assisted analysis", body: "Optional language-model prose for recommendation wording only. Scores, grades, risks, and ranks stay deterministic." },
    fi: { title: "AI-avusteinen analyysi", body: "Valinnainen kielimalliproosa vain suositustekstiin. Pisteet, arvosanat, riskit ja sijoitukset pysyvät deterministisinä." },
  },
  {
    en: { title: "Workflow design", body: "Advisor funnel → Signature → evidence chain → local Research Workspace save / compare / export." },
    fi: { title: "Työnkulun suunnittelu", body: "Advisor-polku → Signature → näyttöketju → paikallinen Research Workspace (tallenna / vertaa / vie)." },
  },
  {
    en: { title: "Interactive map", body: "MapLibre Connectivity Intelligence console for Nordic / Arctic / Icelandic context exploration." },
    fi: { title: "Interaktiivinen kartta", body: "MapLibre Connectivity Intelligence -konsoli Pohjoismaiden / arktisen alueen / Islannin kontekstin tutkimiseen." },
  },
  {
    en: { title: "Provider comparison", body: "Catalog-based ranking and comparison bands — research heuristics, not commercial brokerage." },
    fi: { title: "Toimittajavertailu", body: "Hakemistopohjainen järjestys ja vertailukaistat — tutkimusheuristiikkaa, ei kaupallista välitystä." },
  },
  {
    en: { title: "Evidence layer", body: "Explicit chain from operating environment through research and characteristics to scored recommendation, with provenance." },
    fi: { title: "Näyttökerros", body: "Eksplisiittinen ketju toimintaympäristöstä tutkimuksen ja ominaisuuksien kautta pisteytettyyn suositukseen, alkuperätiedoilla." },
  },
] as const

const LEARNED = [
  { en: "Data modelling", fi: "Datamallinnus" },
  { en: "AI-assisted research", fi: "AI-avusteinen tutkimus" },
  { en: "Decision-support design", fi: "Päätöstukisuunnittelu" },
  { en: "Workflow automation", fi: "Työnkulun automatisointi" },
  { en: "Requirements analysis", fi: "Vaatimusanalyysi" },
  { en: "Product thinking", fi: "Tuoteajattelu" },
] as const

const PROTOTYPE_LINKS = [
  { href: "/#advisor", en: "Generate Resilience Signature", fi: "Luo Resilience Signature" },
  { href: "/map", en: "Connectivity Intelligence map", fi: "Connectivity Intelligence -kartta" },
  { href: "/research", en: "Research Library", fi: "Research Library" },
  { href: "/scenarios", en: "Mission scenarios", fi: "Tehtäväskenaariot" },
  { href: "/workspace", en: "Research Workspace", fi: "Research Workspace" },
  { href: "/methodology", en: "Methodology & scoring", fi: "Menetelmä ja pisteytys" },
  { href: "/data-sources", en: "Data provenance", fi: "Datan alkuperä" },
  { href: "/limitations", en: "Limitations", fi: "Rajoitteet" },
] as const

const COPY = {
  en: {
    eyebrow: `PORTFOLIO CASE STUDY · ${METHODOLOGY_LABEL}`,
    brand: "GRYPS",
    h1: "Connectivity Intelligence Research Prototype",
    lead:
      "A non-commercial R&D prototype that turns fragmented satellite-connectivity context into an indicative, reproducible Resilience Signature — built as evidence of research, product, and decision-support craft.",
    problemH2: "Problem",
    problemP:
      "Remote operations face fragmented satellite-connectivity information. Operators must stitch together orbital classes, latitude effects, redundancy, and provider claims without a shared decision-support frame.",
    questionH2: "Research question",
    questionP:
      "How could location, operational requirements and connectivity characteristics be combined into a decision-support model?",
    approachH2: "Approach",
    approachIntro:
      "GRYPS was built as an end-to-end research prototype — from problem framing through scoring and interactive surfaces — not as a sales funnel.",
    prototypeH2: "Prototype",
    prototypeIntro:
      "The application is live. Explore the same surfaces used in the research workflow.",
    learnedH2: "What I learned",
    learnedIntro:
      "Capabilities demonstrated through building GRYPS — relevant for AI, digital solutions, automation, and business-analyst roles.",
    limitsH2: "Limitations",
    limitsIntro:
      "What is not production-grade is stated on purpose. Honesty about scope is part of the portfolio signal.",
    limitsItems: [
      "Not a commercial product, coverage certification, or engineering consultancy.",
      "Not live constellation telemetry, congestion simulation, or an SLA.",
      "Not a substitute for on-site RF / sky-view survey.",
      "Optional AI text never overrides deterministic scores.",
      "Research Workspace is browser-local only — not a cloud CRM.",
    ],
    limitsLink: "Full limitations →",
    aboutLink: "About the maintainer →",
    researchPrototypeLink: "Research & Prototype →",
    geometryCaption:
      "Modeled polar geometry — research visualisation for high-latitude connectivity context, not live RF.",
  },
  fi: {
    eyebrow: `PORTFOLIO · CASE STUDY · ${METHODOLOGY_LABEL}`,
    brand: "GRYPS",
    h1: "Connectivity Intelligence -tutkimusprototyyppi",
    lead:
      "Ei-kaupallinen T&K-prototyyppi, joka muuttaa pirstaleisen satelliittiyhteyden kontekstin suuntaa-antavaksi, toistettavaksi Resilience Signatureksi — rakennettu todisteeksi tutkimus-, tuote- ja päätöstukiosaamisesta.",
    problemH2: "Ongelma",
    problemP:
      "Etätoiminnot kohtaavat pirstaleista satelliittiyhteystietoa. Operaattoreiden on yhdistettävä rataluokat, leveysastevaikutukset, redundanssi ja toimittajaväitteet ilman yhteistä päätöstukikehystä.",
    questionH2: "Tutkimuskysymys",
    questionP:
      "Miten sijainti, toiminnalliset vaatimukset ja yhteyden ominaisuudet voitaisiin yhdistää päätöstukimalliksi?",
    approachH2: "Lähestymistapa",
    approachIntro:
      "GRYPS rakennettiin päästä päähän -tutkimusprototyypiksi — ongelmankehystyksestä pisteytykseen ja interaktiivisiin pintoihin — ei myyntisuppiloksi.",
    prototypeH2: "Prototyyppi",
    prototypeIntro:
      "Sovellus on käytettävissä. Tutki samoja pintoja kuin tutkimusprosessissa.",
    learnedH2: "Mitä opin",
    learnedIntro:
      "GRYPS:n rakentamisen kautta osoitetut kyvykkyydet — relevantteja AI-, digiratkaisu-, automaatio- ja business analyst -rooleihin.",
    limitsH2: "Rajoitteet",
    limitsIntro:
      "Se, mikä ei ole tuotantotasoa, sanotaan tarkoituksella. Rehellisyys laajuudesta on osa portfoliosignaalia.",
    limitsItems: [
      "Ei kaupallinen tuote, kattavuussertifiointi eikä tekninen konsultointi.",
      "Ei live-konstellaatiotelemetriaa, ruuhkasimulaatiota eikä SLA:ta.",
      "Ei korvaa paikan päällä tehtävää RF- / taivasnäkymämittausta.",
      "Valinnainen AI-teksti ei koskaan ohita deterministisiä pisteitä.",
      "Research Workspace on vain selainkohtainen — ei pilvi-CRM.",
    ],
    limitsLink: "Kaikki rajoitteet →",
    aboutLink: "Ylläpitäjästä →",
    researchPrototypeLink: "Tutkimus ja prototyyppi →",
    geometryCaption:
      "Mallinnettu polaarigeometria — tutkimuskuvitus korkeiden leveysasteiden yhteyksille, ei live-RF.",
  },
} as const

function CaseStudyArticle({ lang }: { lang: DocLang }) {
  const t = COPY[lang]
  return (
    <article style={{ maxWidth: 840, margin: "0 auto", padding: "32px 24px 0" }}>
      <p style={eyebrow}>{t.eyebrow}</p>
      <p style={brand}>{t.brand}</p>
      <h1 style={h1}>{t.h1}</h1>
      <p style={lead}>{t.lead}</p>
      <PrototypeDisclaimerBanner lang={lang} />

      <figure className="gryps-polar-method" style={{ marginBottom: 36 }}>
        <PolarAtmosphere
          variant="full"
          animate
          interactive
          className="gryps-polar-figure gryps-polar-figure-lg"
        />
        <figcaption style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.55, marginTop: 12 }}>
          {t.geometryCaption}
        </figcaption>
      </figure>

      <section>
        <h2 style={h2}>{t.problemH2}</h2>
        <p style={p}>{t.problemP}</p>
      </section>

      <section>
        <h2 style={h2}>{t.questionH2}</h2>
        <p style={{ ...p, fontSize: 17, color: "var(--text)", fontWeight: 500 }}>{t.questionP}</p>
      </section>

      <section>
        <h2 style={h2}>{t.approachH2}</h2>
        <p style={p}>{t.approachIntro}</p>
        <ol style={{ margin: "0 0 8px", paddingLeft: 0, listStyle: "none" }}>
          {APPROACH.map((item, i) => {
            const a = item[lang]
            return (
              <li key={a.title} style={approachItem}>
                <span style={approachIndex}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p style={approachTitle}>{a.title}</p>
                  <p style={approachBody}>{a.body}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section>
        <h2 style={h2}>{t.prototypeH2}</h2>
        <p style={p}>{t.prototypeIntro}</p>
        <ul style={{ margin: "0 0 12px", paddingLeft: 0, listStyle: "none" }}>
          {PROTOTYPE_LINKS.map(link => (
            <li key={link.href} style={{ marginBottom: 10 }}>
              <Link href={link.href} style={protoLink}>
                {lang === "fi" ? link.fi : link.en}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={h2}>{t.learnedH2}</h2>
        <p style={p}>{t.learnedIntro}</p>
        <ul style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, paddingLeft: 20, marginBottom: 16 }}>
          {LEARNED.map(item => (
            <li key={item.en} style={{ marginBottom: 8 }}>
              {lang === "fi" ? item.fi : item.en}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={h2}>{t.limitsH2}</h2>
        <p style={p}>{t.limitsIntro}</p>
        <ul style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, paddingLeft: 20, marginBottom: 16 }}>
          {t.limitsItems.map(item => (
            <li key={item} style={{ marginBottom: 8 }}>{item}</li>
          ))}
        </ul>
        <p style={p}>
          <Link href="/limitations" style={{ color: "var(--accent-blue)" }}>{t.limitsLink}</Link>
          {" · "}
          <Link href="/research-prototype" style={{ color: "var(--accent-blue)" }}>{t.researchPrototypeLink}</Link>
          {" · "}
          <Link href="/about" style={{ color: "var(--accent-blue)" }}>{t.aboutLink}</Link>
        </p>
      </section>
    </article>
  )
}

export function CaseStudyView() {
  return (
    <DocShell>
      {(lang) => <CaseStudyArticle lang={lang} />}
    </DocShell>
  )
}

const eyebrow: CSSProperties = {
  fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em",
}
const brand: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 42, fontWeight: 800, color: "var(--text)",
  letterSpacing: "-0.03em", margin: "14px 0 8px", lineHeight: 1.05,
}
const h1: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 28, fontWeight: 600, color: "var(--text-muted)",
  letterSpacing: "-0.02em", margin: "0 0 20px", maxWidth: 640, lineHeight: 1.25,
}
const lead: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)",
  lineHeight: 1.75, marginBottom: 20, maxWidth: 680,
}
const h2: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "36px 0 12px",
}
const p: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 12, maxWidth: 680,
}
const approachItem: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "44px 1fr",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid var(--border)",
}
const approachIndex: CSSProperties = {
  fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.06em", paddingTop: 2,
}
const approachTitle: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px",
}
const approachBody: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, margin: 0,
}
const protoLink: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 600, color: "var(--accent-blue)", textDecoration: "none",
}

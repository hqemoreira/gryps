"use client"
import type { CSSProperties } from "react"
import Link from "next/link"
import { DocShell, type DocLang } from "@/components/DocShell"
import { PolarAtmosphere } from "@/components/PolarAtmosphere"
import { MODEL_VERSION, SCORING_ENGINE } from "@/lib/signature-meta"

const COPY = {
  en: {
    eyebrow: `GRYPS · METHODOLOGY · ${MODEL_VERSION}`,
    h1: "How a Resilience Signature is scored",
    intro:
      "GRYPS is a non-commercial research prototype that scores satellite connectivity resilience for remote Nordic and Arctic operations (forestry, maritime, mining, autonomous fleets). A Signature is an assessment at a timestamp — not live monitoring.",
    geometryCaption:
      "Modeled polar geometry — latitude rings and LEO / MEO / GEO orbital paths. Interactive highlight · animated passes. Scoring uses deterministic Model v0.3 weights, not live RF.",
    geometryHint: "Highlight an orbit class to see how geometry informs Signature weighting.",
    notH2: "What the advisor is not",
    notItems: [
      "Not a substitute for an on-site RF / sky-view survey.",
      "Not live constellation telemetry, outage feeds, or a coverage SLA.",
      "Not insurance, certification, or legal advice (including NIS2/CER).",
      "Not for sale — no company, no revenue, research demonstration only.",
    ],
    formulaH2: `Model v0.3 formula (${SCORING_ENGINE})`,
    formulaP1:
      "The Resilience Score is deterministic and reproducible for the same inputs. Optional language-model text may polish the recommendation paragraph only — it never changes score, grade, risks, or ranked providers.",
    formulaP2: "Score = sum of four components (then hard caps, clamped 0–100):",
    components: [
      { title: "Redundancy (0–30)", body: "0 providers → 0; 1 → 8; 2 → 22 (+6 if independent orbital types / LEO broadband+narrowband); ≥3 → 28." },
      { title: "Latitude (0–20)", body: "≤60°N → 20; ≤65 → 16; ≤70 → 12; >70 → 8. Forestry sites below 300 m elevation: −4 (canopy/terrain)." },
      { title: "Operational profile (0–15)", body: "manual 15 · remote-operated 11 · mixed 8 · autonomous 5." },
      { title: "Provider confidence (0–30)", body: "average catalog confidence × 0.30. GEO providers above 70°N use a degraded confidence. Confidence reflects assessment/data basis — not guaranteed service availability." },
    ],
    gradesH2: "Grades",
    gradesP: "A = ≥90 · B = 75–89 · C = 60–74 · D = 40–59 · F = <40 (spec band E maps to F in the UI).",
    capsH2: "Hard caps",
    capsItems: [
      "Safety-critical + autonomous + <2 providers → score capped at 50.",
      "Safety-critical + exactly 1 provider → capped at 60.",
      "Latitude >72°N with GEO-only providers → capped at 45.",
    ],
    capsNote: "Caps are enforced in the deterministic engine (and re-checked in code) so edge-case demos cannot bypass homepage claims.",
    risksH2: "Risk factors and ranked providers",
    risksP:
      "Up to four risk factors are derived from redundancy, latitude/GEO, sector, autonomy, and score vs safety threshold. Backup providers not in the current setup are ranked by confidence minus latitude and orbital-overlap penalties. GRYPS has no commercial relationship with any provider listed.",
    twoScoresH2: "Two scores, not one blend",
    twoScoresP:
      "The Resilience Score is the deterministic Signature above. Terrain penalty from EU-DEM via OpenTopoData is deterministic and displayed separately. Finnish Bittimittari speed/latency applies only to seeded municipality sites — not ad-hoc coordinates.",
    versionH2: "Versioning (monitoring later)",
    versionP: `Every Signature carries issuedAt, modelVersion (${MODEL_VERSION}), and inputHash. Monitoring is the same engine at T1, T2 — not a second product. Live drift alerting is not built yet; the homepage drift slider is illustrative only.`,
    providersLink: "Provider index",
    advisorLink: "Generate Resilience Signature",
  },
  fi: {
    eyebrow: `GRYPS · MENETELMÄ · ${MODEL_VERSION}`,
    h1: "Miten Resilience Signature pisteytetään",
    intro:
      "GRYPS on ei-kaupallinen tutkimusprototyyppi, joka pisteyttää satelliittiyhteyksien resilienssiä pohjoismaisissa ja arktisissa kohteissa (metsätalous, merenkulku, kaivostoiminta, autonomiset kalustot). Signature on arvio tiettynä ajanhetkenä — ei reaaliaikaista seurantaa.",
    geometryCaption:
      "Mallinnettu polaarigeometria — leveyspiirit sekä LEO-, MEO- ja GEO-radat. Interaktiivinen korostus · animoidut ohitukset. Pisteytys perustuu deterministiseen malliin v0.3, ei reaaliaikaiseen RF-mittaukseen.",
    geometryHint: "Korosta rataluokkaa nähdäksesi, miten geometria vaikuttaa Signature-painotuksiin.",
    notH2: "Mitä Advisor ei ole",
    notItems: [
      "Ei korvaa paikan päällä tehtävää RF- tai taivasnäkymämittausta.",
      "Ei reaaliaikaista konstellaatiotelemetriaa, häiriösyötteitä eikä kattavuus-SLA:ta.",
      "Ei vakuutusta, sertifiointia eikä oikeudellista neuvontaa (mukaan lukien NIS2/CER).",
      "Ei myynnissä — ei yritystä, ei tuloja, vain tutkimusdemonstraatio.",
    ],
    formulaH2: `Mallin v0.3 kaava (${SCORING_ENGINE})`,
    formulaP1:
      "Resilience-piste on deterministinen ja toistettavissa samoilla syötteillä. Valinnainen kielimalliteksti voi hioa vain suosituskappaleen — se ei koskaan muuta pistettä, arvosanaa, riskejä tai toimittajasuosituksia.",
    formulaP2: "Piste = neljän komponentin summa (sen jälkeen kovat katot, rajattu 0–100):",
    components: [
      { title: "Redundanssi (0–30)", body: "0 toimittajaa → 0; 1 → 8; 2 → 22 (+6 jos itsenäiset radat / LEO broadband+narrowband); ≥3 → 28." },
      { title: "Leveysaste (0–20)", body: "≤60°N → 20; ≤65 → 16; ≤70 → 12; >70 → 8. Metsäkohteet alle 300 m korkeudessa: −4 (latvus/maasto)." },
      { title: "Toimintaprofiili (0–15)", body: "manuaalinen 15 · etäohjattu 11 · yhdistelmä 8 · autonominen 5." },
      { title: "Toimittajaluottamus (0–30)", body: "hakemiston keskimääräinen luottamus × 0.30. GEO-toimittajat yli 70°N käyttävät heikennettyä luottamusta. Luottamus kuvaa arvioinnin/dataperustan varmuutta — ei palvelun saatavuustakuuta." },
    ],
    gradesH2: "Arvosanat",
    gradesP: "A = ≥90 · B = 75–89 · C = 60–74 · D = 40–59 · F = <40 (spesifikaation E näkyy käyttöliittymässä F:nä).",
    capsH2: "Kovat katot",
    capsItems: [
      "Turvallisuuskriittinen + autonominen + alle 2 toimittajaa → piste katkaistaan 50:een.",
      "Turvallisuuskriittinen + tasan 1 toimittaja → katkaistaan 60:een.",
      "Leveysaste yli 72°N ja vain GEO-toimittajat → katkaistaan 45:een.",
    ],
    capsNote: "Katot on pakotettu deterministiseen moottoriin (ja tarkistetaan uudelleen koodissa), jotta reunademot eivät voi kiertää etusivun väitteitä.",
    risksH2: "Riskitekijät ja toimittajasuositukset",
    risksP:
      "Enintään neljä riskitekijää johdetaan redundanssista, leveysasteesta ja GEO:sta, toimialasta, autonomiasta sekä pisteestä suhteessa turvallisuuskynnykseen. Nykyiseen kokoonpanoon kuulumattomat varatoimittajat järjestetään luottamuksen mukaan, josta vähennetään leveysaste- ja ratapeittorangaistukset. GRYPS:llä ei ole kaupallista suhdetta listattuihin toimittajiin.",
    twoScoresH2: "Kaksi pistettä, ei yhtä sekoitusta",
    twoScoresP:
      "Resilience-piste on yllä oleva deterministinen Signature. EU-DEM-maastorangaistus OpenTopoDatan kautta on deterministinen ja näytetään erikseen. Suomen Bittimittari-nopeus ja -viive koskevat vain esitäytettyjä kuntakohteita — eivät vapaasti syötettyjä koordinaatteja.",
    versionH2: "Versiointi (seuranta myöhemmin)",
    versionP: `Jokainen Signature sisältää issuedAt-, modelVersion- (${MODEL_VERSION}) ja inputHash-kentät. Seuranta on sama moottori hetkillä T1 ja T2 — ei erillinen tuote. Reaaliaikaisia ajautumahälytyksiä ei ole vielä rakennettu; etusivun ajautumaliukusäädin on vain havainnollistus.`,
    providersLink: "Toimittajahakemisto",
    advisorLink: "Luo Resilience Signature",
  },
} as const

function MethodologyArticle({ lang }: { lang: DocLang }) {
  const t = COPY[lang]
  return (
    <article style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px 0" }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{t.eyebrow}</p>
      <h1 style={{ fontFamily: "var(--font-ui)", fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: "16px 0 20px", maxWidth: 720 }}>
        {t.h1}
      </h1>
      <p className="gryps-hero-sub" style={{ fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 28, maxWidth: 720 }}>
        {t.intro}
      </p>

      <figure className="gryps-polar-method">
        <PolarAtmosphere
          variant="full"
          animate
          interactive
          className="gryps-polar-figure gryps-polar-figure-lg"
        />
        <figcaption>
          {t.geometryCaption}
          <span style={{ display: "block", marginTop: 8, fontSize: 12, color: "var(--text-dim)" }}>
            {t.geometryHint}
          </span>
        </figcaption>
      </figure>

      <div style={{ maxWidth: 720 }}>
      <h2 style={h2}>{t.notH2}</h2>
      <ul style={ul}>
        {t.notItems.map(item => <li key={item}>{item}</li>)}
      </ul>

      <h2 style={h2}>{t.formulaH2}</h2>
      <p style={p}>{t.formulaP1}</p>
      <p style={p}>{t.formulaP2}</p>
      <ul style={ul}>
        {t.components.map(c => (
          <li key={c.title}>
            <strong>{c.title}</strong> — {c.body}
          </li>
        ))}
      </ul>

      <h2 style={h2}>{t.gradesH2}</h2>
      <p style={p}>{t.gradesP}</p>

      <h2 style={h2}>{t.capsH2}</h2>
      <ul style={ul}>
        {t.capsItems.map(item => <li key={item}>{item}</li>)}
      </ul>
      <p style={p}>{t.capsNote}</p>

      <h2 style={h2}>{t.risksH2}</h2>
      <p style={p}>{t.risksP}</p>

      <h2 style={h2}>{t.twoScoresH2}</h2>
      <p style={p}>{t.twoScoresP}</p>

      <h2 style={h2}>{t.versionH2}</h2>
      <p style={p}>{t.versionP}</p>

      <p style={{ ...p, marginTop: 40 }}>
        <Link href="/providers" style={{ color: "var(--accent-blue)" }}>{t.providersLink}</Link>
        {" · "}
        <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>{t.advisorLink}</Link>
      </p>
      </div>
    </article>
  )
}

export function MethodologyView() {
  return (
    <DocShell>
      {(lang) => <MethodologyArticle lang={lang} />}
    </DocShell>
  )
}

const h2: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "28px 0 10px",
}
const p: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 12,
}
const ul: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, paddingLeft: 20, marginBottom: 12,
}

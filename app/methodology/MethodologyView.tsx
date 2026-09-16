"use client";
import type { CSSProperties } from "react";
import Link from "next/link";
import { DocShell, type DocLang } from "@/components/DocShell";
import { PolarAtmosphere } from "@/components/PolarAtmosphere";
import { PrototypeDisclaimerBanner, ResearchDocsNav } from "@/components/ResearchDocsNav";
import { EvidenceKindLegend } from "@/components/TypeLabel";
import { MODEL_VERSION, SCORING_ENGINE_DISPLAY, METHODOLOGY_LABEL } from "@/lib/signature-meta";
import { GRADE_BANDS_SUMMARY, SCORING_MODEL_LABEL } from "@/lib/model-constants";

const COPY = {
  en: {
    eyebrow: `${METHODOLOGY_LABEL} · ${MODEL_VERSION}`,
    h1: "GRYPS Research Methodology",
    intro:
      "GRYPS is an experimental Connectivity Intelligence framework for Nordic, Arctic, and Icelandic remote operations. It connects research context, reference data, and a deterministic scoring model to produce indicative Resilience Signatures — not procurement advice, not a site survey, and not live network monitoring.",
    versionNote: `Documentation framework ${METHODOLOGY_LABEL}. Scoring engine ${SCORING_ENGINE_DISPLAY} remains reproducible for identical inputs.`,
    postureH2: "Research posture",
    postureP:
      "GRYPS is non-commercial R&D. Recommendations are indicative outputs of a research prototype. They support human judgement for readiness documentation; they do not certify compliance, sell terminals, or replace professional connectivity engineering.",
    chainH2: "Evidence chain",
    chainIntro:
      "Every Signature follows the same research path. The chain is explicit so operators can see how environment and published knowledge become a scored recommendation.",
    evidenceKindsH2: "Evidence kinds",
    evidenceKindsP:
      "The same chip vocabulary appears on Signatures, Research assessments, the Map, and the Provider index. Same label = same meaning everywhere.",
    chain: [
      {
        title: "1 · Operating environment",
        body: "Latitude, sector (forestry, maritime, mining, …), autonomy, and criticality define the mission envelope. High Arctic sites weight polar-capable paths more heavily than mid-Nordic sites.",
      },
      {
        title: "2 · Relevant research",
        body: "GRYPS Knowledge notes and the Research Library document high-latitude constraints (GEO elevation loss, LEO broadband vs polar narrowband, redundancy under autonomy). These are editorial research artefacts aligned to Model v0.3 — not vendor white papers.",
      },
      {
        title: "3 · Connectivity characteristics",
        body: "Documented providers and orbital classes map to catalog confidence and reference latency/geometry bands. Characteristics describe modeled posture, not measured RF at the pin.",
      },
      {
        title: "4 · GRYPS scoring factors",
        body: "Deterministic Model v0.3 sums redundancy, latitude, operational profile, and provider confidence, then applies hard caps. Mission priorities may re-rank recommendations; they do not change the Signature score.",
      },
      {
        title: "5 · Provider recommendation",
        body: "Structured recommendation package: overall fit, confidence, reasons, trade-offs, alternatives, and comparison bands — with source attribution on the Signature itself.",
      },
    ],
    geometryCaption:
      "Modeled polar geometry — latitude rings and LEO / MEO / GEO orbital paths. Interactive highlight · animated passes. Scoring uses deterministic Model v0.3 weights, not live RF.",
    geometryHint: "Highlight an orbit class to see how geometry informs Signature weighting.",
    attributionH2: "Source attribution & data freshness",
    attributionItems: [
      `Model — GRYPS deterministic engine (Model v0.3 / ${SCORING_ENGINE_DISPLAY}); score/grade/risks/ranks are reproducible for identical inputs.`,
      "Catalog — curated provider index; confidence = assessment/data basis, not availability %. No commercial relationships.",
      "Datasets — EU-DEM (Copernicus/EEA via OpenTopoData) for terrain evidence; Bittimittari (Traficom, CC BY 4.0) for Finnish municipality seeds only. Neither is blended into the 0–100 Signature.",
      "Research — GRYPS Knowledge articles and Research Library assessments; editorial freshness noted on each Signature evidence panel.",
      "Reference — public orbital-class latency/geometry conventions for LEO / MEO / GEO commentary.",
    ],
    assumptionsH2: "Assumptions",
    assumptions: [
      "Clear sky-view and correct antenna installation unless contradicted by separate terrain evidence.",
      "Provider catalog confidence is a research heuristic, not a measured site availability rate.",
      "Optional language-model text may polish the recommendation paragraph only — never numbers or ranks.",
      "Coordinates are interpreted inside the Nordic / Arctic / Iceland research envelope.",
    ],
    limitationsH2: "Limitations",
    limitations: [
      "Not a substitute for an on-site RF / sky-view survey.",
      "Not live constellation telemetry, outage feeds, or a coverage SLA.",
      "Not insurance, certification, procurement advice, or legal advice (including NIS2/CER).",
      "Not for sale — no company, no revenue; research demonstration only.",
    ],
    confidenceH2: "Confidence",
    confidenceP:
      "Assessment confidence on the evidence panel reflects confidence in the assessment/data basis (catalog fit, documented paths, latitude constraints). It is not a probability of service availability and not an SLA.",
    formulaH2: `${SCORING_MODEL_LABEL} formula (${SCORING_ENGINE_DISPLAY})`,
    formulaP1:
      `The Resilience Score is deterministic and reproducible for the same inputs (${SCORING_MODEL_LABEL}). Optional language-model text may polish the recommendation paragraph only — it never changes score, grade, risks, or ranked providers.`,
    formulaP2: "Score = sum of four components (then hard caps, clamped 0–100):",
    components: [
      {
        title: "Redundancy (0–30)",
        body: "0 providers → 0; 1 → 8; 2 → 22 (+6 if independent orbital types / LEO broadband+narrowband); ≥3 → 28.",
      },
      {
        title: "Latitude (0–20)",
        body: "≤60°N → 20; ≤65 → 16; ≤70 → 12; >70 → 8. Forestry sites below 300 m elevation: −4 (canopy/terrain).",
      },
      {
        title: "Operational profile (0–15)",
        body: "manual 15 · remote-operated 11 · mixed 8 · autonomous 5.",
      },
      {
        title: "Provider confidence (0–30)",
        body: "average catalog confidence × 0.30. GEO providers above 70°N use a degraded confidence. Confidence reflects assessment/data basis — not guaranteed service availability.",
      },
    ],
    gradesH2: "Grades",
    gradesP: `${GRADE_BANDS_SUMMARY} (spec band E maps to F in the UI).`,
    capsH2: "Hard caps",
    capsItems: [
      "Safety-critical + autonomous + <2 providers → score capped at 50.",
      "Safety-critical + exactly 1 provider → capped at 60.",
      "Latitude >72°N with GEO-only providers → capped at 45.",
    ],
    capsNote:
      "Caps are enforced in the deterministic engine (and re-checked in code) so edge-case demos cannot bypass homepage claims.",
    risksH2: "Risk factors and ranked providers",
    risksP:
      "Up to four risk factors are derived from redundancy, latitude/GEO, sector, autonomy, and score vs safety threshold. Backup providers not in the current setup are ranked by confidence minus latitude and orbital-overlap penalties, then optional mission-priority bonuses. GRYPS has no commercial relationship with any provider listed.",
    twoScoresH2: "Two scores, not one blend",
    twoScoresP:
      "The Resilience Score is the deterministic Signature above. Terrain penalty from EU-DEM via OpenTopoData is deterministic and displayed separately. Finnish Bittimittari speed/latency applies only to seeded municipality sites — not ad-hoc coordinates.",
    versionH2: "Versioning (monitoring later)",
    versionP: `Every Signature carries issuedAt, modelVersion (${MODEL_VERSION}), and inputHash. Monitoring is the same engine at T1, T2 — not a second product. Live drift alerting is not built yet; the homepage drift slider is illustrative only.`,
    researchLink: "Research Library",
    mapLink: "Explore Map",
    scenariosLink: "Mission scenarios",
    workspaceLink: "Assessments",
    dataSourcesLink: "Data sources",
    assumptionsLink: "Assumptions",
    limitationsLink: "Limitations",
    changelogLink: "Changelog",
    knowledgeLink: "Evidence",
    providersLink: "Provider index",
    advisorLink: "Generate Resilience Signature",
  },
  fi: {
    eyebrow: `${METHODOLOGY_LABEL} · ${MODEL_VERSION}`,
    h1: "GRYPS-tutkimusmenetelmä",
    intro:
      "GRYPS on kokeellinen Connectivity Intelligence -kehys pohjoismaisille, arktisille ja islantilaisille etäkohteille. Se yhdistää tutkimuskokonaisuuden, viitedatan ja deterministisen pisteytysmallin suuntaa-antaviksi Resilience Signatureiksi — ei hankintaneuvontaa, ei paikkamitasta eikä live-verkon seurantaa.",
    versionNote: `Dokumentaatiokehys ${METHODOLOGY_LABEL}. Pisteytysmoottori ${SCORING_ENGINE_DISPLAY} pysyy toistettavana samoilla syötteillä.`,
    postureH2: "Tutkimusasema",
    postureP:
      "GRYPS on ei-kaupallinen T&K. Suositukset ovat tutkimusprototyypin suuntaa-antavia tulosteita. Ne tukevat ihmisen harkintaa valmiusdokumentaatiossa; ne eivät sertifioi vaatimustenmukaisuutta, myy terminaaleja eivätkä korvaa ammattimaista yhteyssuunnittelua.",
    chainH2: "Näyttöketju",
    chainIntro:
      "Jokainen Signature seuraa samaa tutkimuspolkua. Ketju on eksplisiittinen, jotta operaattori näkee, miten ympäristö ja julkaistu tieto muuttuvat pisteytetyksi suositukseksi.",
    evidenceKindsH2: "Näyttötyypit",
    evidenceKindsP:
      "Sama chip-sanasto näkyy Signatureissa, Research-arvioissa, kartalla ja toimittajahakemistossa. Sama etiketti = sama merkitys kaikkialla.",
    chain: [
      {
        title: "1 · Toimintaympäristö",
        body: "Leveysaste, toimiala (metsä, meri, kaivos, …), autonomia ja kriittisyys määrittävät tehtäväkehyksen. Korkea-arktiset kohteet painottavat polaarikykyisiä polkuja enemmän kuin keski-Pohjoismaiden kohteet.",
      },
      {
        title: "2 · Relevantti tutkimus",
        body: "GRYPS Knowledge -muistiinpanot ja Research Library dokumentoivat korkeiden leveysasteiden rajoitteita (GEO-elevaation heikkeneminen, LEO-laajakaista vs polaarinen kapeakaista, redundanssi autonomiassa). Nämä ovat Model v0.3:een linjattuja toimituksellisia tutkimusartefakteja — eivät toimittajien white papereita.",
      },
      {
        title: "3 · Yhteyden ominaisuudet",
        body: "Dokumentoidut toimittajat ja rataluokat mapataan hakemistoluottamukseen sekä viitelatenssi-/geometriakaistoihin. Ominaisuudet kuvaavat mallinnettua asemaa, eivät mitattua RF:ää nastassa.",
      },
      {
        title: "4 · GRYPS-pisteytystekijät",
        body: "Deterministinen malli v0.3 summaa redundanssin, leveysasteen, toimintaprofiilin ja toimittajaluottamuksen, sitten soveltaa kovia kattoja. Tehtävän prioriteetit voivat järjestää suositukset uudelleen; ne eivät muuta Signature-pistettä.",
      },
      {
        title: "5 · Toimittajasuositus",
        body: "Rakenteinen suosituspaketti: kokonaissopivuus, luottamus, syyt, kompromissit, vaihtoehdot ja vertailukaistat — lähdeattribuutiolla Signaturessa.",
      },
    ],
    geometryCaption:
      "Mallinnettu polaarigeometria — leveyspiirit sekä LEO-, MEO- ja GEO-radat. Interaktiivinen korostus · animoidut ohitukset. Pisteytys perustuu deterministiseen malliin v0.3, ei reaaliaikaiseen RF-mittaukseen.",
    geometryHint:
      "Korosta rataluokkaa nähdäksesi, miten geometria vaikuttaa Signature-painotuksiin.",
    attributionH2: "Lähdeattribuutio ja datan tuoreus",
    attributionItems: [
      `Malli — GRYPS-deterministinen moottori (malli v0.3 / ${SCORING_ENGINE_DISPLAY}); piste/arvosana/riskit/sijoitukset toistettavissa samoilla syötteillä.`,
      "Hakemisto — kuratoitu toimittajahakemisto; luottamus = arvioinnin/dataperustan varmuus, ei saatavuus-%. Ei kaupallisia suhteita.",
      "Aineistot — EU-DEM (Copernicus/EEA OpenTopoDatan kautta) maastonäyttöön; Bittimittari (Traficom, CC BY 4.0) vain Suomen kuntasiemenille. Kumpaakaan ei sekoiteta 0–100 Signatureen.",
      "Tutkimus — GRYPS Knowledge -artikkelit ja Research Library -arviot; toimituksellinen tuoreus merkitty kunkin Signaturen näyttöpaneeliin.",
      "Viite — julkiset rataluokan latenssi-/geometriakäytännöt LEO / MEO / GEO -kommentointiin.",
    ],
    assumptionsH2: "Oletukset",
    assumptions: [
      "Selkeä taivasnäkymä ja oikea antenniasennus, ellei erillinen maastonäyttö toisin osoita.",
      "Toimittajahakemiston luottamus on tutkimusheuristiikka, ei mitattu kohteen saatavuus.",
      "Valinnainen kielimalliteksti voi viimeistellä vain suosituskappaleen — ei koskaan lukuja tai sijoituksia.",
      "Koordinaatit tulkitaan Pohjoismaiden / arktisen alueen / Islannin tutkimuskehyksessä.",
    ],
    limitationsH2: "Rajoitteet",
    limitations: [
      "Ei korvaa paikan päällä tehtävää RF- tai taivasnäkymämittausta.",
      "Ei reaaliaikaista konstellaatiotelemetriaa, häiriösyötteitä eikä kattavuus-SLA:ta.",
      "Ei vakuutusta, sertifiointia, hankintaneuvontaa eikä oikeudellista neuvontaa (mukaan lukien NIS2/CER).",
      "Ei myynnissä — ei yritystä, ei tuloja; vain tutkimusdemonstraatio.",
    ],
    confidenceH2: "Luottamus",
    confidenceP:
      "Näyttöpaneelin arviointiluottamus kuvaa luottamusta arvioinnin/dataperustaan (hakemistosopivuus, dokumentoidut polut, leveysasterajoitteet). Se ei ole palvelun saatavuuden todennäköisyys eikä SLA.",
    formulaH2: `Deterministinen malli v0.3 (${SCORING_ENGINE_DISPLAY})`,
    formulaP1:
      "Resilience-piste on deterministinen ja toistettavissa samoilla syötteillä (deterministinen malli v0.3). Valinnainen kielimalliteksti voi hioa vain suosituskappaleen — se ei koskaan muuta pistettä, arvosanaa, riskejä tai toimittajasuosituksia.",
    formulaP2: "Piste = neljän komponentin summa (sen jälkeen kovat katot, rajattu 0–100):",
    components: [
      {
        title: "Redundanssi (0–30)",
        body: "0 toimittajaa → 0; 1 → 8; 2 → 22 (+6 jos itsenäiset radat / LEO broadband+narrowband); ≥3 → 28.",
      },
      {
        title: "Leveysaste (0–20)",
        body: "≤60°N → 20; ≤65 → 16; ≤70 → 12; >70 → 8. Metsäkohteet alle 300 m korkeudessa: −4 (latvus/maasto).",
      },
      {
        title: "Toimintaprofiili (0–15)",
        body: "manuaalinen 15 · etäohjattu 11 · yhdistelmä 8 · autonominen 5.",
      },
      {
        title: "Toimittajaluottamus (0–30)",
        body: "hakemiston keskimääräinen luottamus × 0.30. GEO-toimittajat yli 70°N käyttävät heikennettyä luottamusta. Luottamus kuvaa arvioinnin/dataperustan varmuutta — ei palvelun saatavuustakuuta.",
      },
    ],
    gradesH2: "Arvosanat",
    gradesP: `${GRADE_BANDS_SUMMARY} (spesifikaation E näkyy käyttöliittymässä F:nä).`,
    capsH2: "Kovat katot",
    capsItems: [
      "Turvallisuuskriittinen + autonominen + alle 2 toimittajaa → piste katkaistaan 50:een.",
      "Turvallisuuskriittinen + tasan 1 toimittaja → katkaistaan 60:een.",
      "Leveysaste yli 72°N ja vain GEO-toimittajat → katkaistaan 45:een.",
    ],
    capsNote:
      "Katot on pakotettu deterministiseen moottoriin (ja tarkistetaan uudelleen koodissa), jotta reunademot eivät voi kiertää etusivun väitteitä.",
    risksH2: "Riskitekijät ja toimittajasuositukset",
    risksP:
      "Enintään neljä riskitekijää johdetaan redundanssista, leveysasteesta ja GEO:sta, toimialasta, autonomiasta sekä pisteestä suhteessa turvallisuuskynnykseen. Nykyiseen kokoonpanoon kuulumattomat varatoimittajat järjestetään luottamuksen mukaan, josta vähennetään leveysaste- ja ratapeittorangaistukset, sekä valinnaiset tehtäväprioriteettibonukset. GRYPS:llä ei ole kaupallista suhdetta listattuihin toimittajiin.",
    twoScoresH2: "Kaksi pistettä, ei yhtä sekoitusta",
    twoScoresP:
      "Resilience-piste on yllä oleva deterministinen Signature. EU-DEM-maastorangaistus OpenTopoDatan kautta on deterministinen ja näytetään erikseen. Suomen Bittimittari-nopeus ja -viive koskevat vain esitäytettyjä kuntakohteita — eivät vapaasti syötettyjä koordinaatteja.",
    versionH2: "Versiointi (seuranta myöhemmin)",
    versionP: `Jokainen Signature sisältää issuedAt-, modelVersion- (${MODEL_VERSION}) ja inputHash-kentät. Seuranta on sama moottori hetkillä T1 ja T2 — ei erillinen tuote. Reaaliaikaisia ajautumahälytyksiä ei ole vielä rakennettu; etusivun ajautumaliukusäädin on vain havainnollistus.`,
    researchLink: "Research Library",
    mapLink: "Tutki karttaa",
    scenariosLink: "Tehtäväskenaariot",
    workspaceLink: "Arviot",
    dataSourcesLink: "Datalähteet",
    assumptionsLink: "Oletukset",
    limitationsLink: "Rajoitteet",
    changelogLink: "Muutosloki",
    knowledgeLink: "Näyttö",
    providersLink: "Toimittajahakemisto",
    advisorLink: "Luo Resilience Signature",
  },
} as const;

function MethodologyArticle({ lang }: { lang: DocLang }) {
  const t = COPY[lang];
  return (
    <article style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px 0" }}>
      <ResearchDocsNav lang={lang} active="methodology" />
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
        }}
      >
        {t.eyebrow}
      </p>
      <h1
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 36,
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.02em",
          margin: "16px 0 20px",
          maxWidth: 720,
        }}
      >
        {t.h1}
      </h1>
      <p
        className="gryps-hero-sub"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 16,
          color: "var(--text-muted)",
          lineHeight: 1.75,
          marginBottom: 12,
          maxWidth: 720,
        }}
      >
        {t.intro}
      </p>
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 11,
          color: "var(--text-dim)",
          marginBottom: 16,
          lineHeight: 1.55,
        }}
      >
        {t.versionNote}
      </p>
      <PrototypeDisclaimerBanner lang={lang} />

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
        <h2 style={h2}>{t.postureH2}</h2>
        <p style={p}>{t.postureP}</p>

        <h2 style={h2}>{t.chainH2}</h2>
        <p style={p}>{t.chainIntro}</p>
        <ol style={{ ...ul, listStyle: "none", paddingLeft: 0 }}>
          {t.chain.map((step) => (
            <li key={step.title} style={{ marginBottom: 16, paddingLeft: 0 }}>
              <strong style={{ color: "var(--text)" }}>{step.title}</strong>
              <p style={{ ...p, marginTop: 6, marginBottom: 0 }}>{step.body}</p>
            </li>
          ))}
        </ol>

        <h2 style={h2}>{t.evidenceKindsH2}</h2>
        <p style={p}>{t.evidenceKindsP}</p>
        <div style={{ marginBottom: 28 }}>
          <EvidenceKindLegend />
        </div>

        <h2 style={h2}>{t.attributionH2}</h2>
        <ul style={ul}>
          {t.attributionItems.map((item) => (
            <li key={item.slice(0, 40)}>{item}</li>
          ))}
        </ul>

        <h2 style={h2}>{t.assumptionsH2}</h2>
        <ul style={ul}>
          {t.assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 style={h2}>{t.limitationsH2}</h2>
        <ul style={ul}>
          {t.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 style={h2}>{t.confidenceH2}</h2>
        <p style={p}>{t.confidenceP}</p>

        <h2 style={h2}>{t.formulaH2}</h2>
        <p style={p}>{t.formulaP1}</p>
        <p style={p}>{t.formulaP2}</p>
        <ul style={ul}>
          {t.components.map((c) => (
            <li key={c.title}>
              <strong>{c.title}</strong> — {c.body}
            </li>
          ))}
        </ul>

        <h2 style={h2}>{t.gradesH2}</h2>
        <p style={p}>{t.gradesP}</p>

        <h2 style={h2}>{t.capsH2}</h2>
        <ul style={ul}>
          {t.capsItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p style={p}>{t.capsNote}</p>

        <h2 style={h2}>{t.risksH2}</h2>
        <p style={p}>{t.risksP}</p>

        <h2 style={h2}>{t.twoScoresH2}</h2>
        <p style={p}>{t.twoScoresP}</p>

        <h2 style={h2}>{t.versionH2}</h2>
        <p style={p}>{t.versionP}</p>

        <p style={{ ...p, marginTop: 40 }}>
          <Link href="/research" style={{ color: "var(--accent-blue)" }}>
            {t.researchLink}
          </Link>
          {" · "}
          <Link href="/map" style={{ color: "var(--accent-blue)" }}>
            {t.mapLink}
          </Link>
          {" · "}
          <Link href="/data-sources" style={{ color: "var(--accent-blue)" }}>
            {t.dataSourcesLink}
          </Link>
          {" · "}
          <Link href="/assumptions" style={{ color: "var(--accent-blue)" }}>
            {t.assumptionsLink}
          </Link>
          {" · "}
          <Link href="/limitations" style={{ color: "var(--accent-blue)" }}>
            {t.limitationsLink}
          </Link>
          {" · "}
          <Link href="/changelog" style={{ color: "var(--accent-blue)" }}>
            {t.changelogLink}
          </Link>
          {" · "}
          <Link href="/scenarios" style={{ color: "var(--accent-blue)" }}>
            {t.scenariosLink}
          </Link>
          {" · "}
          <Link href="/workspace" style={{ color: "var(--accent-blue)" }}>
            {t.workspaceLink}
          </Link>
          {" · "}
          <Link href="/knowledge" style={{ color: "var(--accent-blue)" }}>
            {t.knowledgeLink}
          </Link>
          {" · "}
          <Link href="/providers" style={{ color: "var(--accent-blue)" }}>
            {t.providersLink}
          </Link>
          {" · "}
          <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>
            {t.advisorLink}
          </Link>
        </p>
      </div>
    </article>
  );
}

export function MethodologyView() {
  return <DocShell>{(lang) => <MethodologyArticle lang={lang} />}</DocShell>;
}

const h2: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text)",
  margin: "28px 0 10px",
};
const p: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  marginBottom: 12,
};
const ul: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  paddingLeft: 20,
  marginBottom: 12,
};

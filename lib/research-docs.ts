/**
 * Prototype Research Quality — shared documentation for credibility,
 * provenance, versioning, and explicit limitations.
 */

import {
  MODEL_VERSION,
  SCORING_ENGINE,
  METHODOLOGY_VERSION,
  METHODOLOGY_LABEL,
} from "@/lib/model-constants"

export { METHODOLOGY_VERSION, METHODOLOGY_LABEL }

export const METHODOLOGY_RELEASED = "2026-09-11"

export const PROTOTYPE_DISCLAIMER_EN =
  "GRYPS is an experimental research prototype. Results are indicative and should not be interpreted as commercial procurement, coverage certification or engineering advice."

export const PROTOTYPE_DISCLAIMER_FI =
  "GRYPS on kokeellinen tutkimusprototyyppi. Tulokset ovat suuntaa-antavia, eikä niitä tule tulkita kaupallisena hankintana, kattavuussertifiointina tai teknisena neuvontana."

export type ResearchDocId =
  | "methodology"
  | "research"
  | "data-sources"
  | "assumptions"
  | "limitations"
  | "changelog"

export const RESEARCH_DOC_NAV: {
  id: ResearchDocId
  href: string
  en: string
  fi: string
}[] = [
  { id: "methodology", href: "/methodology", en: "Methodology", fi: "Menetelmä" },
  { id: "research", href: "/research", en: "Research Library", fi: "Research Library" },
  { id: "data-sources", href: "/data-sources", en: "Data sources", fi: "Datalähteet" },
  { id: "assumptions", href: "/assumptions", en: "Assumptions", fi: "Oletukset" },
  { id: "limitations", href: "/limitations", en: "Limitations", fi: "Rajoitteet" },
  { id: "changelog", href: "/changelog", en: "Changelog", fi: "Muutosloki" },
]

export type DataProvenanceRecord = {
  id: string
  name: string
  nameFi: string
  source: string
  sourceFi: string
  dateAccessed: string
  dataType: string
  dataTypeFi: string
  howUsed: string
  howUsedFi: string
  url?: string
  license?: string
}

/** Important datasets and references with provenance fields. */
export const DATA_PROVENANCE: DataProvenanceRecord[] = [
  {
    id: "model-v03",
    name: "Deterministic Signature engine",
    nameFi: "Deterministinen Signature-moottori",
    source: "GRYPS R&D — Model v0.3 scoring rules (redundancy, latitude, operational profile, provider confidence, hard caps)",
    sourceFi: "GRYPS T&K — mallin v0.3 pisteytyssäännöt (redundanssi, leveysaste, toimintaprofiili, toimittajaluottamus, kovat katot)",
    dateAccessed: "2026-09-11",
    dataType: "Internal research model / reproducible algorithm",
    dataTypeFi: "Sisäinen tutkimusmalli / toistettava algoritmi",
    howUsed: "Produces the 0–100 Resilience Signature, grade, risks, and ranked options. Optional Mistral prose never changes these numbers.",
    howUsedFi: "Tuottaa 0–100 Resilience Signaturen, arvosanan, riskit ja sijoitetut vaihtoehdot. Valinnainen Mistral-proosa ei koskaan muuta näitä lukuja.",
    url: "/methodology",
  },
  {
    id: "provider-catalog",
    name: "Provider index (catalog confidence)",
    nameFi: "Toimittajahakemisto (hakemistoluottamus)",
    source: "GRYPS curated public-knowledge index — no commercial relationships with listed operators",
    sourceFi: "GRYPS:n kuratoima julkisen tiedon hakemisto — ei kaupallisia suhteita listattuihin operaattoreihin",
    dateAccessed: "2026-09-11",
    dataType: "Editorial catalog / research heuristic",
    dataTypeFi: "Toimituksellinen hakemisto / tutkimusheuristiikka",
    howUsed: "Supplies orbital class and catalog confidence for provider confidence scoring and recommendation ranking. Confidence = assessment/data basis, not availability %.",
    howUsedFi: "Antaa rataluokan ja hakemistoluottamuksen toimittajaluottamuksen pisteytykseen ja suositusjärjestykseen. Luottamus = arvioinnin/dataperusta, ei saatavuus-%.",
    url: "/providers",
  },
  {
    id: "eu-dem",
    name: "EU-DEM terrain elevation",
    nameFi: "EU-DEM maaston korkeus",
    source: "Copernicus / EEA EU-DEM via OpenTopoData — EU-funded Copernicus data and information",
    sourceFi: "Copernicus / EEA EU-DEM OpenTopoDatan kautta — EU:n rahoittama Copernicus-data",
    dateAccessed: "2026-09 (on-demand per assessment)",
    dataType: "Digital elevation model (~25 m)",
    dataTypeFi: "Digitaalinen korkeusmalli (~25 m)",
    howUsed: "Shown as separate terrain evidence (elevation / variance). Not blended into the 0–100 Signature score.",
    howUsedFi: "Näytetään erillisenä maastonäyttönä (korkeus / vaihtelu). Ei sekoiteta 0–100 Signature-pisteeseen.",
    license: "Copernicus / EEA terms",
  },
  {
    id: "bittimittari",
    name: "Bittimittari broadband measurements",
    nameFi: "Bittimittari-laajakaistamittaukset",
    source: "Traficom (Finland) Bittimittari municipality aggregates",
    sourceFi: "Traficom (Suomi) Bittimittari-kunta-aggregaatit",
    dateAccessed: "2026 — seeded Finnish municipality sites",
    dataType: "Public measurement aggregates (download / latency)",
    dataTypeFi: "Julkiset mittausaggregaatit (lataus / latenssi)",
    howUsed: "Reference evidence for Finnish seeded sites only. Not applied to ad-hoc Nordic coordinates; not blended into the Signature score.",
    howUsedFi: "Viitenäyttö vain Suomen siemenkohteille. Ei sovelleta vapaisiin pohjoismaisiin koordinaatteihin; ei sekoiteta Signature-pisteeseen.",
    license: "CC BY 4.0",
  },
  {
    id: "orbital-reference",
    name: "Orbital-class latency & geometry",
    nameFi: "Rataluokan latenssi ja geometria",
    source: "Public industry / orbital-mechanics conventions (LEO / MEO / GEO design-class bands)",
    sourceFi: "Julkiset toimiala- / kiertoratamekaniikan käytännöt (LEO / MEO / GEO -suunnitteluluokan kaistat)",
    dateAccessed: "2026-09-11",
    dataType: "Static reference commentary",
    dataTypeFi: "Staattinen viitekommentti",
    howUsed: "Labels typical latency and elevation characteristics on options. Not site measurements or provider SLAs.",
    howUsedFi: "Merkitsee tyypilliset latenssi- ja elevaatio-ominaisuudet vaihtoehdoille. Ei kohdemittauksia eikä toimittajan SLA:ita.",
    url: "/knowledge/leo-vs-meo-vs-geo-remote-operations",
  },
  {
    id: "research-library",
    name: "Research Library assessments",
    nameFi: "Research Library -arviot",
    source: "GRYPS curated Connectivity Intelligence assessments (examples + seed sites)",
    sourceFi: "GRYPS:n kuratoimat Connectivity Intelligence -arviot (esimerkit + siemenkohteet)",
    dateAccessed: "2026-09-11",
    dataType: "Illustrative research scenarios with real coordinates",
    dataTypeFi: "Havainnollistavia tutkimusskenaarioita todellisilla koordinaateilla",
    howUsed: "Public research portfolio. Same Model v0.3 engine as the Advisor — not customer cases or live RF monitoring.",
    howUsedFi: "Julkinen tutkimusportfolio. Sama malli v0.3 kuin Advisorissa — ei asiakastarinoita eikä live-RF-seurantaa.",
    url: "/research",
  },
]

export type AssumptionItem = { en: string; fi: string }

export const RESEARCH_ASSUMPTIONS: AssumptionItem[] = [
  {
    en: "Clear sky-view and correct antenna installation are assumed unless contradicted by separate terrain evidence.",
    fi: "Selkeä taivasnäkymä ja oikea antenniasennus oletetaan, ellei erillinen maastonäyttö toisin osoita.",
  },
  {
    en: "Provider catalog confidence is a research heuristic, not a measured site availability rate or SLA.",
    fi: "Toimittajahakemiston luottamus on tutkimusheuristiikka, ei mitattu kohteen saatavuus tai SLA.",
  },
  {
    en: "Coordinates are interpreted inside the Nordic / Arctic / Iceland research envelope (approximately lat 55–85°, lng −30–40°).",
    fi: "Koordinaatit tulkitaan Pohjoismaiden / arktisen alueen / Islannin tutkimuskehyksessä (noin lat 55–85°, lng −30–40°).",
  },
  {
    en: "Mission priorities re-rank recommendations only; they do not change the Signature score.",
    fi: "Tehtävän prioriteetit järjestävät vain suositukset uudelleen; ne eivät muuta Signature-pistettä.",
  },
  {
    en: "Optional language-model text may polish the recommendation paragraph only — never score, grade, risks, or ranks.",
    fi: "Valinnainen kielimalliteksti voi viimeistellä vain suosituskappaleen — ei koskaan pistettä, arvosanaa, riskejä tai sijoituksia.",
  },
  {
    en: "Orbital-class latency bands are design-class reference values, not live telemetry for a named site.",
    fi: "Rataluokan latenssikaistat ovat suunnitteluluokan viitearvoja, eivät live-telemetriaa nimetylle kohteelle.",
  },
  {
    en: "Research Library and mission scenarios are illustrative operating profiles, not customer projects or procurement dossiers.",
    fi: "Research Library ja tehtäväskenaariot ovat havainnollistavia toimintaprofiileja, eivät asiakasprojekteja tai hankinta-aineistoja.",
  },
]

export const RESEARCH_LIMITATIONS: AssumptionItem[] = [
  {
    en: PROTOTYPE_DISCLAIMER_EN,
    fi: PROTOTYPE_DISCLAIMER_FI,
  },
  {
    en: "Not a substitute for an on-site RF / sky-view survey or professional connectivity engineering.",
    fi: "Ei korvaa paikan päällä tehtävää RF- tai taivasnäkymämittausta eikä ammattimaista yhteyssuunnittelua.",
  },
  {
    en: "Not live constellation telemetry, outage feeds, congestion simulation, or a coverage SLA.",
    fi: "Ei reaaliaikaista konstellaatiotelemetriaa, häiriösyötteitä, ruuhkasimulaatiota eikä kattavuus-SLA:ta.",
  },
  {
    en: "Not insurance, certification, legal advice (including NIS2/CER), or a commercial brokerage of terminals or airtime.",
    fi: "Ei vakuutusta, sertifiointia, oikeudellista neuvontaa (mukaan lukien NIS2/CER) eikä terminaalien tai airtimen kaupallista välitystä.",
  },
  {
    en: "EU-DEM terrain and Bittimittari (Finland) are shown separately and are not blended into the Signature score.",
    fi: "EU-DEM-maasto ja Bittimittari (Suomi) näytetään erikseen eikä sekoiteta Signature-pisteeseen.",
  },
  {
    en: "Research Workspace saves assessments in the local browser only — not a cloud customer account or CRM.",
    fi: "Research Workspace tallentaa arviot vain paikalliseen selaimeen — ei pilviasiakastiliä eikä CRM:ää.",
  },
  {
    en: "Non-commercial R&D: no company, no revenue, not for sale.",
    fi: "Ei-kaupallinen T&K: ei yritystä, ei tuloja, ei myynnissä.",
  },
]

export type ChangelogEntry = {
  version: string
  date: string
  title: string
  titleFi: string
  items: { en: string; fi: string }[]
  scoringEngine?: string
}

/** Methodology / prototype evolution — demonstrates how the research model advances. */
export const METHODOLOGY_CHANGELOG: ChangelogEntry[] = [
  {
    version: "v0.5",
    date: METHODOLOGY_RELEASED,
    title: "Portfolio / Demonstration Layer",
    titleFi: "Portfolio- / demonstraatiokerros",
    scoringEngine: SCORING_ENGINE,
    items: [
      {
        en: "Portfolio case study: problem, research question, approach, live prototype links, learnings, and explicit non-production limits.",
        fi: "Portfoliocase study: ongelma, tutkimuskysymys, lähestymistapa, live-prototyyppilinkit, opit ja eksplisiittiset ei-tuotantorajat.",
      },
      {
        en: "Demonstration framing for AI / digital solutions / automation / business-analyst roles — not monetization.",
        fi: "Demonstraatiokehys AI- / digiratkaisu- / automaatio- / business analyst -rooleihin — ei kaupallistamista.",
      },
    ],
  },
  {
    version: "v0.4",
    date: METHODOLOGY_RELEASED,
    title: "Prototype Research Quality",
    titleFi: "Prototyypin tutkimuksen laatu",
    scoringEngine: SCORING_ENGINE,
    items: [
      {
        en: "Formal research documentation set: methodology, data sources, assumptions, limitations, changelog.",
        fi: "Muodollinen tutkimusdokumentaatio: menetelmä, datalähteet, oletukset, rajoitteet, muutosloki.",
      },
      {
        en: "Data provenance records (source, date accessed, type, how GRYPS uses it).",
        fi: "Datan alkuperätietueet (lähde, käyttöönottopäivä, tyyppi, miten GRYPS käyttää).",
      },
      {
        en: "Explicit prototype disclaimer: indicative research — not procurement, certification, or engineering advice.",
        fi: "Eksplisiittinen prototyyppivaroitus: suuntaa-antava tutkimus — ei hankinta, sertifiointi tai tekninen neuvonta.",
      },
      {
        en: "Research Workspace, mission scenarios, and evidence chain remain non-commercial analytical surfaces.",
        fi: "Research Workspace, tehtäväskenaariot ja näyttöketju pysyvät ei-kaupallisina analyyttisinä pintoina.",
      },
    ],
  },
  {
    version: "v0.3",
    date: "2026-Q1–Q3",
    title: "Deterministic Signature + Advisor Intelligence",
    titleFi: "Deterministinen Signature + Advisor-äly",
    scoringEngine: SCORING_ENGINE,
    items: [
      {
        en: `Scoring engine ${SCORING_ENGINE} / ${MODEL_VERSION}: redundancy, latitude, operational profile, provider confidence, hard caps.`,
        fi: `Pisteytysmoottori ${SCORING_ENGINE} / ${MODEL_VERSION}: redundanssi, leveysaste, toimintaprofiili, toimittajaluottamus, kovat katot.`,
      },
      {
        en: "Advisor Intelligence: recommendation package, score explanations, mission priorities, provider comparison.",
        fi: "Advisor-äly: suosituspaketti, pisteiden selitykset, tehtävän prioriteetit, toimittajavertailu.",
      },
      {
        en: "Evidence chain: environment → research → characteristics → scoring → recommendation.",
        fi: "Näyttöketju: ympäristö → tutkimus → ominaisuudet → pisteytys → suositus.",
      },
      {
        en: "Research Library, Connectivity Intelligence map, mission scenarios, local Research Workspace.",
        fi: "Research Library, Connectivity Intelligence -kartta, tehtäväskenaariot, paikallinen Research Workspace.",
      },
    ],
  },
  {
    version: "v0.2",
    date: "2025–2026",
    title: "Assessment-first product language",
    titleFi: "Arviointi ensin -tuotekieli",
    items: [
      {
        en: "Canonical CTA: Generate Resilience Signature; confidence ≠ availability; claim hygiene.",
        fi: "Kanoninen CTA: Luo Resilience Signature; luottamus ≠ saatavuus; väitehygienia.",
      },
      {
        en: "MapLibre ops console, provider index, knowledge notes, Advisor funnel (abbreviated → unlock).",
        fi: "MapLibre-ops-konsoli, toimittajahakemisto, tietomuistiinpanot, Advisor-suppilo (lyhennetty → avaus).",
      },
    ],
  },
  {
    version: "v0.1",
    date: "2025",
    title: "Initial research prototype",
    titleFi: "Ensimmäinen tutkimusprototyyppi",
    items: [
      {
        en: "First Nordic/Arctic connectivity resilience scoring explorations and non-commercial R&D posture.",
        fi: "Ensimmäiset Pohjoismaiden/arktisen yhteysresilienssin pisteytyskokeilut ja ei-kaupallinen T&K-asema.",
      },
    ],
  },
]

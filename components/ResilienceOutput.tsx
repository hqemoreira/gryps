"use client";
import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, AlertTriangle, AlertCircle, ShieldCheck, Download } from "lucide-react";
import {
  gradeColor,
  gradeTextColor,
  type AdvisoryResult,
  type AssessmentInputs,
  type ScoreComposition,
} from "@/lib/resilience-colors";
import type {
  AdvisorIntelligence,
  ComparisonRow,
  ScoreExplanation,
} from "@/lib/advisor-intelligence";
import type { EvidencePackage } from "@/lib/evidence-model";
import { PRIORITY_LABELS, type AdvisorPriorityId } from "@/lib/advisor-priorities";
import { computeComplianceFlags } from "@/lib/compliance";
import { redundancyTiers } from "@/lib/redundancy-tiers";
import { MODEL_VERSION } from "@/lib/signature-meta";
import {
  GRADE_BANDS_SUMMARY,
  RECOMMENDATION_AI_LABEL,
  SCORING_ENGINE,
  SCORING_MODEL_LABEL,
} from "@/lib/model-constants";
import { SaveToWorkspace } from "@/components/SaveToWorkspace";
import { TypeLabel } from "@/components/TypeLabel";
import { IntelligenceDrawer } from "@/components/IntelligenceDrawer";
import { NextStepsLinks } from "@/components/NextStepsLinks";

// Re-exported as TYPES only (types are erased at compile time, no client-boundary
// issue). Do NOT re-export gradeColor/gradeTextColor themselves here — a Server
// Component importing them from this "use client" file would hit the same
// "call a client function from the server" build error. Import those two
// directly from @/lib/resilience-colors instead.
export type { AdvisoryResult, AssessmentInputs };

const SEV_COLOR: Record<string, string> = {
  low: "var(--accent-green)",
  medium: "var(--accent-amber)",
  high: "var(--accent-amber)",
  critical: "var(--accent-red)",
};

// Vivid, theme-independent — same pattern as gradeColor(), needed for alpha-blended
// tint backgrounds/borders (string-concatenated hex+alpha), which can't be built
// from a CSS var since its resolved value isn't known at string-concat time.
const SEV_COLOR_VIVID: Record<string, string> = {
  low: "#2ED47A",
  medium: "#D97706",
  high: "#D97706",
  critical: "#EF4444",
};

const SEV_ICON: Record<string, typeof ShieldAlert> = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: AlertCircle,
  low: ShieldCheck,
};

// General, publicly-known orbital-class characteristics — deliberately static,
// not model-generated. These are physics/industry-convention reference notes
// about a class of system — not measurements, SLAs, or commitments for any
// named provider. Always shown under "Model commentary / reference".
type OrbitalCharacteristics = { latency: string; reliability: string; hardware: string };

const GEO_CHARS: OrbitalCharacteristics = {
  latency:
    "~500–700 ms round-trip — typical published range for geostationary orbit (~35,800 km); not a site measurement",
  reliability:
    "GEO services are typically designed for continuous coverage within the visible equatorial arc — design intent, not a GRYPS-measured availability rate",
  hardware:
    "Fixed, precisely-aimed dish antenna with clear line-of-sight to the equatorial arc; higher power draw",
};

const POLAR_NARROWBAND_CHARS: OrbitalCharacteristics = {
  latency:
    "~150–300 ms round-trip — typical published range for polar-orbit narrowband; not a site measurement",
  reliability:
    "Polar-orbit narrowband systems are typically designed for high-latitude reach with modest throughput — design intent, not a GRYPS-measured availability rate",
  hardware:
    "Small omnidirectional or low-profile fixed antenna, modest power requirements, no steerable/tracking hardware needed",
};

const LEO_BROADBAND_CHARS: OrbitalCharacteristics = {
  latency:
    "~20–50 ms round-trip — typical published range for broadband LEO (~340–1,200 km); not a site measurement",
  reliability:
    "Broadband LEO systems typically rely on multi-satellite handoff for path continuity — design intent, not a GRYPS-measured availability rate",
  hardware:
    "Compact, often self-orienting phased-array antenna requiring a clear view of the sky; moderate power requirements",
};

const MEO_CHARS: OrbitalCharacteristics = {
  latency:
    "~100–150 ms round-trip — typical published range for medium Earth orbit; not a site measurement",
  reliability:
    "MEO systems are typically positioned between GEO and LEO on latency vs coverage trade-offs — design intent, not a GRYPS-measured availability rate",
  hardware:
    "Steerable/tracking antenna required given the moving orbital path; larger aperture than typical LEO terminals",
};

// Provider-name -> orbital class, for well-known REAL providers whose actual
// architecture is publicly documented and unambiguous. Checked BEFORE the
// type-string fallback below, since Mistral's self-reported "type" field has
// no enum constraint (lib/scoring.ts) and was observed to drift for the same
// provider across queries (Inmarsat labeled GEO in one run, LEO in another,
// within the same session) -- real-world provider identity is the more
// reliable signal we actually have. Substring-matched, lowercase.
const PROVIDER_ORBITAL_CLASS: { match: string; chars: OrbitalCharacteristics }[] = [
  // Geostationary
  { match: "inmarsat", chars: GEO_CHARS },
  { match: "viasat", chars: GEO_CHARS },
  { match: "ses", chars: GEO_CHARS },
  { match: "eutelsat", chars: GEO_CHARS },
  { match: "hughes", chars: GEO_CHARS },
  { match: "intelsat", chars: GEO_CHARS },
  { match: "yahsat", chars: GEO_CHARS },
  { match: "thuraya", chars: GEO_CHARS },
  // Broadband LEO
  { match: "starlink", chars: LEO_BROADBAND_CHARS },
  { match: "oneweb", chars: LEO_BROADBAND_CHARS },
  { match: "telesat", chars: LEO_BROADBAND_CHARS },
  { match: "kuiper", chars: LEO_BROADBAND_CHARS },
  // Polar-orbit narrowband
  { match: "iridium", chars: POLAR_NARROWBAND_CHARS },
  { match: "certus", chars: POLAR_NARROWBAND_CHARS },
  { match: "globalstar", chars: POLAR_NARROWBAND_CHARS },
];

function getOrbitalCharacteristics(type: string, provider: string): OrbitalCharacteristics | null {
  const p = provider.toLowerCase();

  // 1. Known real provider name — trust this over whatever the model self-reports.
  const known = PROVIDER_ORBITAL_CLASS.find((entry) => p.includes(entry.match));
  if (known) return known.chars;

  // 2. Unrecognized provider name (synthetic/generic, e.g. seed-data placeholders,
  //    or a real provider not yet in the table) — fall back to the type string.
  const t = type.toLowerCase();
  if (t.includes("geo") && !t.includes("polar")) return GEO_CHARS;
  if (t.includes("polar")) return POLAR_NARROWBAND_CHARS;
  if (t.includes("leo")) return LEO_BROADBAND_CHARS;
  if (t.includes("meo")) return MEO_CHARS;
  return null; // terrestrial/fiber/microwave options — no orbital class applies
}

type UiLang = "en" | "fi";

const UI = {
  en: {
    downloadPdf: "Download PDF",
    resilienceScore: "RESILIENCE SCORE",
    resilienceSignature: "RESILIENCE SIGNATURE",
    modelGenerated: `${SCORING_MODEL_LABEL} — illustrative research output, not a coverage guarantee`,
    scoreAuthority: SCORING_MODEL_LABEL,
    recommendationAuthority: RECOMMENDATION_AI_LABEL,
    assessmentInputs: "ASSESSMENT INPUTS",
    assessmentSub: "The deterministic parameters provided for this scoring run.",
    coordinates: "COORDINATES",
    sector: "SECTOR",
    autonomy: "AUTONOMY LEVEL",
    criticality: "CRITICALITY",
    currentSetup: "CURRENT SETUP",
    notSpecified: "Not specified",
    stricter: "stricter threshold applied",
    realData: "REFERENCE DATA",
    realDataSub:
      "Source-backed third-party datasets — not AI-generated, not blended into the Resilience Score above.",
    realWorldGap: "Real-world gap (55%)",
    terrainPenalty: "Terrain penalty (45%)",
    bittiNA: "Not available — Bittimittari (Traficom) covers Finland only",
    demNA: "Not available — EU-DEM has a data gap at this location (likely open water).",
    sources:
      "Real-world speed: Bittimittari (Traficom), licensed under CC BY 4.0 · Terrain: Produced using Copernicus data and information funded by the European Union — EU-DEM layers.",
    complianceLabel: "NIS2/CER COMPLIANCE FLAGS",
    complianceNis2: "NIS2 Art. 21 — Network and information system security measures",
    complianceCer: "CER — Critical entity resilience assessment",
    compliancePass: "ADDRESSED",
    complianceFail: "AT RISK",
    complianceNote:
      "Compliance flags are indicative, based on the scoring model's assessment of connectivity resilience posture. They do not constitute legal or regulatory advice. A Signature supports readiness documentation — it is not certification.",
    recommendation: "RECOMMENDATION",
    recommendationNote:
      "AI-assisted interpretation of the deterministic assessment (optional prose polish). Does not change score, grade, risks, or ranked providers. Not live network performance or a provider SLA.",
    intelligenceLabel: "ADVISOR RECOMMENDATION",
    intelligenceSub:
      "Structured decision support — top fit, confidence, trade-offs, and alternatives for this mission.",
    primaryReason: "Primary reason",
    secondaryReasons: "Also consider",
    tradeOffs: "Key trade-offs",
    bestIf: "Best if…",
    considerIf: "Consider {provider} if",
    confidenceLevel: "Confidence",
    topProviders: "Top providers",
    comparisonLabel: "PROVIDER COMPARISON",
    comparisonSub: "Concise model bands for the top ranked options — not live RF measurements.",
    colCoverage: "Coverage",
    colLatency: "Latency",
    colResilience: "Resilience",
    colHardware: "Hardware",
    colBestFor: "Best for",
    bandHigh: "High",
    bandMedium: "Medium",
    bandLow: "Low",
    hardwareNote: "Hardware band: High = more complex / demanding; Low = simpler kit.",
    prioritiesApplied: "Mission priorities",
    scoreExplainLabel: "SCORE EXPLAINED",
    scoreExplainSub: "Each major component, with transparent model commentary.",
    overallResilience: "Resilience",
    evidenceLabel: "EVIDENCE CHAIN",
    evidenceSub: "Research → data → scoring → recommendation. Attribution for this Signature.",
    evidenceTheme: "Environment",
    evidenceConfidence: "Assessment confidence",
    evidenceFreshness: "Data freshness",
    evidenceAssumptions: "Assumptions",
    evidenceLimitations: "Limitations",
    evidenceSources: "Sources & attribution",
    evidenceResearch: "Research references",
    evidenceMethod: "Methodology",
    evidenceIndicative:
      "Indicative research intelligence — not procurement advice or a site survey.",
    scoreComposition: "HOW THIS SCORE WAS COMPUTED",
    scoreCompositionSub:
      "Model v0.3 component breakdown before hard caps. Full formula on the methodology page.",
    scoreRawSum: "Raw sum",
    scoreFinal: "Final score",
    scoreCaps: "Hard caps applied",
    scoreNoCaps: "No hard caps applied",
    methodologyLink: "Full scoring methodology →",
    componentRedundancy: "Redundancy",
    componentLatitude: "Latitude",
    componentProfile: "Operational profile",
    componentConfidence: "Provider confidence",
    riskFactors: "RISK FACTORS",
    redundancyGaps: "REDUNDANCY GAPS",
    scoreImpact: "↓ SCORE IMPACT",
    connectivityOptions: "CONNECTIVITY OPTIONS",
    confidence: "ASSESSMENT CONFIDENCE",
    confidenceClarify:
      "Confidence reflects confidence in the assessment/data basis, not guaranteed service availability.",
    latency: "LATENCY (REFERENCE) ",
    reliability: "RELIABILITY (MODEL COMMENTARY) ",
    hardware: "HARDWARE ",
    orbitalDisclaimer:
      "Orbital-class notes are reference / model commentary based on publicly available industry information — not official provider specifications, measured site performance, SLAs, or an endorsement. GRYPS has no commercial relationship with the providers listed.",
    provenanceLabel: "PROVENANCE",
    provenanceScoringModel: "Resilience Score",
    provenanceScoringModelValue: `${SCORING_MODEL_LABEL} (${SCORING_ENGINE}) — reproducible score, grade, risks, and ranks`,
    provenanceCommentary: "Recommendation text",
    provenanceCommentaryValue: `${RECOMMENDATION_AI_LABEL} — optional prose polish; never changes numbers. Not live telemetry or a provider commitment`,
    provenanceRealDataSources: "Reference data",
    provenanceBittimittari:
      "Bittimittari (Traficom, Finland) — municipality-level broadband speed/latency, CC BY 4.0",
    provenanceEuDem:
      "EU-DEM (Copernicus/EEA) — 25m resolution elevation data, accessed via OpenTopoData",
    provenanceDate: "Assessment date",
    provenanceModelVersion: "Model version",
    provenanceInputHash: "Input hash",
    provenanceNotLive: "Illustrative / not live constellation data",
    provenanceConfidence: "Confidence",
    provenanceConfidenceValue:
      "Assessment/data-basis confidence — not probability of service availability",
    terrainExplain:
      "Terrain score is independent of the Resilience Score: higher variance in a ~5 km EU-DEM sample reduces this evidence score. It is not blended into the 0–100 Signature.",
    shareLink: "Copy shareable link",
    shareCopied: "Link copied",
    tabOverview: "Overview",
    tabRisks: "Risks",
    tabOptions: "Options",
    tabEvidence: "Evidence",
    tabMethod: "Method",
    tabCompliance: "Compliance",
    whyBtn: "Why?",
    overviewStrongest: "Strongest factor",
    overviewGap: "Primary gap",
    overviewAction: "Recommended action",
    overviewRec: "Top recommendation",
    drawerCalc: "Calculation",
    drawerData: "Data basis",
    drawerResearch: "Research & method",
    evidenceNotesLink: "Evidence notes →",
    nextStepsLabel: "NEXT STEPS",
    saveWorkspace: "Save to Assessments",
    redundancyTiers: "REDUNDANCY OPTIONS (COST-TIERED)",
    tierEssential: "Essential",
    tierStandard: "Standard",
    tierDefense: "Defense-in-depth",
    whyConfidence: "WHY THIS RANKING",
    elevationField: "ELEVATION / SKY VIEW ",
    coverageField: "COVERAGE (MODEL) ",
    failoverField: "FAILOVER SWITCHING (MODEL) ",
    provenanceNote:
      `Resilience Score (${SCORING_MODEL_LABEL}): deterministic score, grade, risks, and ranks. Recommendation text (${RECOMMENDATION_AI_LABEL}): optional prose polish only. Reference data (EU-DEM / Bittimittari) is separate and not blended into the Signature score.`,
    aiBadgeTitle:
      `EU AI Act Art. 50 — ${RECOMMENDATION_AI_LABEL} (optional Mistral prose). Limited-risk system. Resilience Score is ${SCORING_MODEL_LABEL} — never AI-generated. Not a guarantee of network availability. Supports human judgement; no automated legal decisions.`,
    art50: "Art. 50 EU AI Act",
    generated: "Generated",
    printAttr: "GRYPS · Connectivity Intelligence · gryps.vercel.app",
    measured: "measured",
    medianDownload: "Mbit/s median download",
    medianLatency: "ms median latency",
    measurements: "measurements",
    elevation: "m elevation",
    variance: "m variance across a ~5km sample",
    noDataFor: "no data for",
  },
  fi: {
    downloadPdf: "Lataa PDF",
    resilienceScore: "RESILIENSSIPISTEET",
    resilienceSignature: "RESILIENCE SIGNATURE",
    modelGenerated:
      "Deterministinen malli v0.3 — havainnollistava tutkimustulos, ei kattavuustakuuta",
    scoreAuthority: "Deterministinen malli v0.3",
    recommendationAuthority: "Tekoälyavusteinen tulkinta",
    assessmentInputs: "ARVIOINNIN SYÖTTEET",
    assessmentSub: "Tämän pisteytysajon deterministiset parametrit.",
    coordinates: "KOORDINAATIT",
    sector: "TOIMIALA",
    autonomy: "AUTONOMIATASO",
    criticality: "KRIITTISYYS",
    currentSetup: "NYKYINEN KOKOONPANO",
    notSpecified: "Ei ilmoitettu",
    stricter: "tiukempi kynnys käytössä",
    realData: "VIITEDATA",
    realDataSub:
      "Lähteisiin perustuvat kolmannen osapuolen aineistot — ei tekoälyn tuottamia, eikä sekoitettu yllä olevaan Resilience-pisteeseen.",
    realWorldGap: "Todellinen kuilu (55 %)",
    terrainPenalty: "Maastorangaistus (45 %)",
    bittiNA: "Ei saatavilla — Bittimittari (Traficom) kattaa vain Suomen",
    demNA: "Ei saatavilla — EU-DEM:ssä on aukko tällä sijainnilla (todennäköisesti avovettä).",
    sources:
      "Todellinen nopeus: Bittimittari (Traficom), CC BY 4.0 · Maasto: Copernicus-data ja EU:n rahoittama tieto — EU-DEM-kerrokset.",
    complianceLabel: "NIS2/CER-VALMIUSLIPUT",
    complianceNis2: "NIS2 Art. 21 — Verkko- ja tietojärjestelmien turvatoimet",
    complianceCer: "CER — Kriittisten toimijoiden resilienssiarviointi",
    compliancePass: "KÄSITELTY",
    complianceFail: "RISKISSÄ",
    complianceNote:
      "Valmiusliput ovat suuntaa-antavia ja perustuvat pisteytysmallin arvioon yhteyden resilienssiasemasta. Ne eivät ole oikeudellista tai sääntelyneuvontaa. Signature tukee valmiusdokumentaatiota — se ei ole sertifiointi.",
    recommendation: "SUOSITUS",
    recommendationNote:
      "Tekoälyavusteinen tulkinta deterministisestä arviosta (valinnainen proosan viimeistely). Ei muuta pistettä, arvosanaa, riskejä eikä sijoituksia. Ei live-verkon mittaus eikä toimittajan SLA.",
    intelligenceLabel: "ADVISOR-SUOSITUS",
    intelligenceSub:
      "Rakenteinen päätöstuki — paras sopivuus, luottamus, kompromissit ja vaihtoehdot tälle tehtävälle.",
    primaryReason: "Pääsyy",
    secondaryReasons: "Huomioi myös",
    tradeOffs: "Keskeiset kompromissit",
    bestIf: "Paras jos…",
    considerIf: "Harkitse {provider} jos",
    confidenceLevel: "Luottamus",
    topProviders: "Parhaat toimittajat",
    comparisonLabel: "TOIMITTAJAVERTAILU",
    comparisonSub: "Tiiviit mallikaistat kärkivaihtoehdoille — ei live-RF-mittauksia.",
    colCoverage: "Kattavuus",
    colLatency: "Latenssi",
    colResilience: "Resilienssi",
    colHardware: "Laitteisto",
    colBestFor: "Paras kun",
    bandHigh: "Korkea",
    bandMedium: "Keskitaso",
    bandLow: "Matala",
    hardwareNote:
      "Laitteistokaista: Korkea = monimutkaisempi / vaativampi; Matala = yksinkertaisempi kit.",
    prioritiesApplied: "Tehtävän prioriteetit",
    scoreExplainLabel: "PISTEET SELITYKSINEEN",
    scoreExplainSub: "Kukin pääkomponentti läpinäkyvällä mallikommentilla.",
    overallResilience: "Resilienssi",
    evidenceLabel: "NÄYTTÖKETJU",
    evidenceSub: "Tutkimus → data → pisteytys → suositus. Tämän Signaturen attribuutio.",
    evidenceTheme: "Ympäristö",
    evidenceConfidence: "Arviointiluottamus",
    evidenceFreshness: "Datan tuoreus",
    evidenceAssumptions: "Oletukset",
    evidenceLimitations: "Rajoitteet",
    evidenceSources: "Lähteet ja attribuutio",
    evidenceResearch: "Tutkimusviitteet",
    evidenceMethod: "Menetelmä",
    evidenceIndicative: "Suuntaa-antava tutkimusäly — ei hankintaneuvontaa eikä paikkamitasta.",
    scoreComposition: "MITEN TÄMÄ PISTE LASKETTIIN",
    scoreCompositionSub:
      "Mallin v0.3 komponenttijako ennen kovia kattoja. Täysi kaava menetelmäsivulla.",
    scoreRawSum: "Raakasumma",
    scoreFinal: "Lopullinen pistemäärä",
    scoreCaps: "Käytetyt kovat katot",
    scoreNoCaps: "Ei kovia kattoja",
    methodologyLink: "Täysi pisteytysmenetelmä →",
    componentRedundancy: "Redundanssi",
    componentLatitude: "Leveysaste",
    componentProfile: "Toimintaprofiili",
    componentConfidence: "Toimittajaluottamus",
    riskFactors: "RISKITEKIJÄT",
    redundancyGaps: "REDUNDANSSIAUKOT",
    scoreImpact: "↓ VAIKUTUS PISTEISIIN",
    connectivityOptions: "YHTEYSVAIHTOEHDOT",
    confidence: "ARVIOINTILUOTTAMUS",
    confidenceClarify:
      "Luottamus kuvaa arvioinnin/dataperustan varmuutta, ei palvelun saatavuustakuuta.",
    latency: "LATENSSI (VIITE) ",
    reliability: "LUOTETTAVUUS (MALLIKOMMENTTI) ",
    hardware: "LAITTEISTO ",
    orbitalDisclaimer:
      "Rataluokan huomiot ovat viite- / mallikommenttia julkisesta toimialatiedosta — eivät virallisia toimittajamäärityksiä, mitattua kohdesuorituskykyä, SLA:ita tai suosituksia. GRYPS:llä ei ole kaupallista suhdetta listattuihin toimittajiin.",
    provenanceLabel: "ALKUPERÄ",
    provenanceScoringModel: "Resilience-pisteet",
    provenanceScoringModelValue:
      "Deterministinen malli v0.3 (deterministic-v0.3) — toistettava piste, arvosana, riskit ja sijoitukset",
    provenanceCommentary: "Suositusteksti",
    provenanceCommentaryValue:
      "Tekoälyavusteinen tulkinta — valinnainen proosan viimeistely; ei muuta lukuja. Ei live-telemetriaa eikä toimittajan sitoumusta",
    provenanceRealDataSources: "Viitedata",
    provenanceBittimittari:
      "Bittimittari (Traficom, Suomi) — kunta-tason laajakaistan nopeus/latenssi, CC BY 4.0",
    provenanceEuDem: "EU-DEM (Copernicus/EEA) — 25 m korkeustieto, OpenTopoData",
    provenanceDate: "Arviointipäivä",
    provenanceModelVersion: "Malliversio",
    provenanceInputHash: "Syötehash",
    provenanceNotLive: "Havainnollistava / ei live-konstellaatiodataa",
    provenanceConfidence: "Luottamus",
    provenanceConfidenceValue:
      "Arvioinnin/dataperustan luottamus — ei palvelun saatavuuden todennäköisyys",
    terrainExplain:
      "Maastopiste on riippumaton Resilience-pisteestä: suurempi vaihtelu ~5 km EU-DEM-otoksessa laskee tätä näyttöpistettä. Sitä ei sekoiteta 0–100 Signatureen.",
    shareLink: "Kopioi jaettava linkki",
    shareCopied: "Linkki kopioitu",
    tabOverview: "Yhteenveto",
    tabRisks: "Riskit",
    tabOptions: "Vaihtoehdot",
    tabEvidence: "Näyttö",
    tabMethod: "Menetelmä",
    tabCompliance: "Valmius",
    whyBtn: "Miksi?",
    overviewStrongest: "Vahvin tekijä",
    overviewGap: "Pääaukko",
    overviewAction: "Suositeltu toimenpide",
    overviewRec: "Pääsuositus",
    drawerCalc: "Laskenta",
    drawerData: "Dataperusta",
    drawerResearch: "Tutkimus ja menetelmä",
    evidenceNotesLink: "Näyttömuistiinpanot →",
    nextStepsLabel: "SEURAAVAT ASKELEET",
    saveWorkspace: "Tallenna Arvioihin",
    redundancyTiers: "REDUNDANSSIVAIHTOEHDOT (KUSTANNUSTASOT)",
    tierEssential: "Välttämätön",
    tierStandard: "Standardi",
    tierDefense: "Monitasoinen suojaus",
    whyConfidence: "MIKSI TÄMÄ SIJOITUS",
    elevationField: "KORKEUS / TAIVASNÄKYMÄ ",
    coverageField: "KATTAVUUS (MALLI) ",
    failoverField: "FAILOVER-VAIHTO (MALLI) ",
    provenanceNote:
      "Resilience-pisteet (deterministinen malli v0.3): toistettava piste, arvosana, riskit ja sijoitukset. Suositusteksti (tekoälyavusteinen tulkinta): vain valinnainen proosan viimeistely. Viitedata (EU-DEM / Bittimittari) on erillinen eikä sekoitu Signature-pisteeseen.",
    aiBadgeTitle:
      "EU AI Act Art. 50 — tekoälyavusteinen tulkinta (valinnainen Mistral-proosa). Rajoitetun riskin järjestelmä. Resilience-pisteet ovat deterministinen malli v0.3 — eivät tekoälyn tuottamia. Ei verkon saatavuustakuuta. Tukee ihmisen harkintaa; ei automaattisia oikeudellisia päätöksiä.",
    art50: "Art. 50 EU AI Act",
    generated: "Luotu",
    printAttr: "GRYPS · Connectivity Intelligence · gryps.vercel.app",
    measured: "mitattu",
    medianDownload: "Mbit/s mediaanilataus",
    medianLatency: "ms mediaanilatenssi",
    measurements: "mittausta",
    elevation: "m korkeus",
    variance: "m vaihtelu ~5 km otoksessa",
    noDataFor: "ei dataa kohteelle",
  },
} as const;

type UiCopy = (typeof UI)[UiLang];

function AssessmentInputsPanel({
  input,
  t,
  lang,
}: {
  input: AssessmentInputs;
  t: UiCopy;
  lang: UiLang;
}) {
  const strictAutonomy = input.autonomy_level === "autonomous" || input.autonomy_level === "mixed";
  const strictCriticality =
    input.operation_criticality === "safety-critical" || input.operation_criticality === "high";
  const priorityLabels = (input.priorities ?? [])
    .map((id) => PRIORITY_LABELS[id as AdvisorPriorityId]?.[lang] ?? id)
    .join(" · ");

  const rows: { label: string; value: string; note?: string }[] = [
    ...(input.lat != null && input.lng != null
      ? [{ label: t.coordinates, value: `${input.lat.toFixed(2)}°N · ${input.lng.toFixed(2)}°E` }]
      : []),
    { label: t.sector, value: input.sector },
    {
      label: t.autonomy,
      value: input.autonomy_level,
      note: strictAutonomy ? t.stricter : undefined,
    },
    {
      label: t.criticality,
      value: input.operation_criticality,
      note: strictCriticality ? t.stricter : undefined,
    },
    {
      label: t.currentSetup,
      value: input.current_setup?.trim() ? input.current_setup : t.notSpecified,
    },
    ...(priorityLabels ? [{ label: t.prioritiesApplied, value: priorityLabels }] : []),
  ];

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 4,
        }}
      >
        {t.assessmentInputs}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-dim)",
          marginBottom: 14,
        }}
      >
        {t.assessmentSub}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 9,
                color: "var(--text-dim)",
                letterSpacing: "0.08em",
                flexShrink: 0,
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 12,
                color: "var(--text)",
                textAlign: "right",
              }}
            >
              {row.value}
              {row.note && (
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 9,
                    color: "var(--accent-amber)",
                    marginLeft: 8,
                  }}
                >
                  ↑ {row.note}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function componentLabel(id: string, t: UiCopy): string {
  if (id === "redundancy") return t.componentRedundancy;
  if (id === "latitude") return t.componentLatitude;
  if (id === "operational_profile") return t.componentProfile;
  if (id === "provider_confidence") return t.componentConfidence;
  return id;
}

function bandLabel(band: string, t: UiCopy): string {
  if (band === "High") return t.bandHigh;
  if (band === "Medium") return t.bandMedium;
  if (band === "Low") return t.bandLow;
  return band;
}

function ScoreCompositionPanel({
  composition,
  explanations,
  overall,
  t,
}: {
  composition: ScoreComposition;
  explanations?: ScoreExplanation[];
  overall?: string;
  t: UiCopy;
}) {
  const byId = new Map((explanations ?? []).map((e) => [e.id, e]));
  const [openId, setOpenId] = useState<string | null>(null);
  const openComp = composition.components.find((c) => c.id === openId) ?? null;
  const openExpl = openId ? byId.get(openId) : undefined;

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <TypeLabel kind="MODEL" />
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 4,
        }}
      >
        {explanations?.length ? t.scoreExplainLabel : t.scoreComposition}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-dim)",
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        {explanations?.length ? t.scoreExplainSub : t.scoreCompositionSub}
      </p>
      {overall && (
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            color: "var(--text)",
            lineHeight: 1.6,
            marginBottom: 14,
            padding: "10px 12px",
            backgroundColor: "var(--surface2)",
            borderRadius: 6,
            border: "1px solid var(--border)",
          }}
        >
          <TypeLabel kind="INTERPRETATION" />
          {overall}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        {composition.components.map((c) => {
          const pct = c.max > 0 ? Math.max(0, Math.min(100, (c.points / c.max) * 100)) : 0;
          const expl = byId.get(c.id);
          return (
            <div key={c.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 4,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    color: "var(--text)",
                    fontWeight: 600,
                  }}
                >
                  {componentLabel(c.id, t)} — {c.points}/{c.max}
                </span>
                <button type="button" className="gryps-why-btn" onClick={() => setOpenId(c.id)}>
                  {t.whyBtn}
                </button>
              </div>
              <div
                style={{
                  height: 4,
                  backgroundColor: "var(--surface2)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    backgroundColor: "var(--accent-cyan)",
                    borderRadius: 2,
                  }}
                />
              </div>
              {expl?.explanation && (
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    lineHeight: 1.55,
                    marginTop: 6,
                  }}
                >
                  {expl.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
          marginBottom: 12,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.08em",
              marginBottom: 2,
            }}
          >
            {t.scoreRawSum}
          </p>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {composition.raw_sum}
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.08em",
              marginBottom: 2,
            }}
          >
            {t.scoreFinal}
          </p>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {composition.final_score}
          </p>
        </div>
      </div>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 11,
          color: "var(--text-dim)",
          lineHeight: 1.5,
        }}
      >
        {composition.caps_applied.length
          ? `${t.scoreCaps}: ${composition.caps_applied.join(", ")}`
          : t.scoreNoCaps}
      </p>
      <Link
        href="/methodology"
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--accent-blue)",
          marginTop: 10,
          display: "inline-block",
        }}
      >
        {t.methodologyLink}
      </Link>

      <IntelligenceDrawer
        open={!!openComp}
        title={
          openComp ? `${componentLabel(openComp.id, t)} — ${openComp.points}/${openComp.max}` : ""
        }
        onClose={() => setOpenId(null)}
      >
        <TypeLabel kind="MODEL" />
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          {t.drawerCalc}
        </p>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            color: "var(--text)",
            lineHeight: 1.6,
            marginBottom: 14,
          }}
        >
          {openExpl?.explanation ?? `${openComp?.points ?? 0} / ${openComp?.max ?? 0}`}
        </p>
        <TypeLabel kind="DATA" />
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          {t.drawerData}
        </p>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: 14,
          }}
        >
          {openComp ? `${openComp.points}/${openComp.max} · ${composition.final_score} final` : "—"}
        </p>
        <TypeLabel kind="RESEARCH" />
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          {t.drawerResearch}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link
            href="/methodology"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--accent-blue)",
              textDecoration: "none",
            }}
          >
            {t.methodologyLink}
          </Link>
          <Link
            href="/knowledge"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--accent-blue)",
              textDecoration: "none",
            }}
          >
            {t.evidenceNotesLink}
          </Link>
        </div>
      </IntelligenceDrawer>
    </div>
  );
}

function IntelligencePanel({ intelligence, t }: { intelligence: AdvisorIntelligence; t: UiCopy }) {
  const rec = intelligence.recommendation;
  const band = bandLabel(rec.confidenceBand, t);
  return (
    <div
      style={{
        backgroundColor: "rgba(79,168,255,0.06)",
        border: "1px solid rgba(79,168,255,0.2)",
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--accent-blue)",
          letterSpacing: "0.12em",
          marginBottom: 4,
        }}
      >
        {t.intelligenceLabel}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-dim)",
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        {t.intelligenceSub}
      </p>

      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1.45,
          marginBottom: 8,
        }}
      >
        {rec.headline}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 10,
            color: "var(--accent-blue)",
            border: "1px solid rgba(79,168,255,0.35)",
            borderRadius: 4,
            padding: "3px 8px",
          }}
        >
          {t.confidenceLevel}: {band} ({rec.confidence}%)
        </span>
        {rec.priorities_applied.length > 0 && (
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "3px 8px",
            }}
          >
            {t.prioritiesApplied}:{" "}
            {rec.priorities_applied.map((p) => p.replace(/_/g, " ")).join(", ")}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          {t.primaryReason}
        </p>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            color: "var(--text)",
            lineHeight: 1.6,
          }}
        >
          {rec.primary_reason}
        </p>
      </div>

      {rec.secondary_reasons.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            {t.secondaryReasons}
          </p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {rec.secondary_reasons.map((s, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                  marginBottom: 4,
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rec.trade_offs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            {t.tradeOffs}
          </p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {rec.trade_offs.map((s, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                  marginBottom: 4,
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rec.best_if.length > 0 && (
        <div
          style={{
            marginTop: 4,
            paddingTop: 12,
            borderTop: "1px solid rgba(79,168,255,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
            }}
          >
            {t.bestIf}
          </p>
          {rec.best_if.map((alt, i) => (
            <p
              key={i}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color: "var(--text)",
                lineHeight: 1.55,
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--accent-blue)" }}>
                {t.considerIf.replace("{provider}", alt.provider)}:
              </span>{" "}
              {alt.condition}.
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function EvidencePanel({ evidence, t }: { evidence: EvidencePackage; t: UiCopy }) {
  const band = bandLabel(evidence.confidence.band, t);
  const sourceById = new Map(evidence.sources.map((s) => [s.id, s]));

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 4,
        }}
      >
        {t.evidenceLabel}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-dim)",
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        {t.evidenceSub}
      </p>

      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 13,
          color: "var(--text)",
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        {evidence.methodology_summary}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 10,
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "3px 8px",
          }}
        >
          {t.evidenceTheme}: {evidence.environment_theme}
        </span>
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 10,
            color: "var(--accent-blue)",
            border: "1px solid rgba(79,168,255,0.35)",
            borderRadius: 4,
            padding: "3px 8px",
          }}
        >
          {t.evidenceConfidence}: {band} ({evidence.confidence.score}%)
        </span>
      </div>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 12,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          marginBottom: 16,
        }}
      >
        {evidence.confidence.rationale}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 18 }}>
        {evidence.chain.map((step, i) => (
          <div
            key={step.id}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: 10,
              paddingBottom: i < evidence.chain.length - 1 ? 14 : 0,
              marginBottom: i < evidence.chain.length - 1 ? 0 : 0,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: "var(--surface2)",
                  border: "1px solid var(--accent-cyan)",
                  fontFamily: "var(--font-data)",
                  fontSize: 9,
                  color: "var(--accent-cyan)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
              {i < evidence.chain.length - 1 && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: 12,
                    backgroundColor: "var(--border)",
                    marginTop: 4,
                  }}
                />
              )}
            </div>
            <div style={{ paddingBottom: i < evidence.chain.length - 1 ? 4 : 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  color: "var(--accent-cyan)",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}
              >
                {step.label.toUpperCase()}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                }}
              >
                {step.summary}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 9,
                  color: "var(--text-dim)",
                  marginTop: 4,
                }}
              >
                {step.sourceIds
                  .map((id) => sourceById.get(id)?.title)
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}
        className="gryps-output-grid"
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            {t.evidenceAssumptions}
          </p>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {evidence.assumptions.map((a, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                  marginBottom: 4,
                }}
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            {t.evidenceLimitations}
          </p>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {evidence.limitations.map((a, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                  marginBottom: 4,
                }}
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          {t.evidenceFreshness}
        </p>
        <dl style={{ display: "flex", flexDirection: "column", gap: 6, margin: 0 }}>
          {[
            ["Model", evidence.data_freshness.model],
            ["Catalog", evidence.data_freshness.catalog],
            ["Datasets", evidence.data_freshness.reference_datasets],
            ["Knowledge", evidence.data_freshness.knowledge],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <dt style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)" }}>
                {k}
              </dt>
              <dd
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  margin: 0,
                  textAlign: "right",
                }}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div style={{ marginBottom: 14 }}>
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          {t.evidenceSources}
        </p>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {evidence.sources.map((s) => (
            <li
              key={s.id}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                marginBottom: 6,
              }}
            >
              {s.url ? (
                <Link href={s.url} style={{ color: "var(--accent-blue)", textDecoration: "none" }}>
                  {s.title}
                </Link>
              ) : (
                <span style={{ color: "var(--text)" }}>{s.title}</span>
              )}
              {" — "}
              {s.attribution}
              {s.freshness ? ` · ${s.freshness}` : ""}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: 12 }}>
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          {t.evidenceResearch}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {evidence.research_links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 10,
                color: "var(--accent-blue)",
                border: "1px solid rgba(79,168,255,0.25)",
                borderRadius: 4,
                padding: "4px 8px",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 11,
          color: "var(--accent-amber)",
          lineHeight: 1.5,
          marginTop: 8,
        }}
      >
        {t.evidenceIndicative}
      </p>
      <Link
        href="/methodology"
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--accent-blue)",
          marginTop: 10,
          display: "inline-block",
        }}
      >
        {t.evidenceMethod} →
      </Link>
    </div>
  );
}

function ComparisonTable({ rows, t }: { rows: ComparisonRow[]; t: UiCopy }) {
  if (!rows.length) return null;
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 20px",
        overflowX: "auto",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 4,
        }}
      >
        {t.comparisonLabel}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-dim)",
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        {t.comparisonSub}
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                fontFamily: "var(--font-data)",
                fontSize: 9,
                color: "var(--text-dim)",
                letterSpacing: "0.08em",
                padding: "6px 8px",
                borderBottom: "1px solid var(--border)",
              }}
            />
            {rows.map((r) => (
              <th
                key={r.provider}
                style={{
                  textAlign: "left",
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text)",
                  padding: "6px 8px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {r.provider}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(
            [
              ["coverage", t.colCoverage],
              ["latency", t.colLatency],
              ["resilience", t.colResilience],
              ["hardware", t.colHardware],
            ] as const
          ).map(([key, label]) => (
            <tr key={key}>
              <td
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  color: "var(--text-dim)",
                  padding: "8px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {label}
              </td>
              {rows.map((r) => (
                <td
                  key={r.provider + key}
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    color: "var(--text)",
                    padding: "8px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {bandLabel(r[key], t)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 10,
                color: "var(--text-dim)",
                padding: "8px",
              }}
            >
              {t.colBestFor}
            </td>
            {rows.map((r) => (
              <td
                key={r.provider + "best"}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  padding: "8px",
                  lineHeight: 1.4,
                }}
              >
                {r.best_for}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-dim)",
          marginTop: 10,
          lineHeight: 1.5,
        }}
      >
        {t.hardwareNote}
      </p>
    </div>
  );
}

// Real, measured data — deliberately separate from and never blended into the
// Resilience Signature score above. Two independent inputs:
// Bittimittari real-world speed/latency (Finland only — Traficom's dataset has
// no coverage outside Finland) and EU-DEM terrain variance (works globally).
// When Bittimittari doesn't apply (non-Finnish site, or a live ad-hoc query
// where no municipality can be resolved), this shows terrain only, clearly
// labeled as such — never a fabricated or interpolated real-world-gap number.
export type RealDataEvidence = {
  realDataScore: number;
  terrainPenaltyScore: number | null;
  elevationCenterM: number | null;
  elevationVarianceM: number | null;
  realWorldGapScore: number | null;
  municipality: string | null;
  bittimittariPeriod: string | null;
  bittimittariSampleCount: number | null;
  bittimittariMedianDownloadMbps: number | null;
  bittimittariMedianLatencyMs: number | null;
};

function RealDataEvidencePanel({
  data,
  t,
  lang = "en",
}: {
  data: RealDataEvidence;
  t: UiCopy;
  lang?: UiLang;
}) {
  const scoreColor =
    data.realDataScore >= 70
      ? "var(--accent-green)"
      : data.realDataScore >= 40
        ? "var(--accent-amber)"
        : "var(--accent-red)";
  const terrainOnly = data.realWorldGapScore == null;

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 9,
            color: "var(--text-dim)",
            letterSpacing: "0.12em",
          }}
        >
          {t.realData}
        </p>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 20,
              fontWeight: 900,
              color: scoreColor,
            }}
          >
            {data.realDataScore}
          </span>
          {terrainOnly && (
            <p style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)" }}>
              {lang === "fi" ? "vain maasto" : "terrain only"}
            </p>
          )}
        </div>
      </div>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-dim)",
          marginBottom: 14,
        }}
      >
        {t.realDataSub}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-muted)",
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        {t.terrainExplain}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontWeight: 700,
                fontSize: 11,
                color: "var(--text)",
              }}
            >
              {t.realWorldGap}
            </span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)" }}>
              {data.realWorldGapScore ?? "—"}
            </span>
          </div>
          {data.realWorldGapScore != null ? (
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {data.municipality} · {t.measured} {data.bittimittariMedianDownloadMbps?.toFixed(1)}{" "}
              {t.medianDownload}, {data.bittimittariMedianLatencyMs?.toFixed(0)}
              {t.medianLatency}({data.bittimittariSampleCount} {t.measurements},{" "}
              {data.bittimittariPeriod})
            </p>
          ) : (
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                color: "var(--text-dim)",
                lineHeight: 1.6,
              }}
            >
              {t.bittiNA}
              {data.municipality === null ? "" : ` (${t.noDataFor} ${data.municipality})`}.
            </p>
          )}
        </div>

        <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontWeight: 700,
                fontSize: 11,
                color: "var(--text)",
              }}
            >
              {t.terrainPenalty}
            </span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)" }}>
              {data.terrainPenaltyScore ?? "—"}
            </span>
          </div>
          {data.terrainPenaltyScore != null &&
          data.elevationCenterM != null &&
          data.elevationVarianceM != null ? (
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {data.elevationCenterM.toFixed(0)}
              {t.elevation}, ±{data.elevationVarianceM.toFixed(1)}
              {t.variance}
            </p>
          ) : (
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                color: "var(--text-dim)",
                lineHeight: 1.6,
              }}
            >
              {t.demNA}
            </p>
          )}
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 9,
          color: "var(--text-dim)",
          lineHeight: 1.6,
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid var(--border)",
        }}
      >
        {t.sources}
      </p>
    </div>
  );
}

type SigTab = "overview" | "risks" | "options" | "evidence" | "method" | "compliance";

export function ResilienceOutput({
  result,
  input,
  realData,
  lang = "en",
}: {
  result: AdvisoryResult;
  input?: AssessmentInputs;
  realData?: RealDataEvidence;
  lang?: UiLang;
}) {
  const t = UI[lang];
  const {
    resilience_signature: sig,
    risk_factors,
    redundancy_gaps,
    connectivity_options,
    recommendation,
    caveats,
    score_composition,
    intelligence,
    evidence,
  } = result;
  const gc = gradeColor(sig.grade);
  const gtc = gradeTextColor(sig.grade);
  const flags = computeComplianceFlags(result, input);
  const tiers = redundancyTiers(input);
  const issued = result.issuedAt ? new Date(result.issuedAt) : new Date();
  const dateLabel = issued.toLocaleDateString(lang === "fi" ? "fi-FI" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<SigTab>("overview");
  const [riskWhyOpen, setRiskWhyOpen] = useState(false);

  const strongest =
    score_composition?.components.reduce<(typeof score_composition.components)[number] | null>(
      (best, c) => {
        const ratio = c.max > 0 ? c.points / c.max : 0;
        const bestRatio = best && best.max > 0 ? best.points / best.max : -1;
        return ratio > bestRatio ? c : best;
      },
      null
    ) ?? null;
  const primaryGap = redundancy_gaps[0] ?? null;
  const actionLine =
    intelligence?.recommendation.headline ??
    (primaryGap
      ? lang === "fi"
        ? `Korjaa: ${primaryGap.label}`
        : `Address: ${primaryGap.label}`
      : recommendation);

  function copyShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const tabs: { id: SigTab; label: string }[] = [
    { id: "overview", label: t.tabOverview },
    { id: "risks", label: t.tabRisks },
    { id: "options", label: t.tabOptions },
    { id: "evidence", label: t.tabEvidence },
    { id: "method", label: t.tabMethod },
    { id: "compliance", label: t.tabCompliance },
  ];

  return (
    <div
      className="gryps-report-body"
      style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}
    >
      <div
        className="gryps-no-print"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {input && <SaveToWorkspace inputs={input} result={result} lang={lang} />}
        <button
          type="button"
          onClick={copyShare}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "var(--surface2)",
            border: "1px solid var(--border2)",
            borderRadius: 6,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: "var(--font-ui)",
            fontWeight: 700,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          {copied ? t.shareCopied : t.shareLink}
        </button>
        <button
          type="button"
          className="gryps-no-print"
          onClick={() => window.print()}
          style={{
            alignSelf: "flex-end",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "var(--surface2)",
            border: "1px solid var(--border2)",
            borderRadius: 6,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: "var(--font-ui)",
            fontWeight: 700,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <Download size={13} /> {t.downloadPdf}
        </button>
      </div>

      <div
        className="gryps-signature-card"
        style={{
          backgroundColor: "var(--surface)",
          border: `1px solid ${gc}44`,
          borderRadius: 12,
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div
              aria-label={`Resilience score ${sig.score} out of 100, grade ${sig.grade}`}
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 64,
                fontWeight: 900,
                color: gtc,
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              {sig.score}
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-dim)",
                  marginLeft: 6,
                }}
              >
                / {sig.grade}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 10,
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                marginTop: 8,
              }}
            >
              {t.resilienceSignature}
            </div>
            <span className="sr-only">
              Grade {sig.grade}. Scale {GRADE_BANDS_SUMMARY}.
            </span>
          </div>
          <div
            className="gryps-signature-divider"
            style={{ width: 1, height: 72, backgroundColor: "var(--border)", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text)",
                lineHeight: 1.55,
                marginBottom: 14,
              }}
            >
              {sig.summary}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              {primaryGap && (
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 9,
                      color: "var(--text-dim)",
                      letterSpacing: "0.1em",
                      marginBottom: 4,
                    }}
                  >
                    {t.overviewGap}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--text)",
                      lineHeight: 1.4,
                    }}
                  >
                    {primaryGap.label}
                  </p>
                </div>
              )}
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  {t.overviewAction}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--text)",
                    lineHeight: 1.4,
                  }}
                >
                  {actionLine}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            paddingTop: 4,
            borderTop: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.08em",
            }}
          >
            {t.scoreAuthority}
          </span>
          <span style={{ color: "var(--border2)" }}>·</span>
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.08em",
            }}
          >
            {t.recommendationAuthority}
          </span>
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.08em",
          textAlign: "center",
        }}
      >
        {t.modelGenerated}
      </p>

      <div className="gryps-sig-tabs" role="tablist" aria-label="Signature sections">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`gryps-sig-tab${tab === item.id ? " is-active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        className={`gryps-sig-tab-panel${tab === "overview" ? " is-active" : ""}`}
        hidden={tab !== "overview"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {input && <AssessmentInputsPanel input={input} t={t} lang={lang} />}

          {strongest && (
            <div
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "14px 16px",
              }}
            >
              <TypeLabel kind="MODEL" />
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 9,
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                  marginBottom: 6,
                }}
              >
                {t.overviewStrongest}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--text)",
                }}
              >
                {componentLabel(strongest.id, t)} — {strongest.points}/{strongest.max}
              </p>
            </div>
          )}

          {intelligence ? (
            <IntelligencePanel intelligence={intelligence} t={t} />
          ) : (
            <div
              style={{
                backgroundColor: "rgba(79,168,255,0.06)",
                border: "1px solid rgba(79,168,255,0.2)",
                borderRadius: 8,
                padding: "16px 20px",
              }}
            >
              <TypeLabel kind="INTERPRETATION" />
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 9,
                  color: "var(--accent-blue)",
                  letterSpacing: "0.12em",
                  marginBottom: 8,
                }}
              >
                {t.recommendation}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 14,
                  color: "var(--text)",
                  lineHeight: 1.7,
                }}
              >
                {recommendation}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  lineHeight: 1.55,
                  marginTop: 10,
                }}
              >
                {t.recommendationNote}
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        role="tabpanel"
        className={`gryps-sig-tab-panel${tab === "risks" ? " is-active" : ""}`}
        hidden={tab !== "risks"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <button type="button" className="gryps-why-btn" onClick={() => setRiskWhyOpen(true)}>
              {t.whyBtn}
            </button>
          </div>
          <div
            className="gryps-output-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "16px 20px",
              }}
            >
              <TypeLabel kind="MODEL" />
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 9,
                  color: "var(--text-dim)",
                  letterSpacing: "0.12em",
                  marginBottom: 14,
                }}
              >
                {t.riskFactors}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {risk_factors.map((r, i) => {
                  const vivid = SEV_COLOR_VIVID[r.severity] ?? "#64748B";
                  const textColor = SEV_COLOR[r.severity] ?? "var(--text-muted)";
                  const Icon = SEV_ICON[r.severity] ?? AlertCircle;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        backgroundColor: `${vivid}14`,
                        border: `1px solid ${vivid}40`,
                        borderLeft: `3px solid ${vivid}`,
                        borderRadius: 6,
                        padding: "10px 12px",
                      }}
                    >
                      <Icon size={16} color={textColor} style={{ flexShrink: 0, marginTop: 1 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-ui)",
                              fontWeight: 700,
                              fontSize: 12,
                              color: "var(--text)",
                            }}
                          >
                            {r.label}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-data)",
                              fontSize: 9,
                              color: textColor,
                              marginLeft: "auto",
                              flexShrink: 0,
                            }}
                          >
                            {r.severity.toUpperCase()}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 11,
                            color: "var(--text-muted)",
                            lineHeight: 1.6,
                          }}
                        >
                          {r.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "16px 20px",
              }}
            >
              <TypeLabel kind="MODEL" />
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 9,
                  color: "var(--text-dim)",
                  letterSpacing: "0.12em",
                  marginBottom: 14,
                }}
              >
                {t.redundancyGaps}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {redundancy_gaps.map((g, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontWeight: 700,
                          fontSize: 12,
                          color: "var(--text)",
                        }}
                      >
                        {g.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-data)",
                          fontSize: 9,
                          color: "var(--accent-red)",
                          marginLeft: "auto",
                        }}
                      >
                        {t.scoreImpact}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: 11,
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                      }}
                    >
                      {g.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <IntelligenceDrawer
          open={riskWhyOpen}
          title={t.riskFactors}
          onClose={() => setRiskWhyOpen(false)}
        >
          <TypeLabel kind="MODEL" />
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            {t.drawerCalc}
          </p>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--text)",
              lineHeight: 1.6,
              marginBottom: 14,
            }}
          >
            {risk_factors.map((r) => r.label).join(" · ") || "—"}
          </p>
          <TypeLabel kind="DATA" />
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            {t.drawerData}
          </p>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: 14,
            }}
          >
            {primaryGap ? `${primaryGap.label} — ${primaryGap.detail}` : "—"}
          </p>
          <TypeLabel kind="RESEARCH" />
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            {t.drawerResearch}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link
              href="/knowledge"
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color: "var(--accent-blue)",
                textDecoration: "none",
              }}
            >
              {t.evidenceNotesLink}
            </Link>
            <Link
              href="/methodology"
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color: "var(--accent-blue)",
                textDecoration: "none",
              }}
            >
              {t.methodologyLink}
            </Link>
            <Link
              href="/providers"
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color: "var(--accent-blue)",
                textDecoration: "none",
              }}
            >
              {lang === "fi" ? "Toimittajat →" : "Providers →"}
            </Link>
          </div>
        </IntelligenceDrawer>
      </div>

      <div
        role="tabpanel"
        className={`gryps-sig-tab-panel${tab === "options" ? " is-active" : ""}`}
        hidden={tab !== "options"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {intelligence && intelligence.comparison.length > 0 && (
            <ComparisonTable rows={intelligence.comparison} t={t} />
          )}

          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px 20px",
            }}
          >
            <TypeLabel kind="MODEL" />
            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 9,
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                marginBottom: 14,
              }}
            >
              {t.connectivityOptions}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {connectivity_options.map((o, i) => {
                const tech = getOrbitalCharacteristics(o.type, o.provider);
                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "var(--surface2)",
                      border: `1px solid ${i === 0 ? "rgba(79,168,255,0.2)" : "var(--border)"}`,
                      borderRadius: 6,
                      padding: "10px 14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-ui)",
                              fontWeight: 700,
                              fontSize: 13,
                              color: "var(--text)",
                            }}
                          >
                            {o.provider}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-data)",
                              fontSize: 9,
                              color: "var(--text-dim)",
                              backgroundColor: "var(--border)",
                              padding: "1px 6px",
                              borderRadius: 3,
                            }}
                          >
                            {o.type}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 11,
                            color: "var(--text-muted)",
                          }}
                        >
                          {o.note}
                        </p>
                        {(o.elevation || o.coverage || o.failover_latency) && (
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                            }}
                          >
                            <p
                              style={{
                                fontFamily: "var(--font-data)",
                                fontSize: 8,
                                color: "var(--text-dim)",
                                letterSpacing: "0.1em",
                              }}
                            >
                              {t.whyConfidence}
                            </p>
                            {o.elevation && (
                              <p
                                style={{
                                  fontFamily: "var(--font-ui)",
                                  fontSize: 10,
                                  color: "var(--text-dim)",
                                  lineHeight: 1.5,
                                }}
                              >
                                <span style={{ fontWeight: 700 }}>{t.elevationField}</span>
                                {o.elevation}
                              </p>
                            )}
                            {o.coverage && (
                              <p
                                style={{
                                  fontFamily: "var(--font-ui)",
                                  fontSize: 10,
                                  color: "var(--text-dim)",
                                  lineHeight: 1.5,
                                }}
                              >
                                <span style={{ fontWeight: 700 }}>{t.coverageField}</span>
                                {o.coverage}
                              </p>
                            )}
                            {o.failover_latency && (
                              <p
                                style={{
                                  fontFamily: "var(--font-ui)",
                                  fontSize: 10,
                                  color: "var(--text-dim)",
                                  lineHeight: 1.5,
                                }}
                              >
                                <span style={{ fontWeight: 700 }}>{t.failoverField}</span>
                                {o.failover_latency}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-data)",
                            fontSize: 22,
                            fontWeight: 700,
                            color: i === 0 ? "var(--accent-blue)" : "var(--text)",
                            lineHeight: 1,
                          }}
                        >
                          {o.confidence}
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>%</span>
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-data)",
                            fontSize: 8,
                            color: "var(--text-dim)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {t.confidence}
                        </div>
                      </div>
                    </div>
                    {tech && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 10,
                            color: "var(--text-dim)",
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ fontFamily: "var(--font-data)", fontWeight: 700 }}>
                            {t.latency}
                          </span>
                          {tech.latency}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 10,
                            color: "var(--text-dim)",
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ fontFamily: "var(--font-data)", fontWeight: 700 }}>
                            {t.reliability}
                          </span>
                          {tech.reliability}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 10,
                            color: "var(--text-dim)",
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ fontFamily: "var(--font-data)", fontWeight: 700 }}>
                            {t.hardware}
                          </span>
                          {tech.hardware}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                color: "var(--text-dim)",
                lineHeight: 1.5,
                marginTop: 12,
              }}
            >
              {t.confidenceClarify}
            </p>
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                color: "var(--text-dim)",
                lineHeight: 1.6,
                marginTop: 8,
                paddingTop: 10,
                borderTop: "1px solid var(--border)",
              }}
            >
              {t.orbitalDisclaimer}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px 20px",
            }}
          >
            <TypeLabel kind="INTERPRETATION" />
            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 9,
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                marginBottom: 14,
              }}
            >
              {t.redundancyTiers}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  style={{ borderLeft: "2px solid var(--accent-blue)", paddingLeft: 12 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--text)",
                      }}
                    >
                      {tier.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: 9,
                        color: "var(--text-dim)",
                      }}
                    >
                      {tier.tier === "essential"
                        ? t.tierEssential
                        : tier.tier === "standard"
                          ? t.tierStandard
                          : t.tierDefense}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 10,
                      color: "var(--accent-blue)",
                      marginTop: 4,
                    }}
                  >
                    {tier.estimate}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                      marginTop: 4,
                    }}
                  >
                    {tier.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        role="tabpanel"
        className={`gryps-sig-tab-panel${tab === "evidence" ? " is-active" : ""}`}
        hidden={tab !== "evidence"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {evidence && <EvidencePanel evidence={evidence} t={t} />}
          {realData && <RealDataEvidencePanel data={realData} t={t} lang={lang} />}
          <Link
            href="/knowledge"
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--accent-blue)",
              display: "inline-block",
            }}
          >
            {t.evidenceNotesLink}
          </Link>
        </div>
      </div>

      <div
        role="tabpanel"
        className={`gryps-sig-tab-panel${tab === "method" ? " is-active" : ""}`}
        hidden={tab !== "method"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {score_composition && (
            <ScoreCompositionPanel
              composition={score_composition}
              explanations={intelligence?.score_explanations}
              overall={intelligence?.overall_score_explanation}
              t={t}
            />
          )}

          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px 20px",
            }}
          >
            <TypeLabel kind="DATA" />
            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 9,
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                marginBottom: 12,
              }}
            >
              {t.provenanceLabel}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}
                >
                  {t.provenanceScoringModel}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    textAlign: "right",
                  }}
                >
                  {t.provenanceScoringModelValue}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}
                >
                  {t.provenanceCommentary}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    textAlign: "right",
                  }}
                >
                  {t.provenanceCommentaryValue}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}
                >
                  {t.provenanceConfidence}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    textAlign: "right",
                  }}
                >
                  {t.provenanceConfidenceValue}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {t.provenanceRealDataSources}
                </span>
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  <li
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {t.provenanceBittimittari}
                  </li>
                  <li
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {t.provenanceEuDem}
                  </li>
                </ul>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}
                >
                  {t.provenanceDate}
                </span>
                <span
                  style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}
                >
                  {dateLabel}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}
                >
                  {t.provenanceModelVersion}
                </span>
                <span
                  style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}
                >
                  {result.modelVersion ?? MODEL_VERSION}
                </span>
              </div>
              {result.inputHash && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 9,
                      color: "var(--text-dim)",
                      letterSpacing: "0.08em",
                      flexShrink: 0,
                    }}
                  >
                    {t.provenanceInputHash}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    {result.inputHash}
                  </span>
                </div>
              )}
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 9,
                  color: "var(--accent-amber)",
                  letterSpacing: "0.06em",
                }}
              >
                {t.provenanceNotLive}
              </p>
            </div>
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 9,
                color: "var(--text-dim)",
                lineHeight: 1.6,
                marginTop: 10,
                paddingTop: 8,
                borderTop: "1px solid var(--border)",
              }}
            >
              {t.provenanceNote}
            </p>
            <Link
              href="/methodology"
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 10,
                color: "var(--accent-blue)",
                display: "inline-block",
                marginTop: 12,
              }}
            >
              {t.methodologyLink}
            </Link>
          </div>
        </div>
      </div>


      <div
        role="tabpanel"
        className={`gryps-sig-tab-panel${tab === "compliance" ? " is-active" : ""}`}
        hidden={tab !== "compliance"}
      >
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "16px 20px",
          }}
        >
          <TypeLabel kind="MODEL" />
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.12em",
              marginBottom: 12,
            }}
          >
            {t.complianceLabel}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {flags.map((flag) => (
              <div key={flag.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    {flag.id === "nis2-art21" ? t.complianceNis2 : t.complianceCer}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 9,
                      fontWeight: 700,
                      color: flag.pass ? "var(--accent-green)" : "var(--accent-red)",
                      border: `1px solid ${flag.pass ? "rgba(46,212,122,0.3)" : "rgba(239,68,68,0.3)"}`,
                      borderRadius: 4,
                      padding: "2px 8px",
                    }}
                  >
                    {flag.pass ? t.compliancePass : t.complianceFail}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    lineHeight: 1.5,
                    marginTop: 4,
                  }}
                >
                  {flag.reason}
                </p>
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 9,
              color: "var(--text-dim)",
              lineHeight: 1.6,
              marginTop: 10,
              paddingTop: 8,
              borderTop: "1px solid var(--border)",
            }}
          >
            {t.complianceNote}
          </p>
        </div>
      </div>

      <NextStepsLinks lang={lang} label={t.nextStepsLabel} />

      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 12,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <span
          title={t.aiBadgeTitle}
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 8,
            color: "var(--text-dim)",
            border: "1px solid var(--border)",
            borderRadius: 3,
            padding: "2px 5px",
            flexShrink: 0,
            marginTop: 2,
            cursor: "help",
          }}
        >
          AI
        </span>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 11,
            color: "var(--text-dim)",
            lineHeight: 1.6,
          }}
        >
          {t.scoreAuthority} · {t.recommendationAuthority}. {caveats.join(" · ")} ·{" "}
          <Link href="/terms" style={{ color: "var(--text-dim)", textDecoration: "underline" }}>
            {t.art50}
          </Link>
        </p>
      </div>

      <div
        className="gryps-print-only"
        style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}
      >
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>
          {t.generated} {dateLabel} · {t.printAttr} · {result.modelVersion ?? MODEL_VERSION}
        </p>
      </div>
    </div>
  );
}

"use client"
import { useState } from "react"
import Link from "next/link"
import { ShieldAlert, AlertTriangle, AlertCircle, ShieldCheck, Download } from "lucide-react"
import { gradeColor, gradeTextColor, type AdvisoryResult, type AssessmentInputs, type ScoreComposition } from "@/lib/resilience-colors"
import { computeComplianceFlags } from "@/lib/compliance"
import { redundancyTiers } from "@/lib/redundancy-tiers"
import { MODEL_VERSION } from "@/lib/signature-meta"

// Re-exported as TYPES only (types are erased at compile time, no client-boundary
// issue). Do NOT re-export gradeColor/gradeTextColor themselves here — a Server
// Component importing them from this "use client" file would hit the same
// "call a client function from the server" build error. Import those two
// directly from @/lib/resilience-colors instead.
export type { AdvisoryResult, AssessmentInputs }

const SEV_COLOR: Record<string, string> = {
  low: "var(--accent-green)", medium: "var(--accent-amber)", high: "var(--accent-amber)", critical: "var(--accent-red)",
}

// Vivid, theme-independent — same pattern as gradeColor(), needed for alpha-blended
// tint backgrounds/borders (string-concatenated hex+alpha), which can't be built
// from a CSS var since its resolved value isn't known at string-concat time.
const SEV_COLOR_VIVID: Record<string, string> = {
  low: "#2ED47A", medium: "#D97706", high: "#D97706", critical: "#EF4444",
}

const SEV_ICON: Record<string, typeof ShieldAlert> = {
  critical: ShieldAlert, high: AlertTriangle, medium: AlertCircle, low: ShieldCheck,
}

// General, publicly-known orbital-class characteristics — deliberately static,
// not model-generated. These are physics/industry-convention facts about a
// class of system, not claims about any specific company's current service,
// pricing, or contractual terms. Never edit this to reference a specific SLA
// percentage as if guaranteed by a named provider, or language implying
// partnership.
type OrbitalCharacteristics = { latency: string; reliability: string; hardware: string }

const GEO_CHARS: OrbitalCharacteristics = {
  latency: "~500–700ms round-trip (typical for geostationary orbit, ~35,800km altitude)",
  reliability: "Carrier-grade geostationary services typically target 99.9%+ availability as an industry norm",
  hardware: "Fixed, precisely-aimed dish antenna with clear line-of-sight to the equatorial arc; higher power draw",
}

const POLAR_NARROWBAND_CHARS: OrbitalCharacteristics = {
  latency: "~150–300ms round-trip (typical for polar-orbit narrowband constellations)",
  reliability: "Polar-orbit constellations designed for global/high-latitude coverage typically emphasize continuous availability over throughput as an industry norm",
  hardware: "Small omnidirectional or low-profile fixed antenna, modest power requirements, no steerable/tracking hardware needed",
}

const LEO_BROADBAND_CHARS: OrbitalCharacteristics = {
  latency: "~20–50ms round-trip (typical for broadband LEO constellations, ~340–1,200km altitude)",
  reliability: "Broadband LEO constellations typically target high availability via multi-satellite handoff and orbital redundancy as an industry norm",
  hardware: "Compact, often self-orienting phased-array antenna requiring a clear view of the sky; moderate power requirements",
}

const MEO_CHARS: OrbitalCharacteristics = {
  latency: "~100–150ms round-trip (typical for medium Earth orbit)",
  reliability: "MEO constellations are typically positioned as a middle ground between GEO reliability and LEO latency as an industry norm",
  hardware: "Steerable/tracking antenna required given the moving orbital path; larger aperture than typical LEO terminals",
}

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
]

function getOrbitalCharacteristics(type: string, provider: string): OrbitalCharacteristics | null {
  const p = provider.toLowerCase()

  // 1. Known real provider name — trust this over whatever the model self-reports.
  const known = PROVIDER_ORBITAL_CLASS.find(entry => p.includes(entry.match))
  if (known) return known.chars

  // 2. Unrecognized provider name (synthetic/generic, e.g. seed-data placeholders,
  //    or a real provider not yet in the table) — fall back to the type string.
  const t = type.toLowerCase()
  if (t.includes("geo") && !t.includes("polar")) return GEO_CHARS
  if (t.includes("polar")) return POLAR_NARROWBAND_CHARS
  if (t.includes("leo")) return LEO_BROADBAND_CHARS
  if (t.includes("meo")) return MEO_CHARS
  return null // terrestrial/fiber/microwave options — no orbital class applies
}

type UiLang = "en" | "fi"

const UI = {
  en: {
    downloadPdf: "Download PDF",
    resilienceScore: "RESILIENCE SCORE",
    resilienceSignature: "RESILIENCE SIGNATURE",
    modelGenerated: "Deterministic Model v0.3 — illustrative research output, not a coverage guarantee",
    assessmentInputs: "ASSESSMENT INPUTS",
    assessmentSub: "The deterministic parameters provided for this scoring run.",
    coordinates: "COORDINATES",
    sector: "SECTOR",
    autonomy: "AUTONOMY LEVEL",
    criticality: "CRITICALITY",
    currentSetup: "CURRENT SETUP",
    notSpecified: "Not specified",
    stricter: "stricter threshold applied",
    realData: "REAL-DATA EVIDENCE",
    realDataSub: "Deterministic score computed from measured third-party data — not AI-generated, not blended into the Resilience Score above. This is live computation against real datasets.",
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
    complianceNote: "Compliance flags are indicative, based on the scoring model's assessment of connectivity resilience posture. They do not constitute legal or regulatory advice. A Signature supports readiness documentation — it is not certification.",
    recommendation: "RECOMMENDATION",
    scoreComposition: "HOW THIS SCORE WAS COMPUTED",
    scoreCompositionSub: "Model v0.3 component breakdown before hard caps. Full formula on the methodology page.",
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
    confidence: "CONFIDENCE",
    latency: "LATENCY ",
    reliability: "RELIABILITY ",
    hardware: "HARDWARE ",
    orbitalDisclaimer:
      "General technical characteristics based on publicly available industry information — not official provider specifications, current commercial terms, or an endorsement of any provider. GRYPS has no commercial relationship with the providers listed.",
    provenanceLabel: "DATA PROVENANCE",
    provenanceScoringModel: "Scoring engine",
    provenanceScoringModelValue: "deterministic-v0.3 (reproducible; optional Mistral prose only — never changes score)",
    provenanceRealDataSources: "Real-data sources",
    provenanceBittimittari: "Bittimittari (Traficom, Finland) — municipality-level broadband speed/latency, CC BY 4.0",
    provenanceEuDem: "EU-DEM (Copernicus/EEA) — 25m resolution elevation data, accessed via OpenTopoData",
    provenanceDate: "Assessment date",
    provenanceModelVersion: "Model version",
    provenanceInputHash: "Input hash",
    provenanceNotLive: "Illustrative / not live constellation data",
    terrainExplain: "Terrain score is independent of the Resilience Score: higher variance in a ~5 km EU-DEM sample reduces this evidence score. It is not blended into the 0–100 Signature.",
    shareLink: "Copy shareable link",
    shareCopied: "Link copied",
    redundancyTiers: "REDUNDANCY OPTIONS (COST-TIERED)",
    tierEssential: "Essential",
    tierStandard: "Standard",
    tierDefense: "Defense-in-depth",
    whyConfidence: "WHY THIS RANKING",
    elevationField: "ELEVATION / SKY VIEW ",
    coverageField: "COVERAGE ",
    failoverField: "FAILOVER LATENCY ",
    provenanceNote: "Numeric score, grade, risks, and ranked providers are deterministic and reproducible for the same inputs. Optional Mistral text may polish the recommendation paragraph only. Real-data evidence (EU-DEM / Bittimittari) is separate and not blended into the Signature score.",
    aiBadgeTitle:
      "EU AI Act Art. 50 — optional AI-generated recommendation prose (Mistral). Limited-risk system. Score itself is deterministic Model v0.3. Not a guarantee of network availability. Supports human judgement; no automated legal decisions.",
    art50: "Art. 50 EU AI Act",
    generated: "Generated",
    printAttr: "GRYPS — Connectivity Resilience Advisor · gryps.vercel.app",
    notifyCta: "Get notified when full reports launch",
    notifyPlaceholder: "your@email.com",
    notifySubmit: "Notify me",
    notifySubmitting: "Submitting…",
    notifySuccess: "You're on the list — we'll be in touch.",
    notifyNote: "No spam. One-time notification only.",
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
    modelGenerated: "Deterministinen malli v0.3 — havainnollistava tutkimuslähtö, ei kattavuustakuu",
    assessmentInputs: "ARVIOINNIN SYÖTTEET",
    assessmentSub: "Tämän pisteytysajon deterministiset parametrit.",
    coordinates: "KOORDINAATIT",
    sector: "TOIMIALA",
    autonomy: "AUTONOMIATASO",
    criticality: "KRIITTISYYS",
    currentSetup: "NYKYINEN KOKOONPANO",
    notSpecified: "Ei ilmoitettu",
    stricter: "tiukempi kynnys käytössä",
    realData: "REAALIDATANÄYTTÖ",
    realDataSub: "Deterministinen pistemäärä mitatusta kolmannen osapuolen datasta — ei tekoälyn tuottama, eikä sekoitettu yllä olevaan Resilience-pisteeseen. Tämä on reaaliaikaista laskentaa todellisista tietoaineistoista.",
    realWorldGap: "Todellinen kuilu (55 %)",
    terrainPenalty: "Maastorangaistus (45 %)",
    bittiNA: "Ei saatavilla — Bittimittari (Traficom) kattaa vain Suomen",
    demNA: "Ei saatavilla — EU-DEM:ssä on aukko tällä sijainnilla (todennäköisesti avovettä).",
    sources:
      "Todellinen nopeus: Bittimittari (Traficom), CC BY 4.0 · Maasto: Copernicus-data ja EU:n rahoittama tieto — EU-DEM-kerrokset.",
    complianceLabel: "NIS2/CER-VAATIMUSTENMUKAISUUSLIPUT",
    complianceNis2: "NIS2 Art. 21 — Verkko- ja tietojärjestelmien turvatoimet",
    complianceCer: "CER — Kriittisten toimijoiden resilienssiarviointi",
    compliancePass: "KÄSITELTY",
    complianceFail: "RISKISSÄ",
    complianceNote: "Vaatimustenmukaisuusliput ovat suuntaa-antavia, perustuen pisteytysmallin arvioon yhteyden resilienssiasemasta. Ne eivät ole oikeudellista tai sääntelyneuvontaa. Signature tukee valmiusdokumentaatiota — se ei ole sertifiointi.",
    recommendation: "SUOSITUS",
    scoreComposition: "MITEN TÄMÄ PISTE LASKETTIIN",
    scoreCompositionSub: "Mallin v0.3 komponenttijako ennen kovia kattoja. Täysi kaava menetelmäsivulla.",
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
    confidence: "LUOTTAMUS",
    latency: "LATENSSI ",
    reliability: "LUOTETTAVUUS ",
    hardware: "LAITTEISTO ",
    orbitalDisclaimer:
      "Yleiset tekniset ominaisuudet perustuvat julkisesti saatavilla olevaan toimialatietoon — eivät virallisia toimittajamäärityksiä, nykyisiä kaupallisia ehtoja tai minkään toimittajan suositusta. GRYPS:llä ei ole kaupallista suhdetta listattuihin toimittajiin.",
    provenanceLabel: "TIETOJEN ALKUPERÄ",
    provenanceScoringModel: "Pisteytysmoottori",
    provenanceScoringModelValue: "deterministic-v0.3 (toistettava; valinnainen Mistral-proosa — ei muuta pistettä)",
    provenanceRealDataSources: "Reaalidatan lähteet",
    provenanceBittimittari: "Bittimittari (Traficom, Suomi) — kuntakohtainen laajakaistaanopeus/-viive, CC BY 4.0",
    provenanceEuDem: "EU-DEM (Copernicus/EEA) — 25m korkeusdata, OpenTopoData-rajapinnalla",
    provenanceDate: "Arvioinnin päivämäärä",
    provenanceModelVersion: "Malliversio",
    provenanceInputHash: "Syötteen tiiviste",
    provenanceNotLive: "Havainnollistava / ei live-konstellaatiodataa",
    terrainExplain: "Maastopiste on erillinen Resilience-pisteestä: suurempi vaihtelu ~5 km EU-DEM-otoksessa laskee tätä näyttöpistettä. Sitä ei sekoiteta 0–100 Signatureen.",
    shareLink: "Kopioi jaettava linkki",
    shareCopied: "Linkki kopioitu",
    redundancyTiers: "REDUNDANSSIVAIHTOEHDOT (KUSTANNUSTASOT)",
    tierEssential: "Välttämätön",
    tierStandard: "Standardi",
    tierDefense: "Puolustus syvyyteen",
    whyConfidence: "MIKSI TÄMÄ SIJAINTI",
    elevationField: "KORKEUSKULMA / TAIVAS ",
    coverageField: "KATTAVUUS ",
    failoverField: "FAILOVER-VIIVE ",
    provenanceNote: "Pisteet, arvosana, riskit ja rankatut toimittajat ovat deterministisiä ja toistettavia samoilla syötteillä. Valinnainen Mistral-teksti voi hioa vain suosituskappaleen. Reaalidatanäyttö (EU-DEM / Bittimittari) on erillinen eikä sekoitu Signature-pisteeseen.",
    aiBadgeTitle:
      "EU:n tekoälylaki 50 artikla — valinnainen tekoälyn tuottama suositusproosa (Mistral). Rajoitetun riskin järjestelmä. Itse piste on deterministinen malli v0.3. Ei takuu verkkojen saatavuudesta. Tukee ihmisen harkintaa; ei automatisoituja oikeudellisia päätöksiä.",
    art50: "50 artikla, EU:n tekoälylaki",
    generated: "Luotu",
    printAttr: "GRYPS — Connectivity Resilience Advisor · gryps.vercel.app",
    notifyCta: "Saat ilmoituksen kun täydet raportit julkaistaan",
    notifyPlaceholder: "sähköposti@esimerkki.fi",
    notifySubmit: "Ilmoita minulle",
    notifySubmitting: "Lähetetään…",
    notifySuccess: "Olet listalla — olemme yhteydessä.",
    notifyNote: "Ei roskapostia. Vain kertaluonteinen ilmoitus.",
    measured: "mitattu",
    medianDownload: "Mbit/s mediaanilataus",
    medianLatency: "ms mediaaniviive",
    measurements: "mittausta",
    elevation: "m korkeus",
    variance: "m vaihtelu ~5 km otoksessa",
    noDataFor: "ei dataa kohteelle",
  },
} as const

type UiCopy = (typeof UI)[UiLang]

function NotifyCta({ t }: { t: UiCopy }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message: "Notify me when full reports launch", name: null }),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div style={{
        backgroundColor: "rgba(46,212,122,0.06)", border: "1px solid rgba(46,212,122,0.2)",
        borderRadius: 8, padding: "16px 20px", textAlign: "center",
      }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-green)" }}>{t.notifySuccess}</p>
      </div>
    )
  }

  return (
    <div className="gryps-no-print" style={{
      backgroundColor: "rgba(79,168,255,0.04)", border: "1px solid rgba(79,168,255,0.15)",
      borderRadius: 8, padding: "16px 20px",
    }}>
      <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 8 }}>
        {t.notifyCta}
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="email"
          required
          placeholder={t.notifyPlaceholder}
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            flex: 1, backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: 6, padding: "8px 12px", fontFamily: "var(--font-data)",
            fontSize: 12, color: "var(--text)", outline: "none",
          }}
        />
        <button type="submit" disabled={status === "sending"} style={{
          backgroundColor: "#4FA8FF", color: "#070B12", border: "none",
          borderRadius: 6, padding: "8px 16px", fontFamily: "var(--font-ui)",
          fontWeight: 700, fontSize: 12, cursor: status === "sending" ? "wait" : "pointer",
          flexShrink: 0,
        }}>
          {status === "sending" ? t.notifySubmitting : t.notifySubmit}
        </button>
      </form>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", marginTop: 6 }}>{t.notifyNote}</p>
    </div>
  )
}

function AssessmentInputsPanel({ input, t }: { input: AssessmentInputs; t: UiCopy }) {
  const strictAutonomy = input.autonomy_level === "autonomous" || input.autonomy_level === "mixed"
  const strictCriticality = input.operation_criticality === "safety-critical" || input.operation_criticality === "high"

  const rows: { label: string; value: string; note?: string }[] = [
    ...(input.lat != null && input.lng != null
      ? [{ label: t.coordinates, value: `${input.lat.toFixed(2)}°N · ${input.lng.toFixed(2)}°E` }]
      : []),
    { label: t.sector, value: input.sector },
    { label: t.autonomy, value: input.autonomy_level, note: strictAutonomy ? t.stricter : undefined },
    { label: t.criticality, value: input.operation_criticality, note: strictCriticality ? t.stricter : undefined },
    { label: t.currentSetup, value: input.current_setup?.trim() ? input.current_setup : t.notSpecified },
  ]

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 4 }}>{t.assessmentInputs}</p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", marginBottom: 14 }}>
        {t.assessmentSub}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", flexShrink: 0 }}>{row.label}</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text)", textAlign: "right" }}>
              {row.value}
              {row.note && (
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-amber)", marginLeft: 8 }}>↑ {row.note}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function componentLabel(id: string, t: UiCopy): string {
  if (id === "redundancy") return t.componentRedundancy
  if (id === "latitude") return t.componentLatitude
  if (id === "operational_profile") return t.componentProfile
  if (id === "provider_confidence") return t.componentConfidence
  return id
}

function ScoreCompositionPanel({ composition, t }: { composition: ScoreComposition; t: UiCopy }) {
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 4 }}>{t.scoreComposition}</p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
        {t.scoreCompositionSub}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        {composition.components.map(c => {
          const pct = c.max > 0 ? Math.max(0, Math.min(100, (c.points / c.max) * 100)) : 0
          return (
            <div key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{componentLabel(c.id, t)}</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text)", fontWeight: 700 }}>
                  {c.points}/{c.max}
                </span>
              </div>
              <div style={{ height: 4, backgroundColor: "var(--surface2)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "var(--accent-cyan)", borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, paddingTop: 12, borderTop: "1px solid var(--border)", marginBottom: 12 }}>
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 2 }}>{t.scoreRawSum}</p>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{composition.raw_sum}</p>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 2 }}>{t.scoreFinal}</p>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 14, fontWeight: 700, color: "var(--accent-cyan)" }}>{composition.final_score}</p>
        </div>
      </div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: composition.caps_applied.length ? "var(--accent-amber)" : "var(--text-muted)", lineHeight: 1.5, marginBottom: 12 }}>
        {composition.caps_applied.length
          ? `${t.scoreCaps}: ${composition.caps_applied.join(", ")}`
          : t.scoreNoCaps}
      </p>
      <Link href="/methodology" style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", textDecoration: "none" }}>
        {t.methodologyLink}
      </Link>
    </div>
  )
}

// Real, measured data — deliberately separate from and never blended into the
// Resilience Signature score above. Two independent inputs:
// Bittimittari real-world speed/latency (Finland only — Traficom's dataset has
// no coverage outside Finland) and EU-DEM terrain variance (works globally).
// When Bittimittari doesn't apply (non-Finnish site, or a live ad-hoc query
// where no municipality can be resolved), this shows terrain only, clearly
// labeled as such — never a fabricated or interpolated real-world-gap number.
export type RealDataEvidence = {
  realDataScore: number
  terrainPenaltyScore: number | null
  elevationCenterM: number | null
  elevationVarianceM: number | null
  realWorldGapScore: number | null
  municipality: string | null
  bittimittariPeriod: string | null
  bittimittariSampleCount: number | null
  bittimittariMedianDownloadMbps: number | null
  bittimittariMedianLatencyMs: number | null
}

function RealDataEvidencePanel({ data, t, lang = "en" }: { data: RealDataEvidence; t: UiCopy; lang?: UiLang }) {
  const scoreColor = data.realDataScore >= 70 ? "var(--accent-green)" : data.realDataScore >= 40 ? "var(--accent-amber)" : "var(--accent-red)"
  const terrainOnly = data.realWorldGapScore == null

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{t.realData}</p>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 20, fontWeight: 900, color: scoreColor }}>{data.realDataScore}</span>
          {terrainOnly && (
            <p style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)" }}>
              {lang === "fi" ? "vain maasto" : "terrain only"}
            </p>
          )}
        </div>
      </div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", marginBottom: 14 }}>
        {t.realDataSub}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
        {t.terrainExplain}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, color: "var(--text)" }}>{t.realWorldGap}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)" }}>{data.realWorldGapScore ?? "—"}</span>
          </div>
          {data.realWorldGapScore != null ? (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.6 }}>
              {data.municipality} · {t.measured} {data.bittimittariMedianDownloadMbps?.toFixed(1)} {t.medianDownload}, {data.bittimittariMedianLatencyMs?.toFixed(0)}{t.medianLatency}
              ({data.bittimittariSampleCount} {t.measurements}, {data.bittimittariPeriod})
            </p>
          ) : (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6 }}>
              {t.bittiNA}{data.municipality === null ? "" : ` (${t.noDataFor} ${data.municipality})`}.
            </p>
          )}
        </div>

        <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 11, color: "var(--text)" }}>{t.terrainPenalty}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text)" }}>{data.terrainPenaltyScore ?? "—"}</span>
          </div>
          {data.terrainPenaltyScore != null && data.elevationCenterM != null && data.elevationVarianceM != null ? (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.6 }}>
              {data.elevationCenterM.toFixed(0)}{t.elevation}, ±{data.elevationVarianceM.toFixed(1)}{t.variance}
            </p>
          ) : (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6 }}>
              {t.demNA}
            </p>
          )}
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-dim)", lineHeight: 1.6, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        {t.sources}
      </p>
    </div>
  )
}

export function ResilienceOutput({
  result,
  input,
  realData,
  lang = "en",
}: {
  result: AdvisoryResult
  input?: AssessmentInputs
  realData?: RealDataEvidence
  lang?: UiLang
}) {
  const t = UI[lang]
  const { resilience_signature: sig, risk_factors, redundancy_gaps, connectivity_options, recommendation, caveats, score_composition } = result
  const gc = gradeColor(sig.grade)
  const gtc = gradeTextColor(sig.grade)
  const flags = computeComplianceFlags(result, input)
  const tiers = redundancyTiers(input)
  const issued = result.issuedAt ? new Date(result.issuedAt) : new Date()
  const dateLabel = issued.toLocaleDateString(lang === "fi" ? "fi-FI" : "en-GB", { day: "numeric", month: "long", year: "numeric" })
  const [copied, setCopied] = useState(false)

  function copyShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
      <div className="gryps-no-print" style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={copyShare}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: 6, padding: "8px 14px", cursor: "pointer",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)",
          }}
        >
          {copied ? t.shareCopied : t.shareLink}
        </button>
        <button
        className="gryps-no-print"
        onClick={() => window.print()}
        style={{
          alignSelf: "flex-end", display: "inline-flex", alignItems: "center", gap: 6,
          backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
          borderRadius: 6, padding: "8px 14px", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)",
        }}
      >
        <Download size={13} /> {t.downloadPdf}
        </button>
      </div>

      <div className="gryps-signature-card" style={{
        backgroundColor: "var(--surface)",
        border: `1px solid ${gc}44`,
        borderRadius: 12,
        padding: "28px 32px",
        display: "flex", alignItems: "center", gap: 32,
      }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div
            aria-label={`Resilience score ${sig.score} out of 100, grade ${sig.grade}`}
            style={{ fontFamily: "var(--font-data)", fontSize: 72, fontWeight: 900, color: gtc, lineHeight: 1, letterSpacing: "-0.04em" }}
          >
            {sig.score}
          </div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", marginTop: 4 }}>{t.resilienceScore}</div>
          <span className="sr-only">Grade {sig.grade}. Scale A 85 and above resilient, through F below 30 critical failure.</span>
        </div>
        <div className="gryps-signature-divider" style={{ width: 1, height: 64, backgroundColor: "var(--border)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{
              fontFamily: "var(--font-data)", fontSize: 18, fontWeight: 900, color: gtc,
              border: `1px solid ${gc}55`, borderRadius: 6, padding: "2px 12px",
            }} aria-hidden="true">{sig.grade}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em" }}>{t.resilienceSignature}</span>
          </div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{sig.summary}</p>
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", textAlign: "center" }}>
        {t.modelGenerated}
      </p>

      {input && <AssessmentInputsPanel input={input} t={t} />}

      {score_composition && <ScoreCompositionPanel composition={score_composition} t={t} />}

      {realData && <RealDataEvidencePanel data={realData} t={t} lang={lang} />}

      <div style={{
        backgroundColor: "rgba(79,168,255,0.06)", border: "1px solid rgba(79,168,255,0.2)",
        borderRadius: 8, padding: "16px 20px",
      }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-blue)", letterSpacing: "0.12em", marginBottom: 8 }}>{t.recommendation}</p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{recommendation}</p>
      </div>

      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 12 }}>{t.complianceLabel}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {flags.map(flag => (
            <div key={flag.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)" }}>{flag.id === "nis2-art21" ? t.complianceNis2 : t.complianceCer}</span>
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: 9, fontWeight: 700,
                  color: flag.pass ? "var(--accent-green)" : "var(--accent-red)",
                  border: `1px solid ${flag.pass ? "rgba(46,212,122,0.3)" : "rgba(239,68,68,0.3)"}`,
                  borderRadius: 4, padding: "2px 8px",
                }}>{flag.pass ? t.compliancePass : t.complianceFail}</span>
              </div>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5, marginTop: 4 }}>{flag.reason}</p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-dim)", lineHeight: 1.6, marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          {t.complianceNote}
        </p>
      </div>

      <div className="gryps-output-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>{t.riskFactors}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {risk_factors.map((r, i) => {
              const vivid = SEV_COLOR_VIVID[r.severity] ?? "#64748B"
              const textColor = SEV_COLOR[r.severity] ?? "var(--text-muted)"
              const Icon = SEV_ICON[r.severity] ?? AlertCircle
              return (
                <div key={i} style={{
                  display: "flex", gap: 10,
                  backgroundColor: `${vivid}14`,
                  border: `1px solid ${vivid}40`,
                  borderLeft: `3px solid ${vivid}`,
                  borderRadius: 6, padding: "10px 12px",
                }}>
                  <Icon size={16} color={textColor} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)" }}>{r.label}</span>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: textColor, marginLeft: "auto", flexShrink: 0 }}>{r.severity.toUpperCase()}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{r.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>{t.redundancyGaps}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {redundancy_gaps.map((g, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "var(--text)" }}>{g.label}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-red)", marginLeft: "auto" }}>{t.scoreImpact}</span>
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{g.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>{t.connectivityOptions}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {connectivity_options.map((o, i) => {
            const tech = getOrbitalCharacteristics(o.type, o.provider)
            return (
              <div key={i} style={{
                backgroundColor: "var(--surface2)", border: `1px solid ${i === 0 ? "rgba(79,168,255,0.2)" : "var(--border)"}`,
                borderRadius: 6, padding: "10px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{o.provider}</span>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", backgroundColor: "var(--border)", padding: "1px 6px", borderRadius: 3 }}>{o.type}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}>{o.note}</p>
                    {(o.elevation || o.coverage || o.failover_latency) && (
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                        <p style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.1em" }}>{t.whyConfidence}</p>
                        {o.elevation && <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.5 }}><span style={{ fontWeight: 700 }}>{t.elevationField}</span>{o.elevation}</p>}
                        {o.coverage && <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.5 }}><span style={{ fontWeight: 700 }}>{t.coverageField}</span>{o.coverage}</p>}
                        {o.failover_latency && <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.5 }}><span style={{ fontWeight: 700 }}>{t.failoverField}</span>{o.failover_latency}</p>}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: 22, fontWeight: 700, color: i === 0 ? "var(--accent-blue)" : "var(--text)", lineHeight: 1 }}>
                      {o.confidence}<span style={{ fontSize: 10, color: "var(--text-muted)" }}>%</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.1em" }}>{t.confidence}</div>
                  </div>
                </div>
                {tech && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6 }}>
                      <span style={{ fontFamily: "var(--font-data)", fontWeight: 700 }}>{t.latency}</span>{tech.latency}
                    </p>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6 }}>
                      <span style={{ fontFamily: "var(--font-data)", fontWeight: 700 }}>{t.reliability}</span>{tech.reliability}
                    </p>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6 }}>
                      <span style={{ fontFamily: "var(--font-data)", fontWeight: 700 }}>{t.hardware}</span>{tech.hardware}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          {t.orbitalDisclaimer}
        </p>
      </div>

      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 14 }}>{t.redundancyTiers}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tiers.map(tier => (
            <div key={tier.id} style={{ borderLeft: "2px solid var(--accent-blue)", paddingLeft: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{tier.label}</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)" }}>
                  {tier.tier === "essential" ? t.tierEssential : tier.tier === "standard" ? t.tierStandard : t.tierDefense}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--accent-blue)", marginTop: 4 }}>{tier.estimate}</p>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 4 }}>{tier.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 12 }}>{t.provenanceLabel}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", flexShrink: 0 }}>{t.provenanceScoringModel}</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>{t.provenanceScoringModelValue}</span>
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{t.provenanceRealDataSources}</span>
            <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
              <li style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{t.provenanceBittimittari}</li>
              <li style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{t.provenanceEuDem}</li>
            </ul>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", flexShrink: 0 }}>{t.provenanceDate}</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}>{dateLabel}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", flexShrink: 0 }}>{t.provenanceModelVersion}</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)" }}>{result.modelVersion ?? MODEL_VERSION}</span>
          </div>
          {result.inputHash && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", flexShrink: 0 }}>{t.provenanceInputHash}</span>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)" }}>{result.inputHash}</span>
            </div>
          )}
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-amber)", letterSpacing: "0.06em" }}>{t.provenanceNotLive}</p>
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-dim)", lineHeight: 1.6, marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          {t.provenanceNote}
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span
          title={t.aiBadgeTitle}
          style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)", border: "1px solid var(--border)", borderRadius: 3, padding: "2px 5px", flexShrink: 0, marginTop: 2, cursor: "help" }}
        >AI</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>
          {caveats.join(" · ")} · <Link href="/terms" style={{ color: "var(--text-dim)", textDecoration: "underline" }}>{t.art50}</Link>
        </p>
      </div>

      <div className="gryps-print-only" style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>
          {t.generated} {dateLabel} · {t.printAttr} · {result.modelVersion ?? MODEL_VERSION}
        </p>
      </div>

      <NotifyCta t={t} />
    </div>
  )
}

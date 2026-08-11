"use client"
import Link from "next/link"
import { ShieldAlert, AlertTriangle, AlertCircle, ShieldCheck, Download } from "lucide-react"
import { gradeColor, gradeTextColor, type AdvisoryResult, type AssessmentInputs } from "@/lib/resilience-colors"

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
    realDataSub: "Deterministic score from measured third-party data — not model-generated, and not blended into the score above.",
    realWorldGap: "Real-world gap (55%)",
    terrainPenalty: "Terrain penalty (45%)",
    bittiNA: "Not available — Bittimittari (Traficom) covers Finland only",
    demNA: "Not available — EU-DEM has a data gap at this location (likely open water).",
    sources:
      "Real-world speed: Bittimittari (Traficom), licensed under CC BY 4.0 · Terrain: Produced using Copernicus data and information funded by the European Union — EU-DEM layers.",
    recommendation: "RECOMMENDATION",
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
    aiBadgeTitle:
      "EU AI Act Art. 50 — AI-generated analytical summary (Mistral). Limited-risk system. Not a guarantee of network availability. Supports human judgement; no automated legal decisions.",
    art50: "Art. 50 EU AI Act",
    generated: "Generated",
    printAttr: "GRYPS — Connectivity Resilience Advisor · gryps.vercel.app",
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
    realDataSub: "Deterministinen pistemäärä mitatusta kolmannen osapuolen datasta — ei mallin tuottama, eikä sekoitettu yllä olevaan pistemäärään.",
    realWorldGap: "Todellinen kuilu (55 %)",
    terrainPenalty: "Maastorangaistus (45 %)",
    bittiNA: "Ei saatavilla — Bittimittari (Traficom) kattaa vain Suomen",
    demNA: "Ei saatavilla — EU-DEM:ssä on aukko tällä sijainnilla (todennäköisesti avovettä).",
    sources:
      "Todellinen nopeus: Bittimittari (Traficom), CC BY 4.0 · Maasto: Copernicus-data ja EU:n rahoittama tieto — EU-DEM-kerrokset.",
    recommendation: "SUOSITUS",
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
    aiBadgeTitle:
      "EU:n tekoälylaki 50 artikla — tekoälyn tuottama analyyttinen yhteenveto (Mistral). Rajoitetun riskin järjestelmä. Ei takuu verkkojen saatavuudesta. Tukee ihmisen harkintaa; ei automatisoituja oikeudellisia päätöksiä.",
    art50: "50 artikla, EU:n tekoälylaki",
    generated: "Luotu",
    printAttr: "GRYPS — Connectivity Resilience Advisor · gryps.vercel.app",
    measured: "mitattu",
    medianDownload: "Mbit/s mediaanilataus",
    medianLatency: "ms mediaaniviive",
    measurements: "mittausta",
    elevation: "m korkeus",
    variance: "m vaihtelu ~5 km otoksessa",
    noDataFor: "ei dataa kohteelle",
  },
} as const

type UiCopy = (typeof UI)["en"]

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

// Real, measured data — deliberately separate from and never blended into the
// Mistral-generated resilience_signature score above. Two independent inputs:
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

function RealDataEvidencePanel({ data, t }: { data: RealDataEvidence; t: UiCopy }) {
  const scoreColor = data.realDataScore >= 70 ? "var(--accent-green)" : data.realDataScore >= 40 ? "var(--accent-amber)" : "var(--accent-red)"

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{t.realData}</p>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 20, fontWeight: 900, color: scoreColor }}>{data.realDataScore}</span>
      </div>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", marginBottom: 14 }}>
        {t.realDataSub}
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
  const { resilience_signature: sig, risk_factors, redundancy_gaps, connectivity_options, recommendation, caveats } = result
  const gc = gradeColor(sig.grade)
  const gtc = gradeTextColor(sig.grade)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
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

      <div className="gryps-signature-card" style={{
        backgroundColor: "var(--surface)",
        border: `1px solid ${gc}44`,
        borderRadius: 12,
        padding: "28px 32px",
        display: "flex", alignItems: "center", gap: 32,
      }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 72, fontWeight: 900, color: gtc, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {sig.score}
          </div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", marginTop: 4 }}>{t.resilienceScore}</div>
        </div>
        <div className="gryps-signature-divider" style={{ width: 1, height: 64, backgroundColor: "var(--border)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{
              fontFamily: "var(--font-data)", fontSize: 18, fontWeight: 900, color: gtc,
              border: `1px solid ${gc}55`, borderRadius: 6, padding: "2px 12px",
            }}>{sig.grade}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em" }}>{t.resilienceSignature}</span>
          </div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{sig.summary}</p>
        </div>
      </div>

      {input && <AssessmentInputsPanel input={input} t={t} />}

      {realData && <RealDataEvidencePanel data={realData} t={t} />}

      <div style={{
        backgroundColor: "rgba(79,168,255,0.06)", border: "1px solid rgba(79,168,255,0.2)",
        borderRadius: 8, padding: "16px 20px",
      }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-blue)", letterSpacing: "0.12em", marginBottom: 8 }}>{t.recommendation}</p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{recommendation}</p>
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

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span
          title={t.aiBadgeTitle}
          style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)", border: "1px solid var(--border)", borderRadius: 3, padding: "2px 5px", flexShrink: 0, marginTop: 2, cursor: "help" }}
        >AI</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>
          {caveats.join(" · ")} · <Link href="/legal/terms#section-04" style={{ color: "var(--text-dim)", textDecoration: "underline" }}>{t.art50}</Link>
        </p>
      </div>

      <div className="gryps-print-only" style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>
          {t.generated} {new Date().toLocaleDateString(lang === "fi" ? "fi-FI" : "en-GB", { day: "numeric", month: "long", year: "numeric" })} · {t.printAttr}
        </p>
      </div>
    </div>
  )
}

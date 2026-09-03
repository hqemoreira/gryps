import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors"

export type ExampleSignature = {
  id: string
  title: string
  titleFi: string
  input: AssessmentInputs
  result: AdvisoryResult
}

export const EXAMPLE_SIGNATURES: ExampleSignature[] = [
  {
    id: "maritime-offshore",
    title: "Maritime — Offshore Platform, Arctic Norway",
    titleFi: "Merenkulku — Offshore-alusta, arktinen Norja",
    input: {
      lat: 71.0, lng: 25.9,
      sector: "maritime",
      autonomy_level: "remote-operated",
      operation_criticality: "safety-critical",
      current_setup: "Single Inmarsat FleetBroadband, no LEO backup",
    },
    result: {
      resilience_signature: {
        score: 35,
        grade: "D",
        summary: "Safety-critical maritime platform at 71°N with single GEO provider. High-latitude elevation angle degradation and no redundancy path create unacceptable single-point-of-failure risk.",
      },
      risk_factors: [
        { label: "Single-provider dependency", severity: "critical", detail: "Only one satellite link (Inmarsat GEO). Any service interruption means total connectivity loss for a safety-critical offshore operation." },
        { label: "GEO elevation angle at 71°N", severity: "high", detail: "Geostationary satellites sit very low on the horizon at this latitude, increasing signal attenuation and weather vulnerability." },
      ],
      redundancy_gaps: [
        { label: "No LEO backup path", detail: "Adding a Starlink or Iridium Certus terminal would provide an independent orbital-class backup and dramatically reduce single-point-of-failure risk." },
      ],
      connectivity_options: [
        { provider: "Iridium Certus", type: "Polar LEO narrowband", confidence: 92, note: "True polar coverage, ideal high-latitude backup for safety-critical comms." },
        { provider: "Starlink", type: "LEO broadband", confidence: 82, note: "High-bandwidth LEO option with improving polar coverage. Maritime terminal available." },
        { provider: "Inmarsat Global Xpress", type: "GEO Ka-band", confidence: 55, note: "Existing provider upgrade path, but GEO limitations persist at this latitude." },
      ],
      recommendation: "Immediately add an Iridium Certus terminal as an independent backup link. The current single-GEO setup at 71°N does not meet the resilience threshold for safety-critical operations. A dual LEO+GEO architecture would raise this score to 70+.",
      caveats: [
        "Score reflects current single-provider configuration, not the platform's potential with redundancy",
        "AI-generated assessment — not a substitute for professional connectivity planning",
      ],
    },
  },
  {
    id: "mining-autonomous",
    title: "Mining — Autonomous Haul Fleet, Northern Sweden",
    titleFi: "Kaivostoiminta — Autonominen kuljetuslaivasto, Pohjois-Ruotsi",
    input: {
      lat: 67.85, lng: 20.22,
      sector: "mining",
      autonomy_level: "autonomous",
      operation_criticality: "safety-critical",
      current_setup: "Starlink + Iridium Certus dual redundancy",
    },
    result: {
      resilience_signature: {
        score: 78,
        grade: "B",
        summary: "Dual-provider LEO architecture with independent orbital types. Strong redundancy posture for an autonomous safety-critical mining fleet, with minor improvement opportunities in failover automation.",
      },
      risk_factors: [
        { label: "Autonomous fleet dependency", severity: "medium", detail: "Fully autonomous haulers require sub-second failover. Current manual failover configuration introduces a connectivity gap during switchover." },
        { label: "Weather susceptibility", severity: "low", detail: "LEO broadband (Starlink) can degrade in heavy snowfall. Narrowband backup (Iridium) maintains safety-critical control channel." },
      ],
      redundancy_gaps: [
        { label: "No terrestrial fallback", detail: "Adding a terrestrial LTE/5G link where mine infrastructure permits would create a third independent path for defense-in-depth." },
      ],
      connectivity_options: [
        { provider: "Starlink", type: "LEO broadband", confidence: 88, note: "Primary high-bandwidth link for telemetry, video, and fleet coordination.", elevation: "Phased array; needs open pit sky view.", coverage: "Improving polar shell at 67°N.", failover_latency: "Seconds if auto; minutes if manual." },
        { provider: "Iridium Certus", type: "Polar LEO narrowband", confidence: 93, note: "Independent safety-critical backup with true polar coverage.", elevation: "Low-profile omni; modest sky view.", coverage: "True polar.", failover_latency: "Sub-minute if pre-provisioned." },
        { provider: "OneWeb", type: "LEO broadband", confidence: 80, note: "Alternative LEO broadband provider for additional orbital diversity.", elevation: "High-inclination LEO.", coverage: "Polar-optimized.", failover_latency: "Minutes to provision if not installed." },
      ],
      recommendation: "Current dual-LEO setup is strong. To reach A-grade, implement automatic failover between Starlink and Iridium, and explore adding a private LTE network within the mine perimeter for a third independent path.",
      caveats: [
        "Score assumes both satellite terminals are operational and maintained",
        "AI-generated assessment — not a substitute for professional connectivity planning",
      ],
    },
  },
  {
    id: "forestry-mixed",
    title: "Forestry — Harvester Fleet, Finnish Lapland",
    titleFi: "Metsätalous — Harvesterilaivaston, Suomen Lappi",
    input: {
      lat: 68.2, lng: 27.4,
      sector: "forestry",
      autonomy_level: "autonomous",
      operation_criticality: "safety-critical",
      current_setup: "Starlink standard kit, no backup",
    },
    result: {
      resilience_signature: {
        score: 38,
        grade: "D",
        summary: "Safety-critical autonomous harvester fleet at 68°N with a single LEO provider and no backup. Terrain obstruction risk in forested valleys further degrades reliability.",
      },
      risk_factors: [
        { label: "Single-provider dependency", severity: "critical", detail: "Only Starlink — any service disruption halts the entire autonomous fleet with no fallback path." },
        { label: "Forest canopy and terrain obstruction", severity: "high", detail: "Dense boreal forest and valley terrain can obstruct LEO satellite line-of-sight, causing intermittent connectivity drops." },
      ],
      redundancy_gaps: [
        { label: "No independent backup link", detail: "An Iridium Certus narrowband terminal would maintain safety-critical command/control even during Starlink outages." },
        { label: "No local mesh network", detail: "A local mesh between harvesters could maintain fleet coordination during satellite gaps." },
      ],
      connectivity_options: [
        { provider: "Starlink", type: "LEO broadband", confidence: 75, note: "Current primary. Reliable at this latitude but single-provider risk is critical for safety-critical ops." },
        { provider: "Iridium Certus", type: "Polar LEO narrowband", confidence: 90, note: "Ideal backup — true polar coverage, works through forest canopy better than broadband LEO." },
        { provider: "OneWeb", type: "LEO broadband", confidence: 78, note: "Alternative broadband LEO for orbital diversity." },
      ],
      recommendation: "Add Iridium Certus immediately as an independent safety-critical backup. Consider a local mesh network between harvesters for fleet-to-fleet coordination. This would raise the score to 65+.",
      caveats: [
        "Terrain penalty is estimated from EU-DEM elevation data, not on-site survey",
        "AI-generated assessment — not a substitute for professional connectivity planning",
      ],
      issuedAt: "2026-08-12T15:10:12.000Z",
      modelVersion: "gryps-signature-v1",
      inputHash: "ex-forestry-mixed",
    },
  },
  {
    id: "iceland-autonomous-fleet",
    title: "Autonomous fleet — Coastal inspection, Iceland",
    titleFi: "Autonominen laivasto — Rannikkotarkastus, Islanti",
    input: {
      lat: 64.15, lng: -21.95,
      sector: "arctic",
      autonomy_level: "autonomous",
      operation_criticality: "high",
      current_setup: "OneWeb LEO + Iridium Certus backup",
    },
    result: {
      resilience_signature: {
        score: 72,
        grade: "B",
        summary: "Autonomous coastal inspection fleet with dual LEO paths (broadband + polar narrowband). High criticality is documented; remaining gap is automated failover, not missing hardware.",
      },
      risk_factors: [
        { label: "Manual failover delay", severity: "medium", detail: "Terminals exist; switchover is still operator-driven, which stretches incident response for unmanned craft." },
        { label: "North Atlantic weather windows", severity: "medium", detail: "Broadband LEO can degrade in heavy precipitation; narrowband backup preserves command." },
      ],
      redundancy_gaps: [
        { label: "No automatic failover policy", detail: "Documented dual terminals without automated path selection still leave a human-in-the-loop gap." },
      ],
      connectivity_options: [
        { provider: "OneWeb", type: "LEO broadband", confidence: 86, note: "Primary telemetry/video.", elevation: "High-inclination LEO — usable sky view at 64°N with clear horizon.", coverage: "Polar-optimized constellation.", failover_latency: "~seconds if auto; minutes if crew-switched." },
        { provider: "Iridium Certus", type: "Polar LEO narrowband", confidence: 91, note: "Independent safety/control channel.", elevation: "Omnidirectional terminal; modest sky-view need.", coverage: "True polar including high latitudes.", failover_latency: "Sub-minute if pre-provisioned." },
        { provider: "Starlink", type: "LEO broadband", confidence: 80, note: "Optional third broadband path for orbital diversity.", elevation: "Phased-array needs open sky.", coverage: "Improving high-latitude shell.", failover_latency: "Minutes to provision if not already installed." },
      ],
      recommendation: "Keep dual-LEO hardware. Implement automatic failover to reach A-band without adding a third constellation.",
      caveats: [
        "Illustrative Signature — not live coverage or a site survey",
        "Not insurance or NIS2 legal advice",
      ],
      issuedAt: "2026-09-01T12:00:00.000Z",
      modelVersion: "gryps-signature-v1",
      inputHash: "ex-iceland-fleet",
    },
  },
]

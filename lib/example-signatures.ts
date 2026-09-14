import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors";

export type ExampleSignature = {
  id: string;
  title: string;
  titleFi: string;
  input: AssessmentInputs;
  result: AdvisoryResult;
};

export const EXAMPLE_SIGNATURES: ExampleSignature[] = [
  {
    id: "maritime-offshore",
    title: "Maritime — Offshore Platform, Arctic Norway",
    titleFi: "Merenkulku — Merellä toimiva alusta, arktinen Norja",
    input: {
      lat: 71.0,
      lng: 25.9,
      sector: "maritime",
      autonomy_level: "remote-operated",
      operation_criticality: "safety-critical",
      current_setup: "Single Inmarsat FleetBroadband, no LEO backup",
    },
    result: {
      resilience_signature: {
        score: 35,
        grade: "D",
        summary:
          "Safety-critical maritime platform at 71°N with single GEO provider. High-latitude elevation angle degradation and no redundancy path create unacceptable single-point-of-failure risk.",
      },
      risk_factors: [
        {
          label: "Single-provider dependency",
          severity: "critical",
          detail:
            "Only one satellite link (Inmarsat GEO). Any service interruption means total connectivity loss for a safety-critical offshore operation.",
        },
        {
          label: "GEO elevation angle at 71°N",
          severity: "high",
          detail:
            "Geostationary satellites sit very low on the horizon at this latitude, increasing signal attenuation and weather vulnerability.",
        },
      ],
      redundancy_gaps: [
        {
          label: "No LEO backup path",
          detail:
            "Model commentary: an independent LEO path (broadband or polar narrowband) would reduce single-point-of-failure risk for this profile — not a provider commitment.",
        },
      ],
      connectivity_options: [
        {
          provider: "Iridium Certus",
          type: "Polar LEO narrowband",
          confidence: 92,
          note: "Catalog-ranked polar narrowband option for high-latitude backup diversity.",
        },
        {
          provider: "Starlink",
          type: "LEO broadband",
          confidence: 82,
          note: "Catalog-ranked LEO broadband option with improving high-latitude coverage notes.",
        },
        {
          provider: "Inmarsat Global Xpress",
          type: "GEO Ka-band",
          confidence: 55,
          note: "Existing GEO upgrade path; latitude constraints remain in the model.",
        },
      ],
      recommendation:
        "Model commentary: document an independent LEO backup alongside the current GEO path. Single-GEO at 71°N scores below the model's resilience threshold for safety-critical operations. A dual LEO+GEO architecture would raise this modeled score into a stronger band.",
      caveats: [
        "Score reflects current single-provider configuration in Model v0.3 — not live network performance",
        "Model commentary — not a substitute for professional connectivity planning or a provider SLA",
      ],
    },
  },
  {
    id: "mining-autonomous",
    title: "Mining — Autonomous Haul Fleet, Northern Sweden",
    titleFi: "Kaivostoiminta — Autonominen kuljetuslaivasto, Pohjois-Ruotsi",
    input: {
      lat: 67.85,
      lng: 20.22,
      sector: "mining",
      autonomy_level: "autonomous",
      operation_criticality: "safety-critical",
      current_setup: "Starlink + Iridium Certus dual redundancy",
    },
    result: {
      resilience_signature: {
        score: 78,
        grade: "B",
        summary:
          "Dual-provider LEO architecture with independent orbital types. Strong redundancy posture for an autonomous safety-critical mining fleet, with minor improvement opportunities in failover automation.",
      },
      risk_factors: [
        {
          label: "Autonomous fleet dependency",
          severity: "medium",
          detail:
            "Model commentary: autonomous haulers are sensitive to failover timing. Manual switchover leaves a modeled connectivity gap during path change.",
        },
        {
          label: "Weather susceptibility",
          severity: "low",
          detail:
            "Model commentary: LEO broadband can degrade in heavy snowfall; polar narrowband is ranked as a control-channel backup in the catalog — not a measured availability claim.",
        },
      ],
      redundancy_gaps: [
        {
          label: "No terrestrial fallback",
          detail:
            "Where mine infrastructure permits, a terrestrial LTE/5G path would add a third independent class in the model.",
        },
      ],
      connectivity_options: [
        {
          provider: "Starlink",
          type: "LEO broadband",
          confidence: 88,
          note: "Primary high-bandwidth path in the modeled ranking.",
          elevation: "Phased array; needs open pit sky view.",
          coverage: "Improving polar shell at 67°N (catalog note).",
          failover_latency: "Model estimate: seconds if auto; minutes if manual.",
        },
        {
          provider: "Iridium Certus",
          type: "Polar LEO narrowband",
          confidence: 93,
          note: "Independent narrowband backup in the modeled ranking.",
          elevation: "Low-profile omni; modest sky view.",
          coverage: "True polar (catalog note).",
          failover_latency: "Model estimate: sub-minute if pre-provisioned.",
        },
        {
          provider: "OneWeb",
          type: "LEO broadband",
          confidence: 80,
          note: "Alternative LEO broadband for orbital diversity in the ranking.",
          elevation: "High-inclination LEO.",
          coverage: "Polar-optimized (catalog note).",
          failover_latency: "Model estimate: minutes to provision if not installed.",
        },
      ],
      recommendation:
        "Model commentary: dual-LEO posture is comparatively strong. Automatic failover and an optional terrestrial third path would improve the modeled grade further — not a live SLA or site survey.",
      caveats: [
        "Score assumes both satellite terminals are operational and maintained — model posture, not live monitoring",
        "Model commentary — not a substitute for professional connectivity planning or a provider SLA",
      ],
    },
  },
  {
    id: "forestry-mixed",
    title: "Forestry — Harvester Fleet, Finnish Lapland",
    titleFi: "Metsätalous — Hakkuukonelaivasto, Suomen Lappi",
    input: {
      lat: 68.2,
      lng: 27.4,
      sector: "forestry",
      autonomy_level: "autonomous",
      operation_criticality: "safety-critical",
      current_setup: "Starlink standard kit, no backup",
    },
    result: {
      resilience_signature: {
        score: 38,
        grade: "D",
        summary:
          "Safety-critical autonomous harvester fleet at 68°N with a single LEO provider and no backup. Terrain obstruction risk in forested valleys further degrades reliability.",
      },
      risk_factors: [
        {
          label: "Single-provider dependency",
          severity: "critical",
          detail:
            "Only Starlink — any service disruption halts the entire autonomous fleet with no fallback path.",
        },
        {
          label: "Forest canopy and terrain obstruction",
          severity: "high",
          detail:
            "Dense boreal forest and valley terrain can obstruct LEO satellite line-of-sight, causing intermittent connectivity drops.",
        },
      ],
      redundancy_gaps: [
        {
          label: "No independent backup link",
          detail:
            "Model commentary: a polar narrowband terminal is ranked as a safety/control backup during broadband LEO gaps — not a measured outage profile.",
        },
        {
          label: "No local mesh network",
          detail:
            "A local mesh between harvesters could maintain fleet coordination during satellite gaps (illustrative architecture note).",
        },
      ],
      connectivity_options: [
        {
          provider: "Starlink",
          type: "LEO broadband",
          confidence: 75,
          note: "Current primary in the model. Single-provider risk dominates for safety-critical ops.",
        },
        {
          provider: "Iridium Certus",
          type: "Polar LEO narrowband",
          confidence: 90,
          note: "Ranked backup — polar narrowband catalog profile suited to high-latitude control channels.",
        },
        {
          provider: "OneWeb",
          type: "LEO broadband",
          confidence: 78,
          note: "Alternative broadband LEO for orbital diversity in the ranking.",
        },
      ],
      recommendation:
        "Model commentary: add an independent narrowband backup path and consider local mesh for fleet coordination. That architecture would raise the modeled score into a stronger band — not a live coverage guarantee.",
      caveats: [
        "Terrain penalty is estimated from EU-DEM elevation data, not on-site survey",
        "Model commentary — not a substitute for professional connectivity planning or a provider SLA",
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
      lat: 64.15,
      lng: -21.95,
      sector: "arctic",
      autonomy_level: "autonomous",
      operation_criticality: "high",
      current_setup: "OneWeb LEO + Iridium Certus backup",
    },
    result: {
      resilience_signature: {
        score: 72,
        grade: "B",
        summary:
          "Autonomous coastal inspection fleet with dual LEO paths (broadband + polar narrowband). High criticality is documented; remaining gap is automated failover, not missing hardware.",
      },
      risk_factors: [
        {
          label: "Manual failover delay",
          severity: "medium",
          detail:
            "Terminals exist; switchover is still operator-driven, which stretches incident response for unmanned craft.",
        },
        {
          label: "North Atlantic weather windows",
          severity: "medium",
          detail:
            "Broadband LEO can degrade in heavy precipitation; narrowband backup preserves command.",
        },
      ],
      redundancy_gaps: [
        {
          label: "No automatic failover policy",
          detail:
            "Documented dual terminals without automated path selection still leave a human-in-the-loop gap.",
        },
      ],
      connectivity_options: [
        {
          provider: "OneWeb",
          type: "LEO broadband",
          confidence: 86,
          note: "Primary telemetry/video in the modeled ranking.",
          elevation: "High-inclination LEO — usable sky view at 64°N with clear horizon.",
          coverage: "Polar-optimized constellation (catalog note).",
          failover_latency: "Model estimate: seconds if auto; minutes if crew-switched.",
        },
        {
          provider: "Iridium Certus",
          type: "Polar LEO narrowband",
          confidence: 91,
          note: "Independent safety/control channel in the ranking.",
          elevation: "Omnidirectional terminal; modest sky-view need.",
          coverage: "True polar including high latitudes (catalog note).",
          failover_latency: "Model estimate: sub-minute if pre-provisioned.",
        },
        {
          provider: "Starlink",
          type: "LEO broadband",
          confidence: 80,
          note: "Optional third broadband path for orbital diversity.",
          elevation: "Phased-array needs open sky.",
          coverage: "Improving high-latitude shell (catalog note).",
          failover_latency: "Model estimate: minutes to provision if not already installed.",
        },
      ],
      recommendation:
        "Model commentary: keep dual-LEO hardware. Automatic failover would improve the modeled grade without adding a third constellation — not a live coverage or SLA claim.",
      caveats: [
        "Illustrative Signature — not live coverage or a site survey",
        "Model commentary — not insurance, NIS2 legal advice, or a provider SLA",
      ],
      issuedAt: "2026-09-01T12:00:00.000Z",
      modelVersion: "gryps-signature-v1",
      inputHash: "ex-iceland-fleet",
    },
  },
];

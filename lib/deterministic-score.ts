import { normalizePriorities, type AdvisorPriorityId } from "@/lib/advisor-priorities";
import {
  applyPriorityRanking,
  buildAdvisorIntelligence,
  priorityRankBonus,
  type AdvisorIntelligence,
} from "@/lib/advisor-intelligence";
import { buildEvidencePackage, type EvidencePackage } from "@/lib/evidence-model";
import {
  CONDITIONS_MAX,
  CONFIDENCE_RANGE_HALF,
  MITIGATION_MAX,
  PROFILE_ALIGNMENT_MAX_V04,
  PROVIDER_INDEPENDENCE_MAX_V04,
  REDUNDANCY_MAX_V04,
} from "@/lib/model-constants";

/**
 * Deterministic Resilience Signature engine (Model v0.4).
 * Two-layer score: Site Conditions (fixed) + Mitigation Quality (actionable).
 * Score / grade / risks are fully reproducible for the same site profile.
 * Mission priorities re-rank recommendations only — they do not change the score.
 */

export type ProviderId = "oneweb" | "starlink" | "iridium" | "inmarsat" | "vsat" | "none";

export type SectorId =
  "forestry" | "mining" | "maritime" | "energy" | "research" | "arctic" | "integrator" | "other";

export type AutonomyId = "manual" | "remote-operated" | "autonomous" | "mixed";
export type CriticalityId = "standard" | "high" | "safety-critical";

export type ScoreInput = {
  lat?: number;
  lng?: number;
  sector: string;
  autonomy: string;
  criticality: string;
  /** Structured provider ids from the Advisor form */
  providers?: string[];
  /** Legacy free-text setup — still parsed for share links */
  current_setup?: string;
  elevation_m?: number;
  /** Mission priorities — re-rank recommendations; do not change Signature score */
  priorities?: AdvisorPriorityId[];
};

export type RiskFactor = {
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  detail: string;
};
export type RankedProvider = {
  provider: string;
  type: string;
  confidence: number;
  note: string;
  elevation: string;
  coverage: string;
  failover_latency: string;
};

export type ScoreComponent = {
  id: "redundancy" | "latitude" | "operational_profile" | "provider_confidence";
  label: string;
  points: number;
  max: number;
};

export type ScoreLayerBand =
  | "mild"
  | "moderate"
  | "harsh"
  | "extreme"
  | "strong"
  | "adequate"
  | "weak"
  | "critical";

export type ScoreLayer = {
  id: "conditions" | "mitigation";
  label: string;
  points: number;
  max: number;
  /** Human band derived from points earned (higher = better). */
  band: ScoreLayerBand;
  fixed: boolean;
};

export type ScoreLever = {
  label: string;
  delta: number;
  provider?: string;
};

export type ConfidenceRange = {
  low: number;
  high: number;
  provenance: "catalog" | "operator-reported";
};

export type ScoreComposition = {
  components: ScoreComponent[];
  layers: ScoreLayer[];
  raw_sum: number;
  final_score: number;
  caps_applied: string[];
  confidence_range?: ConfidenceRange;
  levers?: ScoreLever[];
};

export type DeterministicResult = {
  resilience_signature: { score: number; grade: "A" | "B" | "C" | "D" | "F"; summary: string };
  risk_factors: RiskFactor[];
  redundancy_gaps: { label: string; detail: string }[];
  connectivity_options: RankedProvider[];
  recommendation: string;
  caveats: string[];
  caps_applied: string[];
  score_composition: ScoreComposition;
  intelligence?: AdvisorIntelligence;
  evidence?: EvidencePackage;
};

export type ProviderMeta = {
  id: ProviderId;
  name: string;
  orbit: "LEO" | "MEO" | "GEO";
  class: "broadband" | "narrowband";
  confidence: number;
  aliases: string[];
};

export const ADVISOR_PROVIDERS: ProviderMeta[] = [
  {
    id: "oneweb",
    name: "OneWeb",
    orbit: "LEO",
    class: "broadband",
    confidence: 85,
    aliases: ["oneweb", "eutelsat oneweb"],
  },
  {
    id: "starlink",
    name: "Starlink",
    orbit: "LEO",
    class: "broadband",
    confidence: 88,
    aliases: ["starlink"],
  },
  {
    id: "iridium",
    name: "Iridium Certus",
    orbit: "LEO",
    class: "narrowband",
    confidence: 90,
    aliases: ["iridium", "certus"],
  },
  {
    id: "inmarsat",
    name: "Inmarsat Global Xpress",
    orbit: "GEO",
    class: "broadband",
    confidence: 75,
    aliases: ["inmarsat", "global xpress", "gx"],
  },
  {
    id: "vsat",
    name: "VSAT (generic GEO)",
    orbit: "GEO",
    class: "broadband",
    confidence: 65,
    aliases: ["vsat", "geo vsat"],
  },
];

const DEFAULT_ELEVATION: Record<string, number> = {
  maritime: 5,
  forestry: 200,
  mining: 350,
  energy: 150,
  research: 100,
  arctic: 50,
  integrator: 100,
  other: 100,
};

export function normalizeSector(raw: string): SectorId {
  const s = raw.toLowerCase().trim();
  if (s === "arctic" || s === "arctic fleets" || s === "arctic / polar" || s.includes("polar"))
    return "arctic";
  if (s === "systems integrator" || s === "integrator") return "integrator";
  if (["forestry", "mining", "maritime", "energy", "research", "other"].includes(s))
    return s as SectorId;
  return "other";
}

export function parseProviders(input: ScoreInput): ProviderMeta[] {
  const fromIds = (input.providers ?? [])
    .map((p) => p.toLowerCase().trim())
    .filter((p) => p && p !== "none");

  if (fromIds.length > 0) {
    const matched: ProviderMeta[] = [];
    for (const id of fromIds) {
      const hit = ADVISOR_PROVIDERS.find(
        (p) => p.id === id || p.aliases.some((a) => id.includes(a))
      );
      if (hit && !matched.some((m) => m.id === hit.id)) matched.push(hit);
    }
    return matched;
  }

  const setup = (input.current_setup ?? "").toLowerCase();
  if (!setup.trim()) return [];

  if (
    /\bno backup\b|\bsingle[- ]provider\b|\bno redundancy\b|\bno failover\b|\bnone\b/.test(setup) &&
    !/\band\b|\+|\bdual\b|\bbackup\b/.test(setup)
  ) {
    // still try to extract the one named provider
  }

  const matched: ProviderMeta[] = [];
  for (const p of ADVISOR_PROVIDERS) {
    if (p.aliases.some((a) => setup.includes(a)) || setup.includes(p.name.toLowerCase())) {
      if (!matched.some((m) => m.id === p.id)) matched.push(p);
    }
  }
  return matched;
}

export function gradeFromDeterministicScore(score: number): "A" | "B" | "C" | "D" | "F" {
  // Bands: A ≥85 · B 70–84 · C 55–69 · D 40–54 · F <40 (spec E → F).
  // Keep in sync with GRADE_BANDS in lib/model-constants.ts.
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

/** Remap v0.3 raw component points onto v0.4 Layer B maxima. */
function remapMitigationComponents(redPts: number, confPts: number, opPts: number) {
  const redundancy = Math.max(
    0,
    Math.min(REDUNDANCY_MAX_V04, Math.round((redPts * REDUNDANCY_MAX_V04) / 30))
  );
  const provider_independence = Math.max(
    0,
    Math.min(PROVIDER_INDEPENDENCE_MAX_V04, Math.round((confPts * PROVIDER_INDEPENDENCE_MAX_V04) / 30))
  );
  const profile_alignment = Math.max(
    0,
    Math.min(PROFILE_ALIGNMENT_MAX_V04, Math.round((opPts * PROFILE_ALIGNMENT_MAX_V04) / 15))
  );
  return { redundancy, provider_independence, profile_alignment };
}

function conditionsBand(points: number, max: number): ScoreLayerBand {
  const r = max > 0 ? points / max : 0;
  if (r >= 0.75) return "mild";
  if (r >= 0.5) return "moderate";
  if (r >= 0.25) return "harsh";
  return "extreme";
}

function mitigationBand(points: number, max: number): ScoreLayerBand {
  const r = max > 0 ? points / max : 0;
  if (r >= 0.75) return "strong";
  if (r >= 0.5) return "adequate";
  if (r >= 0.25) return "weak";
  return "critical";
}

function mitigationTotal(red: number, conf: number, op: number): number {
  return red + conf + op;
}

function applyCaps(
  score: number,
  criticality: string,
  autonomy: string,
  providers: ProviderMeta[],
  lat: number
): { score: number; caps_applied: string[] } {
  let next = score;
  const caps_applied: string[] = [];
  const onlyGeo = providers.length > 0 && providers.every((p) => p.orbit === "GEO");

  if (criticality === "safety-critical" && autonomy === "autonomous" && providers.length < 2) {
    if (next > 50) {
      next = 50;
      caps_applied.push("safety-critical-autonomous-no-redundancy");
    }
  } else if (criticality === "safety-critical" && providers.length === 1) {
    if (next > 60) {
      next = 60;
      caps_applied.push("safety-critical-single-provider");
    }
  }

  if (lat > 72 && onlyGeo) {
    if (next > 45) {
      next = 45;
      caps_applied.push("geo-unusable-above-72n");
    }
  }

  return { score: Math.max(0, Math.min(100, Math.round(next))), caps_applied };
}

function confidenceRangeFor(
  score: number,
  band: "High" | "Medium" | "Low",
  provenance: ConfidenceRange["provenance"]
): ConfidenceRange {
  const half = CONFIDENCE_RANGE_HALF[band];
  return {
    low: Math.max(0, score - half),
    high: Math.min(100, score + half),
    provenance,
  };
}

/** Counterfactual Layer-B levers — never touch Conditions (Layer A). */
function buildLevers(opts: {
  providers: ProviderMeta[];
  lat: number;
  autonomy: string;
  criticality: string;
  conditionsPts: number;
  baseScore: number;
}): ScoreLever[] {
  const { providers, lat, autonomy, criticality, conditionsPts, baseScore } = opts;
  const selectedIds = new Set(providers.map((p) => p.id));
  const candidates = ADVISOR_PROVIDERS.filter((p) => p.id !== "none" && !selectedIds.has(p.id));
  const levers: ScoreLever[] = [];

  for (const candidate of candidates) {
    const nextProviders = [...providers, candidate];
    const mapped = remapMitigationComponents(
      redundancyPoints(nextProviders),
      providerConfidencePoints(nextProviders, lat),
      autonomyPoints(autonomy)
    );
    const mit = mitigationTotal(
      mapped.redundancy,
      mapped.provider_independence,
      mapped.profile_alignment
    );
    const capped = applyCaps(conditionsPts + mit, criticality, autonomy, nextProviders, lat);
    const delta = capped.score - baseScore;
    if (delta > 0) {
      const independenceBit =
        hasOrbitMix(nextProviders) && !hasOrbitMix(providers)
          ? "independent path"
          : "backup path";
      levers.push({
        label: `Add ${candidate.name} (${independenceBit})`,
        delta,
        provider: candidate.name,
      });
    }
  }

  if (autonomy === "autonomous") {
    const mappedRemote = remapMitigationComponents(
      redundancyPoints(providers),
      providerConfidencePoints(providers, lat),
      autonomyPoints("remote-operated")
    );
    const mit = mitigationTotal(
      mappedRemote.redundancy,
      mappedRemote.provider_independence,
      mappedRemote.profile_alignment
    );
    const capped = applyCaps(conditionsPts + mit, criticality, "remote-operated", providers, lat);
    const delta = capped.score - baseScore;
    if (delta > 0) {
      levers.push({
        label: "Align autonomy classification to remote-operated",
        delta,
      });
    }
  }

  return levers.sort((a, b) => b.delta - a.delta).slice(0, 3);
}

function effectiveConfidence(p: ProviderMeta, lat: number): number {
  if (p.orbit === "GEO" && lat > 70) return Math.min(p.confidence, Math.round(p.confidence * 0.5));
  if (p.orbit === "GEO" && lat > 72) return Math.min(40, p.confidence);
  return p.confidence;
}

function hasOrbitMix(providers: ProviderMeta[]): boolean {
  const orbits = new Set(providers.map((p) => p.orbit));
  if (orbits.size >= 2) return true;
  // Independent LEO classes (broadband + narrowband) count as diversity
  const classes = new Set(providers.filter((p) => p.orbit === "LEO").map((p) => p.class));
  return classes.size >= 2;
}

function redundancyPoints(providers: ProviderMeta[]): number {
  const n = providers.length;
  if (n === 0) return 0;
  if (n === 1) return 8;
  if (n === 2) return 22 + (hasOrbitMix(providers) ? 6 : 0);
  return 28;
}

function latitudePoints(lat: number, sector: SectorId, elevation_m: number): number {
  let pts = 8;
  if (lat <= 60) pts = 20;
  else if (lat <= 65) pts = 16;
  else if (lat <= 70) pts = 12;
  else pts = 8;
  if (sector === "forestry" && elevation_m < 300) pts -= 4;
  return Math.max(0, pts);
}

function autonomyPoints(autonomy: string): number {
  switch (autonomy) {
    case "manual":
      return 15;
    case "remote-operated":
      return 11;
    case "mixed":
      return 8;
    case "autonomous":
      return 5;
    default:
      return 8;
  }
}

function providerConfidencePoints(providers: ProviderMeta[], lat: number): number {
  if (providers.length === 0) return 0;
  const avg = providers.reduce((s, p) => s + effectiveConfidence(p, lat), 0) / providers.length;
  // Weight calibrated so dual-LEO mining ~78 and 3-provider research ~85+
  return Math.round((avg / 100) * 30);
}

function buildRisks(
  providers: ProviderMeta[],
  lat: number,
  sector: SectorId,
  autonomy: string,
  criticality: string,
  score: number
): RiskFactor[] {
  const risks: RiskFactor[] = [];
  if (providers.length < 2) {
    risks.push({
      label: "Single-provider dependency",
      severity: "critical",
      detail: "Single-provider dependency — no documented fallback path.",
    });
  }
  if (lat > 70 && providers.some((p) => p.orbit === "GEO")) {
    risks.push({
      label: "GEO elevation degradation",
      severity: "high",
      detail: "GEO elevation degradation at high latitude — unreliable as sole primary.",
    });
  }
  if (sector === "forestry") {
    risks.push({
      label: "Terrain / canopy obstruction",
      severity: "medium",
      detail: "Terrain/canopy obstruction risk in forested valleys.",
    });
  }
  if (autonomy === "autonomous" && providers.length < 2) {
    risks.push({
      label: "Autonomous with zero redundancy",
      severity: "critical",
      detail: "Autonomous operation with zero connectivity redundancy.",
    });
  }
  if (criticality === "safety-critical" && score < 50) {
    risks.push({
      label: "Below safety threshold",
      severity: "critical",
      detail: "Safety-critical operation below resilience threshold.",
    });
  }
  return risks.slice(0, 4);
}

function rankBackups(
  selected: ProviderMeta[],
  lat: number,
  priorities: AdvisorPriorityId[]
): RankedProvider[] {
  const selectedIds = new Set(selected.map((p) => p.id));
  const selectedOrbits = new Set(selected.map((p) => p.orbit));

  const candidates = ADVISOR_PROVIDERS.filter((p) => p.id !== "none" && !selectedIds.has(p.id))
    .map((p) => {
      let rank = effectiveConfidence(p, lat);
      if (p.orbit === "GEO" && lat > 70) rank -= 20;
      if (
        selectedOrbits.has(p.orbit) &&
        !(p.orbit === "LEO" && !selected.some((s) => s.class === p.class))
      ) {
        rank -= 10;
      }
      const type = `${p.orbit} ${p.class}`;
      rank += priorityRankBonus(p.name, type, priorities);

      const reason =
        p.orbit === "LEO" && p.class === "narrowband"
          ? "Independent LEO, polar-optimized narrowband"
          : p.orbit === "LEO"
            ? "LEO broadband path for throughput diversity"
            : lat > 70
              ? "GEO — degraded at this latitude; use only as tertiary"
              : "GEO broadband for orbital-class diversity";

      return {
        meta: p,
        rank,
        option: {
          provider: p.name,
          type,
          confidence: effectiveConfidence(p, lat),
          note: reason,
          elevation:
            p.orbit === "GEO" && lat > 70
              ? "Low elevation at site latitude"
              : "Clear sky-view assumed",
          coverage: p.orbit === "LEO" ? "High-latitude capable" : "Latitude-constrained GEO",
          failover_latency:
            p.class === "narrowband"
              ? "Model estimate: minutes (manual/terminal swap)"
              : "Model estimate: seconds–minutes (failover config)",
        } satisfies RankedProvider,
      };
    })
    .sort((a, b) => b.rank - a.rank);

  return applyPriorityRanking(
    candidates.slice(0, 3).map((c) => c.option),
    priorities
  );
}

function templateRecommendation(
  score: number,
  grade: string,
  topRisk: RiskFactor | undefined,
  topBackup: RankedProvider | undefined,
  intelligenceHeadline?: string
): string {
  if (intelligenceHeadline) {
    const riskBit = topRisk ? ` Primary concern: ${topRisk.detail}` : "";
    return `${intelligenceHeadline}${riskBit}`.trim();
  }
  const riskBit = topRisk ? ` Primary concern: ${topRisk.detail}` : "";
  const backupBit = topBackup
    ? ` Consider ${topBackup.provider} (${topBackup.confidence}) — ${topBackup.note}.`
    : "";
  if (score >= 75) {
    return `Resilience Signature ${score} · ${grade}. Posture is comparatively strong for this profile.${riskBit}${backupBit}`.trim();
  }
  if (score >= 50) {
    return `Resilience Signature ${score} · ${grade}. Documented gaps remain before this site meets a stronger readiness posture.${riskBit}${backupBit}`.trim();
  }
  return `Resilience Signature ${score} · ${grade}. Connectivity resilience is below an acceptable threshold for this operational profile.${riskBit}${backupBit}`.trim();
}

export function scoreDeterministic(raw: ScoreInput): DeterministicResult {
  const lat = typeof raw.lat === "number" && !Number.isNaN(raw.lat) ? raw.lat : 68.2;
  const sector = normalizeSector(raw.sector);
  const elevation = raw.elevation_m ?? DEFAULT_ELEVATION[sector] ?? 100;
  const providers = parseProviders(raw);
  const autonomy = raw.autonomy;
  const criticality = raw.criticality;
  const priorities = normalizePriorities(raw.priorities);

  // v0.3-style raw components (unchanged input semantics)
  const redRaw = redundancyPoints(providers);
  const latPts = latitudePoints(lat, sector, elevation);
  const opRaw = autonomyPoints(autonomy);
  const confRaw = providerConfidencePoints(providers, lat);

  // Layer A — Site Conditions (fixed)
  const conditionsPts = Math.max(0, Math.min(CONDITIONS_MAX, latPts));

  // Layer B — Mitigation Quality (reweighted)
  const mapped = remapMitigationComponents(redRaw, confRaw, opRaw);
  const mitigationPts = mitigationTotal(
    mapped.redundancy,
    mapped.provider_independence,
    mapped.profile_alignment
  );

  const raw_sum = conditionsPts + mitigationPts;
  const capped = applyCaps(raw_sum, criticality, autonomy, providers, lat);
  const score = capped.score;
  const caps_applied = capped.caps_applied;
  const grade = gradeFromDeterministicScore(score);
  const onlyGeo = providers.length > 0 && providers.every((p) => p.orbit === "GEO");

  const provenance: ConfidenceRange["provenance"] =
    raw.current_setup && raw.current_setup.trim().length > 0 && !(raw.providers?.length)
      ? "operator-reported"
      : "catalog";

  const score_composition: ScoreComposition = {
    components: [
      {
        id: "redundancy",
        label: "Redundancy (independent paths)",
        points: mapped.redundancy,
        max: REDUNDANCY_MAX_V04,
      },
      {
        id: "latitude",
        label: "Site conditions",
        points: conditionsPts,
        max: CONDITIONS_MAX,
      },
      {
        id: "operational_profile",
        label: "Profile–autonomy alignment",
        points: mapped.profile_alignment,
        max: PROFILE_ALIGNMENT_MAX_V04,
      },
      {
        id: "provider_confidence",
        label: "Provider / path independence",
        points: mapped.provider_independence,
        max: PROVIDER_INDEPENDENCE_MAX_V04,
      },
    ],
    layers: [
      {
        id: "conditions",
        label: "Site Conditions",
        points: conditionsPts,
        max: CONDITIONS_MAX,
        band: conditionsBand(conditionsPts, CONDITIONS_MAX),
        fixed: true,
      },
      {
        id: "mitigation",
        label: "Mitigation Quality",
        points: Math.min(MITIGATION_MAX, mitigationPts),
        max: MITIGATION_MAX,
        band: mitigationBand(mitigationPts, MITIGATION_MAX),
        fixed: false,
      },
    ],
    raw_sum,
    final_score: score,
    caps_applied: [...caps_applied],
    levers: buildLevers({
      providers,
      lat,
      autonomy,
      criticality,
      conditionsPts,
      baseScore: score,
    }),
  };

  const risk_factors = buildRisks(providers, lat, sector, autonomy, criticality, score);
  if (lat > 72 && onlyGeo && !risk_factors.some((r) => r.label.includes("GEO"))) {
    risk_factors.unshift({
      label: "GEO unusable above 72°N",
      severity: "critical",
      detail: "GEO unusable above 72°N for reliable primary connectivity.",
    });
  }

  const connectivity_options = rankBackups(providers, lat, priorities);
  const redundancy_gaps: { label: string; detail: string }[] = [];
  if (providers.length === 0) {
    redundancy_gaps.push({
      label: "No connectivity path identified",
      detail: "No current provider selected — assessment assumes zero documented satellite path.",
    });
  } else if (providers.length === 1) {
    redundancy_gaps.push({
      label: "No backup connectivity identified",
      detail: `Only ${providers[0].name} is documented. No independent failover path.`,
    });
  } else if (!hasOrbitMix(providers)) {
    redundancy_gaps.push({
      label: "Orbital-class concentration",
      detail: "Providers share the same orbital class — correlated outage risk remains.",
    });
  }

  const intelligence = buildAdvisorIntelligence({
    composition: score_composition,
    options: connectivity_options,
    risks: risk_factors,
    sector,
    lat,
    providerCount: providers.length,
    score,
    grade,
    priorities,
  });

  const evidence = buildEvidencePackage({
    lat,
    sector,
    providers,
    priorities,
    recommendedProvider:
      intelligence.recommendation.provider !== "—"
        ? intelligence.recommendation.provider
        : connectivity_options[0]?.provider,
    score,
    grade,
  });

  score_composition.confidence_range = confidenceRangeFor(
    score,
    evidence.confidence.band,
    provenance
  );

  const caveats = [
    "Research prototype — illustrative deterministic engine output (Model v0.4).",
    "Site Conditions are fixed attributes of the location; Mitigation Quality reflects operator choices.",
    "Mission priorities re-rank recommendations; they do not change the Signature score.",
    "Indicative research intelligence — not procurement advice or a site survey.",
    "Not a substitute for an on-site RF / sky-view survey.",
    ...(caps_applied.length ? [`Hard cap(s) applied: ${caps_applied.join(", ")}.`] : []),
  ];

  const conditionsLayer = score_composition.layers[0];
  const mitigationLayer = score_composition.layers[1];
  const summary =
    providers.length === 0
      ? `${sector} site at ${lat.toFixed(1)}°N with no documented connectivity path — score ${score} · ${grade} (Conditions: ${conditionsLayer.band}, Mitigation: ${mitigationLayer.band}).`
      : `${sector} site at ${lat.toFixed(1)}°N with ${providers.map((p) => p.name).join(" + ")} — score ${score} · ${grade} (Conditions: ${conditionsLayer.band}, Mitigation: ${mitigationLayer.band}).`;

  const recommendation = templateRecommendation(
    score,
    grade,
    risk_factors[0],
    connectivity_options[0],
    intelligence.recommendation.headline
  );

  return {
    resilience_signature: { score, grade, summary },
    risk_factors,
    redundancy_gaps,
    connectivity_options,
    recommendation,
    caveats,
    caps_applied,
    score_composition,
    intelligence,
    evidence,
  };
}

/** Serialize providers for storage / legacy current_setup field */
export function providersToSetupString(providers: string[]): string {
  const ids = providers.filter((p) => p && p !== "none");
  if (ids.length === 0) return "none — no connectivity path";
  const names = ids.map((id) => ADVISOR_PROVIDERS.find((p) => p.id === id)?.name ?? id);
  if (names.length === 1) return `${names[0]}, no backup link`;
  return names.join(" + ");
}

export function assertSanityCases(): void {
  const cases: { name: string; input: ScoreInput; check: (r: DeterministicResult) => void }[] = [
    {
      name: "maritime GEO @71°N safety-critical",
      input: {
        lat: 71,
        sector: "maritime",
        providers: ["inmarsat"],
        autonomy: "remote-operated",
        criticality: "safety-critical",
      },
      check: (r) => {
        if (r.resilience_signature.score > 45 || r.resilience_signature.score < 28) {
          throw new Error(`expected ~35, got ${r.resilience_signature.score}`);
        }
        if (!["D", "F"].includes(r.resilience_signature.grade)) {
          throw new Error(`expected D/F, got ${r.resilience_signature.grade}`);
        }
      },
    },
    {
      name: "mining dual LEO autonomous safety-critical",
      input: {
        lat: 65,
        sector: "mining",
        providers: ["oneweb", "iridium"],
        autonomy: "autonomous",
        criticality: "safety-critical",
      },
      check: (r) => {
        if (r.resilience_signature.score < 70 || r.resilience_signature.score > 88) {
          throw new Error(`expected ~78, got ${r.resilience_signature.score}`);
        }
        if (r.resilience_signature.grade !== "B" && r.resilience_signature.grade !== "A") {
          throw new Error(`expected A/B, got ${r.resilience_signature.grade}`);
        }
        if (!r.score_composition.layers?.length) {
          throw new Error("expected two-layer composition");
        }
      },
    },
    {
      name: "forestry Starlink-only autonomous safety-critical",
      input: {
        lat: 68,
        sector: "forestry",
        providers: ["starlink"],
        autonomy: "autonomous",
        criticality: "safety-critical",
        elevation_m: 200,
      },
      check: (r) => {
        if (r.resilience_signature.score > 50) {
          throw new Error(`expected capped ≤50, got ${r.resilience_signature.score}`);
        }
        if (r.resilience_signature.grade !== "D" && r.resilience_signature.grade !== "F") {
          throw new Error(`expected D/F, got ${r.resilience_signature.grade}`);
        }
        if (
          !r.caps_applied.includes("safety-critical-autonomous-no-redundancy") &&
          r.resilience_signature.score > 50
        ) {
          throw new Error("expected hard cap");
        }
      },
    },
    {
      name: "research 3 providers manual standard @60°N",
      input: {
        lat: 60,
        sector: "research",
        providers: ["starlink", "oneweb", "iridium"],
        autonomy: "manual",
        criticality: "standard",
      },
      check: (r) => {
        if (r.resilience_signature.score < 85) {
          throw new Error(`expected ≥85, got ${r.resilience_signature.score}`);
        }
        if (!["A", "B"].includes(r.resilience_signature.grade)) {
          throw new Error(`expected A/B, got ${r.resilience_signature.grade}`);
        }
      },
    },
    {
      name: "Lapland Starlink-only high (hero pedagogy)",
      input: {
        lat: 68.2,
        sector: "forestry",
        providers: ["starlink"],
        autonomy: "autonomous",
        criticality: "high",
        elevation_m: 200,
      },
      check: (r) => {
        const score = r.resilience_signature.score;
        if (score < 42 || score > 50) {
          throw new Error(`expected ~46, got ${score}`);
        }
        if (r.resilience_signature.grade !== "D") {
          throw new Error(`expected D, got ${r.resilience_signature.grade}`);
        }
        const conditions = r.score_composition.layers.find((l) => l.id === "conditions");
        const mitigation = r.score_composition.layers.find((l) => l.id === "mitigation");
        if (!conditions || conditions.points !== 8) {
          throw new Error(`expected Conditions 8/20, got ${conditions?.points}`);
        }
        if (!mitigation || mitigation.points < 36 || mitigation.points > 40) {
          throw new Error(`expected Mitigation ~38/80, got ${mitigation?.points}`);
        }
      },
    },
  ];

  for (const c of cases) {
    const r = scoreDeterministic(c.input);
    try {
      c.check(r);
    } catch (e) {
      throw new Error(
        `[${c.name}] ${e instanceof Error ? e.message : e} (full=${JSON.stringify(r.resilience_signature)})`
      );
    }
  }
}

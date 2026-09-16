/**
 * Evidence & Research Intelligence — links environment → research →
 * connectivity characteristics → scoring factors → recommendation.
 * Deterministic, attribution-first; not live RF or procurement advice.
 */

import type { AdvisorPriorityId } from "@/lib/advisor-priorities";
import type { ProviderMeta, SectorId } from "@/lib/deterministic-score";
import { MODEL_VERSION, SCORING_ENGINE } from "@/lib/model-constants";

export type EvidenceSourceType = "model" | "catalog" | "dataset" | "research" | "reference";

export type EvidenceSource = {
  id: string;
  title: string;
  type: EvidenceSourceType;
  attribution: string;
  url?: string;
  freshness: string;
  notes?: string;
};

export type EvidenceChainStepId =
  "environment" | "research" | "characteristics" | "scoring" | "recommendation";

export type EvidenceChainStep = {
  id: EvidenceChainStepId;
  label: string;
  summary: string;
  sourceIds: string[];
};

export type EvidenceConfidence = {
  band: "High" | "Medium" | "Low";
  /** Assessment/data-basis confidence 0–100 — not availability % */
  score: number;
  rationale: string;
};

export type EvidencePackage = {
  environment_theme: string;
  chain: EvidenceChainStep[];
  sources: EvidenceSource[];
  assumptions: string[];
  limitations: string[];
  methodology_summary: string;
  confidence: EvidenceConfidence;
  data_freshness: {
    model: string;
    catalog: string;
    reference_datasets: string;
    knowledge: string;
  };
  research_links: { label: string; href: string }[];
};

const BASE_SOURCES: EvidenceSource[] = [
  {
    id: "model-v03",
    title: "GRYPS Deterministic Signature Engine",
    type: "model",
    attribution: "GRYPS R&D · Model v0.3",
    url: "/methodology",
    freshness: `${MODEL_VERSION} · ${SCORING_ENGINE}`,
    notes: "Score, grade, risks, and ranks are reproducible for identical inputs.",
  },
  {
    id: "provider-catalog",
    title: "Provider index (catalog confidence)",
    type: "catalog",
    attribution: "GRYPS curated public-knowledge index — no commercial relationships",
    url: "/providers",
    freshness: "Catalog snapshot · Model v0.3 weights",
    notes: "Catalog confidence is assessment/data-basis confidence, not SLA availability.",
  },
  {
    id: "eu-dem",
    title: "EU-DEM terrain elevation",
    type: "dataset",
    attribution: "Copernicus / EEA via OpenTopoData — EU-funded Copernicus data",
    freshness: "On-demand sample · ~25 m DEM",
    notes: "Shown as separate terrain evidence; not blended into the 0–100 Signature.",
  },
  {
    id: "bittimittari",
    title: "Bittimittari broadband measurements",
    type: "dataset",
    attribution: "Traficom (Finland) · CC BY 4.0",
    freshness: "Municipality aggregates · Finland only",
    notes: "Applies to seeded Finnish municipality sites — not ad-hoc Nordic coordinates.",
  },
  {
    id: "orbital-reference",
    title: "Orbital-class latency & geometry (reference)",
    type: "reference",
    attribution: "Public industry / orbital-mechanics conventions",
    url: "/knowledge/leo-vs-meo-vs-geo-remote-operations",
    freshness: "Static reference bands · not site measurements",
    notes: "LEO / MEO / GEO latency and elevation notes are design-class commentary.",
  },
  {
    id: "arctic-connectivity",
    title: "Arctic satellite connectivity constraints",
    type: "research",
    attribution: "GRYPS Knowledge · research prototype notes",
    url: "/knowledge/satellite-connectivity-arctic",
    freshness: "Editorial research note · 2026",
    notes: "High-latitude GEO elevation loss; polar LEO and narrowband roles.",
  },
  {
    id: "resilience-scoring",
    title: "Connectivity resilience scoring",
    type: "research",
    attribution: "GRYPS Knowledge · Model v0.3 explainer",
    url: "/knowledge/satellite-connectivity-resilience-scoring",
    freshness: "Aligned to Model v0.3",
  },
  {
    id: "forestry-fi",
    title: "Forestry satellite connectivity (Finland)",
    type: "research",
    attribution: "GRYPS Knowledge",
    url: "/knowledge/forestry-satellite-connectivity-finland",
    freshness: "Editorial research note · 2026",
  },
  {
    id: "research-library",
    title: "GRYPS Research Library",
    type: "research",
    attribution: "Curated Connectivity Intelligence assessments",
    url: "/research",
    freshness: "Curated set · Model v0.3 Signatures",
  },
];

function environmentTheme(lat: number, sector: SectorId): string {
  if (lat > 72) return "High Arctic / polar operations";
  if (lat > 66.5) {
    if (sector === "maritime") return "Arctic maritime / offshore";
    if (sector === "forestry") return "Arctic / sub-Arctic forestry";
    if (sector === "mining") return "Arctic mining & extraction";
    return "Arctic / high-latitude remote ops";
  }
  if (lat > 60) {
    if (sector === "maritime") return "Nordic maritime";
    if (sector === "forestry") return "Nordic forestry & timber logistics";
    return "Nordic remote industrial operations";
  }
  return "Nordic mid-latitude remote operations";
}

function connectivityCharacteristics(lat: number, providers: ProviderMeta[]): string {
  const orbits = [...new Set(providers.map((p) => p.orbit))];
  const hasLeo = orbits.includes("LEO");
  const hasGeo = orbits.includes("GEO");
  const bits: string[] = [];
  if (lat > 70) {
    bits.push(
      "GEO elevation is constrained; polar-capable LEO and narrowband matter more in the model"
    );
  } else if (lat > 65) {
    bits.push(
      "Sub-Arctic latitude — LEO paths remain favourable; GEO is usable but elevation-sensitive"
    );
  } else {
    bits.push(
      "Mid-high latitude — mixed LEO/GEO geometries are comparatively favourable in the model"
    );
  }
  if (providers.length === 0) {
    bits.push("No documented satellite path — characteristics assume zero primary connectivity");
  } else if (providers.length === 1) {
    bits.push(`Single documented path (${providers[0].name}) — correlated outage exposure`);
  } else if (hasLeo && hasGeo) {
    bits.push("Documented LEO + GEO mix — orbital-class diversity present");
  } else if (hasLeo) {
    bits.push(
      "LEO-only documented path(s) — throughput diversity possible; polar backup still relevant"
    );
  } else {
    bits.push("GEO-centric documented path(s) — high-latitude primary risk if used alone");
  }
  return bits.join(". ") + ".";
}

function scoringFactorsSummary(opts: {
  lat: number;
  sector: SectorId;
  providerCount: number;
  priorities: AdvisorPriorityId[];
}): string {
  const priorityBit = opts.priorities.length
    ? ` Mission priorities (${opts.priorities.join(", ").replace(/_/g, " ")}) re-rank recommendations only.`
    : "";
  return (
    `Model v0.3 weights redundancy (0–30), latitude (0–20), operational profile (0–15), and provider confidence (0–30), then applies hard caps.` +
    ` This ${opts.sector.replace(/-/g, " ")} profile at ~${opts.lat.toFixed(1)}°N with ${opts.providerCount} documented provider(s) drives the Signature components.` +
    priorityBit
  );
}

function assessmentConfidence(opts: {
  lat: number;
  providerCount: number;
  avgCatalogConfidence: number;
  hasOrbitMix: boolean;
}): EvidenceConfidence {
  let score = Math.round(opts.avgCatalogConfidence * 0.55 + (opts.providerCount > 0 ? 25 : 5));
  if (opts.providerCount >= 2 && opts.hasOrbitMix) score += 8;
  if (opts.lat > 72) score -= 12;
  else if (opts.lat > 70) score -= 6;
  if (opts.providerCount === 0) score = Math.min(score, 35);
  score = Math.max(20, Math.min(92, score));
  const band: EvidenceConfidence["band"] = score >= 75 ? "High" : score >= 55 ? "Medium" : "Low";
  const rationale =
    band === "High"
      ? "Documented multi-path or strong catalog basis at this latitude supports a higher assessment confidence."
      : band === "Medium"
        ? "Usable catalog and profile inputs, with residual uncertainty from latitude, single-path setups, or incomplete site survey."
        : "Sparse setup documentation, extreme latitude, or weak catalog fit — treat the Signature as exploratory.";
  return { band, score, rationale };
}

function pickSources(sector: SectorId, lat: number): EvidenceSource[] {
  const ids = new Set([
    "model-v03",
    "provider-catalog",
    "orbital-reference",
    "arctic-connectivity",
    "resilience-scoring",
    "research-library",
    "eu-dem",
  ]);
  if (sector === "forestry") ids.add("forestry-fi");
  if (lat >= 55 && lat <= 72) ids.add("bittimittari"); // may apply for FI seeds
  return BASE_SOURCES.filter((s) => ids.has(s.id));
}

function researchLinks(sector: SectorId): { label: string; href: string }[] {
  const links = [
    { label: "GRYPS Research Methodology", href: "/methodology" },
    { label: "Mission scenarios", href: "/scenarios" },
    { label: "Research Library", href: "/research" },
    { label: "Arctic connectivity notes", href: "/knowledge/satellite-connectivity-arctic" },
    { label: "LEO · MEO · GEO reference", href: "/knowledge/leo-vs-meo-vs-geo-remote-operations" },
    {
      label: "Resilience scoring explainer",
      href: "/knowledge/satellite-connectivity-resilience-scoring",
    },
  ];
  if (sector === "forestry") {
    links.push({
      label: "Forestry connectivity (Finland)",
      href: "/knowledge/forestry-satellite-connectivity-finland",
    });
  }
  links.push({ label: "Explore Connectivity Intelligence map", href: "/map" });
  return links;
}

function hasOrbitMix(providers: ProviderMeta[]): boolean {
  const orbits = new Set(providers.map((p) => p.orbit));
  if (orbits.size >= 2) return true;
  const classes = new Set(providers.filter((p) => p.orbit === "LEO").map((p) => p.class));
  return classes.size >= 2;
}

export function buildEvidencePackage(opts: {
  lat: number;
  sector: SectorId;
  providers: ProviderMeta[];
  priorities: AdvisorPriorityId[];
  recommendedProvider?: string;
  score: number;
  grade: string;
}): EvidencePackage {
  const theme = environmentTheme(opts.lat, opts.sector);
  const sources = pickSources(opts.sector, opts.lat);
  const avgConf =
    opts.providers.length === 0
      ? 40
      : opts.providers.reduce((s, p) => s + p.confidence, 0) / opts.providers.length;
  const confidence = assessmentConfidence({
    lat: opts.lat,
    providerCount: opts.providers.length,
    avgCatalogConfidence: avgConf,
    hasOrbitMix: hasOrbitMix(opts.providers),
  });

  const chars = connectivityCharacteristics(opts.lat, opts.providers);
  const scoring = scoringFactorsSummary({
    lat: opts.lat,
    sector: opts.sector,
    providerCount: opts.providers.length,
    priorities: opts.priorities,
  });
  const recLabel = opts.recommendedProvider ?? "ranked backup options";
  const researchFocus =
    opts.lat > 66
      ? "Arctic / high-latitude research emphasises GEO elevation loss, polar LEO reach, and multi-orbit redundancy."
      : "Nordic remote-ops research emphasises redundancy, operational dependency, and orbital-class trade-offs.";

  const chain: EvidenceChainStep[] = [
    {
      id: "environment",
      label: "Operating environment",
      summary: `${theme} at ~${opts.lat.toFixed(1)}°N (${opts.sector.replace(/-/g, " ")}). Latitude and mission profile set the geometric and operational context for scoring.`,
      sourceIds: ["arctic-connectivity", "eu-dem"],
    },
    {
      id: "research",
      label: "Relevant research",
      summary: researchFocus,
      sourceIds: [
        "arctic-connectivity",
        "resilience-scoring",
        "research-library",
        ...(opts.sector === "forestry" ? ["forestry-fi"] : []),
      ],
    },
    {
      id: "characteristics",
      label: "Connectivity characteristics",
      summary: chars,
      sourceIds: ["orbital-reference", "provider-catalog"],
    },
    {
      id: "scoring",
      label: "GRYPS scoring factors",
      summary: scoring,
      sourceIds: ["model-v03", "resilience-scoring"],
    },
    {
      id: "recommendation",
      label: "Provider recommendation",
      summary: `Signature ${opts.score}/100 · ${opts.grade}. Model recommends ${recLabel} as the leading fit for this evidence chain — indicative research output, not procurement advice.`,
      sourceIds: ["model-v03", "provider-catalog"],
    },
  ];

  return {
    environment_theme: theme,
    chain,
    sources,
    assumptions: [
      "Clear sky-view and correct antenna installation are assumed unless contradicted by separate terrain evidence.",
      "Provider catalog confidence is a research heuristic, not a measured site availability rate.",
      "Mission priorities re-rank recommendations; they do not change the Signature score.",
      "Optional Mistral prose may polish wording only — never score, grade, risks, or ranks.",
      "Coordinates are interpreted within the Nordic / Arctic / Iceland research envelope.",
    ],
    limitations: [
      "Not a substitute for an on-site RF / sky-view survey or professional connectivity engineering.",
      "Not live constellation telemetry, outage feeds, or a coverage SLA.",
      "Not procurement, insurance, certification, or legal advice (including NIS2/CER).",
      "EU-DEM terrain and Bittimittari (Finland) are shown separately and are not blended into the Signature score.",
      "Recommendations are indicative outputs of an experimental intelligence framework.",
    ],
    methodology_summary:
      "GRYPS is an experimental Connectivity Intelligence framework. Research context and public datasets inform deterministic Model v0.3 scoring; ranked providers follow from that score composition and optional mission priorities. Outputs support human judgement — they are not procurement advice.",
    confidence,
    data_freshness: {
      model: `${MODEL_VERSION} (${SCORING_ENGINE})`,
      catalog: "Provider index · Model v0.3 catalog confidence",
      reference_datasets: "EU-DEM on demand · Bittimittari for FI municipality seeds",
      knowledge: "GRYPS Knowledge + Research Library · editorial 2026",
    },
    research_links: researchLinks(opts.sector),
  };
}

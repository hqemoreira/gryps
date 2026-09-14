/**
 * Research Workspace — local-first saved assessments for analytical modelling.
 * Not a customer workspace: no CRM, accounts, or sales funnel.
 */

import type { AbbreviatedAssessment } from "@/lib/abbreviate-result";
import type { AdvisorPriorityId } from "@/lib/advisor-priorities";
import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors";
import { MODEL_VERSION } from "@/lib/model-constants";

export const WORKSPACE_STORAGE_KEY = "gryps-research-workspace-v1";
export const WORKSPACE_MAX = 40;

export type SavedResearchAssessment = {
  id: string;
  /** e.g. Northern Finland — Forestry — High Resilience */
  title: string;
  savedAt: string;
  depth: "full" | "abbreviated";
  scenarioSlug?: string;
  scenarioLabel?: string;
  inputs: AssessmentInputs;
  result?: AdvisoryResult;
  abbreviated?: AbbreviatedAssessment;
  /** Free-form researcher note */
  notes?: string;
};

function resilienceBand(score: number): string {
  if (score >= 75) return "High Resilience";
  if (score >= 50) return "Moderate Resilience";
  return "Low Resilience";
}

function resilienceBandFi(score: number): string {
  if (score >= 75) return "Korkea resilienssi";
  if (score >= 50) return "Kohtalainen resilienssi";
  return "Matala resilienssi";
}

function regionLabel(lat?: number, lng?: number, lang: "en" | "fi" = "en"): string {
  if (lat == null) return lang === "fi" ? "Tuntematon sijainti" : "Unknown location";
  if (lat > 72) return lang === "fi" ? "Korkea-arktinen" : "High Arctic";
  if (lat > 66.5) {
    if (lng != null && lng >= 20 && lng <= 32) {
      return lang === "fi" ? "Pohjois-Suomi / Lappi" : "Northern Finland / Lapland";
    }
    if (lng != null && lng >= 10 && lng < 20) {
      return lang === "fi" ? "Pohjois-Norja" : "Northern Norway";
    }
    if (lng != null && lng >= 15 && lng < 25 && lat < 69) {
      return lang === "fi" ? "Pohjois-Ruotsi" : "Northern Sweden";
    }
    return lang === "fi" ? "Arktinen alue" : "Arctic region";
  }
  if (lat > 63 && lng != null && lng >= -25 && lng <= -13) {
    return lang === "fi" ? "Islanti" : "Iceland";
  }
  if (lat > 60) return lang === "fi" ? "Pohjoismaat" : "Nordics";
  return lang === "fi" ? `~${lat.toFixed(1)}°N` : `~${lat.toFixed(1)}°N`;
}

function sectorLabel(sector: string, lang: "en" | "fi"): string {
  const map: Record<string, { en: string; fi: string }> = {
    forestry: { en: "Forestry", fi: "Metsätalous" },
    mining: { en: "Mining", fi: "Kaivostoiminta" },
    maritime: { en: "Maritime", fi: "Merenkulku" },
    energy: { en: "Energy / infrastructure", fi: "Energia / infrastruktuuri" },
    arctic: { en: "Arctic ops", fi: "Arktinen toiminta" },
    research: { en: "Research", fi: "Tutkimus" },
    other: { en: "Remote industrial", fi: "Etäinen teollisuus" },
  };
  return map[sector]?.[lang] ?? sector;
}

export function buildAssessmentTitle(
  inputs: AssessmentInputs,
  score: number,
  lang: "en" | "fi" = "en"
): string {
  const region = regionLabel(inputs.lat, inputs.lng, lang);
  const sector = sectorLabel(inputs.sector, lang);
  const band = lang === "fi" ? resilienceBandFi(score) : resilienceBand(score);
  return `${region} — ${sector} — ${band}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ra_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function listSavedAssessments(): SavedResearchAssessment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedResearchAssessment[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  } catch {
    return [];
  }
}

function writeAll(items: SavedResearchAssessment[]) {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(items.slice(0, WORKSPACE_MAX)));
}

export function getSavedAssessment(id: string): SavedResearchAssessment | undefined {
  return listSavedAssessments().find((a) => a.id === id);
}

export function saveResearchAssessment(opts: {
  inputs: AssessmentInputs;
  result?: AdvisoryResult;
  abbreviated?: AbbreviatedAssessment;
  scenarioSlug?: string;
  scenarioLabel?: string;
  notes?: string;
  lang?: "en" | "fi";
}): SavedResearchAssessment {
  const lang = opts.lang ?? "en";
  const score =
    opts.result?.resilience_signature.score ?? opts.abbreviated?.resilience_signature.score ?? 0;
  const depth: "full" | "abbreviated" = opts.result ? "full" : "abbreviated";
  const entry: SavedResearchAssessment = {
    id: newId(),
    title: buildAssessmentTitle(opts.inputs, score, lang),
    savedAt: new Date().toISOString(),
    depth,
    scenarioSlug: opts.scenarioSlug,
    scenarioLabel: opts.scenarioLabel,
    inputs: { ...opts.inputs },
    result: opts.result,
    abbreviated: opts.abbreviated,
    notes: opts.notes,
  };
  const all = listSavedAssessments().filter((a) => {
    // Dedupe near-identical saves within a short window
    if (a.inputs.lat !== entry.inputs.lat || a.inputs.lng !== entry.inputs.lng) return true;
    if (a.inputs.sector !== entry.inputs.sector) return true;
    const samePri =
      JSON.stringify(a.inputs.priorities ?? []) === JSON.stringify(entry.inputs.priorities ?? []);
    if (!samePri) return true;
    const age = Date.now() - new Date(a.savedAt).getTime();
    return age > 60_000;
  });
  writeAll([entry, ...all]);
  return entry;
}

export function deleteSavedAssessment(id: string): void {
  writeAll(listSavedAssessments().filter((a) => a.id !== id));
}

export function updateSavedNotes(id: string, notes: string): void {
  const all = listSavedAssessments().map((a) => (a.id === id ? { ...a, notes } : a));
  writeAll(all);
}

export function scoreOf(a: SavedResearchAssessment): number {
  return a.result?.resilience_signature.score ?? a.abbreviated?.resilience_signature.score ?? 0;
}

export function gradeOf(a: SavedResearchAssessment): string {
  return a.result?.resilience_signature.grade ?? a.abbreviated?.resilience_signature.grade ?? "—";
}

export function recommendedProvider(a: SavedResearchAssessment): string {
  return (
    a.result?.intelligence?.recommendation.provider ??
    a.result?.connectivity_options[0]?.provider ??
    a.abbreviated?.recommended.provider ??
    "—"
  );
}

export type CompareField = {
  key: string;
  labelEn: string;
  labelFi: string;
  a: string;
  b: string;
};

export function buildComparisonRows(
  left: SavedResearchAssessment,
  right: SavedResearchAssessment
): CompareField[] {
  const pri = (p?: AdvisorPriorityId[]) =>
    (p ?? []).map((x) => x.replace(/_/g, " ")).join(", ") || "—";
  const leftSig = left.result?.resilience_signature ?? left.abbreviated?.resilience_signature;
  const rightSig = right.result?.resilience_signature ?? right.abbreviated?.resilience_signature;

  return [
    {
      key: "title",
      labelEn: "Assessment",
      labelFi: "Arvio",
      a: left.title,
      b: right.title,
    },
    {
      key: "coords",
      labelEn: "Coordinates",
      labelFi: "Koordinaatit",
      a:
        left.inputs.lat != null && left.inputs.lng != null
          ? `${left.inputs.lat.toFixed(2)}°N · ${left.inputs.lng.toFixed(2)}°E`
          : "—",
      b:
        right.inputs.lat != null && right.inputs.lng != null
          ? `${right.inputs.lat.toFixed(2)}°N · ${right.inputs.lng.toFixed(2)}°E`
          : "—",
    },
    {
      key: "sector",
      labelEn: "Sector / scenario",
      labelFi: "Toimiala / skenaario",
      a: left.scenarioLabel ?? left.inputs.sector,
      b: right.scenarioLabel ?? right.inputs.sector,
    },
    {
      key: "priorities",
      labelEn: "Mission priorities",
      labelFi: "Tehtävän prioriteetit",
      a: pri(left.inputs.priorities),
      b: pri(right.inputs.priorities),
    },
    {
      key: "autonomy",
      labelEn: "Autonomy",
      labelFi: "Autonomia",
      a: left.inputs.autonomy_level,
      b: right.inputs.autonomy_level,
    },
    {
      key: "criticality",
      labelEn: "Criticality",
      labelFi: "Kriittisyys",
      a: left.inputs.operation_criticality,
      b: right.inputs.operation_criticality,
    },
    {
      key: "score",
      labelEn: "Resilience score",
      labelFi: "Resilienssipisteet",
      a: leftSig ? `${leftSig.score}/100 · ${leftSig.grade}` : "—",
      b: rightSig ? `${rightSig.score}/100 · ${rightSig.grade}` : "—",
    },
    {
      key: "rec",
      labelEn: "Recommended",
      labelFi: "Suositus",
      a: recommendedProvider(left),
      b: recommendedProvider(right),
    },
    {
      key: "setup",
      labelEn: "Current setup",
      labelFi: "Nykyinen kokoonpano",
      a: left.inputs.current_setup?.trim() || "—",
      b: right.inputs.current_setup?.trim() || "—",
    },
    {
      key: "model",
      labelEn: "Methodology version",
      labelFi: "Menetelmäversio",
      a: left.result?.modelVersion ?? left.abbreviated?.modelVersion ?? MODEL_VERSION,
      b: right.result?.modelVersion ?? right.abbreviated?.modelVersion ?? MODEL_VERSION,
    },
  ];
}

/** Portfolio-style markdown export. */
export function exportAssessmentMarkdown(a: SavedResearchAssessment): string {
  const score = scoreOf(a);
  const grade = gradeOf(a);
  const model = a.result?.modelVersion ?? a.abbreviated?.modelVersion ?? MODEL_VERSION;
  const date = new Date(a.savedAt).toISOString().slice(0, 10);
  const rec = a.result?.intelligence?.recommendation;
  const evidence = a.result?.evidence;
  const comparison = a.result?.intelligence?.comparison ?? [];
  const lines: string[] = [
    "# GRYPS Research Assessment",
    "",
    `**${a.title}**`,
    "",
    `Date: ${date} · Methodology: ${model} · Depth: ${a.depth}`,
    "",
    "## Executive summary",
    "",
    a.result?.resilience_signature.summary ??
      a.abbreviated?.resilience_signature.summary ??
      "No summary available.",
    "",
    `Resilience Signature: **${score}/100 · ${grade}**. Recommended: **${recommendedProvider(a)}**.`,
    "",
    "## Scenario",
    "",
    a.scenarioLabel
      ? `${a.scenarioLabel}${a.scenarioSlug ? ` (\`/scenarios/${a.scenarioSlug}\`)` : ""}`
      : `Sector: ${a.inputs.sector}`,
    "",
    "## Inputs",
    "",
    `- Coordinates: ${a.inputs.lat != null && a.inputs.lng != null ? `${a.inputs.lat}°N, ${a.inputs.lng}°E` : "—"}`,
    `- Sector: ${a.inputs.sector}`,
    `- Autonomy: ${a.inputs.autonomy_level}`,
    `- Criticality: ${a.inputs.operation_criticality}`,
    `- Current setup: ${a.inputs.current_setup?.trim() || "—"}`,
    `- Mission priorities: ${(a.inputs.priorities ?? []).join(", ") || "—"}`,
    "",
    "## Findings",
    "",
  ];

  if (a.result?.risk_factors?.length) {
    lines.push("### Risk factors", "");
    for (const r of a.result.risk_factors) {
      lines.push(`- **${r.label}** (${r.severity}): ${r.detail}`);
    }
    lines.push("");
  } else if (a.abbreviated?.top_risks?.length) {
    lines.push("### Top risks (abbreviated)", "");
    for (const r of a.abbreviated.top_risks) {
      lines.push(`- **${r.label}** (${r.severity})`);
    }
    lines.push("");
  }

  if (a.result?.redundancy_gaps?.length) {
    lines.push("### Redundancy gaps", "");
    for (const g of a.result.redundancy_gaps) {
      lines.push(`- **${g.label}**: ${g.detail}`);
    }
    lines.push("");
  }

  lines.push("## Provider comparison", "");
  if (comparison.length) {
    lines.push("| Provider | Coverage | Latency | Resilience | Hardware | Best for |");
    lines.push("|---|---|---|---|---|---|");
    for (const row of comparison) {
      lines.push(
        `| ${row.provider} | ${row.coverage} | ${row.latency} | ${row.resilience} | ${row.hardware} | ${row.best_for} |`
      );
    }
    lines.push("");
  } else if (a.result?.connectivity_options?.length) {
    for (const o of a.result.connectivity_options) {
      lines.push(`- **${o.provider}** (${o.type}) — confidence ${o.confidence}% — ${o.note}`);
    }
    lines.push("");
  } else {
    lines.push(`- ${recommendedProvider(a)}`, "");
  }

  lines.push("## Recommendation", "");
  if (rec) {
    lines.push(rec.headline, "", rec.primary_reason, "");
    if (rec.trade_offs.length) {
      lines.push("Trade-offs:", "");
      for (const t of rec.trade_offs) lines.push(`- ${t}`);
      lines.push("");
    }
    if (rec.best_if.length) {
      lines.push("Best if…", "");
      for (const b of rec.best_if) lines.push(`- Consider ${b.provider} if ${b.condition}`);
      lines.push("");
    }
  } else {
    lines.push(a.result?.recommendation ?? a.abbreviated?.recommended.why ?? "—", "");
  }

  lines.push("## Evidence", "");
  if (evidence) {
    lines.push(evidence.methodology_summary, "");
    lines.push(`Environment: ${evidence.environment_theme}`, "");
    lines.push(
      `Assessment confidence: ${evidence.confidence.band} (${evidence.confidence.score}%) — ${evidence.confidence.rationale}`,
      ""
    );
    lines.push("Chain:", "");
    for (const step of evidence.chain) {
      lines.push(`1. **${step.label}**: ${step.summary}`);
    }
    lines.push("");
  } else {
    lines.push("Full evidence package available on unlocked assessments.", "");
  }

  lines.push("## Assumptions", "");
  if (evidence?.assumptions?.length) {
    for (const x of evidence.assumptions) lines.push(`- ${x}`);
  } else {
    lines.push("- Clear sky-view assumed unless contradicted by separate terrain evidence.");
    lines.push("- Catalog confidence is research heuristic, not measured availability.");
  }
  lines.push("");

  lines.push("## Limitations", "");
  if (evidence?.limitations?.length) {
    for (const x of evidence.limitations) lines.push(`- ${x}`);
  } else {
    lines.push("- Not a site survey, live RF feed, procurement advice, or certification.");
  }
  lines.push("");

  lines.push("## Methodology", "");
  lines.push(
    `GRYPS Model ${model} — experimental Connectivity Intelligence framework. Indicative research output; not procurement advice. See https://gryps.vercel.app/methodology`,
    ""
  );
  lines.push("---", "");
  lines.push("*Research prototype · Non-commercial · Model-based analysis*");

  return lines.join("\n");
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/markdown;charset=utf-8"
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "gryps-research-assessment"
  );
}

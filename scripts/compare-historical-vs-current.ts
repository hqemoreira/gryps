/**
 * Sprint 5 — read-only historical vs current scoreSiteSync comparison.
 * Inputs come from a Neon-derived JSON snapshot (no live credentials in this script).
 */
import { readFileSync } from "fs";
import { join } from "path";
import { scoreSiteSync } from "../lib/scoring";
import { MODEL_VERSION } from "../lib/model-constants";

type HistRow = {
  id: number;
  slug: string;
  lat: number;
  lng: number;
  sector: string;
  autonomy_level: string;
  operation_criticality: string;
  current_setup: string | null;
  hist_score: number;
  hist_grade: string;
  hist_top_provider: string | null;
  hist_risk_n: number;
  hist_gap_n: number;
  hist_caveat_n: number;
  hist_opt_n: number;
  has_evidence: boolean;
  model_version: string | null;
  real_data_score: number | null;
  real_world_gap_score: number | null;
  terrain_penalty_score: number | null;
  in_research_library: boolean;
};

const rows = JSON.parse(
  readFileSync(join("scripts", "_sprint5-historical-inputs.json"), "utf8")
) as HistRow[];

type ClassId = "A" | "B" | "C" | "D" | "E" | "F";

type Result = {
  slug: string;
  in_research_library: boolean;
  reproducible: boolean;
  hist_score: number;
  hist_grade: string;
  fresh_score: number | null;
  fresh_grade: string | null;
  score_delta: number | null;
  grade_changed: boolean;
  top_provider_changed: boolean;
  hist_top: string | null;
  fresh_top: string | null;
  classes: ClassId[];
  notes: string[];
};

const results: Result[] = [];

for (const row of rows) {
  const missingInput =
    row.lat == null ||
    row.lng == null ||
    !row.sector ||
    !row.autonomy_level ||
    !row.operation_criticality;

  if (missingInput) {
    results.push({
      slug: row.slug,
      in_research_library: row.in_research_library,
      reproducible: false,
      hist_score: row.hist_score,
      hist_grade: row.hist_grade,
      fresh_score: null,
      fresh_grade: null,
      score_delta: null,
      grade_changed: false,
      top_provider_changed: false,
      hist_top: row.hist_top_provider,
      fresh_top: null,
      classes: ["F", "E"],
      notes: ["Missing required input fields"],
    });
    continue;
  }

  const fresh = scoreSiteSync({
    site_coordinates: { lat: row.lat, lng: row.lng },
    sector: row.sector,
    autonomy_level: row.autonomy_level,
    operation_criticality: row.operation_criticality,
    current_setup: row.current_setup ?? undefined,
  });

  const freshScore = fresh.resilience_signature.score;
  const freshGrade = fresh.resilience_signature.grade;
  const freshTop = fresh.connectivity_options[0]?.provider ?? null;
  const scoreDelta = freshScore - row.hist_score;
  const gradeChanged = freshGrade !== row.hist_grade;
  const topChanged = (freshTop ?? "") !== (row.hist_top_provider ?? "");

  const classes: ClassId[] = [];
  const notes: string[] = [];

  // Missing provenance on every historical row examined so far.
  if (!row.model_version) {
    classes.push("E");
    notes.push("No stored modelVersion");
  }
  if (!row.has_evidence) {
    notes.push("No stored evidence chain");
  }

  if (scoreDelta === 0 && !gradeChanged) {
    // Score match does not mean full output match.
    if (topChanged || row.hist_risk_n !== (fresh.risk_factors?.length ?? 0)) {
      classes.push("C");
      notes.push("Same score/grade; recommendation or structure differs");
    } else {
      classes.push("A");
      notes.push("Score and grade match");
    }
  } else {
    classes.push("B");
    notes.push(`Score ${row.hist_score}→${freshScore}, grade ${row.hist_grade}→${freshGrade}`);
  }

  // Enrichment is a separate historical layer and never enters scoreSiteSync.
  if (row.real_data_score != null || row.terrain_penalty_score != null || row.real_world_gap_score != null) {
    classes.push("D");
    notes.push("Has retired enrichment columns (not used by current Signature)");
  }

  if (fresh.modelVersion !== MODEL_VERSION) {
    notes.push(`Unexpected fresh modelVersion ${fresh.modelVersion}`);
  }

  results.push({
    slug: row.slug,
    in_research_library: row.in_research_library,
    reproducible: true,
    hist_score: row.hist_score,
    hist_grade: row.hist_grade,
    fresh_score: freshScore,
    fresh_grade: freshGrade,
    score_delta: scoreDelta,
    grade_changed: gradeChanged,
    top_provider_changed: topChanged,
    hist_top: row.hist_top_provider,
    fresh_top: freshTop,
    classes: [...new Set(classes)],
    notes,
  });
}

const reproducible = results.filter((r) => r.reproducible);
const nonRepro = results.filter((r) => !r.reproducible);
const scoreDiff = reproducible.filter((r) => r.classes.includes("B"));
const sameScore = reproducible.filter((r) => !r.classes.includes("B"));
const gradeDiff = reproducible.filter((r) => r.grade_changed);
const topDiff = reproducible.filter((r) => r.top_provider_changed);
const library = reproducible.filter((r) => r.in_research_library);

const deltas = scoreDiff.map((r) => r.score_delta!).sort((a, b) => a - b);
const absDeltas = scoreDiff.map((r) => Math.abs(r.score_delta!)).sort((a, b) => a - b);
const meanAbs =
  absDeltas.length === 0 ? 0 : absDeltas.reduce((a, b) => a + b, 0) / absDeltas.length;

function bucket(delta: number): string {
  if (delta <= -30) return "≤−30";
  if (delta <= -15) return "−29…−15";
  if (delta <= -1) return "−14…−1";
  if (delta === 0) return "0";
  if (delta <= 14) return "+1…+14";
  if (delta <= 29) return "+15…+29";
  return "≥+30";
}

const deltaBuckets: Record<string, number> = {};
for (const r of scoreDiff) {
  const key = bucket(r.score_delta!);
  deltaBuckets[key] = (deltaBuckets[key] ?? 0) + 1;
}

const classCounts: Record<ClassId, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
for (const r of results) {
  for (const c of r.classes) classCounts[c] += 1;
}

console.log(
  JSON.stringify(
    {
      examined: results.length,
      reproducible: reproducible.length,
      non_reproducible: nonRepro.length,
      class_counts: classCounts,
      score_difference_count: scoreDiff.length,
      same_score_count: sameScore.length,
      grade_changed_count: gradeDiff.length,
      top_provider_changed_count: topDiff.length,
      mean_abs_score_delta: Number(meanAbs.toFixed(2)),
      min_score_delta: deltas[0] ?? null,
      max_score_delta: deltas[deltas.length - 1] ?? null,
      delta_buckets: deltaBuckets,
      research_library_seed_rows: library.length,
      research_library_score_diffs: library.filter((r) => r.classes.includes("B")).length,
      research_library_rows: library.map((r) => ({
        slug: r.slug,
        hist: `${r.hist_score} ${r.hist_grade}`,
        fresh: `${r.fresh_score} ${r.fresh_grade}`,
        delta: r.score_delta,
        top_changed: r.top_provider_changed,
        classes: r.classes,
      })),
      sample_largest_abs_deltas: [...scoreDiff]
        .sort((a, b) => Math.abs(b.score_delta!) - Math.abs(a.score_delta!))
        .slice(0, 8)
        .map((r) => ({
          slug: r.slug,
          hist: `${r.hist_score} ${r.hist_grade}`,
          fresh: `${r.fresh_score} ${r.fresh_grade}`,
          delta: r.score_delta,
          hist_top: r.hist_top,
          fresh_top: r.fresh_top,
        })),
      all: results.map((r) => ({
        slug: r.slug,
        library: r.in_research_library,
        hist: `${r.hist_score} ${r.hist_grade}`,
        fresh: r.fresh_score == null ? null : `${r.fresh_score} ${r.fresh_grade}`,
        delta: r.score_delta,
        classes: r.classes,
        top_changed: r.top_provider_changed,
      })),
    },
    null,
    2
  )
);

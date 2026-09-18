/** Shared model identity — no imports from scoring/meta (avoids circular deps). */

/** Bump when scoring rules change. Monitoring diffs this field. */
export const MODEL_VERSION = "gryps-signature-v0.3";
/** Numeric score authority — Mistral is optional prose only */
export const SCORING_ENGINE = "deterministic-v0.3";
/** User-facing engine tag (spaced middle dots; matches page chrome). */
export const SCORING_ENGINE_DISPLAY = "deterministic · v0.3";
/** Human-facing label for the deterministic score engine (UI chrome). */
export const SCORING_MODEL_LABEL = "Deterministic Model v0.3";
/** Human-facing label for optional recommendation prose (never changes numbers). */
export const RECOMMENDATION_AI_LABEL = "AI-assisted interpretation";

/**
 * Grade bands for Model v0.3 — single source of truth for Methodology, Signature a11y, Knowledge.
 * Spec band E (<40) maps to F in the UI.
 */
export const GRADE_BANDS = {
  A: { min: 90, label: "≥90" },
  B: { min: 75, max: 89, label: "75–89" },
  C: { min: 60, max: 74, label: "60–74" },
  D: { min: 40, max: 59, label: "40–59" },
  F: { max: 39, label: "<40" },
} as const;

export const GRADE_BANDS_SUMMARY = "A ≥90 · B 75–89 · C 60–74 · D 40–59 · F <40";

/**
 * Research documentation / methodology framework version.
 * May advance for provenance & quality work without changing the score formula.
 * See lib/research-docs.ts and /changelog.
 */
export const METHODOLOGY_VERSION = "v0.5";
export const METHODOLOGY_LABEL = "GRYPS Methodology v0.5";

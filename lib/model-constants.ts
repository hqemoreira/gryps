/** Shared model identity — no imports from scoring/meta (avoids circular deps). */

/** Bump when scoring rules change. Monitoring diffs this field. */
export const MODEL_VERSION = "gryps-signature-v0.4";
/** Numeric score authority — Mistral is optional prose only */
export const SCORING_ENGINE = "deterministic-v0.4";
/** User-facing engine tag (spaced middle dots; matches page chrome). */
export const SCORING_ENGINE_DISPLAY = "deterministic · v0.4";
/** Human-facing label for the deterministic score engine (UI chrome). */
export const SCORING_MODEL_LABEL = "Deterministic Model v0.4";
/** Human-facing label for optional recommendation prose (never changes numbers). */
export const RECOMMENDATION_AI_LABEL = "AI-assisted interpretation";

/**
 * Grade bands for Model v0.4 — single source of truth for Methodology, Signature a11y, Knowledge.
 * Spec band E (<40) maps to F in the UI.
 */
export const GRADE_BANDS = {
  A: { min: 85, label: "≥85" },
  B: { min: 70, max: 84, label: "70–84" },
  C: { min: 55, max: 69, label: "55–69" },
  D: { min: 40, max: 54, label: "40–54" },
  F: { max: 39, label: "<40" },
} as const;

export const GRADE_BANDS_SUMMARY = "A ≥85 · B 70–84 · C 55–69 · D 40–54 · F <40";

/**
 * Research documentation / methodology framework version.
 * Advanced with Model v0.4 two-layer scoring.
 * See lib/research-docs.ts and /changelog.
 */
export const METHODOLOGY_VERSION = "v0.6";
export const METHODOLOGY_LABEL = "GRYPS Methodology v0.6";

/** Layer A / B maxima (points earned, higher = better). */
export const CONDITIONS_MAX = 20;
export const MITIGATION_MAX = 80;
export const REDUNDANCY_MAX_V04 = 35;
export const PROVIDER_INDEPENDENCE_MAX_V04 = 25;
export const PROFILE_ALIGNMENT_MAX_V04 = 20;

/** Confidence range half-widths from evidence confidence band. */
export const CONFIDENCE_RANGE_HALF = {
  High: 3,
  Medium: 6,
  Low: 10,
} as const;

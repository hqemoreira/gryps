/** Shared model identity — no imports from scoring/meta (avoids circular deps). */

/** Bump when scoring rules change. Monitoring diffs this field. */
export const MODEL_VERSION = "gryps-signature-v0.3"
/** Numeric score authority — Mistral is optional prose only */
export const SCORING_ENGINE = "deterministic-v0.3"

/**
 * Research documentation / methodology framework version.
 * May advance for provenance & quality work without changing the score formula.
 * See lib/research-docs.ts and /changelog.
 */
export const METHODOLOGY_VERSION = "v0.5"
export const METHODOLOGY_LABEL = "GRYPS Methodology v0.5"


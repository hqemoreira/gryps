/**
 * Homepage sample Signature — single source for the live widget, meta tags, and OG image.
 * Recompute via scoreDeterministic so social previews cannot drift from the on-page demo.
 */
import { scoreDeterministic } from "@/lib/deterministic-score";

export const HERO_DEMO_INPUT = {
  lat: 68.2,
  lng: 27.4,
  sector: "forestry",
  autonomy: "autonomous",
  criticality: "high",
  providers: ["starlink"] as string[],
};

export const HERO_DEMO = scoreDeterministic(HERO_DEMO_INPUT);

export const HERO_DEMO_SCORE = HERO_DEMO.resilience_signature.score;
export const HERO_DEMO_GRADE = HERO_DEMO.resilience_signature.grade;

export const HERO_DEMO_TOP_RISK_EN = "No backup";
export const HERO_DEMO_TOP_REC =
  HERO_DEMO.connectivity_options[0] != null
    ? `${HERO_DEMO.connectivity_options[0].provider} · ${HERO_DEMO.connectivity_options[0].confidence}`
    : "—";

export const HERO_DEMO_OG_TITLE = `GRYPS · Score: ${HERO_DEMO_SCORE}/100 · Grade ${HERO_DEMO_GRADE}`;
export const HERO_DEMO_OG_ALT = `GRYPS Resilience Signature · Score ${HERO_DEMO_SCORE} · Grade ${HERO_DEMO_GRADE}`;

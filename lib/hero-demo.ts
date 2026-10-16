/**
 * Homepage sample Signature — single source for the live widget, meta tags, and OG image.
 * Recompute via scoreDeterministic so social previews cannot drift from the on-page demo.
 *
 * Mid-range well-configured example (Model v0.4): dual independent LEO paths at 67°N.
 * Interactive latitude ticks use the same profile; only lat changes — scores are never hand-tuned.
 * Lapland single-Starlink failure mode lives in the Research Library pedagogy entry.
 */
import { scoreDeterministic, type DeterministicResult } from "@/lib/deterministic-score";

export const HERO_DEMO_INPUT = {
  lat: 67.0,
  lng: 26.0,
  sector: "mining",
  autonomy: "remote-operated",
  criticality: "high",
  providers: ["starlink", "iridium"] as string[],
};

/** Band-edge pedagogy ticks — lat points match Model v0.4 latitudePoints (≤60 / ≤65 / ≤70 / >70). */
export type HeroLatitudeId = "60" | "65" | "67" | "70" | "75" | "80" | "polar";

export type HeroLatitudeTick = {
  id: HeroLatitudeId;
  /** Exact lat passed to scoreDeterministic */
  lat: number;
  /** Ruler label */
  label: string;
  placeEn: string;
  placeFi: string;
};

export const HERO_LATITUDE_TICKS: readonly HeroLatitudeTick[] = [
  {
    id: "60",
    lat: 60,
    label: "60N",
    placeEn: "60.0°N 26.0°E · Mid-latitude Nordic",
    placeFi: "60.0°N 26.0°E · Keskileveysasteen Pohjola",
  },
  {
    id: "65",
    lat: 65,
    label: "65N",
    placeEn: "65.0°N 26.0°E · High Nordic",
    placeFi: "65.0°N 26.0°E · Pohjoinen Pohjola",
  },
  {
    id: "67",
    lat: 67,
    label: "67N",
    placeEn: "67.0°N 26.0°E · Northern Finland",
    placeFi: "67.0°N 26.0°E · Pohjois-Suomi",
  },
  {
    id: "70",
    lat: 70,
    label: "70N",
    placeEn: "70.0°N 26.0°E · Arctic edge",
    placeFi: "70.0°N 26.0°E · Arktinen reuna",
  },
  {
    id: "75",
    lat: 75,
    label: "75N",
    placeEn: "75.0°N 26.0°E · High Arctic",
    placeFi: "75.0°N 26.0°E · Korkea Arktis",
  },
  {
    id: "80",
    lat: 80,
    label: "80N",
    placeEn: "80.0°N 26.0°E · Extreme Arctic",
    placeFi: "80.0°N 26.0°E · Äärimmäinen Arktis",
  },
  {
    id: "polar",
    lat: 82,
    label: "POLAR",
    placeEn: "82.0°N 26.0°E · Polar research envelope",
    placeFi: "82.0°N 26.0°E · Polaaritutkimuskehys",
  },
] as const;

export const HERO_DEFAULT_LATITUDE_ID: HeroLatitudeId = "67";

/** Precomputed Model v0.4 results — same dual-LEO mining profile, lat only varies. */
export const HERO_LATITUDE_RESULTS: Record<HeroLatitudeId, DeterministicResult> =
  Object.fromEntries(
    HERO_LATITUDE_TICKS.map((tick) => [
      tick.id,
      scoreDeterministic({ ...HERO_DEMO_INPUT, lat: tick.lat }),
    ])
  ) as Record<HeroLatitudeId, DeterministicResult>;

export function getHeroLatitudeTick(id: HeroLatitudeId): HeroLatitudeTick {
  const tick = HERO_LATITUDE_TICKS.find((t) => t.id === id);
  if (!tick) return HERO_LATITUDE_TICKS.find((t) => t.id === HERO_DEFAULT_LATITUDE_ID)!;
  return tick;
}

export function getHeroLatitudeResult(id: HeroLatitudeId): DeterministicResult {
  return HERO_LATITUDE_RESULTS[id] ?? HERO_LATITUDE_RESULTS[HERO_DEFAULT_LATITUDE_ID];
}

/** Default hero sample (67°N) — OG / meta / static imports. */
export const HERO_DEMO = HERO_LATITUDE_RESULTS[HERO_DEFAULT_LATITUDE_ID];

export const HERO_DEMO_SCORE = HERO_DEMO.resilience_signature.score;
export const HERO_DEMO_GRADE = HERO_DEMO.resilience_signature.grade;

export const HERO_DEMO_TOP_RISK_EN = "Correlated LEO broadband risk";
export const HERO_DEMO_TOP_REC =
  HERO_DEMO.connectivity_options[0] != null
    ? `${HERO_DEMO.connectivity_options[0].provider} · ${HERO_DEMO.connectivity_options[0].confidence}`
    : "—";

export const HERO_DEMO_PLACE = "67.0°N 26.0°E · Northern Finland";
export const HERO_DEMO_SUBTITLE_EN = "Starlink + Iridium Certus · dual LEO paths";
export const HERO_DEMO_SUBTITLE_FI = "Starlink + Iridium Certus · kaksi LEO-polkua";

/** Closest Research Library dual-path mining case for the hero sample card. */
export const HERO_DEMO_RESEARCH_HREF = "/research/finnish-arctic-mining-kittila";

export const HERO_DEMO_OG_TITLE = `GRYPS · Score: ${HERO_DEMO_SCORE}/100 · Grade ${HERO_DEMO_GRADE}`;
export const HERO_DEMO_OG_ALT = `GRYPS Resilience Signature · Score ${HERO_DEMO_SCORE} · Grade ${HERO_DEMO_GRADE}`;

/** Pedagogy / failure-mode companion (not the hero). */
export const LAPLAND_FAILURE_DEMO_INPUT = {
  lat: 68.2,
  lng: 27.4,
  sector: "forestry",
  autonomy: "autonomous",
  criticality: "high",
  providers: ["starlink"] as string[],
};

export const LAPLAND_FAILURE_DEMO = scoreDeterministic(LAPLAND_FAILURE_DEMO_INPUT);

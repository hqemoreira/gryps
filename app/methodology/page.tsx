import type { Metadata } from "next";
import { MethodologyView } from "./MethodologyView";
import {
  GRADE_BANDS_SUMMARY,
  METHODOLOGY_LABEL,
  SCORING_ENGINE_DISPLAY,
  SCORING_MODEL_LABEL,
} from "@/lib/model-constants";

export const metadata: Metadata = {
  title: `Methodology — ${METHODOLOGY_LABEL}`,
  description: `${METHODOLOGY_LABEL}: experimental Connectivity Intelligence — evidence chain, ${SCORING_MODEL_LABEL} scoring, data provenance, assumptions, and limitations. Indicative research — not procurement advice.`,
  alternates: { canonical: "https://gryps.vercel.app/methodology" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is GRYPS Research Methodology?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `${METHODOLOGY_LABEL} is the documentation framework for an experimental Connectivity Intelligence prototype. It connects operating environment, research, reference data, and ${SCORING_MODEL_LABEL} scoring. Outputs are indicative — not procurement, coverage certification, or engineering advice.`,
      },
    },
    {
      "@type": "Question",
      name: "How is the 0–100 Resilience Score computed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `${SCORING_MODEL_LABEL} (${SCORING_ENGINE_DISPLAY}) is deterministic. Score = Site Conditions (0–20) + Mitigation Quality (0–80: redundancy 0–35, provider/path independence 0–25, profile–autonomy alignment 0–20), then hard caps. Grades: ${GRADE_BANDS_SUMMARY}. Terrain evidence from EU-DEM is shown separately and is not blended into the Signature score.`,
      },
    },
    {
      "@type": "Question",
      name: "What is GRYPS not?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GRYPS is an experimental research prototype. Results are indicative and should not be interpreted as commercial procurement advice, coverage certification, or engineering advice.",
      },
    },
  ],
};

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MethodologyView />
    </>
  );
}

import type { Metadata } from "next";
import { MethodologyView } from "./MethodologyView";
import { METHODOLOGY_LABEL } from "@/lib/model-constants";

export const metadata: Metadata = {
  title: `Methodology — ${METHODOLOGY_LABEL}`,
  description: `${METHODOLOGY_LABEL}: experimental Connectivity Intelligence — evidence chain, Model v0.3 scoring, data provenance, assumptions, and limitations. Indicative research — not procurement advice.`,
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
        text: `${METHODOLOGY_LABEL} is the documentation framework for an experimental Connectivity Intelligence prototype. It connects operating environment, research, reference data, and deterministic Model v0.3 scoring. Outputs are indicative — not procurement, coverage certification, or engineering advice.`,
      },
    },
    {
      "@type": "Question",
      name: "How is the 0–100 Resilience Score computed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Model v0.3 is deterministic. Score = redundancy (0–30) + latitude (0–20) + operational profile (0–15) + provider confidence (0–30), then hard caps. Grades: A ≥90, B 75–89, C 60–74, D 40–59, F <40. Terrain evidence from EU-DEM is shown separately and is not blended into the Signature score.",
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

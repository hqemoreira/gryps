import type { Metadata } from "next"
import { MethodologyView } from "./MethodologyView"

export const metadata: Metadata = {
  title: "Methodology — GRYPS Research Methodology",
  description:
    "GRYPS Research Methodology: how an experimental Connectivity Intelligence framework connects environment, research, reference data, and Model v0.3 scoring to indicative Resilience Signatures — not procurement advice. English and Finnish.",
  alternates: { canonical: "https://gryps.vercel.app/methodology" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is GRYPS Research Methodology?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GRYPS is an experimental Connectivity Intelligence framework. It connects operating environment, relevant research, connectivity characteristics, deterministic Model v0.3 scoring, and provider recommendations into an evidence chain. Outputs are indicative research assessments — not procurement advice or live monitoring.",
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
        text: "GRYPS is not a site survey, not live satellite coverage, not insurance, not procurement advice, and not a substitute for professional connectivity engineering or legal advice. Outputs are illustrative research-prototype assessments.",
      },
    },
  ],
}

export default function MethodologyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MethodologyView />
    </>
  )
}

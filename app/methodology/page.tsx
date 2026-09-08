import type { Metadata } from "next"
import { MethodologyView } from "./MethodologyView"

export const metadata: Metadata = {
  title: "Methodology — How GRYPS scores connectivity resilience",
  description:
    "GRYPS Model v0.3 is a deterministic research prototype that scores satellite connectivity resilience for remote Nordic and Arctic operations. This page explains the 0–100 score, grade bands, component weights, hard caps, and what the advisor is not. Available in English and Finnish.",
  alternates: { canonical: "https://gryps.vercel.app/methodology" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is GRYPS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GRYPS is a non-commercial research prototype that scores satellite connectivity resilience for remote Nordic, Arctic, and Icelandic industrial operations. It produces a versioned Resilience Signature — an assessment at time T0, designed so later monitoring can show drift.",
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
        text: "GRYPS is not a site survey, not live satellite coverage, not insurance, and not a substitute for professional connectivity engineering or legal advice. Outputs are illustrative research-prototype assessments.",
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

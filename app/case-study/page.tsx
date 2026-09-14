import type { Metadata } from "next";
import { CaseStudyView } from "./CaseStudyView";
import { METHODOLOGY_LABEL } from "@/lib/model-constants";

export const metadata: Metadata = {
  title: "Case Study — GRYPS Connectivity Intelligence Research Prototype",
  description:
    "Portfolio case study: how GRYPS combines location, operational requirements and connectivity characteristics into an experimental decision-support model. Non-commercial R&D — indicative research, not a commercial product.",
  alternates: { canonical: "https://gryps.vercel.app/case-study" },
  openGraph: {
    title: "GRYPS — Connectivity Intelligence Research Prototype",
    description:
      "A portfolio case study of research, data modelling, scoring logic, and interactive decision-support for high-latitude satellite connectivity.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "GRYPS — Connectivity Intelligence Research Prototype",
  description:
    "Experimental Connectivity Intelligence research prototype for Nordic, Arctic, and Icelandic remote operations. Portfolio demonstration — not a commercial product.",
  creator: {
    "@type": "Person",
    name: "Henrique Moreira",
    url: "https://gryps.vercel.app/about",
  },
  about: "Satellite connectivity resilience decision support",
  url: "https://gryps.vercel.app/case-study",
  version: METHODOLOGY_LABEL,
};

export default function CaseStudyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CaseStudyView />
    </>
  );
}

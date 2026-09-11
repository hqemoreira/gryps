import type { Metadata } from "next"
import { ResearchPrototypeView } from "./ResearchPrototypeView"
import { METHODOLOGY_LABEL } from "@/lib/model-constants"

export const metadata: Metadata = {
  title: `Research & Prototype — ${METHODOLOGY_LABEL} | GRYPS`,
  description:
    "GRYPS is an experimental research prototype for remote connectivity decision support. Commercialization is outside the current scope. Indicative assessments — not procurement, certification, or engineering advice.",
  alternates: { canonical: "https://gryps.vercel.app/research-prototype" },
}

export default function ResearchPrototypePage() {
  return <ResearchPrototypeView />
}

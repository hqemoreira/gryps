import type { Metadata } from "next"
import { AssumptionsView } from "./AssumptionsView"
import { METHODOLOGY_LABEL } from "@/lib/model-constants"

export const metadata: Metadata = {
  title: `Assumptions — ${METHODOLOGY_LABEL} | GRYPS`,
  description:
    "Explicit assumptions behind GRYPS Resilience Signatures. Experimental research prototype — indicative results only.",
  alternates: { canonical: "https://gryps.vercel.app/assumptions" },
}

export default function AssumptionsPage() {
  return <AssumptionsView />
}

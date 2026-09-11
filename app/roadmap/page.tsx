import type { Metadata } from "next"
import { RoadmapView } from "./RoadmapView"
import { METHODOLOGY_LABEL } from "@/lib/model-constants"

export const metadata: Metadata = {
  title: `Roadmap — Research & Prototype Phase | ${METHODOLOGY_LABEL}`,
  description:
    "GRYPS research roadmap: nine completed prototype sprints, explicitly deferred commercial features, preferred research language, and strategic objective. Not becoming a business in this phase.",
  alternates: { canonical: "https://gryps.vercel.app/roadmap" },
}

export default function RoadmapPage() {
  return <RoadmapView />
}

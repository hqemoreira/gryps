import type { Metadata } from "next"
import { ChangelogView } from "./ChangelogView"
import { METHODOLOGY_LABEL } from "@/lib/model-constants"

export const metadata: Metadata = {
  title: `Changelog — ${METHODOLOGY_LABEL} | GRYPS`,
  description:
    "GRYPS Methodology changelog: how the research prototype and documentation evolve from v0.1 through v0.4. Scoring engine remains versioned and reproducible.",
  alternates: { canonical: "https://gryps.vercel.app/changelog" },
}

export default function ChangelogPage() {
  return <ChangelogView />
}

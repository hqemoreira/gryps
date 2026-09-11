import type { Metadata } from "next"
import { ResearchLibraryView } from "@/components/ResearchLibraryView"
import { getAllResearchEntries } from "@/lib/research-library"
import { resolveResearchAssessment } from "@/lib/research-resolve"

export const metadata: Metadata = {
  title: "Research Library — Connectivity Resilience Assessments | GRYPS",
  description:
    "Curated GRYPS research assessments of modeled satellite connectivity resilience across Nordic, Arctic, and Icelandic operating environments. GRYPS Methodology v0.4 · experimental research prototype — indicative, not procurement or certification.",
  alternates: { canonical: "https://gryps.vercel.app/research" },
  openGraph: {
    title: "GRYPS Research Library",
    description:
      "Explore modeled satellite connectivity resilience across remote and autonomous operating environments.",
  },
}

export const dynamic = "force-dynamic"

export default async function ResearchLibraryPage() {
  const entries = getAllResearchEntries()
  const cards = await Promise.all(
    entries.map(async e => {
      const resolved = await resolveResearchAssessment(e.slug)
      return {
        slug: e.slug,
        grade: resolved?.result.resilience_signature.grade ?? "—",
        score: resolved?.result.resilience_signature.score ?? 0,
      }
    }),
  )

  return <ResearchLibraryView cards={cards} />
}

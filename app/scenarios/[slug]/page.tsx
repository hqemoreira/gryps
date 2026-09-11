import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ScenarioDetailView } from "@/components/ScenarioDetailView"
import {
  getAllMissionScenarios,
  getMissionScenario,
} from "@/lib/mission-scenarios"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getAllMissionScenarios().map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const s = getMissionScenario(slug)
  if (!s) return { title: "Scenario not found | GRYPS" }
  return {
    title: `${s.title} — Mission Scenario | GRYPS`,
    description: s.blurb,
    alternates: { canonical: `https://gryps.vercel.app/scenarios/${s.slug}` },
  }
}

export default async function ScenarioPage({ params }: Props) {
  const { slug } = await params
  const scenario = getMissionScenario(slug)
  if (!scenario) notFound()
  return <ScenarioDetailView scenario={scenario} />
}

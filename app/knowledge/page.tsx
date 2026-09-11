import type { Metadata } from "next"
import { KnowledgeIndexView } from "./KnowledgeIndexView"

export const metadata: Metadata = {
  title: "Evidence — Satellite connectivity intelligence notes",
  description:
    "Citeable GRYPS notes on Arctic satellite connectivity, LEO/MEO/GEO trade-offs, Finnish forestry links, and resilience scoring. Modeled intelligence — not live RF. English and Finnish.",
  alternates: { canonical: "https://gryps.vercel.app/knowledge" },
}

export default function KnowledgeIndexPage() {
  return <KnowledgeIndexView />
}

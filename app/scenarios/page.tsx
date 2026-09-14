import type { Metadata } from "next";
import { ScenarioLibraryView } from "@/components/ScenarioLibraryView";

export const metadata: Metadata = {
  title: "Mission Scenarios — Scenario & Mission Research | GRYPS",
  description:
    "Research scenarios for Arctic forestry, mining, maritime, remote industrial ops, emergency response, and remote infrastructure. Connectivity architecture analysis — not customer projects or a sales funnel.",
  alternates: { canonical: "https://gryps.vercel.app/scenarios" },
  openGraph: {
    title: "GRYPS Mission Scenarios",
    description:
      "What connectivity architecture might suit this scenario? Research-only decision-support concepts.",
  },
};

export default function ScenariosPage() {
  return <ScenarioLibraryView />;
}

import type { Metadata } from "next";
import { ProvidersView } from "./ProvidersView";

export const metadata: Metadata = {
  title: "Provider index — satellite operators at 70°N+",
  description:
    "Curated public-knowledge index of LEO, MEO, and GEO satellite operators GRYPS uses when ranking connectivity options for Nordic and Arctic sites. Not live coverage data. Non-commercial R&D prototype. Available in English and Finnish.",
  alternates: { canonical: "https://gryps.vercel.app/providers" },
};

export default function ProvidersPage() {
  return <ProvidersView />;
}

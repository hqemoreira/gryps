import type { Metadata } from "next";
import { AboutView } from "./AboutView";

export const metadata: Metadata = {
  title: "About GRYPS — Connectivity resilience R&D prototype",
  description:
    "GRYPS is a non-commercial R&D prototype by Henrique Moreira (Espoo, Finland) that scores satellite connectivity resilience for Nordic and Arctic operations. Not a commercial service.",
  alternates: { canonical: "https://gryps.vercel.app/about" },
};

export default function AboutPage() {
  return <AboutView />;
}

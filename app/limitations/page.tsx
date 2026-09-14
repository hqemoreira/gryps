import type { Metadata } from "next";
import { LimitationsView } from "./LimitationsView";
import { METHODOLOGY_LABEL } from "@/lib/model-constants";

export const metadata: Metadata = {
  title: `Limitations — ${METHODOLOGY_LABEL} | GRYPS`,
  description:
    "GRYPS is an experimental research prototype. Results are indicative and should not be interpreted as commercial procurement advice, coverage certification, or engineering advice.",
  alternates: { canonical: "https://gryps.vercel.app/limitations" },
};

export default function LimitationsPage() {
  return <LimitationsView />;
}

import type { Metadata } from "next";
import { FiSummaryView } from "./FiSummaryView";
import { METHODOLOGY_LABEL, SCORING_MODEL_LABEL } from "@/lib/model-constants";

export const metadata: Metadata = {
  title: `Suomenkielinen tiivistelmä — GRYPS`,
  description: `GRYPS on ei-kaupallinen tutkimusprototyyppi pohjoismaiselle ja arktiselle yhteysresilienssille. ${SCORING_MODEL_LABEL} tuottaa Resilience Signature -pisteen. ${METHODOLOGY_LABEL}.`,
  alternates: { canonical: "https://gryps.vercel.app/fi" },
};

export default function FiSummaryPage() {
  return <FiSummaryView />;
}

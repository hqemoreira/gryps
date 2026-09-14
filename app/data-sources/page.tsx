import type { Metadata } from "next";
import { DataSourcesView } from "./DataSourcesView";
import { METHODOLOGY_LABEL } from "@/lib/model-constants";

export const metadata: Metadata = {
  title: `Data Sources — ${METHODOLOGY_LABEL} | GRYPS`,
  description:
    "GRYPS data provenance: source, date accessed, data type, and how the research prototype uses each dataset. Experimental Connectivity Intelligence — not procurement advice.",
  alternates: { canonical: "https://gryps.vercel.app/data-sources" },
};

export default function DataSourcesPage() {
  return <DataSourcesView />;
}

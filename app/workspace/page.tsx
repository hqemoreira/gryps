import type { Metadata } from "next";
import { WorkspaceClient } from "./WorkspaceClient";

export const metadata: Metadata = {
  title: "Assessments — Saved Resilience Signatures | GRYPS",
  description:
    "Local research workspace for saved GRYPS assessments: compare scenarios, export Research Assessment reports. Analytical modelling — not a customer CRM or sales funnel.",
  alternates: { canonical: "https://gryps.vercel.app/workspace" },
  robots: { index: true, follow: true },
};

export default function WorkspacePage() {
  return <WorkspaceClient />;
}

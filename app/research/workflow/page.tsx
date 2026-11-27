import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResearchWorkflowView } from "@/components/ResearchWorkflowView";
import { grypsCopyright } from "@/lib/gryps-copyright";

export const metadata: Metadata = {
  title: "Research workflow — Site to report | GRYPS",
  description:
    "Integrated research assessment workflow: site, scenario, dependencies, evidence, Model v0.4 assessment, comparison, and report. Experimental prototype — not certification.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://gryps.vercel.app/research/workflow" },
};

export default function ResearchWorkflowPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header ctaHref="/research/workflow" useIaNav />
      <div className="gryps-page-under-nav">
        <ResearchWorkflowView />
      </div>
      <Footer
        footerRights={grypsCopyright("en")}
        secondaryLink={{ href: "/research", label: "Research Library" }}
      />
    </div>
  );
}

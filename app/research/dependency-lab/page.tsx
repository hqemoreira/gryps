import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DependencyLabClient } from "./DependencyLabClient";
import { grypsCopyright } from "@/lib/gryps-copyright";

export const metadata: Metadata = {
  title: "Dependency research lab — Research preview | GRYPS",
  description:
    "Experimental non-scoring dependency research panel. Model v0.4 Signature remains unchanged; fixtures do not establish operational path independence.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://gryps.vercel.app/research/dependency-lab" },
};

export default function DependencyLabPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header ctaHref="/research/workflow" useIaNav />
      <div className="gryps-page-under-nav">
        <DependencyLabClient />
      </div>
      <Footer
        footerRights={grypsCopyright("en")}
        secondaryLink={{ href: "/research/workflow", label: "Research workflow" }}
      />
    </div>
  );
}

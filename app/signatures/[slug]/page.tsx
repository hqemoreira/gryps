import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteBySlug, getAllSites } from "@/lib/signatures-db";
import { ResilienceOutput } from "@/components/ResilienceOutput";
import { GrypsPrintBrand } from "@/components/GrypsMark";
import { gradeColor } from "@/lib/resilience-colors";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { grypsCopyright } from "@/lib/gryps-copyright";
import {
  getResearchByLegacySignatureSlug,
  isThinSignatureSlug,
  RESEARCH_LIBRARY,
} from "@/lib/research-library";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const research =
    getResearchByLegacySignatureSlug(slug) ??
    RESEARCH_LIBRARY.find((e) => e.source === "seed" && e.sourceId === slug);
  if (research) {
    return {
      title: `${research.title} | GRYPS`,
      robots: { index: false, follow: true },
      alternates: { canonical: `https://gryps.vercel.app/research/${research.slug}` },
    };
  }

  const site = await getSiteBySlug(slug);
  if (!site) return { title: "Site not found | GRYPS", robots: { index: false, follow: false } };

  const { score, grade, summary } = site.output.resilience_signature;
  return {
    title: `${site.name} — Resilience Signature ${score}/${grade} | GRYPS`,
    description: summary,
    robots: { index: false, follow: false },
    // Thin Site XX pages stay available for map/dev but are not search assets.
  };
}

export default async function SignatureSitePage({ params }: Props) {
  const { slug } = await params;

  const research =
    getResearchByLegacySignatureSlug(slug) ??
    RESEARCH_LIBRARY.find((e) => e.source === "seed" && e.sourceId === slug);
  if (research) {
    permanentRedirect(`/research/${research.slug}`);
  }

  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const { score, grade } = site.output.resilience_signature;
  const gc = gradeColor(grade);
  const thin = isThinSignatureSlug(slug);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header ctaHref="/#advisor" useIaNav />

      <div
        className="gryps-page-under-nav"
        style={{
          maxWidth: 800,
          margin: "0 auto",
          paddingLeft: 32,
          paddingRight: 32,
          paddingBottom: 80,
        }}
      >
        <div
          className="gryps-no-print"
          style={{
            backgroundColor: "rgba(217,119,6,0.08)",
            border: "1px solid rgba(217,119,6,0.25)",
            borderRadius: 6,
            padding: "8px 14px",
            marginBottom: 24,
          }}
        >
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--accent-amber)" }}>
            {thin
              ? "Internal / illustrative Site XX assessment — not part of the public Research Library. Research prototype · Non-commercial · Model-based analysis."
              : "Illustrative site — Research prototype · Non-commercial · Model-based analysis."}
          </p>
        </div>

        <div className="gryps-print-target">
          <GrypsPrintBrand />
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--text-dim)",
              letterSpacing: "0.12em",
              marginBottom: 8,
            }}
          >
            RESILIENCE SIGNATURE
          </p>
          <h1
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 26,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 24,
              letterSpacing: "-0.01em",
            }}
          >
            {site.name}
          </h1>

          <ResilienceOutput
            result={site.output}
            input={{
              lat: site.lat,
              lng: site.lng,
              sector: site.sector,
              autonomy_level: site.autonomy_level,
              operation_criticality: site.operation_criticality,
              current_setup: site.current_setup ?? undefined,
            }}
            realData={
              site.real_data_score != null
                ? {
                    realDataScore: site.real_data_score,
                    terrainPenaltyScore: site.terrain_penalty_score,
                    elevationCenterM: site.elevation_center_m,
                    elevationVarianceM: site.elevation_variance_m,
                    realWorldGapScore: site.real_world_gap_score,
                    municipality: site.municipality,
                    bittimittariPeriod: site.bittimittari_period,
                    bittimittariSampleCount: site.bittimittari_sample_count,
                    bittimittariMedianDownloadMbps: site.bittimittari_median_download_mbps,
                    bittimittariMedianLatencyMs: site.bittimittari_median_latency_ms,
                  }
                : undefined
            }
          />
        </div>

        <div
          className="gryps-no-print"
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: 48,
            paddingTop: 40,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 10,
            }}
          >
            Generate your Resilience Signature
          </h2>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
              maxWidth: 420,
              margin: "0 auto 24px",
            }}
          >
            This site scored {score} ({grade}). Free · No account required.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/#advisor"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: gc,
                color: "#070B12",
                fontFamily: "var(--font-ui)",
                fontWeight: 700,
                fontSize: 13,
                padding: "12px 24px",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Generate Resilience Signature <ArrowRight size={14} />
            </Link>
            <Link
              href="/research"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-ui)",
                fontWeight: 600,
                fontSize: 13,
                padding: "12px 24px",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Research Library
            </Link>
          </div>
        </div>
      </div>

      <Footer
        footerRights={grypsCopyright("en", "Espoo, Finland · Non-commercial R&D prototype")}
        secondaryLink={{ href: "/research", label: "Research Library" }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const sites = await getAllSites();
    return sites.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

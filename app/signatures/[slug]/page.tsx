import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getSiteBySlug, getAllSites } from "@/lib/signatures-db"
import { ResilienceOutput } from "@/components/ResilienceOutput"
import { gradeColor } from "@/lib/resilience-colors"
import { Header } from "@/components/Header"
import { Footer, grypsCopyright } from "@/components/Footer"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteBySlug(slug)
  if (!site) return { title: "Site not found | GRYPS" }

  const { score, grade, summary } = site.output.resilience_signature
  const title = `${site.name} — Resilience Signature ${score}/${grade} | GRYPS`
  const description = summary

  return {
    title,
    description,
    alternates: { canonical: `https://gryps.vercel.app/signatures/${slug}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  }
}

export default async function SignatureSitePage({ params }: Props) {
  const { slug } = await params
  const site = await getSiteBySlug(slug)
  if (!site) notFound()

  const { score, grade } = site.output.resilience_signature
  const gc = gradeColor(grade)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${site.name} — Resilience Signature`,
    "description": site.output.resilience_signature.summary,
    "creator": { "@type": "Organization", "name": "GRYPS", "url": "https://gryps.vercel.app", "email": "hello@gryps.eu" },
    "spatialCoverage": {
      "@type": "Place",
      "geo": { "@type": "GeoCoordinates", "latitude": site.lat, "longitude": site.lng },
    },
    "variableMeasured": "Connectivity Resilience Score",
    "dateModified": site.last_scored_at,
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header
        ctaHref="/#advisor"
        ctaLabel="Score your site"
        extraLink={{ href: "/signatures", label: "← All signatures" }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 32px 80px", paddingTop: 90 }}>
        {/* Disclosure */}
        <div className="gryps-no-print" style={{
          backgroundColor: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)",
          borderRadius: 6, padding: "8px 14px", marginBottom: 24,
        }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--accent-amber)" }}>
            Illustrative, synthesized site for demonstration — R&D prototype.
          </p>
        </div>

        <div className="gryps-print-target">
          {/* Site header */}
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>
            RESILIENCE SIGNATURE
          </p>
          <h1 style={{ fontFamily: "var(--font-ui)", fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 24, letterSpacing: "-0.01em" }}>
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
            realData={site.real_data_score != null ? {
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
            } : undefined}
          />
        </div>

        {/* CTA */}
        <div className="gryps-no-print" style={{ borderTop: "1px solid var(--border)", marginTop: 48, paddingTop: 40, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
            Score your own site
          </h2>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
            This site scored {score} ({grade}) using the same free Advisor available to you right now.
          </p>
          <Link href="/#advisor" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: gc, color: "#070B12",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
            padding: "12px 24px", borderRadius: 6, textDecoration: "none",
          }}>
            Run the free Advisor <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <Footer
        footerRights={grypsCopyright("en", "Espoo, Finland · Non-commercial R&D prototype")}
        secondaryLink={{ href: "/signatures", label: "All signatures" }}
      />
    </div>
  )
}

export async function generateStaticParams() {
  try {
    const sites = await getAllSites()
    return sites.map(s => ({ slug: s.slug }))
  } catch {
    return []
  }
}

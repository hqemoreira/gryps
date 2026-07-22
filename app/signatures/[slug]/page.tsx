import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { getSiteBySlug, getAllSites } from "@/lib/signatures-db"
import { ResilienceOutput, gradeColor } from "@/components/ResilienceOutput"

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
    "creator": { "@type": "Organization", "name": "GRYPS", "url": "https://gryps.vercel.app", "email": "hello@gryps.fi" },
    "spatialCoverage": {
      "@type": "Place",
      "geo": { "@type": "GeoCoordinates", "latitude": site.lat, "longitude": site.lng },
    },
    "variableMeasured": "Connectivity Resilience Score",
    "dateModified": site.last_scored_at,
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", paddingTop: 90 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        backgroundColor: "rgba(7,11,18,0.92)", backdropFilter: "blur(12px)",
        padding: "0 32px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
            <path d="M4 18 A14 14 0 0 1 32 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
            <path d="M8 18 A10 10 0 0 1 28 18" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75"/>
            <path d="M12 18 A6 6 0 0 1 24 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <line x1="18" y1="20" x2="18" y2="10" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M15 13 L18 9 L21 13" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="18" cy="21" r="1.5" fill="#4FA8FF"/>
          </svg>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", color: "var(--text)" }}>GRYPS</span>
        </Link>
        <Link href="/signatures" style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textDecoration: "none" }}>
          ← All signatures
        </Link>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 32px 80px" }}>
        {/* Disclosure */}
        <div style={{
          backgroundColor: "rgba(245,184,74,0.06)", border: "1px solid rgba(245,184,74,0.2)",
          borderRadius: 6, padding: "8px 14px", marginBottom: 24,
        }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "#F5B84A" }}>
            Illustrative, synthesized site for demonstration — R&D prototype.
          </p>
        </div>

        {/* Site header */}
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>
          RESILIENCE SIGNATURE
        </p>
        <h1 style={{ fontFamily: "var(--font-ui)", fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
          {site.name}
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)" }}>
            {site.lat.toFixed(2)}°N · {site.lng.toFixed(2)}°E
          </span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>
            {site.sector.toUpperCase()} · {site.autonomy_level.toUpperCase()} · {site.operation_criticality.toUpperCase()}
          </span>
        </div>
        {site.current_setup && (
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-dim)", marginBottom: 24 }}>
            Current setup: {site.current_setup}
          </p>
        )}

        <ResilienceOutput result={site.output} />

        {/* CTA */}
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 48, paddingTop: 40, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
            Score your own site
          </h2>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
            This site scored {score} ({grade}) using the same free Advisor available to you right now.
          </p>
          <a href="/#advisor" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: gc, color: "#070B12",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
            padding: "12px 24px", borderRadius: 6, textDecoration: "none",
          }}>
            Run the free Advisor <ArrowRight size={14} />
          </a>
        </div>
      </div>
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

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ResearchAssessmentView } from "@/components/ResearchAssessmentView"
import { grypsCopyright } from "@/lib/gryps-copyright"
import {
  getAllResearchEntries,
  getResearchEntry,
} from "@/lib/research-library"
import { resolveResearchAssessment } from "@/lib/research-resolve"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllResearchEntries().map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getResearchEntry(slug)
  if (!entry) return { title: "Assessment not found | GRYPS" }

  const resolved = await resolveResearchAssessment(slug)
  const score = resolved?.result.resilience_signature.score
  const grade = resolved?.result.resilience_signature.grade
  const title = score != null && grade
    ? `${entry.title} — Resilience Signature ${score}/${grade} | GRYPS`
    : `${entry.title} | GRYPS Research Library`
  const description = `${entry.subtitle}. ${entry.context.slice(0, 140)}…`

  return {
    title,
    description,
    alternates: { canonical: `https://gryps.vercel.app/research/${slug}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  }
}

export default async function ResearchAssessmentPage({ params }: Props) {
  const { slug } = await params
  const data = await resolveResearchAssessment(slug)
  if (!data) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${data.entry.title} — Resilience Signature`,
    description: data.entry.context,
    creator: {
      "@type": "Organization",
      name: "GRYPS",
      url: "https://gryps.vercel.app",
      email: "hello@gryps.eu",
    },
    spatialCoverage: {
      "@type": "Place",
      geo: {
        "@type": "GeoCoordinates",
        latitude: data.input.lat,
        longitude: data.input.lng,
      },
    },
    variableMeasured: "Connectivity Resilience Score",
    isAccessibleForFree: true,
    creativeWorkStatus: "Research prototype",
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header
        ctaHref="/#advisor"
        ctaLabel="Generate Resilience Signature"
        extraLink={{ href: "/research", label: "← Research Library" }}
      />
      <div className="gryps-page-under-nav">
        <ResearchAssessmentView data={data} />
      </div>
      <Footer
        footerRights={grypsCopyright("en", "Espoo, Finland · Non-commercial R&D prototype")}
        secondaryLink={{ href: "/research", label: "Research Library" }}
      />
    </div>
  )
}

import type { Metadata } from "next"
import { getAllSites } from "@/lib/signatures-db"
import { capacityStatusFromSignature } from "@/lib/capacity-status"
import { CapacityMapView, type CapacitySiteView } from "@/components/CapacityMapView"

export const metadata: Metadata = {
  title: "Connectivity Intelligence Map — Modeled Capacity | GRYPS",
  description:
    "Explore modeled satellite connectivity resilience across Nordic, Arctic, and Icelandic sites. Deterministic GRYPS Signature scores — not live RF. Run an assessment for your location.",
  alternates: { canonical: "https://gryps.vercel.app/map" },
  openGraph: {
    title: "Connectivity Intelligence Map | GRYPS",
    description:
      "Modeled connectivity capacity across remote Nordic and Arctic operations. Research prototype — not live network monitoring.",
  },
}

export const dynamic = "force-dynamic"

function orbitFromType(type: string | undefined): string | null {
  if (!type) return null
  const t = type.toUpperCase()
  if (t.includes("LEO")) return "LEO"
  if (t.includes("MEO")) return "MEO"
  if (t.includes("GEO")) return "GEO"
  if (t.includes("POLAR")) return "Polar"
  return type.split(/\s+/)[0] || null
}

export default async function MapPage() {
  let sites: CapacitySiteView[] = []
  try {
    const rows = await getAllSites()
    sites = rows.map(s => {
      const score = s.output?.resilience_signature?.score ?? null
      const grade = s.output?.resilience_signature?.grade ?? null
      const top = s.output?.connectivity_options?.[0]
      return {
        slug: s.slug,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        sector: s.sector,
        autonomy_level: s.autonomy_level,
        operation_criticality: s.operation_criticality,
        status: capacityStatusFromSignature(grade, score),
        score,
        grade,
        summary: s.output?.resilience_signature?.summary ?? null,
        last_scored_at: s.last_scored_at ?? null,
        country: s.country,
        municipality: s.municipality,
        real_data_score: s.real_data_score,
        terrain_penalty_score: s.terrain_penalty_score,
        real_world_gap_score: s.real_world_gap_score,
        top_provider: top?.provider ?? null,
        top_confidence: top?.confidence ?? null,
        top_orbit: orbitFromType(top?.type),
        latency_estimate: top?.failover_latency ?? (
          s.bittimittari_median_latency_ms != null
            ? `~${Math.round(s.bittimittari_median_latency_ms)} ms (terrestrial evidence)`
            : null
        ),
        recommendation: s.output?.recommendation ?? null,
        source: "signature_sites" as const,
      }
    })
  } catch (err) {
    console.error("Capacity map: failed to load signature_sites:", err)
  }

  return <CapacityMapView sites={sites} />
}

import type { Metadata } from "next"
import { getAllSites } from "@/lib/signatures-db"
import { capacityStatusFromSignature } from "@/lib/capacity-status"
import { CapacityMapView, type CapacitySiteView } from "@/components/CapacityMapView"

export const metadata: Metadata = {
  title: "Capacity Map — Connectivity Posture | GRYPS",
  description:
    "Portfolio view of Nordic, Arctic, and Icelandic sites with connectivity capacity status derived from Resilience Signatures. Non-commercial R&D prototype — not live network monitoring.",
  alternates: { canonical: "https://gryps.vercel.app/map" },
}

export const dynamic = "force-dynamic"

export default async function MapPage() {
  let sites: CapacitySiteView[] = []
  try {
    const rows = await getAllSites()
    sites = rows.map(s => {
      const score = s.output?.resilience_signature?.score ?? null
      const grade = s.output?.resilience_signature?.grade ?? null
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
        source: "signature_sites" as const,
      }
    })
  } catch (err) {
    console.error("Capacity map: failed to load signature_sites:", err)
  }

  return <CapacityMapView sites={sites} />
}

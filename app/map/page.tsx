import type { Metadata } from "next";
import { getAllSites } from "@/lib/signatures-db";
import { capacityStatusFromSignature } from "@/lib/capacity-status";
import { CapacityMapView, type CapacitySiteView } from "@/components/CapacityMapView";
import {
  mapRegionForSite,
  mapVerticalForSite,
  researchEntryForSignatureSlug,
} from "@/lib/research-library";

export const metadata: Metadata = {
  title: "Explore Connectivity Intelligence | GRYPS",
  description:
    "Explore modeled satellite connectivity resilience across Nordic, Arctic, and Icelandic sites. Select a region and vertical, then Generate a Resilience Signature. Research prototype — not live RF.",
  alternates: { canonical: "https://gryps.vercel.app/map" },
  openGraph: {
    title: "Explore Connectivity Intelligence | GRYPS",
    description:
      "Select a region → understand the connectivity environment → Generate Resilience Signature. Research prototype · Non-commercial · Model-based analysis.",
  },
};

export const dynamic = "force-dynamic";

function orbitsFromOptions(options: { type?: string }[] | undefined): string[] {
  if (!options?.length) return [];
  const set = new Set<string>();
  for (const o of options) {
    const t = (o.type ?? "").toUpperCase();
    if (t.includes("POLAR") || t.includes("NARROWBAND")) set.add("Polar");
    else if (t.includes("LEO")) set.add("LEO");
    else if (t.includes("MEO")) set.add("MEO");
    else if (t.includes("GEO")) set.add("GEO");
  }
  return Array.from(set);
}

function orbitFromType(type: string | undefined): string | null {
  if (!type) return null;
  const t = type.toUpperCase();
  if (t.includes("POLAR") || t.includes("NARROWBAND")) return "Polar";
  if (t.includes("LEO")) return "LEO";
  if (t.includes("MEO")) return "MEO";
  if (t.includes("GEO")) return "GEO";
  return type.split(/\s+/)[0] || null;
}

export default async function MapPage() {
  let sites: CapacitySiteView[] = [];
  try {
    const rows = await getAllSites();
    sites = rows.map((s) => {
      const score = s.output?.resilience_signature?.score ?? null;
      const grade = s.output?.resilience_signature?.grade ?? null;
      const top = s.output?.connectivity_options?.[0];
      const research = researchEntryForSignatureSlug(s.slug);
      const region = mapRegionForSite({
        slug: s.slug,
        country: s.country,
        lat: s.lat,
        lng: s.lng,
      });
      const vertical = mapVerticalForSite(s.sector, s.slug);
      return {
        slug: s.slug,
        name: s.name,
        displayName: research?.title ?? s.name,
        displayNameFi: research?.titleFi ?? s.name,
        lat: s.lat,
        lng: s.lng,
        sector: s.sector,
        vertical,
        region,
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
        orbit_architectures: orbitsFromOptions(s.output?.connectivity_options),
        latency_estimate:
          top?.failover_latency ??
          (s.bittimittari_median_latency_ms != null
            ? `~${Math.round(s.bittimittari_median_latency_ms)} ms (terrestrial evidence)`
            : null),
        recommendation: s.output?.recommendation ?? null,
        researchSlug: research?.slug ?? null,
        inResearchLibrary: Boolean(research),
        source: "signature_sites" as const,
      };
    });
    // Surface Research Library sites first in the default list order.
    sites.sort((a, b) => Number(b.inResearchLibrary) - Number(a.inResearchLibrary));
  } catch (err) {
    console.error("Connectivity Intelligence map: failed to load signature_sites:", err);
  }

  return <CapacityMapView sites={sites} />;
}

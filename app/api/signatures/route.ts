import { NextResponse } from "next/server";
import { getAllSites } from "@/lib/signatures-db";

export async function GET() {
  try {
    const sites = await getAllSites();
    const summary = sites.map((s) => ({
      slug: s.slug,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      sector: s.sector,
      autonomy_level: s.autonomy_level,
      operation_criticality: s.operation_criticality,
      score: s.output.resilience_signature.score,
      grade: s.output.resilience_signature.grade,
      summary: s.output.resilience_signature.summary,
    }));
    return NextResponse.json({ sites: summary });
  } catch (err) {
    console.error("Failed to fetch signature sites:", err);
    return NextResponse.json({ sites: [] }, { status: 500 });
  }
}

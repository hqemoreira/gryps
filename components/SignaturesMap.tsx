"use client"
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"
import { basemapTiles } from "@/lib/basemap"

type SiteSummary = {
  slug: string
  name: string
  lat: number
  lng: number
  sector: string
  autonomy_level: string
  operation_criticality: string
  score: number
  grade: string
}

// Vivid — used for the pin fill on the map tile (decorative, not text; contrast is
// against the basemap, not a text-on-surface case).
const GRADE_COLOR: Record<string, string> = {
  A: "#2ED47A", B: "#4FA8FF", C: "#D97706", D: "#D97706", F: "#EF4444",
}

// Leaflet's default popup chrome is ALWAYS a white box regardless of site theme,
// so popup text must always use the light-safe palette — never the theme-aware
// CSS vars, which would resolve to the dark-mode vivid values (and fail contrast
// against that permanently-white background) whenever the site itself is dark.
const POPUP_TEXT_COLOR: Record<string, string> = {
  A: "#146B3E", B: "#0B5FBF", C: "#9A4508", D: "#9A4508", F: "#C41E1E",
}
const POPUP_LINK_COLOR = "#0B5FBF"

export function SignaturesMap({ sites, dark = true }: { sites: SiteSummary[]; dark?: boolean }) {
  const tiles = basemapTiles()
  return (
    <MapContainer
      center={[67, 22]}
      zoom={4}
      style={{ height: 480, width: "100%", borderRadius: 10 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url={tiles.url}
        attribution={tiles.attribution}
        className={dark ? "gryps-basemap-dim" : undefined}
      />
      {sites.map(site => (
        <CircleMarker
          key={site.slug}
          center={[site.lat, site.lng]}
          radius={7}
          pathOptions={{
            color: GRADE_COLOR[site.grade] ?? "#64748B",
            fillColor: GRADE_COLOR[site.grade] ?? "#64748B",
            fillOpacity: 0.75,
            weight: 1.5,
          }}
        >
          <Popup>
            <div style={{ fontFamily: "sans-serif", minWidth: 180 }}>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{site.name}</p>
              <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                {site.sector} · {site.autonomy_level} · {site.operation_criticality}
              </p>
              <p style={{ fontSize: 20, fontWeight: 900, color: POPUP_TEXT_COLOR[site.grade], marginBottom: 6 }}>
                {site.score} <span style={{ fontSize: 12 }}>({site.grade})</span>
              </p>
              <Link href={`/signatures/${site.slug}`} style={{ fontSize: 12, color: POPUP_LINK_COLOR, fontWeight: 700 }}>
                View full signature →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

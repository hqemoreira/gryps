"use client"
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"

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

const GRADE_COLOR: Record<string, string> = {
  A: "#2ED47A", B: "#4FA8FF", C: "#F5B84A", D: "#F5B84A", F: "#EF4444",
}

export function SignaturesMap({ sites }: { sites: SiteSummary[] }) {
  return (
    <MapContainer
      center={[67, 22]}
      zoom={4}
      style={{ height: 480, width: "100%", borderRadius: 10 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
              <p style={{ fontSize: 20, fontWeight: 900, color: GRADE_COLOR[site.grade], marginBottom: 6 }}>
                {site.score} <span style={{ fontSize: 12 }}>({site.grade})</span>
              </p>
              <Link href={`/signatures/${site.slug}`} style={{ fontSize: 12, color: "#4FA8FF", fontWeight: 700 }}>
                View full signature →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

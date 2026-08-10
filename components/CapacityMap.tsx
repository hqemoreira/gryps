"use client"
import { useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import {
  CAPACITY_STATUS_COLOR,
  type CapacityStatus,
} from "@/lib/capacity-status"

export type CapacityMapSite = {
  slug: string
  name: string
  lat: number
  lng: number
  status: CapacityStatus
}

function FitBounds({ sites }: { sites: CapacityMapSite[] }) {
  const map = useMap()
  useEffect(() => {
    if (sites.length === 0) return
    const lats = sites.map(s => s.lat)
    const lngs = sites.map(s => s.lng)
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [40, 40], maxZoom: 6 },
    )
  }, [map, sites])
  return null
}

export function CapacityMap({
  sites,
  dark = true,
  selectedSlug,
  onSelect,
}: {
  sites: CapacityMapSite[]
  dark?: boolean
  selectedSlug: string | null
  onSelect: (slug: string) => void
}) {
  return (
    <MapContainer
      center={[67, 18]}
      zoom={4}
      style={{ height: "100%", width: "100%", borderRadius: 10, background: "var(--surface)" }}
      scrollWheelZoom
    >
      <TileLayer
        url={`https://{s}.basemaps.cartocdn.com/${dark ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <FitBounds sites={sites} />
      {sites.map(site => {
        const color = CAPACITY_STATUS_COLOR[site.status]
        const selected = site.slug === selectedSlug
        return (
          <CircleMarker
            key={site.slug}
            center={[site.lat, site.lng]}
            radius={selected ? 11 : 7}
            eventHandlers={{ click: () => onSelect(site.slug) }}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: selected ? 0.95 : 0.75,
              weight: selected ? 3 : 1.5,
            }}
          />
        )
      })}
    </MapContainer>
  )
}

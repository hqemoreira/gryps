"use client"

import { useEffect, useRef } from "react"
import * as maplibregl from "maplibre-gl"
import type { Map, Marker } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import {
  CAPACITY_STATUS_COLOR,
  capacityStatusLabel,
  type CapacityStatus,
} from "@/lib/capacity-status"
import { addOpsDecorLayers, darkOpsStyle, OPS_MAP_CSS } from "@/lib/ops-map-style"
import { MODEL_VERSION } from "@/lib/signature-meta"

export type CapacityMapSite = {
  slug: string
  name: string
  lat: number
  lng: number
  status: CapacityStatus
}

function modelChip(): string {
  const m = MODEL_VERSION.match(/v[\d.]+/)
  return m ? m[0] : "v0.3"
}

function fitSites(map: Map, sites: CapacityMapSite[]) {
  if (sites.length === 0) {
    map.jumpTo({ center: [18, 67], zoom: 3.4 })
    return
  }
  if (sites.length === 1) {
    map.jumpTo({ center: [sites[0].lng, sites[0].lat], zoom: 5.5 })
    return
  }
  const bounds = new maplibregl.LngLatBounds(
    [sites[0].lng, sites[0].lat],
    [sites[0].lng, sites[0].lat],
  )
  for (const s of sites) bounds.extend([s.lng, s.lat])
  map.fitBounds(bounds, { padding: 48, maxZoom: 6, duration: 0 })
}

export function CapacityMap({
  sites,
  selectedSlug,
  onSelect,
}: {
  sites: CapacityMapSite[]
  dark?: boolean
  selectedSlug: string | null
  onSelect: (slug: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<Marker[]>([])
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false
    let dashTimer: number | undefined

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: darkOpsStyle(),
      center: [18, 67],
      zoom: 3.4,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right")

    const kickResize = () => {
      try { map.resize() } catch { /* removed */ }
    }
    map.once("load", kickResize)
    const resizeTimers = [50, 200, 500].map(ms => window.setTimeout(kickResize, ms))

    map.on("load", () => {
      if (cancelled) return
      kickResize()
      dashTimer = addOpsDecorLayers(map)

      const orbitLabels: { lng: number; lat: number; label: string; color: string }[] = [
        { lng: 5, lat: 78, label: "LEO", color: "#4FA8FF" },
        { lng: 12, lat: 74, label: "MEO", color: "#6EE7F9" },
        { lng: 20, lat: 57, label: "GEO", color: "#D97706" },
      ]
      for (const o of orbitLabels) {
        const lab = document.createElement("div")
        lab.textContent = o.label
        lab.style.cssText = `
          font-family: ui-monospace, monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; color: ${o.color};
          text-shadow: 0 0 6px #070B12, 0 1px 2px #070B12;
          pointer-events: none; user-select: none;
        `
        new maplibregl.Marker({ element: lab, anchor: "center" })
          .setLngLat([o.lng, o.lat])
          .addTo(map)
      }
    })

    return () => {
      cancelled = true
      resizeTimers.forEach(id => window.clearTimeout(id))
      if (dashTimer) window.clearInterval(dashTimer)
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Fit when the site set changes (filters)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const run = () => {
      fitSites(map, sites)
      try { map.resize() } catch { /* */ }
    }
    if (map.isStyleLoaded()) run()
    else map.once("load", run)
  }, [sites])

  // Sync capacity pins with selection highlight
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const paint = () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      for (const site of sites) {
        const color = CAPACITY_STATUS_COLOR[site.status]
        const selected = site.slug === selectedSlug
        const el = document.createElement("button")
        el.type = "button"
        el.setAttribute(
          "aria-label",
          `${site.name}: ${capacityStatusLabel(site.status)}`,
        )
        el.style.cssText = `
          width: ${selected ? 18 : 12}px; height: ${selected ? 18 : 12}px;
          border-radius: 50%; background: ${color};
          border: 2px solid ${selected ? "#F7FAFC" : "#070B12"};
          box-shadow: 0 0 0 ${selected ? 3 : 2}px ${color}88, 0 0 ${selected ? 16 : 10}px ${color}55;
          cursor: pointer; padding: 0;
          transition: width 0.15s, height 0.15s;
        `
        el.addEventListener("click", e => {
          e.stopPropagation()
          onSelectRef.current(site.slug)
        })
        markersRef.current.push(
          new maplibregl.Marker({ element: el }).setLngLat([site.lng, site.lat]).addTo(map),
        )
      }
    }

    if (map.isStyleLoaded()) paint()
    else map.once("load", paint)
  }, [sites, selectedSlug])

  return (
    <div style={{
      position: "relative",
      height: "100%",
      width: "100%",
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      minHeight: 420,
    }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 420 }} />

      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 2,
        fontFamily: "var(--font-data)", fontSize: 10, letterSpacing: "0.08em",
        color: "var(--accent-amber)",
        backgroundColor: "rgba(7,11,18,0.82)",
        border: "1px solid rgba(245,184,74,0.28)",
        borderRadius: 4, padding: "5px 10px",
        backdropFilter: "blur(8px)",
        pointerEvents: "none",
      }}>
        Model {modelChip()} · illustrative
      </div>

      <div style={{
        position: "absolute", bottom: 28, left: 12, zIndex: 2,
        display: "flex", gap: 10, flexWrap: "wrap",
        fontFamily: "var(--font-data)", fontSize: 9, letterSpacing: "0.06em",
        color: "var(--text-muted)",
        backgroundColor: "rgba(7,11,18,0.75)",
        borderRadius: 4, padding: "6px 10px",
        pointerEvents: "none",
      }}>
        <span><span style={{ color: CAPACITY_STATUS_COLOR.ok }}>●</span> OK</span>
        <span><span style={{ color: CAPACITY_STATUS_COLOR.degraded }}>●</span> Degraded</span>
        <span><span style={{ color: CAPACITY_STATUS_COLOR.down }}>●</span> Down</span>
      </div>

      <style>{OPS_MAP_CSS}</style>
    </div>
  )
}

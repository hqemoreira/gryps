"use client"

import { useEffect, useRef, useState } from "react"
import * as maplibregl from "maplibre-gl"
import type { Map, Marker } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { EXAMPLE_SIGNATURES } from "@/lib/example-signatures"
import { MODEL_VERSION } from "@/lib/signature-meta"

const HERO_SITE = { lat: 68.2, lng: 27.4, label: "Lapland · hero site" }

/** Free dark basemap (no API key) — OpenFreeMap dark, MapLibre-native. */
const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark"

function modelChip(): string {
  const m = MODEL_VERSION.match(/v[\d.]+/)
  return m ? m[0] : "v0.3"
}

function parallelLine(lat: number, fromLng: number, toLng: number, step = 2): GeoJSON.Feature {
  const coords: [number, number][] = []
  for (let lng = fromLng; lng <= toLng; lng += step) coords.push([lng, lat])
  return {
    type: "Feature",
    properties: { lat },
    geometry: { type: "LineString", coordinates: coords },
  }
}

function arcticGlowPolygon(): GeoJSON.Feature {
  // Rough polygon covering Nordic/Arctic view above ~66.5°N
  const coords: [number, number][] = []
  for (let lng = -30; lng <= 40; lng += 2) coords.push([lng, 66.5])
  for (let lng = 40; lng >= -30; lng -= 2) coords.push([lng, 82])
  coords.push([-30, 66.5])
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  }
}

/** Decorative orbital-class arcs sweeping the Arctic FOV */
function orbitalArcs(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { class: "LEO", color: "#4FA8FF" },
        geometry: {
          type: "LineString",
          coordinates: [
            [-25, 62], [-10, 72], [5, 78], [20, 76], [35, 70],
          ],
        },
      },
      {
        type: "Feature",
        properties: { class: "MEO", color: "#6EE7F9" },
        geometry: {
          type: "LineString",
          coordinates: [
            [-28, 58], [-5, 68], [12, 74], [30, 72],
          ],
        },
      },
      {
        type: "Feature",
        properties: { class: "GEO", color: "#D97706" },
        geometry: {
          type: "LineString",
          coordinates: [
            [-20, 55], [0, 58], [20, 57], [38, 54],
          ],
        },
      },
    ],
  }
}

function gradePinColor(grade: string): string {
  if (grade === "A" || grade === "B") return "#2ED47A"
  if (grade === "C") return "#D97706"
  return "#EF4444" // D / F
}

export function OpsConsoleMap({ lang = "en" }: { lang?: "en" | "fi" }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<Marker[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false
    let dashTimer: number | undefined

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: [18, 67],
      zoom: 3.2,
      pitch: 0,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right")

    map.on("error", () => {
      if (!cancelled) setFailed(true)
    })

    map.on("load", () => {
      if (cancelled) return

      map.addSource("arctic-glow", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [arcticGlowPolygon()] },
      })
      map.addLayer({
        id: "arctic-glow-fill",
        type: "fill",
        source: "arctic-glow",
        paint: {
          "fill-color": "#6EE7F9",
          "fill-opacity": 0.06,
        },
      })

      map.addSource("graticule", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            parallelLine(60, -30, 40),
            parallelLine(70, -30, 40),
            parallelLine(66.5, -30, 40),
          ],
        },
      })
      map.addLayer({
        id: "graticule-lines",
        type: "line",
        source: "graticule",
        paint: {
          "line-color": "#4FA8FF",
          "line-opacity": 0.35,
          "line-width": 1,
          "line-dasharray": [2, 2],
        },
      })

      map.addSource("orbits", { type: "geojson", data: orbitalArcs() })
      map.addLayer({
        id: "orbit-arcs",
        type: "line",
        source: "orbits",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 1.5,
          "line-opacity": 0.75,
          "line-dasharray": [0, 4, 3],
        },
      })

      // Animate dash offset for "live" pass feel
      const dashSeq = [
        [0, 4, 3],
        [1, 4, 2],
        [2, 4, 1],
        [3, 4, 0],
        [0, 1, 3, 4],
        [0, 2, 3, 3],
        [0, 3, 3, 2],
        [0, 4, 3, 1],
      ]
      let step = 0
      dashTimer = window.setInterval(() => {
        step = (step + 1) % dashSeq.length
        if (map.getLayer("orbit-arcs")) {
          map.setPaintProperty("orbit-arcs", "line-dasharray", dashSeq[step])
        }
      }, 80)

      // Example site pins
      for (const ex of EXAMPLE_SIGNATURES) {
        const lat = ex.input.lat
        const lng = ex.input.lng
        if (lat == null || lng == null) continue
        const grade = ex.result.resilience_signature.grade
        const score = ex.result.resilience_signature.score
        const color = gradePinColor(grade)
        const topRisk = ex.result.risk_factors[0]?.label ?? "—"
        const title = lang === "fi" ? ex.titleFi : ex.title

        const el = document.createElement("button")
        el.type = "button"
        el.setAttribute("aria-label", `${title}: score ${score}, grade ${grade}`)
        el.style.cssText = `
          width: 14px; height: 14px; border-radius: 50%;
          background: ${color}; border: 2px solid #070B12;
          box-shadow: 0 0 0 2px ${color}88, 0 0 12px ${color}66;
          cursor: pointer; padding: 0;
        `

        const popup = new maplibregl.Popup({
          offset: 16,
          closeButton: true,
          maxWidth: "280px",
          className: "gryps-ops-popup",
        }).setHTML(`
          <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 4px 2px;">
            <div style="font-size: 10px; letter-spacing: 0.08em; color: #64748B; margin-bottom: 4px;">RESILIENCE SIGNATURE</div>
            <div style="font-size: 13px; font-weight: 700; color: #F7FAFC; margin-bottom: 8px;">${title}</div>
            <div style="display:flex; align-items:baseline; gap:8px; margin-bottom: 8px;">
              <span style="font-family: ui-monospace, monospace; font-size: 28px; font-weight: 800; color: ${color};">${score}</span>
              <span style="font-family: ui-monospace, monospace; font-size: 16px; font-weight: 800; color: ${color};">${grade}</span>
            </div>
            <div style="font-size: 11px; color: #D97706;"><strong>Top risk:</strong> ${topRisk}</div>
          </div>
        `)

        el.addEventListener("click", e => {
          e.stopPropagation()
          popup.setLngLat([lng, lat]).addTo(map)
        })
        el.addEventListener("mouseenter", () => {
          popup.setLngLat([lng, lat]).addTo(map)
        })

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map)
        markersRef.current.push(marker)
      }

      // Pulsing hero site (synced with Signature card at 68.2°N 27.4°E)
      const pulse = document.createElement("div")
      pulse.setAttribute("aria-label", HERO_SITE.label)
      pulse.innerHTML = `
        <span class="gryps-ops-pulse-ring"></span>
        <span class="gryps-ops-pulse-core"></span>
      `
      pulse.style.cssText = `
        width: 28px; height: 28px; position: relative;
        display: flex; align-items: center; justify-content: center;
      `
      const heroPopup = new maplibregl.Popup({ offset: 18, closeButton: true, maxWidth: "260px" }).setHTML(`
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 4px 2px;">
          <div style="font-size: 10px; letter-spacing: 0.08em; color: #64748B; margin-bottom: 4px;">HERO SITE</div>
          <div style="font-size: 13px; font-weight: 700; color: #F7FAFC; margin-bottom: 6px;">68.2°N · 27.4°E · Lapland</div>
          <div style="font-family: ui-monospace, monospace; font-size: 22px; font-weight: 800; color: #D97706;">40 · D</div>
          <div style="font-size: 11px; color: #D97706; margin-top: 6px;">Top risk: No backup path</div>
        </div>
      `)
      pulse.addEventListener("click", () => {
        heroPopup.setLngLat([HERO_SITE.lng, HERO_SITE.lat]).addTo(map)
      })
      const heroMarker = new maplibregl.Marker({ element: pulse })
        .setLngLat([HERO_SITE.lng, HERO_SITE.lat])
        .addTo(map)
      markersRef.current.push(heroMarker)

      // Orbit class labels as HTML markers (avoids style glyph dependency)
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
        const m = new maplibregl.Marker({ element: lab, anchor: "center" })
          .setLngLat([o.lng, o.lat])
          .addTo(map)
        markersRef.current.push(m)
      }
    })

    return () => {
      cancelled = true
      if (dashTimer) window.clearInterval(dashTimer)
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [lang])

  return (
    <div style={{
      position: "relative",
      borderRadius: 10,
      overflow: "hidden",
      border: "1px solid var(--border)",
      backgroundColor: "var(--surface)",
      height: 420,
    }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

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
        <span><span style={{ color: "#2ED47A" }}>●</span> Grade A/B</span>
        <span><span style={{ color: "#EF4444" }}>●</span> Grade D/F</span>
        <span style={{ color: "#4FA8FF" }}>◎ Hero 68.2°N</span>
      </div>

      {failed && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--surface)", color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: 13,
        }}>
          Map tiles unavailable — reload to retry.
        </div>
      )}

      <style>{`
        .gryps-ops-pulse-core {
          width: 10px; height: 10px; border-radius: 50%;
          background: #4FA8FF; box-shadow: 0 0 10px #4FA8FF;
          position: relative; z-index: 1;
        }
        .gryps-ops-pulse-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid #4FA8FF;
          animation: gryps-ops-pulse 2s ease-out infinite;
        }
        @keyframes gryps-ops-pulse {
          0% { transform: scale(0.4); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .gryps-ops-popup .maplibregl-popup-content {
          background: #0B1220;
          border: 1px solid #1E293B;
          border-radius: 8px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.45);
          padding: 12px 14px;
          color: #F7FAFC;
        }
        .gryps-ops-popup .maplibregl-popup-tip {
          border-top-color: #0B1220;
        }
        .gryps-ops-popup .maplibregl-popup-close-button {
          color: #64748B; font-size: 18px; padding: 4px 8px;
        }
        .maplibregl-ctrl-attrib {
          font-size: 9px; background: rgba(7,11,18,0.7) !important; color: #64748B !important;
        }
      `}</style>
    </div>
  )
}

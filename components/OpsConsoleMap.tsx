"use client"

import { useEffect, useRef } from "react"
import * as maplibregl from "maplibre-gl"
import type { Map, Marker } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { EXAMPLE_SIGNATURES } from "@/lib/example-signatures"
import { addOpsDecorLayers, darkOpsStyle, modelBasemapChip, OPS_MAP_CSS } from "@/lib/ops-map-style"

const HERO_SITE = { lat: 68.2, lng: 27.4, label: "Lapland · hero site" }

function gradePinColor(grade: string): string {
  if (grade === "A" || grade === "B") return "#2ED47A"
  if (grade === "C") return "#D97706"
  return "#EF4444"
}

export function OpsConsoleMap({ lang = "en" }: { lang?: "en" | "fi" }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false
    let dashTimer: number | undefined

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: darkOpsStyle(),
      center: [18, 67],
      zoom: 3.4,
      pitch: 0,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right")

    const kickResize = () => {
      try { map.resize() } catch { /* removed */ }
    }
    map.once("load", kickResize)
    const resizeTimers = [50, 200, 500].map(ms => window.setTimeout(kickResize, ms))

    map.on("error", e => {
      console.error("OpsConsoleMap error:", e.error)
    })

    map.on("load", () => {
      if (cancelled) return
      kickResize()
      dashTimer = addOpsDecorLayers(map)

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

        markersRef.current.push(
          new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map),
        )
      }

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
      markersRef.current.push(
        new maplibregl.Marker({ element: pulse }).setLngLat([HERO_SITE.lng, HERO_SITE.lat]).addTo(map),
      )

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
        markersRef.current.push(
          new maplibregl.Marker({ element: lab, anchor: "center" }).setLngLat([o.lng, o.lat]).addTo(map),
        )
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
        {modelBasemapChip()}
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

      <style>{`
        ${OPS_MAP_CSS}
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
      `}</style>
    </div>
  )
}

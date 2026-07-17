"use client"
import { useEffect } from "react"

export function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext("2d")!

    let frame = 0
    let raf: number

    // Find or create the favicon link element
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon'][type='image/png']")
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      link.type = "image/png"
      document.head.appendChild(link)
    }

    function draw() {
      const t = frame / 60 // time in seconds at ~60fps
      ctx.clearRect(0, 0, 32, 32)

      // Background
      ctx.fillStyle = "#070B12"
      roundRect(ctx, 0, 0, 32, 32, 6)
      ctx.fill()

      const cx = 16
      const cy = 17

      // ── Orbital arcs — sequential broadcast, inner to outer ───────
      // A signal sweeps outward every 2.4s: LEO fires first, then MEO, then GEO
      const cycle = 2.4
      const phase = (t % cycle) / cycle // 0..1

      // Smooth triangular envelope peaking at `peak` (0..1), base level `base`
      function envelope(peak: number, base: number, width = 0.28) {
        const d = Math.abs(phase - peak)
        const wrapped = Math.min(d, 1 - d)
        const x = Math.max(0, 1 - wrapped / width)
        return base + (1 - base) * x
      }

      const leoPulse = envelope(0.0, 0.55)
      const meoPulse = envelope(0.22, 0.4)
      const geoPulse = envelope(0.44, 0.25)

      // GEO — outermost
      ctx.beginPath()
      ctx.arc(cx, cy, 12, Math.PI, 0)
      ctx.strokeStyle = `rgba(79,168,255,${geoPulse})`
      ctx.lineWidth = 1.2
      ctx.lineCap = "round"
      ctx.stroke()

      // MEO — mid
      ctx.beginPath()
      ctx.arc(cx, cy, 8.5, Math.PI, 0)
      ctx.strokeStyle = `rgba(110,231,249,${meoPulse})`
      ctx.lineWidth = 1.3
      ctx.stroke()

      // LEO — inner
      ctx.beginPath()
      ctx.arc(cx, cy, 5, Math.PI, 0)
      ctx.strokeStyle = `rgba(79,168,255,${leoPulse})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // ── North arrow ──────────────────────────────────────────────
      ctx.strokeStyle = "#6EE7F9"
      ctx.lineWidth = 1.4
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Stem
      ctx.beginPath()
      ctx.moveTo(cx, cy + 1)
      ctx.lineTo(cx, cy - 6)
      ctx.stroke()

      // Arrow head
      ctx.beginPath()
      ctx.moveTo(cx - 2.5, cy - 3.5)
      ctx.lineTo(cx, cy - 7)
      ctx.lineTo(cx + 2.5, cy - 3.5)
      ctx.stroke()

      // ── Origin pulse ─────────────────────────────────────────────
      const originPulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.5))

      // Outer glow ring
      const ogrd = ctx.createRadialGradient(cx, cy + 1.5, 0, cx, cy + 1.5, 5)
      ogrd.addColorStop(0, `rgba(79,168,255,${originPulse * 0.5})`)
      ogrd.addColorStop(1, "rgba(79,168,255,0)")
      ctx.beginPath()
      ctx.arc(cx, cy + 1.5, 5, 0, Math.PI * 2)
      ctx.fillStyle = ogrd
      ctx.fill()

      // Core dot
      ctx.beginPath()
      ctx.arc(cx, cy + 1.5, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(79,168,255,${0.7 + 0.3 * originPulse})`
      ctx.fill()

      link!.href = canvas.toDataURL("image/png")
      frame++
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return null
}

// Polyfill for rounded rect
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

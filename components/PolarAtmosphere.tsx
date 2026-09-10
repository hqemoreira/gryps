"use client"
import { useEffect, useId, useState } from "react"

type OrbitId = "leo" | "meo" | "geo"

/** Polar-projection diagram — latitude rings + orbital ellipses + animated sats. */
export function PolarAtmosphere({
  latLabel = "68.2°N 27.4°E",
  ringLabel = "70°N",
  className,
  /** Halo: quieter rings only — for behind-card atmosphere (no labels / wide ellipses). */
  variant = "full",
  /** Slow dash drift + moving satellites (disabled for reduced-motion via CSS/JS). */
  animate = false,
  /** Clickable orbit chips that highlight paths (methodology / interactive demos). */
  interactive = false,
}: {
  latLabel?: string
  ringLabel?: string
  className?: string
  variant?: "full" | "halo"
  animate?: boolean
  interactive?: boolean
}) {
  const halo = variant === "halo"
  const uid = useId().replace(/:/g, "")
  const strokeId = `grypsAuroraStroke-${uid}`
  const glowId = `grypsMarkerGlow-${uid}`
  const [tick, setTick] = useState(0)
  const [activeOrbit, setActiveOrbit] = useState<OrbitId | "all">("all")
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    if (!animate || reducedMotion || halo) return
    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      setTick((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [animate, reducedMotion, halo])

  const cx = 220
  const cy = 220

  // Parametric points on rotated ellipses (orbital passes)
  const leo = ellipsePoint(cx, cy, 205, 95, -22, tick * 0.55)
  const meo = ellipsePoint(cx, cy, 205, 95, 34, tick * 0.32 + 1.2)
  const geo = ellipsePoint(cx, cy, 210, 48, 8, tick * 0.12 + 0.35)
  // Inner latitude ring as LEO-ish handoff path
  const leoInner = circlePoint(cx, cy, 115, tick * 0.85 + 0.4)

  const dim = (id: OrbitId) =>
    interactive && activeOrbit !== "all" && activeOrbit !== id ? 0.22 : 1

  return (
    <div className={className} aria-hidden={interactive ? undefined : true}>
      {interactive && !halo && (
        <div className="gryps-polar-orbit-controls" role="group" aria-label="Orbit highlight">
          {([
            ["all", "All"],
            ["leo", "LEO"],
            ["meo", "MEO"],
            ["geo", "GEO"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={activeOrbit === id ? "is-active" : undefined}
              onClick={() => setActiveOrbit(id)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <svg viewBox="0 0 440 440" width="100%" height="100%" fill="none" role={interactive ? "img" : undefined} aria-label={interactive ? "Modeled polar geometry with LEO, MEO, and GEO orbital paths" : undefined}>
        <defs>
          <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--aurora-1)" }} />
            <stop offset="100%" style={{ stopColor: "var(--aurora-2)" }} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "var(--aurora-1)", stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: "var(--aurora-1)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        <circle cx="220" cy="220" r="60" stroke="var(--border)" strokeWidth="1" />
        <circle cx="220" cy="220" r="115" stroke="var(--border)" strokeWidth="1" />
        <circle cx="220" cy="220" r="170" stroke="var(--border)" strokeWidth="1" />
        <circle
          cx="220"
          cy="220"
          r="115"
          stroke={`url(#${strokeId})`}
          strokeWidth="1.4"
          strokeDasharray="3 6"
          opacity={dim("leo")}
          className={animate && !halo ? "gryps-polar-orbit-dash" : undefined}
        />

        {!halo && (
          <>
            <ellipse
              cx="220"
              cy="220"
              rx="205"
              ry="95"
              stroke={`url(#${strokeId})`}
              strokeWidth={activeOrbit === "leo" || activeOrbit === "all" ? 1.4 : 1.1}
              strokeDasharray="1 7"
              transform="rotate(-22 220 220)"
              opacity={dim("leo")}
              className={animate ? "gryps-polar-orbit-dash" : undefined}
            />
            <ellipse
              cx="220"
              cy="220"
              rx="205"
              ry="95"
              stroke="var(--accent-cyan)"
              strokeWidth={activeOrbit === "meo" || activeOrbit === "all" ? 1.4 : 1}
              strokeDasharray="1 7"
              transform="rotate(34 220 220)"
              opacity={dim("meo") * 0.85}
              className={animate ? "gryps-polar-orbit-dash gryps-polar-orbit-dash-slow" : undefined}
            />
            {/* GEO arc — equatorial-leaning, flatter */}
            <ellipse
              cx="220"
              cy="220"
              rx="210"
              ry="48"
              stroke="var(--accent-amber)"
              strokeWidth={activeOrbit === "geo" || activeOrbit === "all" ? 1.5 : 1}
              strokeDasharray="2 8"
              transform="rotate(8 220 220)"
              opacity={dim("geo") * 0.75}
              className={animate ? "gryps-polar-orbit-dash-slow" : undefined}
            />
          </>
        )}

        {halo && (
          <ellipse
            cx="220"
            cy="220"
            rx="190"
            ry="88"
            stroke={`url(#${strokeId})`}
            strokeWidth="1"
            strokeDasharray="1 8"
            transform="rotate(-22 220 220)"
            opacity="0.55"
          />
        )}

        <line x1="220" y1="50" x2="220" y2="390" stroke="var(--border)" strokeWidth="1" />
        <line x1="50" y1="220" x2="390" y2="220" stroke="var(--border)" strokeWidth="1" />

        {/* Sample site */}
        <circle cx="164" cy="152" r="16" fill={`url(#${glowId})`} className={animate && !halo ? "gryps-polar-site-pulse" : undefined} />
        <circle cx="164" cy="152" r="3.5" fill="var(--aurora-1)" />

        {/* Moving satellites */}
        {!halo && animate && !reducedMotion && (
          <>
            <g opacity={dim("leo")}>
              <circle cx={leo.x} cy={leo.y} r="4.5" fill="var(--accent-blue)" />
              <circle cx={leoInner.x} cy={leoInner.y} r="3.2" fill="var(--accent-blue)" opacity="0.85" />
            </g>
            <g opacity={dim("meo")}>
              <circle cx={meo.x} cy={meo.y} r="4" fill="var(--accent-cyan)" />
            </g>
            <g opacity={dim("geo")}>
              <circle cx={geo.x} cy={geo.y} r="3.5" fill="var(--accent-amber)" />
            </g>
          </>
        )}

        {!halo && (
          <>
            <text x="236" y="118" fill="var(--text-dim)" fontFamily="var(--font-data)" fontSize="11">
              {latLabel}
            </text>
            <text x="36" y="214" fill="var(--text-dim)" fontFamily="var(--font-data)" fontSize="11">
              {ringLabel}
            </text>
            <text x="318" y="78" fill="var(--accent-blue)" fontFamily="var(--font-data)" fontSize="10" opacity={dim("leo")}>
              LEO
            </text>
            <text x="48" y="92" fill="var(--accent-cyan)" fontFamily="var(--font-data)" fontSize="10" opacity={dim("meo")}>
              MEO
            </text>
            <text x="340" y="248" fill="var(--accent-amber)" fontFamily="var(--font-data)" fontSize="10" opacity={dim("geo")}>
              GEO
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

function circlePoint(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function ellipsePoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotDeg: number,
  angle: number,
) {
  const rot = (rotDeg * Math.PI) / 180
  const cosR = Math.cos(rot)
  const sinR = Math.sin(rot)
  const x = rx * Math.cos(angle)
  const y = ry * Math.sin(angle)
  return {
    x: cx + x * cosR - y * sinR,
    y: cy + x * sinR + y * cosR,
  }
}

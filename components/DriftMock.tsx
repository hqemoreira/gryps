"use client"
import { useState, useEffect, useRef } from "react"
import { Play, Pause } from "lucide-react"
import { gradeTextColor } from "@/lib/resilience-colors"

/** Illustrative T0→T1 drift — not live monitoring. */
export function DriftMock({ lang = "en" }: { lang?: "en" | "fi" }) {
  const t0 = { score: 78, grade: "B", at: "2026-03-01" }
  const t1 = { score: 71, grade: "B", at: "2026-09-01" }
  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const [t, setT] = useState(reducedMotion ? 1 : 0)
  const [playing, setPlaying] = useState(!reducedMotion)
  const playingRef = useRef(!reducedMotion)
  const tRef = useRef(reducedMotion ? 1 : 0)
  const rafRef = useRef(0)
  const loopTimer = useRef(0)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  useEffect(() => {
    tRef.current = t
  }, [t])

  useEffect(() => {
    if (typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    function runFrom(origin: number) {
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(loopTimer.current)
      const start = performance.now()
      const duration = 5000
      const tick = (now: number) => {
        if (!playingRef.current) return
        const p = Math.min(1, (now - start) / duration)
        const next = origin + (1 - origin) * (1 - Math.pow(1 - p, 3))
        setT(next)
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          loopTimer.current = window.setTimeout(() => {
            if (!playingRef.current) return
            setT(0)
            runFrom(0)
          }, 1200)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    if (playing) {
      runFrom(tRef.current >= 0.99 ? 0 : tRef.current)
    } else {
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(loopTimer.current)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(loopTimer.current)
    }
  }, [playing])

  const score = Math.round(t0.score + (t1.score - t0.score) * t)
  const grade = score >= 75 ? "B" : score >= 60 ? "C" : "D"
  const drop = t0.score - score
  const nearT1 = t >= 0.85

  function onScrub(value: number) {
    setPlaying(false)
    setT(value)
  }

  function togglePlay() {
    if (playing) {
      setPlaying(false)
    } else {
      if (t >= 0.99) setT(0)
      setPlaying(true)
    }
  }

  return (
    <div className="surface-card" style={{
      marginTop: 8, borderStyle: "dashed", borderColor: "rgba(79,168,255,0.35)",
      padding: "24px 28px",
    }}>
      <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-title)", color: "var(--text)", marginBottom: 8 }}>
        {lang === "fi"
          ? "Mining 78B · Signature-ajautuma (T0 → T1)"
          : "Mining 78B · Signature drift (T0 → T1)"}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-small)", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 20 }}>
        {lang === "fi"
          ? "Sama kohde, sama malli, kaksi aikaleimaa. Toista tai vedä aikajanaa."
          : "Same site, same model, two timestamps. Play or scrub the timeline."}
      </p>

      <div className="gryps-drift-panels" style={{ marginBottom: 20 }}>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
          padding: "16px 18px",
        }}>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
            T0 · {t0.at}
          </span>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 900, color: gradeTextColor(t0.grade), marginTop: 6 }}>
            {t0.score} · {t0.grade}
          </div>
        </div>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
          padding: "16px 18px",
        }}>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
            {t < 0.5 ? `LIVE · ${t0.at}` : `T1 · ${t1.at}`}
          </span>
          <div
            aria-live="polite"
            style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 900, color: gradeTextColor(grade), marginTop: 6 }}
          >
            {score} · {grade}
          </div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-amber)", marginTop: 8 }}>
            {drop > 0
              ? (lang === "fi" ? `Pisteet laskeneet ${drop} T0:sta.` : `Score down ${drop} from T0.`)
              : (lang === "fi" ? "T0-lähtötaso." : "At T0 baseline.")}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing
            ? (lang === "fi" ? "Tauko" : "Pause")
            : (lang === "fi" ? "Toista" : "Play")}
          style={{
            width: 44, height: 44, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border2)",
            background: "var(--surface2)",
            color: "var(--accent-cyan)",
            cursor: "pointer",
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 4 }}>
            {lang === "fi" ? "AIKAJANA T0 → T1" : "TIMELINE T0 → T1"}
          </label>
          <div className="gryps-drift-scrub">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(t * 100)}
              onChange={e => onScrub(Number(e.target.value) / 100)}
              aria-label={lang === "fi" ? "Signature-ajautuman aikajana" : "Signature drift timeline"}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>T0 · {t0.score} B</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>T1 · {t1.score} B</span>
          </div>
        </div>
      </div>

      {nearT1 && (
        <p style={{
          marginTop: 16, fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)",
          lineHeight: 1.6, padding: "12px 14px", borderRadius: "var(--radius)",
          backgroundColor: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)",
        }}>
          {lang === "fi"
            ? "Syy (havainnollistus): Iridium-ohitusgeometria heikkeni ~12 % Q3:ssa / kausivaihtelu."
            : "Reason (illustrative): Iridium pass geometry degraded ~12% in Q3 / seasonal window."}
        </p>
      )}
    </div>
  )
}

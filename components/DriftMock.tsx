"use client"
import { useState } from "react"
import { gradeTextColor } from "@/lib/resilience-colors"

/** Illustrative T0→T1 drift — not live monitoring. */
export function DriftMock({ lang = "en" }: { lang?: "en" | "fi" }) {
  const t0 = { score: 78, grade: "B", at: "2026-03-01" }
  const t1 = { score: 71, grade: "B", at: "2026-09-01" }
  const [t, setT] = useState(0) // 0 = T0, 1 = T1

  const score = Math.round(t0.score + (t1.score - t0.score) * t)
  const grade = score >= 75 ? "B" : score >= 60 ? "C" : "D"
  const drop = t0.score - score
  const nearT1 = t >= 0.85

  return (
    <div style={{
      marginTop: 28, backgroundColor: "var(--surface)", border: "1px dashed rgba(79,168,255,0.35)",
      borderRadius: 8, padding: "20px 24px",
    }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-amber)", letterSpacing: "0.12em", marginBottom: 8 }}>
        {lang === "fi" ? "HAVAINNOLLISTAVA DEMO — EI LIVE-SEURANTAA" : "ILLUSTRATIVE DEMO — NOT LIVE MONITORING"}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 8 }}>
        {lang === "fi"
          ? "Mining 78B · Signature-ajautuma (T0 → T1)"
          : "Mining 78B · Signature drift (T0 → T1)"}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 16 }}>
        {lang === "fi"
          ? "Sama kohde, sama malli, kaksi aikaleimaa. Vedä liukusäädintä — näin seuranta kertoisi driftistä."
          : "Same site, same model, two timestamps. Drag the timeline — this is how monitoring would surface drift."}
      </p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "baseline", marginBottom: 16 }}>
        <div>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>
            {t < 0.5 ? `T0 · ${t0.at}` : `T1 · ${t1.at}`}
          </span>
          <div
            aria-live="polite"
            style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 900, color: gradeTextColor(grade) }}
          >
            {score} · {grade}
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-amber)", maxWidth: 360 }}>
          {drop > 0
            ? (lang === "fi"
              ? `Pisteet laskeneet ${drop} T0:sta.`
              : `Score down ${drop} from T0.`)
            : (lang === "fi" ? "T0-lähtötaso." : "At T0 baseline.")}
        </p>
      </div>

      <label style={{ display: "block", fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 8 }}>
        {lang === "fi" ? "AIKAJANA T0 → T1" : "TIMELINE T0 → T1"}
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(t * 100)}
        onChange={e => setT(Number(e.target.value) / 100)}
        aria-label={lang === "fi" ? "Signature-ajautuman aikajana" : "Signature drift timeline"}
        style={{ width: "100%", accentColor: "#4FA8FF", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>T0 · {t0.at}</span>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>T1 · {t1.at}</span>
      </div>

      {nearT1 && (
        <p style={{
          marginTop: 14, fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)",
          lineHeight: 1.6, padding: "12px 14px", borderRadius: 6,
          backgroundColor: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)",
        }}>
          {lang === "fi"
            ? "Syy (havainnollistus): Iridium-ohitusgeometria heikkeni ~12 % Q3:ssa / kausivaihtelu — ei live-telemetriaa."
            : "Reason (illustrative): Iridium pass geometry degraded ~12% in Q3 / seasonal window — no live telemetry."}
        </p>
      )}
    </div>
  )
}

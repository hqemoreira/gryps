import { gradeTextColor } from "@/lib/resilience-colors"

/** Static T0 vs T1 mock — not live monitoring. */
export function DriftMock({ lang = "en" }: { lang?: "en" | "fi" }) {
  const t0 = { score: 78, grade: "B", at: "2026-03-01" }
  const t1 = { score: 71, grade: "B", at: "2026-09-01" }
  const drop = t0.score - t1.score
  return (
    <div style={{
      marginTop: 28, backgroundColor: "var(--surface)", border: "1px dashed rgba(79,168,255,0.35)",
      borderRadius: 8, padding: "20px 24px",
    }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-amber)", letterSpacing: "0.12em", marginBottom: 8 }}>
        {lang === "fi" ? "STAATTINEN DEMO — EI LIVE-SEURANTAA" : "STATIC DEMO — NOT LIVE MONITORING"}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 8 }}>
        {lang === "fi"
          ? "Mining 78B · Signature-ajautuma (T0 → T1)"
          : "Mining 78B · Signature drift (T0 → T1)"}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 16 }}>
        {lang === "fi"
          ? "Sama kohde, sama malli, kaksi aikaleimaa. Havainnollistaa miksi arviointi tulee versioida ennen tilauspohjaista seurantaa."
          : "Same site, same model, two timestamps. This is why every Signature is versioned before subscription monitoring exists."}
      </p>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "baseline" }}>
        <div>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>T0 · {t0.at}</span>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 900, color: gradeTextColor(t0.grade) }}>{t0.score} · {t0.grade}</div>
        </div>
        <span style={{ color: "var(--text-dim)" }}>→</span>
        <div>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>T1 · {t1.at}</span>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 900, color: gradeTextColor(t1.grade) }}>{t1.score} · {t1.grade}</div>
        </div>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-amber)", maxWidth: 360 }}>
          {lang === "fi"
            ? `Pisteet laskivat ${drop} (esim. tähtikuvion geometria / sääkausi). Ei live-telemetriaa.`
            : `Score dropped ${drop} (e.g. constellation geometry / season). No live telemetry.`}
        </p>
      </div>
    </div>
  )
}

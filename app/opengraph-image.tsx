import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "GRYPS Resilience Signature · Score 40 · Grade D"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #070B12 0%, #0B1220 55%, #111827 100%)",
          padding: "56px 64px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, background: "#2ED47A" }} />
            <span style={{ color: "#64748B", fontSize: 22, letterSpacing: 4 }}>GRYPS · MODEL v0.3</span>
          </div>
          <span style={{ color: "#D97706", fontSize: 18, letterSpacing: 2 }}>RESEARCH PROTOTYPE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <span style={{ color: "#D97706", fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>40</span>
            <span style={{ color: "#D97706", fontSize: 48, fontWeight: 800 }}>/100 · D</span>
          </div>
          <div style={{ color: "#F7FAFC", fontSize: 42, fontWeight: 700, maxWidth: 900, lineHeight: 1.2 }}>
            Know your score before the Arctic finds it for you.
          </div>
          <div style={{ color: "#64748B", fontSize: 24, maxWidth: 820, lineHeight: 1.4 }}>
            Resilience Signatures for Nordic, Arctic & Icelandic operations — satellite dependency scored in 60 seconds.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #1E293B",
            paddingTop: 24,
          }}
        >
          <span style={{ color: "#4FA8FF", fontSize: 22 }}>Top risk: No backup path · Iridium Certus · 90</span>
          <span style={{ color: "#64748B", fontSize: 20 }}>gryps.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  )
}

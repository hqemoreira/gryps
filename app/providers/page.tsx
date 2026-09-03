import type { Metadata } from "next"
import Link from "next/link"
import { DocShell } from "@/components/DocShell"
import { INDEXED_PROVIDERS, PROVIDER_INDEX_COUNT } from "@/lib/providers"

export const metadata: Metadata = {
  title: "Provider index — satellite operators at 70°N+",
  description:
    "Curated public-knowledge index of LEO, MEO, and GEO satellite operators GRYPS uses when ranking connectivity options for Nordic and Arctic sites. Not live coverage data. Non-commercial R&D prototype.",
  alternates: { canonical: "https://gryps.vercel.app/providers" },
}

const COVERAGE_LABEL: Record<string, string> = {
  full: "70°N+ claimed",
  improving: "70°N+ improving",
  limited: "70°N+ limited",
  planned: "Planned",
  unsuitable: "Unsuitable as polar primary",
}

export default function ProvidersPage() {
  return (
    <DocShell>
      <article style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px 0" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>GRYPS · PROVIDER INDEX · {PROVIDER_INDEX_COUNT} OPERATORS</p>
        <h1 style={{ fontFamily: "var(--font-ui)", fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: "16px 0 20px" }}>
          Operators referenced in ranking
        </h1>
        <p className="gryps-hero-sub" style={{ fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 32 }}>
          This is a curated list of publicly known satellite operators — not a live coverage map, SLA, or partnership. GRYPS has no commercial relationship with any provider listed. Coverage notes are physics and published orbit class, not measured pass data.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: 13 }}>
            <thead>
              <tr>
                {["Provider", "Orbit", "Class", "70°N+", "Note"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-dim)", fontFamily: "var(--font-data)", fontSize: 10, letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INDEXED_PROVIDERS.map(p => (
                <tr key={p.name}>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--border)", color: "var(--text)", fontWeight: 600 }}>
                    {p.name}
                    <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", fontWeight: 400 }}>{p.operator} · {p.status}</div>
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>{p.orbit}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>{p.class}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>{COVERAGE_LABEL[p.coverage70N]}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", lineHeight: 1.5 }}>{p.coverageNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, marginTop: 28 }}>
          <Link href="/methodology" style={{ color: "var(--accent-blue)" }}>Scoring methodology</Link>
          {" · "}
          <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>Run the demo advisor</Link>
        </p>
      </article>
    </DocShell>
  )
}

import type { Metadata } from "next"
import type { CSSProperties } from "react"
import Link from "next/link"
import { DocShell } from "@/components/DocShell"
import { MODEL_VERSION, SCORING_ENGINE } from "@/lib/signature-meta"

export const metadata: Metadata = {
  title: "Methodology — How GRYPS scores connectivity resilience",
  description:
    "GRYPS Model v0.3 is a deterministic research prototype that scores satellite connectivity resilience for remote Nordic and Arctic operations. This page explains the 0–100 score, grade bands, component weights, hard caps, and what the advisor is not.",
  alternates: { canonical: "https://gryps.vercel.app/methodology" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is GRYPS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GRYPS is a non-commercial research prototype that scores satellite connectivity resilience for remote Nordic, Arctic, and Icelandic industrial operations. It produces a versioned Resilience Signature — an assessment at time T0, designed so later monitoring can show drift.",
      },
    },
    {
      "@type": "Question",
      name: "How is the 0–100 Resilience Score computed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Model v0.3 is deterministic. Score = redundancy (0–30) + latitude (0–20) + operational profile (0–15) + provider confidence (0–30), then hard caps. Grades: A ≥90, B 75–89, C 60–74, D 40–59, F <40. Terrain evidence from EU-DEM is shown separately and is not blended into the Signature score.",
      },
    },
    {
      "@type": "Question",
      name: "What is GRYPS not?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GRYPS is not a site survey, not live satellite coverage, not insurance, and not a substitute for professional connectivity engineering or legal advice. Outputs are illustrative research-prototype assessments.",
      },
    },
  ],
}

export default function MethodologyPage() {
  return (
    <DocShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 32px 0" }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>GRYPS · METHODOLOGY · {MODEL_VERSION}</p>
        <h1 style={{ fontFamily: "var(--font-ui)", fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: "16px 0 20px" }}>
          How a Resilience Signature is scored
        </h1>
        <p className="gryps-hero-sub" style={{ fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 32 }}>
          GRYPS is a non-commercial research prototype that scores satellite connectivity resilience for remote Nordic and Arctic operations (forestry, maritime, mining, autonomous fleets). A Signature is an assessment at a timestamp — not live monitoring.
        </p>

        <h2 style={h2}>What the advisor is not</h2>
        <ul style={ul}>
          <li>Not a substitute for an on-site RF / sky-view survey.</li>
          <li>Not live constellation telemetry, outage feeds, or a coverage SLA.</li>
          <li>Not insurance, certification, or legal advice (including NIS2/CER).</li>
          <li>Not for sale — no company, no revenue, research demonstration only.</li>
        </ul>

        <h2 style={h2}>Model v0.3 formula ({SCORING_ENGINE})</h2>
        <p style={p}>
          The Resilience Score is <strong>deterministic</strong> and reproducible for the same inputs. Optional language-model text may polish the recommendation paragraph only — it never changes score, grade, risks, or ranked providers.
        </p>
        <p style={p}>Score = sum of four components (then hard caps, clamped 0–100):</p>
        <ul style={ul}>
          <li>
            <strong>Redundancy (0–30)</strong> — 0 providers → 0; 1 → 8; 2 → 22 (+6 if independent orbital types / LEO broadband+narrowband); ≥3 → 28.
          </li>
          <li>
            <strong>Latitude (0–20)</strong> — ≤60°N → 20; ≤65 → 16; ≤70 → 12; &gt;70 → 8. Forestry sites below 300&nbsp;m elevation: −4 (canopy/terrain).
          </li>
          <li>
            <strong>Operational profile (0–15)</strong> — manual 15 · remote-operated 11 · mixed 8 · autonomous 5.
          </li>
          <li>
            <strong>Provider confidence (0–30)</strong> — average catalog confidence × 0.30. GEO providers above 70°N use a degraded confidence.
          </li>
        </ul>

        <h2 style={h2}>Grades</h2>
        <p style={p}>A = ≥90 · B = 75–89 · C = 60–74 · D = 40–59 · F = &lt;40 (spec band E maps to F in the UI).</p>

        <h2 style={h2}>Hard caps</h2>
        <ul style={ul}>
          <li>Safety-critical + autonomous + &lt;2 providers → score capped at <strong>50</strong>.</li>
          <li>Safety-critical + exactly 1 provider → capped at <strong>60</strong>.</li>
          <li>Latitude &gt;72°N with GEO-only providers → capped at <strong>45</strong>.</li>
        </ul>
        <p style={p}>Caps are enforced in the deterministic engine (and re-checked in code) so edge-case demos cannot bypass homepage claims.</p>

        <h2 style={h2}>Risk factors and ranked providers</h2>
        <p style={p}>
          Up to four risk factors are derived from redundancy, latitude/GEO, sector, autonomy, and score vs safety threshold. Backup providers not in the current setup are ranked by confidence minus latitude and orbital-overlap penalties.
        </p>

        <h2 style={h2}>Two scores, not one blend</h2>
        <p style={p}>
          The Resilience Score is the deterministic Signature above. Terrain penalty from EU-DEM via OpenTopoData is deterministic and displayed separately. Finnish Bittimittari speed/latency applies only to seeded municipality sites — not ad-hoc coordinates.
        </p>

        <h2 style={h2}>Versioning (monitoring later)</h2>
        <p style={p}>
          Every Signature carries <code>issuedAt</code>, <code>modelVersion</code> ({MODEL_VERSION}), and <code>inputHash</code>. Monitoring is the same engine at T1, T2 — not a second product. Live drift alerting is not built yet; the homepage drift slider is illustrative only.
        </p>

        <p style={{ ...p, marginTop: 40 }}>
          <Link href="/providers" style={{ color: "var(--accent-blue)" }}>Provider index</Link>
          {" · "}
          <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>Run the demo advisor</Link>
        </p>
      </article>
    </DocShell>
  )
}

const h2: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "28px 0 10px",
}
const p: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 12,
}
const ul: CSSProperties = {
  fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, paddingLeft: 20, marginBottom: 12,
}

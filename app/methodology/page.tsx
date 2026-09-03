import type { Metadata } from "next"
import type { CSSProperties } from "react"
import Link from "next/link"
import { DocShell } from "@/components/DocShell"
import { MODEL_VERSION, SCORING_ENGINE } from "@/lib/signature-meta"

export const metadata: Metadata = {
  title: "Methodology — How GRYPS scores connectivity resilience",
  description:
    "GRYPS is a non-commercial research prototype that scores satellite connectivity resilience for remote Nordic and Arctic operations. This page explains the 0–100 score, grade bands, weights, hard rules, and what the advisor is not: not a site survey, not live coverage, not insurance.",
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
        text: "The illustrative engine weights provider diversity and orbital class, autonomy dependence, operation criticality, high-latitude coverage constraints, and documented redundancy. A hard rule caps safety-critical autonomous sites without documented redundancy at 50. Terrain evidence from EU-DEM is shown separately and is not blended into the AI score.",
      },
    },
    {
      "@type": "Question",
      name: "What is GRYPS not?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GRYPS is not a site survey, not live satellite coverage, not insurance, and not a substitute for professional connectivity engineering or legal advice. Outputs are illustrative unless labelled as deterministic real-data evidence.",
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

        <h2 style={h2}>Score (0–100) and grades</h2>
        <p style={p}>A = ≥85 resilient · B = 70–84 · C = 50–69 · D = 30–49 · F = &lt;30 critical failure.</p>
        <p style={p}>Illustrative engine weights (relative, not a proprietary formula dump):</p>
        <ul style={ul}>
          <li>Provider diversity and independent orbital class (~30%).</li>
          <li>Autonomy dependence on the link (~25%).</li>
          <li>Operation criticality (~20%).</li>
          <li>High-latitude / GEO elevation constraint (~15%).</li>
          <li>Documented failover / redundancy (~10%).</li>
        </ul>

        <h2 style={h2}>Hard rule</h2>
        <p style={p}>
          A safety-critical autonomous (or mixed) site with no documented redundancy <strong>cannot score above 50</strong>. This is enforced in code after the language model returns, so edge-case tests cannot bypass the homepage claim.
        </p>

        <h2 style={h2}>Two scores, not one blend</h2>
        <p style={p}>
          The Resilience Score is model-generated ({SCORING_ENGINE}, temperature 0.3) and non-deterministic. Terrain penalty from EU-DEM via OpenTopoData is deterministic and displayed separately. Finnish Bittimittari speed/latency applies only to seeded municipality sites — not ad-hoc coordinates.
        </p>

        <h2 style={h2}>Versioning (monitoring later)</h2>
        <p style={p}>
          Every Signature carries <code>issuedAt</code>, <code>modelVersion</code> ({MODEL_VERSION}), and <code>inputHash</code>. Monitoring is the same engine at T1, T2 — not a second product. Live drift alerting is not built yet.
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

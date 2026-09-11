"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { IA_MODES, labelFor, descFor } from "@/lib/ia-nav"
import { PROVIDER_INDEX_COUNT } from "@/lib/providers"
import type { Lang } from "@/lib/use-lang"

const EXAMPLE_CARDS = [
  {
    href: "/research/finnish-arctic-forestry-inari",
    placeEn: "INARI · FORESTRY",
    placeFi: "INARI · METSÄ",
    lat: "68.9°N",
    score: "—",
    grade: "B",
    noteEn: "Arctic forestry research assessment",
    noteFi: "Arktinen metsätalouden tutkimusarvio",
  },
  {
    href: "/research/norwegian-maritime-energy-hammerfest",
    placeEn: "HAMMERFEST · MARITIME",
    placeFi: "HAMMERFEST · MERI",
    lat: "70.7°N",
    score: "—",
    grade: "A",
    noteEn: "High-latitude maritime energy context",
    noteFi: "Korkean leveysasteen merellinen energia",
  },
  {
    href: "/research/arctic-mining-northern-sweden",
    placeEn: "KIRUNA · MINING",
    placeFi: "KIRUNA · KAIVOS",
    lat: "67.9°N",
    score: "—",
    grade: "B",
    noteEn: "Autonomous mining fleet research case",
    noteFi: "Autonomisen kaivoskaluston tutkimustapaus",
  },
] as const

const COPY = {
  en: {
    modelL: "HOW GRYPS WORKS",
    modelH: "One location. Multiple signals. One resilience view.",
    loc: "LOCATION",
    locB: "Where is the operation?",
    op: "OPERATION",
    opB: "What does it need?",
    conn: "CONNECTIVITY",
    connB: "What options exist?",
    sig: "RESILIENCE SIGNATURE",
    sigB: "A structured view of connectivity resilience.",
    modesL: "THREE WAYS TO USE GRYPS",
    exploreCta: "Explore",
    assessCta: "Generate Signature",
    researchCta: "Explore Research",
    datasetL: "CURRENT RESEARCH DATASET",
    sites: "assessed sites",
    providers: "providers",
    examplesL: "EXAMPLE RESILIENCE SIGNATURES",
    examplesSub: "What GRYPS produces — curated Research Library assessments.",
    view: "View assessment →",
    posture: "Research & Prototype posture →",
    intelligence: "How the intelligence is built →",
  },
  fi: {
    modelL: "MITEN GRYPS TOIMII",
    modelH: "Yksi sijainti. Useita signaaleja. Yksi resilienssinäkymä.",
    loc: "SIJAINTI",
    locB: "Missä toiminta on?",
    op: "TOIMINTA",
    opB: "Mitä se tarvitsee?",
    conn: "YHTEYS",
    connB: "Mitä vaihtoehtoja on?",
    sig: "RESILIENCE SIGNATURE",
    sigB: "Rakenteinen näkymä yhteyden resilienssiin.",
    modesL: "KOLME TAPAA KÄYTTÄÄ GRYPS:ÄÄ",
    exploreCta: "Tutki",
    assessCta: "Luo Signature",
    researchCta: "Tutki tutkimusta",
    datasetL: "NYKYINEN TUTKIMUSAINEISTO",
    sites: "arvioitua kohdetta",
    providers: "toimittajaa",
    examplesL: "ESIMERKKI RESILIENCE SIGNATUREJA",
    examplesSub: "Mitä GRYPS tuottaa — kuratoituja Research Library -arvioita.",
    view: "Katso arvio →",
    posture: "Tutkimus ja prototyyppi →",
    intelligence: "Miten äly on rakennettu →",
  },
} as const

export function HomeOrientation({
  lang,
  siteCount,
}: {
  lang: Lang
  siteCount: number | null
}) {
  const t = COPY[lang]
  const modeCtas = [t.exploreCta, t.assessCta, t.researchCta] as const
  const modeHrefs = ["/map", "/#advisor", "/methodology"] as const

  return (
    <>
      <section className="gryps-section gryps-section-pad gryps-no-print" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="gryps-content" style={{ maxWidth: 920 }}>
          <p className="label" style={{ marginBottom: 12 }}>{t.modelL}</p>
          <h2 style={{
            fontFamily: "var(--font-ui)", fontSize: 22, fontWeight: 700, color: "var(--text)",
            margin: "0 0 28px", letterSpacing: "-0.02em", maxWidth: 520,
          }}>
            {t.modelH}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 20 }}>
            {[
              { k: t.loc, b: t.locB },
              { k: t.op, b: t.opB },
              { k: t.conn, b: t.connB },
            ].map(x => (
              <div key={x.k}>
                <p className="gryps-type-label">{x.k}</p>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{x.b}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em", margin: "0 0 6px" }}>↓</p>
          <p className="gryps-type-label">{t.sig}</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text)", margin: 0, maxWidth: 420 }}>{t.sigB}</p>
        </div>
      </section>

      <section className="gryps-section gryps-section-pad gryps-no-print" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="gryps-content">
          <p className="label" style={{ marginBottom: 28 }}>{t.modesL}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {IA_MODES.map((mode, i) => (
              <div key={mode.id} style={{ padding: "4px 0" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 8px" }}>
                  {labelFor(mode, lang)}
                </p>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.55 }}>
                  {mode.items.slice(0, 3).map(it => labelFor(it, lang)).join(" · ")}
                </p>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-dim)", margin: "0 0 14px", lineHeight: 1.45 }}>
                  {descFor(mode.items[0], lang)}
                </p>
                <Link href={modeHrefs[i]} style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--accent-blue)", textDecoration: "none" }}>
                  {modeCtas[i]} <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gryps-section gryps-section-pad gryps-no-print" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="gryps-content">
          <p className="label" style={{ marginBottom: 14 }}>{t.datasetL}</p>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "12px 28px",
            fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.04em",
          }}>
            <span>{siteCount ?? "—"} {t.sites}</span>
            <span>{PROVIDER_INDEX_COUNT} {t.providers}</span>
            <span>LEO · MEO · GEO</span>
            <span>70°N+</span>
          </div>
        </div>
      </section>

      <section id="examples" className="gryps-section gryps-section-pad gryps-no-print" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="gryps-content">
          <p className="label" style={{ marginBottom: 10 }}>{t.examplesL}</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", marginBottom: 24, maxWidth: 480 }}>{t.examplesSub}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {EXAMPLE_CARDS.map(card => (
              <Link
                key={card.href}
                href={card.href}
                style={{
                  display: "block", padding: "18px 16px", textDecoration: "none",
                  border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)",
                }}
              >
                <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                  {lang === "fi" ? card.placeFi : card.placeEn}
                </p>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", margin: "0 0 12px" }}>{card.lat}</p>
                <p style={{ fontFamily: "var(--font-data)", fontSize: 28, fontWeight: 800, color: "var(--accent-blue)", margin: "0 0 4px", lineHeight: 1 }}>
                  {card.grade}
                </p>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.45 }}>
                  {lang === "fi" ? card.noteFi : card.noteEn}
                </p>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--accent-blue)" }}>{t.view}</span>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 16 }}>
            <Link href="/methodology" style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--accent-blue)", textDecoration: "none" }}>
              {t.intelligence}
            </Link>
            <Link href="/research-prototype" style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--accent-blue)", textDecoration: "none" }}>
              {t.posture}
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}

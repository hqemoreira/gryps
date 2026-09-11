"use client"
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Download, Trash2, GitCompare, FileText } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { GrypsPrintBrand } from "@/components/GrypsMark"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { useLang } from "@/lib/use-lang"
import { gradeColor, gradeTextColor } from "@/lib/resilience-colors"
import {
  buildComparisonRows,
  deleteSavedAssessment,
  downloadTextFile,
  exportAssessmentMarkdown,
  getSavedAssessment,
  gradeOf,
  listSavedAssessments,
  recommendedProvider,
  scoreOf,
  slugifyTitle,
  type SavedResearchAssessment,
} from "@/lib/research-workspace"
import { MODEL_VERSION } from "@/lib/model-constants"

const COPY = {
  en: {
    eyebrow: "GRYPS · RESEARCH WORKSPACE",
    title: "Research Workspace",
    lead:
      "Saved research assessments for analytical modelling — coordinates, scenario, inputs, findings, provider comparison, recommendation, and evidence. Not a customer account or CRM.",
    disclosure:
      "Local browser storage only · Non-commercial · No quotations or sales funnel. Clear site data removes saved assessments.",
    empty: "No saved assessments yet. Generate a Resilience Signature, then Save to Research Workspace.",
    emptyCta: "Generate Resilience Signature",
    saved: "Saved assessments",
    compare: "Compare",
    compareTitle: "Compare assessments",
    compareHint: "Select two assessments — e.g. Northern Finland vs Lapland, Forestry vs Mining, or High uptime vs Low latency priorities.",
    export: "Export markdown",
    exportPrint: "Print / PDF",
    delete: "Remove",
    open: "Open",
    back: "← All assessments",
    pickA: "Assessment A",
    pickB: "Assessment B",
    runCompare: "Show comparison",
    clearCompare: "Clear",
    detail: "Assessment detail",
    coords: "Coordinates",
    scenario: "Scenario",
    assumptions: "Assumptions",
    inputs: "Inputs",
    analysis: "Analysis",
    providers: "Provider comparison",
    recommendation: "Recommendation",
    evidence: "Evidence",
    date: "Date",
    methodology: "Methodology version",
    depth: "Depth",
    notes: "Notes",
    executive: "Executive summary",
    findings: "Findings",
    limitations: "Limitations",
    reportTitle: "GRYPS Research Assessment",
    researchOnly: "Research prototype · Indicative analysis — not procurement advice.",
    navCta: "Generate Resilience Signature",
    none: "—",
    full: "Full",
    abbreviated: "Abbreviated",
  },
  fi: {
    eyebrow: "GRYPS · RESEARCH WORKSPACE",
    title: "Research Workspace",
    lead:
      "Tallennetut tutkimusarviot analyyttiseen mallinnukseen — koordinaatit, skenaario, syötteet, löydökset, toimittajavertailu, suositus ja näyttö. Ei asiakastiliä eikä CRM:ää.",
    disclosure:
      "Vain paikallinen selainmuisti · Ei-kaupallinen · Ei tarjouksia eikä myyntisuppiloa. Sivuston tietojen tyhjennys poistaa tallenteet.",
    empty: "Ei tallennettuja arvioita. Luo Resilience Signature ja tallenna Research Workspaceen.",
    emptyCta: "Luo Resilience Signature",
    saved: "Tallennetut arviot",
    compare: "Vertaa",
    compareTitle: "Vertaa arvioita",
    compareHint: "Valitse kaksi arviota — esim. Pohjois-Suomi vs Lappi, Metsä vs Kaivos, tai Korkea käytettävyys vs Matala latenssi.",
    export: "Vie markdown",
    exportPrint: "Tulosta / PDF",
    delete: "Poista",
    open: "Avaa",
    back: "← Kaikki arviot",
    pickA: "Arvio A",
    pickB: "Arvio B",
    runCompare: "Näytä vertailu",
    clearCompare: "Tyhjennä",
    detail: "Arvion tiedot",
    coords: "Koordinaatit",
    scenario: "Skenaario",
    assumptions: "Oletukset",
    inputs: "Syötteet",
    analysis: "Analyysi",
    providers: "Toimittajavertailu",
    recommendation: "Suositus",
    evidence: "Näyttö",
    date: "Päivä",
    methodology: "Menetelmäversio",
    depth: "Syvyys",
    notes: "Muistiinpanot",
    executive: "Yhteenveto",
    findings: "Löydökset",
    limitations: "Rajoitteet",
    reportTitle: "GRYPS Research Assessment",
    researchOnly: "Tutkimusprototyyppi · Suuntaa-antava analyysi — ei hankintaneuvontaa.",
    navCta: "Luo Resilience Signature",
    none: "—",
    full: "Täysi",
    abbreviated: "Lyhennetty",
  },
} as const

type UiCopy = (typeof COPY)["en"] | (typeof COPY)["fi"]

type Mode = "list" | "detail" | "compare" | "export"

function fmtDate(iso: string, lang: "en" | "fi") {
  return new Date(iso).toLocaleDateString(lang === "fi" ? "fi-FI" : "en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export function ResearchWorkspaceView({ initialId }: { initialId?: string | null }) {
  const [lang, setLang] = useLang()
  const t = COPY[lang]
  const [items, setItems] = useState<SavedResearchAssessment[]>([])
  const [mode, setMode] = useState<Mode>("list")
  const [activeId, setActiveId] = useState<string | null>(initialId ?? null)
  const [compareA, setCompareA] = useState("")
  const [compareB, setCompareB] = useState("")
  const [hydrated, setHydrated] = useState(false)

  const refresh = useCallback(() => {
    setItems(listSavedAssessments())
  }, [])

  useEffect(() => {
    refresh()
    setHydrated(true)
    if (initialId && getSavedAssessment(initialId)) {
      setActiveId(initialId)
      setMode("detail")
    }
  }, [initialId, refresh])

  const active = useMemo(
    () => (activeId ? items.find(i => i.id === activeId) ?? getSavedAssessment(activeId) : undefined),
    [activeId, items],
  )

  const left = compareA ? getSavedAssessment(compareA) : undefined
  const right = compareB ? getSavedAssessment(compareB) : undefined
  const compareRows = left && right ? buildComparisonRows(left, right) : []

  function openDetail(id: string) {
    setActiveId(id)
    setMode("detail")
  }

  function handleDelete(id: string) {
    deleteSavedAssessment(id)
    refresh()
    if (activeId === id) {
      setActiveId(null)
      setMode("list")
    }
  }

  function handleExportMd(a: SavedResearchAssessment) {
    const md = exportAssessmentMarkdown(a)
    downloadTextFile(`gryps-${slugifyTitle(a.title)}.md`, md)
  }

  const btn: CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
    borderRadius: 6, padding: "8px 12px", cursor: "pointer",
    fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12, color: "var(--text-muted)",
  }

  if (!hydrated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
        <Header lang={lang} onLangChange={setLang} ctaHref="/#advisor" ctaLabel={t.navCta} />
        <main className="gryps-page-under-nav" style={{ maxWidth: 960, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref="/#advisor"
        ctaLabel={t.navCta}
        extraLinks={[
          { href: "/scenarios", label: lang === "en" ? "Scenarios" : "Skenaariot" },
          { href: "/research", label: "Research Library" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
        ]}
      />

      <main className="gryps-page-under-nav" style={{ maxWidth: 960, margin: "0 auto", paddingLeft: 24, paddingRight: 24, paddingBottom: 80 }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>
          {t.eyebrow}
        </p>
        <h1 style={{
          fontFamily: "var(--font-ui)", fontSize: 36, fontWeight: 700, color: "var(--text)",
          letterSpacing: "-0.02em", margin: "12px 0 16px",
        }}>
          {t.title}
        </h1>
        <p style={{
          fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)",
          lineHeight: 1.7, maxWidth: 640, marginBottom: 12,
        }}>
          {t.lead}
        </p>
        <p style={{
          fontFamily: "var(--font-data)", fontSize: 11, color: "var(--accent-amber)",
          lineHeight: 1.55, marginBottom: 28, maxWidth: 640,
        }}>
          {t.disclosure}
        </p>

        <div className="gryps-no-print" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          <button type="button" style={{ ...btn, borderColor: mode === "list" ? "var(--accent-blue)" : "var(--border2)", color: mode === "list" ? "var(--accent-blue)" : "var(--text-muted)" }} onClick={() => setMode("list")}>
            {t.saved}
          </button>
          <button type="button" style={{ ...btn, borderColor: mode === "compare" ? "var(--accent-blue)" : "var(--border2)", color: mode === "compare" ? "var(--accent-blue)" : "var(--text-muted)" }} onClick={() => setMode("compare")}>
            <GitCompare size={13} /> {t.compare}
          </button>
        </div>

        {mode === "list" && (
          <ListPanel
            items={items}
            t={t}
            lang={lang}
            onOpen={openDetail}
            onDelete={handleDelete}
            onExport={handleExportMd}
            onExportPrint={(id) => { setActiveId(id); setMode("export") }}
            btn={btn}
          />
        )}

        {mode === "detail" && active && (
          <DetailPanel
            a={active}
            t={t}
            lang={lang}
            onBack={() => setMode("list")}
            onExport={() => handleExportMd(active)}
            onExportPrint={() => setMode("export")}
            onDelete={() => handleDelete(active.id)}
            btn={btn}
          />
        )}

        {mode === "compare" && (
          <ComparePanel
            items={items}
            t={t}
            lang={lang}
            compareA={compareA}
            compareB={compareB}
            setCompareA={setCompareA}
            setCompareB={setCompareB}
            rows={compareRows}
            btn={btn}
          />
        )}

        {mode === "export" && active && (
          <ExportReport
            a={active}
            t={t}
            lang={lang}
            onBack={() => setMode("detail")}
            onDownload={() => handleExportMd(active)}
            btn={btn}
          />
        )}
      </main>

      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en"
          ? "Non-commercial R&D prototype"
          : "Ei-kaupallinen T&K-prototyyppi")}
      />
    </div>
  )
}

function ListPanel({
  items, t, lang, onOpen, onDelete, onExport, onExportPrint, btn,
}: {
  items: SavedResearchAssessment[]
  t: UiCopy
  lang: "en" | "fi"
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onExport: (a: SavedResearchAssessment) => void
  onExportPrint: (id: string) => void
  btn: CSSProperties
}) {
  if (!items.length) {
    return (
      <div style={{
        backgroundColor: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "32px 24px", textAlign: "center",
      }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
          {t.empty}
        </p>
        <Link href="/#advisor" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--cta-gradient)", color: "#070B12",
          fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
          padding: "12px 20px", borderRadius: 6, textDecoration: "none",
        }}>
          {t.emptyCta} <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map(a => {
        const score = scoreOf(a)
        const grade = gradeOf(a)
        const gc = gradeColor(grade)
        const gtc = gradeTextColor(grade)
        return (
          <div key={a.id} style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <button
                  type="button"
                  onClick={() => onOpen(a.id)}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
                    fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 700, color: "var(--text)",
                  }}
                >
                  {a.title}
                </button>
                <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
                  {fmtDate(a.savedAt, lang)} · {a.depth === "full" ? t.full : t.abbreviated} · {recommendedProvider(a)}
                </p>
              </div>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: 14, fontWeight: 900, color: gtc,
                border: `1px solid ${gc}55`, borderRadius: 6, padding: "4px 10px", alignSelf: "flex-start",
              }}>
                {grade} · {score}
              </span>
            </div>
            <div className="gryps-no-print" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              <button type="button" style={btn} onClick={() => onOpen(a.id)}>{t.open}</button>
              <button type="button" style={btn} onClick={() => onExport(a)}><Download size={12} /> {t.export}</button>
              <button type="button" style={btn} onClick={() => onExportPrint(a.id)}><FileText size={12} /> {t.exportPrint}</button>
              <button type="button" style={{ ...btn, color: "var(--accent-red)" }} onClick={() => onDelete(a.id)}>
                <Trash2 size={12} /> {t.delete}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DetailPanel({
  a, t, lang, onBack, onExport, onExportPrint, onDelete, btn,
}: {
  a: SavedResearchAssessment
  t: UiCopy
  lang: "en" | "fi"
  onBack: () => void
  onExport: () => void
  onExportPrint: () => void
  onDelete: () => void
  btn: CSSProperties
}) {
  const score = scoreOf(a)
  const grade = gradeOf(a)
  const gtc = gradeTextColor(grade)
  const gc = gradeColor(grade)
  const model = a.result?.modelVersion ?? a.abbreviated?.modelVersion ?? MODEL_VERSION
  const evidence = a.result?.evidence
  const rec = a.result?.intelligence?.recommendation
  const comparison = a.result?.intelligence?.comparison ?? []

  return (
    <div>
      <button type="button" onClick={onBack} className="gryps-no-print" style={{
        background: "none", border: "none", color: "var(--accent-blue)", cursor: "pointer",
        fontFamily: "var(--font-ui)", fontSize: 13, marginBottom: 16, padding: 0,
      }}>
        {t.back}
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em" }}>{t.detail}</p>
          <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 24, fontWeight: 700, color: "var(--text)", marginTop: 6 }}>{a.title}</h2>
        </div>
        <span style={{
          fontFamily: "var(--font-data)", fontSize: 18, fontWeight: 900, color: gtc,
          border: `1px solid ${gc}55`, borderRadius: 6, padding: "6px 12px", height: "fit-content",
        }}>
          {grade} · {score}/100
        </span>
      </div>

      <div className="gryps-no-print" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        <button type="button" style={btn} onClick={onExport}><Download size={12} /> {t.export}</button>
        <button type="button" style={btn} onClick={onExportPrint}><FileText size={12} /> {t.exportPrint}</button>
        <button type="button" style={{ ...btn, color: "var(--accent-red)" }} onClick={onDelete}><Trash2 size={12} /> {t.delete}</button>
      </div>

      <MetaGrid t={t} lang={lang} a={a} model={model} />

      <Section label={t.executive}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
          {a.result?.resilience_signature.summary
            ?? a.abbreviated?.resilience_signature.summary
            ?? t.none}
        </p>
      </Section>

      <Section label={t.inputs}>
        <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            [t.coords, a.inputs.lat != null && a.inputs.lng != null ? `${a.inputs.lat.toFixed(2)}°N · ${a.inputs.lng.toFixed(2)}°E` : t.none],
            [t.scenario, a.scenarioLabel ?? a.inputs.sector],
            ["Autonomy", a.inputs.autonomy_level],
            ["Criticality", a.inputs.operation_criticality],
            ["Setup", a.inputs.current_setup?.trim() || t.none],
            ["Priorities", (a.inputs.priorities ?? []).map(p => p.replace(/_/g, " ")).join(", ") || t.none],
          ].map(([k, v]) => (
            <div key={k as string} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <dt style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }}>{k}</dt>
              <dd style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", margin: 0, textAlign: "right" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section label={t.assumptions}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(evidence?.assumptions ?? [
            "Clear sky-view assumed unless contradicted by terrain evidence.",
            "Catalog confidence is a research heuristic, not measured availability.",
          ]).map(x => (
            <li key={x.slice(0, 40)} style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 6 }}>{x}</li>
          ))}
        </ul>
      </Section>

      <Section label={t.analysis}>
        {a.result?.risk_factors?.length ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {a.result.risk_factors.map(r => (
              <li key={r.label} style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 8 }}>
                <strong style={{ color: "var(--text)" }}>{r.label}</strong> ({r.severity}) — {r.detail}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)" }}>
            {(a.abbreviated?.top_risks ?? []).map(r => `${r.label} (${r.severity})`).join(" · ") || t.none}
          </p>
        )}
      </Section>

      <Section label={t.providers}>
        {comparison.length ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr>
                  {["", ...comparison.map(c => c.provider)].map(h => (
                    <th key={h || "blank"} style={{ textAlign: "left", fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text)", padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["coverage", "latency", "resilience", "hardware", "best_for"] as const).map(key => (
                  <tr key={key}>
                    <td style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", padding: "8px" }}>{key}</td>
                    {comparison.map(c => (
                      <td key={c.provider + key} style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text)", padding: "8px" }}>{c[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)" }}>{recommendedProvider(a)}</p>
        )}
      </Section>

      <Section label={t.recommendation}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>
          {rec?.headline ?? a.result?.recommendation ?? a.abbreviated?.recommended.why ?? t.none}
        </p>
        {rec?.primary_reason && (
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 8 }}>
            {rec.primary_reason}
          </p>
        )}
      </Section>

      <Section label={t.evidence}>
        {evidence ? (
          <>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 10 }}>
              {evidence.methodology_summary}
            </p>
            <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>
              {evidence.environment_theme} · {evidence.confidence.band} ({evidence.confidence.score}%)
            </p>
          </>
        ) : (
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-dim)" }}>
            {lang === "fi" ? "Täysi näyttöpaketti avatuissa arvioissa." : "Full evidence package on unlocked assessments."}
          </p>
        )}
      </Section>

      {a.scenarioSlug && (
        <p style={{ marginTop: 16 }}>
          <Link href={`/scenarios/${a.scenarioSlug}`} style={{ color: "var(--accent-blue)", fontFamily: "var(--font-ui)", fontSize: 13 }}>
            {lang === "fi" ? "Avaa skenaario →" : "Open scenario →"}
          </Link>
        </p>
      )}
    </div>
  )
}

function MetaGrid({
  t, lang, a, model,
}: {
  t: UiCopy
  lang: "en" | "fi"
  a: SavedResearchAssessment
  model: string
}) {
  const rows = [
    [t.date, fmtDate(a.savedAt, lang)],
    [t.methodology, model],
    [t.depth, a.depth === "full" ? t.full : t.abbreviated],
    [t.coords, a.inputs.lat != null && a.inputs.lng != null ? `${a.inputs.lat.toFixed(2)}°N · ${a.inputs.lng.toFixed(2)}°E` : t.none],
  ]
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28,
      backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px",
    }} className="gryps-output-grid">
      {rows.map(([k, v]) => (
        <div key={k}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{k}</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", marginTop: 4 }}>{v}</p>
        </div>
      ))}
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <p style={{
        fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)",
        letterSpacing: "0.12em", marginBottom: 10,
      }}>
        {label}
      </p>
      {children}
    </section>
  )
}

function ComparePanel({
  items, t, lang, compareA, compareB, setCompareA, setCompareB, rows, btn,
}: {
  items: SavedResearchAssessment[]
  t: UiCopy
  lang: "en" | "fi"
  compareA: string
  compareB: string
  setCompareA: (v: string) => void
  setCompareB: (v: string) => void
  rows: ReturnType<typeof buildComparisonRows>
  btn: CSSProperties
}) {
  const selectStyle: CSSProperties = {
    width: "100%", backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
    borderRadius: 6, padding: "10px 12px", fontFamily: "var(--font-ui)", fontSize: 13,
    color: "var(--text)",
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
        {t.compareTitle}
      </h2>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20, maxWidth: 640 }}>
        {t.compareHint}
      </p>

      {items.length < 2 ? (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-dim)" }}>
          {lang === "fi" ? "Tallenna vähintään kaksi arviota vertailua varten." : "Save at least two assessments to compare."}
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }} className="gryps-output-grid">
            <div>
              <label style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", display: "block", marginBottom: 6 }}>{t.pickA}</label>
              <select value={compareA} onChange={e => setCompareA(e.target.value)} style={selectStyle}>
                <option value="">{t.none}</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", display: "block", marginBottom: 6 }}>{t.pickB}</label>
              <select value={compareB} onChange={e => setCompareB(e.target.value)} style={selectStyle}>
                <option value="">{t.none}</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
              </select>
            </div>
          </div>
          <button
            type="button"
            style={{ ...btn, marginBottom: 20 }}
            onClick={() => { setCompareA(""); setCompareB("") }}
          >
            {t.clearCompare}
          </button>

          {rows.length > 0 && (
            <div style={{ overflowX: "auto", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 8px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px", fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)" }} />
                    <th style={{ textAlign: "left", padding: "8px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-blue)" }}>A</th>
                    <th style={{ textAlign: "left", padding: "8px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-cyan)" }}>B</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.key}>
                      <td style={{ padding: "10px 8px", borderTop: "1px solid var(--border)", fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", verticalAlign: "top" }}>
                        {lang === "fi" ? row.labelFi : row.labelEn}
                      </td>
                      <td style={{ padding: "10px 8px", borderTop: "1px solid var(--border)", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", verticalAlign: "top" }}>{row.a}</td>
                      <td style={{ padding: "10px 8px", borderTop: "1px solid var(--border)", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", verticalAlign: "top" }}>{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ExportReport({
  a, t, lang, onBack, onDownload, btn,
}: {
  a: SavedResearchAssessment
  t: UiCopy
  lang: "en" | "fi"
  onBack: () => void
  onDownload: () => void
  btn: CSSProperties
}) {
  const score = scoreOf(a)
  const grade = gradeOf(a)
  const model = a.result?.modelVersion ?? a.abbreviated?.modelVersion ?? MODEL_VERSION
  const evidence = a.result?.evidence
  const rec = a.result?.intelligence?.recommendation
  const comparison = a.result?.intelligence?.comparison ?? []

  return (
    <div>
      <div className="gryps-no-print" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        <button type="button" style={btn} onClick={onBack}>{t.back}</button>
        <button type="button" style={btn} onClick={onDownload}><Download size={12} /> {t.export}</button>
        <button type="button" style={btn} onClick={() => window.print()}><FileText size={12} /> {t.exportPrint}</button>
      </div>

      <div className="gryps-print-target" style={{
        backgroundColor: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "28px 28px 36px",
      }}>
        <GrypsPrintBrand />
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginTop: 16 }}>
          {t.reportTitle}
        </p>
        <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: "10px 0 8px" }}>
          {a.title}
        </h2>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", marginBottom: 20 }}>
          {fmtDate(a.savedAt, lang)} · {model} · {score}/100 · {grade}
        </p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-amber)", marginBottom: 28 }}>
          {t.researchOnly}
        </p>

        <ExportSection title={t.executive}>
          {a.result?.resilience_signature.summary ?? a.abbreviated?.resilience_signature.summary ?? t.none}
        </ExportSection>

        <ExportSection title={t.scenario}>
          {[
            a.scenarioLabel ?? a.inputs.sector,
            a.inputs.priorities?.length
              ? `priorities: ${a.inputs.priorities.map(p => p.replace(/_/g, " ")).join(", ")}`
              : "",
          ].filter(Boolean).join(" · ")}
        </ExportSection>

        <ExportSection title={t.inputs}>
          {[
            `Coordinates: ${a.inputs.lat != null && a.inputs.lng != null ? `${a.inputs.lat}°N, ${a.inputs.lng}°E` : "—"}`,
            `Autonomy: ${a.inputs.autonomy_level}`,
            `Criticality: ${a.inputs.operation_criticality}`,
            `Setup: ${a.inputs.current_setup?.trim() || "—"}`,
          ].join("\n")}
        </ExportSection>

        <ExportSection title={t.findings}>
          {(a.result?.risk_factors ?? []).map(r => `${r.label} (${r.severity}): ${r.detail}`).join("\n")
            || (a.abbreviated?.top_risks ?? []).map(r => `${r.label} (${r.severity})`).join("\n")
            || t.none}
        </ExportSection>

        <ExportSection title={t.providers}>
          {comparison.length
            ? comparison.map(c => `${c.provider}: coverage ${c.coverage}, latency ${c.latency}, resilience ${c.resilience}, best for ${c.best_for}`).join("\n")
            : recommendedProvider(a)}
        </ExportSection>

        <ExportSection title={t.recommendation}>
          {rec ? `${rec.headline}\n${rec.primary_reason}` : (a.result?.recommendation ?? a.abbreviated?.recommended.why ?? t.none)}
        </ExportSection>

        <ExportSection title={t.evidence}>
          {evidence
            ? `${evidence.methodology_summary}\n${evidence.environment_theme} · confidence ${evidence.confidence.band} (${evidence.confidence.score}%)`
            : t.none}
        </ExportSection>

        <ExportSection title={t.limitations}>
          {(evidence?.limitations ?? [
            "Not a site survey, live RF feed, procurement advice, or certification.",
          ]).join("\n")}
        </ExportSection>

        <ExportSection title={t.methodology}>
          {`GRYPS ${model} — experimental Connectivity Intelligence. See /methodology. Indicative research output only.`}
        </ExportSection>
      </div>
    </div>
  )
}

function ExportSection({ title, children }: { title: string; children: string }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 8 }}>
        {title.toUpperCase()}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
        {children}
      </p>
    </section>
  )
}

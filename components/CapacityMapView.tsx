"use client"
import { useMemo, useState, type CSSProperties, type ReactNode } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { useTheme } from "@/context/ThemeContext"
import { useLang } from "@/lib/use-lang"
import {
  CAPACITY_STATUS_COLOR,
  capacityStatusLabel,
  type CapacityStatus,
} from "@/lib/capacity-status"
import { MODEL_VERSION } from "@/lib/signature-meta"

export type CapacitySiteView = {
  slug: string
  name: string
  lat: number
  lng: number
  sector: string
  autonomy_level: string
  operation_criticality: string
  status: CapacityStatus
  score: number | null
  grade: string | null
  summary: string | null
  last_scored_at: string | null
  country: string | null
  municipality: string | null
  real_data_score: number | null
  terrain_penalty_score: number | null
  real_world_gap_score: number | null
  top_provider: string | null
  top_confidence: number | null
  top_orbit: string | null
  latency_estimate: string | null
  recommendation: string | null
  source: "signature_sites"
}

const CapacityMap = dynamic(
  () => import("@/components/CapacityMap").then(m => m.CapacityMap),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)",
      }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>LOADING MAP…</p>
      </div>
    ),
  },
)

const COPY = {
  en: {
    tagline: "EXPLORE CONNECTIVITY INTELLIGENCE",
    title: "Explore Connectivity Intelligence",
    lead:
      "Modeled satellite connectivity resilience across remote Nordic and Arctic operating environments. Select a site for Signature score, assessment confidence, and orbital-class signals — then generate a Resilience Signature.",
    disclosure:
      "GRYPS uses deterministic Signature Model scoring to estimate connectivity resilience. Results are model-based — not a live RF measurement or live constellation feed. Research prototype · Non-commercial · Model-based analysis.",
    modelMeta: `${MODEL_VERSION} · Deterministic intelligence model`,
    hint: "Pan · zoom · select a site",
    all: "All",
    status: "Status",
    sector: "Sector",
    orbit: "Orbit",
    source: "Source",
    lastUpdated: "Last scored",
    score: "Resilience",
    confidence: "Assessment confidence",
    confidenceNote: "Confidence reflects the assessment/data basis — not guaranteed service availability.",
    latency: "Failover switching (model)",
    provider: "Recommended provider",
    orbitClass: "Orbital class",
    realData: "Reference data",
    terrain: "Terrain",
    gap: "Real-world gap",
    none: "Select a site on the map to inspect modeled Connectivity Intelligence.",
    viewSig: "Full Signature →",
    runAdvisor: "Generate Resilience Signature →",
    empty: "No sites in this filter.",
    navCta: "Generate Resilience Signature",
    methodology: "Methodology",
  },
  fi: {
    tagline: "TUTKI CONNECTIVITY INTELLIGENCEA",
    title: "Tutki Connectivity Intelligencea",
    lead:
      "Mallinnettu satelliittiyhteyden resilienssi pohjoismaisissa ja arktisissa toimintaympäristöissä. Valitse kohde Signature-pisteille, arviointiluottamukselle ja rataluokkasignaaleille — ja luo sitten Resilience Signature.",
    disclosure:
      "GRYPS arvioi yhteyden resilienssiä deterministisellä Signature-mallilla. Tulokset ovat mallipohjaisia — eivät reaaliaikaista RF-mittausta tai konstellaatiotelemetriaa. Tutkimusprototyyppi · Ei-kaupallinen · Mallipohjainen analyysi.",
    modelMeta: `${MODEL_VERSION} · Deterministinen älymalli`,
    hint: "Vieritä · zoom · valitse kohde",
    all: "Kaikki",
    status: "Tila",
    sector: "Toimiala",
    orbit: "Rata",
    source: "Lähde",
    lastUpdated: "Viimeksi pisteytetty",
    score: "Resilienssi",
    confidence: "Arviointiluottamus",
    confidenceNote: "Luottamus kuvaa arvioinnin/dataperustan varmuutta — ei palvelun saatavuustakuuta.",
    latency: "Failover-vaihto (malli)",
    provider: "Suositeltu toimittaja",
    orbitClass: "Rataluokka",
    realData: "Viitedata",
    terrain: "Maasto",
    gap: "Todellinen kuilu",
    none: "Valitse karttapiste nähdäksesi mallinnetun Connectivity Intelligencen.",
    viewSig: "Koko Signature →",
    runAdvisor: "Luo Resilience Signature →",
    empty: "Ei kohteita tällä suodattimella.",
    navCta: "Luo Resilience Signature",
    methodology: "Menetelmä",
  },
}

const STATUSES: CapacityStatus[] = ["ok", "degraded", "down", "unknown"]
const ORBITS = ["LEO", "MEO", "GEO", "Polar"] as const

function formatWhen(iso: string | null, lang: "en" | "fi"): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString(lang === "fi" ? "fi-FI" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

function confidenceBand(n: number | null, lang: "en" | "fi"): string {
  if (n == null) return "—"
  const band = n >= 80 ? (lang === "fi" ? "Korkea" : "High")
    : n >= 60 ? (lang === "fi" ? "Keskitaso" : "Medium")
    : (lang === "fi" ? "Matala" : "Low")
  return `${band} (${n}%)`
}

function advisorHref(site: CapacitySiteView): string {
  const p = new URLSearchParams()
  p.set("lat", String(site.lat))
  p.set("lng", String(site.lng))
  if (site.sector) p.set("sector", site.sector)
  if (site.autonomy_level) p.set("autonomy", site.autonomy_level)
  if (site.operation_criticality) p.set("criticality", site.operation_criticality)
  return `/?${p.toString()}#advisor`
}

export function CapacityMapView({ sites }: { sites: CapacitySiteView[] }) {
  const [lang, setLang] = useLang()
  const { dark } = useTheme()
  const t = COPY[lang]
  const [statusFilter, setStatusFilter] = useState<CapacityStatus | "all">("all")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const [orbitFilter, setOrbitFilter] = useState<string>("all")
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const sectors = useMemo(() => {
    const set = new Set(sites.map(s => s.sector).filter(Boolean))
    return Array.from(set).sort()
  }, [sites])

  const filtered = useMemo(() => {
    return sites.filter(s => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false
      if (sectorFilter !== "all" && s.sector !== sectorFilter) return false
      if (orbitFilter !== "all" && s.top_orbit !== orbitFilter) return false
      return true
    })
  }, [sites, statusFilter, sectorFilter, orbitFilter])

  const selected = useMemo(
    () => sites.find(s => s.slug === selectedSlug) ?? null,
    [sites, selectedSlug],
  )

  const counts = useMemo(() => {
    const c: Record<CapacityStatus, number> = { ok: 0, degraded: 0, down: 0, unknown: 0 }
    for (const s of sites) c[s.status]++
    return c
  }, [sites])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref="/#advisor"
        ctaLabel={t.navCta}
        extraLinks={[
          { href: "/about", label: lang === "en" ? "About" : "Tietoa" },
          { href: "/signatures", label: lang === "en" ? "Signatures" : "Signaturet" },
          { href: "/methodology", label: t.methodology },
        ]}
      />

      <div style={{
        flex: 1, maxWidth: 1400, width: "100%", margin: "0 auto",
        padding: "16px 24px 32px", paddingTop: 84,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div style={{ maxWidth: 820 }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 6 }}>
            {t.tagline}
          </p>
          <h1 style={{
            fontFamily: "var(--font-ui)", fontSize: 24, fontWeight: 700,
            color: "var(--text)", marginBottom: 8, letterSpacing: "-0.01em",
          }}>
            {t.title}
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 8 }}>
            {t.lead}
          </p>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.04em", marginBottom: 8 }}>
            {t.modelMeta} · {t.hint}
          </p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-amber)", lineHeight: 1.55, maxWidth: 720 }}>
            {t.disclosure}{" "}
            <Link href="/methodology" style={{ color: "var(--accent-blue)", textDecoration: "none", fontWeight: 600 }}>
              {t.methodology} →
            </Link>
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FilterRow label={t.status}>
            <button type="button" onClick={() => setStatusFilter("all")} style={chipStyle(statusFilter === "all")}>
              {t.all} · {sites.length}
            </button>
            {STATUSES.map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  ...chipStyle(statusFilter === st),
                  borderColor: statusFilter === st ? CAPACITY_STATUS_COLOR[st] : "var(--border2)",
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: CAPACITY_STATUS_COLOR[st], display: "inline-block",
                }} />
                {capacityStatusLabel(st, lang)} · {counts[st]}
              </button>
            ))}
          </FilterRow>

          <FilterRow label={t.sector}>
            <button type="button" onClick={() => setSectorFilter("all")} style={chipStyle(sectorFilter === "all")}>
              {t.all}
            </button>
            {sectors.map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setSectorFilter(sec)}
                style={chipStyle(sectorFilter === sec)}
              >
                {sec}
              </button>
            ))}
          </FilterRow>

          <FilterRow label={t.orbit}>
            <button type="button" onClick={() => setOrbitFilter("all")} style={chipStyle(orbitFilter === "all")}>
              {t.all}
            </button>
            {ORBITS.map(orb => (
              <button
                key={orb}
                type="button"
                onClick={() => setOrbitFilter(orb)}
                style={chipStyle(orbitFilter === orb)}
              >
                {orb}
              </button>
            ))}
          </FilterRow>
        </div>

        {/* Map dominates the section */}
        <div
          className="gryps-capacity-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
            gap: 14,
            flex: 1,
            minHeight: "min(72vh, 780px)",
          }}
        >
          <div style={{
            minHeight: "min(70vh, 720px)", height: "100%",
            border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
            position: "relative",
          }}>
            {filtered.length === 0 ? (
              <div style={{
                height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "var(--surface)",
              }}>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)" }}>{t.empty}</p>
              </div>
            ) : (
              <CapacityMap
                sites={filtered}
                dark={dark}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
              />
            )}
          </div>

          <aside style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 12,
            minHeight: 280, maxHeight: "min(72vh, 780px)", overflow: "auto",
          }}>
            {!selected ? (
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {t.none}
              </p>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 4,
                    color: "#070B12",
                    backgroundColor: CAPACITY_STATUS_COLOR[selected.status],
                  }}>
                    {capacityStatusLabel(selected.status, lang)}
                  </span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
                    {selected.sector.toUpperCase()}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: "var(--font-ui)", fontSize: 17, fontWeight: 700,
                  color: "var(--text)", lineHeight: 1.35, margin: 0,
                }}>
                  {selected.name}
                </h2>

                {(selected.municipality || selected.country) && (
                  <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", margin: 0 }}>
                    {[selected.municipality, selected.country].filter(Boolean).join(" · ")} · {selected.lat.toFixed(2)}°N · {selected.lng.toFixed(2)}°E
                  </p>
                )}

                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
                  padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
                }}>
                  <Metric
                    label={t.score}
                    value={selected.score != null && selected.grade ? `${selected.score} / 100` : "—"}
                    sub={selected.grade ? `Grade ${selected.grade}` : undefined}
                  />
                  <Metric
                    label={t.confidence}
                    value={confidenceBand(selected.top_confidence, lang)}
                  />
                  <Metric
                    label={t.orbitClass}
                    value={selected.top_orbit ?? "—"}
                  />
                  <Metric
                    label={t.latency}
                    value={selected.latency_estimate ?? "—"}
                  />
                </div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5, margin: 0 }}>
                  {t.confidenceNote}
                </p>

                {selected.top_provider && (
                  <Row label={t.provider} value={selected.top_provider} />
                )}
                {selected.summary && (
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                    {selected.summary}
                  </p>
                )}

                <dl style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0 }}>
                  <Row label={t.lastUpdated} value={formatWhen(selected.last_scored_at, lang)} />
                  {selected.real_data_score != null && (
                    <Row label={t.realData} value={String(selected.real_data_score)} />
                  )}
                  {selected.terrain_penalty_score != null && (
                    <Row label={t.terrain} value={String(selected.terrain_penalty_score)} />
                  )}
                </dl>

                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
                  <Link
                    href={advisorHref(selected)}
                    className="gryps-cta-btn"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      textDecoration: "none", width: "100%", minHeight: 44,
                      background: "var(--cta-gradient)", color: "#070B12",
                      fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    {t.runAdvisor}
                  </Link>
                  <Link
                    href={`/signatures/${selected.slug}`}
                    style={{
                      fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
                      color: "var(--accent-blue)", textDecoration: "none", textAlign: "center",
                    }}
                  >
                    {t.viewSig}
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en" ? "Espoo, Finland · Non-commercial R&D prototype" : "Espoo, Suomi · Ei-kaupallinen T&K-prototyyppi")}
        secondaryLink={{ href: "/", label: lang === "en" ? "Back to GRYPS" : "Takaisin GRYPS:iin" }}
      />
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <span style={{
        fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)",
        letterSpacing: "0.1em", minWidth: 56,
      }}>
        {label.toUpperCase()}
      </span>
      {children}
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 4 }}>
        {label.toUpperCase()}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1.3 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{sub}</p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 3 }}>
        {label.toUpperCase()}
      </dt>
      <dd style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", margin: 0 }}>
        {value}
      </dd>
    </div>
  )
}

function chipStyle(active: boolean): CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 8,
    backgroundColor: active ? "var(--border2)" : "var(--surface2)",
    border: "1px solid var(--border2)",
    borderRadius: 6, padding: "8px 12px", minHeight: 40, cursor: "pointer",
    fontFamily: "var(--font-data)", fontSize: 11, fontWeight: 700,
    color: active ? "var(--text)" : "var(--text-muted)",
  }
}

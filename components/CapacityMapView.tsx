"use client"
import { useMemo, useState, type CSSProperties } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { useTheme } from "@/context/ThemeContext"
import {
  CAPACITY_STATUS_COLOR,
  capacityStatusLabel,
  type CapacityStatus,
} from "@/lib/capacity-status"

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
    tagline: "CAPACITY MAP",
    title: "Where connectivity posture holds — and where it does not",
    disclosure:
      "Illustrative portfolio from signature_sites. Status is derived from the Resilience Signature model (grade/score), not live link monitoring. R&D prototype · non-commercial research.",
    all: "All",
    source: "Source",
    lastUpdated: "Last scored",
    score: "Signature",
    realData: "Real-data evidence",
    terrain: "Terrain",
    gap: "Real-world gap",
    none: "No site selected — click a point on the map.",
    viewSig: "Full signature →",
    empty: "No sites in this filter.",
    navCta: "Score your site",
    loadingMap: "LOADING MAP…",
  },
  fi: {
    tagline: "KAPASITEETTIKARTTA",
    title: "Missä yhteyksiin voi luottaa — ja missä ei",
    disclosure:
      "Havainnollistava portfolio signature_sites-taulusta. Tila kuvaa Resilience Signature -mallin arvioimaa yhteyden resilienssiasentoa (arvosana/pisteet) — ei live-yhteyden tai linkkien seurantaa. T&K-prototyyppi · ei-kaupallinen tutkimus.",
    all: "Kaikki",
    source: "Lähde",
    lastUpdated: "Viimeksi pisteytetty",
    score: "Signatuuri",
    realData: "Reaalidatanäyttö",
    terrain: "Maasto",
    gap: "Todellinen kuilu",
    none: "Ei valittua kohdetta — napsauta karttapistettä.",
    viewSig: "Koko signatuuri →",
    empty: "Ei kohteita tällä suodattimella.",
    navCta: "Pisteytä kohteesi",
    loadingMap: "LADATAAN KARTTAA…",
  },
}

const STATUSES: CapacityStatus[] = ["ok", "degraded", "down", "unknown"]

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

export function CapacityMapView({ sites }: { sites: CapacitySiteView[] }) {
  const [lang, setLang] = useState<"en" | "fi">("en")
  const { dark } = useTheme()
  const t = COPY[lang]
  const [filter, setFilter] = useState<CapacityStatus | "all">("all")
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const filtered = useMemo(
    () => (filter === "all" ? sites : sites.filter(s => s.status === filter)),
    [sites, filter],
  )

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
          { href: "/signatures", label: lang === "en" ? "Signatures" : "Signatuurit" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
        ]}
      />

      <div style={{
        flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto",
        padding: "24px 32px 40px", paddingTop: 90,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>
            {t.tagline}
          </p>
          <h1 style={{
            fontFamily: "var(--font-ui)", fontSize: 26, fontWeight: 700,
            color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em",
          }}>
            {t.title}
          </h1>
          <div style={{
            backgroundColor: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)",
            borderRadius: 6, padding: "10px 14px", maxWidth: 720,
          }}>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-amber)", lineHeight: 1.6 }}>
              {t.disclosure}
            </p>
          </div>
        </div>

        {/* Status filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setFilter("all")}
            style={chipStyle(filter === "all")}
          >
            {t.all} · {sites.length}
          </button>
          {STATUSES.map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              style={{
                ...chipStyle(filter === st),
                borderColor: filter === st ? CAPACITY_STATUS_COLOR[st] : "var(--border2)",
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                backgroundColor: CAPACITY_STATUS_COLOR[st], display: "inline-block",
              }} />
              {capacityStatusLabel(st, lang)} · {counts[st]}
            </button>
          ))}
        </div>

        {/* Map + panel */}
        <div
          className="gryps-capacity-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(280px, 340px)",
            gap: 16,
            minHeight: 520,
            flex: 1,
          }}
        >
          <div style={{
            minHeight: 420, height: "100%",
            border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
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
            borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 14,
            minHeight: 280,
          }}>
            {!selected ? (
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {t.none}
              </p>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                  fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 700,
                  color: "var(--text)", lineHeight: 1.35,
                }}>
                  {selected.name}
                </h2>

                {selected.summary && (
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>
                    {selected.summary}
                  </p>
                )}

                <dl style={{ display: "flex", flexDirection: "column", gap: 10, margin: 0 }}>
                  <Row label={t.source} value="signature_sites · Resilience Signature model" />
                  <Row label={t.lastUpdated} value={formatWhen(selected.last_scored_at, lang)} />
                  <Row
                    label={t.score}
                    value={
                      selected.score != null && selected.grade
                        ? `${selected.score} (${selected.grade})`
                        : "—"
                    }
                  />
                  {(selected.municipality || selected.country) && (
                    <Row
                      label={lang === "en" ? "Location" : "Sijainti"}
                      value={[selected.municipality, selected.country].filter(Boolean).join(" · ")}
                    />
                  )}
                  {selected.real_data_score != null && (
                    <Row label={t.realData} value={String(selected.real_data_score)} />
                  )}
                  {selected.terrain_penalty_score != null && (
                    <Row label={t.terrain} value={String(selected.terrain_penalty_score)} />
                  )}
                  {selected.real_world_gap_score != null && (
                    <Row label={t.gap} value={String(selected.real_world_gap_score)} />
                  )}
                </dl>

                <Link
                  href={`/signatures/${selected.slug}`}
                  style={{
                    marginTop: "auto", fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700,
                    color: "var(--accent-blue)", textDecoration: "none",
                  }}
                >
                  {t.viewSig}
                </Link>
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

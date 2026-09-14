"use client";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NextStepsLinks } from "@/components/NextStepsLinks";
import { grypsCopyright } from "@/lib/gryps-copyright";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/lib/use-lang";
import {
  CAPACITY_STATUS_COLOR,
  capacityStatusLabel,
  type CapacityStatus,
} from "@/lib/capacity-status";
import { MODEL_VERSION } from "@/lib/signature-meta";
import {
  RESEARCH_REGIONS,
  RESEARCH_VERTICALS,
  researchHref,
  type ResearchRegion,
  type ResearchVertical,
} from "@/lib/research-library";

export type CapacitySiteView = {
  slug: string;
  name: string;
  displayName: string;
  displayNameFi: string;
  lat: number;
  lng: number;
  sector: string;
  vertical: string;
  region: ResearchRegion;
  autonomy_level: string;
  operation_criticality: string;
  status: CapacityStatus;
  score: number | null;
  grade: string | null;
  summary: string | null;
  last_scored_at: string | null;
  country: string | null;
  municipality: string | null;
  real_data_score: number | null;
  terrain_penalty_score: number | null;
  real_world_gap_score: number | null;
  top_provider: string | null;
  top_confidence: number | null;
  top_orbit: string | null;
  orbit_architectures: string[];
  latency_estimate: string | null;
  recommendation: string | null;
  researchSlug: string | null;
  inResearchLibrary: boolean;
  source: "signature_sites";
};

const CapacityMap = dynamic(() => import("@/components/CapacityMap").then((m) => m.CapacityMap), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--surface)",
        borderRadius: 10,
        border: "1px solid var(--border)",
      }}
    >
      <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>
        LOADING MAP…
      </p>
    </div>
  ),
});

type Priority = "all" | "standard" | "high" | "safety-critical";
type LibraryFilter = "all" | "library";

const COPY = {
  en: {
    tagline: "EXPLORE CONNECTIVITY INTELLIGENCE",
    title: "Explore Connectivity Intelligence",
    lead: "Select a region and operating vertical to understand the modeled connectivity environment — then Generate a Resilience Signature for that site.",
    disclosure:
      "Model-based Connectivity Intelligence — not live RF, constellation telemetry, or a coverage SLA. Research prototype · Non-commercial · Model-based analysis.",
    modelMeta: `${MODEL_VERSION} · Deterministic intelligence model`,
    hint: "Pan · zoom · select a site",
    all: "All",
    region: "Region",
    vertical: "Vertical",
    priority: "Priority",
    library: "Scope",
    libraryAll: "All modeled sites",
    libraryOnly: "Research Library",
    score: "Modeled resilience",
    confidence: "Assessment confidence",
    confidenceNote:
      "Confidence reflects the assessment/data basis — not guaranteed service availability.",
    architectures: "Relevant connectivity architectures",
    provider: "Top-ranked option (model)",
    none: "Select a site on the map to inspect the connectivity environment, then Generate a Resilience Signature.",
    viewResearch: "View research assessment →",
    runAdvisor: "Generate Resilience Signature →",
    linkScenarios: "Related scenarios",
    linkProviders: "Providers",
    assessRegion: "Assess this region",
    empty: "No sites in this filter.",
    navCta: "Generate Resilience Signature",
    methodology: "Methodology",
    researchBadge: "Research Library",
    priorityStandard: "Standard",
    priorityHigh: "High",
    prioritySafety: "Safety-critical",
    flow: "Explore → region / vertical → Generate Resilience Signature",
  },
  fi: {
    tagline: "TUTKI CONNECTIVITY INTELLIGENCEA",
    title: "Tutki Connectivity Intelligencea",
    lead: "Valitse alue ja toimiala ymmärtääksesi mallinnetun yhteysympäristön — ja luo sitten Resilience Signature kyseiselle kohteelle.",
    disclosure:
      "Mallipohjainen Connectivity Intelligence — ei live-RF:ää, konstellaatiotelemetriaa eikä kattavuus-SLA:ta. Tutkimusprototyyppi · Ei-kaupallinen · Mallipohjainen analyysi.",
    modelMeta: `${MODEL_VERSION} · Deterministinen älymalli`,
    hint: "Vieritä · zoom · valitse kohde",
    all: "Kaikki",
    region: "Alue",
    vertical: "Toimiala",
    priority: "Prioriteetti",
    library: "Laajuus",
    libraryAll: "Kaikki mallinnetut",
    libraryOnly: "Research Library",
    score: "Mallinnettu resilienssi",
    confidence: "Arviointiluottamus",
    confidenceNote:
      "Luottamus kuvaa arvioinnin/dataperustan varmuutta — ei palvelun saatavuustakuuta.",
    architectures: "Relevantit yhteysarkkitehtuurit",
    provider: "Ykkösvaihtoehto (malli)",
    none: "Valitse karttapiste nähdäksesi yhteysympäristön — ja luo sitten Resilience Signature.",
    viewResearch: "Katso tutkimusarvio →",
    runAdvisor: "Luo Resilience Signature →",
    linkScenarios: "Liittyvät skenaariot",
    linkProviders: "Toimittajat",
    assessRegion: "Arvioi tämä alue",
    empty: "Ei kohteita tällä suodattimella.",
    navCta: "Luo Resilience Signature",
    methodology: "Menetelmä",
    researchBadge: "Research Library",
    priorityStandard: "Tavanomainen",
    priorityHigh: "Korkea",
    prioritySafety: "Turvallisuuskriittinen",
    flow: "Tutki → alue / toimiala → Luo Resilience Signature",
  },
};

function resilienceBand(score: number | null, grade: string | null, lang: "en" | "fi"): string {
  if (score == null && !grade) return "—";
  const band =
    score == null
      ? null
      : score >= 75
        ? lang === "fi"
          ? "Korkea"
          : "High"
        : score >= 50
          ? lang === "fi"
            ? "Keskitaso"
            : "Medium"
          : lang === "fi"
            ? "Matala"
            : "Low";
  if (band && grade && score != null) return `${band} · ${grade} (${score})`;
  if (band && score != null) return `${band} (${score})`;
  return grade ?? "—";
}

function confidenceBand(n: number | null, lang: "en" | "fi"): string {
  if (n == null) return "—";
  const band =
    n >= 80
      ? lang === "fi"
        ? "Korkea"
        : "High"
      : n >= 60
        ? lang === "fi"
          ? "Keskitaso"
          : "Medium"
        : lang === "fi"
          ? "Matala"
          : "Low";
  return `${band} (${n}%)`;
}

function advisorHref(site: CapacitySiteView): string {
  const p = new URLSearchParams();
  p.set("lat", String(site.lat));
  p.set("lng", String(site.lng));
  if (site.sector) p.set("sector", site.sector);
  if (site.autonomy_level) p.set("autonomy", site.autonomy_level);
  if (site.operation_criticality) p.set("criticality", site.operation_criticality);
  return `/?${p.toString()}#advisor`;
}

export function CapacityMapView({ sites }: { sites: CapacitySiteView[] }) {
  const [lang, setLang] = useLang();
  const { dark } = useTheme();
  const t = COPY[lang];
  const [regionFilter, setRegionFilter] = useState<ResearchRegion | "all">("all");
  const [verticalFilter, setVerticalFilter] = useState<ResearchVertical | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority>("all");
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return sites.filter((s) => {
      if (libraryFilter === "library" && !s.inResearchLibrary) return false;
      if (regionFilter !== "all" && s.region !== regionFilter) return false;
      if (verticalFilter !== "all" && s.vertical !== verticalFilter) return false;
      if (priorityFilter !== "all" && s.operation_criticality !== priorityFilter) return false;
      return true;
    });
  }, [sites, regionFilter, verticalFilter, priorityFilter, libraryFilter]);

  const selected = useMemo(
    () => sites.find((s) => s.slug === selectedSlug) ?? null,
    [sites, selectedSlug]
  );

  useEffect(() => {
    if (selectedSlug && !filtered.some((s) => s.slug === selectedSlug)) {
      setSelectedSlug(null);
    }
  }, [filtered, selectedSlug]);

  const priorities: { id: Priority; label: string }[] = [
    { id: "all", label: t.all },
    { id: "standard", label: t.priorityStandard },
    { id: "high", label: t.priorityHigh },
    { id: "safety-critical", label: t.prioritySafety },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header lang={lang} onLangChange={setLang} ctaHref="/#advisor" useIaNav />

      <div
        style={{
          flex: 1,
          maxWidth: 1400,
          width: "100%",
          margin: "0 auto",
          padding: "16px 24px 32px",
          paddingTop: "calc(var(--gryps-header-h, 52px) + 16px)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Breadcrumbs
          lang={lang}
          items={[
            { en: "Explore", fi: "Tutki" },
            { en: "Map", fi: "Kartta" },
          ]}
        />
        <div style={{ maxWidth: 820 }}>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--text-dim)",
              letterSpacing: "0.12em",
              marginBottom: 6,
            }}
          >
            {t.tagline}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.55,
              marginBottom: 6,
            }}
          >
            {t.lead}
          </p>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--accent-blue)",
              letterSpacing: "0.04em",
              marginBottom: 8,
            }}
          >
            {t.flow}
          </p>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--text-dim)",
              letterSpacing: "0.04em",
              marginBottom: 8,
            }}
          >
            {t.modelMeta} · {t.hint}
          </p>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              color: "var(--accent-amber)",
              lineHeight: 1.55,
              maxWidth: 720,
            }}
          >
            {t.disclosure}{" "}
            <Link
              href="/methodology"
              style={{ color: "var(--accent-blue)", textDecoration: "none", fontWeight: 600 }}
            >
              {t.methodology} →
            </Link>
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FilterRow label={t.region}>
            {RESEARCH_REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegionFilter(r.id)}
                style={chipStyle(regionFilter === r.id)}
              >
                {lang === "fi" ? r.fi : r.en}
              </button>
            ))}
          </FilterRow>

          <FilterRow label={t.vertical}>
            {RESEARCH_VERTICALS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVerticalFilter(v.id)}
                style={chipStyle(verticalFilter === v.id)}
              >
                {lang === "fi" ? v.fi : v.en}
              </button>
            ))}
          </FilterRow>

          <FilterRow label={t.priority}>
            {priorities.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriorityFilter(p.id)}
                style={chipStyle(priorityFilter === p.id)}
              >
                {p.label}
              </button>
            ))}
          </FilterRow>

          <FilterRow label={t.library}>
            <button
              type="button"
              onClick={() => setLibraryFilter("all")}
              style={chipStyle(libraryFilter === "all")}
            >
              {t.libraryAll} · {sites.length}
            </button>
            <button
              type="button"
              onClick={() => setLibraryFilter("library")}
              style={chipStyle(libraryFilter === "library")}
            >
              {t.libraryOnly} · {sites.filter((s) => s.inResearchLibrary).length}
            </button>
          </FilterRow>
        </div>

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
          <div
            style={{
              minHeight: "min(70vh, 720px)",
              height: "100%",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--surface)",
                }}
              >
                <p
                  style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)" }}
                >
                  {t.empty}
                </p>
              </div>
            ) : (
              <CapacityMap
                sites={filtered.map((s) => ({
                  slug: s.slug,
                  name: lang === "fi" ? s.displayNameFi : s.displayName,
                  lat: s.lat,
                  lng: s.lng,
                  status: s.status,
                }))}
                dark={dark}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
              />
            )}
          </div>

          <aside
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minHeight: 280,
              maxHeight: "min(72vh, 780px)",
              overflow: "auto",
            }}
          >
            {!selected ? (
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {t.none}
              </p>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "4px 8px",
                      borderRadius: 4,
                      color: "#070B12",
                      backgroundColor: CAPACITY_STATUS_COLOR[selected.status],
                    }}
                  >
                    {capacityStatusLabel(selected.status, lang)}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 10,
                      color: "var(--text-dim)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {selected.vertical.toUpperCase()}
                  </span>
                  {selected.inResearchLibrary && (
                    <span
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        padding: "3px 7px",
                        borderRadius: 4,
                        color: "var(--accent-blue)",
                        border: "1px solid rgba(79,168,255,0.35)",
                      }}
                    >
                      {t.researchBadge}
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text)",
                    lineHeight: 1.35,
                    margin: 0,
                  }}
                >
                  {lang === "fi" ? selected.displayNameFi : selected.displayName}
                </h2>

                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    margin: 0,
                  }}
                >
                  {[selected.municipality, selected.country].filter(Boolean).join(" · ") ||
                    selected.region}
                  {" · "}
                  {selected.lat.toFixed(2)}°N · {selected.lng.toFixed(2)}°E
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "12px 0",
                    borderTop: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <Metric
                    label={t.score}
                    value={resilienceBand(selected.score, selected.grade, lang)}
                  />
                  <Metric
                    label={t.confidence}
                    value={confidenceBand(selected.top_confidence, lang)}
                  />
                  <Metric
                    label={t.architectures}
                    value={
                      selected.orbit_architectures.length
                        ? selected.orbit_architectures.join(" / ")
                        : (selected.top_orbit ?? "—")
                    }
                  />
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {t.confidenceNote}
                </p>

                {selected.top_provider && <Row label={t.provider} value={selected.top_provider} />}
                {selected.summary && (
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 13,
                      color: "var(--text-muted)",
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {selected.summary}
                  </p>
                )}

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    paddingTop: 8,
                  }}
                >
                  <Link
                    href={advisorHref(selected)}
                    className="gryps-cta-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      width: "100%",
                      minHeight: 44,
                      background: "var(--cta-gradient)",
                      color: "#070B12",
                      fontFamily: "var(--font-ui)",
                      fontWeight: 700,
                      fontSize: 13,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    {t.runAdvisor}
                  </Link>
                  {selected.researchSlug && (
                    <Link
                      href={researchHref(selected.researchSlug)}
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--accent-blue)",
                        textDecoration: "none",
                        textAlign: "center",
                      }}
                    >
                      {t.viewResearch}
                    </Link>
                  )}
                  <NextStepsLinks
                    lang={lang}
                    label={lang === "fi" ? "SEURAAVAT ASKELEET" : "NEXT STEPS"}
                    links={[
                      { href: advisorHref(selected), en: t.assessRegion, fi: t.assessRegion },
                      { href: "/scenarios", en: t.linkScenarios, fi: t.linkScenarios },
                      { href: "/providers", en: t.linkProviders, fi: t.linkProviders },
                      { href: "/methodology", en: t.methodology, fi: t.methodology },
                    ]}
                  />
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      <Footer
        lang={lang}
        footerRights={grypsCopyright(
          lang,
          lang === "en"
            ? "Espoo, Finland · Non-commercial R&D prototype"
            : "Espoo, Suomi · Ei-kaupallinen T&K-prototyyppi"
        )}
        secondaryLink={{ href: "/research", label: "Research Library" }}
      />
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <span
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          minWidth: 72,
        }}
      >
        {label.toUpperCase()}
      </span>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        {label.toUpperCase()}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text)",
          margin: 0,
          lineHeight: 1.35,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          marginBottom: 3,
        }}
      >
        {label.toUpperCase()}
      </dt>
      <dd style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", margin: 0 }}>
        {value}
      </dd>
    </div>
  );
}

function chipStyle(active: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: active ? "var(--border2)" : "var(--surface2)",
    border: "1px solid var(--border2)",
    borderRadius: 6,
    padding: "8px 12px",
    minHeight: 40,
    cursor: "pointer",
    fontFamily: "var(--font-data)",
    fontSize: 11,
    fontWeight: 700,
    color: active ? "var(--text)" : "var(--text-muted)",
  };
}

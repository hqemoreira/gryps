"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResilienceOutput } from "@/components/ResilienceOutput";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TypeLabel } from "@/components/TypeLabel";
import { gradeColor } from "@/lib/resilience-colors";
import { SCORING_MODEL_LABEL } from "@/lib/model-constants";
import type { ResolvedResearchAssessment } from "@/lib/research-library";
import { useLang } from "@/lib/use-lang";

const UI = {
  en: {
    eyebrow: "GRYPS RESEARCH LIBRARY",
    context: "Context",
    prototype:
      "Research prototype · Non-commercial · Model-based analysis — not procurement advice or a site survey.",
    viewMethod: "Methodology →",
    viewMap: "Map →",
    viewProviders: "Providers →",
    viewScenarios: "Scenarios →",
    ctaTitle: "Generate Resilience Signature",
    ctaBody: "Run the same model on your coordinates. Free · No account required.",
    ctaBtn: "Generate Resilience Signature",
    back: "← Research Library",
  },
  fi: {
    eyebrow: "GRYPS RESEARCH LIBRARY",
    context: "Konteksti",
    prototype:
      "Tutkimusprototyyppi · Ei-kaupallinen · Mallipohjainen analyysi — ei hankintaneuvontaa eikä paikkamitasta.",
    viewMethod: "Menetelmä →",
    viewMap: "Kartta →",
    viewProviders: "Toimittajat →",
    viewScenarios: "Skenaariot →",
    ctaTitle: "Luo Resilience Signature",
    ctaBody: "Aja sama malli omille koordinaateillesi. Ilmainen · Ei tiliä tarvita.",
    ctaBtn: "Luo Resilience Signature",
    back: "← Research Library",
  },
} as const;

function advisorHref(input: ResolvedResearchAssessment["input"]): string {
  const p = new URLSearchParams();
  if (input.lat != null) p.set("lat", String(input.lat));
  if (input.lng != null) p.set("lng", String(input.lng));
  if (input.sector) p.set("sector", input.sector);
  if (input.autonomy_level) p.set("autonomy", input.autonomy_level);
  if (input.operation_criticality) p.set("criticality", input.operation_criticality);
  return `/?${p.toString()}#advisor`;
}

export function ResearchAssessmentView({ data }: { data: ResolvedResearchAssessment }) {
  const [lang] = useLang();
  const t = UI[lang];
  const { entry, input, result } = data;
  const title = lang === "fi" ? entry.titleFi : entry.title;
  const subtitle = lang === "fi" ? entry.subtitleFi : entry.subtitle;
  const context = lang === "fi" ? entry.contextFi : entry.context;
  const location = lang === "fi" ? entry.locationLabelFi : entry.locationLabel;
  const sig = result.resilience_signature;
  const gc = gradeColor(sig.grade);
  const siteLabel = location;

  return (
    <article style={{ maxWidth: 800, margin: "0 auto", padding: "24px 32px 80px", paddingTop: 24 }}>
      <Breadcrumbs
        lang={lang}
        items={[
          { en: "Explore", fi: "Tutki" },
          { href: "/research", en: "Research Library", fi: "Research Library" },
          { en: title, fi: title },
        ]}
      />

      <Link
        href="/research"
        className="gryps-no-print"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 13,
          color: "var(--accent-blue)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        {t.back}
      </Link>

      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 8,
        }}
      >
        {t.eyebrow}
      </p>
      <div style={{ marginBottom: 10 }}>
        <TypeLabel kind="RESEARCH" />
      </div>
      <h1
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.02em",
          marginBottom: 8,
          lineHeight: 1.25,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 15,
          color: "var(--text-muted)",
          marginBottom: 12,
          lineHeight: 1.55,
        }}
      >
        {subtitle}
      </p>

      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 11,
          color: "var(--text-dim)",
          marginBottom: 20,
          letterSpacing: "0.04em",
        }}
      >
        {location}
        {" · "}
        {entry.vertical}
        {" · "}
        {SCORING_MODEL_LABEL}
      </p>

      <div
        style={{
          backgroundColor: "rgba(217,119,6,0.08)",
          border: "1px solid rgba(217,119,6,0.25)",
          borderRadius: 6,
          padding: "10px 14px",
          marginBottom: 24,
        }}
      >
        <TypeLabel kind="ILLUSTRATIVE" />
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 12,
            color: "var(--accent-amber)",
            lineHeight: 1.55,
          }}
        >
          {t.prototype}
        </p>
      </div>

      <section style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: "0.12em",
            marginBottom: 10,
          }}
        >
          {t.context}
        </p>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 15,
            color: "var(--text-muted)",
            lineHeight: 1.75,
          }}
        >
          {context}
        </p>
      </section>

      <nav
        className="gryps-no-print"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
        }}
        aria-label={lang === "fi" ? "Liittyvät sivut" : "Related pages"}
      >
        <Link
          href="/methodology"
          style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-blue)" }}
        >
          {t.viewMethod}
        </Link>
        <Link
          href="/map"
          style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-blue)" }}
        >
          {t.viewMap}
        </Link>
        <Link
          href="/providers"
          style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-blue)" }}
        >
          {t.viewProviders}
        </Link>
        <Link
          href="/scenarios"
          style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-blue)" }}
        >
          {t.viewScenarios}
        </Link>
      </nav>

      <ResilienceOutput result={result} input={input} lang={lang} siteLabel={siteLabel} />

      <div
        className="gryps-no-print"
        style={{
          borderTop: "1px solid var(--border)",
          marginTop: 48,
          paddingTop: 40,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 10,
          }}
        >
          {t.ctaTitle}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 24,
            maxWidth: 420,
            margin: "0 auto 24px",
          }}
        >
          {t.ctaBody}
        </p>
        <Link
          href={advisorHref(input)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: gc,
            color: "#070B12",
            fontFamily: "var(--font-ui)",
            fontWeight: 700,
            fontSize: 13,
            padding: "12px 24px",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          {t.ctaBtn} <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

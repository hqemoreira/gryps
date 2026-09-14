"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResilienceOutput } from "@/components/ResilienceOutput";
import { NextStepsLinks } from "@/components/NextStepsLinks";
import { gradeColor, gradeTextColor } from "@/lib/resilience-colors";
import type { ResolvedResearchAssessment } from "@/lib/research-library";
import { useLang } from "@/lib/use-lang";

const UI = {
  en: {
    eyebrow: "GRYPS RESEARCH LIBRARY",
    context: "Context",
    environment: "Operating environment",
    signature: "Resilience Signature",
    landscape: "Connectivity landscape",
    risks: "Key risks",
    redundancy: "Redundancy considerations",
    methodology: "Methodology & evidence",
    methodologyBody:
      "Each curated assessment follows the GRYPS evidence chain: operating environment → relevant research → connectivity characteristics → Model v0.3 scoring → provider recommendation. Score, grade, risks, and ranks are deterministic. Orbital-class notes are reference / model commentary — not measured site performance or a provider SLA. Confidence reflects assessment/data basis, not guaranteed service availability. Recommendations are indicative — not procurement advice.",
    prototype:
      "Research prototype · Non-commercial · Model-based analysis — not procurement advice or a site survey.",
    location: "Location",
    vertical: "Vertical",
    autonomy: "Autonomy",
    criticality: "Criticality",
    setup: "Current setup",
    viewMethod: "Full research methodology →",
    chainLabel: "Evidence chain",
    chainSteps: [
      "Operating environment",
      "Relevant research",
      "Connectivity characteristics",
      "GRYPS scoring factors",
      "Provider recommendation",
    ],
    ctaTitle: "Generate Resilience Signature",
    ctaBody: "Run the same model on your coordinates. Free · No account required.",
    ctaBtn: "Generate Resilience Signature",
    back: "← Research Library",
    model: "Model",
  },
  fi: {
    eyebrow: "GRYPS RESEARCH LIBRARY",
    context: "Konteksti",
    environment: "Toimintaympäristö",
    signature: "Resilience Signature",
    landscape: "Yhteysmaisema",
    risks: "Keskeiset riskit",
    redundancy: "Redundanssinäkökohdat",
    methodology: "Menetelmä ja näyttö",
    methodologyBody:
      "Jokainen kuratoitu arvio seuraa GRYPS-näyttöketjua: toimintaympäristö → relevantti tutkimus → yhteyden ominaisuudet → mallin v0.3 pisteytys → toimittajasuositus. Piste, arvosana, riskit ja sijoitukset ovat deterministisiä. Rataluokan huomiot ovat viite- / mallikommenttia — eivät mitattua kohdesuorituskykyä tai toimittajan SLA:ta. Luottamus kuvaa arvioinnin/dataperustan varmuutta, ei palvelun saatavuustakuuta. Suositukset ovat suuntaa-antavia — eivät hankintaneuvontaa.",
    prototype:
      "Tutkimusprototyyppi · Ei-kaupallinen · Mallipohjainen analyysi — ei hankintaneuvontaa eikä paikkamitasta.",
    location: "Sijainti",
    vertical: "Toimiala",
    autonomy: "Autonomia",
    criticality: "Kriittisyys",
    setup: "Nykyinen kokoonpano",
    viewMethod: "Täysi tutkimusmenetelmä →",
    chainLabel: "Näyttöketju",
    chainSteps: [
      "Toimintaympäristö",
      "Relevantti tutkimus",
      "Yhteyden ominaisuudet",
      "GRYPS-pisteytystekijät",
      "Toimittajasuositus",
    ],
    ctaTitle: "Luo Resilience Signature",
    ctaBody: "Aja sama malli omille koordinaateillesi. Ilmainen · Ei tiliä tarvita.",
    ctaBtn: "Luo Resilience Signature",
    back: "← Research Library",
    model: "Malli",
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
  const { entry, input, result, modelVersion } = data;
  const title = lang === "fi" ? entry.titleFi : entry.title;
  const subtitle = lang === "fi" ? entry.subtitleFi : entry.subtitle;
  const context = lang === "fi" ? entry.contextFi : entry.context;
  const location = lang === "fi" ? entry.locationLabelFi : entry.locationLabel;
  const sig = result.resilience_signature;
  const gc = gradeColor(sig.grade);
  const gtc = gradeTextColor(sig.grade);

  const section = (label: string, children: ReactNode) => (
    <section style={{ marginBottom: 36 }}>
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 12,
        }}
      >
        {label}
      </p>
      {children}
    </section>
  );

  return (
    <article style={{ maxWidth: 800, margin: "0 auto", padding: "24px 32px 80px", paddingTop: 24 }}>
      <Link
        href="/research"
        className="gryps-no-print"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 13,
          color: "var(--accent-blue)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 20,
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
          marginBottom: 20,
          lineHeight: 1.55,
        }}
      >
        {subtitle}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 14,
            fontWeight: 900,
            color: gtc,
            border: `1px solid ${gc}55`,
            borderRadius: 6,
            padding: "4px 12px",
          }}
        >
          {sig.grade} · {sig.score}/100
        </span>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)" }}>
          {t.model} {modelVersion}
        </span>
      </div>

      <div
        style={{
          backgroundColor: "rgba(217,119,6,0.08)",
          border: "1px solid rgba(217,119,6,0.25)",
          borderRadius: 6,
          padding: "10px 14px",
          marginBottom: 32,
        }}
      >
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

      {section(
        t.context,
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
      )}

      {section(
        t.environment,
        <dl style={{ display: "flex", flexDirection: "column", gap: 10, margin: 0 }}>
          {[
            [t.location, location],
            [t.vertical, entry.vertical],
            [t.autonomy, input.autonomy_level],
            [t.criticality, input.operation_criticality],
            [t.setup, input.current_setup ?? "—"],
          ].map(([label, value]) => (
            <div
              key={label as string}
              style={{ display: "flex", justifyContent: "space-between", gap: 16 }}
            >
              <dt
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  color: "var(--text-dim)",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </dt>
              <dd
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  color: "var(--text)",
                  textAlign: "right",
                  margin: 0,
                }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {section(t.signature, <ResilienceOutput result={result} input={input} />)}

      {section(
        t.methodology,
        <>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 9,
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            {t.chainLabel}
          </p>
          <ol
            style={{
              margin: "0 0 16px",
              paddingLeft: 18,
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.7,
            }}
          >
            {t.chainSteps.map((step) => (
              <li key={step} style={{ marginBottom: 4 }}>
                {step}
              </li>
            ))}
          </ol>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.7,
              marginBottom: 12,
            }}
          >
            {t.methodologyBody}
          </p>
          {result.evidence && (
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color: "var(--text)",
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              {result.evidence.environment_theme}
              {" · "}
              {lang === "fi" ? "Arviointiluottamus" : "Assessment confidence"}{" "}
              {result.evidence.confidence.band} ({result.evidence.confidence.score}%)
            </p>
          )}
          <Link
            href="/methodology"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--accent-blue)",
              textDecoration: "none",
            }}
          >
            {t.viewMethod}
          </Link>
          <div style={{ marginTop: 20 }}>
            <NextStepsLinks
              lang={lang}
              links={[
                { href: advisorHref(input), en: "Assess this site", fi: "Arvioi tämä kohde" },
                { href: "/map", en: "Explore Map", fi: "Tutki karttaa" },
                { href: "/providers", en: "Providers", fi: "Toimittajat" },
                { href: "/scenarios", en: "Scenarios", fi: "Skenaariot" },
                { href: "/knowledge", en: "Evidence", fi: "Näyttö" },
                { href: "/methodology", en: "Methodology", fi: "Menetelmä" },
              ]}
            />
          </div>
        </>
      )}

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

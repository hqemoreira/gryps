"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { grypsCopyright } from "@/lib/gryps-copyright";
import { useLang } from "@/lib/use-lang";
import { advisorHrefForScenario, type MissionScenario } from "@/lib/mission-scenarios";
import { NextStepsLinks } from "@/components/NextStepsLinks";

const UI = {
  en: {
    back: "← Mission scenarios",
    eyebrow: "GRYPS · RESEARCH SCENARIO",
    disclosure:
      "Research scenario · Non-commercial · Not a customer project. No CRM, quotations, or sales funnel — indicative decision-support analysis only.",
    environment: "Operating environment",
    requirements: "Mission requirements",
    challenges: "Connectivity challenges",
    technology: "Technology options",
    providers: "Provider considerations",
    architecture: "Architecture framing",
    relatedResearch: "Related Research Library",
    relatedKnowledge: "Related Evidence",
    methodology: "Research methodology →",
    ctaTitle: "Score a site in this scenario",
    ctaBody:
      "Prefill the Advisor with this scenario’s sector and suggested priorities. Free · No account required. Still research — not procurement.",
    ctaBtn: "Generate Resilience Signature",
    chainNote: "Environment → requirements → challenges → technology → providers",
  },
  fi: {
    back: "← Tehtäväskenaariot",
    eyebrow: "GRYPS · TUTKIMUSSKENAARIO",
    disclosure:
      "Tutkimusskenaario · Ei-kaupallinen · Ei asiakasprojekti. Ei CRM:ää, tarjouksia eikä myyntisuppiloa — vain suuntaa-antava päätöstukianalyysi.",
    environment: "Toimintaympäristö",
    requirements: "Tehtävän vaatimukset",
    challenges: "Yhteyden haasteet",
    technology: "Teknologiavaihtoehdot",
    providers: "Toimittajanäkökohdat",
    architecture: "Arkkitehtuurikehys",
    relatedResearch: "Liittyvä Research Library",
    relatedKnowledge: "Liittyvä näyttö",
    methodology: "Tutkimusmenetelmä →",
    ctaTitle: "Pisteytä kohde tässä skenaariossa",
    ctaBody:
      "Esitäytä Advisor tämän skenaarion toimialalla ja ehdotetuilla prioriteeteilla. Ilmainen · Ei tiliä tarvita. Yhä tutkimusta — ei hankintaa.",
    ctaBtn: "Luo Resilience Signature",
    chainNote: "Ympäristö → vaatimukset → haasteet → teknologia → toimittajat",
  },
} as const;

export function ScenarioDetailView({ scenario }: { scenario: MissionScenario }) {
  const [lang, setLang] = useLang();
  const t = UI[lang];
  const body = lang === "fi" ? scenario.fi : scenario.en;
  const title = lang === "fi" ? scenario.titleFi : scenario.title;
  const subtitle = lang === "fi" ? scenario.subtitleFi : scenario.subtitle;

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

  const bulletList = (items: string[]) => (
    <ul
      style={{
        margin: 0,
        paddingLeft: 18,
        fontFamily: "var(--font-ui)",
        fontSize: 15,
        color: "var(--text-muted)",
        lineHeight: 1.7,
      }}
    >
      {items.map((item) => (
        <li key={item.slice(0, 48)} style={{ marginBottom: 8 }}>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref={advisorHrefForScenario(scenario)}
        useIaNav
      />

      <article
        className="gryps-page-under-nav"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 80,
        }}
      >
        <Breadcrumbs
          lang={lang}
          items={[
            { en: "Explore", fi: "Tutki", href: "/scenarios" },
            { en: "Scenarios", fi: "Skenaariot", href: "/scenarios" },
            { en: scenario.title, fi: scenario.titleFi },
          ]}
        />
        <Link
          href="/scenarios"
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
            fontSize: 30,
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.02em",
            marginBottom: 10,
            lineHeight: 1.25,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 16,
            color: "var(--text-muted)",
            marginBottom: 16,
            lineHeight: 1.55,
          }}
        >
          {subtitle}
        </p>
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: "0.06em",
            marginBottom: 20,
          }}
        >
          {t.chainNote}
        </p>

        <div
          style={{
            backgroundColor: "rgba(217,119,6,0.08)",
            border: "1px solid rgba(217,119,6,0.25)",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 36,
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
            {t.disclosure}
          </p>
        </div>

        {section(
          t.environment,
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 15,
              color: "var(--text-muted)",
              lineHeight: 1.75,
            }}
          >
            {body.environment}
          </p>
        )}

        {section(t.requirements, bulletList(body.requirements))}
        {section(t.challenges, bulletList(body.challenges))}
        {section(t.technology, bulletList(body.technology))}
        {section(t.providers, bulletList(body.providers))}

        {section(
          t.architecture,
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 15,
              color: "var(--text)",
              lineHeight: 1.75,
              padding: "14px 16px",
              backgroundColor: "rgba(79,168,255,0.06)",
              border: "1px solid rgba(79,168,255,0.2)",
              borderRadius: 8,
            }}
          >
            {body.architecture}
          </p>
        )}

        {(scenario.relatedResearchSlugs.length > 0 ||
          scenario.relatedKnowledgeSlugs.length > 0) && (
          <section style={{ marginBottom: 36 }}>
            {scenario.relatedResearchSlugs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 10,
                    color: "var(--text-dim)",
                    letterSpacing: "0.12em",
                    marginBottom: 10,
                  }}
                >
                  {t.relatedResearch}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {scenario.relatedResearchSlugs.map((slug) => (
                    <Link
                      key={slug}
                      href={`/research/${slug}`}
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: 11,
                        color: "var(--accent-blue)",
                        border: "1px solid rgba(79,168,255,0.25)",
                        borderRadius: 4,
                        padding: "5px 10px",
                        textDecoration: "none",
                      }}
                    >
                      {slug}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {scenario.relatedKnowledgeSlugs.length > 0 && (
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 10,
                    color: "var(--text-dim)",
                    letterSpacing: "0.12em",
                    marginBottom: 10,
                  }}
                >
                  {t.relatedKnowledge}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {scenario.relatedKnowledgeSlugs.map((slug) => (
                    <Link
                      key={slug}
                      href={`/knowledge/${slug}`}
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: 11,
                        color: "var(--accent-blue)",
                        border: "1px solid rgba(79,168,255,0.25)",
                        borderRadius: 4,
                        padding: "5px 10px",
                        textDecoration: "none",
                      }}
                    >
                      {slug}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <p style={{ marginBottom: 24 }}>
          <Link
            href="/methodology"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--accent-blue)",
              textDecoration: "none",
            }}
          >
            {t.methodology}
          </Link>
        </p>

        <NextStepsLinks
          lang={lang}
          links={[
            {
              href: advisorHrefForScenario(scenario),
              en: "Assess this scenario",
              fi: "Arvioi tämä skenaario",
            },
            { href: "/map", en: "Explore Map", fi: "Tutki karttaa" },
            { href: "/providers", en: "Providers", fi: "Toimittajat" },
            { href: "/knowledge", en: "Evidence", fi: "Näyttö" },
            { href: "/methodology", en: "Methodology", fi: "Menetelmä" },
          ]}
        />

        <div
          className="gryps-no-print"
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 40,
            marginTop: 32,
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
              maxWidth: 440,
              margin: "0 auto 24px",
              lineHeight: 1.55,
            }}
          >
            {t.ctaBody}
          </p>
          <Link
            href={advisorHrefForScenario(scenario)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--cta-gradient)",
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

      <Footer
        lang={lang}
        footerRights={grypsCopyright(
          lang,
          lang === "en" ? "Non-commercial R&D prototype" : "Ei-kaupallinen T&K-prototyyppi"
        )}
      />
    </div>
  );
}

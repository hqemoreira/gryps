"use client";
import type { CSSProperties } from "react";
import Link from "next/link";
import { DocShell, type DocLang } from "@/components/DocShell";
import { ResearchDocsNav } from "@/components/ResearchDocsNav";
import { METHODOLOGY_VERSION } from "@/lib/model-constants";
import {
  PROTOTYPE_RESULTS_DISCLAIMER_EN,
  PROTOTYPE_RESULTS_DISCLAIMER_FI,
} from "@/lib/research-docs";
import { DEVELOPMENT_CAPABILITIES, RESEARCH_AREAS } from "@/lib/research-prototype";

const COPY = {
  en: {
    eyebrow: `GRYPS · RESEARCH & PROTOTYPE · Methodology ${METHODOLOGY_VERSION}`,
    h1: "Research & Prototype",
    intro:
      "GRYPS is an experimental research prototype exploring how geographic, operational, and connectivity data can be combined into a structured decision-support framework for remote connectivity scenarios.",
    phase:
      "The project is currently developed for research and prototyping purposes. Commercialization and monetization are outside the current scope.",
    results: PROTOTYPE_RESULTS_DISCLAIMER_EN,
    areasH2: "Current research areas",
    roadmapH2: "Development roadmap",
    roadmapIntro:
      "Research and prototype milestones developed through the current GRYPS capability surface — not a commercial product roadmap.",
    linksH2: "Related",
    methodology: "Methodology & evidence →",
    limitations: "Limitations →",
    dataSources: "Data sources →",
    caseStudy: "Case study →",
    advisor: "Generate Resilience Signature →",
  },
  fi: {
    eyebrow: `GRYPS · TUTKIMUS JA PROTOTYYPPI · Menetelmä ${METHODOLOGY_VERSION}`,
    h1: "Tutkimus ja prototyyppi",
    intro:
      "GRYPS on kokeellinen tutkimusprototyyppi, joka tutkii, miten maantieteellinen, toiminnallinen ja yhteysdata voidaan yhdistää rakenteiseksi päätöstukikehykseksi etäisten yhteyksien skenaarioihin.",
    phase:
      "Hanketta kehitetään tällä hetkellä tutkimusta ja prototypointia varten. Kaupallistaminen ja monetisaatio eivät kuulu nykyiseen laajuuteen.",
    results: PROTOTYPE_RESULTS_DISCLAIMER_FI,
    areasH2: "Nykyiset tutkimusalueet",
    roadmapH2: "Kehitysroadmap",
    roadmapIntro:
      "Tutkimus- ja prototyyppivaiheet, jotka on kehitetty nykyisen GRYPS-kyvykkyyspinnan kautta — ei kaupallinen tuote-roadmap.",
    linksH2: "Aiheeseen liittyvää",
    methodology: "Menetelmä ja näyttö →",
    limitations: "Rajoitteet →",
    dataSources: "Datalähteet →",
    caseStudy: "Case study →",
    advisor: "Luo Resilience Signature →",
  },
} as const;

function Article({ lang }: { lang: DocLang }) {
  const t = COPY[lang];
  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
      <ResearchDocsNav lang={lang} active="research-prototype" />
      <p style={eyebrow}>{t.eyebrow}</p>
      <h1 style={h1}>{t.h1}</h1>
      <p style={lead}>{t.intro}</p>
      <p style={p}>{t.phase}</p>
      <p style={{ ...p, marginBottom: 28 }}>{t.results}</p>

      <h2 style={h2}>{t.areasH2}</h2>
      <ul style={ul}>
        {RESEARCH_AREAS.map((area) => (
          <li key={area.en} style={{ marginBottom: 10 }}>
            {area.href ? (
              <Link href={area.href} style={{ color: "var(--accent-blue)" }}>
                {lang === "fi" ? area.fi : area.en}
              </Link>
            ) : lang === "fi" ? (
              area.fi
            ) : (
              area.en
            )}
          </li>
        ))}
      </ul>

      <h2 style={h2}>{t.roadmapH2}</h2>
      <p style={p}>{t.roadmapIntro}</p>
      <ol style={{ ...ul, listStyle: "decimal", paddingLeft: 22 }}>
        {DEVELOPMENT_CAPABILITIES.map((item) => (
          <li key={item.id} style={{ marginBottom: 10 }}>
            {item.href ? (
              <Link href={item.href} style={{ color: "var(--accent-blue)" }}>
                {lang === "fi" ? item.fi : item.en}
              </Link>
            ) : lang === "fi" ? (
              item.fi
            ) : (
              item.en
            )}
          </li>
        ))}
      </ol>

      <h2 style={h2}>{t.linksH2}</h2>
      <ul style={{ ...ul, listStyle: "none", paddingLeft: 0 }}>
        <li style={{ marginBottom: 8 }}>
          <Link href="/methodology" style={{ color: "var(--accent-blue)" }}>
            {t.methodology}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/data-sources" style={{ color: "var(--accent-blue)" }}>
            {t.dataSources}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/limitations" style={{ color: "var(--accent-blue)" }}>
            {t.limitations}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/case-study" style={{ color: "var(--accent-blue)" }}>
            {t.caseStudy}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>
            {t.advisor}
          </Link>
        </li>
      </ul>
    </article>
  );
}

export function ResearchPrototypeView() {
  return <DocShell>{(lang) => <Article lang={lang} />}</DocShell>;
}

const eyebrow: CSSProperties = {
  fontFamily: "var(--font-data)",
  fontSize: 10,
  color: "var(--text-dim)",
  letterSpacing: "0.12em",
};
const h1: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 36,
  fontWeight: 700,
  color: "var(--text)",
  letterSpacing: "-0.02em",
  margin: "16px 0 20px",
};
const lead: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 16,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  marginBottom: 14,
  maxWidth: 640,
};
const h2: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text)",
  margin: "32px 0 12px",
};
const p: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  marginBottom: 12,
  maxWidth: 640,
};
const ul: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  paddingLeft: 20,
  marginBottom: 12,
};

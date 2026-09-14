"use client";
import Link from "next/link";
import { DocShell, type DocLang } from "@/components/DocShell";
import { KNOWLEDGE_ARTICLES, getKnowledgeLocale } from "@/lib/knowledge-articles";

const UI = {
  en: {
    eyebrow: "GRYPS · EVIDENCE",
    h1: "Connectivity intelligence notes",
    intro:
      "Short, citeable explainers for remote Nordic and Arctic satellite connectivity — written for humans and answer engines. Modeled intelligence · not live RF. Each note deep-links to methodology, Explore Connectivity Intelligence, and Generate Resilience Signature.",
    phase2: "Evidence",
    phase3: "Discovery",
    updated: "Updated",
  },
  fi: {
    eyebrow: "GRYPS · NÄYTTÖ",
    h1: "Yhteysälyn muistiinpanot",
    intro:
      "Lyhyitä, siteerattavia selityksiä pohjoismaisista ja arktisista satelliittiyhteyksistä — ihmisille ja vastausmoottoreille. Mallinnettua älyä · ei reaaliaikaista RF:ää. Jokainen muistiinpano linkittää menetelmään, Connectivity Intelligence -karttaan ja Resilience Signature -luontiin.",
    phase2: "Näyttö",
    phase3: "Löydettävyys",
    updated: "Päivitetty",
  },
} as const;

function KnowledgeIndexArticle({ lang }: { lang: DocLang }) {
  const t = UI[lang];
  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
        }}
      >
        {t.eyebrow}
      </p>
      <h1
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 36,
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.02em",
          margin: "16px 0 20px",
        }}
      >
        {t.h1}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 16,
          color: "var(--text-muted)",
          lineHeight: 1.75,
          marginBottom: 32,
        }}
      >
        {t.intro}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {KNOWLEDGE_ARTICLES.map((article) => {
          const loc = getKnowledgeLocale(article, lang);
          const phaseLabel = article.phase === "3-discovery" ? t.phase3 : t.phase2;
          return (
            <li
              key={article.slug}
              style={{
                marginBottom: 22,
                paddingBottom: 22,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  color: "var(--text-dim)",
                  letterSpacing: "0.08em",
                  margin: "0 0 6px",
                }}
              >
                {phaseLabel} · {t.updated} {article.updated}
              </p>
              <Link
                href={`/knowledge/${article.slug}`}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "var(--text)",
                  textDecoration: "none",
                  letterSpacing: "-0.02em",
                }}
              >
                {loc.h1}
              </Link>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  margin: "8px 0 0",
                }}
              >
                {loc.shortAnswer.slice(0, 160)}…
              </p>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export function KnowledgeIndexView() {
  return <DocShell>{(lang) => <KnowledgeIndexArticle lang={lang} />}</DocShell>;
}

"use client"
import Link from "next/link"
import { DocShell, type DocLang } from "@/components/DocShell"
import {
  type KnowledgeArticle,
  getKnowledgeLocale,
  KNOWLEDGE_ARTICLES,
} from "@/lib/knowledge-articles"

const UI = {
  en: {
    eyebrow: "GRYPS · KNOWLEDGE",
    related: "Related notes",
    index: "All knowledge notes",
    methodology: "Scoring methodology",
    map: "Explore Connectivity Intelligence",
    advisor: "Generate Resilience Signature",
    providers: "Provider index",
    updated: "Updated",
  },
  fi: {
    eyebrow: "GRYPS · TIETOSISÄLTÖ",
    related: "Aiheeseen liittyvät",
    index: "Kaikki tietomuistiinpanot",
    methodology: "Pisteytysmenetelmä",
    map: "Tutki Connectivity Intelligencea",
    advisor: "Luo Resilience Signature",
    providers: "Toimittajahakemisto",
    updated: "Päivitetty",
  },
} as const

const h2 = {
  fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "28px 0 10px",
} as const
const p = {
  fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 12,
} as const
const ul = {
  fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, paddingLeft: 20, marginBottom: 12,
} as const

function KnowledgeArticleBody({ article, lang }: { article: KnowledgeArticle; lang: DocLang }) {
  const t = getKnowledgeLocale(article, lang)
  const ui = UI[lang]
  const related = KNOWLEDGE_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3)

  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>
        {ui.eyebrow} · {ui.updated} {article.updated}
      </p>
      <h1 style={{ fontFamily: "var(--font-ui)", fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: "16px 0 12px" }}>
        {t.h1}
      </h1>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-dim)", fontStyle: "italic", lineHeight: 1.55, marginBottom: 16 }}>
        {t.question}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 8 }}>
        {t.shortAnswer}
      </p>

      {t.sections.map((section) => (
        <section key={section.h2}>
          <h2 style={h2}>{section.h2}</h2>
          <p style={p}>{section.body}</p>
        </section>
      ))}

      <h2 style={h2}>{t.limitationsH2}</h2>
      <ul style={ul}>
        {t.limitations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 style={h2}>{t.ctaH2}</h2>
      <p style={p}>{t.ctaBody}</p>
      <p style={{ ...p, marginTop: 8 }}>
        <Link href="/map" style={{ color: "var(--accent-blue)" }}>{ui.map}</Link>
        {" · "}
        <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>{ui.advisor}</Link>
        {" · "}
        <Link href="/methodology" style={{ color: "var(--accent-blue)" }}>{ui.methodology}</Link>
        {" · "}
        <Link href="/providers" style={{ color: "var(--accent-blue)" }}>{ui.providers}</Link>
      </p>

      <h2 style={h2}>{ui.related}</h2>
      <ul style={{ ...ul, listStyle: "none", paddingLeft: 0 }}>
        {related.map((a) => (
          <li key={a.slug} style={{ marginBottom: 8 }}>
            <Link href={`/knowledge/${a.slug}`} style={{ color: "var(--accent-blue)" }}>
              {getKnowledgeLocale(a, lang).h1}
            </Link>
          </li>
        ))}
        <li style={{ marginTop: 12 }}>
          <Link href="/knowledge" style={{ color: "var(--accent-blue)" }}>{ui.index}</Link>
        </li>
      </ul>
    </article>
  )
}

export function KnowledgeArticleView({ article }: { article: KnowledgeArticle }) {
  return (
    <DocShell>
      {(lang) => <KnowledgeArticleBody article={article} lang={lang} />}
    </DocShell>
  )
}

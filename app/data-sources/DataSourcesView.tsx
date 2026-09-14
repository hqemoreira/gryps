"use client";
import type { CSSProperties } from "react";
import Link from "next/link";
import { DocShell, type DocLang } from "@/components/DocShell";
import { PrototypeDisclaimerBanner, ResearchDocsNav } from "@/components/ResearchDocsNav";
import { DATA_PROVENANCE, METHODOLOGY_LABEL } from "@/lib/research-docs";

const COPY = {
  en: {
    eyebrow: `GRYPS · DATA SOURCES · ${METHODOLOGY_LABEL}`,
    h1: "Data sources & provenance",
    intro:
      "Important inputs used by GRYPS, with source, date accessed, data type, and how the prototype uses each record. Provenance makes assessments reproducible and credible.",
    source: "Source",
    date: "Date accessed",
    type: "Data type",
    how: "How GRYPS uses it",
    license: "License / terms",
  },
  fi: {
    eyebrow: `GRYPS · DATALÄHTEET · ${METHODOLOGY_LABEL}`,
    h1: "Datalähteet ja alkuperä",
    intro:
      "GRYPS:n tärkeät syötteet — lähde, käyttöönottopäivä, datatyyppi ja miten prototyyppi käyttää kutakin. Alkuperätieto tekee arvioista toistettavia ja uskottavia.",
    source: "Lähde",
    date: "Käyttöönottopäivä",
    type: "Datatyyppi",
    how: "Miten GRYPS käyttää",
    license: "Lisenssi / ehdot",
  },
} as const;

function Article({ lang }: { lang: DocLang }) {
  const t = COPY[lang];
  return (
    <article style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 0" }}>
      <ResearchDocsNav lang={lang} active="data-sources" />
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
      <h1 style={h1}>{t.h1}</h1>
      <p style={lead}>{t.intro}</p>
      <PrototypeDisclaimerBanner lang={lang} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {DATA_PROVENANCE.map((row) => (
          <section
            key={row.id}
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "18px 20px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 12,
              }}
            >
              {lang === "fi" ? row.nameFi : row.name}
            </h2>
            <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <Field
                label={t.source}
                value={lang === "fi" ? row.sourceFi : row.source}
                href={row.url}
              />
              <Field label={t.date} value={row.dateAccessed} />
              <Field label={t.type} value={lang === "fi" ? row.dataTypeFi : row.dataType} />
              <Field label={t.how} value={lang === "fi" ? row.howUsedFi : row.howUsed} />
              {row.license && <Field label={t.license} value={row.license} />}
            </dl>
          </section>
        ))}
      </div>
    </article>
  );
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {value}
        {href && (
          <>
            {" "}
            <Link href={href} style={{ color: "var(--accent-blue)", whiteSpace: "nowrap" }}>
              →
            </Link>
          </>
        )}
      </dd>
    </div>
  );
}

export function DataSourcesView() {
  return <DocShell>{(lang) => <Article lang={lang} />}</DocShell>;
}

const h1: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 34,
  fontWeight: 700,
  color: "var(--text)",
  letterSpacing: "-0.02em",
  margin: "12px 0 16px",
  maxWidth: 720,
};
const lead: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 16,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  marginBottom: 8,
  maxWidth: 720,
};

"use client";
import Link from "next/link";
import type { ResearchDocId } from "@/lib/research-docs";
import {
  RESEARCH_DOC_NAV,
  METHODOLOGY_LABEL,
  PROTOTYPE_DISCLAIMER_EN,
  PROTOTYPE_DISCLAIMER_FI,
} from "@/lib/research-docs";
import type { DocLang } from "@/components/DocShell";

export function ResearchDocsNav({ lang, active }: { lang: DocLang; active: ResearchDocId }) {
  return (
    <nav
      aria-label={lang === "fi" ? "Tutkimusdokumentaatio" : "Research documentation"}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 28,
        paddingBottom: 16,
        borderBottom: "1px solid var(--border)",
        maxWidth: "100%",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          alignSelf: "center",
          marginRight: 4,
          flex: "1 1 100%",
        }}
      >
        {METHODOLOGY_LABEL}
      </span>
      {RESEARCH_DOC_NAV.map((item) => {
        const on = item.id === active;
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: on ? 700 : 500,
              color: on ? "var(--text)" : "var(--text-muted)",
              backgroundColor: on ? "var(--surface2)" : "transparent",
              border: `1px solid ${on ? "var(--border2)" : "var(--border)"}`,
              borderRadius: 6,
              padding: "6px 10px",
              textDecoration: "none",
            }}
          >
            {lang === "fi" ? item.fi : item.en}
          </Link>
        );
      })}
    </nav>
  );
}

export function PrototypeDisclaimerBanner({ lang }: { lang: DocLang }) {
  const text = lang === "fi" ? PROTOTYPE_DISCLAIMER_FI : PROTOTYPE_DISCLAIMER_EN;

  return (
    <div
      style={{
        backgroundColor: "rgba(217,119,6,0.08)",
        border: "1px solid rgba(217,119,6,0.25)",
        borderRadius: 6,
        padding: "12px 14px",
        marginBottom: 28,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 13,
          color: "var(--accent-amber)",
          lineHeight: 1.6,
        }}
      >
        {text}
      </p>
    </div>
  );
}

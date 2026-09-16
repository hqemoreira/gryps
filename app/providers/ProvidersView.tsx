"use client";
import Link from "next/link";
import { DocShell, type DocLang } from "@/components/DocShell";
import { INDEXED_PROVIDERS, PROVIDER_INDEX_COUNT } from "@/lib/providers";

const COVERAGE_LABEL: Record<DocLang, Record<string, string>> = {
  en: {
    full: "70°N+ claimed",
    improving: "70°N+ improving",
    limited: "70°N+ limited",
    planned: "Planned",
    unsuitable: "Unsuitable as polar primary",
  },
  fi: {
    full: "70°N+ ilmoitettu",
    improving: "70°N+ paranemassa",
    limited: "70°N+ rajallinen",
    planned: "Suunnitteilla",
    unsuitable: "Ei sovellu napaseudun pääyhteydeksi",
  },
};

const COPY = {
  en: {
    eyebrow: `GRYPS · PROVIDER INDEX · ${PROVIDER_INDEX_COUNT} OPERATORS`,
    h1: "Operators referenced in ranking",
    intro:
      "This is a curated list of publicly known satellite operators — not a live coverage map, SLA, or partnership. GRYPS has no commercial relationship with any provider listed. Coverage notes are physics and published orbit class, not measured pass data.",
    headers: ["Provider", "Orbit", "Class", "70°N+", "Note"] as const,
    methodologyLink: "Scoring methodology",
    advisorLink: "Generate Resilience Signature",
  },
  fi: {
    eyebrow: `GRYPS · TOIMITTAJAHAKEMISTO · ${PROVIDER_INDEX_COUNT} OPERAATTORIA`,
    h1: "Suosituksissa viitatut operaattorit",
    intro:
      "Tämä on kuratoitu lista julkisesti tunnetuista satelliittioperaattoreista — ei reaaliaikainen kattavuuskartta, SLA eikä kumppanuus. GRYPS:llä ei ole kaupallista suhdetta listattuihin toimittajiin. Kattavuusmerkinnät perustuvat fysiikkaan ja julkaistuun rataluokkaan, ei mitattuun ohitusdataan.",
    headers: ["Toimittaja", "Rata", "Luokka", "70°N+", "Huomio"] as const,
    methodologyLink: "Pisteytysmenetelmä",
    advisorLink: "Luo Resilience Signature",
  },
} as const;

function ProvidersArticle({ lang }: { lang: DocLang }) {
  const t = COPY[lang];
  const coverage = COVERAGE_LABEL[lang];
  return (
    <article style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px 0" }}>
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
        className="gryps-hero-sub"
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

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-ui)",
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              {t.headers.map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-dim)",
                    fontFamily: "var(--font-data)",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INDEXED_PROVIDERS.map((p) => (
              <tr key={p.name}>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text)",
                    fontWeight: 600,
                  }}
                >
                  {p.name}
                  <div
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 10,
                      color: "var(--text-dim)",
                      fontWeight: 400,
                    }}
                  >
                    {p.operator} · {p.status}
                  </div>
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  {p.orbit}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  {p.class}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  {coverage[p.coverage70N] ?? p.coverage70N}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {p.coverageNote}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.75,
          marginTop: 28,
        }}
      >
        <Link href="/methodology" style={{ color: "var(--accent-blue)" }}>
          {t.methodologyLink}
        </Link>
        {" · "}
        <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>
          {t.advisorLink}
        </Link>
        {" · "}
        <Link href="/map" style={{ color: "var(--accent-blue)" }}>
          {lang === "fi" ? "Kartta" : "Map"}
        </Link>
        {" · "}
        <Link href="/research" style={{ color: "var(--accent-blue)" }}>
          {lang === "fi" ? "Research Library" : "Research Library"}
        </Link>
        {" · "}
        <Link href="/scenarios" style={{ color: "var(--accent-blue)" }}>
          {lang === "fi" ? "Skenaariot" : "Scenarios"}
        </Link>
        {" · "}
        <Link href="/knowledge" style={{ color: "var(--accent-blue)" }}>
          {lang === "fi" ? "Näyttö" : "Evidence"}
        </Link>
      </p>
    </article>
  );
}

export function ProvidersView() {
  return <DocShell>{(lang) => <ProvidersArticle lang={lang} />}</DocShell>;
}

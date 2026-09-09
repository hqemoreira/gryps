"use client"
import { useState } from "react"
import Link from "next/link"
import { ContactForm } from "@/components/ContactForm"

const COPY = {
  en: {
    mark: "GRYPS",
    title: "Terms",
    intro:
      "This is a non-commercial R&D prototype maintained by Henrique Moreira (Espoo, Finland) for demonstration and learning purposes only. No registered company, no revenue, no commercial activity.",
    bullets: [
      "No registered company. No revenue. No commercial activity.",
      "No warranties. Content and demo Resilience Signature outputs are provided as-is for informational and learning purposes.",
      "This R&D prototype is not sold or offered as a commercial service.",
      "The advisor is not a site survey, not live satellite coverage, and not insurance or legal advice.",
      "Use the contact form below to reach the maintainer.",
    ],
    privacyLink: "Privacy →",
    backLink: "← Back to GRYPS",
  },
  fi: {
    mark: "GRYPS",
    title: "Ehdot",
    intro:
      "Tämä on ei-kaupallinen T&K-prototyyppi, jota ylläpitää Henrique Moreira (Espoo, Suomi) vain demonstraatio- ja oppimistarkoituksiin. Ei rekisteröityä yritystä, ei tuloja, ei kaupallista toimintaa.",
    bullets: [
      "Ei rekisteröityä yritystä. Ei tuloja. Ei kaupallista toimintaa.",
      "Ei takuita. Sisältö ja demo-Resilience Signature -tulosteet tarjotaan sellaisenaan tiedotus- ja oppimistarkoituksiin.",
      "Tätä T&K-prototyyppiä ei myydä eikä tarjota kaupallisena palveluna.",
      "Advisor ei ole kenttämittaus, reaaliaikainen satelliittikattavuus eikä vakuutus tai oikeudellinen neuvonta.",
      "Käytä alla olevaa yhteydenottolomaketta tavoittaaksesi ylläpitäjän.",
    ],
    privacyLink: "Tietosuoja →",
    backLink: "← Takaisin GRYPS:iin",
  },
}

export default function TermsPage() {
  const [lang, setLang] = useState<"en" | "fi">("en")
  const t = COPY[lang]

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 32px 0" }}>
      <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
            {t.mark}
          </p>
          <div style={{ display: "flex", border: "1px solid var(--border2)", borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
            {(["en", "fi"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? "var(--border2)" : "transparent",
                border: "none", padding: "5px 10px", cursor: "pointer",
                fontFamily: "var(--font-data)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.08em",
                color: lang === l ? "var(--text)" : "var(--text-muted)",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <h1 style={{
          fontFamily: "var(--font-ui)", fontSize: 36, fontWeight: 700,
          color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 20,
        }}>{t.title}</h1>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75 }}>
          {t.intro}
        </p>
      </div>

      <ul style={{
        listStyle: "none", margin: 0, padding: 0,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {t.bullets.map((item, i) => (
          <li key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75,
          }}>
            <span style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: 1 }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <ContactForm lang={lang} />

      <div style={{
        marginTop: 64, padding: "24px 0",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/privacy" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "var(--accent-blue)", textDecoration: "none",
        }}>
          {t.privacyLink}
        </Link>
        <Link href="/" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "var(--text-muted)", textDecoration: "none",
        }}>
          {t.backLink}
        </Link>
      </div>
    </div>
  )
}

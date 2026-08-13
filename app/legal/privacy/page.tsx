"use client"
import { useState } from "react"
import Link from "next/link"

const COPY = {
  en: {
    eyebrow: "Legal",
    title: "Privacy",
    intro:
      "This prototype does not collect personal data beyond what you voluntarily enter to generate a demonstration output.",
    bullets: [
      "No analytics cookies. No marketing tracking.",
      "Coordinates and site details you enter are processed via the Mistral AI API (EU-based provider) and Vercel hosting solely to produce the demonstration Resilience Signature.",
      "If you optionally enter an email, it may be stored with the demonstration submission in Neon Postgres (EU) so a report copy can be sent and for prototype operations. It is not used for marketing lists or sale.",
      "Demonstration submissions may be retained for learning/debugging of this personal prototype; email hqe.moreira@gmail.com to request deletion.",
      "No data is sold or used to train AI models.",
    ],
    closing: "This is a non-commercial demonstration.",
    termsLink: "← Terms",
    backLink: "Back to GRYPS →",
  },
  fi: {
    eyebrow: "Legal",
    title: "Tietosuoja",
    intro:
      "Tämä prototyyppi ei kerää henkilötietoja sen lisäksi, mitä syötät vapaaehtoisesti demonstraatiotuloksen tuottamiseksi.",
    bullets: [
      "Ei analytiikkaevästeitä. Ei markkinointiseurantaa.",
      "Syöttämäsi koordinaatit ja kohdetiedot käsitellään Mistral AI API:n (EU-pohjainen toimittaja) ja Vercel-hostingin kautta ainoastaan demonstraatio-Resilience Signaturen tuottamiseksi.",
      "Jos syötät valinnaisesti sähköpostin, se voidaan tallentaa demonstraatiolähetyksen kanssa Neon Postgresiin (EU), jotta raporttikopio voidaan lähettää ja prototyyppiä voidaan operoida. Sitä ei käytetä markkinointilistoihin eikä myyntiin.",
      "Demonstraatiolähetyksiä voidaan säilyttää tämän henkilökohtaisen prototyypin oppimista/virheenkorjausta varten; pyydä poistoa sähköpostitse: hqe.moreira@gmail.com.",
      "Tietoja ei myydä eikä käytetä tekoälymallien kouluttamiseen.",
    ],
    closing: "Tämä on ei-kaupallinen demonstraatio.",
    termsLink: "← Ehdot",
    backLink: "Takaisin GRYPS:iin →",
  },
}

export default function PrivacyPage() {
  const [lang, setLang] = useState<"en" | "fi">("en")
  const t = COPY[lang]

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 32px 0" }}>
      <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>
            GRYPS · {t.eyebrow.toUpperCase()}
          </p>
          <div style={{ display: "flex", border: "1px solid var(--border2)", borderRadius: 6, overflow: "hidden" }}>
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

      <p style={{
        fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text)",
        lineHeight: 1.75, marginTop: 32, fontWeight: 600,
      }}>
        {t.closing}
      </p>

      <div style={{
        marginTop: 64, padding: "24px 0",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/legal/terms" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "var(--accent-blue)", textDecoration: "none",
        }}>
          {t.termsLink}
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

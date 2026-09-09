"use client"
import Link from "next/link"
import { useLang } from "@/lib/use-lang"

const COPY = {
  en: {
    mark: "GRYPS",
    title: "Privacy",
    intro:
      "This non-commercial R&D prototype processes only what you voluntarily enter to generate a demonstration Resilience Signature. It is not a commercial service.",
    controllerH: "Controller",
    controllerBody:
      "Henrique Moreira, Espoo, Finland. Contact: hello@gryps.eu or the contact form on the Terms page.",
    whatH: "What we process",
    whatItems: [
      "Site coordinates, operational sector, autonomy, criticality, and selected connectivity providers — to compute a Signature.",
      "Optional email — only if you enter it, stored with that demo submission so a report copy can be sent, or for a one-time “notify me when live monitoring launches” request.",
      "Technical hosting logs from Vercel (request metadata) as needed to operate the site.",
    ],
    basisH: "Why we process it",
    basisBody:
      "You choose to run a demo assessment. Processing is limited to producing and optionally sharing that research-prototype output, and to operate/debug the prototype. There is no marketing list and no sale of data.",
    processorsH: "Processors",
    processorsItems: [
      "Vercel — hosting (EU/US edge as configured by the platform).",
      "Neon Postgres (EU) — optional storage of demo submissions and emails you provide.",
      "Mistral AI (EU-hosted API) — optional recommendation prose only; it never changes the deterministic score, grade, risks, or ranked providers.",
    ],
    retentionH: "Retention",
    retentionBody:
      "Demo submissions may be retained for learning and debugging of this R&D prototype. You can request deletion via the Terms contact form or hello@gryps.eu.",
    rightsH: "Your rights",
    rightsItems: [
      "Request access to or deletion of personal data you submitted (email and related submission).",
      "Withdraw optional email consent by asking us to delete it.",
      "No analytics cookies and no marketing tracking on this prototype.",
    ],
    closing: "No data is sold or used to train third-party AI models. This page describes the prototype’s practice in plain language — not formal legal advice.",
    termsLink: "← Terms",
    aboutLink: "About →",
    backLink: "Back to GRYPS →",
  },
  fi: {
    mark: "GRYPS",
    title: "Tietosuoja",
    intro:
      "Tämä ei-kaupallinen T&K-prototyyppi käsittelee vain sen, mitä syötät vapaaehtoisesti demonstraatio-Resilience Signaturen tuottamiseksi. Se ei ole kaupallinen palvelu.",
    controllerH: "Rekisterinpitäjä",
    controllerBody:
      "Henrique Moreira, Espoo, Suomi. Yhteystieto: hello@gryps.eu tai Ehdot-sivun yhteydenottolomake.",
    whatH: "Mitä käsittelemme",
    whatItems: [
      "Kohteen koordinaatit, toimiala, autonomia, kriittisyys ja valitut yhteystoimittajat — Signaturen laskentaa varten.",
      "Valinnainen sähköposti — vain jos syötät sen; tallennetaan kyseisen demolähetyksen kanssa raporttikopiota varten tai kertaluonteista \"ilmoita, kun reaaliaikainen seuranta käynnistyy\" -pyyntöä varten.",
      "Vercelin tekniset hosting-lokit (pyyntömetadata) sivuston ylläpitoon tarpeen mukaan.",
    ],
    basisH: "Miksi käsittelemme",
    basisBody:
      "Valitset itse demoarvioinnin. Käsittely rajautuu kyseisen tutkimusprototyyppitulosteen tuottamiseen ja mahdolliseen jakamiseen sekä prototyypin ylläpitoon ja virheenkorjaukseen. Ei markkinointilistaa eikä tietojen myyntiä.",
    processorsH: "Käsittelijät",
    processorsItems: [
      "Vercel — hosting (EU/US-edge alustan konfiguraation mukaan).",
      "Neon Postgres (EU) — valinnainen demolähetysten ja antamiesi sähköpostien tallennus.",
      "Mistral AI (EU-hostattu API) — vain valinnainen suositusproosa; se ei koskaan muuta determinististä pistettä, arvosanaa, riskejä tai toimittajasuosituksia.",
    ],
    retentionH: "Säilytys",
    retentionBody:
      "Demolähetyksiä voidaan säilyttää tämän T&K-prototyypin oppimista ja virheenkorjausta varten. Voit pyytää poistoa Ehdot-sivun lomakkeella tai osoitteesta hello@gryps.eu.",
    rightsH: "Oikeutesi",
    rightsItems: [
      "Pyytää pääsyä lähettämääsi henkilötietoon tai sen poistoa (sähköposti ja siihen liittyvä lähetys).",
      "Peruuttaa valinnainen sähköpostisuostumus pyytämällä poistoa.",
      "Ei analytiikkaevästeitä eikä markkinointiseurantaa tässä prototyypissä.",
    ],
    closing: "Tietoja ei myydä eikä käytetä kolmansien osapuolten tekoälymallien kouluttamiseen. Tämä sivu kuvaa prototyypin käytäntöä selkokielellä — ei muodollista oikeudellista neuvontaa.",
    termsLink: "← Ehdot",
    aboutLink: "Tietoa →",
    backLink: "Takaisin GRYPS:iin →",
  },
}

export default function PrivacyPage() {
  const [lang, setLang] = useLang()
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

      <Section title={t.controllerH} body={t.controllerBody} />
      <SectionList title={t.whatH} items={t.whatItems} />
      <Section title={t.basisH} body={t.basisBody} />
      <SectionList title={t.processorsH} items={t.processorsItems} />
      <Section title={t.retentionH} body={t.retentionBody} />
      <SectionList title={t.rightsH} items={t.rightsItems} />

      <p style={{
        fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text)",
        lineHeight: 1.75, marginTop: 32, fontWeight: 600,
      }}>
        {t.closing}
      </p>

      <div style={{
        marginTop: 64, padding: "24px 0",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <Link href="/terms" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "var(--accent-blue)", textDecoration: "none",
        }}>
          {t.termsLink}
        </Link>
        <Link href="/about" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "var(--text-muted)", textDecoration: "none",
        }}>
          {t.aboutLink}
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

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{title}</h2>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75 }}>{body}</p>
    </div>
  )
}

function SectionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{title}</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <li key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75,
          }}>
            <span style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: 1 }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

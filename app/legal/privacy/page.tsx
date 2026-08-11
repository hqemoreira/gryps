"use client"
import { useState } from "react"
import Link from "next/link"

const COPY = {
  en: {
    title: "Privacy Policy",
    effective: "Last updated: 11 August 2026",
    controller: "Data Controller: GRYPS (research project) · Espoo, Finland · hello@gryps.eu",
    intro: "This Privacy Policy explains how GRYPS collects, processes, and protects personal data in connection with the GRYPS satellite connectivity intelligence platform. GRYPS is committed to full compliance with the EU General Data Protection Regulation (GDPR) and applicable Finnish data protection law.",
    sections: [
      {
        id: "01",
        title: "Who We Are",
        body: [
          "GRYPS is a non-commercial research project based in Espoo, Finland, operated by Henrique Moreira (solo founder). There is no registered company and no revenue. For the purposes of the GDPR, the researcher operating GRYPS (hello@gryps.eu) is the data controller responsible for personal data processed through the GRYPS platform.",
          "Contact for all data protection matters: hello@gryps.eu",
        ],
      },
      {
        id: "02",
        title: "Data We Collect",
        subsections: [
          {
            label: "Advisor submissions",
            body: "When you use the Connectivity Advisor, you may provide geographic coordinates, sector, autonomy level, criticality, optional current-setup notes, and an optional email address. These inputs and the resulting Resilience Signature output may be stored in Neon (advisor_submissions) for rate limiting, research, and service integrity. Optional email is stored with the submission when provided.",
          },
          {
            label: "Platform Analytics",
            body: "GRYPS uses Vercel Analytics to collect anonymised, aggregated usage statistics (page views, session duration, geographic region at country level). No individual-level tracking cookies are used. No cross-site tracking is performed. Vercel Analytics is compliant with GDPR and does not process personally identifiable information.",
          },
          {
            label: "API Usage Logs",
            body: "Server-side logs may include request timestamps, endpoint paths, response codes, IP address (for rate limiting), and payload sizes. Logs support security and abuse prevention. Logs are retained for a maximum of 90 days where applicable.",
          },
        ],
      },
      {
        id: "03",
        title: "Legal Basis for Processing",
        body: [
          "Advisor submissions: Contract performance / legitimate interest — necessary to deliver the requested analysis, rate-limit abuse, and improve the research prototype.",
          "Platform analytics: Legitimate interest — anonymised aggregate analytics are used to improve the platform. No individual profiling is performed.",
          "API logs: Legitimate interest — retained for security, rate limiting, and service integrity purposes.",
        ],
      },
      {
        id: "04",
        title: "Data Sovereignty & EU Storage",
        body: [
          "GRYPS is built on infrastructure that operates within European Union jurisdiction where practicable:",
          "Vercel (hosting & analytics): EU-region deployment (Frankfurt, Germany). Vercel's EU data processing addendum is available at vercel.com/legal/dpa.",
          "Neon (database): PostgreSQL serverless database in the EU (Frankfurt) region. Advisor submission records are stored in Neon.",
          "Mistral (AI inference): Advisor scoring and analytical text are processed by Mistral via the Mistral API. Prompt content may include site profile fields you submit. See Mistral's privacy documentation for their processing terms.",
          "GRYPS does not transfer personal data to third countries (outside the EU/EEA) without an adequate legal mechanism in place where required.",
        ],
      },
      {
        id: "05",
        title: "AI systems & transparency",
        body: [
          "GRYPS uses a limited-risk AI system under Regulation (EU) 2024/1689 (EU AI Act) — not minimal-risk, high-risk, or prohibited.",
          "The sole AI provider for Resilience Signature outputs is Mistral. GRYPS does not use Google Gemini or OpenAI for Advisor outputs.",
          "AI-generated or AI-assisted analytical content is disclosed at the point of exposure with an [AI] badge. Maps, Capacity Map status colours derived from stored grades, and real-data evidence panels are not AI-generated.",
          "GRYPS does not make automated decisions with legal or similarly significant effects concerning natural persons. Outputs support human judgement only.",
        ],
      },
      {
        id: "06",
        title: "Geospatial Data — Special Handling",
        body: [
          "GRYPS processes geospatial location data — coordinates and site profile fields — that may be commercially sensitive.",
          "Data minimisation: Coordinates submitted to the Connectivity Advisor are used to produce Resilience Signature scoring and related evidence. They are not enriched with third-party company directory lookups.",
          "No secondary profiling across users to build geographic profiles of client operations.",
          "PDF reports generated via browser print are stored on your device. GRYPS does not maintain separate cloud copies of printed PDFs.",
        ],
      },
      {
        id: "07",
        title: "Data Retention",
        body: [
          "Advisor submissions (inputs, outputs, optional email, IP for rate limiting): Retained in Neon until you request deletion or the research project is discontinued, whichever comes first, subject to legitimate operational needs (e.g. rate-limit history).",
          "Platform analytics: Aggregated and anonymised; no individual retention limit applies.",
          "API / edge logs: Retained for a maximum of 90 days where applicable, then purged.",
          "Exported PDF reports: Stored on your device. GRYPS does not maintain copies of printed reports on its servers.",
        ],
      },
      {
        id: "08",
        title: "Your GDPR Rights",
        body: [
          "As a data subject under the GDPR, you have the following rights with respect to personal data processed by GRYPS:",
          "Right of access (Art. 15): You may request a copy of the personal data GRYPS holds about you.",
          "Right to rectification (Art. 16): You may request correction of inaccurate personal data.",
          "Right to erasure (Art. 17): You may request deletion of your personal data, subject to legal retention obligations.",
          "Right to restrict processing (Art. 18): You may request that processing of your data be limited in certain circumstances.",
          "Right to data portability (Art. 20): You may request your data in a structured, machine-readable format.",
          "Right to object (Art. 21): You may object to processing based on legitimate interest.",
          "To exercise any of these rights, contact: hello@gryps.eu. GRYPS will respond within 30 days.",
          "If you believe your rights have been violated, you have the right to lodge a complaint with the Finnish Data Protection Ombudsman (tietosuoja.fi) or the supervisory authority in your EU member state.",
        ],
      },
      {
        id: "09",
        title: "Third-Party Processors",
        rows: [
          { processor: "Vercel", role: "Hosting, edge delivery, analytics", region: "EU (Frankfurt)", lawfulBasis: "DPA — vercel.com/legal/dpa" },
          { processor: "Neon", role: "PostgreSQL serverless database", region: "EU (Frankfurt)", lawfulBasis: "DPA — neon.tech/privacy" },
          { processor: "Mistral", role: "AI inference for Advisor / Resilience Signature", region: "Per Mistral DPA / terms", lawfulBasis: "Processor — mistral.ai" },
        ],
      },
      {
        id: "10",
        title: "Cookies & Tracking",
        body: [
          "GRYPS does not use advertising cookies, cross-site tracking pixels, or third-party retargeting scripts.",
          "Vercel Analytics uses a privacy-first, cookieless approach to aggregate traffic measurement. No consent banner is required for Vercel Analytics under the GDPR's legitimate interest basis, as no individual-level tracking occurs.",
          "Theme preference may be stored in localStorage (gryps-theme). Advisor analysis inputs are held in page memory for the active session UI; persisted submissions (when made) are stored in Neon as described above.",
        ],
      },
      {
        id: "11",
        title: "Changes to This Policy",
        body: [
          "This Privacy Policy may be updated to reflect changes in GRYPS's data processing practices, new regulatory requirements, or new product features. The \"Last updated\" date at the top of this page will be updated accordingly.",
          "When AI surfaces or AI providers change, Privacy and Terms Last updated dates are bumped in the same change set.",
          "Material changes — such as the introduction of new data categories, new third-party processors, or changes to retention periods — will be communicated with reasonable notice where practicable.",
        ],
      },
      {
        id: "12",
        title: "Contact",
        body: [
          "Data Controller: GRYPS (research project) · Henrique Moreira",
          "Platform: gryps.vercel.app",
          "Email: hello@gryps.eu",
          "Location: Espoo, Finland — European Union",
        ],
      },
    ],
  },
  fi: {
    title: "Tietosuojakäytäntö",
    effective: "Viimeksi päivitetty: 11. elokuuta 2026",
    controller: "Rekisterinpitäjä: GRYPS (tutkimusprojekti) · Espoo, Suomi · hello@gryps.eu",
    intro: "Tämä tietosuojakäytäntö selittää, miten GRYPS kerää, käsittelee ja suojaa henkilötietoja GRYPS-satelliittiyhteysälypalvelun yhteydessä. GRYPS on sitoutunut noudattamaan EU:n yleistä tietosuoja-asetusta (GDPR) ja sovellettavaa suomalaista tietosuojalakia.",
    sections: [
      {
        id: "01",
        title: "Keitä me olemme",
        body: [
          "GRYPS on ei-kaupallinen tutkimusprojekti Espoossa, Suomessa, jota operoi Henrique Moreira (yksinyrittäjä). Ei rekisteröityä yritystä eikä tuloja. GDPR:n tarkoituksiin tutkija (hello@gryps.eu) on rekisterinpitäjä.",
          "Yhteystiedot kaikissa tietosuoja-asioissa: hello@gryps.eu",
        ],
      },
      {
        id: "02",
        title: "Keräämämme tiedot",
        subsections: [
          {
            label: "Advisor-lähetykset",
            body: "Kun käytät Connectivity Advisoria, voit antaa koordinaatit, toimialan, autonomiatason, kriittisyyden, valinnaiset kokoonpanotiedot ja valinnaisen sähköpostin. Syötteet ja Resilience Signature -tulos voidaan tallentaa Neoniin (advisor_submissions) nopeuden rajoitusta, tutkimusta ja palvelun eheyttä varten.",
          },
          {
            label: "Alustan analytiikka",
            body: "GRYPS käyttää Vercel Analyticsiä anonymisoitujen, aggregoitujen käyttötilastojen keräämiseen. Yksilötason seurantaevästeitä ei käytetä. Vercel Analytics on GDPR-vaatimusten mukainen.",
          },
          {
            label: "API-käyttölokit",
            body: "Palvelinlokit voivat sisältää aikaleimoja, polkuja, vastauskoodeja, IP-osoitteen (nopeusrajoitus) ja hyötykuormakokoja. Lokeja säilytetään enintään 90 päivää soveltuvin osin.",
          },
        ],
      },
      {
        id: "03",
        title: "Käsittelyn oikeudellinen peruste",
        body: [
          "Advisor-lähetykset: Sopimuksen täytäntöönpano / oikeutettu etu — analyysin toimittaminen, väärinkäytön rajoittaminen ja tutkimusprototyypin kehittäminen.",
          "Alustan analytiikka: Oikeutettu etu — anonymisoitua aggregaattianalytiikkaa käytetään palvelun kehittämiseen.",
          "API-lokit: Oikeutettu etu — turvallisuus, nopeusrajoitus ja palvelun eheys.",
        ],
      },
      {
        id: "04",
        title: "Tietosuvereniteetti ja EU-tallennus",
        body: [
          "GRYPS on rakennettu infrastruktuurille, joka toimii Euroopan unionin lainkäyttöalueella siltä osin kuin se on käytännöllistä:",
          "Vercel (hosting ja analytiikka): EU-alue (Frankfurt, Saksa).",
          "Neon (tietokanta): PostgreSQL EU (Frankfurt) -alueella. Advisor-lähetykset tallennetaan Neoniin.",
          "Mistral (tekoälypäättely): Advisor-pisteytys ja analyyttinen teksti käsitellään Mistral API:n kautta.",
          "GRYPS ei siirrä henkilötietoja kolmansiin maihin (EU/ETA:n ulkopuolelle) ilman asianmukaista oikeusmekanismia tarvittaessa.",
        ],
      },
      {
        id: "05",
        title: "Tekoälyjärjestelmät ja läpinäkyvyys",
        body: [
          "GRYPS käyttää rajoitetun riskin tekoälyjärjestelmää asetuksen (EU) 2024/1689 mukaisesti — ei minimaalisen riskin, korkean riskin eikä kiellettyä järjestelmää.",
          "Ainoa Resilience Signature -tulosteiden tekoälytoimittaja on Mistral. GRYPS ei käytä Google Geminiä tai OpenAI:ta Advisor-tulosteisiin.",
          "Tekoälyn tuottama tai avustama analyyttinen sisältö merkitään [AI]-merkillä altistumiskohdassa. Kartat, Capacity Map -värit ja reaalidatanäyttö eivät ole tekoälyn tuottamia.",
          "GRYPS ei tee automatisoituja päätöksiä, joilla on oikeudellisia tai vastaavia merkittäviä vaikutuksia luonnollisiin henkilöihin.",
        ],
      },
      {
        id: "06",
        title: "Geospatiaaliset tiedot — erityinen käsittely",
        body: [
          "GRYPS käsittelee sijaintitietoja — koordinaatteja ja kohdeprofiilikenttiä — jotka voivat olla kaupallisesti arkaluonteisia.",
          "Tietojen minimointi: Advisorille annettuja koordinaatteja käytetään Resilience Signature -pisteytykseen ja liittyvään näyttöön.",
          "Ei toissijaista profilointia käyttäjien välillä.",
          "Selainprintillä luodut PDF-raportit säilyvät laitteellasi.",
        ],
      },
      {
        id: "07",
        title: "Tietojen säilyttäminen",
        body: [
          "Advisor-lähetykset: Säilytetään Neonissa, kunnes pyydät poistamista tai tutkimusprojekti lopetetaan, jollei operatiivinen tarve (esim. nopeusrajoitushistoria) edellytä muuta.",
          "Alustan analytiikka: Aggregoitu ja anonymisoitu.",
          "API-/edge-lokit: Enintään 90 päivää soveltuvin osin.",
          "Viedyt PDF-raportit: Laitteellasi; GRYPS ei säilytä printtikopioita palvelimillaan.",
        ],
      },
      {
        id: "08",
        title: "GDPR-oikeutesi",
        body: [
          "GDPR:n mukaisena rekisteröitynä sinulla on seuraavat oikeudet:",
          "Oikeus tutustua tietoihin (15 artikla).",
          "Oikeus tietojen oikaisemiseen (16 artikla).",
          "Oikeus tietojen poistamiseen (17 artikla).",
          "Oikeus käsittelyn rajoittamiseen (18 artikla).",
          "Oikeus siirtää tiedot järjestelmästä toiseen (20 artikla).",
          "Vastustamisoikeus (21 artikla).",
          "Ota yhteyttä: hello@gryps.eu. GRYPS vastaa 30 päivän kuluessa.",
          "Voit tehdä valituksen tietosuojavaltuutetulle (tietosuoja.fi).",
        ],
      },
      {
        id: "09",
        title: "Kolmannen osapuolen käsittelijät",
        rows: [
          { processor: "Vercel", role: "Hosting, reunatoimitus, analytiikka", region: "EU (Frankfurt)", lawfulBasis: "DPA — vercel.com/legal/dpa" },
          { processor: "Neon", role: "PostgreSQL-palvelimeton tietokanta", region: "EU (Frankfurt)", lawfulBasis: "DPA — neon.tech/privacy" },
          { processor: "Mistral", role: "Tekoälypäättely Advisor / Resilience Signature", region: "Mistralin DPA / ehdot", lawfulBasis: "Käsittelijä — mistral.ai" },
        ],
      },
      {
        id: "10",
        title: "Evästeet ja seuranta",
        body: [
          "GRYPS ei käytä mainontaevästeitä, sivustojen välisiä seurantapikseleitä tai kolmannen osapuolen uudelleenkohdentamisskriptejä.",
          "Vercel Analytics käyttää evästeetöntä aggregaattimittausmenetelmää. Suostumusbanneria ei tarvita cookieless-analytiikalle.",
          "Teema-asetus voidaan tallentaa localStorageen (gryps-theme). Advisor-syötteet UI-istunnossa; pysyvät lähetykset Neonissa yllä kuvatusti.",
        ],
      },
      {
        id: "11",
        title: "Muutokset tähän käytäntöön",
        body: [
          "Tätä tietosuojakäytäntöä voidaan päivittää. Sivun yläosan \"Viimeksi päivitetty\" -päivämäärä päivitetään vastaavasti.",
          "Kun tekoälypintoja tai -toimittajia muutetaan, Privacy- ja Terms-päivämäärät päivitetään samassa muutoksessa.",
          "Olennaisista muutoksista ilmoitetaan kohtuullisessa ajassa siltä osin kuin se on käytännöllistä.",
        ],
      },
      {
        id: "12",
        title: "Yhteystiedot",
        body: [
          "Rekisterinpitäjä: GRYPS (tutkimusprojekti) · Henrique Moreira",
          "Alusta: gryps.vercel.app",
          "Sähköposti: hello@gryps.eu",
          "Sijainti: Espoo, Suomi — Euroopan unioni",
        ],
      },
    ],
  },
}

export default function PrivacyPage() {
  const [lang, setLang] = useState<"en" | "fi">("en")
  const t = COPY[lang]

  const renderSection = (s: typeof COPY.en.sections[0]) => {
    const hasSubsections = "subsections" in s && s.subsections
    const hasRows = "rows" in s && s.rows
    const hasBody = "body" in s && s.body

    return (
      <div key={s.id} id={`section-${s.id}`} style={{ scrollMarginTop: 72 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", minWidth: 24 }}>{s.id}</span>
          <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{s.title}</h2>
        </div>

        {/* Data sovereignty highlight */}
        {s.id === "04" && (
          <div style={{
            backgroundColor: "rgba(46,212,122,0.05)", border: "1px solid rgba(46,212,122,0.2)",
            borderRadius: 6, padding: "10px 14px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2ED47A", flexShrink: 0 }} />
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-green)", lineHeight: 1.5 }}>
              {lang === "en"
                ? "All customer data is processed and stored within EU-region infrastructure (Frankfurt, Germany)."
                : "Kaikki asiakastiedot käsitellään ja tallennetaan EU-alueen infrastruktuurissa (Frankfurt, Saksa)."}
            </p>
          </div>
        )}

        <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 24 }}>
          {hasBody && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(s as { body: string[] }).body.map((para, pi) => (
                <p key={pi} style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8 }}>{para}</p>
              ))}
            </div>
          )}

          {hasSubsections && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {(s as { subsections: { label: string; body: string }[] }).subsections.map((sub, si) => (
                <div key={si}>
                  <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 8 }}>{sub.label}</p>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8 }}>{sub.body}</p>
                </div>
              ))}
            </div>
          )}

          {hasRows && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Processor", "Role", "Region", "Compliance basis"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "8px 12px",
                        fontFamily: "var(--font-data)", fontSize: 9, letterSpacing: "0.1em",
                        color: "var(--text-dim)", borderBottom: "1px solid var(--border)",
                        fontWeight: 400,
                      }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(s as { rows: { processor: string; role: string; region: string; lawfulBasis: string }[] }).rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 12px", color: "var(--text)", fontWeight: 600 }}>{row.processor}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{row.role}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontFamily: "var(--font-data)", fontSize: 11 }}>{row.region}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)", fontFamily: "var(--font-data)", fontSize: 11 }}>{row.lawfulBasis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "56px 32px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em" }}>GRYPS · LEGAL</p>
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
          color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 12,
        }}>{t.title}</h1>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>{t.effective}</p>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)", marginBottom: 20 }}>{t.controller}</p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75 }}>{t.intro}</p>
      </div>

      {/* GDPR quick-reference */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 48,
      }}>
        {[
          { label: "Regulation", value: "GDPR (EU 2016/679)" },
          { label: "Data storage", value: "EU (Frankfurt)" },
          { label: "Supervisory authority", value: "tietosuoja.fi" },
        ].map(item => (
          <div key={item.label} style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "14px 16px",
          }}>
            <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 6 }}>{item.label.toUpperCase()}</p>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Table of contents */}
      <div style={{
        backgroundColor: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "20px 24px", marginBottom: 48,
      }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 14 }}>TABLE OF CONTENTS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {t.sections.map(s => (
            <a key={s.id} href={`#section-${s.id}`} style={{ display: "flex", gap: 12, textDecoration: "none" }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", minWidth: 20 }}>{s.id}</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)" }}>{s.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {t.sections.map((s, i) => (
          <div key={s.id}>
            {renderSection(s)}
            {i < t.sections.length - 1 && <div style={{ borderBottom: "1px solid var(--border)", marginTop: 48 }} />}
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{
        marginTop: 64, padding: "24px 0",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/legal/terms" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "var(--accent-blue)", textDecoration: "none",
        }}>
          {lang === "en" ? "← Terms & Conditions" : "← Käyttöehdot"}
        </Link>
        <Link href="/" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "var(--text-muted)", textDecoration: "none",
        }}>
          {lang === "en" ? "Back to GRYPS →" : "Takaisin GRYPS:iin →"}
        </Link>
      </div>
    </div>
  )
}

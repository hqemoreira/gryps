"use client"
import { useState } from "react"
import Link from "next/link"

const COPY = {
  en: {
    title: "Terms & Conditions",
    effective: "Effective date: 29 June 2026",
    intro: "These Terms & Conditions govern your access to and use of GRYPS, a satellite connectivity intelligence platform operated by Henrique Moreira (\"GRYPS\", \"we\", \"us\"). By accessing the platform, submitting a request for early access, or using any GRYPS service, you agree to be bound by these terms.",
    sections: [
      {
        id: "01",
        title: "Nature of the Service — Predictive Model Disclaimer",
        body: [
          "GRYPS provides satellite connectivity intelligence through mathematical scoring models. The Deployment Confidence scores, provider rankings, latency estimates, and coverage assessments produced by GRYPS are probabilistic outputs derived from publicly available data, orbital telemetry, environmental variables, and historical performance records.",
          "GRYPS does not provide an operational guarantee of satellite network availability, uptime, signal quality, or bandwidth at any specific location or time. A Deployment Confidence score of 94 does not mean that the recommended provider will maintain 94% uptime at your site. It means that, based on the analytical model's inputs at the time of analysis, that provider is statistically the most suitable choice for your stated operational requirements.",
          "You expressly acknowledge that GRYPS scores and recommendations are tools to support procurement and planning decisions — not operational commitments. GRYPS shall not be liable for any operational failure, safety incident, connectivity outage, equipment loss, or consequential damages arising from reliance on GRYPS analysis outputs.",
        ],
      },
      {
        id: "02",
        title: "Limitation of Liability",
        body: [
          "To the maximum extent permitted by applicable law, GRYPS and its operator shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of revenue, loss of data, loss of life or property, operational downtime, or reputational harm, arising out of or in connection with the use of the GRYPS platform or reliance on its outputs.",
          "In jurisdictions where limitation of consequential damages is not permitted, GRYPS's total aggregate liability to you for any claim arising out of or related to these Terms shall not exceed the total fees paid by you to GRYPS in the twelve (12) months preceding the claim.",
          "GRYPS analysis is designed to support — not replace — qualified human judgement. Final procurement, deployment, and operational decisions remain the sole responsibility of the user and their organisation.",
        ],
      },
      {
        id: "03",
        title: "Neutrality & Affiliation Disclaimer",
        body: [
          "GRYPS operates as an independent analytical platform. GRYPS holds no direct financial interest, commission arrangement, referral agreement, or equity stake in any satellite constellation operator, including but not limited to Starlink (SpaceX), OneWeb (Eutelsat Group), Iridium Communications, Inmarsat, Viasat, SES, Telesat, or Hughes Network Systems.",
          "Provider rankings produced by GRYPS are derived solely from the analytical methodology applied to the inputs provided. No satellite operator has paid for, requested, or had editorial influence over GRYPS scoring outputs.",
          "GRYPS reserves the right to update its scoring methodology as new data sources, orbital configurations, or coverage information become available. Changes to methodology will be versioned and disclosed in the platform changelog.",
        ],
      },
      {
        id: "04",
        title: "AI Transparency — EU AI Act Article 50 Compliance",
        body: [
          "GRYPS uses automated analytical models to generate provider ranking scores and plain-language rationale summaries. In compliance with Article 50 of the EU AI Act (Transparency obligations for providers and deployers of certain AI systems), GRYPS discloses the following:",
          "The plain-language rationale text displayed alongside each provider ranking (\"Excellent overhead coverage at 68°N...\") is generated or assisted by an automated model. These outputs are marked with an [AI] indicator within the platform interface.",
          "The Connectivity Advisor is an automated analytical system. When you interact with the Advisor, you are interacting with an automated model, not a human expert. GRYPS does not represent that the Advisor's outputs reflect the judgement of a licensed telecommunications engineer or a regulated financial advisor.",
          "All AI-generated content within GRYPS is machine-readable and structurally distinct from user-submitted content. GRYPS does not use generative AI to produce fabricated provider specifications, coverage maps, or technical certifications.",
        ],
      },
      {
        id: "05",
        title: "API Usage Restrictions",
        body: [
          "Access to the GRYPS API tier is subject to additional restrictions beyond general platform use. By accessing the GRYPS API, you agree that you will not:",
          "Systematically query the API with the intent of reverse-engineering, reproducing, or approximating GRYPS's proprietary scoring weights, orbital weighting methodology, or provider evaluation algorithms.",
          "Feed GRYPS API outputs — including Deployment Confidence scores, ranked provider lists, or rationale summaries — into a competing satellite connectivity intelligence product, data aggregation platform, or resale data service without prior written authorisation from GRYPS.",
          "Use GRYPS API outputs to train, fine-tune, or benchmark any machine learning model intended to replicate GRYPS analytical capabilities.",
          "Violation of these restrictions may result in immediate API access termination and may give rise to legal claims under applicable intellectual property and trade secret law.",
        ],
      },
      {
        id: "06",
        title: "Intellectual Property",
        body: [
          "All GRYPS software, scoring methodologies, interface designs, brand assets, and documentation are the intellectual property of Henrique Moreira and are protected under applicable copyright, trade secret, and intellectual property law.",
          "Reports and analysis outputs generated by GRYPS on behalf of a paying customer are licensed to that customer for internal use only. You may share GRYPS-generated PDF reports with internal stakeholders and your organisation's board. You may not publish, redistribute, or commercialise GRYPS-generated reports without prior written consent.",
          "The GRYPS name, mark, and orbital arc logo are unregistered trademarks of Henrique Moreira. Unauthorised use of the GRYPS brand in connection with satellite connectivity products or services is prohibited.",
        ],
      },
      {
        id: "07",
        title: "Acceptable Use",
        body: [
          "You agree to use GRYPS only for lawful purposes and in accordance with these Terms. You will not use GRYPS to support procurement decisions for activities that are prohibited under applicable law, including but not limited to sanctioned entities, prohibited weapons programmes, or activities in violation of EU export control regulations.",
          "You will not attempt to circumvent, disable, or interfere with GRYPS platform security, access controls, or rate limiting. Automated scraping of GRYPS outputs without an active API subscription is prohibited.",
        ],
      },
      {
        id: "08",
        title: "Modifications to the Service and Terms",
        body: [
          "GRYPS reserves the right to modify, suspend, or discontinue any aspect of the platform at any time. We will provide reasonable notice of material changes through the platform interface or by email to registered users.",
          "These Terms may be updated from time to time. Continued use of the platform after the effective date of updated Terms constitutes acceptance of the revised Terms.",
        ],
      },
      {
        id: "09",
        title: "Governing Law & Dispute Resolution",
        body: [
          "These Terms are governed by the laws of Finland and, where applicable, the laws of the European Union, including the General Data Protection Regulation (GDPR) and the EU AI Act.",
          "Any dispute arising out of or in connection with these Terms shall first be subject to good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to the competent courts of Finland.",
          "Nothing in these Terms limits your rights as a consumer under applicable mandatory EU consumer protection law.",
        ],
      },
      {
        id: "10",
        title: "Contact",
        body: [
          "For questions relating to these Terms, including licensing inquiries and API access requests, contact: hqe.moreira@gmail.com",
          "GRYPS is operated by Henrique Moreira, Joroinen, Finland.",
        ],
      },
    ],
  },
  fi: {
    title: "Käyttöehdot",
    effective: "Voimaantulopäivä: 29. kesäkuuta 2026",
    intro: "Nämä käyttöehdot säätelevät GRYPS-satelliittiyhteysintelligenssiplatformin käyttöä. Platforma on Henrique Morerian hallinnoima (\"GRYPS\", \"me\"). Käyttämällä palvelua hyväksyt nämä ehdot.",
    sections: [
      {
        id: "01",
        title: "Palvelun luonne — Ennustavan mallin vastuuvapauslauseke",
        body: [
          "GRYPS tarjoaa satelliittiyhteysintelligenssiä matemaattisten pisteytysmallien avulla. Deployment Confidence -pisteet, toimittajarankingit, latenssiarviot ja kattavuusarviot ovat todennäköisyyspohjaisia tuloksia, jotka perustuvat julkisesti saatavilla olevaan dataan, orbitaalitelemetriaan, ympäristömuuttujiin ja historiallisiin suorituskykytietoihin.",
          "GRYPS ei tarjoa operatiivista takuuta satelliittiverkon saatavuudesta, käytettävyydestä, signaalin laadusta tai kaistanleveydestä missään tietyssä sijainnissa tai ajankohdassa. Deployment Confidence -pisteet 94 ei tarkoita, että suositeltu toimittaja ylläpitäisi 94 % käytettävyyttä sivustollasi.",
          "Tunnustat nimenomaisesti, että GRYPS-pisteet ja -suositukset ovat hankinta- ja suunnittelupäätöksiä tukevia välineitä — eivät operatiivisia sitoumuksia. GRYPS ei ole vastuussa mistään operatiivisista häiriöistä, turvallisuustapahtumista, yhteyskatkoista tai välillisistä vahingoista.",
        ],
      },
      {
        id: "02",
        title: "Vastuunrajoitus",
        body: [
          "Sovellettavan lain sallimassa laajuudessa GRYPS ja sen operaattori eivät ole vastuussa mistään suorista, epäsuorista, satunnaisista, erityisistä, seurannaisista tai rangaistusluonteisista vahingoista.",
          "GRYPS-analyysi on suunniteltu tukemaan — ei korvaamaan — pätevää ihmisen harkintaa. Lopulliset hankinta-, käyttöönotto- ja operatiiviset päätökset ovat yksinomaan käyttäjän ja heidän organisaationsa vastuulla.",
        ],
      },
      {
        id: "03",
        title: "Puolueettomuus ja sidonnaisuusvapauslauseke",
        body: [
          "GRYPS toimii riippumattomana analyyttisena platformina. GRYPS:llä ei ole suoraa taloudellista etua, provisioita, viittausjärjestelyä tai osakepääomaa missään satelliittikonstella-aatiooperaattorissa, mukaan lukien Starlink, OneWeb, Iridium, Inmarsat, Viasat, SES, Telesat tai Hughes.",
          "GRYPS:n tuottamat toimittajarankingit perustuvat yksinomaan analyyttiseen metodologiaan syötettyihin tietoihin sovellettuna. Yksikään satelliittioperaattori ei ole maksanut GRYPS-pisteytysten tuloksista tai vaikuttanut niihin toimituksellisesti.",
        ],
      },
      {
        id: "04",
        title: "Tekoälyn läpinäkyvyys — EU:n tekoälylain 50 artiklan noudattaminen",
        body: [
          "GRYPS käyttää automatisoituja analyyttisia malleja toimittajarankingpisteiden ja selkokielisten perustelutiivistelmien luomiseen. EU:n tekoälylain 50 artiklan (Läpinäkyvyysvelvoitteet) mukaisesti GRYPS ilmoittaa seuraavaa:",
          "Kunkin toimittajarankingin yhteydessä näytettävä selkokielinen perustelu on automaattisen mallin tuottama tai avustama. Nämä tulosteet on merkitty [AI]-indikaattorilla platformin käyttöliittymässä.",
          "Connectivity Advisor on automatisoitu analyyttinen järjestelmä. Kun olet vuorovaikutuksessa Advisorin kanssa, olet vuorovaikutuksessa automaattisen mallin kanssa, et ihmisasiantuntijan kanssa.",
        ],
      },
      {
        id: "05",
        title: "API-käytön rajoitukset",
        body: [
          "GRYPS API -tasolle pääsy on yleistä platformin käyttöä laajempien rajoitusten alainen. Käyttämällä GRYPS API:a hyväksyt, että et:",
          "Järjestelmällisesti kyselisi API:a tarkoituksena käänteismuokata, toistaa tai lähentää GRYPS:n omistamia pisteytyksen painotuksia, orbitaalipainotusmenetelmää tai toimittajan arviointialgoritmeja.",
          "Syötä GRYPS API -tuloksia kilpailevaan satelliittiyhteysintelligenssipalveluun ilman GRYPS:n kirjallista lupaa.",
          "Käytä GRYPS API -tuloksia minkään koneoppimismallin kouluttamiseen, hienosäätöön tai vertailuun, joka on tarkoitettu jäljittelemään GRYPS:n analyyttisia kykyjä.",
        ],
      },
      {
        id: "06",
        title: "Immateriaalioikeudet",
        body: [
          "Kaikki GRYPS-ohjelmistot, pisteytysmenetelmät, käyttöliittymäsuunnitelmat, brändivarat ja dokumentaatio ovat Henrique Morerian immateriaalioikeutta.",
          "GRYPS-nimi, tavaramerkki ja orbitaalikaarlogo ovat Henrique Morerian rekisteröimättömiä tavaramerkkejä.",
        ],
      },
      {
        id: "07",
        title: "Hyväksyttävä käyttö",
        body: [
          "Hyväksyt käyttäväsi GRYPS:iä vain laillisiin tarkoituksiin ja näiden ehtojen mukaisesti. Et käytä GRYPS:iä tukemaan hankintapäätöksiä toiminnoille, jotka on kielletty sovellettavan lain nojalla.",
          "Et yritä kiertää, poistaa käytöstä tai häiritä GRYPS-platformin turvallisuutta, käyttöoikeuksien hallintaa tai nopeuden rajoitusta.",
        ],
      },
      {
        id: "08",
        title: "Muutokset palveluun ja ehtoihin",
        body: [
          "GRYPS pidättää oikeuden muuttaa, keskeyttää tai lopettaa platformin minkä tahansa osa-alueen milloin tahansa. Ilmoitamme olennaisista muutoksista kohtuullisessa ajassa platformin käyttöliittymän kautta tai sähköpostitse.",
        ],
      },
      {
        id: "09",
        title: "Sovellettava laki ja riitojen ratkaisu",
        body: [
          "Näitä ehtoja sovelletaan Suomen lakien ja soveltuvin osin Euroopan unionin lakien mukaisesti, mukaan lukien GDPR ja EU:n tekoälylaki.",
          "Kaikki näistä ehdoista johtuvat riidat ratkaistaan ensisijaisesti neuvottelemalla. Jos ratkaisu ei löydy 30 päivässä, riidat toimitetaan Suomen toimivaltaisille tuomioistuimille.",
        ],
      },
      {
        id: "10",
        title: "Yhteystiedot",
        body: [
          "Näihin ehtoihin liittyvät kysymykset: hqe.moreira@gmail.com",
          "GRYPS on Henrique Morerian hallinnoima, Joroinen, Suomi.",
        ],
      },
    ],
  },
}

export default function TermsPage() {
  const [lang, setLang] = useState<"en" | "fi">("en")
  const t = COPY[lang]

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
        <p style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", marginBottom: 20 }}>{t.effective}</p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75 }}>{t.intro}</p>
      </div>

      {/* Table of contents */}
      <div style={{
        backgroundColor: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "20px 24px", marginBottom: 48,
      }}>
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 14 }}>TABLE OF CONTENTS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {t.sections.map(s => (
            <a key={s.id} href={`#section-${s.id}`} style={{
              display: "flex", alignItems: "baseline", gap: 12, textDecoration: "none",
            }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", minWidth: 20 }}>{s.id}</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)" }}>{s.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {t.sections.map((s, i) => (
          <div key={s.id} id={`section-${s.id}`} style={{ scrollMarginTop: 72 }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", minWidth: 24 }}>{s.id}</span>
              <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{s.title}</h2>
            </div>
            {/* Special callout for Article 50 section */}
            {s.id === "04" && (
              <div style={{
                backgroundColor: "rgba(79,168,255,0.06)", border: "1px solid rgba(79,168,255,0.2)",
                borderRadius: 6, padding: "12px 16px", marginBottom: 16,
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "#4FA8FF", border: "1px solid rgba(79,168,255,0.4)", borderRadius: 3, padding: "2px 5px", flexShrink: 0, marginTop: 2 }}>AI</span>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#4FA8FF", lineHeight: 1.6 }}>
                  {lang === "en"
                    ? "AI-generated content within GRYPS is disclosed in compliance with EU AI Act Article 50 transparency requirements."
                    : "GRYPS:n tekoälyllä tuotettu sisältö ilmoitetaan EU:n tekoälylain 50 artiklan läpinäkyvyysvaatimusten mukaisesti."}
                </p>
              </div>
            )}
            {/* Special callout for predictive disclaimer */}
            {s.id === "01" && (
              <div style={{
                backgroundColor: "rgba(245,184,74,0.06)", border: "1px solid rgba(245,184,74,0.2)",
                borderRadius: 6, padding: "12px 16px", marginBottom: 16,
              }}>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#F5B84A", lineHeight: 1.6 }}>
                  {lang === "en"
                    ? "GRYPS Deployment Confidence scores are predictive mathematical outputs. They do not constitute a guarantee of satellite network availability."
                    : "GRYPS Deployment Confidence -pisteet ovat ennustavia matemaattisia tuloksia. Ne eivät muodosta takausta satelliittiverkon saatavuudesta."}
                </p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, borderLeft: "2px solid var(--border)", paddingLeft: 24 }}>
              {s.body.map((para, pi) => (
                <p key={pi} style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8 }}>{para}</p>
              ))}
            </div>
            {i < t.sections.length - 1 && (
              <div style={{ borderBottom: "1px solid var(--border)", marginTop: 48 }} />
            )}
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{
        marginTop: 64, padding: "24px 0",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/legal/privacy" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "#4FA8FF", textDecoration: "none",
        }}>
          {lang === "en" ? "Privacy Policy →" : "Tietosuojakäytäntö →"}
        </Link>
        <Link href="/" style={{
          fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
          color: "var(--text-muted)", textDecoration: "none",
        }}>
          {lang === "en" ? "← Back to GRYPS" : "← Takaisin GRYPS:iin"}
        </Link>
      </div>
    </div>
  )
}

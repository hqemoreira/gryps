"use client";
import Link from "next/link";
import { DocShell, type DocLang } from "@/components/DocShell";

const COPY = {
  en: {
    eyebrow: "GRYPS · ABOUT",
    h1: "Who is behind GRYPS",
    intro:
      "GRYPS is a non-commercial research & development prototype maintained by Henrique Moreira in Espoo, Finland. It scores satellite connectivity resilience for remote Nordic, Arctic, and Icelandic operations — for learning and portfolio demonstration, not as a commercial service. See the portfolio case study for the full problem → approach → prototype narrative.",
    purposeH2: "Purpose",
    purposeP:
      "Critical operators increasingly need to document connectivity risk. GRYPS produces a versioned Resilience Signature (score, grade, risks, ranked options) in about a minute so teams can see single-provider and high-latitude gaps before they become safety events. Outputs support NIS2/CER readiness documentation — they are not certification or legal advice.",
    identityH2: "Identity",
    identityItems: [
      "Maintainer: Henrique Moreira · Espoo, Finland",
      "Contact: hello@gryps.eu (or the contact form on Terms)",
      "No registered company · no revenue · no commercial activity",
      "Model v0.3 · deterministic scoring engine",
    ],
    linksH2: "Learn more",
    caseStudy: "Portfolio case study",
    researchPrototype: "Research & Prototype",
    methodology: "Scoring methodology",
    scenarios: "Mission scenarios",
    workspace: "Assessments",
    dataSources: "Data sources",
    limitations: "Limitations",
    changelog: "Methodology changelog",
    providers: "Provider index (no commercial relationships)",
    privacy: "Privacy",
    terms: "Terms & contact",
    advisor: "Generate Resilience Signature",
  },
  fi: {
    eyebrow: "GRYPS · TIETOA",
    h1: "Kuka on GRYPS:n takana",
    intro:
      "GRYPS on ei-kaupallinen tutkimus- ja kehitysprototyyppi, jota ylläpitää Henrique Moreira Espoossa. Se pisteyttää satelliittiyhteyksien resilienssiä pohjoismaisissa, arktisissa ja islantilaisissa kohteissa — oppimista ja portfoliodemonstraatiota varten, ei kaupallisena palveluna. Katso portfoliocase study kokonaisuudesta: ongelma → lähestymistapa → prototyyppi.",
    purposeH2: "Tarkoitus",
    purposeP:
      "Kriittisten toimijoiden on yhä useammin dokumentoitava yhteysriski. GRYPS tuottaa versioidun Resilience Signaturen (pisteet, arvosana, riskit, toimittajasuositukset) noin minuutissa, jotta yhden toimittajan ja korkeiden leveysasteiden riskit näkyvät ennen kuin niistä tulee turvallisuustapahtumia. Tulosteet tukevat NIS2/CER-valmiusdokumentaatiota — ne eivät ole sertifiointi eivätkä oikeudellinen neuvonta.",
    identityH2: "Identiteetti",
    identityItems: [
      "Ylläpitäjä: Henrique Moreira · Espoo, Suomi",
      "Yhteystieto: hello@gryps.eu (tai Ehdot-sivun lomake)",
      "Ei rekisteröityä yritystä · ei tuloja · ei kaupallista toimintaa",
      "Malli v0.3 · deterministinen pisteytysmoottori",
    ],
    linksH2: "Lue lisää",
    caseStudy: "Portfoliocase study",
    researchPrototype: "Tutkimus ja prototyyppi",
    methodology: "Pisteytysmenetelmä",
    scenarios: "Tehtäväskenaariot",
    workspace: "Arviot",
    dataSources: "Datalähteet",
    limitations: "Rajoitteet",
    changelog: "Menetelmän muutosloki",
    providers: "Toimittajahakemisto (ei kaupallisia suhteita)",
    privacy: "Tietosuoja",
    terms: "Ehdot ja yhteydenotto",
    advisor: "Luo Resilience Signature",
  },
} as const;

function AboutArticle({ lang }: { lang: DocLang }) {
  const t = COPY[lang];
  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 32px 0" }}>
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
          marginBottom: 28,
        }}
      >
        {t.intro}
      </p>

      <h2 style={h2}>{t.purposeH2}</h2>
      <p style={p}>{t.purposeP}</p>

      <h2 style={h2}>{t.identityH2}</h2>
      <ul style={ul}>
        {t.identityItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 style={h2}>{t.linksH2}</h2>
      <ul style={{ ...ul, listStyle: "none", paddingLeft: 0 }}>
        <li style={{ marginBottom: 8 }}>
          <Link href="/case-study" style={{ color: "var(--accent-blue)" }}>
            {t.caseStudy}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/research-prototype" style={{ color: "var(--accent-blue)" }}>
            {t.researchPrototype}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/methodology" style={{ color: "var(--accent-blue)" }}>
            {t.methodology}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/data-sources" style={{ color: "var(--accent-blue)" }}>
            {t.dataSources}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/limitations" style={{ color: "var(--accent-blue)" }}>
            {t.limitations}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/changelog" style={{ color: "var(--accent-blue)" }}>
            {t.changelog}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/scenarios" style={{ color: "var(--accent-blue)" }}>
            {t.scenarios}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/workspace" style={{ color: "var(--accent-blue)" }}>
            {t.workspace}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/providers" style={{ color: "var(--accent-blue)" }}>
            {t.providers}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/privacy" style={{ color: "var(--accent-blue)" }}>
            {t.privacy}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/terms" style={{ color: "var(--accent-blue)" }}>
            {t.terms}
          </Link>
        </li>
        <li style={{ marginBottom: 8 }}>
          <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>
            {t.advisor}
          </Link>
        </li>
      </ul>
    </article>
  );
}

export function AboutView() {
  return <DocShell>{(lang) => <AboutArticle lang={lang} />}</DocShell>;
}

const h2 = {
  fontFamily: "var(--font-ui)",
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text)",
  margin: "28px 0 10px",
} as const;
const p = {
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  marginBottom: 12,
} as const;
const ul = {
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  paddingLeft: 20,
  marginBottom: 12,
} as const;

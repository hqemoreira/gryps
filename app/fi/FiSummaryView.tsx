"use client";
import type { CSSProperties } from "react";
import Link from "next/link";
import { DocShell } from "@/components/DocShell";
import { PrototypeDisclaimerBanner, ResearchDocsNav } from "@/components/ResearchDocsNav";
import {
  GRADE_BANDS_SUMMARY,
  METHODOLOGY_LABEL,
  SCORING_ENGINE_DISPLAY,
  SCORING_MODEL_LABEL,
} from "@/lib/model-constants";

/**
 * Finnish front-door summary — not full i18n of every page.
 * Sitewide EN/FI toggle remains on all product surfaces.
 */
function Article() {
  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
      <ResearchDocsNav lang="fi" active="research-prototype" />
      <p style={eyebrow}>GRYPS · SUOMENKIELINEN TIIVISTELMÄ · {METHODOLOGY_LABEL}</p>
      <h1 style={h1}>Mitä GRYPS on</h1>
      <p style={lead}>
        GRYPS on kokeellinen, ei-kaupallinen tutkimusprototyyppi pohjoismaisten, arktisten ja
        islantilaisten kohteiden yhteysresilienssin arviointiin. Se tuottaa{" "}
        <strong style={{ color: "var(--text)", fontWeight: 600 }}>Resilience Signaturen</strong> —
        pisteen (0–100), arvosanan, riskit ja sijoitetut yhteysvaihtoehdot — dokumentoidulla,
        deterministisellä mallilla.
      </p>
      <PrototypeDisclaimerBanner lang="fi" />

      <h2 style={h2}>Mitä GRYPS ei ole</h2>
      <ul style={ul}>
        <li>Ei hankintaneuvontaa, tarjousta eikä myyntiä</li>
        <li>Ei kattavuussertifiointia eikä live-RF-seurantaa</li>
        <li>Ei teknistä suunnittelutoimeksiantoa eikä NIS2/CER-oikeudellista neuvontaa</li>
        <li>Ei SaaS-kauppaa — tutkimus- ja prototyyppivaihe</li>
      </ul>

      <h2 style={h2}>Miten piste toimii</h2>
      <p style={p}>
        {SCORING_MODEL_LABEL} ({SCORING_ENGINE_DISPLAY}) laskee kaksi kerrosta:{" "}
        <strong style={{ color: "var(--text)", fontWeight: 600 }}>Paikan olosuhteet</strong> (0–20,
        mm. leveysaste) ja{" "}
        <strong style={{ color: "var(--text)", fontWeight: 600 }}>Lievennyksen laatu</strong>{" "}
        (0–80: redundanssi, toimittaja-/polkuriippumattomuus, profiili–autonomia), sitten kovat
        katot. Arvosanakaistat: {GRADE_BANDS_SUMMARY}.
      </p>
      <p style={p}>
        Valinnainen tekoälyteksti voi selittää tulosta — se ei koskaan muuta pistettä, arvosanaa,
        riskejä tai sijoituksia. Mimir on dokumentaatio- ja tulos-Q&A; Resilience Advisor on
        deterministinen arviointilomake.
      </p>

      <h2 style={h2}>Seuraavat askeleet</h2>
      <ul style={ul}>
        <li>
          <Link href="/#advisor" style={{ color: "var(--accent-blue)" }}>
            Luo Resilience Signature →
          </Link>
        </li>
        <li>
          <Link href="/methodology" style={{ color: "var(--accent-blue)" }}>
            Menetelmä →
          </Link>
        </li>
        <li>
          <Link href="/research" style={{ color: "var(--accent-blue)" }}>
            Research Library →
          </Link>
        </li>
        <li>
          <Link href="/research-prototype" style={{ color: "var(--accent-blue)" }}>
            Tutkimus ja prototyyppi →
          </Link>
        </li>
        <li>
          <Link href="/" style={{ color: "var(--accent-blue)" }}>
            Etusivu (EN/FI-vaihto koko tuotteessa) →
          </Link>
        </li>
      </ul>
    </article>
  );
}

export function FiSummaryView() {
  return <DocShell defaultLang="fi">{() => <Article />}</DocShell>;
}

const eyebrow: CSSProperties = {
  fontFamily: "var(--font-data)",
  fontSize: 10,
  color: "var(--text-dim)",
  letterSpacing: "0.12em",
};
const h1: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 34,
  fontWeight: 700,
  color: "var(--text)",
  letterSpacing: "-0.02em",
  margin: "16px 0 20px",
  maxWidth: 720,
};
const h2: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text)",
  margin: "28px 0 10px",
};
const lead: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 16,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  marginBottom: 16,
  maxWidth: 720,
};
const p: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  marginBottom: 12,
};
const ul: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--text-muted)",
  lineHeight: 1.75,
  paddingLeft: 20,
  marginBottom: 12,
};

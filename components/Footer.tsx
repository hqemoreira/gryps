"use client"
import Link from "next/link"
import { GrypsMark } from "@/components/GrypsMark"

const MODEL_SHORT = "v0.3"

const COPY = {
  en: {
    tagDefault: "Built in Finland for high-latitude resilience.",
    product: "PRODUCT",
    resources: "RESOURCES",
    legal: "LEGAL",
    score: "Generate Resilience Signature",
    map: "Explore",
    research: "Research Library",
    scenarios: "Scenarios",
    workspace: "Workspace",
    providers: "Providers",
    about: "About",
    caseStudy: "Case study",
    roadmap: "Roadmap",
    methodology: "Methodology",
    knowledge: "Knowledge",
    dataSources: "Data sources",
    assumptions: "Assumptions",
    limitations: "Limitations",
    changelog: "Changelog",
    terms: "Terms",
    privacy: "Privacy",
    modelMeta: `MODEL ${MODEL_SHORT} · ESPOO, FINLAND`,
  },
  fi: {
    tagDefault: "Rakennettu Suomessa korkeiden leveysasteiden yhteysresilienssiä varten.",
    product: "TUOTE",
    resources: "RESURSSIT",
    legal: "OIKEUDELLINEN",
    score: "Luo Resilience Signature",
    map: "Tutki",
    research: "Research Library",
    scenarios: "Skenaariot",
    workspace: "Workspace",
    providers: "Toimittajat",
    about: "Tietoa",
    caseStudy: "Case study",
    roadmap: "Roadmap",
    methodology: "Menetelmä",
    knowledge: "Tieto",
    dataSources: "Datalähteet",
    assumptions: "Oletukset",
    limitations: "Rajoitteet",
    changelog: "Muutosloki",
    terms: "Ehdot",
    privacy: "Tietosuoja",
    modelMeta: `MALLI ${MODEL_SHORT} · ESPOO, SUOMI`,
  },
}

export function Footer({
  lang = "en",
  footerRights,
  footerTag,
  secondaryLink,
}: {
  lang?: "en" | "fi"
  footerRights: string
  footerTag?: string
  /** Optional contextual product link (e.g. Back to GRYPS). Skipped if it duplicates Capacity map. */
  secondaryLink?: { href: string; label: string }
}) {
  const t = COPY[lang]
  const tag = footerTag ?? t.tagDefault
  const showExtra =
    secondaryLink &&
    secondaryLink.href !== "/map" &&
    secondaryLink.href !== "/providers"

  return (
    <footer id="gryps-footer" className="gryps-footer gryps-no-print">
      <div className="gryps-footer-inner">
        <div className="gryps-footer-top">
          <div className="gryps-footer-brand">
            <Link href="/" className="gryps-footer-mark">
              <GrypsMark size={22} animate />
              GRYPS
            </Link>
            <p className="gryps-footer-tag">{tag}</p>
          </div>

          <nav className="gryps-footer-cols" aria-label={lang === "fi" ? "Alatunniste" : "Footer"}>
            <div className="gryps-footer-col">
              <p className="gryps-footer-col-label">{t.product}</p>
              <Link href="/#advisor">{t.score}</Link>
              <Link href="/map">{t.map}</Link>
              <Link href="/research">{t.research}</Link>
              <Link href="/scenarios">{t.scenarios}</Link>
              <Link href="/workspace">{t.workspace}</Link>
              <Link href="/providers">{t.providers}</Link>
              {showExtra && secondaryLink && (
                <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
              )}
            </div>
            <div className="gryps-footer-col">
              <p className="gryps-footer-col-label">{t.resources}</p>
              <Link href="/about">{t.about}</Link>
              <Link href="/case-study">{t.caseStudy}</Link>
              <Link href="/roadmap">{t.roadmap}</Link>
              <Link href="/methodology">{t.methodology}</Link>
              <Link href="/data-sources">{t.dataSources}</Link>
              <Link href="/assumptions">{t.assumptions}</Link>
              <Link href="/limitations">{t.limitations}</Link>
              <Link href="/changelog">{t.changelog}</Link>
              <Link href="/knowledge">{t.knowledge}</Link>
            </div>
            <div className="gryps-footer-col">
              <p className="gryps-footer-col-label">{t.legal}</p>
              <Link href="/terms">{t.terms}</Link>
              <Link href="/privacy">{t.privacy}</Link>
            </div>
          </nav>
        </div>

        <div className="gryps-footer-rule" aria-hidden="true" />

        <div className="gryps-footer-bottom">
          <span className="gryps-footer-copy">{footerRights}</span>
          <span className="gryps-footer-model">{t.modelMeta}</span>
        </div>
      </div>
    </footer>
  )
}

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
    score: "Score my site",
    map: "Capacity map",
    providers: "Providers",
    about: "About",
    methodology: "Methodology",
    knowledge: "Knowledge",
    terms: "Terms",
    privacy: "Privacy",
    modelMeta: `MODEL ${MODEL_SHORT} · ESPOO, FINLAND`,
  },
  fi: {
    tagDefault: "Rakennettu Suomessa korkeiden leveysasteiden yhteysresilienssiä varten.",
    product: "TUOTE",
    resources: "RESURSSIT",
    legal: "OIKEUDELLINEN",
    score: "Pisteytä kohde",
    map: "Kapasiteettikartta",
    providers: "Toimittajat",
    about: "Tietoa",
    methodology: "Menetelmä",
    knowledge: "Tieto",
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
              <Link href="/providers">{t.providers}</Link>
              {showExtra && secondaryLink && (
                <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
              )}
            </div>
            <div className="gryps-footer-col">
              <p className="gryps-footer-col-label">{t.resources}</p>
              <Link href="/about">{t.about}</Link>
              <Link href="/methodology">{t.methodology}</Link>
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

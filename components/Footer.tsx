"use client";
import Link from "next/link";
import { GrypsMark } from "@/components/GrypsMark";
import { CTA_FULL, IA_LEGAL, IA_MODES, IA_REFERENCE, labelFor } from "@/lib/ia-nav";

const MODEL_SHORT = "v0.3";

export function Footer({
  lang = "en",
  footerRights,
  footerTag,
  secondaryLink,
}: {
  lang?: "en" | "fi";
  footerRights: string;
  footerTag?: string;
  secondaryLink?: { href: string; label: string };
}) {
  const tag =
    footerTag ??
    (lang === "en"
      ? "Built in Finland for high-latitude resilience."
      : "Rakennettu Suomessa korkeiden leveysasteiden yhteysresilienssiä varten.");
  const showExtra =
    secondaryLink && secondaryLink.href !== "/map" && secondaryLink.href !== "/providers";

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
            {IA_MODES.map((mode) => (
              <div key={mode.id} className="gryps-footer-col">
                <p className="gryps-footer-col-label">{labelFor(mode, lang).toUpperCase()}</p>
                {mode.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {labelFor(item, lang)}
                  </Link>
                ))}
                {mode.id === "assess" && (
                  <Link href="/#advisor">{lang === "fi" ? CTA_FULL.fi : CTA_FULL.en}</Link>
                )}
              </div>
            ))}
            <div className="gryps-footer-col">
              <p className="gryps-footer-col-label">{lang === "fi" ? "VIITE" : "REFERENCE"}</p>
              {IA_REFERENCE.map((item) => (
                <Link key={item.href} href={item.href}>
                  {labelFor(item, lang)}
                </Link>
              ))}
              {showExtra && secondaryLink && (
                <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
              )}
              {IA_LEGAL.map((item) => (
                <Link key={item.href} href={item.href}>
                  {labelFor(item, lang)}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="gryps-footer-rule" aria-hidden="true" />

        <div className="gryps-footer-bottom">
          <span className="gryps-footer-copy">{footerRights}</span>
          <span className="gryps-footer-model">
            {lang === "fi"
              ? `MALLI ${MODEL_SHORT} · ESPOO, SUOMI`
              : `MODEL ${MODEL_SHORT} · ESPOO, FINLAND`}
          </span>
        </div>
      </div>
    </footer>
  );
}

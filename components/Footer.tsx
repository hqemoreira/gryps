"use client";
import Link from "next/link";
import { GrypsMark } from "@/components/GrypsMark";
import { FOOTER_GROUPS, labelFor } from "@/lib/ia-nav";

const MODEL_SHORT = "v0.4";

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
    secondaryLink &&
    !FOOTER_GROUPS.some((g) => g.items.some((i) => i.href === secondaryLink.href));

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
            {FOOTER_GROUPS.map((group) => (
              <div key={group.id} className="gryps-footer-col">
                <p className="gryps-footer-col-label">{labelFor(group, lang).toUpperCase()}</p>
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {labelFor(item, lang)}
                  </Link>
                ))}
                {group.id === "use" && showExtra && secondaryLink && (
                  <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
                )}
              </div>
            ))}
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

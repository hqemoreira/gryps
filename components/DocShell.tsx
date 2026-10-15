"use client";
import { type ReactNode, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { grypsCopyright } from "@/lib/gryps-copyright";
import { useLang, type Lang } from "@/lib/use-lang";
import { CTA_SHORT } from "@/lib/ia-nav";

export type DocLang = Lang;

export function DocShell({
  children,
  ctaHref = "/#advisor",
  defaultLang = "en",
}: {
  children: ReactNode | ((lang: DocLang) => ReactNode);
  ctaHref?: string;
  /** Prefer this locale on first paint (e.g. /fi summary). */
  defaultLang?: DocLang;
  /** @deprecated Chrome CTA comes from IA short label */
  ctaLabel?: string;
}) {
  const [lang, setLang] = useLang(defaultLang);
  const content = typeof children === "function" ? children(lang) : children;

  useEffect(() => {
    if (defaultLang === "fi") setLang("fi");
  }, [defaultLang, setLang]);

  useEffect(() => {
    if (!document.documentElement.style.getPropertyValue("--gryps-header-h")) {
      document.documentElement.style.setProperty("--gryps-header-h", "52px");
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref={ctaHref}
        ctaLabel={lang === "fi" ? CTA_SHORT.fi : CTA_SHORT.en}
        useIaNav
      />
      <main className="gryps-main-under-nav" style={{ paddingBottom: 48 }}>
        {content}
      </main>
      <Footer
        lang={lang}
        footerRights={grypsCopyright(
          lang,
          lang === "en" ? "Non-commercial R&D prototype" : "Ei-kaupallinen T&K-prototyyppi"
        )}
        footerTag={
          lang === "en"
            ? "Built in Finland for high-latitude resilience."
            : "Rakennettu Suomessa korkeiden leveysasteiden yhteysresilienssiä varten."
        }
        secondaryLink={{ href: "/map", label: lang === "en" ? "Explore" : "Tutki" }}
      />
    </div>
  );
}

"use client"
import { type ReactNode, useEffect } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"
import { useLang, type Lang } from "@/lib/use-lang"

export type DocLang = Lang

export function DocShell({
  children,
  ctaHref = "/#advisor",
  ctaLabel = "Generate Resilience Signature",
}: {
  children: ReactNode | ((lang: DocLang) => ReactNode)
  ctaHref?: string
  ctaLabel?: string
}) {
  const [lang, setLang] = useLang()
  const content = typeof children === "function" ? children(lang) : children

  useEffect(() => {
    if (!document.documentElement.style.getPropertyValue("--gryps-header-h")) {
      document.documentElement.style.setProperty("--gryps-header-h", "52px")
    }
  }, [])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref={ctaHref}
        ctaLabel={lang === "fi" ? "Luo Resilience Signature" : ctaLabel}
        extraLinks={[
          { href: "/case-study", label: lang === "en" ? "Case study" : "Case study" },
          { href: "/research-prototype", label: lang === "en" ? "Research & Prototype" : "Tutkimus ja prototyyppi" },
          { href: "/about", label: lang === "en" ? "About" : "Tietoa" },
          { href: "/research", label: "Research Library" },
          { href: "/scenarios", label: lang === "en" ? "Scenarios" : "Skenaariot" },
          { href: "/workspace", label: "Workspace" },
          { href: "/map", label: lang === "en" ? "Explore" : "Tutki" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
          { href: "/knowledge", label: lang === "en" ? "Knowledge" : "Tieto" },
          { href: "/providers", label: lang === "en" ? "Providers" : "Toimittajat" },
        ]}
      />
      <main className="gryps-main-under-nav" style={{ paddingBottom: 48 }}>{content}</main>
      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en"
          ? "Non-commercial R&D prototype"
          : "Ei-kaupallinen T&K-prototyyppi")}
        footerTag={lang === "en"
          ? "Built in Finland for high-latitude resilience."
          : "Rakennettu Suomessa korkeiden leveysasteiden yhteysresilienssiä varten."}
        secondaryLink={{ href: "/map", label: lang === "en" ? "Explore" : "Tutki" }}
      />
    </div>
  )
}

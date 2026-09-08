"use client"
import { useState, type ReactNode } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"

export type DocLang = "en" | "fi"

export function DocShell({
  children,
  ctaHref = "/#advisor",
  ctaLabel = "Demo analysis",
}: {
  children: ReactNode | ((lang: DocLang) => ReactNode)
  ctaHref?: string
  ctaLabel?: string
}) {
  const [lang, setLang] = useState<DocLang>("en")
  const content = typeof children === "function" ? children(lang) : children

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref={ctaHref}
        ctaLabel={lang === "fi" ? "Demo-analyysi" : ctaLabel}
        extraLinks={[
          { href: "/about", label: lang === "en" ? "About" : "Tietoa" },
          { href: "/map", label: lang === "en" ? "Capacity map" : "Kapasiteettikartta" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
          { href: "/providers", label: lang === "en" ? "Providers" : "Toimittajat" },
        ]}
      />
      <main style={{ paddingTop: 72, paddingBottom: 48 }}>{content}</main>
      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en"
          ? "Non-commercial R&D prototype"
          : "Ei-kaupallinen T&K-prototyyppi")}
        footerTag={lang === "en"
          ? "Built in Finland for high-latitude resilience."
          : "Rakennettu Suomessa korkean leveysasteen resilienssille."}
        secondaryLink={{ href: "/map", label: lang === "en" ? "Capacity map" : "Kapasiteettikartta" }}
      />
    </div>
  )
}

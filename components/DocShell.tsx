"use client"
import { useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { grypsCopyright } from "@/lib/gryps-copyright"

export function DocShell({
  children,
  ctaHref = "/#advisor",
  ctaLabel = "Demo analysis",
}: {
  children: React.ReactNode
  ctaHref?: string
  ctaLabel?: string
}) {
  const [lang, setLang] = useState<"en" | "fi">("en")
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <Header
        lang={lang}
        onLangChange={setLang}
        ctaHref={ctaHref}
        ctaLabel={lang === "fi" ? "Demo-analyysi" : ctaLabel}
        extraLinks={[
          { href: "/map", label: lang === "en" ? "Capacity map" : "Kapasiteettikartta" },
          { href: "/methodology", label: lang === "en" ? "Methodology" : "Menetelmä" },
          { href: "/providers", label: lang === "en" ? "Providers" : "Toimittajat" },
        ]}
      />
      <main style={{ paddingTop: 72, paddingBottom: 48 }}>{children}</main>
      <Footer
        lang={lang}
        footerRights={grypsCopyright(lang, lang === "en"
          ? "Espoo, Finland · Non-commercial R&D prototype · No registered company · No revenue generated"
          : "Espoo, Suomi · Ei-kaupallinen T&K-prototyyppi · Ei rekisteröityä yritystä · Ei tuloja")}
        secondaryLink={{ href: "/map", label: lang === "en" ? "Capacity map" : "Kapasiteettikartta" }}
      />
    </div>
  )
}

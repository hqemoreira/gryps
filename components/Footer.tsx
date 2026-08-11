"use client"
import Link from "next/link"
import { GrypsMark } from "@/components/GrypsMark"

/** Copyright line — always includes All rights reserved / Kaikki oikeudet pidätetään. */
export function grypsCopyright(lang: "en" | "fi" = "en", meta?: string): string {
  const year = new Date().getFullYear()
  const rights = lang === "fi" ? "Kaikki oikeudet pidätetään" : "All rights reserved"
  const base = `© ${year} GRYPS · ${rights}`
  return meta ? `${base} · ${meta}` : base
}

export function Footer({
  lang,
  footerRights,
  footerTag,
  secondaryLink,
}: {
  lang?: "en" | "fi"
  footerRights: string
  footerTag?: string
  secondaryLink?: { href: string; label: string }
}) {
  return (
    <footer className="gryps-footer gryps-section-pad" style={{
      borderTop: "1px solid var(--border)", padding: "20px 32px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <GrypsMark size={18} animate />
        <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em" }}>GRYPS</span>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>{footerRights}</span>
        {secondaryLink && (
          <Link href={secondaryLink.href} style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
            {secondaryLink.label}
          </Link>
        )}
        <Link href="/legal/terms" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
          {lang === "fi" ? "Ehdot" : "Terms"}
        </Link>
        <Link href="/legal/privacy" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
          {lang === "fi" ? "Tietosuoja" : "Privacy"}
        </Link>
      </div>

      {footerTag && <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>{footerTag}</span>}
    </footer>
  )
}

"use client"
import Link from "next/link"
import { GrypsMark } from "@/components/GrypsMark"

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
      borderTop: "1px solid var(--border)",
      padding: "28px var(--pad-x)",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{
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
          <Link href="/about" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
            {lang === "fi" ? "Tietoa" : "About"}
          </Link>
          <Link href="/methodology" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
            {lang === "fi" ? "Menetelmä" : "Methodology"}
          </Link>
          <Link href="/providers" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
            {lang === "fi" ? "Toimittajat" : "Providers"}
          </Link>
          <Link href="/terms" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
            {lang === "fi" ? "Ehdot" : "Terms"}
          </Link>
          <Link href="/privacy" style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", textDecoration: "none" }}>
            {lang === "fi" ? "Tietosuoja" : "Privacy"}
          </Link>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
        paddingTop: 12, borderTop: "1px solid var(--border)",
      }}>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
          GRYPS · Model v0.3 · Espoo, Finland
        </span>
        {footerTag && (
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>{footerTag}</span>
        )}
      </div>
    </footer>
  )
}

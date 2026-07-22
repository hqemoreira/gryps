"use client"
import Link from "next/link"
import { Sun, Moon } from "lucide-react"
import { GrypsMark } from "@/components/GrypsMark"
import { useTheme } from "@/context/ThemeContext"

export function Footer({
  lang,
  onLangChange,
  footerRights,
  footerTag,
  secondaryLink,
}: {
  lang?: "en" | "fi"
  onLangChange?: (l: "en" | "fi") => void
  footerRights: string
  footerTag?: string
  secondaryLink?: { href: string; label: string }
}) {
  const { dark, toggleDark } = useTheme()

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

        {lang && onLangChange && (
          <div style={{ display: "flex", border: "1px solid var(--border2)", borderRadius: 6, overflow: "hidden" }}>
            {(["en", "fi"] as const).map(l => (
              <button key={l} onClick={() => onLangChange(l)} style={{
                background: lang === l ? "var(--border2)" : "transparent",
                border: "none", padding: "4px 8px", cursor: "pointer",
                fontFamily: "var(--font-data)", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.06em",
                color: lang === l ? "var(--text)" : "var(--text-muted)",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        )}

        <button
          onClick={toggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            background: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: 6, width: 26, height: 26, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          {dark ? <Sun size={12} /> : <Moon size={12} />}
        </button>
      </div>

      {footerTag && <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>{footerTag}</span>}
    </footer>
  )
}

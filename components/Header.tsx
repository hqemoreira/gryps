"use client"
import Link from "next/link"
import { Sun, Moon } from "lucide-react"
import { GrypsMark } from "@/components/GrypsMark"
import { useTheme } from "@/context/ThemeContext"

type ExtraLink = { href: string; label: string }

export function Header({
  topOffset = 0,
  tagline,
  lang,
  onLangChange,
  ctaHref,
  ctaLabel,
  extraLink,
  extraLinks,
}: {
  topOffset?: number
  tagline?: string
  lang?: "en" | "fi"
  onLangChange?: (l: "en" | "fi") => void
  ctaHref: string
  ctaLabel: string
  extraLink?: ExtraLink
  extraLinks?: ExtraLink[]
}) {
  const { dark, toggleDark } = useTheme()
  const links = extraLinks ?? (extraLink ? [extraLink] : [])

  return (
    <header className="gryps-nav-inner" style={{
      position: "fixed", top: topOffset, left: 0, right: 0, zIndex: 1000,
      borderBottom: "1px solid var(--border)",
      backgroundColor: dark ? "rgba(7,11,18,0.92)" : "rgba(244,246,249,0.92)",
      backdropFilter: "blur(12px)",
      padding: "0 32px", height: 52,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <GrypsMark size={28} animate />
        <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 15, letterSpacing: "0.12em", color: "var(--text)" }}>GRYPS</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {tagline && (
          <span className="gryps-nav-label" style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>{tagline}</span>
        )}
        {links.map(link => (
          <Link key={link.href} href={link.href} className="gryps-nav-label" style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textDecoration: "none" }}>
            {link.label}
          </Link>
        ))}
        {lang && onLangChange && (
          <div style={{ display: "flex", border: "1px solid var(--border2)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {(["en", "fi"] as const).map(l => (
              <button key={l} onClick={() => onLangChange(l)} style={{
                background: lang === l ? "var(--border2)" : "transparent",
                border: "none", padding: "0 12px", minHeight: 44, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-data)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.08em",
                color: lang === l ? "var(--text)" : "var(--text-muted)",
                transition: "background 0.15s",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        )}
        <button
          onClick={toggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            background: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: "var(--radius)", width: 44, height: 44, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)", flexShrink: 0,
          }}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <a href={ctaHref} style={{
          fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 700,
          color: "var(--accent-blue)", textDecoration: "none",
          border: "1px solid rgba(79,168,255,0.3)",
          padding: "0 16px", minHeight: 44,
          display: "inline-flex", alignItems: "center", borderRadius: "var(--radius)",
        }}>{ctaLabel}</a>
      </div>
    </header>
  )
}

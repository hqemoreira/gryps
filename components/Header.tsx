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
    <header
      className="gryps-nav-inner"
      style={{
        position: "fixed",
        top: topOffset,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: "1px solid var(--border)",
        backgroundColor: dark ? "rgba(7,11,18,0.92)" : "rgba(244,246,249,0.92)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Link href="/" className="gryps-nav-brand">
        <GrypsMark size={28} animate />
        <span className="gryps-nav-wordmark">GRYPS</span>
      </Link>

      <div className="gryps-nav-actions">
        {tagline && (
          <span className="gryps-nav-label gryps-nav-tagline">{tagline}</span>
        )}
        {links.map(link => (
          <Link key={link.href} href={link.href} className="gryps-nav-label gryps-nav-link">
            {link.label}
          </Link>
        ))}
        {lang && onLangChange && (
          <div className="gryps-nav-lang" role="group" aria-label="Language">
            {(["en", "fi"] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => onLangChange(l)}
                className={lang === l ? "is-active" : undefined}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          className="gryps-nav-theme"
          onClick={toggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <a href={ctaHref} className="gryps-nav-cta">
          {ctaLabel}
        </a>
      </div>
    </header>
  )
}

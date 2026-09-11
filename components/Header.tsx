"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"
import { ChevronDown, Sun, Moon } from "lucide-react"
import { GrypsMark } from "@/components/GrypsMark"
import { useTheme } from "@/context/ThemeContext"
import {
  CTA_SHORT,
  IA_MODES,
  descFor,
  labelFor,
  type IaMode,
  type IaModeId,
} from "@/lib/ia-nav"

type ExtraLink = { href: string; label: string }

export function Header({
  topOffset = 0,
  embedded = false,
  tagline,
  lang = "en",
  onLangChange,
  ctaHref = "/#advisor",
  ctaLabel,
  extraLink,
  extraLinks,
  useIaNav = true,
}: {
  topOffset?: number
  embedded?: boolean
  tagline?: string
  lang?: "en" | "fi"
  onLangChange?: (l: "en" | "fi") => void
  ctaHref?: string
  ctaLabel?: string
  extraLink?: ExtraLink
  /** When set with useIaNav=false, flat links (legacy). Prefer IA modes. */
  extraLinks?: ExtraLink[]
  /** Default true: Explore · Assess · Research mega-menus. */
  useIaNav?: boolean
}) {
  const { dark, toggleDark } = useTheme()
  const pathname = usePathname()
  const links = extraLinks ?? (extraLink ? [extraLink] : [])
  const headerRef = useRef<HTMLElement>(null)
  const [openMode, setOpenMode] = useState<IaModeId | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuId = useId()
  const chromeCta = ctaLabel ?? (lang === "fi" ? CTA_SHORT.fi : CTA_SHORT.en)

  function goHome(e: ReactMouseEvent<HTMLAnchorElement>) {
    setOpenMode(null)
    setMobileOpen(false)
    // Same-route Link does not remount — scroll to top explicitly when already home.
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (embedded) return
    const el = headerRef.current
    if (!el) return
    const sync = () => {
      const h = Math.ceil(el.getBoundingClientRect().height)
      document.documentElement.style.setProperty("--gryps-header-h", `${h}px`)
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    window.addEventListener("resize", sync)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", sync)
    }
  }, [embedded, lang, chromeCta, openMode, mobileOpen, links.length])

  useEffect(() => {
    if (!openMode && !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMode(null)
        setMobileOpen(false)
      }
    }
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node
      if (headerRef.current && !headerRef.current.contains(t)) {
        setOpenMode(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointer)
    }
  }, [openMode, mobileOpen])

  return (
    <header
      ref={headerRef}
      className="gryps-nav-inner"
      style={{
        position: embedded ? "relative" : "fixed",
        top: embedded ? undefined : topOffset,
        left: embedded ? undefined : 0,
        right: embedded ? undefined : 0,
        zIndex: embedded ? undefined : 1000,
        borderBottom: "1px solid var(--border)",
        backgroundColor: dark ? "rgba(7,11,18,0.92)" : "rgba(244,246,249,0.92)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Link href="/" className="gryps-nav-brand" onClick={goHome} aria-label="GRYPS home">
        <GrypsMark size={28} animate />
        <span className="gryps-nav-wordmark">GRYPS</span>
        {tagline && (
          <span className="gryps-nav-tagline">{tagline}</span>
        )}
      </Link>

      <div className="gryps-nav-actions">
        {useIaNav ? (
          <>
            <nav className="gryps-ia-modes" aria-label={lang === "fi" ? "Päätilat" : "Primary modes"}>
              {IA_MODES.map(mode => (
                <ModeTrigger
                  key={mode.id}
                  mode={mode}
                  lang={lang}
                  open={openMode === mode.id}
                  menuId={`${menuId}-${mode.id}`}
                  onToggle={() => setOpenMode(o => (o === mode.id ? null : mode.id))}
                  onNavigate={() => setOpenMode(null)}
                />
              ))}
            </nav>
            <button
              type="button"
              className="gryps-ia-mobile-toggle"
              aria-expanded={mobileOpen}
              aria-controls={`${menuId}-mobile`}
              onClick={() => { setMobileOpen(v => !v); setOpenMode(null) }}
            >
              {lang === "fi" ? "Valikko" : "Menu"}
              <ChevronDown size={14} style={{ transform: mobileOpen ? "rotate(180deg)" : undefined }} />
            </button>
          </>
        ) : (
          links.map(link => (
            <Link key={link.href} href={link.href} className="gryps-nav-label gryps-nav-link">
              {link.label}
            </Link>
          ))
        )}

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
        <a href={ctaHref} className="gryps-nav-cta" onClick={() => { setOpenMode(null); setMobileOpen(false) }}>
          {chromeCta}
        </a>
      </div>

      {useIaNav && mobileOpen && (
        <div id={`${menuId}-mobile`} className="gryps-ia-mobile-panel">
          {IA_MODES.map(mode => (
            <div key={mode.id} className="gryps-ia-mobile-section">
              <p className="gryps-ia-mobile-heading">{labelFor(mode, lang)}</p>
              {mode.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="gryps-ia-panel-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="gryps-ia-panel-title">{labelFor(item, lang)}</span>
                  <span className="gryps-ia-panel-desc">{descFor(item, lang)}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  )
}

function ModeTrigger({
  mode,
  lang,
  open,
  menuId,
  onToggle,
  onNavigate,
}: {
  mode: IaMode
  lang: "en" | "fi"
  open: boolean
  menuId: string
  onToggle: () => void
  onNavigate: () => void
}) {
  return (
    <div className="gryps-ia-mode">
      <button
        type="button"
        className={`gryps-ia-mode-btn${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onToggle}
      >
        {labelFor(mode, lang)}
        <ChevronDown size={12} aria-hidden />
      </button>
      {open && (
        <div id={menuId} className="gryps-ia-panel" role="menu">
          {mode.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="gryps-ia-panel-link"
              role="menuitem"
              onClick={onNavigate}
            >
              <span className="gryps-ia-panel-title">{labelFor(item, lang)}</span>
              <span className="gryps-ia-panel-desc">{descFor(item, lang)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

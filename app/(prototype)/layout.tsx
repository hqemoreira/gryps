"use client"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Sun, Moon } from "lucide-react"
import { GrypsMark } from "@/components/GrypsMark"
import { Footer } from "@/components/Footer"
import { useTheme } from "@/context/ThemeContext"
import { grypsCopyright } from "@/lib/gryps-copyright"

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  const { dark, toggleDark } = useTheme()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/methodology", label: "Methodology" },
    { href: "/providers", label: "Providers" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ]

  useEffect(() => {
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
  }, [pathname])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <header
        ref={headerRef}
        className="gryps-nav-inner"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          borderBottom: "1px solid var(--border)",
          backgroundColor: dark ? "rgba(7,11,18,0.92)" : "rgba(244,246,249,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <Link href="/" className="gryps-nav-brand" style={{ maxWidth: "none" }}>
            <GrypsMark size={24} animate />
            <span className="gryps-nav-wordmark">GRYPS</span>
          </Link>
          <div className="gryps-prototype-midnav" style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="gryps-nav-label gryps-nav-link" style={{
                color: pathname === l.href ? "var(--text)" : "var(--text-muted)",
                borderBottom: pathname === l.href ? "1px solid var(--accent-blue)" : "1px solid transparent",
                paddingBottom: 2,
              }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div className="gryps-nav-actions" style={{ flex: "0 0 auto" }}>
          <Link href="/" className="gryps-nav-label">← Back to GRYPS</Link>
          <button
            type="button"
            className="gryps-nav-theme"
            onClick={toggleDark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      <main className="gryps-main-under-nav">
        {children}
      </main>

      <Footer
        footerRights={grypsCopyright("en", "Non-commercial R&D prototype")}
        secondaryLink={{ href: "/", label: "Back to GRYPS" }}
      />
    </div>
  )
}

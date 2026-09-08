"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Moon } from "lucide-react"
import { GrypsMark } from "@/components/GrypsMark"
import { useTheme } from "@/context/ThemeContext"

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  const { dark, toggleDark } = useTheme()
  const pathname = usePathname()

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/methodology", label: "Methodology" },
    { href: "/providers", label: "Providers" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ]

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <header className="gryps-nav-inner" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        borderBottom: "1px solid var(--border)",
        backgroundColor: dark ? "rgba(7,11,18,0.92)" : "rgba(244,246,249,0.92)",
        backdropFilter: "blur(12px)",
        padding: "0 32px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", minWidth: 0 }}>
            <GrypsMark size={24} animate />
            <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", color: "var(--text)" }}>GRYPS</span>
          </Link>
          <div style={{ width: 1, height: 16, backgroundColor: "var(--border)", flexShrink: 0 }} />
          <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
                color: pathname === l.href ? "var(--text)" : "var(--text-muted)",
                textDecoration: "none",
                borderBottom: pathname === l.href ? "1px solid var(--accent-blue)" : "1px solid transparent",
                paddingBottom: 2,
              }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <Link href="/" className="gryps-nav-label" style={{
            fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600,
            color: "var(--text-muted)", textDecoration: "none",
            whiteSpace: "nowrap",
          }}>← Back to GRYPS</Link>
          <button
            onClick={toggleDark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: 6, width: 44, height: 44, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      <main style={{ paddingTop: 52 }}>
        {children}
      </main>

      <footer className="gryps-footer gryps-section-pad" style={{
        borderTop: "1px solid var(--border)", padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
        marginTop: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GrypsMark size={16} animate />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
            GRYPS
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>
          © {new Date().getFullYear()} GRYPS · Non-commercial R&D prototype · No registered company · No revenue
        </span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>Espoo, Finland · EU</span>
      </footer>
    </div>
  )
}

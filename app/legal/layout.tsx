"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const DARK: Record<string, string> = {
  "--bg": "#070B12", "--surface": "#0B1220", "--surface2": "#111827",
  "--border": "#1E293B", "--border2": "#253347",
  "--text": "#F7FAFC", "--text-muted": "#64748B", "--text-dim": "#334155",
}
const LIGHT: Record<string, string> = {
  "--bg": "#F4F6F9", "--surface": "#FFFFFF", "--surface2": "#EEF1F6",
  "--border": "#DDE2EC", "--border2": "#C8D0DE",
  "--text": "#0B1220", "--text-muted": "#5A6A84", "--text-dim": "#9AAABF",
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const vars = dark ? DARK : LIGHT
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
  }, [dark])

  const navLinks = [
    { href: "/legal/terms",   label: "Terms & Conditions" },
    { href: "/legal/privacy", label: "Privacy Policy" },
  ]

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Nav */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        backgroundColor: "rgba(7,11,18,0.92)",
        backdropFilter: "blur(12px)",
        padding: "0 32px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
              <path d="M4 18 A14 14 0 0 1 32 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
              <path d="M8 18 A10 10 0 0 1 28 18" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75"/>
              <path d="M12 18 A6 6 0 0 1 24 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <line x1="18" y1="20" x2="18" y2="10" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M15 13 L18 9 L21 13" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="18" cy="21" r="1.5" fill="#4FA8FF"/>
            </svg>
            <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", color: "var(--text)" }}>GRYPS</span>
          </Link>
          <div style={{ width: 1, height: 16, backgroundColor: "var(--border)" }} />
          <div style={{ display: "flex", gap: 16 }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
                color: pathname === l.href ? "var(--text)" : "var(--text-muted)",
                textDecoration: "none",
                borderBottom: pathname === l.href ? "1px solid #4FA8FF" : "1px solid transparent",
                paddingBottom: 2,
              }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{
            fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600,
            color: "var(--text-muted)", textDecoration: "none",
          }}>← Back to GRYPS</Link>
          <button onClick={() => setDark(d => !d)} style={{
            background: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: 6, width: 30, height: 30, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)", fontSize: 13,
          }}>{dark ? "☀" : "☾"}</button>
        </div>
      </header>

      <main style={{ paddingTop: 52 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 64,
      }}>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>GRYPS LEGAL</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>© 2026 GRYPS · Non-commercial R&D prototype</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)" }}>Espoo, Finland · EU</span>
      </footer>
    </div>
  )
}

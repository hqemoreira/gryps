"use client"
import { createContext, useContext, useEffect, useState } from "react"

// Accent colors below are the same brand hues in both themes, but the DARK
// values (tuned for near-black surfaces) fail WCAG AA when reused as text on
// LIGHT mode's near-white surfaces — verified against --surface/--bg/--surface2,
// see contrast-check.js. LIGHT accent values are deliberately darker variants
// of the same hue, each ≥4.5:1 on all three light surfaces.
const DARK: Record<string, string> = {
  "--bg": "#070B12", "--surface": "#0B1220", "--surface2": "#111827",
  "--surface-elevated": "#0E1628",
  "--border": "#1E293B", "--border2": "#253347",
  "--text": "#F7FAFC", "--text-muted": "#64748B", "--text-dim": "#334155",
  "--accent-blue": "#4FA8FF", "--accent-cyan": "#6EE7F9", "--accent-green": "#2ED47A",
  "--accent-amber": "#D97706", "--accent-red": "#EF4444",
  "--aurora-1": "#63E2C0", "--aurora-2": "#8B8FE8",
  "--aurora-gradient": "linear-gradient(90deg, #63E2C0, #8B8FE8)",
  "--glow-aurora": "radial-gradient(circle at 78% 8%, rgba(99, 226, 192, 0.14) 0%, transparent 42%), radial-gradient(circle at 88% 28%, rgba(139, 143, 232, 0.10) 0%, transparent 48%)",
  "--shadow-card": "0 8px 32px rgba(0, 0, 0, 0.35)",
  "--cta-gradient": "linear-gradient(135deg, #4FA8FF 0%, #6EE7F9 100%)",
}
const LIGHT: Record<string, string> = {
  "--bg": "#F4F6F9", "--surface": "#FFFFFF", "--surface2": "#EEF1F6",
  "--surface-elevated": "#FFFFFF",
  "--border": "#DDE2EC", "--border2": "#C8D0DE",
  "--text": "#0B1220", "--text-muted": "#5A6A84", "--text-dim": "#586886",
  "--accent-blue": "#0B5FBF", "--accent-cyan": "#0B7680", "--accent-green": "#146B3E",
  "--accent-amber": "#9A4508", "--accent-red": "#C41E1E",
  "--aurora-1": "#2A9A7A", "--aurora-2": "#5B5FA8",
  "--aurora-gradient": "linear-gradient(90deg, #2A9A7A, #5B5FA8)",
  "--glow-aurora": "radial-gradient(circle at 78% 8%, rgba(42, 154, 122, 0.10) 0%, transparent 42%), radial-gradient(circle at 88% 28%, rgba(91, 95, 168, 0.08) 0%, transparent 48%)",
  "--shadow-card": "0 8px 28px rgba(11, 18, 32, 0.08)",
  "--cta-gradient": "linear-gradient(135deg, #0B5FBF 0%, #0B7680 100%)",
}

const STORAGE_KEY = "gryps-theme"

type ThemeContextValue = { dark: boolean; toggleDark: () => void }
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  // Read persisted preference once on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light") setDark(false)
    setHydrated(true)
  }, [])

  // Apply CSS variables whenever theme changes, and persist once hydrated
  useEffect(() => {
    const vars = dark ? DARK : LIGHT
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
    if (hydrated) localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light")
  }, [dark, hydrated])

  return (
    <ThemeContext.Provider value={{ dark, toggleDark: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

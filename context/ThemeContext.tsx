"use client"
import { createContext, useContext, useEffect, useState } from "react"

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

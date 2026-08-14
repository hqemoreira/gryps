/** Copyright line — always includes All rights reserved / Kaikki oikeudet pidätetään. */
export function grypsCopyright(lang: "en" | "fi" = "en", meta?: string): string {
  const year = new Date().getFullYear()
  const rights = lang === "fi" ? "Kaikki oikeudet pidätetään" : "All rights reserved"
  const base = `© ${year} GRYPS · ${rights}`
  return meta ? `${base} · ${meta}` : base
}

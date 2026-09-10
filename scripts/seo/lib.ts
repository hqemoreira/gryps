import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

export const SEO_DIR = resolve(process.cwd(), "seo")

export function ensureSeoDir() {
  mkdirSync(SEO_DIR, { recursive: true })
}

export function writeJson(filename: string, data: unknown) {
  ensureSeoDir()
  const path = join(SEO_DIR, filename)
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8")
  return path
}

export function readJson<T>(filename: string): T | null {
  const path = join(SEO_DIR, filename)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, "utf8")) as T
}

export function daysAgoIso(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Load service-account credentials without ever printing the key. */
export function loadGoogleCredentials(): object {
  const inline = process.env.GSC_SERVICE_ACCOUNT_JSON
  if (inline?.trim()) {
    return JSON.parse(inline) as object
  }
  const path =
    process.env.GSC_CREDENTIALS_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!path) {
    throw new Error(
      "Set GSC_CREDENTIALS_PATH, GOOGLE_APPLICATION_CREDENTIALS, or GSC_SERVICE_ACCOUNT_JSON. See scripts/seo/README.md.",
    )
  }
  const abs = resolve(path)
  if (!existsSync(abs)) {
    throw new Error(`Credentials file not found: ${abs}`)
  }
  return JSON.parse(readFileSync(abs, "utf8")) as object
}

export function requireSiteUrl(): string {
  const site = process.env.GSC_SITE_URL?.trim()
  if (!site) {
    throw new Error(
      "Set GSC_SITE_URL to your Search Console property (e.g. https://gryps.vercel.app/).",
    )
  }
  return site
}

export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith("--")) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith("--")) {
      out[key] = true
    } else {
      out[key] = next
      i++
    }
  }
  return out
}

export function repoRelative(absPath: string): string {
  return absPath.replace(process.cwd() + "\\", "").replace(process.cwd() + "/", "")
}

export function safeMkdirFor(filePath: string) {
  mkdirSync(dirname(filePath), { recursive: true })
}

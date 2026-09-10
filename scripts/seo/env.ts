/**
 * Optional local env loader for SEO scripts.
 * Reads %USERPROFILE%\.config\gryps\seo.env (Windows) or ~/.config/gryps/seo.env
 * Does NOT read project .env / .env.local (repo security rule).
 */
import { existsSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

export const GRYPS_CONFIG_DIR = join(homedir(), ".config", "gryps")
export const GSC_DEFAULT_KEY_PATH = join(GRYPS_CONFIG_DIR, "gsc-service-account.json")
export const SEO_ENV_PATH = join(GRYPS_CONFIG_DIR, "seo.env")

export function loadSeoEnvFile(): void {
  if (!existsSync(SEO_ENV_PATH)) return
  const text = readFileSync(SEO_ENV_PATH, "utf8")
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

export function applyGscDefaults(): void {
  if (!process.env.GSC_SITE_URL) {
    process.env.GSC_SITE_URL = "https://gryps.vercel.app/"
  }
  if (
    !process.env.GSC_CREDENTIALS_PATH &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    !process.env.GSC_SERVICE_ACCOUNT_JSON &&
    existsSync(GSC_DEFAULT_KEY_PATH)
  ) {
    process.env.GSC_CREDENTIALS_PATH = GSC_DEFAULT_KEY_PATH
  }
}

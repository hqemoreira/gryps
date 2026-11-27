/**
 * Load .env.local into process.env for CLI/tsx runners (P6-S7).
 * Never logs values. Does not override already-set process env vars.
 * Does not touch Neon or make network calls.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnvLocal(cwd: string = process.cwd()): {
  loaded: boolean;
  path: string;
  keysLoaded: number;
} {
  const path = resolve(cwd, ".env.local");
  if (!existsSync(path)) {
    return { loaded: false, path, keysLoaded: 0 };
  }
  const text = readFileSync(path, "utf8");
  let keysLoaded = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
      keysLoaded += 1;
    }
  }
  return { loaded: true, path, keysLoaded };
}

/** Presence-only — never returns or logs the secret value. */
export function mistralKeyPresent(): boolean {
  const v = process.env.MISTRAL_API_KEY;
  return typeof v === "string" && v.trim().length > 0;
}

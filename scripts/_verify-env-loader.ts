/**
 * Presence-only loader check. Never prints secret values.
 */
import { loadEnvLocal, mistralKeyPresent } from "../lib/qa/live/load-env-local";

const PLACEHOLDERS = new Set([
  "",
  "redacted",
  "[redacted]",
  "***",
  "xxxx",
  "changeme",
  "your-api-key",
  "your_api_key",
  "insert-key-here",
  "todo",
  "undefined",
  "null",
]);

const r = loadEnvLocal();
const present = mistralKeyPresent();
const v = (process.env.MISTRAL_API_KEY ?? "").trim();
const placeholder =
  PLACEHOLDERS.has(v.toLowerCase()) ||
  /^\$\{?[A-Z0-9_]+\}?$/.test(v) ||
  /^<.*>$/.test(v) ||
  (/^\[.*\]$/.test(v) && /redact|secret|key|placeholder/i.test(v));

process.stdout.write(
  JSON.stringify({
    loaded: r.loaded,
    mistralPresent: present,
    notPlaceholder: present && !placeholder,
  }) + "\n"
);
process.exit(r.loaded && present && !placeholder ? 0 : 1);

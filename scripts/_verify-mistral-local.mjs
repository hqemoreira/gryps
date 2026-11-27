/**
 * Secure local credential verification for P6-S7.
 * Never prints the key or any fragment (no length, prefix, suffix, hash of value).
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

const PLACEHOLDER_EXACT = new Set([
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

function parseKeyFromFile(text) {
  const line = text
    .split(/\r?\n/)
    .find((l) => /^MISTRAL_API_KEY\s*=/.test(l) && !l.trimStart().startsWith("#"));
  if (!line) return { found: false, value: "" };
  let raw = line.replace(/^MISTRAL_API_KEY\s*=\s*/, "").trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1);
  }
  return { found: true, value: raw };
}

function looksLikePlaceholder(value) {
  const v = value.trim();
  if (PLACEHOLDER_EXACT.has(v.toLowerCase())) return true;
  if (/^\$\{?[A-Z0-9_]+\}?$/.test(v)) return true;
  if (/^<.*>$/.test(v)) return true;
  if (/^\[.*\]$/.test(v) && /redact|secret|key|placeholder/i.test(v)) return true;
  return false;
}

const results = [];

function pass(id, ok, detail) {
  results.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${id}: ${detail}`);
}

pass("file-exists", existsSync(envPath), existsSync(envPath) ? ".env.local present" : ".env.local missing");

let parsed = { found: false, value: "" };
if (existsSync(envPath)) {
  parsed = parseKeyFromFile(readFileSync(envPath, "utf8"));
}

pass("key-present", parsed.found, parsed.found ? "MISTRAL_API_KEY line found" : "MISTRAL_API_KEY line missing");
pass(
  "key-nonempty",
  parsed.found && parsed.value.trim().length > 0,
  parsed.found && parsed.value.trim().length > 0 ? "value non-empty" : "value empty or missing"
);
pass(
  "not-placeholder",
  parsed.found && parsed.value.trim().length > 0 && !looksLikePlaceholder(parsed.value),
  parsed.found && parsed.value.trim().length > 0 && !looksLikePlaceholder(parsed.value)
    ? "value does not match known placeholder patterns"
    : "value missing or matches placeholder pattern"
);

const loadCheck = spawnSync("npx", ["--yes", "tsx", "scripts/_verify-env-loader.ts"], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
  windowsHide: true,
});

let loadOk = false;
const combined = `${loadCheck.stdout || ""}\n${loadCheck.stderr || ""}`;
const jsonLine = combined
  .split(/\r?\n/)
  .map((l) => l.trim())
  .find((l) => l.startsWith("{") && l.includes("mistralPresent"));

if (jsonLine) {
  try {
    const j = JSON.parse(jsonLine);
    loadOk = Boolean(j.loaded && j.mistralPresent && j.notPlaceholder);
    pass(
      "runner-loads-env",
      loadOk,
      loadOk
        ? "loadEnvLocal + mistralKeyPresent succeeded (no secret logged)"
        : "loader ran but key still unavailable or placeholder-like"
    );
  } catch {
    pass("runner-loads-env", false, "could not parse loader JSON");
  }
} else {
  pass(
    "runner-loads-env",
    false,
    `loader check produced no JSON (exit ${loadCheck.status})`
  );
}

const ignore = spawnSync("git", ["check-ignore", "-v", ".env.local"], {
  cwd: root,
  encoding: "utf8",
  windowsHide: true,
});
const ignored = ignore.status === 0 && /env/i.test(ignore.stdout || "");
pass("git-ignored", ignored, ignored ? ".env.local ignored by Git" : ".env.local NOT ignored");

const allOk = results.every((r) => r.ok);
console.log(allOk ? "VERDICT=PASSED" : "VERDICT=FAILED");
process.exit(allOk ? 0 : 1);

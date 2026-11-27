/**
 * Working-tree change inventory without commits.
 * Uses read-only `git status --porcelain=v1 -z` / fallback parsing.
 * Never reset, clean, stash, or checkout.
 */
import { execFileSync } from "node:child_process";

export type ChangeStatus = "modified" | "added" | "deleted" | "renamed" | "untracked" | "unknown";

export type ChangeEntry = {
  path: string;
  status: ChangeStatus;
  fromPath?: string;
};

export type ChangeInventory = {
  capturedAt: string;
  method: "git_porcelain" | "synthetic";
  cwd: string;
  entries: ChangeEntry[];
  error?: string;
};

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}

/** Parse porcelain v1 short status lines (non-null form). */
export function parsePorcelainLines(text: string): ChangeEntry[] {
  const entries: ChangeEntry[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  for (const line of lines) {
    if (line.length < 4) continue;
    const xy = line.slice(0, 2);
    const rest = line.slice(3);
    if (xy === "??") {
      entries.push({ path: normalizePath(rest), status: "untracked" });
      continue;
    }
    if (xy.includes("R") || rest.includes(" -> ")) {
      const parts = rest.split(" -> ");
      if (parts.length === 2) {
        entries.push({
          path: normalizePath(parts[1]),
          fromPath: normalizePath(parts[0]),
          status: "renamed",
        });
        continue;
      }
    }
    if (xy.includes("D") || xy[1] === "D") {
      entries.push({ path: normalizePath(rest), status: "deleted" });
      continue;
    }
    if (xy.includes("A") || xy === "A ") {
      entries.push({ path: normalizePath(rest), status: "added" });
      continue;
    }
    if (xy.includes("M") || xy[1] === "M" || xy[0] === "M") {
      entries.push({ path: normalizePath(rest), status: "modified" });
      continue;
    }
    entries.push({ path: normalizePath(rest), status: "unknown" });
  }
  return entries;
}

export function captureWorkingTreeInventory(cwd: string = process.cwd()): ChangeInventory {
  const capturedAt = new Date().toISOString();
  try {
    const out = execFileSync("git", ["status", "--porcelain=v1"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    return {
      capturedAt,
      method: "git_porcelain",
      cwd,
      entries: parsePorcelainLines(out),
    };
  } catch (err) {
    return {
      capturedAt,
      method: "git_porcelain",
      cwd,
      entries: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function syntheticInventory(entries: ChangeEntry[], cwd = process.cwd()): ChangeInventory {
  return {
    capturedAt: new Date().toISOString(),
    method: "synthetic",
    cwd,
    entries: entries.map((e) => ({ ...e, path: normalizePath(e.path) })),
  };
}

export function pathInScope(path: string, scopePrefixes: string[]): boolean {
  const p = normalizePath(path);
  return scopePrefixes.some((s) => {
    const prefix = normalizePath(s).replace(/\/$/, "");
    return p === prefix || p.startsWith(prefix + "/");
  });
}

export const PROTECTED_PATH_PREFIXES = [
  "LICENSE",
  "docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/",
  "review-package/",
  "review-package-02/",
  "lib/deterministic-score.ts",
  "lib/scoring.ts",
  "lib/model-constants.ts",
  "lib/hero-demo.ts",
];

export function isProtectedPath(path: string): boolean {
  const p = normalizePath(path);
  return PROTECTED_PATH_PREFIXES.some((pref) => {
    if (pref.endsWith("/")) return p.startsWith(pref) || p === pref.slice(0, -1);
    return p === pref;
  });
}

export function classifyScope(
  inventory: ChangeInventory,
  scope: string[],
  exclusions: string[]
): {
  inScope: ChangeEntry[];
  outOfScope: ChangeEntry[];
  protectedHits: ChangeEntry[];
  exclusionHits: ChangeEntry[];
} {
  const inScope: ChangeEntry[] = [];
  const outOfScope: ChangeEntry[] = [];
  const protectedHits: ChangeEntry[] = [];
  const exclusionHits: ChangeEntry[] = [];

  for (const e of inventory.entries) {
    if (isProtectedPath(e.path)) protectedHits.push(e);
    const excluded = exclusions.some((ex) => pathInScope(e.path, [ex]));
    if (excluded) exclusionHits.push(e);
    if (pathInScope(e.path, scope)) inScope.push(e);
    else outOfScope.push(e);
  }
  return { inScope, outOfScope, protectedHits, exclusionHits };
}

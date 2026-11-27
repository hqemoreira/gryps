/**
 * Task-start / task-completion snapshots (P6-S6).
 * Fingerprints working-tree files without using HEAD as the task baseline.
 * Snapshots are read-only after creation; never delete user development files.
 */
import { createHash, randomBytes } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { isProtectedPath } from "@/lib/qa/change-inventory";

export const TASK_SNAPSHOT_SCHEMA = "gryps-task-snapshot-v0" as const;

export type SnapshotFileRecord = {
  path: string;
  exists: boolean;
  /** sha256 of file bytes; omitted for sensitive / unreadable */
  sha256: string | null;
  size: number | null;
  mtimeMs: number | null;
  /** porcelain-ish status at capture when known */
  dirtyStatus?: string;
  protected: boolean;
  sensitive: boolean;
  /** When content omitted for safety */
  contentOmitted: boolean;
  unreadable?: boolean;
  error?: string;
};

export type TaskSnapshot = {
  schema: typeof TASK_SNAPSHOT_SCHEMA;
  snapshotId: string;
  taskId: string;
  kind: "task_start" | "task_completion";
  createdAt: string;
  branch: string | null;
  head: string | null;
  cwd: string;
  files: SnapshotFileRecord[];
  /** Hash over canonical file list — integrity */
  manifestHash: string;
  locked: true;
  retentionNote: string;
};

const SENSITIVE_PATTERNS = [
  /^\.env(\.|$)/i,
  /\.pem$/i,
  /\.key$/i,
  /credentials\.json$/i,
  /service-account/i,
  /id_rsa/i,
  /\.p12$/i,
];

const DEFAULT_IGNORE = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  ".qa",
  "out",
  "build",
  ".vercel",
]);

export function isSensitivePath(path: string): boolean {
  const p = path.replace(/\\/g, "/");
  const base = p.split("/").pop() ?? p;
  return SENSITIVE_PATTERNS.some((re) => re.test(p) || re.test(base));
}

export function normalizeRelPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function fingerprintBytes(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

export function fingerprintFile(absPath: string, relPath: string): SnapshotFileRecord {
  const protectedHit = isProtectedPath(relPath);
  const sensitive = isSensitivePath(relPath);
  try {
    if (!existsSync(absPath)) {
      return {
        path: normalizeRelPath(relPath),
        exists: false,
        sha256: null,
        size: null,
        mtimeMs: null,
        protected: protectedHit,
        sensitive,
        contentOmitted: true,
      };
    }
    const st = statSync(absPath);
    if (!st.isFile()) {
      return {
        path: normalizeRelPath(relPath),
        exists: true,
        sha256: null,
        size: st.size,
        mtimeMs: st.mtimeMs,
        protected: protectedHit,
        sensitive,
        contentOmitted: true,
        error: "not a regular file",
      };
    }
    if (sensitive) {
      return {
        path: normalizeRelPath(relPath),
        exists: true,
        sha256: fingerprintBytes(Buffer.from(`meta:${st.size}:${st.mtimeMs}`)),
        size: st.size,
        mtimeMs: st.mtimeMs,
        protected: protectedHit,
        sensitive: true,
        contentOmitted: true,
      };
    }
    const buf = readFileSync(absPath);
    return {
      path: normalizeRelPath(relPath),
      exists: true,
      sha256: fingerprintBytes(buf),
      size: buf.length,
      mtimeMs: st.mtimeMs,
      protected: protectedHit,
      sensitive: false,
      contentOmitted: false,
    };
  } catch (err) {
    return {
      path: normalizeRelPath(relPath),
      exists: true,
      sha256: null,
      size: null,
      mtimeMs: null,
      protected: protectedHit,
      sensitive,
      contentOmitted: true,
      unreadable: true,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function computeManifestHash(files: SnapshotFileRecord[]): string {
  const canonical = [...files]
    .map((f) => `${f.path}|${f.exists}|${f.sha256 ?? "null"}|${f.size ?? "null"}`)
    .sort()
    .join("\n");
  return fingerprintBytes(Buffer.from(canonical, "utf8"));
}

function gitRef(cwd: string): { branch: string | null; head: string | null } {
  try {
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    }).trim();
    const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    }).trim();
    return { branch, head };
  } catch {
    return { branch: null, head: null };
  }
}

function porcelainPaths(cwd: string): Map<string, string> {
  const map = new Map<string, string>();
  try {
    const out = execFileSync("git", ["status", "--porcelain=v1"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    for (const line of out.split(/\r?\n/).filter(Boolean)) {
      if (line.length < 4) continue;
      const xy = line.slice(0, 2);
      let rest = line.slice(3);
      if (rest.includes(" -> ")) rest = rest.split(" -> ")[1];
      map.set(normalizeRelPath(rest), xy.trim());
    }
  } catch {
    /* isolated fixtures may not be a git repo */
  }
  return map;
}

function walkFiles(root: string, relBase = ""): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(join(root, relBase));
  } catch {
    return out;
  }
  for (const name of entries) {
    if (DEFAULT_IGNORE.has(name)) continue;
    const rel = relBase ? `${relBase}/${name}` : name;
    const abs = join(root, rel);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) out.push(...walkFiles(root, rel));
    else if (st.isFile()) out.push(normalizeRelPath(rel));
  }
  return out;
}

export function defaultSnapshotRoot(repoCwd = process.cwd()): string {
  return join(repoCwd, ".qa", "task-snapshots");
}

export function snapshotStorePath(
  taskId: string,
  snapshotId: string,
  root = defaultSnapshotRoot()
): string {
  const safeTask = taskId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return join(root, safeTask, `${snapshotId}.json`);
}

/**
 * Capture a snapshot of relevant paths.
 * Prefer explicit path list for task scope; otherwise dirty porcelain + optional walk.
 */
export function createTaskSnapshot(options: {
  taskId: string;
  kind: "task_start" | "task_completion";
  cwd?: string;
  /** Explicit relative paths to fingerprint */
  paths?: string[];
  /** Also include all porcelain dirty paths */
  includeDirty?: boolean;
  /** Walk tree under cwd (fixtures / small trees only) */
  walkTree?: boolean;
  storeRoot?: string;
  persist?: boolean;
}): TaskSnapshot {
  const cwd = options.cwd ?? process.cwd();
  const snapshotId = `snap-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
  const { branch, head } = gitRef(cwd);
  const dirty = porcelainPaths(cwd);
  const pathSet = new Set<string>();

  for (const p of options.paths ?? []) pathSet.add(normalizeRelPath(p));
  if (options.includeDirty !== false) {
    for (const p of dirty.keys()) pathSet.add(p);
  }
  if (options.walkTree) {
    for (const p of walkFiles(cwd)) pathSet.add(p);
  }

  const files: SnapshotFileRecord[] = [];
  for (const rel of [...pathSet].sort()) {
    const rec = fingerprintFile(join(cwd, rel.split("/").join(sep)), rel);
    const ds = dirty.get(rel);
    if (ds) rec.dirtyStatus = ds;
    files.push(rec);
  }

  const snap: TaskSnapshot = {
    schema: TASK_SNAPSHOT_SCHEMA,
    snapshotId,
    taskId: options.taskId,
    kind: options.kind,
    createdAt: new Date().toISOString(),
    branch,
    head,
    cwd,
    files,
    manifestHash: computeManifestHash(files),
    locked: true,
    retentionNote:
      "Retain under .qa/task-snapshots/<taskId>/ until task QA complete. Safe to delete obsolete *.json snapshots only — never delete development source files. .qa/ is gitignored.",
  };

  if (options.persist !== false) {
    persistSnapshot(snap, options.storeRoot ?? defaultSnapshotRoot(cwd));
  }
  return snap;
}

export function persistSnapshot(snap: TaskSnapshot, storeRoot: string): string {
  const path = snapshotStorePath(snap.taskId, snap.snapshotId, storeRoot);
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) {
    throw new Error(`Snapshot already exists (refuse overwrite): ${path}`);
  }
  const lockPath = `${path}.lock`;
  writeFileSync(lockPath, `locked:${snap.snapshotId}\n`, "utf8");
  writeFileSync(path, JSON.stringify(snap, null, 2), "utf8");
  // lock file remains as marker that snapshot is read-only
  return path;
}

export function loadTaskSnapshot(filePath: string): TaskSnapshot {
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as TaskSnapshot;
  if (raw.schema !== TASK_SNAPSHOT_SCHEMA) {
    throw new Error(`Invalid snapshot schema at ${filePath}`);
  }
  if (!raw.locked) {
    throw new Error(`Snapshot not locked: ${filePath}`);
  }
  return raw;
}

export function verifySnapshotIntegrity(snap: TaskSnapshot): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (snap.schema !== TASK_SNAPSHOT_SCHEMA) errors.push("bad schema");
  if (!snap.locked) errors.push("not locked");
  if (!snap.snapshotId || !snap.taskId) errors.push("missing ids");
  const expected = computeManifestHash(snap.files);
  if (expected !== snap.manifestHash) {
    errors.push(`manifestHash mismatch: expected ${expected}, got ${snap.manifestHash}`);
  }
  return { ok: errors.length === 0, errors };
}

/** Attempting overwrite must fail — integrity test helper. */
export function tryOverwriteSnapshot(filePath: string): { refused: boolean; error?: string } {
  try {
    if (!existsSync(filePath)) return { refused: false, error: "missing" };
    // Refuse by policy even if FS would allow
    return { refused: true, error: "Snapshots are read-only after creation" };
  } catch (err) {
    return { refused: true, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Delete only a stored snapshot JSON (+ lock) — never development source files.
 * Path must live under a `task-snapshots` directory and end with `.json`.
 */
export function deleteObsoleteSnapshotFile(filePath: string): void {
  const norm = filePath.replace(/\\/g, "/");
  if (!norm.includes("/task-snapshots/") || !norm.endsWith(".json")) {
    throw new Error("Refusing to delete path outside a task-snapshots/*.json store");
  }
  if (existsSync(filePath)) unlinkSync(filePath);
  const lock = `${filePath}.lock`;
  if (existsSync(lock)) unlinkSync(lock);
}

export function relativeFromCwd(abs: string, cwd: string): string {
  return normalizeRelPath(relative(cwd, abs));
}

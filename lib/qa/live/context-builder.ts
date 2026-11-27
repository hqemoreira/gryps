/**
 * Controlled, role-scoped context for live reviewers (P6-S7).
 * Read-only; no secrets; no unrestricted repo walk; no DB access.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isSensitivePath } from "@/lib/qa/task-snapshot";
import type { QaAgentId, QaDeterministicCheck } from "@/lib/qa/types";
import type { DevelopmentTaskDefinition } from "@/lib/qa/task-definition";
import type { ChangeInventory } from "@/lib/qa/change-inventory";

const MAX_FILE_BYTES = 24_000;
const MAX_FILES = 20;

export type LiveReviewContext = {
  agent: QaAgentId;
  task: {
    taskId: string;
    objective: string;
    description?: string;
    acceptanceCriteria: string[];
    scope: string[];
    exclusions: string[];
    protectedBoundaries: string[];
    baselineId?: string;
  };
  taskStartSnapshotId?: string;
  changedFiles: string[];
  protectedBoundaryStatus: string;
  validatorResults: Array<{
    id: string;
    status: string;
    exitCode?: number | null;
    executionLabel?: string;
    required: boolean;
    logExcerpt?: string;
  }>;
  deterministicFindings?: string[];
  files: Array<{ path: string; content: string; truncated: boolean; omittedSensitive: boolean }>;
  methodologyNotes: string[];
  evidenceKind: "fixture_sandbox" | "task_scoped" | "none";
  restrictions: string[];
};

function walkLimited(root: string, acc: string[] = []): string[] {
  if (!existsSync(root) || acc.length >= MAX_FILES) return acc;
  for (const name of readdirSync(root)) {
    if (acc.length >= MAX_FILES) break;
    if (name === "node_modules" || name === ".git" || name === ".qa") continue;
    const abs = join(root, name);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkLimited(abs, acc);
    else acc.push(abs);
  }
  return acc;
}

function readSafe(
  abs: string,
  rel: string
): {
  path: string;
  content: string;
  truncated: boolean;
  omittedSensitive: boolean;
} {
  if (isSensitivePath(rel) || /\.env$/i.test(rel) || /secret/i.test(rel)) {
    // Still allow *.env.example fixture markers for SD-08 — redact live values
    if (!/\.example$/i.test(rel) && !/SECRET_EXPOSED|API_KEY=sk-live-EXAMPLE/i.test(rel)) {
      return {
        path: rel,
        content: "[OMITTED: sensitive path — fingerprint/metadata only]",
        truncated: false,
        omittedSensitive: true,
      };
    }
  }
  const raw = readFileSync(abs, "utf8");
  // Redact obvious credential patterns in content
  const redacted = raw
    .replace(/(api[_-]?key|token|password|secret)\s*[:=]\s*['"]?[^\s'"]+/gi, "$1=[REDACTED]")
    .replace(/\bsk-[a-zA-Z0-9]{10,}\b/g, "sk-[REDACTED]");
  const truncated = redacted.length > MAX_FILE_BYTES;
  return {
    path: rel,
    content: truncated ? redacted.slice(0, MAX_FILE_BYTES) + "\n…[truncated]" : redacted,
    truncated,
    omittedSensitive: false,
  };
}

const ROLE_FOCUS: Record<string, string[]> = {
  requirements: [
    "Compare task objectives and acceptance criteria to the provided files.",
    "Flag scope violations and unrelated modifications.",
    "Challenge whether stated tests actually prove the claimed behaviour.",
  ],
  domain_model: [
    "Guard Model v0.4 boundaries; do not redefine scoring.",
    "Preserve UNKNOWN; reject unsupported independence / connectivity claims.",
    "Check evidence provenance markers in the provided files only.",
    "Do not invent satellite or infrastructure facts.",
  ],
  adversarial: [
    "Inspect security-sensitive content and credential exposure.",
    "Challenge unsafe handling and misleading success / false-green validators.",
    "Search for failure cases; challenge other reviewers only when their findings are supplied.",
  ],
};

export function buildLiveReviewContext(options: {
  agent: QaAgentId;
  task:
    | DevelopmentTaskDefinition
    | {
        taskId: string;
        objective: string;
        description?: string;
        acceptanceCriteria: string[];
        scope?: string[];
        exclusions?: string[];
        protectedBoundaries: string[];
        baselineId?: string;
      };
  sandboxRoot?: string;
  inventory?: ChangeInventory;
  validatorResults?: QaDeterministicCheck[];
  deterministicFindingIds?: string[];
  peerFindingSummaries?: string[];
  taskStartSnapshotId?: string;
  protectedBoundaryStatus?: string;
  methodologyNotes?: string[];
}): LiveReviewContext {
  const files: LiveReviewContext["files"] = [];
  let evidenceKind: LiveReviewContext["evidenceKind"] = "none";

  if (options.sandboxRoot && existsSync(options.sandboxRoot)) {
    evidenceKind = "fixture_sandbox";
    for (const abs of walkLimited(options.sandboxRoot)) {
      const rel = relative(options.sandboxRoot, abs).replace(/\\/g, "/");
      files.push(readSafe(abs, rel));
    }
  }

  const changedFiles = options.inventory?.entries.map((e) => e.path) ?? files.map((f) => f.path);

  const validatorResults = (options.validatorResults ?? []).map((v) => ({
    id: v.id,
    status: v.status,
    exitCode: v.exitCode,
    executionLabel: v.executionLabel,
    required: v.required,
    logExcerpt: v.logExcerpt?.slice(0, 400),
  }));

  // Never present synthetic/assumed pass as verified success
  for (const v of validatorResults) {
    if (v.executionLabel === "SYNTHETIC" && v.status === "pass") {
      v.logExcerpt = `SYNTHETIC — not verified live execution. ${v.logExcerpt ?? ""}`;
    }
  }

  return {
    agent: options.agent,
    task: {
      taskId: options.task.taskId,
      objective: options.task.objective,
      description: options.task.description,
      acceptanceCriteria: options.task.acceptanceCriteria,
      scope: options.task.scope ?? [],
      exclusions: options.task.exclusions ?? [],
      protectedBoundaries: options.task.protectedBoundaries,
      baselineId: options.task.baselineId,
    },
    taskStartSnapshotId: options.taskStartSnapshotId,
    changedFiles,
    protectedBoundaryStatus: options.protectedBoundaryStatus ?? "not_checked",
    validatorResults,
    deterministicFindings: options.deterministicFindingIds,
    files,
    methodologyNotes: [
      ...(options.methodologyNotes ?? []),
      "Homepage regression expectation: 83 · B",
      "Model v0.4 scoring is frozen — do not propose weight changes as improvements.",
      "Agents are read-only reviewers — never edit source, commit, or deploy.",
      ...(ROLE_FOCUS[options.agent] ?? []),
      ...(options.peerFindingSummaries?.length
        ? ["Peer findings to challenge (do not overwrite):", ...options.peerFindingSummaries]
        : []),
    ],
    evidenceKind,
    restrictions: [
      "Read-only context",
      "No unrestricted repository access",
      "No secret/env values",
      "No database permissions",
      "No working-tree modification capability",
      `Max ${MAX_FILES} files / ${MAX_FILE_BYTES} bytes each`,
    ],
  };
}

export function contextToPromptPayload(ctx: LiveReviewContext): string {
  return JSON.stringify(ctx, null, 2);
}

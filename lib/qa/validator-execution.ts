/**
 * Real validator execution adapter (P6-S6).
 * Only exit code 0 from an actual run may produce PASSED.
 * Synthetic results are fixture-only and must be labelled SYNTHETIC.
 */
import { spawn } from "node:child_process";
import type { ValidatorId } from "@/lib/qa/impact-map";

export type ValidatorExecStatus = "PASSED" | "FAILED" | "NOT_RUN" | "BLOCKED" | "TIMED_OUT";

export type ExecutionKind = "real" | "synthetic";

export type ValidatorExecutionRecord = {
  validatorId: string;
  command: string;
  argv: string[];
  cwd: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  exitCode: number | null;
  status: ValidatorExecStatus;
  stdout: string;
  stderr: string;
  executionKind: ExecutionKind;
  /** Visible label for reports */
  executionLabel: "REAL" | "SYNTHETIC";
  error?: string;
  timedOut: boolean;
  /** True if this record was incorrectly reused from a prior run */
  reusedPriorResult: boolean;
};

export type ExecuteOptions = {
  cwd?: string;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
  /** Override argv (isolated adapter tests) */
  argv?: string[];
  /** Shell form for simple node -e fixtures */
  shellCommand?: string;
};

/** Map validator IDs to exact argv used for real runs. */
export const VALIDATOR_ARGV: Record<ValidatorId, string[]> = {
  "test:score": ["npx", "--yes", "tsx", "scripts/verify-deterministic.ts"],
  "test:evidence": ["npx", "--yes", "tsx", "scripts/verify-evidence-integrity.ts"],
  "test:evidence-pack": ["npx", "--yes", "tsx", "scripts/verify-nordic-lapland-evidence-pack.ts"],
  "test:evidence-intake": ["npx", "--yes", "tsx", "scripts/verify-evidence-intake.ts"],
  "test:fixtures": ["npx", "--yes", "tsx", "scripts/verify-provider-dependency-fixtures.ts"],
  "test:dependency-lab": ["npx", "--yes", "tsx", "scripts/verify-dependency-research-panel.ts"],
  "test:workflow": ["npx", "--yes", "tsx", "scripts/verify-research-workflow.ts"],
  "test:boundaries": ["npx", "--yes", "tsx", "scripts/verify-protected-boundaries.ts"],
  "test:qa-agents": ["npx", "--yes", "tsx", "scripts/verify-multi-agent-qa.ts"],
  typecheck: ["npx", "tsc", "--noEmit"],
  lint: ["npm", "run", "lint", "--"],
  build: ["npm", "run", "build", "--"],
};

function truncate(s: string, max = 8000): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n…[truncated ${s.length - max} chars]`;
}

function formatCommand(argv: string[]): string {
  return argv.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(" ");
}

/**
 * Execute a command and return a verified execution record.
 * Never invents PASSED without exitCode === 0 from a completed process.
 */
export function executeCommand(
  validatorId: string,
  argv: string[],
  options: ExecuteOptions = {}
): Promise<ValidatorExecutionRecord> {
  const cwd = options.cwd ?? process.cwd();
  const timeoutMs = options.timeoutMs ?? 120_000;
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  if (!argv.length) {
    const completedAt = new Date().toISOString();
    return Promise.resolve({
      validatorId,
      command: "(empty)",
      argv: [],
      cwd,
      startedAt,
      completedAt,
      durationMs: Date.now() - t0,
      exitCode: null,
      status: "NOT_RUN",
      stdout: "",
      stderr: "",
      executionKind: "real",
      executionLabel: "REAL",
      error: "No command configured",
      timedOut: false,
      reusedPriorResult: false,
    });
  }

  return new Promise((resolve) => {
    const useShell = Boolean(options.shellCommand);
    // Prefer shell:false so missing binaries and timeouts behave consistently.
    // Windows npm/npx shims still need shell when used as validator argv[0].
    const winShim = process.platform === "win32" && /^(npm|npx)(\.cmd)?$/i.test(argv[0] ?? "");
    const child = useShell
      ? spawn(options.shellCommand!, {
          cwd,
          env: { ...process.env, ...options.env },
          shell: true,
          windowsHide: true,
        })
      : spawn(argv[0], argv.slice(1), {
          cwd,
          env: { ...process.env, ...options.env },
          shell: winShim,
          windowsHide: true,
        });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!settled) child.kill("SIGKILL");
      }, 2000).unref?.();
    }, timeoutMs);

    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString("utf8");
    });
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString("utf8");
    });

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const completedAt = new Date().toISOString();
      resolve({
        validatorId,
        command: useShell ? options.shellCommand! : formatCommand(argv),
        argv: useShell ? [options.shellCommand!] : argv,
        cwd,
        startedAt,
        completedAt,
        durationMs: Date.now() - t0,
        exitCode: null,
        status: "BLOCKED",
        stdout: truncate(stdout),
        stderr: truncate(stderr),
        executionKind: "real",
        executionLabel: "REAL",
        error: err.message,
        timedOut: false,
        reusedPriorResult: false,
      });
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const completedAt = new Date().toISOString();
      const notFound =
        !timedOut &&
        code === 1 &&
        /not recognized|ENOENT|cannot find|is not recognized/i.test(stderr + stdout);

      let status: ValidatorExecStatus;
      let exitCode: number | null = timedOut ? null : code;
      if (timedOut) {
        status = "TIMED_OUT";
        exitCode = null;
      } else if (notFound) {
        status = "BLOCKED";
        exitCode = null;
      } else if (code === 0) status = "PASSED";
      else if (code === null) status = "BLOCKED";
      else status = "FAILED";

      resolve({
        validatorId,
        command: useShell ? options.shellCommand! : formatCommand(argv),
        argv: useShell ? [options.shellCommand!] : argv,
        cwd,
        startedAt,
        completedAt,
        durationMs: Date.now() - t0,
        exitCode,
        status,
        stdout: truncate(stdout),
        stderr: truncate(stderr),
        executionKind: "real",
        executionLabel: "REAL",
        error: timedOut
          ? `Timed out after ${timeoutMs}ms`
          : notFound
            ? "Command not found"
            : code === null
              ? "Process closed without exit code"
              : undefined,
        timedOut,
        reusedPriorResult: false,
      });
    });
  });
}

export function executeValidator(
  id: ValidatorId,
  options: ExecuteOptions = {}
): Promise<ValidatorExecutionRecord> {
  const argv = options.argv ?? VALIDATOR_ARGV[id];
  if (!argv) {
    return Promise.resolve({
      validatorId: id,
      command: "(unknown)",
      argv: [],
      cwd: options.cwd ?? process.cwd(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 0,
      exitCode: null,
      status: "NOT_RUN",
      stdout: "",
      stderr: "",
      executionKind: "real",
      executionLabel: "REAL",
      error: `No argv mapping for validator ${id}`,
      timedOut: false,
      reusedPriorResult: false,
    });
  }
  return executeCommand(id, argv, options);
}

/**
 * Fixture-only synthetic result. Must never be used as a real-task PASS substitute
 * without allowSyntheticResults on the pipeline.
 */
export function createSyntheticExecution(
  validatorId: string,
  partial: {
    status: ValidatorExecStatus;
    exitCode?: number | null;
    stdout?: string;
    stderr?: string;
    error?: string;
    command?: string;
  }
): ValidatorExecutionRecord {
  const now = new Date().toISOString();
  return {
    validatorId,
    command: partial.command ?? `SYNTHETIC ${validatorId}`,
    argv: ["SYNTHETIC"],
    cwd: process.cwd(),
    startedAt: now,
    completedAt: now,
    durationMs: 0,
    exitCode: partial.exitCode ?? (partial.status === "PASSED" ? 0 : 1),
    status: partial.status,
    stdout: partial.stdout ?? "",
    stderr: partial.stderr ?? "",
    executionKind: "synthetic",
    executionLabel: "SYNTHETIC",
    error: partial.error,
    timedOut: partial.status === "TIMED_OUT",
    reusedPriorResult: false,
  };
}

/** Mark an attempted reuse of a prior successful record — never PASSED. */
export function refuseReusedExecution(prior: ValidatorExecutionRecord): ValidatorExecutionRecord {
  const now = new Date().toISOString();
  return {
    ...prior,
    startedAt: now,
    completedAt: now,
    durationMs: 0,
    status: "BLOCKED",
    exitCode: null,
    executionKind: "real",
    executionLabel: "REAL",
    error: "Refused to reuse a previous successful execution for a new required run",
    timedOut: false,
    reusedPriorResult: true,
    stdout: prior.stdout,
    stderr: `REUSE_REFUSED\n${prior.stderr}`,
  };
}

export function mapExecStatusToLegacy(
  status: ValidatorExecStatus
): "pass" | "fail" | "skipped" | "not_run" | "blocked" | "timed_out" {
  switch (status) {
    case "PASSED":
      return "pass";
    case "FAILED":
      return "fail";
    case "NOT_RUN":
      return "not_run";
    case "BLOCKED":
      return "blocked";
    case "TIMED_OUT":
      return "timed_out";
  }
}

export function skippedRequiredRecord(
  validatorId: string,
  reason: string
): ValidatorExecutionRecord {
  const now = new Date().toISOString();
  return {
    validatorId,
    command: `npm run ${validatorId}`,
    argv: [],
    cwd: process.cwd(),
    startedAt: now,
    completedAt: now,
    durationMs: 0,
    exitCode: null,
    status: "NOT_RUN",
    stdout: "",
    stderr: reason,
    executionKind: "real",
    executionLabel: "REAL",
    error: reason,
    timedOut: false,
    reusedPriorResult: false,
  };
}

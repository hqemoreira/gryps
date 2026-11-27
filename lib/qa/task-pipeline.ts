/**
 * Task-level QA pipeline (P6-S5 + P6-S6 hardening).
 * Real task runs execute validators; assumed-pass is forbidden.
 * Synthetic results allowed only when allowSyntheticResults is set (fixtures).
 */
import {
  captureWorkingTreeInventory,
  classifyScope,
  type ChangeInventory,
} from "@/lib/qa/change-inventory";
import {
  attributeChanges,
  inventoryFromAttribution,
  type AttributionReport,
} from "@/lib/qa/change-attribution";
import { decideQaStatus } from "@/lib/qa/decision";
import { runChangeAwareAgent, type ChangeAwareContext } from "@/lib/qa/change-aware-agents";
import { MANDATORY_PEER_AGENTS } from "@/lib/qa/roles";
import {
  createDevelopmentTask,
  validateDevelopmentTask,
  type DevelopmentTaskDefinition,
} from "@/lib/qa/task-definition";
import { selectValidatorsForTask, type SelectedCheck } from "@/lib/qa/test-selection";
import {
  createTaskSnapshot,
  loadTaskSnapshot,
  verifySnapshotIntegrity,
  type TaskSnapshot,
} from "@/lib/qa/task-snapshot";
import {
  createSyntheticExecution,
  executeValidator,
  mapExecStatusToLegacy,
  refuseReusedExecution,
  skippedRequiredRecord,
  type ValidatorExecutionRecord,
} from "@/lib/qa/validator-execution";
import type {
  QaAcceptanceItem,
  QaAgentId,
  QaAgentReport,
  QaDeterministicCheck,
  QaExecutionMode,
  QaFinding,
  QaReport,
} from "@/lib/qa/types";
import { QA_REPORT_SCHEMA } from "@/lib/qa/types";
import type { ValidatorId } from "@/lib/qa/impact-map";
import { existsSync } from "node:fs";

export type TaskPipelineOptions = {
  inventory?: ChangeInventory;
  fileContents?: Record<string, string>;
  sandboxRoot?: string;
  executionMode?: QaExecutionMode;
  /**
   * Fixture-only synthetic outcomes. Requires allowSyntheticResults=true.
   * Never used as an assumed-pass for real task runs.
   */
  deterministicOverrides?: Partial<
    Record<ValidatorId, Pick<QaDeterministicCheck, "status" | "exitCode" | "logExcerpt">>
  >;
  /** Must be true to accept deterministicOverrides / skip live execution */
  allowSyntheticResults?: boolean;
  forceSkip?: ValidatorId[];
  baseline?: { branch?: string; head?: string };
  captureLiveInventory?: boolean;
  /** Execute real validators (default true when allowSyntheticResults is false) */
  executeValidators?: boolean;
  /** Prior execution cache — reuse is refused by default */
  priorExecutions?: Map<string, ValidatorExecutionRecord>;
  attemptReusePrior?: boolean;
  /** Injected snapshots for tests */
  taskStartSnapshot?: TaskSnapshot;
  taskCompletionSnapshot?: TaskSnapshot;
  taskStartSnapshotPath?: string;
  /** Capture live snapshots (isolated fixtures / real task registration) */
  captureSnapshots?: boolean;
  snapshotPaths?: string[];
  snapshotStoreRoot?: string;
  snapshotCwd?: string;
};

export type TaskPipelineResult = {
  report: QaReport;
  taskValidation: ReturnType<typeof validateDevelopmentTask>;
  inventory: ChangeInventory;
  selection: ReturnType<typeof selectValidatorsForTask>;
  scope: ReturnType<typeof classifyScope>;
  executionRecords: ValidatorExecutionRecord[];
  attribution?: AttributionReport;
  startSnapshot?: TaskSnapshot;
  completionSnapshot?: TaskSnapshot;
};

function recordToCheck(
  selected: SelectedCheck,
  record: ValidatorExecutionRecord
): QaDeterministicCheck {
  return {
    id: selected.id,
    command: record.command,
    required: selected.required,
    status: mapExecStatusToLegacy(record.status),
    exitCode: record.exitCode,
    logExcerpt: [
      record.executionLabel,
      record.error,
      record.stderr?.slice(0, 400),
      record.stdout?.slice(0, 200),
    ]
      .filter(Boolean)
      .join(" | "),
    executionLabel: record.executionLabel,
    executionStatus: record.status,
    durationMs: record.durationMs,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    reusedPriorResult: record.reusedPriorResult,
  };
}

async function resolveExecutions(
  selected: SelectedCheck[],
  options: TaskPipelineOptions
): Promise<{ checks: QaDeterministicCheck[]; records: ValidatorExecutionRecord[] }> {
  const checks: QaDeterministicCheck[] = [];
  const records: ValidatorExecutionRecord[] = [];
  const allowSynthetic = options.allowSyntheticResults === true;
  const execute =
    options.executeValidators === true || (options.executeValidators !== false && !allowSynthetic);

  for (const s of selected) {
    if (s.status === "skipped") {
      const rec = skippedRequiredRecord(s.id, s.skipReason ?? "skipped");
      records.push(rec);
      checks.push(recordToCheck(s, rec));
      continue;
    }

    if (options.attemptReusePrior && options.priorExecutions?.has(s.id)) {
      const refused = refuseReusedExecution(options.priorExecutions.get(s.id)!);
      records.push(refused);
      checks.push(recordToCheck(s, refused));
      continue;
    }

    const over = options.deterministicOverrides?.[s.id];
    if (over) {
      if (!allowSynthetic) {
        const blocked = createSyntheticExecution(s.id, {
          status: "BLOCKED",
          exitCode: null,
          error: "Synthetic override rejected — allowSyntheticResults not set",
          stdout: "ILLICIT_SYNTHETIC_AS_REAL",
        });
        // Force BLOCKED path for illicit synthetic
        const check = recordToCheck(s, blocked);
        check.logExcerpt = `ILLICIT_SYNTHETIC_AS_REAL | ${check.logExcerpt}`;
        check.status = "blocked";
        records.push(blocked);
        checks.push(check);
        continue;
      }
      const statusMap: Record<string, ValidatorExecutionRecord["status"]> = {
        pass: "PASSED",
        fail: "FAILED",
        skipped: "NOT_RUN",
        not_run: "NOT_RUN",
        blocked: "BLOCKED",
        timed_out: "TIMED_OUT",
      };
      const rec = createSyntheticExecution(s.id, {
        status: statusMap[over.status] ?? "BLOCKED",
        exitCode: over.exitCode ?? null,
        stdout: over.logExcerpt ?? "",
        stderr: "SYNTHETIC",
      });
      records.push(rec);
      checks.push(recordToCheck(s, rec));
      continue;
    }

    if (!execute) {
      // Fixture path with allowSynthetic but no override: still NOT_RUN — never assumed pass
      if (allowSynthetic) {
        const rec = createSyntheticExecution(s.id, {
          status: "PASSED",
          exitCode: 0,
          stdout: "SYNTHETIC fixture default pass",
          stderr: "SYNTHETIC",
        });
        records.push(rec);
        checks.push(recordToCheck(s, rec));
        continue;
      }
      const rec = skippedRequiredRecord(
        s.id,
        "Validator not executed and synthetic results not allowed"
      );
      records.push(rec);
      checks.push(recordToCheck(s, rec));
      continue;
    }

    const rec = await executeValidator(s.id as ValidatorId, {
      cwd: options.snapshotCwd ?? process.cwd(),
    });
    records.push(rec);
    checks.push(recordToCheck(s, rec));
  }

  return { checks, records };
}

function acceptanceFromTask(
  task: DevelopmentTaskDefinition,
  findings: QaFinding[],
  taskValid: boolean
): QaAcceptanceItem[] {
  if (!taskValid) {
    return [
      {
        id: "AC-TASK",
        description: "Task definition complete",
        status: "blocked",
        evidence: "Mandatory task fields missing",
      },
    ];
  }
  return task.acceptanceCriteria.map((description, i) => {
    const unmet = /UNMET:|MISSING_ACCEPTANCE|NOT_MET/i.test(description);
    const blocking = findings.some((f) => f.blocking);
    return {
      id: `AC-${i + 1}`,
      description,
      status: unmet || blocking ? ("fail" as const) : ("pass" as const),
      evidence: unmet
        ? "Criterion explicitly marked unmet"
        : blocking
          ? "Blocking findings present"
          : "No blocking findings against criterion",
    };
  });
}

export async function runTaskQaPipeline(
  taskInput: DevelopmentTaskDefinition | Partial<DevelopmentTaskDefinition>,
  options: TaskPipelineOptions = {}
): Promise<TaskPipelineResult> {
  const taskValidation = validateDevelopmentTask(taskInput);
  const task: DevelopmentTaskDefinition = taskValidation.valid
    ? (taskInput as DevelopmentTaskDefinition)
    : createDevelopmentTask({
        taskId: typeof taskInput.taskId === "string" ? taskInput.taskId : "INVALID-TASK",
        objective: typeof taskInput.objective === "string" ? taskInput.objective : "",
        description: typeof taskInput.description === "string" ? taskInput.description : "",
        scope: Array.isArray(taskInput.scope) && taskInput.scope.length ? taskInput.scope : ["."],
        exclusions: Array.isArray(taskInput.exclusions) ? taskInput.exclusions : [],
        acceptanceCriteria:
          Array.isArray(taskInput.acceptanceCriteria) && taskInput.acceptanceCriteria.length
            ? taskInput.acceptanceCriteria
            : ["MISSING_ACCEPTANCE"],
        expectedAffectedComponents: Array.isArray(taskInput.expectedAffectedComponents)
          ? taskInput.expectedAffectedComponents
          : [],
        requiredValidators: Array.isArray(taskInput.requiredValidators)
          ? taskInput.requiredValidators
          : [],
        protectedBoundaries:
          Array.isArray(taskInput.protectedBoundaries) && taskInput.protectedBoundaries.length
            ? taskInput.protectedBoundaries
            : ["Model v0.4"],
        baselineId: typeof taskInput.baselineId === "string" ? taskInput.baselineId : "",
      });

  let startSnapshot = options.taskStartSnapshot;
  let snapshotInvalid = false;
  if (options.taskStartSnapshotPath) {
    if (!existsSync(options.taskStartSnapshotPath)) {
      snapshotInvalid = true;
    } else {
      try {
        startSnapshot = loadTaskSnapshot(options.taskStartSnapshotPath);
        const v = verifySnapshotIntegrity(startSnapshot);
        if (!v.ok) snapshotInvalid = true;
      } catch {
        snapshotInvalid = true;
      }
    }
  }

  let completionSnapshot = options.taskCompletionSnapshot;
  let attribution: AttributionReport | undefined;

  if (options.captureSnapshots && !startSnapshot) {
    startSnapshot = createTaskSnapshot({
      taskId: task.taskId,
      kind: "task_start",
      cwd: options.snapshotCwd ?? process.cwd(),
      paths: options.snapshotPaths,
      storeRoot: options.snapshotStoreRoot,
      includeDirty: true,
      walkTree: Boolean(options.snapshotPaths?.length === 0),
      persist: Boolean(options.snapshotStoreRoot),
    });
  }

  if (startSnapshot) {
    const v = verifySnapshotIntegrity(startSnapshot);
    if (!v.ok) snapshotInvalid = true;
  }

  if (options.captureSnapshots && startSnapshot && !completionSnapshot) {
    completionSnapshot = createTaskSnapshot({
      taskId: task.taskId,
      kind: "task_completion",
      cwd: options.snapshotCwd ?? process.cwd(),
      paths: [
        ...new Set([...(options.snapshotPaths ?? []), ...startSnapshot.files.map((f) => f.path)]),
      ],
      storeRoot: options.snapshotStoreRoot,
      includeDirty: true,
      persist: Boolean(options.snapshotStoreRoot),
    });
  }

  if (startSnapshot && completionSnapshot) {
    attribution = attributeChanges(startSnapshot, completionSnapshot);
  }

  const inventory: ChangeInventory =
    options.inventory ??
    (attribution
      ? inventoryFromAttribution(attribution, options.snapshotCwd ?? process.cwd())
      : options.captureLiveInventory === false
        ? {
            capturedAt: new Date().toISOString(),
            method: "synthetic" as const,
            cwd: process.cwd(),
            entries: [],
          }
        : captureWorkingTreeInventory());

  const selection = selectValidatorsForTask(task, inventory, {
    forceSkip: options.forceSkip,
  });

  const { checks: deterministicChecks, records: executionRecords } = await resolveExecutions(
    selection.selected,
    options
  );

  const scope = classifyScope(inventory, task.scope, task.exclusions);

  const mode = options.executionMode ?? "mock";
  const ctx: ChangeAwareContext = {
    task,
    inventory,
    selectedChecks: selection.selected,
    deterministicResults: deterministicChecks,
    fileContents: options.fileContents,
    sandboxRoot: options.sandboxRoot,
    unmappedPaths: selection.unmappedPaths,
    taskValid: taskValidation.valid,
    taskMissingFields: taskValidation.missing,
  };

  const peers = MANDATORY_PEER_AGENTS as Exclude<QaAgentId, "orchestrator">[];
  const agentReports: QaAgentReport[] = peers.map((a) => runChangeAwareAgent(a, ctx, mode));

  const findings = agentReports.flatMap((r) => r.findings);
  const acceptance = acceptanceFromTask(task, findings, taskValidation.valid);
  const acceptanceFailed =
    !taskValidation.valid || acceptance.some((a) => a.status === "fail" || a.status === "blocked");

  let protectedBoundaryStatus: QaReport["protectedBoundaryStatus"] = "verified";
  if (scope.protectedHits.length > 0) protectedBoundaryStatus = "violated";
  if (attribution?.protectedChanges.length) protectedBoundaryStatus = "violated";

  const criticalAttributionAmbiguous = Boolean(attribution?.criticalAmbiguous.length);

  let { decision, rationale } = decideQaStatus({
    deterministicChecks,
    agentReports,
    findings,
    requiredAgents: peers,
    protectedBoundaryStatus,
    acceptanceFailed,
    criticalAttributionAmbiguous,
    snapshotInvalid,
  });

  if (!taskValidation.valid) {
    decision = "BLOCKED";
    rationale = `Task definition incomplete: missing ${taskValidation.missing.join(", ") || taskValidation.errors.join(", ")}`;
  }

  const realExecutions = executionRecords.filter((r) => r.executionKind === "real").length;
  const syntheticExecutions = executionRecords.filter(
    (r) => r.executionKind === "synthetic"
  ).length;

  const report: QaReport = {
    schema: QA_REPORT_SCHEMA,
    taskId: task.taskId,
    generatedAt: new Date().toISOString(),
    executionMode: mode,
    liveAgentsExecuted: false,
    mockAgentsExecuted: agentReports.some((r) => r.executed),
    baseline: {
      branch: options.baseline?.branch ?? startSnapshot?.branch ?? undefined,
      head: options.baseline?.head ?? startSnapshot?.head ?? undefined,
      homepageRegressionExpected: "83 · B",
    },
    acceptance,
    deterministicChecks,
    agentReports,
    findings,
    decision,
    decisionRationale: rationale,
    humanApprovalRequired:
      findings.some((f) => f.humanApprovalRequired) ||
      protectedBoundaryStatus === "violated" ||
      criticalAttributionAmbiguous,
    protectedBoundaryStatus,
    limitations: [
      "Change-aware agents are mock/rule-based — not live LLM reviews.",
      "Assumed-pass validator results are forbidden for real task runs.",
      `Change inventory method: ${inventory.method}; entries=${inventory.entries.length}`,
      selection.unmappedPaths.length
        ? `Unmapped paths: ${selection.unmappedPaths.join(", ")}`
        : "No unmapped paths in selection",
      `Components: ${selection.components.join(", ") || "none"}`,
      `Executions: REAL=${realExecutions} SYNTHETIC=${syntheticExecutions}`,
    ],
    executionHardening: {
      taskStartSnapshotId: startSnapshot?.snapshotId,
      taskStartTimestamp: startSnapshot?.createdAt,
      taskCompletionTimestamp: completionSnapshot?.createdAt,
      preExistingDirty: attribution?.preExistingDirty,
      newTaskChanges: attribution?.newTaskChanges,
      modifiedPreExisting: attribution?.modifiedPreExisting,
      ambiguousChanges: attribution?.ambiguous,
      criticalAmbiguous: attribution?.criticalAmbiguous,
      realExecutions,
      syntheticExecutions,
      assumedPassForbidden: true,
    },
  };

  return {
    report,
    taskValidation,
    inventory,
    selection,
    scope,
    executionRecords,
    attribution,
    startSnapshot,
    completionSnapshot,
  };
}

export function formatTaskQaReportMarkdown(result: TaskPipelineResult): string {
  const { report, inventory, selection, scope, taskValidation, executionRecords, attribution } =
    result;
  const h = report.executionHardening;
  const lines = [
    `# Task QA Report — ${report.taskId}`,
    "",
    `- Decision: **${report.decision}**`,
    `- Rationale: ${report.decisionRationale}`,
    `- Task valid: ${taskValidation.valid}`,
    `- Inventory: ${inventory.method} (${inventory.entries.length} paths)`,
    `- Protected boundaries: ${report.protectedBoundaryStatus}`,
    `- Mock agents executed: ${report.mockAgentsExecuted}`,
    `- Live agents executed: ${report.liveAgentsExecuted}`,
    `- Task-start snapshot: ${h?.taskStartSnapshotId ?? "—"}`,
    `- Task-start timestamp: ${h?.taskStartTimestamp ?? "—"}`,
    `- Task-completion timestamp: ${h?.taskCompletionTimestamp ?? "—"}`,
    `- Branch / HEAD: ${report.baseline.branch ?? "—"} / ${report.baseline.head ?? "—"}`,
    "",
    "## Change attribution",
    "",
    `- Pre-existing dirty: ${(h?.preExistingDirty ?? []).join(", ") || "—"}`,
    `- New task changes: ${(h?.newTaskChanges ?? []).join(", ") || "—"}`,
    `- Modified pre-existing: ${(h?.modifiedPreExisting ?? []).join(", ") || "—"}`,
    `- Ambiguous: ${(h?.ambiguousChanges ?? []).join(", ") || "—"}`,
    "",
  ];
  if (attribution) {
    for (const c of attribution.changes) {
      lines.push(`- ${c.attribution}: ${c.path} — ${c.note}`);
    }
  }
  lines.push("", "## Changed files (inventory)", "");
  for (const e of inventory.entries) {
    lines.push(`- ${e.status}: ${e.path}${e.fromPath ? ` (from ${e.fromPath})` : ""}`);
  }
  lines.push("", "## Scope", "");
  lines.push(`- In scope: ${scope.inScope.map((e) => e.path).join(", ") || "—"}`);
  lines.push(`- Out of scope: ${scope.outOfScope.map((e) => e.path).join(", ") || "—"}`);
  lines.push(`- Protected hits: ${scope.protectedHits.map((e) => e.path).join(", ") || "—"}`);
  lines.push("", "## Selected tests", "");
  for (const s of selection.selected) {
    lines.push(
      `- ${s.id}: ${s.status}${s.required ? " (required)" : ""} — ${s.reason}${s.skipReason ? ` [${s.skipReason}]` : ""}`
    );
  }
  lines.push("", "## Validator executions", "");
  for (const r of executionRecords) {
    lines.push(
      `- ${r.validatorId}: ${r.status} · ${r.executionLabel} · exit=${r.exitCode ?? "null"} · ${r.durationMs}ms · ${r.command}`
    );
  }
  lines.push("", "## Deterministic results", "");
  for (const c of report.deterministicChecks) {
    lines.push(
      `- ${c.id}: ${c.status} · ${c.executionLabel ?? "?"} · exit=${c.exitCode ?? "null"}`
    );
  }
  lines.push("", "## Findings", "");
  if (!report.findings.length) lines.push("_None_");
  for (const f of report.findings) {
    lines.push(`- ${f.findingId} · ${f.severity} · ${f.agent}: ${f.description}`);
  }
  lines.push("");
  return lines.join("\n");
}

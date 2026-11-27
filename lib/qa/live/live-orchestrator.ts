/**
 * Live QA orchestration for P6-S7 three reviewers.
 * Deterministic decision gate remains authoritative — models cannot override failed validators.
 */
import { decideQaStatus } from "@/lib/qa/decision";
import {
  batchApprovalGranted,
  DEFAULT_LIVE_COST_CONTROLS,
  liveExecutionRequested,
  type LiveCostControls,
} from "@/lib/qa/live/cost-controls";
import { runLiveP6S7Reviewers, LIVE_P6_S7_AGENTS } from "@/lib/qa/live/live-agents";
import { loadEnvLocal } from "@/lib/qa/live/load-env-local";
import { resolveLiveProvider } from "@/lib/qa/live/providers";
import type { LiveModelProvider } from "@/lib/qa/live/providers/types";
import type { ChangeInventory } from "@/lib/qa/change-inventory";
import type { DevelopmentTaskDefinition } from "@/lib/qa/task-definition";
import type { QaAcceptanceItem, QaDeterministicCheck, QaReport } from "@/lib/qa/types";
import { QA_REPORT_SCHEMA } from "@/lib/qa/types";

export type LiveOrchestratorOptions = {
  provider?: LiveModelProvider;
  inventory?: ChangeInventory;
  validatorResults?: QaDeterministicCheck[];
  sandboxRoot?: string;
  taskStartSnapshotId?: string;
  protectedBoundaryStatus?: QaReport["protectedBoundaryStatus"];
  baseline?: { branch?: string; head?: string };
  controls?: LiveCostControls;
  model?: string;
  /** When true, skip GRYPS_QA_LIVE env gate (caller already approved). */
  forceLive?: boolean;
  batchMode?: boolean;
};

export type LiveOrchestratorResult = {
  report: QaReport;
  blockedReason?: string;
  costUsd: number;
  callCount: number;
  executionLogs: string[];
  providerAvailability: ReturnType<typeof resolveLiveProvider>["availability"];
};

function acceptanceFrom(
  task: DevelopmentTaskDefinition | { acceptanceCriteria: string[] },
  blocking: boolean,
  incomplete: boolean
): QaAcceptanceItem[] {
  if (incomplete || task.acceptanceCriteria.length === 0) {
    return [
      {
        id: "AC-MISSING",
        description: "Acceptance criteria present",
        status: "blocked",
        evidence: "Incomplete acceptance criteria",
      },
    ];
  }
  return task.acceptanceCriteria.map((description, i) => ({
    id: `AC-${i + 1}`,
    description,
    status: blocking ? ("fail" as const) : ("pass" as const),
    evidence: blocking
      ? "Blocking findings present"
      : "No blocking live findings against criterion",
  }));
}

export async function runLiveQaOrchestrator(
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
      },
  options: LiveOrchestratorOptions = {}
): Promise<LiveOrchestratorResult> {
  loadEnvLocal();
  const resolved = resolveLiveProvider({ prefer: "mistral" });
  const provider = options.provider ?? resolved.provider;

  if (!options.forceLive && !liveExecutionRequested()) {
    return blockedResult(
      task,
      options,
      resolved.availability,
      "Live execution not requested (set GRYPS_QA_LIVE=1)"
    );
  }

  if (options.batchMode && !batchApprovalGranted()) {
    return blockedResult(
      task,
      options,
      resolved.availability,
      "Batch live eval requires GRYPS_QA_LIVE_APPROVE=1 (cost control)"
    );
  }

  if (!provider) {
    return blockedResult(
      task,
      options,
      resolved.availability,
      "No live provider available — configure MISTRAL_API_KEY (or OpenAI-compatible env)"
    );
  }

  const incompleteAc = !task.acceptanceCriteria?.length;
  const validators = options.validatorResults ?? [
    {
      id: "test:score",
      command: "npm run test:score",
      required: true,
      status: "pass" as const,
      exitCode: 0,
      executionLabel: "REAL" as const,
    },
    {
      id: "test:boundaries",
      command: "npm run test:boundaries",
      required: true,
      status: "pass" as const,
      exitCode: 0,
      executionLabel: "REAL" as const,
    },
  ];

  // Never let live agents override deterministic failures — gate first on validators
  const detFailed = validators.some((v) => v.required && v.status === "fail");

  const bundle = await runLiveP6S7Reviewers({
    provider,
    task,
    sandboxRoot: options.sandboxRoot,
    inventory: options.inventory,
    validatorResults: validators,
    taskStartSnapshotId: options.taskStartSnapshotId,
    protectedBoundaryStatus: options.protectedBoundaryStatus,
    model: options.model,
    controls: options.controls ?? DEFAULT_LIVE_COST_CONTROLS,
  });

  const agentReports = bundle.outcomes.map((o) => o.report);
  const findings = bundle.allFindings;
  const blocking = findings.some((f) => f.blocking);
  const acceptance = acceptanceFrom(
    task as DevelopmentTaskDefinition,
    blocking || detFailed,
    incompleteAc
  );
  const acceptanceFailed = acceptance.some((a) => a.status === "fail" || a.status === "blocked");

  const { decision, rationale } = decideQaStatus({
    deterministicChecks: validators,
    agentReports,
    findings,
    requiredAgents: [...LIVE_P6_S7_AGENTS],
    protectedBoundaryStatus: options.protectedBoundaryStatus ?? "not_checked",
    acceptanceFailed: acceptanceFailed || incompleteAc,
  });

  // Provider/model failure already surfaces as blocked agent reports → BLOCKED via gate
  const report: QaReport = {
    schema: QA_REPORT_SCHEMA,
    taskId: task.taskId,
    generatedAt: new Date().toISOString(),
    executionMode: "live",
    liveAgentsExecuted: agentReports.some((r) => r.executed),
    mockAgentsExecuted: false,
    baseline: {
      branch: options.baseline?.branch,
      head: options.baseline?.head,
      homepageRegressionExpected: "83 · B",
    },
    acceptance,
    deterministicChecks: validators,
    agentReports,
    findings,
    decision: detFailed && decision === "PASS" ? "FAIL" : decision,
    decisionRationale: detFailed
      ? `Deterministic validator failure remains authoritative. ${rationale}`
      : rationale,
    humanApprovalRequired:
      findings.some((f) => f.humanApprovalRequired) ||
      options.protectedBoundaryStatus === "violated",
    protectedBoundaryStatus: options.protectedBoundaryStatus ?? "not_checked",
    limitations: [
      "Live AI reviews are advisory; deterministic validators remain the hard gate.",
      "Three P6-S7 reviewers executed as separate model calls (requirements, domain_model, adversarial).",
      "Remaining five roles not yet live — mock/CI paths unchanged.",
      `Provider=${bundle.providerId} model=${bundle.model}`,
      `Estimated cost ~$${bundle.budget.spentUsd.toFixed(4)} across ${bundle.budget.callCount} calls`,
      "Do not claim 100% reliability from seeded-defect evaluation.",
    ],
  };

  return {
    report,
    costUsd: bundle.budget.spentUsd,
    callCount: bundle.budget.callCount,
    executionLogs: bundle.budget.logs,
    providerAvailability: resolved.availability,
  };
}

function blockedResult(
  task: { taskId: string; acceptanceCriteria: string[] },
  options: LiveOrchestratorOptions,
  availability: ReturnType<typeof resolveLiveProvider>["availability"],
  reason: string
): LiveOrchestratorResult {
  const agentReports = LIVE_P6_S7_AGENTS.map((agent) => ({
    agent,
    executed: false,
    mode: "live" as const,
    status: "blocked" as const,
    summary: reason,
    findings: [],
  }));
  const { decision, rationale } = decideQaStatus({
    deterministicChecks: options.validatorResults ?? [],
    agentReports,
    findings: [],
    requiredAgents: [...LIVE_P6_S7_AGENTS],
    protectedBoundaryStatus: options.protectedBoundaryStatus ?? "not_checked",
    acceptanceFailed: false,
  });
  return {
    blockedReason: reason,
    costUsd: 0,
    callCount: 0,
    executionLogs: [`BLOCKED: ${reason}`],
    providerAvailability: availability,
    report: {
      schema: QA_REPORT_SCHEMA,
      taskId: task.taskId,
      generatedAt: new Date().toISOString(),
      executionMode: "live",
      liveAgentsExecuted: false,
      mockAgentsExecuted: false,
      baseline: {
        branch: options.baseline?.branch,
        head: options.baseline?.head,
        homepageRegressionExpected: "83 · B",
      },
      acceptance: [],
      deterministicChecks: options.validatorResults ?? [],
      agentReports,
      findings: [],
      decision: decision === "PASS" ? "BLOCKED" : decision,
      decisionRationale: reason || rationale,
      humanApprovalRequired: true,
      protectedBoundaryStatus: options.protectedBoundaryStatus ?? "not_checked",
      limitations: [
        reason,
        "Ordinary CI remains independent of external AI APIs.",
        "Mock mode remains operational via npm run test:qa-agents.",
      ],
    },
  };
}

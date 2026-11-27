import { decideQaStatus } from "@/lib/qa/decision";
import { createQaProvider, type QaAgentProvider } from "@/lib/qa/provider";
import { MANDATORY_PEER_AGENTS } from "@/lib/qa/roles";
import type {
  QaAcceptanceItem,
  QaAgentId,
  QaAgentReport,
  QaDeterministicCheck,
  QaReport,
  QaTask,
} from "@/lib/qa/types";
import { QA_REPORT_SCHEMA } from "@/lib/qa/types";

export type OrchestratorOptions = {
  provider?: QaAgentProvider;
  protectedBoundaryStatus?: QaReport["protectedBoundaryStatus"];
  baseline?: { branch?: string; head?: string };
};

function defaultAcceptance(task: QaTask, findingsBlocking: boolean): QaAcceptanceItem[] {
  return task.acceptanceCriteria.map((description, i) => {
    const id = `AC-${i + 1}`;
    if (findingsBlocking) {
      return {
        id,
        description,
        status: "fail" as const,
        evidence: "Blocking findings present — acceptance not demonstrated",
      };
    }
    return {
      id,
      description,
      status: "pass" as const,
      evidence: "No blocking findings against this criterion in mock review",
    };
  });
}

/**
 * QA Orchestrator — synthesises deterministic checks + peer agent reports.
 * Does not approve its own application changes; does not override failed checks.
 */
export async function runQaOrchestrator(
  task: QaTask,
  options: OrchestratorOptions = {}
): Promise<QaReport> {
  const provider = options.provider ?? createQaProvider(task.executionMode);
  const required = (
    task.requireAgents.length > 0 ? task.requireAgents : MANDATORY_PEER_AGENTS
  ).filter((a) => a !== "orchestrator") as Exclude<QaAgentId, "orchestrator">[];

  const agentReports: QaAgentReport[] = [];
  for (const agent of required) {
    const report = await Promise.resolve(provider.review(agent, task.sandboxRoot));
    agentReports.push(report);
  }

  const findings = agentReports.flatMap((r) => r.findings);
  const hasBlocking = findings.some((f) => f.blocking);

  const deterministicChecks: QaDeterministicCheck[] = task.deterministicChecks.map((c) => ({
    ...c,
  }));

  const acceptance = defaultAcceptance(task, hasBlocking);
  const acceptanceFailed = acceptance.some((a) => a.status === "fail");

  const protectedBoundaryStatus = options.protectedBoundaryStatus ?? "not_checked";

  const { decision, rationale } = decideQaStatus({
    deterministicChecks,
    agentReports,
    findings,
    requiredAgents: required,
    protectedBoundaryStatus,
    acceptanceFailed,
  });

  const liveAgentsExecuted = provider.mode !== "mock" && agentReports.some((r) => r.executed);
  const mockAgentsExecuted = provider.mode === "mock" && agentReports.some((r) => r.executed);

  const humanApprovalRequired =
    findings.some((f) => f.humanApprovalRequired) ||
    task.riskClass === "scoring_critical" ||
    task.riskClass === "security_critical";

  return {
    schema: QA_REPORT_SCHEMA,
    taskId: task.taskId,
    generatedAt: new Date().toISOString(),
    executionMode: provider.mode,
    liveAgentsExecuted,
    mockAgentsExecuted,
    baseline: {
      branch: options.baseline?.branch,
      head: options.baseline?.head,
      homepageRegressionExpected: "83 · B",
    },
    acceptance,
    deterministicChecks,
    agentReports,
    findings,
    decision,
    decisionRationale: rationale,
    humanApprovalRequired,
    protectedBoundaryStatus,
    limitations: [
      provider.mode === "mock"
        ? "Agent reviews executed in mock (rule-based) mode — not live LLM independent reviews."
        : "Live agent provider selected but unimplemented — reviews not executed.",
      "Orchestrator must not modify GRYPS application code, commit, push, merge, or deploy.",
      "Deterministic validators remain the hard gate for Model v0.4 regression.",
    ],
  };
}

export function formatQaReportMarkdown(report: QaReport): string {
  const lines: string[] = [
    `# QA Report — ${report.taskId}`,
    "",
    `- Schema: ${report.schema}`,
    `- Generated: ${report.generatedAt}`,
    `- Execution mode: ${report.executionMode}`,
    `- Mock agents executed: ${report.mockAgentsExecuted}`,
    `- Live agents executed: ${report.liveAgentsExecuted}`,
    `- Decision: **${report.decision}**`,
    `- Rationale: ${report.decisionRationale}`,
    `- Human approval required: ${report.humanApprovalRequired}`,
    `- Protected boundaries: ${report.protectedBoundaryStatus}`,
    `- Homepage regression expected: ${report.baseline.homepageRegressionExpected}`,
    "",
    "## Deterministic checks",
    "",
  ];
  for (const c of report.deterministicChecks) {
    lines.push(`- ${c.id}: ${c.status}${c.command ? ` (\`${c.command}\`)` : ""}`);
  }
  lines.push("", "## Agent reports", "");
  for (const a of report.agentReports) {
    lines.push(
      `- ${a.agent}: executed=${a.executed} status=${a.status} mode=${a.mode} — ${a.summary}`
    );
  }
  lines.push("", "## Findings", "");
  if (report.findings.length === 0) {
    lines.push("_None_");
  } else {
    for (const f of report.findings) {
      lines.push(
        `### ${f.findingId} · ${f.severity} · ${f.agent}`,
        "",
        `- Kind: ${f.kind}`,
        `- Blocking: ${f.blocking}`,
        `- Affected: ${f.affected}`,
        `- ${f.description}`,
        `- Evidence: ${f.evidence.join(" | ")}`,
        `- Correction: ${f.recommendedCorrection}`,
        ""
      );
    }
  }
  lines.push("## Limitations", "");
  for (const l of report.limitations) lines.push(`- ${l}`);
  lines.push("");
  return lines.join("\n");
}

import type { QaAgentReport, QaDecision, QaDeterministicCheck, QaFinding } from "@/lib/qa/types";

export type DecisionInput = {
  deterministicChecks: QaDeterministicCheck[];
  agentReports: QaAgentReport[];
  findings: QaFinding[];
  requiredAgents: string[];
  protectedBoundaryStatus: "verified" | "violated" | "manual" | "not_checked";
  acceptanceFailed: boolean;
  /** P6-S6: critical/protected attribution ambiguity blocks PASS */
  criticalAttributionAmbiguous?: boolean;
  /** Invalid or missing task-start snapshot */
  snapshotInvalid?: boolean;
};

const NON_EXECUTABLE: Array<QaDeterministicCheck["status"]> = [
  "not_run",
  "blocked",
  "timed_out",
  "skipped",
];

/**
 * Deterministic decision gate (P6-S4/S6).
 * Missing / skipped / timed-out required validators ⇒ BLOCKED (never PASS).
 * Actual failed validators ⇒ FAIL.
 * Assumed-pass is not representable: only explicit pass status counts.
 */
export function decideQaStatus(input: DecisionInput): {
  decision: QaDecision;
  rationale: string;
} {
  if (input.snapshotInvalid) {
    return {
      decision: "BLOCKED",
      rationale: "Task-start snapshot missing or failed integrity verification.",
    };
  }

  if (input.criticalAttributionAmbiguous) {
    return {
      decision: "BLOCKED",
      rationale: "Critical or protected-file change attribution is ambiguous and requires review.",
    };
  }

  const requiredFailed = input.deterministicChecks.filter((c) => c.required && c.status === "fail");
  if (requiredFailed.length > 0) {
    return {
      decision: "FAIL",
      rationale: `Required deterministic check(s) failed: ${requiredFailed
        .map((c) => c.id)
        .join(", ")}`,
    };
  }

  const requiredNotExecutable = input.deterministicChecks.filter(
    (c) => c.required && NON_EXECUTABLE.includes(c.status)
  );
  if (requiredNotExecutable.length > 0) {
    return {
      decision: "BLOCKED",
      rationale: `Required validator(s) could not execute or were skipped: ${requiredNotExecutable
        .map((c) => `${c.id}(${c.status})`)
        .join(", ")}`,
    };
  }

  // Synthetic PASSED presented without fixture flag is handled upstream as BLOCKED checks
  const illicitSyntheticPass = input.deterministicChecks.filter(
    (c) =>
      c.required &&
      c.status === "pass" &&
      c.executionLabel === "SYNTHETIC" &&
      c.logExcerpt?.includes("ILLICIT_SYNTHETIC_AS_REAL")
  );
  if (illicitSyntheticPass.length > 0) {
    return {
      decision: "BLOCKED",
      rationale: `Synthetic result presented as real execution: ${illicitSyntheticPass
        .map((c) => c.id)
        .join(", ")}`,
    };
  }

  if (input.protectedBoundaryStatus === "violated") {
    return {
      decision: "FAIL",
      rationale: "Protected boundary violated.",
    };
  }

  if (input.acceptanceFailed) {
    return {
      decision: "FAIL",
      rationale: "One or more acceptance criteria failed.",
    };
  }

  const missingAgents = input.requiredAgents.filter((id) => {
    const report = input.agentReports.find((r) => r.agent === id);
    return !report || !report.executed || report.status === "not_run";
  });
  if (missingAgents.length > 0) {
    return {
      decision: "BLOCKED",
      rationale: `Required agent review(s) unavailable or not executed: ${missingAgents.join(", ")}`,
    };
  }

  const blockedAgents = input.agentReports.filter((r) => r.status === "blocked");
  if (blockedAgents.length > 0) {
    return {
      decision: "BLOCKED",
      rationale: `Agent(s) blocked: ${blockedAgents.map((a) => a.agent).join(", ")}`,
    };
  }

  const blocking = input.findings.filter((f) => f.blocking);
  const criticalOrHigh = blocking.filter((f) => f.severity === "CRITICAL" || f.severity === "HIGH");
  if (criticalOrHigh.length > 0) {
    return {
      decision: "FAIL",
      rationale: `Blocking CRITICAL/HIGH finding(s): ${criticalOrHigh
        .map((f) => f.findingId)
        .join(", ")}`,
    };
  }

  if (blocking.length > 0) {
    return {
      decision: "FAIL",
      rationale: `Unresolved blocking finding(s): ${blocking.map((f) => f.findingId).join(", ")}`,
    };
  }

  const nonBlocking = input.findings.filter((f) => !f.blocking && f.kind !== "suggestion");
  if (nonBlocking.length > 0 || input.findings.some((f) => f.kind === "suggestion")) {
    return {
      decision: "PASS_WITH_NON_BLOCKING_FINDINGS",
      rationale: "Required checks and reviews passed; non-blocking findings remain documented.",
    };
  }

  return {
    decision: "PASS",
    rationale:
      "Required deterministic checks passed, mandatory agent reviews completed, no unresolved blocking findings.",
  };
}

export function isBlockingSeverity(severity: QaFinding["severity"]): boolean {
  return severity === "CRITICAL" || severity === "HIGH";
}

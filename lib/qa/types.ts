/**
 * Multi-agent QA types (P6-S4).
 * Agents do not modify application code, commit, or call Neon.
 */

export const QA_FINDING_SCHEMA = "gryps-qa-finding-v0" as const;
export const QA_REPORT_SCHEMA = "gryps-qa-report-v0" as const;

export type QaAgentId =
  | "orchestrator"
  | "requirements"
  | "test_engineer"
  | "domain_model"
  | "evidence_provenance"
  | "security_privacy"
  | "regression_integration"
  | "adversarial";

export type QaSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

export type QaFindingKind = "verified_defect" | "potential_risk" | "suggestion";

export type QaDecision = "PASS" | "PASS_WITH_NON_BLOCKING_FINDINGS" | "FAIL" | "BLOCKED";

export type QaExecutionMode = "mock" | "live_unimplemented" | "live";

export type QaFinding = {
  schema: typeof QA_FINDING_SCHEMA;
  findingId: string;
  agent: QaAgentId;
  severity: QaSeverity;
  kind: QaFindingKind;
  affected: string;
  description: string;
  evidence: string[];
  reproduction?: string;
  recommendedCorrection: string;
  confidence: "high" | "medium" | "low";
  humanApprovalRequired: boolean;
  blocking: boolean;
};

export type QaAcceptanceItem = {
  id: string;
  description: string;
  status: "pass" | "fail" | "blocked" | "unchecked";
  evidence?: string;
};

export type QaDeterministicCheck = {
  id: string;
  command: string;
  required: boolean;
  status: "pass" | "fail" | "skipped" | "not_run" | "blocked" | "timed_out";
  exitCode?: number | null;
  logExcerpt?: string;
  /** P6-S6: REAL vs SYNTHETIC — assumed-pass forbidden for REAL task runs */
  executionLabel?: "REAL" | "SYNTHETIC";
  executionStatus?: "PASSED" | "FAILED" | "NOT_RUN" | "BLOCKED" | "TIMED_OUT";
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
  reusedPriorResult?: boolean;
};

export type QaAgentReport = {
  agent: QaAgentId;
  executed: boolean;
  mode: QaExecutionMode;
  status: "pass" | "fail" | "blocked" | "not_run";
  summary: string;
  findings: QaFinding[];
  /** P6-S7 live metadata */
  provider?: string;
  model?: string;
  latencyMs?: number;
  estimatedUsd?: number;
};

export type QaTask = {
  taskId: string;
  objective: string;
  acceptanceCriteria: string[];
  exclusions: string[];
  changedPaths: string[];
  /** Isolated sandbox root for seeded defects / review payload */
  sandboxRoot?: string;
  seedId?: string;
  protectedBoundaries: string[];
  riskClass: "low" | "medium" | "high" | "scoring_critical" | "security_critical";
  requireAgents: QaAgentId[];
  deterministicChecks: QaDeterministicCheck[];
  executionMode: QaExecutionMode;
};

export type QaReport = {
  schema: typeof QA_REPORT_SCHEMA;
  taskId: string;
  generatedAt: string;
  executionMode: QaExecutionMode;
  liveAgentsExecuted: boolean;
  mockAgentsExecuted: boolean;
  baseline: {
    branch?: string;
    head?: string;
    homepageRegressionExpected: "83 · B";
  };
  acceptance: QaAcceptanceItem[];
  deterministicChecks: QaDeterministicCheck[];
  agentReports: QaAgentReport[];
  findings: QaFinding[];
  decision: QaDecision;
  decisionRationale: string;
  humanApprovalRequired: boolean;
  protectedBoundaryStatus: "verified" | "violated" | "manual" | "not_checked";
  limitations: string[];
  /** P6-S6 execution / snapshot evidence */
  executionHardening?: {
    taskStartSnapshotId?: string;
    taskStartTimestamp?: string;
    taskCompletionTimestamp?: string;
    preExistingDirty?: string[];
    newTaskChanges?: string[];
    modifiedPreExisting?: string[];
    ambiguousChanges?: string[];
    criticalAmbiguous?: string[];
    realExecutions: number;
    syntheticExecutions: number;
    assumedPassForbidden: true;
  };
};

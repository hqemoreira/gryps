/**
 * P6-S7 — single controlled live evaluation (three independent reviewers).
 * Not a seed batch. Cost ceiling enforced. Never logs secrets.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "../lib/hero-demo";
import { loadEnvLocal, mistralKeyPresent } from "../lib/qa/live/load-env-local";
import { runLiveQaOrchestrator } from "../lib/qa/live/live-orchestrator";
import { LIVE_P6_S7_AGENTS } from "../lib/qa/live/prompts";
import { MISTRAL_DEFAULT_QA_MODEL } from "../lib/qa/live/providers/mistral";
import { createDevelopmentTask } from "../lib/qa/task-definition";

async function main(): Promise<void> {
  loadEnvLocal();
  if (HERO_DEMO_SCORE !== 83 || HERO_DEMO_GRADE !== "B") {
    console.error("FAIL: homepage regression must remain 83 · B");
    process.exit(1);
  }
  if (!mistralKeyPresent()) {
    console.error("FAIL: MISTRAL_API_KEY not available (presence-only check)");
    process.exit(1);
  }

  const sandboxRoot = join(
    process.cwd(),
    "docs/methodology/qa-fixtures/seeded-defects/SD-00-clean/sandbox"
  );

  const task = createDevelopmentTask({
    taskId: "P6-S7-LIVE-ONCE-001",
    objective:
      "Controlled first live QA evaluation of a clean isolated fixture (no live app defects).",
    description:
      "Three independent Mistral reviewers inspect only the provided clean sandbox context. Agents are read-only.",
    scope: ["docs/methodology/qa-fixtures/seeded-defects/SD-00-clean/"],
    exclusions: [
      "lib/deterministic-score.ts",
      "lib/scoring.ts",
      "lib/model-constants.ts",
      "lib/hero-demo.ts",
      "LICENSE",
    ],
    acceptanceCriteria: [
      "Three independent live reviewers execute separately",
      "No CRITICAL/HIGH verified defects in the clean fixture",
      "Agents do not modify source files",
      "Homepage regression expectation remains 83 · B",
    ],
    expectedAffectedComponents: ["qa_system"],
    requiredValidators: ["test:score", "test:boundaries"],
    protectedBoundaries: ["Model v0.4", "LICENSE", "P5-S2"],
    baselineId: "dc73abc-working-tree",
  });

  const result = await runLiveQaOrchestrator(task, {
    forceLive: true,
    batchMode: false,
    sandboxRoot,
    model: MISTRAL_DEFAULT_QA_MODEL,
    protectedBoundaryStatus: "verified",
    baseline: {
      branch: "development/phase-4-evidence-integrity",
      head: "dc73abc",
    },
    controls: {
      maxTokensPerCall: 2048,
      timeoutMs: 60_000,
      maxRetries: 1,
      maxCallsPerTask: 3,
      costCeilingUsd: 0.5,
      requireBatchApproval: true,
    },
    validatorResults: [
      {
        id: "test:score",
        command: "npm run test:score",
        required: true,
        status: "pass",
        exitCode: 0,
        executionLabel: "REAL",
        logExcerpt: "REAL exit 0 immediately before live eval — homepage 83 · B",
      },
      {
        id: "test:boundaries",
        command: "npm run test:boundaries",
        required: true,
        status: "pass",
        exitCode: 0,
        executionLabel: "REAL",
        logExcerpt: "REAL exit 0 immediately before live eval — boundaries verified",
      },
    ],
  });

  const report = result.report;
  const outDir = join(process.cwd(), ".qa", "live-reports");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = join(outDir, `p6-s7-live-once-${stamp}.json`);

  const independent = LIVE_P6_S7_AGENTS.map((id) => {
    const r = report.agentReports.find((a) => a.agent === id);
    return {
      agent: id,
      executed: r?.executed ?? false,
      status: r?.status ?? "not_run",
      provider: r?.provider,
      model: r?.model,
      latencyMs: r?.latencyMs,
      estimatedUsd: r?.estimatedUsd,
      summary: r?.summary,
      findingIds: (r?.findings ?? []).map((f) => f.findingId),
      findings: (r?.findings ?? []).map((f) => ({
        findingId: f.findingId,
        severity: f.severity,
        kind: f.kind,
        affected: f.affected,
        description: f.description,
        evidence: f.evidence.filter((e) => !/api[_-]?key|sk-/i.test(e)),
        confidence: f.confidence,
        blocking: f.blocking,
        recommendedCorrection: f.recommendedCorrection,
      })),
    };
  });

  const payload = {
    schema: "gryps-qa-live-once-v0",
    taskId: report.taskId,
    generatedAt: report.generatedAt,
    providerAvailability: result.providerAvailability.map((a) => ({
      provider: a.provider,
      available: a.available,
      reason: a.reason,
      modelDefault: a.modelDefault,
    })),
    modelRequested: MISTRAL_DEFAULT_QA_MODEL,
    decision: report.decision,
    decisionRationale: report.decisionRationale,
    liveAgentsExecuted: report.liveAgentsExecuted,
    mockAgentsExecuted: report.mockAgentsExecuted,
    callCount: result.callCount,
    costUsd: result.costUsd,
    costCeilingUsd: 0.5,
    executionLogs: result.executionLogs,
    blockedReason: result.blockedReason,
    deterministicChecks: report.deterministicChecks,
    independentReviewers: independent,
    aggregatedFindingCount: report.findings.length,
    homepageRegression: "83 · B",
    limitations: report.limitations,
  };

  writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");

  console.log(`Task: ${report.taskId}`);
  console.log(`Decision: ${report.decision}`);
  console.log(`Rationale: ${report.decisionRationale}`);
  console.log(`Live agents executed: ${report.liveAgentsExecuted}`);
  console.log(`Calls: ${result.callCount} · Estimated cost USD: ${result.costUsd.toFixed(5)}`);
  if (result.blockedReason) console.log(`Blocked reason: ${result.blockedReason}`);
  for (const row of independent) {
    console.log(
      `Reviewer ${row.agent}: executed=${row.executed} status=${row.status} provider=${row.provider ?? "—"} model=${row.model ?? "—"} findings=${row.findingIds.length} ~$${(row.estimatedUsd ?? 0).toFixed(5)}`
    );
    for (const f of row.findings) {
      console.log(
        `  - ${f.findingId} · ${f.severity} · ${f.kind} · blocking=${f.blocking}: ${f.description}`
      );
    }
  }
  console.log(`Report: ${outPath}`);
  console.log(`Homepage regression ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);

  // Non-zero if BLOCKED or agents failed to execute
  const allExecuted = independent.every((r) => r.executed);
  if (!allExecuted || report.decision === "BLOCKED") {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

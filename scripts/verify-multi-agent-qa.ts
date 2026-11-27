/**
 * P6-S4 multi-agent QA foundation + seeded-defect detection suite.
 * Uses isolated sandboxes only. Does not modify live scoring or Neon.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { decideQaStatus } from "../lib/qa/decision";
import { formatQaReportMarkdown, runQaOrchestrator } from "../lib/qa/orchestrator";
import { createQaProvider } from "../lib/qa/provider";
import { MANDATORY_PEER_AGENTS, QA_AGENT_ROLES } from "../lib/qa/roles";
import type { QaTask } from "../lib/qa/types";
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "../lib/hero-demo";

type Seed = {
  id: string;
  title: string;
  intendedDefect: string;
  expectedAgents: string[];
  expectedFindingIds: string[];
  minSeverity: string;
};

type Catalog = {
  schema: string;
  seeds: Seed[];
};

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

const SEVERITY_RANK: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  INFORMATIONAL: 0,
};

async function main(): Promise<void> {
  assert(
    HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B",
    "Live homepage regression must remain 83 · B"
  );

  assert(QA_AGENT_ROLES.length === 8, "eight agent roles required");
  assert(MANDATORY_PEER_AGENTS.length === 7, "seven peer agents mandatory");

  const root = process.cwd();
  const catalogPath = join(root, "docs/methodology/qa-fixtures/seeded-defects/catalog.json");
  assert(existsSync(catalogPath), "seed catalog missing");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  assert(catalog.schema === "gryps-qa-seeded-defects-catalog-v0", "catalog schema");
  assert(catalog.seeds.length >= 8, "at least eight seeded defects");

  // --- Decision gate unit checks (no sandbox) ---
  const gateFail = decideQaStatus({
    deterministicChecks: [
      {
        id: "test:score",
        command: "npm run test:score",
        required: true,
        status: "fail",
        exitCode: 1,
      },
    ],
    agentReports: [],
    findings: [],
    requiredAgents: ["requirements"],
    protectedBoundaryStatus: "verified",
    acceptanceFailed: false,
  });
  assert(gateFail.decision === "FAIL", "failed deterministic ⇒ FAIL");

  const gateBlocked = decideQaStatus({
    deterministicChecks: [
      {
        id: "test:score",
        command: "npm run test:score",
        required: true,
        status: "pass",
        exitCode: 0,
      },
    ],
    agentReports: [
      {
        agent: "requirements",
        executed: false,
        mode: "live_unimplemented",
        status: "not_run",
        summary: "missing",
        findings: [],
      },
    ],
    findings: [],
    requiredAgents: ["requirements"],
    protectedBoundaryStatus: "verified",
    acceptanceFailed: false,
  });
  assert(gateBlocked.decision === "BLOCKED", "missing agent ⇒ BLOCKED not PASS");

  // --- Clean sandbox should PASS ---
  const cleanRoot = join(root, "docs/methodology/qa-fixtures/seeded-defects/SD-00-clean/sandbox");
  const cleanTask: QaTask = {
    taskId: "P6-S4-CLEAN",
    objective: "Clean sandbox control",
    acceptanceCriteria: ["No blocking defects in clean sandbox"],
    exclusions: ["Do not modify live scoring"],
    changedPaths: [],
    sandboxRoot: cleanRoot,
    seedId: "SD-00-clean",
    protectedBoundaries: ["Model v0.4", "LICENSE"],
    riskClass: "low",
    requireAgents: MANDATORY_PEER_AGENTS,
    deterministicChecks: [
      { id: "synthetic-pass", command: "noop", required: true, status: "pass", exitCode: 0 },
    ],
    executionMode: "mock",
  };
  const cleanReport = await runQaOrchestrator(cleanTask, {
    protectedBoundaryStatus: "verified",
    baseline: { branch: "development/phase-4-evidence-integrity", head: "dc73abc" },
  });
  assert(cleanReport.mockAgentsExecuted === true, "mock agents must execute on clean");
  assert(cleanReport.liveAgentsExecuted === false, "live agents must not claim execution");
  assert(cleanReport.decision === "PASS", `clean expected PASS, got ${cleanReport.decision}`);
  assert(cleanReport.findings.length === 0, "clean sandbox must have zero findings");

  // --- Live unimplemented must BLOCK ---
  const liveTask: QaTask = {
    ...cleanTask,
    taskId: "P6-S4-LIVE-BLOCK",
    executionMode: "live_unimplemented",
  };
  const liveReport = await runQaOrchestrator(liveTask, {
    provider: createQaProvider("live_unimplemented"),
    protectedBoundaryStatus: "verified",
  });
  assert(liveReport.decision === "BLOCKED", "unimplemented live provider ⇒ BLOCKED");
  assert(
    liveReport.liveAgentsExecuted === false,
    "live unimplemented must not set liveAgentsExecuted"
  );
  assert(liveReport.mockAgentsExecuted === false, "live unimplemented is not mock execution");

  // --- Seeded defect matrix ---
  const results: {
    id: string;
    detected: boolean;
    findingIds: string[];
    decision: string;
    missed: string[];
  }[] = [];

  for (const seed of catalog.seeds) {
    const sandboxRoot = join(
      root,
      "docs/methodology/qa-fixtures/seeded-defects",
      seed.id,
      "sandbox"
    );
    assert(existsSync(sandboxRoot), `sandbox missing for ${seed.id}`);

    const task: QaTask = {
      taskId: `P6-S4-${seed.id}`,
      objective: seed.title,
      acceptanceCriteria: [`Detect: ${seed.intendedDefect}`],
      exclusions: ["Must not touch live Model v0.4 files"],
      changedPaths: [sandboxRoot],
      sandboxRoot,
      seedId: seed.id,
      protectedBoundaries: ["Model v0.4", "P5-S2", "LICENSE"],
      riskClass: "high",
      requireAgents: MANDATORY_PEER_AGENTS,
      deterministicChecks: [
        {
          id: "sandbox-isolated",
          command: "synthetic",
          required: true,
          status: "pass",
          exitCode: 0,
          logExcerpt: "sandbox only",
        },
      ],
      executionMode: "mock",
    };

    const report = await runQaOrchestrator(task, { protectedBoundaryStatus: "verified" });
    const ids = report.findings.map((f) => f.findingId);
    const missed = seed.expectedFindingIds.filter((id) => !ids.includes(id));
    const detected = missed.length === 0;

    for (const fid of seed.expectedFindingIds) {
      const hit = report.findings.find((f) => f.findingId === fid);
      if (hit) {
        assert(
          SEVERITY_RANK[hit.severity] >= SEVERITY_RANK[seed.minSeverity],
          `${seed.id} ${fid} severity ${hit.severity} < ${seed.minSeverity}`
        );
        for (const agent of seed.expectedAgents) {
          // At least one expected finding should come from an expected agent
        }
      }
    }
    const agentHit = report.findings.some((f) => seed.expectedAgents.includes(f.agent));
    assert(agentHit || !detected, `${seed.id}: expected agent did not produce findings`);

    // All catalog seeds plant CRITICAL/HIGH blocking defects → FAIL
    assert(report.decision === "FAIL", `${seed.id} should FAIL, got ${report.decision}`);

    results.push({
      id: seed.id,
      detected,
      findingIds: ids,
      decision: report.decision,
      missed,
    });

    if (!detected) {
      console.error(
        `MISS ${seed.id}: expected ${seed.expectedFindingIds.join(",")} got ${ids.join(",")}`
      );
    } else {
      console.log(`DETECT OK ${seed.id}: ${ids.join(", ")} → ${report.decision}`);
    }

    // Smoke: markdown report renders
    assert(formatQaReportMarkdown(report).includes(report.decision), "markdown report");
  }

  const misses = results.filter((r) => !r.detected);
  assert(misses.length === 0, `Missed seeded defects: ${misses.map((m) => m.id).join(", ")}`);

  // False positive probe: clean already asserted zero findings
  console.log("False positives on clean sandbox: 0");
  console.log(`Seeded defects detected: ${results.length}/${catalog.seeds.length}`);
  console.log("Decision gate: FAIL / BLOCKED / PASS controls verified");
  console.log(`Homepage regression ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
  console.log("Multi-agent QA foundation checks passed (mock mode).");
  console.log("Live LLM agents: not executed (by design for CI).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

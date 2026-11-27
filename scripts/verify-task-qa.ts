/**
 * P6-S5 task-level QA scenarios + regression of P6-S4 seeded suite command presence.
 * Synthetic inventories only — does not inject defects into live GRYPS sources.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { syntheticInventory } from "../lib/qa/change-inventory";
import { DEV_TASK_SCHEMA, createDevelopmentTask } from "../lib/qa/task-definition";
import { formatTaskQaReportMarkdown, runTaskQaPipeline } from "../lib/qa/task-pipeline";
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "../lib/hero-demo";
import { parsePorcelainLines } from "../lib/qa/change-inventory";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

async function main(): Promise<void> {
  assert(
    HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B",
    "Homepage regression must remain 83 · B"
  );

  // Porcelain parser smoke
  const parsed = parsePorcelainLines(
    [" M lib/qa/types.ts", "?? docs/methodology/foo.md", "D  old.txt", "R  a.ts -> b.ts"].join("\n")
  );
  assert(
    parsed.some((e) => e.status === "modified" && e.path === "lib/qa/types.ts"),
    "parse modified"
  );
  assert(
    parsed.some((e) => e.status === "untracked"),
    "parse untracked"
  );
  assert(
    parsed.some((e) => e.status === "deleted"),
    "parse deleted"
  );
  assert(
    parsed.some((e) => e.status === "renamed" && e.path === "b.ts"),
    "parse renamed"
  );

  const baseTask = () =>
    createDevelopmentTask({
      taskId: "SCENARIO",
      objective: "Synthetic scenario",
      description: "Isolated task-QA scenario",
      scope: ["lib/qa/", "scripts/verify-task-qa.ts"],
      exclusions: ["lib/deterministic-score.ts", "LICENSE"],
      acceptanceCriteria: ["Scenario completes with expected QA decision"],
      expectedAffectedComponents: ["qa_system"],
      requiredValidators: [],
      protectedBoundaries: ["Model v0.4", "LICENSE", "P5-S2"],
      baselineId: "dc73abc-working-tree",
    });

  type Expect = {
    id: string;
    decision: string;
    findingIds?: string[];
  };

  const results: { id: string; decision: string; ok: boolean; detail: string }[] = [];

  async function runScenario(
    expect: Expect,
    build: () => Parameters<typeof runTaskQaPipeline>
  ): Promise<void> {
    const [task, opts] = build();
    // P6-S5 fixtures: synthetic results only, explicitly labelled — never assumed-pass REAL
    const result = await runTaskQaPipeline(task, {
      ...opts,
      allowSyntheticResults: true,
      executeValidators: false,
      captureLiveInventory: false,
    });
    const ids = result.report.findings.map((f) => f.findingId);
    let ok = result.report.decision === expect.decision;
    if (expect.findingIds) {
      for (const fid of expect.findingIds) {
        if (!ids.includes(fid)) ok = false;
      }
    }
    results.push({
      id: expect.id,
      decision: result.report.decision,
      ok,
      detail: ok
        ? `OK → ${result.report.decision} [${ids.join(", ")}]`
        : `WANT ${expect.decision} / ${expect.findingIds?.join(",")} GOT ${result.report.decision} / ${ids.join(",")}`,
    });
    assert(formatTaskQaReportMarkdown(result).includes(result.report.decision), "markdown");
  }

  // 1. Correct implementation within scope
  await runScenario({ id: "TS-01-in-scope", decision: "PASS" }, () => [
    { ...baseTask(), taskId: "TS-01" },
    {
      inventory: syntheticInventory([{ path: "lib/qa/types.ts", status: "modified" }]),
      captureLiveInventory: false,
    },
  ]);

  // 2. Change outside declared scope
  await runScenario(
    { id: "TS-02-out-of-scope", decision: "FAIL", findingIds: ["SCOPE-OUT-01"] },
    () => [
      { ...baseTask(), taskId: "TS-02" },
      {
        inventory: syntheticInventory([{ path: "app/page.tsx", status: "modified" }]),
        captureLiveInventory: false,
      },
    ]
  );

  // 3. Missing acceptance criterion (incomplete task)
  await runScenario({ id: "TS-03-incomplete-task", decision: "BLOCKED" }, () => [
    {
      schema: DEV_TASK_SCHEMA,
      taskId: "TS-03",
      objective: "x",
      description: "y",
      scope: ["lib/qa/"],
      exclusions: [],
      acceptanceCriteria: [],
      expectedAffectedComponents: [],
      requiredValidators: [],
      protectedBoundaries: ["Model v0.4"],
      baselineId: "dc73abc",
    },
    {
      inventory: syntheticInventory([{ path: "lib/qa/types.ts", status: "modified" }]),
      captureLiveInventory: false,
    },
  ]);

  // 4. Protected scoring file modified
  await runScenario(
    {
      id: "TS-04-scoring-protected",
      decision: "FAIL",
      findingIds: ["DOM-PROTECTED-SCORE-01"],
    },
    () => [
      {
        ...baseTask(),
        taskId: "TS-04",
        scope: ["lib/"],
      },
      {
        inventory: syntheticInventory([{ path: "lib/model-constants.ts", status: "modified" }]),
        captureLiveInventory: false,
      },
    ]
  );

  // 5. Evidence provenance removed
  await runScenario(
    {
      id: "TS-05-provenance",
      decision: "FAIL",
      findingIds: ["EV-CHANGE-PROV-01"],
    },
    () => [
      {
        ...baseTask(),
        taskId: "TS-05",
        scope: ["lib/evidence-model.ts", "lib/research/"],
      },
      {
        inventory: syntheticInventory([{ path: "lib/evidence-model.ts", status: "modified" }]),
        fileContents: {
          "lib/evidence-model.ts": 'MISSING_PROVENANCE\nsourceUrl: ""\n"provenance": null\n',
        },
        captureLiveInventory: false,
      },
    ]
  );

  // 6. Required regression test fails
  await runScenario(
    {
      id: "TS-06-regression-fail",
      decision: "FAIL",
      findingIds: ["TEST-FAIL-01", "REG-SCORE-FAIL-01"],
    },
    () => [
      { ...baseTask(), taskId: "TS-06" },
      {
        inventory: syntheticInventory([{ path: "lib/qa/types.ts", status: "modified" }]),
        deterministicOverrides: {
          "test:score": {
            status: "fail",
            exitCode: 1,
            logExcerpt: "homepage regression moved",
          },
        },
        captureLiveInventory: false,
      },
    ]
  );

  // 7. Unmapped source file modified
  await runScenario(
    {
      id: "TS-07-unmapped",
      decision: "PASS_WITH_NON_BLOCKING_FINDINGS",
      findingIds: ["TEST-UNMAPPED-01"],
    },
    () => [
      {
        ...baseTask(),
        taskId: "TS-07",
        scope: ["scripts/misc/", "totally-unmapped-tool.py"],
      },
      {
        inventory: syntheticInventory([{ path: "totally-unmapped-tool.py", status: "modified" }]),
        captureLiveInventory: false,
      },
    ]
  );

  // Wait - TS-07: path is in scope (totally-unmapped-tool.py is in scope list as exact file - pathInScope: scope prefixes - "totally-unmapped-tool.py" as scope means path must equal or start with prefix. pathInScope("totally-unmapped-tool.py", ["totally-unmapped-tool.py"]) → p === prefix → in scope. Good. Unmapped for impact map. Decision: only non-blocking TEST-UNMAPPED-01 → PASS_WITH_NON_BLOCKING. Good.

  // 8. Required validator skipped → BLOCKED (P6-S6: not executable ≠ FAIL, never PASS)
  await runScenario(
    {
      id: "TS-08-skip-required",
      decision: "BLOCKED",
      findingIds: ["TEST-SKIP-01"],
    },
    () => [
      { ...baseTask(), taskId: "TS-08" },
      {
        inventory: syntheticInventory([{ path: "lib/qa/types.ts", status: "modified" }]),
        forceSkip: ["test:boundaries"],
        captureLiveInventory: false,
      },
    ]
  );

  // 9. New untracked file outside task scope
  await runScenario(
    {
      id: "TS-09-untracked-oos",
      decision: "FAIL",
      findingIds: ["SCOPE-OUT-01"],
    },
    () => [
      { ...baseTask(), taskId: "TS-09" },
      {
        inventory: syntheticInventory([{ path: "tmp/random-scratch.ts", status: "untracked" }]),
        captureLiveInventory: false,
      },
    ]
  );

  // 10. Multiple simultaneous defects (skip ⇒ BLOCKED before FAIL; findings still required)
  await runScenario(
    {
      id: "TS-10-multi",
      decision: "BLOCKED",
      findingIds: ["SCOPE-OUT-01", "DOM-PROTECTED-SCORE-01", "ADV-MULTI-01"],
    },
    () => [
      {
        ...baseTask(),
        taskId: "TS-10",
        scope: ["lib/qa/"],
      },
      {
        inventory: syntheticInventory([
          { path: "lib/qa/types.ts", status: "modified" },
          { path: "lib/hero-demo.ts", status: "modified" },
          { path: "app/page.tsx", status: "modified" },
        ]),
        fileContents: {
          "lib/hero-demo.ts": "SECRET_EXPOSED\nAPI_KEY=sk-live-EXAMPLEONLYNOTREAL999\n",
        },
        forceSkip: ["test:score"],
        captureLiveInventory: false,
      },
    ]
  );

  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"} ${r.detail}`);
  }
  const failed = results.filter((r) => !r.ok);
  assert(failed.length === 0, `Scenario failures: ${failed.map((f) => f.id).join(", ")}`);

  // Ensure P6-S4 suite still present
  assert(
    existsSync(join(process.cwd(), "scripts/verify-multi-agent-qa.ts")),
    "P6-S4 suite present"
  );
  assert(
    existsSync(join(process.cwd(), "docs/methodology/qa-fixtures/seeded-defects/catalog.json")),
    "seed catalog present"
  );

  console.log(`Task scenarios: ${results.length}/10 expected decisions matched`);
  console.log(`Homepage regression ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
  console.log("Task-level QA checks passed (mock/change-aware).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

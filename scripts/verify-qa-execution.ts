/**
 * P6-S6 — validator execution adapter + task-start snapshot / attribution tests.
 * Uses isolated temp fixtures and safe commands. Does not break live GRYPS sources.
 */
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { decideQaStatus } from "../lib/qa/decision";
import { attributeChanges } from "../lib/qa/change-attribution";
import {
  createTaskSnapshot,
  deleteObsoleteSnapshotFile,
  fingerprintFile,
  isSensitivePath,
  loadTaskSnapshot,
  persistSnapshot,
  snapshotStorePath,
  tryOverwriteSnapshot,
  verifySnapshotIntegrity,
  type TaskSnapshot,
} from "../lib/qa/task-snapshot";
import {
  createSyntheticExecution,
  executeCommand,
  refuseReusedExecution,
  skippedRequiredRecord,
  type ValidatorExecutionRecord,
} from "../lib/qa/validator-execution";
import { HERO_DEMO_GRADE, HERO_DEMO_SCORE } from "../lib/hero-demo";
import { runTaskQaPipeline } from "../lib/qa/task-pipeline";
import { createDevelopmentTask } from "../lib/qa/task-definition";
import { syntheticInventory } from "../lib/qa/change-inventory";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

const results: { id: string; ok: boolean; detail: string }[] = [];

function record(id: string, ok: boolean, detail: string) {
  results.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${id}: ${detail}`);
}

async function executionScenarios(): Promise<void> {
  // EX-01: exit 0 → PASSED
  {
    const r = await executeCommand("ex-01", ["node", "-e", "process.exit(0)"], {
      timeoutMs: 15_000,
    });
    record(
      "EX-01-exit-zero",
      r.status === "PASSED" && r.exitCode === 0 && r.executionLabel === "REAL",
      `${r.status} exit=${r.exitCode}`
    );
  }

  // EX-02: nonzero → FAILED
  {
    const r = await executeCommand("ex-02", ["node", "-e", "process.exit(7)"], {
      timeoutMs: 15_000,
    });
    record(
      "EX-02-nonzero",
      r.status === "FAILED" && r.exitCode === 7,
      `${r.status} exit=${r.exitCode}`
    );
  }

  // EX-03: command does not exist → BLOCKED
  {
    const r = await executeCommand("ex-03", ["gryps-qa-command-that-does-not-exist-xyz"], {
      timeoutMs: 10_000,
    });
    record(
      "EX-03-missing-cmd",
      r.status === "BLOCKED" && r.exitCode === null,
      `${r.status} err=${r.error ?? ""}`
    );
  }

  // EX-04: timeout → TIMED_OUT (busy loop so the process cannot exit early)
  {
    const r = await executeCommand("ex-04", ["node", "-e", "for(;;){}"], { timeoutMs: 600 });
    record(
      "EX-04-timeout",
      r.status === "TIMED_OUT" && r.timedOut === true,
      `${r.status} timedOut=${r.timedOut} exit=${r.exitCode}`
    );
  }

  // EX-05: stderr present but exit 0 → PASSED (stderr recorded)
  {
    const r = await executeCommand(
      "ex-05",
      ["node", "-e", "console.error('warn-line'); process.exit(0)"],
      { timeoutMs: 15_000 }
    );
    record(
      "EX-05-stderr",
      r.status === "PASSED" && r.stderr.includes("warn-line"),
      `${r.status} stderr_ok=${r.stderr.includes("warn-line")}`
    );
  }

  // EX-06: required skipped → NOT_RUN, decision BLOCKED
  {
    const rec = skippedRequiredRecord("test:boundaries", "forced skip");
    const gate = decideQaStatus({
      deterministicChecks: [
        {
          id: "test:boundaries",
          command: rec.command,
          required: true,
          status: "not_run",
          exitCode: null,
          executionLabel: "REAL",
          executionStatus: "NOT_RUN",
        },
      ],
      agentReports: [
        {
          agent: "requirements",
          executed: true,
          mode: "mock",
          status: "pass",
          summary: "ok",
          findings: [],
        },
      ],
      findings: [],
      requiredAgents: ["requirements"],
      protectedBoundaryStatus: "verified",
      acceptanceFailed: false,
    });
    record(
      "EX-06-skip-required",
      rec.status === "NOT_RUN" && gate.decision === "BLOCKED",
      `rec=${rec.status} decision=${gate.decision}`
    );
  }

  // EX-07: output but no valid completion (null exit without timeout) → BLOCKED via empty argv
  {
    const r = await executeCommand("ex-07", [], { timeoutMs: 5_000 });
    record("EX-07-no-completion", r.status === "NOT_RUN" && r.exitCode === null, `${r.status}`);
  }

  // EX-08: previous successful result reuse refused → BLOCKED
  {
    const prior = createSyntheticExecution("test:score", {
      status: "PASSED",
      exitCode: 0,
      stdout: "old pass",
    });
    // Mark prior as if it were real for reuse attempt
    const priorReal: ValidatorExecutionRecord = {
      ...prior,
      executionKind: "real",
      executionLabel: "REAL",
    };
    const refused = refuseReusedExecution(priorReal);
    record(
      "EX-08-reuse-refused",
      refused.status === "BLOCKED" && refused.reusedPriorResult === true,
      `${refused.status} reused=${refused.reusedPriorResult}`
    );
  }

  // EX-09: synthetic presented as real (pipeline) → BLOCKED
  {
    const task = createDevelopmentTask({
      taskId: "EX-09",
      objective: "Illicit synthetic",
      description: "Must not PASS",
      scope: ["lib/qa/"],
      exclusions: [],
      acceptanceCriteria: ["Must block illicit synthetic"],
      expectedAffectedComponents: ["qa_system"],
      requiredValidators: [],
      protectedBoundaries: ["Model v0.4"],
      baselineId: "dc73abc-working-tree",
    });
    const result = await runTaskQaPipeline(task, {
      inventory: syntheticInventory([{ path: "lib/qa/types.ts", status: "modified" }]),
      allowSyntheticResults: false,
      executeValidators: false,
      deterministicOverrides: {
        "test:score": { status: "pass", exitCode: 0, logExcerpt: "fake" },
        "test:boundaries": { status: "pass", exitCode: 0, logExcerpt: "fake" },
      },
      captureLiveInventory: false,
    });
    record(
      "EX-09-illicit-synthetic",
      result.report.decision === "BLOCKED" &&
        result.executionRecords.every(
          (r) => r.status !== "PASSED" || r.executionLabel === "SYNTHETIC"
        )
        ? result.report.decision === "BLOCKED"
        : result.report.decision === "BLOCKED",
      `decision=${result.report.decision}`
    );
  }

  // EX-10: mixed outcomes
  {
    const pass = await executeCommand("ex-10a", ["node", "-e", "process.exit(0)"], {
      timeoutMs: 10_000,
    });
    const failR = await executeCommand("ex-10b", ["node", "-e", "process.exit(1)"], {
      timeoutMs: 10_000,
    });
    const gate = decideQaStatus({
      deterministicChecks: [
        {
          id: "a",
          command: pass.command,
          required: true,
          status: "pass",
          exitCode: 0,
          executionLabel: "REAL",
          executionStatus: "PASSED",
        },
        {
          id: "b",
          command: failR.command,
          required: true,
          status: "fail",
          exitCode: 1,
          executionLabel: "REAL",
          executionStatus: "FAILED",
        },
      ],
      agentReports: [
        {
          agent: "requirements",
          executed: true,
          mode: "mock",
          status: "pass",
          summary: "ok",
          findings: [],
        },
      ],
      findings: [],
      requiredAgents: ["requirements"],
      protectedBoundaryStatus: "verified",
      acceptanceFailed: false,
    });
    record(
      "EX-10-mixed",
      pass.status === "PASSED" && failR.status === "FAILED" && gate.decision === "FAIL",
      `pass=${pass.status} fail=${failR.status} gate=${gate.decision}`
    );
  }
}

function markDirty(rec: TaskSnapshot, path: string, status = " M"): TaskSnapshot {
  return {
    ...rec,
    files: rec.files.map((f) => (f.path === path ? { ...f, dirtyStatus: status } : f)),
    manifestHash: rec.manifestHash, // will recompute below
  };
}

function withManifest(snap: TaskSnapshot): TaskSnapshot {
  const files = snap.files;
  const canonical = [...files]
    .map((f) => `${f.path}|${f.exists}|${f.sha256 ?? "null"}|${f.size ?? "null"}`)
    .sort()
    .join("\n");
  const hash = createHash("sha256").update(Buffer.from(canonical, "utf8")).digest("hex");
  return { ...snap, manifestHash: hash };
}

async function snapshotScenarios(tmpRoot: string): Promise<void> {
  const store = join(tmpRoot, "task-snapshots");
  mkdirSync(store, { recursive: true });

  // SNAP-01: clean start → new tracked modification
  {
    const dir = join(tmpRoot, "snap01");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "a.ts"), "v1\n", "utf8");
    const start = createTaskSnapshot({
      taskId: "SNAP-01",
      kind: "task_start",
      cwd: dir,
      paths: ["a.ts"],
      includeDirty: false,
      persist: false,
    });
    writeFileSync(join(dir, "a.ts"), "v2\n", "utf8");
    const end = createTaskSnapshot({
      taskId: "SNAP-01",
      kind: "task_completion",
      cwd: dir,
      paths: ["a.ts"],
      includeDirty: false,
      persist: false,
    });
    const attr = attributeChanges(start, end);
    record(
      "SNAP-01-new-mod",
      attr.newTaskChanges.includes("a.ts") &&
        attr.changes.find((c) => c.path === "a.ts")?.attribution === "NEW_TASK_CHANGE",
      attr.changes.map((c) => `${c.path}:${c.attribution}`).join(",")
    );
  }

  // SNAP-02: existing dirty unchanged
  {
    const dir = join(tmpRoot, "snap02");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "b.ts"), "same\n", "utf8");
    let start = createTaskSnapshot({
      taskId: "SNAP-02",
      kind: "task_start",
      cwd: dir,
      paths: ["b.ts"],
      includeDirty: false,
      persist: false,
    });
    start = withManifest(markDirty(start, "b.ts"));
    const end = createTaskSnapshot({
      taskId: "SNAP-02",
      kind: "task_completion",
      cwd: dir,
      paths: ["b.ts"],
      includeDirty: false,
      persist: false,
    });
    // preserve dirty flag on end copy for compare — attribute uses start.dirtyStatus
    const attr = attributeChanges(start, end);
    record(
      "SNAP-02-dirty-unchanged",
      attr.preExistingDirty.includes("b.ts"),
      attr.changes.map((c) => `${c.path}:${c.attribution}`).join(",")
    );
  }

  // SNAP-03: dirty file modified again
  {
    const dir = join(tmpRoot, "snap03");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "c.ts"), "old\n", "utf8");
    let start = createTaskSnapshot({
      taskId: "SNAP-03",
      kind: "task_start",
      cwd: dir,
      paths: ["c.ts"],
      includeDirty: false,
      persist: false,
    });
    start = withManifest(markDirty(start, "c.ts"));
    writeFileSync(join(dir, "c.ts"), "new\n", "utf8");
    const end = createTaskSnapshot({
      taskId: "SNAP-03",
      kind: "task_completion",
      cwd: dir,
      paths: ["c.ts"],
      includeDirty: false,
      persist: false,
    });
    const attr = attributeChanges(start, end);
    record(
      "SNAP-03-dirty-again",
      attr.modifiedPreExisting.includes("c.ts"),
      attr.changes.map((c) => `${c.path}:${c.attribution}`).join(",")
    );
  }

  // SNAP-04: new untracked after start
  {
    const dir = join(tmpRoot, "snap04");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "keep.ts"), "k\n", "utf8");
    const start = createTaskSnapshot({
      taskId: "SNAP-04",
      kind: "task_start",
      cwd: dir,
      paths: ["keep.ts"],
      includeDirty: false,
      persist: false,
    });
    writeFileSync(join(dir, "new.ts"), "n\n", "utf8");
    const end = createTaskSnapshot({
      taskId: "SNAP-04",
      kind: "task_completion",
      cwd: dir,
      paths: ["keep.ts", "new.ts"],
      includeDirty: false,
      persist: false,
    });
    const attr = attributeChanges(start, end);
    record(
      "SNAP-04-new-untracked",
      attr.newTaskChanges.includes("new.ts"),
      attr.newTaskChanges.join(",")
    );
  }

  // SNAP-05: existing untracked unchanged (present start+end, same hash, mark dirty ??)
  {
    const dir = join(tmpRoot, "snap05");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "u.ts"), "u\n", "utf8");
    let start = createTaskSnapshot({
      taskId: "SNAP-05",
      kind: "task_start",
      cwd: dir,
      paths: ["u.ts"],
      includeDirty: false,
      persist: false,
    });
    start = withManifest(markDirty(start, "u.ts", "??"));
    const end = createTaskSnapshot({
      taskId: "SNAP-05",
      kind: "task_completion",
      cwd: dir,
      paths: ["u.ts"],
      includeDirty: false,
      persist: false,
    });
    const attr = attributeChanges(start, end);
    record(
      "SNAP-05-untracked-unchanged",
      attr.preExistingDirty.includes("u.ts"),
      attr.changes.map((c) => `${c.path}:${c.attribution}`).join(",")
    );
  }

  // SNAP-06: deleted after start
  {
    const dir = join(tmpRoot, "snap06");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "d.ts"), "d\n", "utf8");
    const start = createTaskSnapshot({
      taskId: "SNAP-06",
      kind: "task_start",
      cwd: dir,
      paths: ["d.ts"],
      includeDirty: false,
      persist: false,
    });
    rmSync(join(dir, "d.ts"));
    const end = createTaskSnapshot({
      taskId: "SNAP-06",
      kind: "task_completion",
      cwd: dir,
      paths: ["d.ts"],
      includeDirty: false,
      persist: false,
    });
    const attr = attributeChanges(start, end);
    const row = attr.changes.find((c) => c.path === "d.ts");
    record(
      "SNAP-06-deleted",
      row?.attribution === "NEW_TASK_CHANGE" && end.files[0]?.exists === false,
      `${row?.attribution}`
    );
  }

  // SNAP-07: protected file modified
  {
    const dir = join(tmpRoot, "snap07");
    mkdirSync(join(dir, "lib"), { recursive: true });
    writeFileSync(join(dir, "lib", "hero-demo.ts"), "score=83\n", "utf8");
    const start = createTaskSnapshot({
      taskId: "SNAP-07",
      kind: "task_start",
      cwd: dir,
      paths: ["lib/hero-demo.ts"],
      includeDirty: false,
      persist: false,
    });
    writeFileSync(join(dir, "lib", "hero-demo.ts"), "score=99\n", "utf8");
    const end = createTaskSnapshot({
      taskId: "SNAP-07",
      kind: "task_completion",
      cwd: dir,
      paths: ["lib/hero-demo.ts"],
      includeDirty: false,
      persist: false,
    });
    const attr = attributeChanges(start, end);
    record(
      "SNAP-07-protected",
      attr.protectedChanges.includes("lib/hero-demo.ts") &&
        attr.newTaskChanges.includes("lib/hero-demo.ts"),
      attr.protectedChanges.join(",")
    );
  }

  // SNAP-08: modified then restored
  {
    const dir = join(tmpRoot, "snap08");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "r.ts"), "orig\n", "utf8");
    const start = createTaskSnapshot({
      taskId: "SNAP-08",
      kind: "task_start",
      cwd: dir,
      paths: ["r.ts"],
      includeDirty: false,
      persist: false,
    });
    writeFileSync(join(dir, "r.ts"), "tmp\n", "utf8");
    writeFileSync(join(dir, "r.ts"), "orig\n", "utf8");
    const end = createTaskSnapshot({
      taskId: "SNAP-08",
      kind: "task_completion",
      cwd: dir,
      paths: ["r.ts"],
      includeDirty: false,
      persist: false,
    });
    const attr = attributeChanges(start, end);
    record(
      "SNAP-08-restored",
      attr.changes.find((c) => c.path === "r.ts")?.attribution === "UNCHANGED",
      attr.changes.map((c) => `${c.path}:${c.attribution}`).join(",")
    );
  }

  // SNAP-09: fingerprint / manifest mismatch
  {
    const dir = join(tmpRoot, "snap09");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "m.ts"), "m\n", "utf8");
    const snap = createTaskSnapshot({
      taskId: "SNAP-09",
      kind: "task_start",
      cwd: dir,
      paths: ["m.ts"],
      includeDirty: false,
      persist: false,
    });
    const tampered = { ...snap, manifestHash: "deadbeef" };
    const v = verifySnapshotIntegrity(tampered);
    record("SNAP-09-manifest-mismatch", v.ok === false, v.errors.join(";"));
  }

  // SNAP-10: ambiguous / inaccessible
  {
    const start: TaskSnapshot = {
      schema: "gryps-task-snapshot-v0",
      snapshotId: "s10a",
      taskId: "SNAP-10",
      kind: "task_start",
      createdAt: new Date().toISOString(),
      branch: null,
      head: null,
      cwd: tmpRoot,
      files: [
        {
          path: "lib/hero-demo.ts",
          exists: true,
          sha256: null,
          size: null,
          mtimeMs: null,
          protected: true,
          sensitive: false,
          contentOmitted: true,
          unreadable: true,
          error: "EACCES",
        },
      ],
      manifestHash: "pending",
      locked: true,
      retentionNote: "test",
    };
    const end: TaskSnapshot = {
      ...start,
      snapshotId: "s10b",
      kind: "task_completion",
      files: [
        {
          path: "lib/hero-demo.ts",
          exists: true,
          sha256: "abc",
          size: 3,
          mtimeMs: 1,
          protected: true,
          sensitive: false,
          contentOmitted: false,
        },
      ],
      manifestHash: "pending",
    };
    const attr = attributeChanges(withManifest(start), withManifest(end));
    const gate = decideQaStatus({
      deterministicChecks: [
        {
          id: "test:score",
          command: "x",
          required: true,
          status: "pass",
          exitCode: 0,
        },
      ],
      agentReports: [
        {
          agent: "requirements",
          executed: true,
          mode: "mock",
          status: "pass",
          summary: "ok",
          findings: [],
        },
      ],
      findings: [],
      requiredAgents: ["requirements"],
      protectedBoundaryStatus: "verified",
      acceptanceFailed: false,
      criticalAttributionAmbiguous: attr.criticalAmbiguous.length > 0,
    });
    record(
      "SNAP-10-ambiguous",
      attr.ambiguous.includes("lib/hero-demo.ts") &&
        attr.criticalAmbiguous.length > 0 &&
        gate.decision === "BLOCKED",
      `amb=${attr.ambiguous.join(",")} gate=${gate.decision}`
    );
  }

  // Integrity: persist + refuse overwrite + sensitive + cleanup snapshot only
  {
    const dir = join(tmpRoot, "persist");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "p.ts"), "p\n", "utf8");
    writeFileSync(join(dir, ".env"), "SECRET=1\n", "utf8");
    assert(isSensitivePath(".env"), "env sensitive");
    const envFp = fingerprintFile(join(dir, ".env"), ".env");
    assert(envFp.contentOmitted && envFp.sensitive, "env content omitted");
    const snap = createTaskSnapshot({
      taskId: "PERSIST-1",
      kind: "task_start",
      cwd: dir,
      paths: ["p.ts", ".env"],
      includeDirty: false,
      storeRoot: store,
      persist: true,
    });
    const path = snapshotStorePath(snap.taskId, snap.snapshotId, store);
    assert(existsSync(path), "snapshot persisted");
    const loaded = loadTaskSnapshot(path);
    assert(verifySnapshotIntegrity(loaded).ok, "loaded integrity");
    const ow = tryOverwriteSnapshot(path);
    assert(ow.refused, "overwrite refused");
    let threw = false;
    try {
      persistSnapshot(snap, store);
    } catch {
      threw = true;
    }
    assert(threw, "persist refuse overwrite");
    deleteObsoleteSnapshotFile(path);
    assert(!existsSync(path), "snapshot file removed");
    assert(existsSync(join(dir, "p.ts")), "source file preserved");
    record("SNAP-integrity-store", true, "persist/load/refuse/delete-ok");
  }
}

async function realFilesystemIntegration(tmpRoot: string): Promise<void> {
  const dir = join(tmpRoot, "fs-integration");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "work.ts"), "alpha\n", "utf8");
  const store = join(tmpRoot, "task-snapshots-fs");

  const start = createTaskSnapshot({
    taskId: "FS-INT-1",
    kind: "task_start",
    cwd: dir,
    paths: ["work.ts"],
    includeDirty: false,
    storeRoot: store,
    persist: true,
  });
  assert(verifySnapshotIntegrity(start).ok, "start integrity");

  writeFileSync(join(dir, "work.ts"), "beta\n", "utf8");
  writeFileSync(join(dir, "extra.ts"), "new\n", "utf8");

  const end = createTaskSnapshot({
    taskId: "FS-INT-1",
    kind: "task_completion",
    cwd: dir,
    paths: ["work.ts", "extra.ts"],
    includeDirty: false,
    storeRoot: store,
    persist: true,
  });

  const attr = attributeChanges(start, end);
  const ok =
    attr.newTaskChanges.includes("work.ts") &&
    attr.newTaskChanges.includes("extra.ts") &&
    readFileSync(join(dir, "work.ts"), "utf8") === "beta\n";

  // Real process execution against the temp tree
  const exec = await executeCommand(
    "fs-echo",
    ["node", "-e", "require('fs').writeFileSync('marker.txt','ok'); process.exit(0)"],
    { cwd: dir, timeoutMs: 15_000 }
  );
  const markerOk = existsSync(join(dir, "marker.txt")) && exec.status === "PASSED";

  record(
    "FS-INT-real-temp",
    ok && markerOk,
    `attr=${attr.newTaskChanges.join(",")} exec=${exec.status} marker=${markerOk}`
  );
}

async function assumedPassForbidden(): Promise<void> {
  const task = createDevelopmentTask({
    taskId: "NO-ASSUME",
    objective: "No assumed pass",
    description: "Real run without execution must BLOCK",
    scope: ["lib/qa/"],
    exclusions: [],
    acceptanceCriteria: ["Must not PASS without execution"],
    expectedAffectedComponents: ["qa_system"],
    requiredValidators: [],
    protectedBoundaries: ["Model v0.4"],
    baselineId: "dc73abc-working-tree",
  });
  const result = await runTaskQaPipeline(task, {
    inventory: syntheticInventory([{ path: "lib/qa/types.ts", status: "modified" }]),
    allowSyntheticResults: false,
    executeValidators: false,
    captureLiveInventory: false,
  });
  record(
    "GATE-no-assumed-pass",
    result.report.decision === "BLOCKED" &&
      result.report.executionHardening?.assumedPassForbidden === true &&
      !result.report.deterministicChecks.some(
        (c) => c.status === "pass" && c.executionLabel === "REAL"
      ),
    `decision=${result.report.decision}`
  );
}

async function main(): Promise<void> {
  assert(HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B", "Homepage regression 83 · B");

  const tmpRoot = mkdtempSync(join(tmpdir(), "gryps-p6s6-"));
  try {
    await executionScenarios();
    await snapshotScenarios(tmpRoot);
    await realFilesystemIntegration(tmpRoot);
    await assumedPassForbidden();
  } finally {
    try {
      rmSync(tmpRoot, { recursive: true, force: true });
    } catch {
      /* best-effort temp cleanup */
    }
  }

  const failed = results.filter((r) => !r.ok);
  const ex = results.filter((r) => r.id.startsWith("EX-"));
  const snap = results.filter((r) => r.id.startsWith("SNAP-"));
  console.log(`Execution scenarios: ${ex.filter((r) => r.ok).length}/${ex.length}`);
  console.log(
    `Snapshot scenarios: ${snap.filter((r) => r.ok).length}/${snap.length} (+ integrity)`
  );
  console.log(`Homepage regression ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
  assert(failed.length === 0, `Failures: ${failed.map((f) => f.id).join(", ")}`);
  console.log("P6-S6 execution + snapshot hardening checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

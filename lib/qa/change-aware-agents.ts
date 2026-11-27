/**
 * Change-aware mock agent reviews (P6-S5).
 * Inspect task definition + change inventory + optional synthetic diffs/markers.
 * Still rule-based — not live LLM reasoning.
 */
import { classifyScope, isProtectedPath, type ChangeInventory } from "@/lib/qa/change-inventory";
import { isBlockingSeverity } from "@/lib/qa/decision";
import type { DevelopmentTaskDefinition } from "@/lib/qa/task-definition";
import type { SelectedCheck } from "@/lib/qa/test-selection";
import type {
  QaAgentId,
  QaAgentReport,
  QaDeterministicCheck,
  QaExecutionMode,
  QaFinding,
} from "@/lib/qa/types";
import { QA_FINDING_SCHEMA } from "@/lib/qa/types";
import { runMockAgent } from "@/lib/qa/mock-agents";

export type ChangeAwareContext = {
  task: DevelopmentTaskDefinition;
  inventory: ChangeInventory;
  selectedChecks: SelectedCheck[];
  deterministicResults: QaDeterministicCheck[];
  /** Optional synthetic file contents / diffs keyed by path */
  fileContents?: Record<string, string>;
  /** Optional sandbox for P6-S4 marker detectors */
  sandboxRoot?: string;
  unmappedPaths: string[];
  taskValid: boolean;
  taskMissingFields: string[];
};

function finding(
  agent: QaAgentId,
  partial: Omit<QaFinding, "schema" | "agent" | "blocking" | "findingId"> & {
    findingId: string;
    blocking?: boolean;
  }
): QaFinding {
  const blocking =
    partial.blocking ??
    (partial.kind === "verified_defect" && isBlockingSeverity(partial.severity));
  return { schema: QA_FINDING_SCHEMA, agent, blocking, ...partial };
}

function contentsBlob(ctx: ChangeAwareContext): string {
  const parts = Object.entries(ctx.fileContents ?? {}).map(([p, t]) => `FILE ${p}\n${t}`);
  return parts.join("\n");
}

export function runChangeAwareAgent(
  agent: Exclude<QaAgentId, "orchestrator">,
  ctx: ChangeAwareContext,
  mode: QaExecutionMode
): QaAgentReport {
  if (mode === "live_unimplemented") {
    return {
      agent,
      executed: false,
      mode,
      status: "not_run",
      summary: "Live agent provider not implemented",
      findings: [],
    };
  }

  const findings: QaFinding[] = [];
  const scope = classifyScope(ctx.inventory, ctx.task.scope, ctx.task.exclusions);
  const blob = contentsBlob(ctx);

  if (!ctx.taskValid) {
    if (agent === "requirements") {
      findings.push(
        finding("requirements", {
          findingId: "TASK-INCOMPLETE-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: "task-definition",
          description: `Development task missing mandatory fields: ${ctx.taskMissingFields.join(", ")}`,
          evidence: ctx.taskMissingFields,
          recommendedCorrection: "Complete the structured task definition before QA can PASS.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
  }

  if (agent === "requirements") {
    if (scope.outOfScope.length > 0) {
      findings.push(
        finding("requirements", {
          findingId: "SCOPE-OUT-01",
          severity: "HIGH",
          kind: "verified_defect",
          affected: scope.outOfScope.map((e) => e.path).join(", "),
          description: "Changed files fall outside the declared task scope.",
          evidence: scope.outOfScope.map((e) => `${e.status}:${e.path}`),
          recommendedCorrection: "Revert out-of-scope changes or widen approved scope.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    if (scope.exclusionHits.length > 0) {
      findings.push(
        finding("requirements", {
          findingId: "SCOPE-EXCL-01",
          severity: "HIGH",
          kind: "verified_defect",
          affected: scope.exclusionHits.map((e) => e.path).join(", "),
          description: "Changes touch explicitly excluded paths.",
          evidence: scope.exclusionHits.map((e) => e.path),
          recommendedCorrection: "Remove excluded-path edits.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    const unmet = ctx.task.acceptanceCriteria.filter(
      (ac) => /MISSING_ACCEPTANCE|NOT_MET/i.test(ac) || ac.startsWith("UNMET:")
    );
    if (unmet.length > 0) {
      findings.push(
        finding("requirements", {
          findingId: "AC-MISS-01",
          severity: "HIGH",
          kind: "verified_defect",
          affected: "acceptanceCriteria",
          description: "Acceptance criterion marked unmet / missing.",
          evidence: unmet,
          recommendedCorrection: "Satisfy or revise acceptance criteria with approval.",
          confidence: "high",
          humanApprovalRequired: false,
        })
      );
    }
  }

  if (agent === "test_engineer") {
    const skippedRequired = ctx.selectedChecks.filter((c) => c.required && c.status === "skipped");
    for (const s of skippedRequired) {
      findings.push(
        finding("test_engineer", {
          findingId: "TEST-SKIP-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: s.id,
          description: `Required validator skipped: ${s.id}`,
          evidence: [s.skipReason ?? "skipped", s.reason],
          recommendedCorrection: "Run the required validator; skipped required checks cannot PASS.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    const failed = ctx.deterministicResults.filter((c) => c.required && c.status === "fail");
    for (const f of failed) {
      findings.push(
        finding("test_engineer", {
          findingId: "TEST-FAIL-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: f.id,
          description: `Required deterministic check failed: ${f.id}`,
          evidence: [f.logExcerpt ?? `exit ${f.exitCode ?? "?"}`],
          recommendedCorrection: "Fix the failing behaviour; do not weaken the assertion.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    if (ctx.unmappedPaths.length > 0) {
      findings.push(
        finding("test_engineer", {
          findingId: "TEST-UNMAPPED-01",
          severity: "MEDIUM",
          kind: "potential_risk",
          affected: ctx.unmappedPaths.join(", "),
          description: "Unmapped paths changed — no impact-map validators auto-selected.",
          evidence: ctx.unmappedPaths,
          recommendedCorrection: "Add impact-map coverage or justify unmapped change.",
          confidence: "medium",
          humanApprovalRequired: false,
          blocking: false,
        })
      );
    }
  }

  if (agent === "domain_model") {
    const scoringHits = ctx.inventory.entries.filter((e) =>
      [
        "lib/deterministic-score.ts",
        "lib/scoring.ts",
        "lib/model-constants.ts",
        "lib/hero-demo.ts",
      ].includes(e.path)
    );
    if (scoringHits.length > 0) {
      findings.push(
        finding("domain_model", {
          findingId: "DOM-PROTECTED-SCORE-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: scoringHits.map((e) => e.path).join(", "),
          description: "Protected Model v0.4 scoring file modified without Gate F approval path.",
          evidence: scoringHits.map((e) => `${e.status}:${e.path}`),
          recommendedCorrection: "Revert scoring changes or obtain explicit human Gate F approval.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    if (/FORCE_UNKNOWN_TO_POSITIVE|UNSUPPORTED_INDEPENDENCE_CLAIM/.test(blob)) {
      findings.push(
        finding("domain_model", {
          findingId: "DOM-CLAIM-01",
          severity: "HIGH",
          kind: "verified_defect",
          affected: "synthetic-diff",
          description: "Unsupported independence / UNKNOWN coercion in change content.",
          evidence: ["marker in provided fileContents"],
          recommendedCorrection: "Keep UNKNOWN; do not claim independence without evidence.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
  }

  if (agent === "evidence_provenance") {
    if (/MISSING_PROVENANCE|provenance"\s*:\s*null|sourceUrl"\s*:\s*""/.test(blob)) {
      findings.push(
        finding("evidence_provenance", {
          findingId: "EV-CHANGE-PROV-01",
          severity: "HIGH",
          kind: "verified_defect",
          affected: "evidence-content",
          description: "Evidence provenance removed or empty in changed content.",
          evidence: ["MISSING_PROVENANCE / empty sourceUrl in fileContents"],
          recommendedCorrection: "Restore provenance fields or mark evidence incomplete.",
          confidence: "high",
          humanApprovalRequired: false,
        })
      );
    }
    const packHits = ctx.inventory.entries.filter((e) =>
      e.path.startsWith("docs/methodology/evidence-packs/nordic-lapland-dual-path-v0/")
    );
    if (packHits.length > 0) {
      findings.push(
        finding("evidence_provenance", {
          findingId: "EV-PACK-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: packHits.map((e) => e.path).join(", "),
          description: "P5-S2 evidence pack path modified.",
          evidence: packHits.map((e) => e.path),
          recommendedCorrection: "Do not mutate P5-S2 v0; use a new version after gates.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
  }

  if (agent === "security_privacy") {
    const protectedHits = ctx.inventory.entries.filter((e) => isProtectedPath(e.path));
    if (protectedHits.some((e) => e.path === "LICENSE")) {
      findings.push(
        finding("security_privacy", {
          findingId: "SEC-LICENSE-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: "LICENSE",
          description: "LICENSE file changed.",
          evidence: ["LICENSE in change inventory"],
          recommendedCorrection: "Revert LICENSE unless explicitly approved.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    if (/SECRET_EXPOSED|API_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]{12,}/.test(blob)) {
      findings.push(
        finding("security_privacy", {
          findingId: "SEC-CHANGE-SECRET-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: "fileContents",
          description: "Secret-like material in change payload.",
          evidence: ["credential pattern (value redacted)"],
          recommendedCorrection: "Remove secrets; use placeholders.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
  }

  if (agent === "regression_integration") {
    const scoreFail = ctx.deterministicResults.find(
      (c) => c.id === "test:score" && c.status === "fail"
    );
    if (scoreFail) {
      findings.push(
        finding("regression_integration", {
          findingId: "REG-SCORE-FAIL-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: "test:score",
          description: "Required Model v0.4 / homepage regression check failed.",
          evidence: [scoreFail.logExcerpt ?? "test:score failed"],
          recommendedCorrection: "Restore 83 · B behaviour; do not change expected result.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    if (/\/research\/workflo\b|BROKEN_WORKFLOW_LINK/.test(blob)) {
      findings.push(
        finding("regression_integration", {
          findingId: "REG-NAV-CHANGE-01",
          severity: "HIGH",
          kind: "verified_defect",
          affected: "navigation",
          description: "Broken research workflow navigation in change content.",
          evidence: ["BROKEN_WORKFLOW_LINK /workflo"],
          recommendedCorrection: "Fix link to /research/workflow.",
          confidence: "high",
          humanApprovalRequired: false,
        })
      );
    }
  }

  if (agent === "adversarial") {
    const defectCount = [
      scope.outOfScope.length > 0,
      scope.protectedHits.length > 0,
      ctx.selectedChecks.some((c) => c.required && c.status === "skipped"),
      ctx.deterministicResults.some((c) => c.required && c.status === "fail"),
      /MISSING_PROVENANCE|FORCE_UNKNOWN_TO_POSITIVE|SECRET_EXPOSED/.test(blob),
    ].filter(Boolean).length;
    if (defectCount >= 2) {
      findings.push(
        finding("adversarial", {
          findingId: "ADV-MULTI-01",
          severity: "HIGH",
          kind: "verified_defect",
          affected: "task-changes",
          description: `Adversarial review: ${defectCount} independent defect classes present simultaneously.`,
          evidence: [`defectClasses=${defectCount}`],
          recommendedCorrection:
            "Resolve each defect class separately; do not ship bundled failures.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    if (ctx.unmappedPaths.length > 0 && scope.outOfScope.length > 0) {
      findings.push(
        finding("adversarial", {
          findingId: "ADV-UNMAPPED-SCOPE-01",
          severity: "MEDIUM",
          kind: "potential_risk",
          affected: ctx.unmappedPaths.join(", "),
          description: "Unmapped and out-of-scope changes coincide — high blind-spot risk.",
          evidence: [...ctx.unmappedPaths, ...scope.outOfScope.map((e) => e.path)],
          recommendedCorrection: "Map paths and tighten scope before acceptance.",
          confidence: "medium",
          humanApprovalRequired: false,
          blocking: false,
        })
      );
    }
  }

  // Optional: also run sandbox marker detectors when sandbox provided
  if (ctx.sandboxRoot) {
    const sandboxReport = runMockAgent(agent, ctx.sandboxRoot, "mock");
    findings.push(...sandboxReport.findings);
  }

  const failed = findings.some((f) => f.blocking);
  return {
    agent,
    executed: true,
    mode: "mock",
    status: failed ? "fail" : "pass",
    summary: failed
      ? `Change-aware ${agent}: ${findings.length} finding(s), blocking present`
      : `Change-aware ${agent}: ${findings.length} finding(s)`,
    findings,
  };
}

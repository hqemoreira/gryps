/**
 * Rule-based mock agent reviews over an isolated sandbox.
 * Not live LLM reviews — executionMode remains "mock".
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isBlockingSeverity } from "@/lib/qa/decision";
import type {
  QaAgentId,
  QaAgentReport,
  QaExecutionMode,
  QaFinding,
  QaSeverity,
} from "@/lib/qa/types";
import { QA_FINDING_SCHEMA } from "@/lib/qa/types";

function walkFiles(root: string, acc: string[] = []): string[] {
  if (!existsSync(root)) return acc;
  for (const name of readdirSync(root)) {
    if (name === "node_modules" || name === ".git") continue;
    const abs = join(root, name);
    const st = statSync(abs);
    if (st.isDirectory()) walkFiles(abs, acc);
    else acc.push(abs);
  }
  return acc;
}

function readAll(sandboxRoot: string): { path: string; text: string }[] {
  return walkFiles(sandboxRoot).map((abs) => ({
    path: relative(sandboxRoot, abs).replace(/\\/g, "/"),
    text: readFileSync(abs, "utf8"),
  }));
}

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
  return {
    schema: QA_FINDING_SCHEMA,
    agent,
    blocking,
    ...partial,
  };
}

type Detector = (files: { path: string; text: string }[]) => QaFinding[];

const detectors: Record<Exclude<QaAgentId, "orchestrator">, Detector> = {
  requirements: (files) => {
    const out: QaFinding[] = [];
    for (const f of files) {
      if (/SCOPE_CREEP_UNDOCUMENTED|EXCLUSION_VIOLATED/.test(f.text)) {
        out.push(
          finding("requirements", {
            findingId: "REQ-SCOPE-01",
            severity: "HIGH",
            kind: "verified_defect",
            affected: f.path,
            description: "Undocumented scope change or exclusion violation marker present.",
            evidence: [f.path, f.text.slice(0, 240)],
            recommendedCorrection: "Revert excluded changes or update the approved task scope.",
            confidence: "high",
            humanApprovalRequired: true,
          })
        );
      }
    }
    return out;
  },

  test_engineer: (files) => {
    const out: QaFinding[] = [];
    for (const f of files) {
      if (
        /false.?green|ALWAYS_PASS\s*=\s*true|assert\(true\)\s*;?\s*\/\/\s*ignore failure/i.test(
          f.text
        ) ||
        /VALIDATOR_LIES:\s*success_despite_failure/.test(f.text)
      ) {
        out.push(
          finding("test_engineer", {
            findingId: "TEST-FALSEGREEN-01",
            severity: "CRITICAL",
            kind: "verified_defect",
            affected: f.path,
            description:
              "Validator or test can report success despite a failed underlying condition.",
            evidence: [f.path, f.text.slice(0, 280)],
            reproduction: "Inspect the sandbox validator stub for ALWAYS_PASS / lie markers.",
            recommendedCorrection:
              "Make the check fail closed on the underlying condition; remove false-green shortcuts.",
            confidence: "high",
            humanApprovalRequired: true,
          })
        );
      }
      if (/MISSING_TEST_COVERAGE_FOR_REGRESSION/.test(f.text)) {
        out.push(
          finding("test_engineer", {
            findingId: "TEST-COVER-01",
            severity: "MEDIUM",
            kind: "potential_risk",
            affected: f.path,
            description: "Material regression path lacks test coverage marker.",
            evidence: [f.path],
            recommendedCorrection: "Add a failing-first regression assertion.",
            confidence: "medium",
            humanApprovalRequired: false,
            blocking: false,
          })
        );
      }
    }
    return out;
  },

  domain_model: (files) => {
    const out: QaFinding[] = [];
    for (const f of files) {
      if (/SCORING_WEIGHT_CHANGED|latitudePoints\s*=\s*\[99/.test(f.text)) {
        out.push(
          finding("domain_model", {
            findingId: "DOM-SCORE-01",
            severity: "CRITICAL",
            kind: "verified_defect",
            affected: f.path,
            description: "Model v0.4 scoring weight/constant change detected in sandbox.",
            evidence: [f.path, f.text.slice(0, 240)],
            recommendedCorrection:
              "Do not change Model v0.4 weights without Gate F human approval.",
            confidence: "high",
            humanApprovalRequired: true,
          })
        );
      }
      if (
        /UNKNOWN[^\n]{0,40}(is independent|are independent|confirmed independent)/i.test(f.text) ||
        /FORCE_UNKNOWN_TO_POSITIVE/.test(f.text)
      ) {
        out.push(
          finding("domain_model", {
            findingId: "DOM-UNKNOWN-01",
            severity: "HIGH",
            kind: "verified_defect",
            affected: f.path,
            description:
              "UNKNOWN dependency incorrectly converted into a positive independence claim.",
            evidence: [f.path, f.text.slice(0, 280)],
            recommendedCorrection: "Restore UNKNOWN; never coerce unknowns into positive claims.",
            confidence: "high",
            humanApprovalRequired: true,
          })
        );
      }
      if (
        /UNSUPPORTED_INDEPENDENCE_CLAIM|two brands therefore independent/i.test(f.text) ||
        /provider diversity (proves|equals) infrastructure independence/i.test(f.text)
      ) {
        out.push(
          finding("domain_model", {
            findingId: "DOM-INDEP-01",
            severity: "HIGH",
            kind: "verified_defect",
            affected: f.path,
            description: "Unsupported satellite-provider independence claim.",
            evidence: [f.path, f.text.slice(0, 280)],
            recommendedCorrection:
              "Separate catalogue diversity from infrastructure independence; keep UNKNOWN where unproven.",
            confidence: "high",
            humanApprovalRequired: true,
          })
        );
      }
    }
    return out;
  },

  evidence_provenance: (files) => {
    const out: QaFinding[] = [];
    for (const f of files) {
      if (/MISSING_PROVENANCE|sourceUrl:\s*""|"provenance"\s*:\s*null/.test(f.text)) {
        out.push(
          finding("evidence_provenance", {
            findingId: "EV-PROV-01",
            severity: "HIGH",
            kind: "verified_defect",
            affected: f.path,
            description: "Evidence item lacks required provenance / source reference.",
            evidence: [f.path, f.text.slice(0, 240)],
            recommendedCorrection: "Attach source URL/date or mark evidence incomplete.",
            confidence: "high",
            humanApprovalRequired: false,
          })
        );
      }
      if (/CATALOGUE_AS_OPERATIONAL_PROOF/.test(f.text)) {
        out.push(
          finding("evidence_provenance", {
            findingId: "EV-CAT-01",
            severity: "HIGH",
            kind: "verified_defect",
            affected: f.path,
            description: "Catalogue information treated as verified operational evidence.",
            evidence: [f.path],
            recommendedCorrection: "Relabel as catalogue/modelled — not operational proof.",
            confidence: "high",
            humanApprovalRequired: true,
          })
        );
      }
    }
    return out;
  },

  security_privacy: (files) => {
    const out: QaFinding[] = [];
    for (const f of files) {
      if (
        /API_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]{12,}/.test(f.text) ||
        /BEGIN PRIVATE KEY|sk-live-|NEON_DATABASE_URL\s*=\s*postgres:\/\/[^:]+:[^@]+@/.test(
          f.text
        ) ||
        /SECRET_EXPOSED/.test(f.text)
      ) {
        out.push(
          finding("security_privacy", {
            findingId: "SEC-SECRET-01",
            severity: "CRITICAL",
            kind: "verified_defect",
            affected: f.path,
            description: "Secret or credential material appears in sandbox fixture content.",
            evidence: [
              f.path,
              "Pattern match for credential-like material (value redacted in report)",
            ],
            recommendedCorrection: "Remove secrets; use placeholders; rotate if real.",
            confidence: "high",
            humanApprovalRequired: true,
          })
        );
      }
    }
    return out;
  },

  regression_integration: (files) => {
    const out: QaFinding[] = [];
    for (const f of files) {
      if (
        /HERO_DEMO_SCORE\s*=\s*(?!83)\d+/.test(f.text) ||
        /expectedScore"\s*:\s*(?!83)\d+/.test(f.text) ||
        /REGRESSION_BROKEN_83/.test(f.text)
      ) {
        out.push(
          finding("regression_integration", {
            findingId: "REG-83-01",
            severity: "CRITICAL",
            kind: "verified_defect",
            affected: f.path,
            description: "Homepage Model v0.4 regression 83 · B appears broken in sandbox.",
            evidence: [f.path, f.text.slice(0, 240)],
            recommendedCorrection: "Restore HERO_DEMO_SCORE === 83 and grade B.",
            confidence: "high",
            humanApprovalRequired: true,
          })
        );
      }
      if (
        /href=["']\/research\/workflo["']|BROKEN_WORKFLOW_LINK/.test(f.text) ||
        /\/research\/workflo\b/.test(f.text)
      ) {
        out.push(
          finding("regression_integration", {
            findingId: "REG-NAV-01",
            severity: "HIGH",
            kind: "verified_defect",
            affected: f.path,
            description: "Broken research workflow navigation link.",
            evidence: [f.path, f.text.slice(0, 240)],
            recommendedCorrection: "Fix href to /research/workflow.",
            confidence: "high",
            humanApprovalRequired: false,
          })
        );
      }
    }
    return out;
  },

  adversarial: (files) => {
    const out: QaFinding[] = [];
    // Adversarial looks for combinations / misleading UI that others might miss
    const texts = files.map((f) => f.text).join("\n");
    if (/PASS_BANNER_WHILE_INVALID|UI_CLAIMS_VALIDATED_FIELD/.test(texts)) {
      const hit = files.find((f) =>
        /PASS_BANNER_WHILE_INVALID|UI_CLAIMS_VALIDATED_FIELD/.test(f.text)
      );
      out.push(
        finding("adversarial", {
          findingId: "ADV-UI-01",
          severity: "HIGH",
          kind: "verified_defect",
          affected: hit?.path ?? "sandbox",
          description: "UI claims validation/success while underlying state is invalid.",
          evidence: [hit?.path ?? "sandbox", (hit?.text ?? texts).slice(0, 240)],
          recommendedCorrection:
            "Align UI status with evidence maturity; do not show false success.",
          confidence: "high",
          humanApprovalRequired: false,
        })
      );
    }
    // Also re-challenge false-green and independence (must not only echo — uses distinct IDs)
    if (/VALIDATOR_LIES:\s*success_despite_failure/.test(texts)) {
      const hit = files.find((f) => /VALIDATOR_LIES/.test(f.text));
      out.push(
        finding("adversarial", {
          findingId: "ADV-FALSEGREEN-01",
          severity: "CRITICAL",
          kind: "verified_defect",
          affected: hit?.path ?? "sandbox",
          description:
            "Adversarial challenge: success path ignores failing condition — happy-path tests are insufficient.",
          evidence: [hit?.path ?? "sandbox"],
          recommendedCorrection:
            "Add negative assertions that fail when the lie marker is present.",
          confidence: "high",
          humanApprovalRequired: true,
        })
      );
    }
    return out;
  },
};

export function runMockAgent(
  agent: Exclude<QaAgentId, "orchestrator">,
  sandboxRoot: string | undefined,
  mode: QaExecutionMode
): QaAgentReport {
  if (mode === "live_unimplemented") {
    return {
      agent,
      executed: false,
      mode,
      status: "not_run",
      summary: "Live agent provider not implemented — review blocked.",
      findings: [],
    };
  }
  if (!sandboxRoot || !existsSync(sandboxRoot)) {
    return {
      agent,
      executed: false,
      mode: "mock",
      status: "blocked",
      summary: "No sandbox root available for mock review.",
      findings: [],
    };
  }
  const files = readAll(sandboxRoot);
  const findings = detectors[agent](files);
  const failed = findings.some((f) => f.blocking);
  return {
    agent,
    executed: true,
    mode: "mock",
    status: failed ? "fail" : "pass",
    summary: failed
      ? `Mock ${agent} found ${findings.length} finding(s) including blocking defects.`
      : `Mock ${agent} completed with ${findings.length} finding(s).`,
    findings,
  };
}

export function runAllMockPeerAgents(
  sandboxRoot: string | undefined,
  mode: QaExecutionMode,
  agents: Exclude<QaAgentId, "orchestrator">[]
): QaAgentReport[] {
  return agents.map((a) => runMockAgent(a, sandboxRoot, mode));
}

/** Exported for unit-style assertions in the seed suite */
export function severityRank(s: QaSeverity): number {
  return { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFORMATIONAL: 0 }[s];
}

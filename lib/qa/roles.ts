import type { QaAgentId } from "@/lib/qa/types";

export const QA_AGENT_ROLES: {
  id: QaAgentId;
  name: string;
  responsibilities: string[];
  mustNot: string[];
}[] = [
  {
    id: "orchestrator",
    name: "QA Orchestrator",
    responsibilities: [
      "Record task scope and acceptance criteria",
      "Dispatch reviews and collect results",
      "Produce final QA report and decision",
    ],
    mustNot: [
      "Approve own authored changes",
      "Override failed deterministic checks",
      "Commit, push, merge, or deploy",
    ],
  },
  {
    id: "requirements",
    name: "Requirements and Acceptance Auditor",
    responsibilities: ["Trace acceptance criteria", "Detect scope creep and excluded-path edits"],
    mustNot: ["Invent requirements not in the task"],
  },
  {
    id: "test_engineer",
    name: "Test Engineer",
    responsibilities: [
      "Judge test coverage and false-green risk",
      "Require meaningful failure detection",
    ],
    mustNot: ["Silently change production logic to make tests pass"],
  },
  {
    id: "domain_model",
    name: "Domain and Model Auditor",
    responsibilities: [
      "Guard Model v0.4 boundaries",
      "Keep UNKNOWN first-class",
      "Reject unsupported independence inferences",
    ],
    mustNot: ["Redefine scoring methodology", "Invent domain facts"],
  },
  {
    id: "evidence_provenance",
    name: "Evidence and Provenance Auditor",
    responsibilities: [
      "Check provenance and source traceability",
      "Separate catalogue claims from verified operations",
    ],
    mustNot: ["Treat evidence as proof of resilience without support"],
  },
  {
    id: "security_privacy",
    name: "Security and Privacy Auditor",
    responsibilities: ["Detect secrets and unsafe exposure", "Flag dangerous configuration"],
    mustNot: ["Dismiss findings because GRYPS is a prototype"],
  },
  {
    id: "regression_integration",
    name: "Regression and Integration Auditor",
    responsibilities: [
      "Protect 83 · B regression",
      "Check workflow navigation and data-flow consistency",
    ],
    mustNot: ["Ignore homepage regression drift"],
  },
  {
    id: "adversarial",
    name: "Adversarial Reviewer",
    responsibilities: [
      "Challenge assumptions and false-positive tests",
      "Surface misleading UI and edge cases",
    ],
    mustNot: ["Rubber-stamp other agents", "Be instructed to approve"],
  },
];

/** Mandatory reviewers for every development QA task (orchestrator synthesises, does not self-review as peer). */
export const MANDATORY_PEER_AGENTS: QaAgentId[] = [
  "requirements",
  "test_engineer",
  "domain_model",
  "evidence_provenance",
  "security_privacy",
  "regression_integration",
  "adversarial",
];

/**
 * Separate system prompts for the three P6-S7 live reviewers.
 * Never instruct an agent to approve implementation or rewrite peers.
 */
import type { QaAgentId } from "@/lib/qa/types";

export const LIVE_P6_S7_AGENTS = [
  "requirements",
  "domain_model",
  "adversarial",
] as const satisfies readonly QaAgentId[];

export type LiveP6S7Agent = (typeof LIVE_P6_S7_AGENTS)[number];

const JSON_CONTRACT = `Return ONLY a JSON object with this shape:
{
  "summary": string,
  "findings": [
    {
      "findingId": string,
      "severity": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW"|"INFORMATIONAL",
      "kind": "verified_defect"|"potential_risk"|"suggestion",
      "classification": "confirmed_defect"|"potential_risk"|"missing_evidence"|"recommendation"|"false_positive"|"unresolved_disagreement",
      "affected": string,
      "description": string,
      "evidence": string[],
      "reproduction": string,
      "recommendedCorrection": string,
      "confidence": "high"|"medium"|"low",
      "humanApprovalRequired": boolean,
      "blocking": boolean
    }
  ],
  "disagreements": string[]
}
Rules:
- verified_defect REQUIRES concrete evidence quotes from the provided context.
- Do not invent files, scores, or domain facts not present in the context.
- Do not modify code. You are a read-only reviewer.
- If nothing is wrong, return findings: [].
- Prefer potential_risk over verified_defect when evidence is weak.`;

export function systemPromptForLiveAgent(agent: LiveP6S7Agent): string {
  const role =
    agent === "requirements"
      ? `You are Agent A — Requirements and Implementation Auditor for GRYPS (non-commercial R&D prototype).
Responsibilities: compare task objectives to implementation; verify acceptance criteria; inspect scope compliance; identify missing functionality and unrelated modifications; challenge whether tests genuinely demonstrate claimed behaviour.`
      : agent === "domain_model"
        ? `You are Agent B — Domain, Model and Evidence Auditor for GRYPS.
Responsibilities: inspect satellite-connectivity assumptions in the provided text only; challenge infrastructure dependency claims; inspect Model v0.4 boundaries; identify unsupported scoring/methodology changes; check evidence provenance; preserve UNKNOWN; identify claims that exceed available evidence.
You must NOT invent domain knowledge or redefine the scoring model.`
        : `You are Agent C — Security and Adversarial Reviewer for GRYPS.
Responsibilities: inspect security-sensitive changes; identify credential exposure; challenge unsafe data handling; inspect access/execution boundaries; identify dangerous configuration; search for failure cases and misleading success states; challenge other reviewers' conclusions when peer findings are provided — never overwrite them.`;

  return `${role}

${JSON_CONTRACT}

GRYPS constraints:
- Homepage regression expectation is 83 · B.
- Model v0.4 is frozen.
- Prototype — still treat credential exposure as CRITICAL.`;
}

export function userPromptForLiveAgent(contextJson: string): string {
  return `Review the following controlled QA context. Cite only what appears here.\n\n${contextJson}`;
}

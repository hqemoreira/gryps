import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors";
import { isSingleProviderSetup } from "@/lib/signature-meta";

export type ComplianceFlag = {
  id: "nis2-art21" | "cer";
  label: string;
  pass: boolean;
  reason: string;
};

export function computeComplianceFlags(
  result: AdvisoryResult,
  input?: AssessmentInputs
): ComplianceFlag[] {
  const score = result.resilience_signature.score;
  const gaps = result.redundancy_gaps ?? [];
  const risks = result.risk_factors ?? [];
  const single = isSingleProviderSetup(input?.current_setup);

  const nis2Pass = score >= 50 && gaps.length <= 1 && !single;
  const cerPass = score >= 40 && !risks.some((r) => r.severity === "critical");

  return [
    {
      id: "nis2-art21",
      label: "NIS2 Art. 21 — Network and information system security measures",
      pass: nis2Pass,
      reason: nis2Pass
        ? "Score and redundancy posture are consistent with a documented multi-path connectivity control."
        : single
          ? "Single-provider setups typically fail NIS2-style network resilience evidence: no independent failover path is documented."
          : "Score or redundancy gaps indicate incomplete network security measures for connectivity continuity.",
    },
    {
      id: "cer",
      label: "CER — Critical entity resilience assessment",
      pass: cerPass,
      reason: cerPass
        ? "No critical connectivity risks flagged at this score band."
        : "Critical risk factors remain on the Signature — CER-style evidence would require mitigation before relying on this as an assessment checkpoint.",
    },
  ];
}

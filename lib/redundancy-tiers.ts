import type { AssessmentInputs } from "@/lib/resilience-colors";
import { isSingleProviderSetup } from "@/lib/signature-meta";

export type RedundancyTier = {
  id: string;
  tier: "essential" | "standard" | "defense";
  label: string;
  estimate: string;
  detail: string;
};

export function redundancyTiers(input?: AssessmentInputs): RedundancyTier[] {
  const single = isSingleProviderSetup(input?.current_setup);
  const arctic = (input?.lat ?? 0) >= 70;
  return [
    {
      id: "certus-backup",
      tier: "essential",
      label: "Iridium Certus as independent backup",
      estimate: "Lowest incremental hardware cost · polar-capable",
      detail: single
        ? "Adds a second orbital class (polar LEO narrowband) so a Starlink/GEO outage does not halt safety-critical command."
        : "Confirms an independent narrowband path if the current dual setup still shares a failure mode (power, mount, or sky view).",
    },
    {
      id: "dual-leo",
      tier: "standard",
      label: "Dual LEO broadband (e.g. Starlink + OneWeb)",
      estimate: "Mid cost · two broadband paths",
      detail: arctic
        ? "At 70°N+, pair broadband LEO with polar-orbit narrowband; two broadband LEOs still share weather and constellation congestion modes."
        : "Independent LEO broadband operators reduce single-constellation risk for telemetry and video.",
    },
    {
      id: "auto-failover",
      tier: "defense",
      label: "Automatic failover + local mesh",
      estimate: "Ops / integration cost more than terminals",
      detail:
        "Failover automation and on-site mesh close the gap that dual terminals do not: human switchover delay during an incident.",
    },
  ];
}

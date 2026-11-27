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
      label: "Iridium Certus as catalogue narrowband backup",
      estimate: "Lowest incremental hardware cost · polar-capable",
      detail: single
        ? "Adds a second catalogue orbital class (polar LEO narrowband). That raises the diversity indicator; site power, mounts, and ground independence still need separate evidence."
        : "Adds polar LEO narrowband diversity in the catalogue. If the dual setup still shares power, mount, or sky view, end-to-end independence remains unverified.",
    },
    {
      id: "dual-leo",
      tier: "standard",
      label: "Dual LEO broadband (e.g. Starlink + OneWeb)",
      estimate: "Mid cost · two broadband paths",
      detail: arctic
        ? "At 70°N+, pair broadband LEO with polar-orbit narrowband; two broadband LEOs still share weather and constellation congestion modes. Different brands alone do not prove independent ground or backhaul."
        : "Two LEO broadband catalogue operators reduce single-constellation exposure in the model. Ground, backhaul, and site dependencies remain unverified unless evidenced separately.",
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

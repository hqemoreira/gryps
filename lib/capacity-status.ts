// Capacity posture for the /map view — derived from existing signature_sites
// Resilience Signature fields only. There is no live link-monitoring table in
// this product; do not invent "up/down" telemetry that does not exist.

export type CapacityStatus = "ok" | "degraded" | "down" | "unknown";

/** Map Resilience Signature grade/score → Spatineo-style capacity status. */
export function capacityStatusFromSignature(
  grade?: string | null,
  score?: number | null
): CapacityStatus {
  const g = (grade ?? "").toUpperCase().trim();
  if (g === "A" || g === "B") return "ok";
  if (g === "C" || g === "D") return "degraded";
  if (g === "F") return "down";

  if (score != null && Number.isFinite(score)) {
    if (score >= 70) return "ok";
    if (score >= 30) return "degraded";
    return "down";
  }

  return "unknown";
}

export const CAPACITY_STATUS_COLOR: Record<CapacityStatus, string> = {
  ok: "#2ED47A",
  degraded: "#D97706",
  down: "#EF4444",
  unknown: "#64748B",
};

/** EN labels — Spatineo-style; “Down” means model posture F, not live outage. */
export const CAPACITY_STATUS_LABEL: Record<CapacityStatus, string> = {
  ok: "OK",
  degraded: "Degraded",
  down: "Down",
  unknown: "Unknown",
};

/** FI labels — posture wording (not live link telemetry). */
export const CAPACITY_STATUS_LABEL_FI: Record<CapacityStatus, string> = {
  ok: "Hyvä",
  degraded: "Heikentynyt",
  down: "Kriittinen",
  unknown: "Tuntematon",
};

export function capacityStatusLabel(status: CapacityStatus, lang: "en" | "fi" = "en"): string {
  return lang === "fi" ? CAPACITY_STATUS_LABEL_FI[status] : CAPACITY_STATUS_LABEL[status];
}

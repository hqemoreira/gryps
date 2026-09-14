/** Mission priorities that re-rank Advisor recommendations (not the Signature score). */

export const ADVISOR_PRIORITIES = [
  "uptime",
  "latency",
  "bandwidth",
  "redundancy",
  "coverage",
  "mobility",
  "deployment_simplicity",
] as const;

export type AdvisorPriorityId = (typeof ADVISOR_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<AdvisorPriorityId, { en: string; fi: string }> = {
  uptime: { en: "Uptime", fi: "Käytettävyys" },
  latency: { en: "Latency", fi: "Latenssi" },
  bandwidth: { en: "Bandwidth", fi: "Kaistanleveys" },
  redundancy: { en: "Redundancy", fi: "Redundanssi" },
  coverage: { en: "Coverage", fi: "Kattavuus" },
  mobility: { en: "Mobility", fi: "Liikkuvuus" },
  deployment_simplicity: { en: "Deployment simplicity", fi: "Käyttöönoton yksinkertaisuus" },
};

export function normalizePriorities(raw: unknown): AdvisorPriorityId[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<string>(ADVISOR_PRIORITIES);
  const out: AdvisorPriorityId[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const id = item.trim().toLowerCase().replace(/\s+/g, "_");
    if (allowed.has(id) && !out.includes(id as AdvisorPriorityId)) {
      out.push(id as AdvisorPriorityId);
    }
    if (out.length >= 3) break;
  }
  return out;
}

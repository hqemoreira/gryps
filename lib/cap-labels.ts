/** Human-readable hard-cap notices for Signature hero / Mimir. */

export const CAP_NOTICES_EN: Record<string, string> = {
  "safety-critical-autonomous-no-redundancy":
    "Grade capped at 50 — safety-critical, autonomous, fewer than 2 providers.",
  "safety-critical-single-provider":
    "Grade capped at 60 — safety-critical with a single provider.",
  "geo-unusable-above-72n": "Grade capped at 45 — GEO-only above 72°N.",
};

export const CAP_NOTICES_FI: Record<string, string> = {
  "safety-critical-autonomous-no-redundancy":
    "Arvosana rajattu 50:een — turvallisuuskriittinen, autonominen, alle 2 toimittajaa.",
  "safety-critical-single-provider":
    "Arvosana rajattu 60:een — turvallisuuskriittinen yhdellä toimittajalla.",
  "geo-unusable-above-72n": "Arvosana rajattu 45:een — vain GEO yli 72°N.",
};

export function capNotice(id: string, lang: "en" | "fi" = "en"): string {
  const map = lang === "fi" ? CAP_NOTICES_FI : CAP_NOTICES_EN;
  return map[id] ?? (lang === "fi" ? `Kova katto käytössä: ${id}` : `Hard cap applied: ${id}`);
}

/** One line for the Signature hero when one or more caps fire. */
export function capNoticesLine(ids: string[], lang: "en" | "fi" = "en"): string | null {
  if (!ids.length) return null;
  return ids.map((id) => capNotice(id, lang)).join(" ");
}

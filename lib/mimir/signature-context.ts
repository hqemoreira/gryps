import type { AdvisoryResult } from "@/lib/resilience-colors";
import type { AbbreviatedAssessment } from "@/lib/abbreviate-result";
import { MODEL_VERSION } from "@/lib/model-constants";

type CtxSource = AdvisoryResult | AbbreviatedAssessment;

function isAbbreviated(result: CtxSource): result is AbbreviatedAssessment {
  return "depth" in result && result.depth === "abbreviated";
}

/** Compact Signature payload for Mimir grounding (modelVersion / inputHash / issuedAt / caps / levers). */
export function buildMimirSignatureContext(
  result: CtxSource,
  extras?: { site?: string; latitude?: number }
): string {
  if (isAbbreviated(result)) {
    return JSON.stringify({
      modelVersion: result.modelVersion ?? MODEL_VERSION,
      inputHash: result.inputHash ?? null,
      issuedAt: result.issuedAt ?? null,
      score: result.resilience_signature.score,
      grade: result.resilience_signature.grade,
      summary: result.resilience_signature.summary,
      layers: result.layers?.map((l) => ({
        id: l.id,
        label: l.label,
        points: l.points,
        max: l.max,
        band: l.band,
        fixed: l.fixed,
      })),
      range: result.confidence_range,
      caps_applied: result.caps_applied ?? [],
      levers: result.levers?.slice(0, 3).map((l) => ({ label: l.label, delta: l.delta })),
      site: extras?.site,
      latitude: extras?.latitude,
    });
  }

  const caps =
    result.score_composition?.caps_applied?.length
      ? result.score_composition.caps_applied
      : (result.caps_applied ?? []);

  return JSON.stringify({
    modelVersion: result.modelVersion ?? MODEL_VERSION,
    inputHash: result.inputHash ?? null,
    issuedAt: result.issuedAt ?? null,
    score: result.resilience_signature.score,
    grade: result.resilience_signature.grade,
    summary: result.resilience_signature.summary,
    layers: result.score_composition?.layers?.map((l) => ({
      id: l.id,
      label: l.label,
      points: l.points,
      max: l.max,
      band: l.band,
      fixed: l.fixed,
    })),
    range: result.score_composition?.confidence_range,
    caps_applied: caps,
    levers: result.score_composition?.levers
      ?.slice(0, 3)
      .map((l) => ({ label: l.label, delta: l.delta })),
    site: extras?.site,
    latitude: extras?.latitude,
  });
}

export type MimirChip = { id: string; en: string; fi: string };

/** Proactive question chips when a Signature is in context. */
export function mimirProactiveChips(opts: {
  mitigationPoints?: number;
  mitigationMax?: number;
  capsApplied?: string[];
  hasLevers?: boolean;
  latitude?: number;
  conditionsBand?: string;
}): MimirChip[] {
  const chips: MimirChip[] = [];
  const mitPts = opts.mitigationPoints;
  const mitMax = opts.mitigationMax ?? 80;

  if (typeof mitPts === "number") {
    chips.push({
      id: "why-mitigation",
      en: `Why is my mitigation ${mitPts}/${mitMax}?`,
      fi: `Miksi lievennykseni on ${mitPts}/${mitMax}?`,
    });
  }

  if (opts.capsApplied && opts.capsApplied.length > 0) {
    chips.push({
      id: "why-capped",
      en: "Why was my grade capped?",
      fi: "Miksi arvosanani rajattiin?",
    });
  }

  if (opts.hasLevers) {
    chips.push({
      id: "raise-fastest",
      en: "What would raise this score fastest?",
      fi: "Mikä nostaisi pistettä nopeimmin?",
    });
  }

  if (typeof opts.latitude === "number" && opts.latitude >= 67 && opts.conditionsBand) {
    chips.push({
      id: "conditions-lat",
      en: `What does 'conditions: ${opts.conditionsBand}' mean at ${Math.round(opts.latitude)}°N?`,
      fi: `Mitä 'olosuhteet: ${opts.conditionsBand}' tarkoittaa ${Math.round(opts.latitude)}°N:ssä?`,
    });
  }

  return chips.slice(0, 3);
}

/** Derive chip opts from a full or abbreviated assessment. */
export function chipsFromResult(
  result: CtxSource,
  latitude?: number
): MimirChip[] {
  if (isAbbreviated(result)) {
    const mit = result.layers?.find((l) => l.id === "mitigation");
    const cond = result.layers?.find((l) => l.id === "conditions");
    return mimirProactiveChips({
      mitigationPoints: mit?.points,
      mitigationMax: mit?.max,
      capsApplied: result.caps_applied,
      hasLevers: (result.levers?.length ?? 0) > 0,
      latitude,
      conditionsBand: cond?.band,
    });
  }

  const mit = result.score_composition?.layers?.find((l) => l.id === "mitigation");
  const cond = result.score_composition?.layers?.find((l) => l.id === "conditions");
  const caps =
    result.score_composition?.caps_applied?.length
      ? result.score_composition.caps_applied
      : (result.caps_applied ?? []);

  return mimirProactiveChips({
    mitigationPoints: mit?.points,
    mitigationMax: mit?.max,
    capsApplied: caps,
    hasLevers: (result.score_composition?.levers?.length ?? 0) > 0,
    latitude,
    conditionsBand: cond?.band,
  });
}

/**
 * Evidence chip vocabulary — single source of truth.
 * Same label = same meaning on every surface (Signature, Research, Map, Providers, Methodology).
 */

export const EVIDENCE_KINDS = {
  MODELLED: {
    label: "MODELLED",
    en: "Deterministic GRYPS model output — reproducible for identical inputs. Not live RF.",
    fi: "Deterministinen GRYPS-mallituloste — toistettavissa samoilla syötteillä. Ei live-RF.",
  },
  MEASURED: {
    label: "MEASURED",
    en: "Third-party measured or surveyed reference data (e.g. Bittimittari, EU-DEM).",
    fi: "Kolmannen osapuolen mitattu tai kartoitettu viitedata (esim. Bittimittari, EU-DEM).",
  },
  RESEARCH: {
    label: "RESEARCH",
    en: "Editorial research artefact — Knowledge notes or Research Library assessment.",
    fi: "Toimituksellinen tutkimusartefakti — Knowledge-muistiinpanot tai Research Library -arvio.",
  },
  ILLUSTRATIVE: {
    label: "ILLUSTRATIVE",
    en: "Indicative commentary or demo output — not a measurement or coverage guarantee.",
    fi: "Suuntaa-antava kommentti tai demotulos — ei mittaus eikä kattavuustakuu.",
  },
  DERIVED: {
    label: "DERIVED",
    en: "Computed from model inputs, catalog rules, or Signature grade — not a direct measurement.",
    fi: "Laskettu mallisyötteistä, hakemistosäännöistä tai Signature-arvosanasta — ei suora mittaus.",
  },
} as const;

export type EvidenceKind = keyof typeof EVIDENCE_KINDS;

/** Legacy aliases kept so older call sites resolve to the canonical vocabulary. */
export type EvidenceKindInput =
  | EvidenceKind
  | "MODEL"
  | "DATA"
  | "INTERPRETATION";

export function resolveEvidenceKind(kind: EvidenceKindInput): EvidenceKind {
  if (kind === "MODEL") return "MODELLED";
  if (kind === "DATA") return "MEASURED";
  if (kind === "INTERPRETATION") return "ILLUSTRATIVE";
  return kind;
}

export const EVIDENCE_KIND_ORDER: EvidenceKind[] = [
  "MODELLED",
  "MEASURED",
  "RESEARCH",
  "ILLUSTRATIVE",
  "DERIVED",
];

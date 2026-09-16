/**
 * Evidence chip vocabulary — single source of truth.
 * Same label = same meaning on every surface (Signature, Research, Map, Providers, Methodology).
 *
 * Do not invent synonyms (e.g. MODEL / DATA / INTERPRETATION). Use these five only.
 */

export const EVIDENCE_KINDS = {
  MODELLED: {
    label: "MODELLED",
    en: "Deterministic GRYPS model output — score, grade, risks, or ranks reproducible for identical inputs. Not live RF.",
    fi: "Deterministinen GRYPS-mallituloste — piste, arvosana, riskit tai sijoitukset toistettavissa samoilla syötteillä. Ei live-RF.",
  },
  MEASURED: {
    label: "MEASURED",
    en: "Third-party measured or surveyed reference data (e.g. Bittimittari, EU-DEM). Never blended into the 0–100 Signature.",
    fi: "Kolmannen osapuolen mitattu tai kartoitettu viitedata (esim. Bittimittari, EU-DEM). Ei sekoiteta 0–100 Signatureen.",
  },
  RESEARCH: {
    label: "RESEARCH",
    en: "Editorial research artefact — Knowledge note or Research Library assessment.",
    fi: "Toimituksellinen tutkimusartefakti — Knowledge-muistiinpano tai Research Library -arvio.",
  },
  ILLUSTRATIVE: {
    label: "ILLUSTRATIVE",
    en: "Indicative commentary, demo, or prose polish — not a measurement or coverage guarantee.",
    fi: "Suuntaa-antava kommentti, demo tai proosan viimeistely — ei mittaus eikä kattavuustakuu.",
  },
  DERIVED: {
    label: "DERIVED",
    en: "Computed from model outputs or catalog rules (e.g. capacity band from grade) — not a direct measurement.",
    fi: "Laskettu mallitulosteista tai hakemistosäännöistä (esim. kapasiteettivyöhyke arvosanasta) — ei suora mittaus.",
  },
} as const;

export type EvidenceKind = keyof typeof EVIDENCE_KINDS;

export const EVIDENCE_KIND_ORDER: EvidenceKind[] = [
  "MODELLED",
  "MEASURED",
  "RESEARCH",
  "ILLUSTRATIVE",
  "DERIVED",
];

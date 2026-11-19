/**
 * Sitewide R&D / non-commercial disclosure — header chip + footer line.
 * Keep wording aligned across EN/FI; do not reintroduce a full-width warning banner.
 */

export const PROTOTYPE_STATUS_CHIP = {
  en: "R&D PROTOTYPE",
  fi: "T&K-PROTOTYYPPI",
} as const;

/** Formal footer disclosure (authoritative full line). */
export const PROTOTYPE_FOOTER_DISCLOSURE = {
  en: "Non-commercial R&D research prototype · Not for sale",
  fi: "Ei-kaupallinen T&K-tutkimusprototyyppi · Ei myynnissä",
} as const;

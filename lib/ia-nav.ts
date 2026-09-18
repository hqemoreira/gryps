/**
 * GRYPS information architecture — Explore · Assess · Research.
 * Single source of truth for header mega-menus, footer, and DocShell.
 * See CODEBOOK.md “UX architecture”.
 */

export type IaModeId = "explore" | "assess" | "research";

export type IaNavItem = {
  href: string;
  en: string;
  fi: string;
  descEn: string;
  descFi: string;
};

export type IaMode = {
  id: IaModeId;
  en: string;
  fi: string;
  items: IaNavItem[];
};

/** Primary modes in the header. */
export const IA_MODES: IaMode[] = [
  {
    id: "explore",
    en: "Explore",
    fi: "Tutki",
    items: [
      {
        href: "/map",
        en: "Map",
        fi: "Kartta",
        descEn: "Geographic connectivity intelligence",
        descFi: "Maantieteellinen yhteysäly",
      },
      {
        href: "/providers",
        en: "Providers",
        fi: "Toimittajat",
        descEn: "Satellite & connectivity provider landscape",
        descFi: "Satelliitti- ja yhteystoimittajien maisema",
      },
      {
        href: "/research",
        en: "Research Library",
        fi: "Research Library",
        descEn: "Connectivity assessments & research",
        descFi: "Yhteysarviot ja tutkimus",
      },
      {
        href: "/scenarios",
        en: "Scenarios",
        fi: "Skenaariot",
        descEn: "Operational environments",
        descFi: "Toimintaympäristöt",
      },
    ],
  },
  {
    id: "assess",
    en: "Assess",
    fi: "Arvioi",
    items: [
      {
        href: "/#advisor",
        en: "Resilience Advisor",
        fi: "Resilience Advisor",
        descEn: "Generate a new Resilience Signature",
        descFi: "Luo uusi Resilience Signature",
      },
      {
        href: "/workspace",
        en: "Assessments",
        fi: "Arviot",
        descEn: "Saved and example assessments",
        descFi: "Tallennetut ja esimerkkiarviot",
      },
    ],
  },
  {
    id: "research",
    en: "Research",
    fi: "Tutkimus",
    items: [
      {
        href: "/methodology",
        en: "Methodology",
        fi: "Menetelmä",
        descEn: "How GRYPS evaluates resilience",
        descFi: "Miten GRYPS arvioi resilienssiä",
      },
      {
        href: "/knowledge",
        en: "Evidence",
        fi: "Näyttö",
        descEn: "Research and supporting evidence",
        descFi: "Tutkimus ja tukeva näyttö",
      },
      {
        href: "/data-sources",
        en: "Data sources",
        fi: "Datalähteet",
        descEn: "Provenance and datasets",
        descFi: "Alkuperä ja aineistot",
      },
      {
        href: "/assumptions",
        en: "Assumptions",
        fi: "Oletukset",
        descEn: "Model assumptions",
        descFi: "Mallin oletukset",
      },
      {
        href: "/limitations",
        en: "Limitations",
        fi: "Rajoitteet",
        descEn: "What GRYPS is not",
        descFi: "Mitä GRYPS ei ole",
      },
      {
        href: "/changelog",
        en: "Changelog",
        fi: "Muutosloki",
        descEn: "Methodology evolution",
        descFi: "Menetelmän kehitys",
      },
    ],
  },
];

/** Footer / secondary — not peer to Explore · Assess · Research. */
export const IA_REFERENCE: IaNavItem[] = [
  {
    href: "/about",
    en: "About",
    fi: "Tietoa",
    descEn: "Who maintains GRYPS",
    descFi: "Kuka ylläpitää GRYPS:ää",
  },
  {
    href: "/research-prototype",
    en: "Research & Prototype",
    fi: "Tutkimus ja prototyyppi",
    descEn: "Phase posture and scope",
    descFi: "Vaiheen asema ja laajuus",
  },
  {
    href: "/case-study",
    en: "Case study",
    fi: "Case study",
    descEn: "Portfolio demonstration",
    descFi: "Portfoliodemonstraatio",
  },
];

export const IA_LEGAL: { href: string; en: string; fi: string }[] = [
  { href: "/terms", en: "Terms", fi: "Ehdot" },
  { href: "/privacy", en: "Privacy", fi: "Tietosuoja" },
];

/** Short chrome CTA; hero/forms keep the full phrase. */
export const CTA_SHORT = { en: "Generate Signature", fi: "Luo Signature" } as const;
export const CTA_FULL = {
  en: "Generate Resilience Signature",
  fi: "Luo Resilience Signature",
} as const;

export function labelFor(item: { en: string; fi: string }, lang: "en" | "fi") {
  return lang === "fi" ? item.fi : item.en;
}

export function descFor(item: IaNavItem, lang: "en" | "fi") {
  return lang === "fi" ? item.descFi : item.descEn;
}

/** Homepage content that should leave the landing page (link-only). */
export const HOMEPAGE_CONTENT_MOVES = [
  "Full map / latitude ops console → /map",
  "Long “why sites fail” education → Research (methodology / evidence)",
  "Signature drift documentation → /methodology (versioning) or Research",
  "Dense methodology prose → /methodology",
] as const;

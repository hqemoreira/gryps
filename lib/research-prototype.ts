/**
 * Public Research & Prototype posture — product-facing only.
 * Do not put career objectives or personal administrative notes here.
 * Agent/dev deferred commercial list lives in .cursorrules and CODEBOOK.md.
 */

export const RESEARCH_AREAS: { en: string; fi: string; href?: string }[] = [
  {
    en: "Geographic connectivity intelligence",
    fi: "Maantieteellinen yhteysäly",
    href: "/map",
  },
  {
    en: "Provider comparison",
    fi: "Toimittajavertailu",
    href: "/providers",
  },
  {
    en: "Scenario analysis",
    fi: "Skenaarioanalyysi",
    href: "/scenarios",
  },
  {
    en: "Evidence and methodology",
    fi: "Näyttö ja menetelmä",
    href: "/methodology",
  },
  {
    en: "Connectivity resilience",
    fi: "Yhteyden resilienssi",
    href: "/#advisor",
  },
  {
    en: "Decision-support modelling",
    fi: "Päätöstukimallinnus",
    href: "/workspace",
  },
]

/** User-facing capability milestones (not internal sprint / career labels). */
export const DEVELOPMENT_CAPABILITIES: {
  id: number
  en: string
  fi: string
  href?: string
}[] = [
  { id: 1, en: "Prototype foundation & Resilience Signature", fi: "Prototyyppiperusta ja Resilience Signature", href: "/" },
  { id: 2, en: "Research Library assessments", fi: "Research Library -arviot", href: "/research" },
  { id: 3, en: "Geographic connectivity map", fi: "Maantieteellinen yhteyskartta", href: "/map" },
  { id: 4, en: "Advisor decision-support", fi: "Advisor-päätöstuki", href: "/#advisor" },
  { id: 5, en: "Evidence chain & methodology", fi: "Näyttöketju ja menetelmä", href: "/methodology" },
  { id: 6, en: "Mission scenario analysis", fi: "Tehtäväskenaarioanalyysi", href: "/scenarios" },
  { id: 7, en: "Local research workspace", fi: "Paikallinen tutkimus-workspace", href: "/workspace" },
  { id: 8, en: "Research quality documentation", fi: "Tutkimuksen laatudokumentaatio", href: "/data-sources" },
  { id: 9, en: "Demonstration case study", fi: "Demonstraatio-case study", href: "/case-study" },
]

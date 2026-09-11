/**
 * Research / prototype roadmap — completed sprints and explicitly deferred commercial work.
 * GRYPS is not becoming a business in this phase.
 */

import { METHODOLOGY_LABEL, SCORING_ENGINE } from "@/lib/model-constants"

export { METHODOLOGY_LABEL, SCORING_ENGINE }

export const STRATEGIC_OBJECTIVE_EN =
  "Can Henrique independently identify a complex business problem, research it, model it, design a digital solution, use AI appropriately, build a working prototype, and explain the reasoning behind it?"

export const STRATEGIC_OBJECTIVE_FI =
  "Pystyykö Henrique itsenäisesti tunnistamaan monimutkaisen liiketoimintaongelman, tutkimaan sitä, mallintamaan sen, suunnittelemaan digitaalisen ratkaisun, käyttämään AI:ta tarkoituksenmukaisesti, rakentamaan toimivan prototyypin ja selittämään sen perustelut?"

/** Preferred product vocabulary (use these). */
export const PREFERRED_LANGUAGE = [
  "Research",
  "Prototype",
  "Experimental",
  "Assessment",
  "Methodology",
  "Evidence",
  "Scenario",
  "Intelligence",
] as const

/** Commercial / sales language to avoid in user-facing copy. */
export const AVOID_LANGUAGE = [
  "Buy",
  "Get a quote",
  "For customers",
  "Our solution",
  "Book a consultation",
  "Enterprise plans",
] as const

export type RoadmapSprint = {
  id: number
  focus: string
  focusFi: string
  nature: string
  natureFi: string
  href?: string
}

/** Completed research / prototype sprints (career-asset phase). */
export const COMPLETED_SPRINTS: RoadmapSprint[] = [
  { id: 1, focus: "Foundation", focusFi: "Perusta", nature: "Prototype", natureFi: "Prototyyppi", href: "/" },
  { id: 2, focus: "Research Library", focusFi: "Research Library", nature: "Research", natureFi: "Tutkimus", href: "/research" },
  {
    id: 3,
    focus: "Map / Geographic Intelligence",
    focusFi: "Kartta / maantieteellinen äly",
    nature: "Research prototype",
    natureFi: "Tutkimusprototyyppi",
    href: "/map",
  },
  {
    id: 4,
    focus: "Advisor Intelligence",
    focusFi: "Advisor-äly",
    nature: "Analytical prototype",
    natureFi: "Analyyttinen prototyyppi",
    href: "/#advisor",
  },
  {
    id: 5,
    focus: "Evidence & Methodology",
    focusFi: "Näyttö ja menetelmä",
    nature: "Research",
    natureFi: "Tutkimus",
    href: "/methodology",
  },
  {
    id: 6,
    focus: "Scenario / Mission Intelligence",
    focusFi: "Skenaario- / tehtävääly",
    nature: "Research",
    natureFi: "Tutkimus",
    href: "/scenarios",
  },
  {
    id: 7,
    focus: "Research Workspace",
    focusFi: "Research Workspace",
    nature: "Prototype",
    natureFi: "Prototyyppi",
    href: "/workspace",
  },
  {
    id: 8,
    focus: "Research Quality & Documentation",
    focusFi: "Tutkimuksen laatu ja dokumentaatio",
    nature: "Research",
    natureFi: "Tutkimus",
    href: "/data-sources",
  },
  {
    id: 9,
    focus: "Portfolio / Demonstration",
    focusFi: "Portfolio / demonstraatio",
    nature: "Career asset",
    natureFi: "Ura-assetti",
    href: "/case-study",
  },
]

export type DeferredFeature = {
  feature: string
  featureFi: string
  decision: "defer"
}

/** Explicitly not built in this phase — commercial / monetization surface. */
export const DEFERRED_COMMERCIAL: DeferredFeature[] = [
  { feature: "Payments", featureFi: "Maksut", decision: "defer" },
  { feature: "Subscriptions", featureFi: "Tilaukset", decision: "defer" },
  { feature: "Customer billing", featureFi: "Asiakaslaskutus", decision: "defer" },
  { feature: "Sales CRM", featureFi: "Myynti-CRM", decision: "defer" },
  { feature: "Commercial lead capture", featureFi: "Kaupallinen liidien keruu", decision: "defer" },
  { feature: "Customer contracts", featureFi: "Asiakassopimukset", decision: "defer" },
  { feature: "Paid reports", featureFi: "Maksulliset raportit", decision: "defer" },
  { feature: "Customer onboarding", featureFi: "Asiakasonboarding", decision: "defer" },
  { feature: "Team collaboration", featureFi: "Tiimiyhteistyö", decision: "defer" },
  { feature: "Commercial API", featureFi: "Kaupallinen API", decision: "defer" },
  { feature: "Marketplace", featureFi: "Markkinapaikka", decision: "defer" },
  { feature: "Advertising", featureFi: "Mainonta", decision: "defer" },
]

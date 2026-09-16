/**
 * GRYPS Research Library — curated public assessments (client-safe catalog).
 *
 * Sprint 2 audit of 33 seed sites + 4 homepage examples:
 *
 * 🟢 Keep / upgrade (in this catalog)
 *   Examples: forestry-mixed, mining-autonomous, maritime-offshore, iceland-autonomous-fleet
 *   Seeds: site-04 Inari forestry, site-07 Lofoten, site-09 Svalbard, site-12 Hammerfest,
 *          site-22 Kittilä, site-25 Jokkmokk, site-31 Straumsvík, site-32 Akureyri
 *
 * 🟡 Potential (kept in DB/map, noindex, not in public library)
 * 🔴 Thin / synthetic (noindex, excluded from sitemap & research nav)
 *
 * Server-only resolution (DB / scoring) lives in lib/research-resolve.ts —
 * do not import scoring or Neon from this module (breaks client bundles).
 */

import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors";

export type ResearchVertical = "forestry" | "mining" | "maritime" | "arctic" | "infrastructure";
export type ResearchRegion = "nordics" | "arctic" | "iceland";

export type ResearchEntry = {
  /** Public URL slug under /research/[slug] */
  slug: string;
  title: string;
  titleFi: string;
  /** One-line subtitle for cards / SEO */
  subtitle: string;
  subtitleFi: string;
  vertical: ResearchVertical;
  region: ResearchRegion;
  locationLabel: string;
  locationLabelFi: string;
  /** Narrative: what is being assessed */
  context: string;
  contextFi: string;
  source: "example" | "seed";
  sourceId: string;
  /** Seed slug when this research page supersedes a /signatures/[slug] URL */
  legacySignatureSlug?: string;
};

/** Public research set — aim 8–12 excellent assessments. */
export const RESEARCH_LIBRARY: ResearchEntry[] = [
  {
    slug: "finnish-arctic-forestry-lapland",
    title: "Finnish Arctic Forestry — Lapland",
    titleFi: "Suomen arktinen metsätalous — Lappi",
    subtitle: "Remote forestry connectivity resilience assessment",
    subtitleFi: "Etämetsän yhteysresilienssin tutkimusarvio",
    vertical: "forestry",
    region: "arctic",
    locationLabel: "Lapland, Finland · ~68.2°N",
    locationLabelFi: "Lappi, Suomi · ~68.2°N",
    context:
      "Autonomous harvester fleet operations in Finnish Lapland with a single LEO broadband path and no documented backup. Assesses single-provider and canopy/terrain exposure under safety-critical autonomy.",
    contextFi:
      "Autonominen hakkuukonekalusto Suomen Lapissa yhdellä LEO-laajakaistayhteydellä ilman dokumentoitua varayhteyttä. Arvioi yhden toimittajan ja latvus-/maastoriskin turvallisuuskriittisessä autonomiassa.",
    source: "example",
    sourceId: "forestry-mixed",
    legacySignatureSlug: "site-01-lapland-harvester-fleet",
  },
  {
    slug: "finnish-arctic-forestry-inari",
    title: "Finnish Arctic Forestry — Inari",
    titleFi: "Suomen arktinen metsätalous — Inari",
    subtitle: "Dual-path forestry connectivity resilience assessment",
    subtitleFi: "Kaksiyhteyksinen metsän yhteysresilienssin tutkimusarvio",
    vertical: "forestry",
    region: "arctic",
    locationLabel: "Inari, Finland · ~68.9°N",
    locationLabelFi: "Inari, Suomi · ~68.9°N",
    context:
      "Mixed-autonomy forestry block in Inari with Starlink + Iridium dual redundancy. Contrasts with single-provider Lapland fleet scenarios and shows how independent orbital classes affect the modeled Signature.",
    contextFi:
      "Seka-autonomian metsälohko Inarissa Starlink- ja Iridium-kaksoisredundanssilla. Vertautuu yhden toimittajan Lappi-skenaarioihin ja näyttää, miten riippumattomat rataluokat vaikuttavat mallinnettuun Signatureen.",
    source: "seed",
    sourceId: "site-04-inari-forestry-block",
    legacySignatureSlug: "site-04-inari-forestry-block",
  },
  {
    slug: "arctic-mining-northern-sweden",
    title: "Arctic Mining — Northern Sweden",
    titleFi: "Arktinen kaivostoiminta — Pohjois-Ruotsi",
    subtitle: "Autonomous haul fleet connectivity resilience assessment",
    subtitleFi: "Autonomisen kuljetuskaluston yhteysresilienssin tutkimusarvio",
    vertical: "mining",
    region: "arctic",
    locationLabel: "Northern Sweden · ~67.9°N",
    locationLabelFi: "Pohjois-Ruotsi · ~67.9°N",
    context:
      "Safety-critical autonomous haul fleet with dual LEO paths (broadband + polar narrowband). Explores redundancy posture and failover automation gaps in high-latitude mining.",
    contextFi:
      "Turvallisuuskriittinen autonominen kuljetuskalusto kahdella LEO-polulla (laajakaista + polaarinen kapeakaista). Tutkii redundanssiasemaa ja failover-automaation aukkoja korkeilla leveysasteilla.",
    source: "example",
    sourceId: "mining-autonomous",
  },
  {
    slug: "finnish-arctic-mining-kittila",
    title: "Arctic Mining — Kittilä, Finland",
    titleFi: "Arktinen kaivostoiminta — Kittilä, Suomi",
    subtitle: "Autonomous mine vehicle connectivity resilience assessment",
    subtitleFi: "Autonomisten kaivosajoneuvojen yhteysresilienssin tutkimusarvio",
    vertical: "mining",
    region: "arctic",
    locationLabel: "Kittilä, Finland · ~67.7°N",
    locationLabelFi: "Kittilä, Suomi · ~67.7°N",
    context:
      "Autonomous mine vehicles with Starlink + Iridium dual redundancy in Finnish Lapland. Documents a comparatively strong modeled posture and remaining operational considerations for failover.",
    contextFi:
      "Autonomiset kaivosajoneuvot Starlink- ja Iridium-kaksoisredundanssilla Suomen Lapissa. Dokumentoi suhteellisen vahvan mallinnetun aseman ja jäljellä olevat failover-toimintanäkökohdat.",
    source: "seed",
    sourceId: "site-22-kittila-gold-mine",
    legacySignatureSlug: "site-22-kittila-gold-mine",
  },
  {
    slug: "norwegian-arctic-maritime-offshore",
    title: "Norwegian Arctic Maritime — Offshore Platform",
    titleFi: "Norjan arktinen merenkulku — Offshore-alusta",
    subtitle: "Safety-critical maritime connectivity resilience assessment",
    subtitleFi: "Turvallisuuskriittisen meriyhteyden resilienssin tutkimusarvio",
    vertical: "maritime",
    region: "arctic",
    locationLabel: "Arctic Norway · ~71.0°N",
    locationLabelFi: "Arktinen Norja · ~71.0°N",
    context:
      "Safety-critical remote-operated offshore platform on a single GEO path at 71°N. Highlights latitude-driven GEO elevation risk and the cost of missing an independent LEO backup.",
    contextFi:
      "Turvallisuuskriittinen etäohjattu offshore-alusta yhdellä GEO-yhteydellä 71°N:ssä. Korostaa leveysasteen GEO-elevaatioriskiä ja riippumattoman LEO-varayhteyden puutetta.",
    source: "example",
    sourceId: "maritime-offshore",
    legacySignatureSlug: "site-03-troms-fjord-platform",
  },
  {
    slug: "norwegian-maritime-lofoten",
    title: "Norwegian Maritime — Lofoten Fleet",
    titleFi: "Norjan merenkulku — Lofootien kalusto",
    subtitle: "Fishing fleet coordination connectivity resilience assessment",
    subtitleFi: "Kalastuslaivaston koordinaation yhteysresilienssin tutkimusarvio",
    vertical: "maritime",
    region: "nordics",
    locationLabel: "Lofoten, Norway · ~68.2°N",
    locationLabelFi: "Lofootit, Norja · ~68.2°N",
    context:
      "Remote-operated fishing fleet coordination with VSAT + Iridium failover. Assesses documented dual-path maritime setups in the Norwegian Nordics.",
    contextFi:
      "Etäohjatun kalastuslaivaston koordinointi VSAT- ja Iridium-failoverilla. Arvioi dokumentoituja kaksiyhteyksisiä meriasetelmia Norjan Pohjoismaissa.",
    source: "seed",
    sourceId: "site-07-lofoten-fishing-fleet",
    legacySignatureSlug: "site-07-lofoten-fishing-fleet",
  },
  {
    slug: "norwegian-maritime-energy-hammerfest",
    title: "Norwegian Maritime Energy — Hammerfest LNG",
    titleFi: "Norjan merienergia — Hammerfest LNG",
    subtitle: "Safety-critical terminal monitoring connectivity assessment",
    subtitleFi: "Turvallisuuskriittisen terminaalivalvonnan yhteysarvio",
    vertical: "maritime",
    region: "arctic",
    locationLabel: "Hammerfest, Norway · ~70.7°N",
    locationLabelFi: "Hammerfest, Norja · ~70.7°N",
    context:
      "Safety-critical LNG terminal monitoring with dual VSAT + Iridium redundancy at high latitude. Explores energy-adjacent maritime resilience under remote operation.",
    contextFi:
      "Turvallisuuskriittinen LNG-terminaalivalvonta kaksois-VSAT- ja Iridium-redundanssilla korkealla leveysasteella. Tutkii energiaan liittyvää meriresilienssiä etäohjauksessa.",
    source: "seed",
    sourceId: "site-12-hammerfest-lng-terminal",
    legacySignatureSlug: "site-12-hammerfest-lng-terminal",
  },
  {
    slug: "extreme-arctic-svalbard",
    title: "Extreme Arctic Logistics — Svalbard",
    titleFi: "Äärimmäinen arktinen logistiikka — Huippuvuoret",
    subtitle: "High-latitude industrial outpost connectivity assessment",
    subtitleFi: "Korkean leveysasteen teollisuusaseman yhteysarvio",
    vertical: "arctic",
    region: "arctic",
    locationLabel: "Svalbard · ~78.2°N",
    locationLabelFi: "Huippuvuoret · ~78.2°N",
    context:
      "Autonomous safety-critical industrial outpost at ~78°N with Iridium-only connectivity. Stress-tests the model at extreme latitude where GEO options are effectively unavailable.",
    contextFi:
      "Autonominen turvallisuuskriittinen teollisuusasema ~78°N:ssä vain Iridium-yhteydellä. Kuormittaa mallia äärimmäisellä leveysasteella, jossa GEO-vaihtoehdot eivät käytännössä ole saatavilla.",
    source: "seed",
    sourceId: "site-09-svalbard-outpost",
    legacySignatureSlug: "site-09-svalbard-outpost",
  },
  {
    slug: "northern-infrastructure-jokkmokk",
    title: "Northern Infrastructure — Jokkmokk Hydro",
    titleFi: "Pohjoinen infrastruktuuri — Jokkmokkin vesivoima",
    subtitle: "Remote energy monitoring connectivity resilience assessment",
    subtitleFi: "Etäenergian valvonnan yhteysresilienssin tutkimusarvio",
    vertical: "infrastructure",
    region: "nordics",
    locationLabel: "Jokkmokk, Sweden · ~66.6°N",
    locationLabelFi: "Jokkmokk, Ruotsi · ~66.6°N",
    context:
      "Remote-operated hydro power monitoring with fiber primary and satellite disaster recovery. Documents how terrestrial-primary sites still need a modeled satellite resilience posture for outage continuity.",
    contextFi:
      "Etäohjattu vesivoimavalvonta kuitupääyhteydellä ja satelliittivaralla. Dokumentoi, miten maaverkko-ensisijaiset kohteet tarvitsevat silti mallinnetun satelliittiresilienssiaseman katkosten varalle.",
    source: "seed",
    sourceId: "site-25-jokkmokk-power-station",
    legacySignatureSlug: "site-25-jokkmokk-power-station",
  },
  {
    slug: "icelandic-autonomous-coastal",
    title: "Icelandic Autonomous Operations — Coastal Fleet",
    titleFi: "Islannin autonomiset toiminnot — Rannikkokalusto",
    subtitle: "Autonomous coastal inspection connectivity assessment",
    subtitleFi: "Autonomisen rannikkotarkastuksen yhteysarvio",
    vertical: "arctic",
    region: "iceland",
    locationLabel: "Coastal Iceland · ~64.2°N",
    locationLabelFi: "Islannin rannikko · ~64.2°N",
    context:
      "Autonomous coastal inspection fleet with OneWeb LEO + Iridium Certus backup. Focuses on failover policy gaps when dual hardware already exists.",
    contextFi:
      "Autonominen rannikkotarkastuskalusto OneWeb LEO- ja Iridium Certus -varalla. Keskittyy failover-politiikan aukkoihin, kun kaksoislaitteisto on jo olemassa.",
    source: "example",
    sourceId: "iceland-autonomous-fleet",
  },
  {
    slug: "icelandic-remote-industry-straumsvik",
    title: "Icelandic Remote Industry — Straumsvík",
    titleFi: "Islannin etäteollisuus — Straumsvík",
    subtitle: "Industrial grid connectivity resilience assessment",
    subtitleFi: "Teollisuusverkon yhteysresilienssin tutkimusarvio",
    vertical: "mining",
    region: "iceland",
    locationLabel: "Straumsvík, Iceland · ~64.1°N",
    locationLabelFi: "Straumsvík, Islanti · ~64.1°N",
    context:
      "Safety-critical autonomous industrial grid monitoring with single Starlink path and no redundancy. Illustrates Icelandic remote-industry single-provider risk in the model.",
    contextFi:
      "Turvallisuuskriittinen autonominen teollisuusverkon valvonta yhdellä Starlink-yhteydellä ilman redundanssia. Havainnollistaa islantilaisen etäteollisuuden yhden toimittajan riskiä mallissa.",
    source: "seed",
    sourceId: "site-31-straumsvik-aluminum-smelter",
    legacySignatureSlug: "site-31-straumsvik-aluminum-smelter",
  },
  {
    slug: "icelandic-maritime-akureyri",
    title: "Icelandic Maritime — Akureyri Fleet",
    titleFi: "Islannin merenkulku — Akureyrin kalusto",
    subtitle: "Fishing fleet coordination connectivity resilience assessment",
    subtitleFi: "Kalastuslaivaston koordinaation yhteysresilienssin tutkimusarvio",
    vertical: "maritime",
    region: "iceland",
    locationLabel: "Akureyri, Iceland · ~65.7°N",
    locationLabelFi: "Akureyri, Islanti · ~65.7°N",
    context:
      "Remote-operated fishing fleet coordination with VSAT primary and Iridium backup. Extends the maritime research set into Icelandic operating conditions.",
    contextFi:
      "Etäohjatun kalastuslaivaston koordinointi VSAT-pääyhteydellä ja Iridium-varalla. Laajentaa merellisen tutkimusjoukon islantilaisiin olosuhteisiin.",
    source: "seed",
    sourceId: "site-32-akureyri-fishing-fleet",
    legacySignatureSlug: "site-32-akureyri-fishing-fleet",
  },
];

/** Canonical public assessment count — use everywhere instead of hard-coded 10/12. */
export const RESEARCH_LIBRARY_COUNT = RESEARCH_LIBRARY.length;

const BY_SLUG = new Map(RESEARCH_LIBRARY.map((e) => [e.slug, e]));
const BY_LEGACY = new Map(
  RESEARCH_LIBRARY.filter((e) => e.legacySignatureSlug).map((e) => [e.legacySignatureSlug!, e])
);

export function getResearchEntry(slug: string): ResearchEntry | undefined {
  return BY_SLUG.get(slug);
}

export function getAllResearchEntries(): ResearchEntry[] {
  return RESEARCH_LIBRARY;
}

/** Seed/example signature slugs that have a public research counterpart. */
export function getResearchByLegacySignatureSlug(slug: string): ResearchEntry | undefined {
  return BY_LEGACY.get(slug);
}

export function isCuratedLegacySignatureSlug(slug: string): boolean {
  return (
    BY_LEGACY.has(slug) || RESEARCH_LIBRARY.some((e) => e.source === "seed" && e.sourceId === slug)
  );
}

/** Thin Site XX pages — keep for map/dev, do not index. */
export function isThinSignatureSlug(slug: string): boolean {
  if (!slug.startsWith("site-")) return false;
  return !isCuratedLegacySignatureSlug(slug);
}

export function researchHref(slug: string): string {
  return `/research/${slug}`;
}

/** Homepage example id → public research assessment slug. */
export function researchSlugForExampleId(exampleId: string): string | undefined {
  return RESEARCH_LIBRARY.find((e) => e.source === "example" && e.sourceId === exampleId)?.slug;
}

export function publicSignatureHref(siteSlug: string): string {
  const research = researchEntryForSignatureSlug(siteSlug);
  if (research) return researchHref(research.slug);
  return `/signatures/${siteSlug}`;
}

/** Resolve research catalog entry from a signature_sites slug. */
export function researchEntryForSignatureSlug(siteSlug: string): ResearchEntry | undefined {
  return (
    getResearchByLegacySignatureSlug(siteSlug) ??
    RESEARCH_LIBRARY.find((e) => e.source === "seed" && e.sourceId === siteSlug)
  );
}

export function mapRegionForSite(opts: {
  slug: string;
  country: string | null;
  lat: number;
  lng: number;
}): ResearchRegion {
  const research = researchEntryForSignatureSlug(opts.slug);
  if (research) return research.region;
  if (opts.country === "IS" || (opts.lat >= 63 && opts.lat <= 67 && opts.lng < -10))
    return "iceland";
  if (opts.lat >= 66.5) return "arctic";
  return "nordics";
}

export function mapVerticalForSite(sector: string, slug: string): ResearchVertical | string {
  const research = researchEntryForSignatureSlug(slug);
  if (research) return research.vertical;
  if (sector === "forestry" || sector === "mining" || sector === "maritime" || sector === "arctic")
    return sector;
  return sector || "other";
}

export type ResolvedResearchAssessment = {
  entry: ResearchEntry;
  input: AssessmentInputs;
  result: AdvisoryResult;
  modelVersion: string;
  fromDatabase: boolean;
};

export const RESEARCH_VERTICALS: { id: ResearchVertical | "all"; en: string; fi: string }[] = [
  { id: "all", en: "All", fi: "Kaikki" },
  { id: "forestry", en: "Forestry", fi: "Metsätalous" },
  { id: "mining", en: "Mining", fi: "Kaivostoiminta" },
  { id: "maritime", en: "Maritime", fi: "Merenkulku" },
  { id: "arctic", en: "Arctic", fi: "Arktinen" },
  { id: "infrastructure", en: "Infrastructure", fi: "Infrastruktuuri" },
];

export const RESEARCH_REGIONS: { id: ResearchRegion | "all"; en: string; fi: string }[] = [
  { id: "all", en: "All", fi: "Kaikki" },
  { id: "nordics", en: "Nordics", fi: "Pohjoismaat" },
  { id: "arctic", en: "Arctic", fi: "Arktinen" },
  { id: "iceland", en: "Iceland", fi: "Islanti" },
];

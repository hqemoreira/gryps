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

import type { EvidenceKind } from "@/lib/evidence-kinds";
import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors";

export type ResearchVertical = "forestry" | "mining" | "maritime" | "arctic" | "infrastructure";
export type ResearchRegion = "nordics" | "arctic" | "iceland";

/** Honest evidence notes shown on the assessment page (claim hygiene). */
export type ResearchEvidenceNote = {
  kind: EvidenceKind;
  en: string;
  fi: string;
};

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
  /** Optional evidence hygiene notes (MODELLED / MEASURED / RESEARCH / …) */
  evidenceNotes?: ResearchEvidenceNote[];
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
      "Failure-mode pedagogy: autonomous harvester fleet in Finnish Lapland with a single LEO broadband path and no documented backup. Shows how harsh Site Conditions plus weak Mitigation produce a low Signature — contrast with well-configured dual-path examples.",
    contextFi:
      "Vikamoodipedagogiikka: autonominen hakkuukonekalusto Suomen Lapissa yhdellä LEO-laajakaistayhteydellä ilman dokumentoitua varayhteyttä. Näyttää, miten ankarat olosuhteet ja heikko lievennys tuottavat matalan Signaturen — vertaa hyvin konfiguroituihin kaksoispolkuesimerkkeihin.",
    source: "example",
    sourceId: "forestry-mixed",
    legacySignatureSlug: "site-01-lapland-harvester-fleet",
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Signature score, grade, and ranks are deterministic Model v0.4 outputs for the stated inputs — not live RF.",
        fi: "Signature-piste, arvosana ja sijoitukset ovat deterministisen mallin v0.4 tulosteita annetuille syötteille — ei live-RF.",
      },
      {
        kind: "MEASURED",
        en: "Traficom Bittimittari (period 2026-10): Sodankylä municipality median ~47 Mbit/s download, ~47 ms latency (n=6). Adjacent fixed-network context for ~68.2°N 27.4°E — not blended into the 0–100 score.",
        fi: "Traficom Bittimittari (kausi 2026-10): Sodankylän kunta-mediaani ~47 Mbit/s lataus, ~47 ms viive (n=6). Viereinen kiinteän verkon konteksti ~68.2°N 27.4°E — ei sekoitu 0–100-pisteeseen.",
      },
      {
        kind: "ILLUSTRATIVE",
        en: "Single-Starlink failure mode is pedagogical: coordinates are real-region, the configuration is a research scenario.",
        fi: "Yhden Starlink-yhteyden vikamoodi on pedagoginen: koordinaatit ovat alueellisesti tosia, kokoonpano on tutkimusskenaario.",
      },
      {
        kind: "RESEARCH",
        en: "Aligned to GRYPS forestry knowledge notes and high-latitude constraints — not a vendor case study.",
        fi: "Linjassa GRYPS:n metsätalouden tietomuistiinpanoihin ja korkeiden leveysasteiden rajoitteisiin — ei toimittajan case study.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Dual-path Signature from Model v0.4 (Starlink + Iridium) — reproducible for identical inputs.",
        fi: "Kaksoispolun Signature mallista v0.4 (Starlink + Iridium) — toistettavissa samoilla syötteillä.",
      },
      {
        kind: "MEASURED",
        en: "Traficom Bittimittari (period 2026-10): Inari municipality median ~170.8 Mbit/s download, ~49 ms latency (n=21). Fixed-network context only — not blended into the 0–100 score.",
        fi: "Traficom Bittimittari (kausi 2026-10): Inarin kunta-mediaani ~170.8 Mbit/s lataus, ~49 ms viive (n=21). Vain kiinteän verkon konteksti — ei sekoitu 0–100-pisteeseen.",
      },
      {
        kind: "RESEARCH",
        en: "Forestry + high-latitude Research Library entry; seed site with real Inari-area coordinates.",
        fi: "Metsätalouden ja korkean leveysasteen Research Library -merkintä; siemenkohde Inarin alueen todellisilla koordinaateilla.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Safety-critical + autonomous posture scored by Model v0.4 hard caps and dual-LEO mitigation — not a measured pit survey.",
        fi: "Turvallisuuskriittinen + autonominen asema pisteytetty mallin v0.4 kovilla katoilla ja kaksois-LEO-lievennyksellä — ei mitattu louhosmittaus.",
      },
      {
        kind: "ILLUSTRATIVE",
        en: "Operating scenario for research comparison with Finnish Kittilä dual-path mining — no commercial relationship with operators.",
        fi: "Toimintaskenaario tutkimusvertailuun Suomen Kittilän kaksoispolkukaivoksen kanssa — ei kaupallista suhdetta operaattoreihin.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Hero-adjacent dual-path mining Signature (Model v0.4) — catalog confidence, not SLA availability.",
        fi: "Heroon liittyvä kaksoispolun kaivos-Signature (malli v0.4) — hakemistoluottamus, ei SLA-saatavuus.",
      },
      {
        kind: "MEASURED",
        en: "Traficom Bittimittari (period 2026-10): Kittilä municipality median ~31.4 Mbit/s download, ~49 ms latency (n=7). Fixed-network context only — not blended into the 0–100 score.",
        fi: "Traficom Bittimittari (kausi 2026-10): Kittilän kunta-mediaani ~31.4 Mbit/s lataus, ~49 ms viive (n=7). Vain kiinteän verkon konteksti — ei sekoitu 0–100-pisteeseen.",
      },
      {
        kind: "DERIVED",
        en: "Risks and ranked options follow from the same deterministic composition as the Advisor for these inputs.",
        fi: "Riskit ja sijoitetut vaihtoehdot seuraavat samasta deterministisestä koostumuksesta kuin Advisor näillä syötteillä.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Single-GEO posture at 71°N scored by Model v0.4 latitude and GEO elevation caps — not live offshore RF.",
        fi: "Yhden GEO-yhteyden asema 71°N pisteytetty mallin v0.4 leveysaste- ja GEO-elevaatiokatoilla — ei live-offshore-RF.",
      },
      {
        kind: "ILLUSTRATIVE",
        en: "Pedagogical failure mode for missing independent LEO backup; coordinates are Arctic-Norway region, not a named operator survey.",
        fi: "Pedagoginen vikamoodi puuttuvasta riippumattomasta LEO-varasta; koordinaatit ovat arktisen Norjan alueelta, ei nimetyn operaattorin mittaus.",
      },
      {
        kind: "RESEARCH",
        en: "Aligned to high-latitude GEO elevation notes in GRYPS knowledge — no Traficom or Norwegian Nkom blend into the score.",
        fi: "Linjassa GRYPS:n korkean leveysasteen GEO-elevaatiomuistiinpanoihin — Traficom tai Norjan Nkom eivät sekoitu pisteeseen.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "VSAT + Iridium dual-path Signature from Model v0.4 for the stated fleet inputs — catalog confidence, not measured sea trials.",
        fi: "VSAT + Iridium kaksoispolun Signature mallista v0.4 annetuille laivastosyötteille — hakemistoluottamus, ei mitatut merikokeet.",
      },
      {
        kind: "RESEARCH",
        en: "Norwegian Nordics maritime seed with real-region coordinates; no Finnish Traficom Bittimittari applies.",
        fi: "Norjan Pohjoismaiden merellinen siemen alueellisesti tosilla koordinaateilla; Suomen Traficom Bittimittari ei koske.",
      },
      {
        kind: "DERIVED",
        en: "Ranked options and risks follow the same deterministic Advisor composition for these inputs.",
        fi: "Sijoitetut vaihtoehdot ja riskit seuraavat samaa determinististä Advisor-koostumusta näillä syötteillä.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Safety-critical dual VSAT + Iridium at ~70.7°N — Model v0.4 site-conditions band (>70) and mitigation layers, not terminal telemetry.",
        fi: "Turvallisuuskriittinen kaksois-VSAT + Iridium ~70.7°N — mallin v0.4 olosuhdekaista (>70) ja lievennyskerrokset, ei terminaalitelemetriaa.",
      },
      {
        kind: "ILLUSTRATIVE",
        en: "Energy-adjacent maritime research scenario; no commercial relationship with LNG operators.",
        fi: "Energiaan liittyvä merellinen tutkimusskenaario; ei kaupallista suhdetta LNG-operaattoreihin.",
      },
      {
        kind: "RESEARCH",
        en: "High-latitude redundancy pedagogy; national broadband aggregates (e.g. Traficom) are Finland-only and unused here.",
        fi: "Korkean leveysasteen redundanssipedagogiikka; kansalliset laajakaista-aggregaatit (esim. Traficom) ovat vain Suomea eivätkä käytössä tässä.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Iridium-only autonomous outpost at ~78°N — Model v0.4 extreme-latitude site conditions and single-provider caps.",
        fi: "Vain Iridium autonominen asema ~78°N — mallin v0.4 äärimmäisen leveysasteen olosuhteet ja yhden toimittajan katot.",
      },
      {
        kind: "ILLUSTRATIVE",
        en: "Stress-test scenario where GEO is effectively unavailable; not a Svalbard site survey or SLA claim.",
        fi: "Kuormitusskenaario, jossa GEO ei käytännössä ole saatavilla — ei Huippuvuorten paikkamittaus eikä SLA-väite.",
      },
      {
        kind: "RESEARCH",
        en: "Polar-envelope research entry; evidence is catalog + model commentary, not measured RF campaigns.",
        fi: "Polaarikehyksen tutkimusmerkintä; näyttö on katalogi + mallikommentaari, ei mitatut RF-kampanjat.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Fiber-primary + satellite DR posture scored as satellite resilience for outage continuity — Model v0.4, not a grid SCADA audit.",
        fi: "Kuitupääyhteys + satelliitti-DR pisteytetty satelliittiresilienssinä katkosten varalle — malli v0.4, ei verkko-SCADA-auditointi.",
      },
      {
        kind: "RESEARCH",
        en: "Swedish Nordics infrastructure seed; Traficom Bittimittari is Finland-only and not applied.",
        fi: "Ruotsin Pohjoismaiden infrastruktuurisiemen; Traficom Bittimittari on vain Suomea eikä käytössä.",
      },
      {
        kind: "DERIVED",
        en: "Risks and ranks derive from the deterministic composition for the documented satellite backup path.",
        fi: "Riskit ja sijoitukset seuraavat deterministisestä koostumuksesta dokumentoidulle satelliittivarapolulle.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "OneWeb + Iridium dual-LEO Signature from Model v0.4 — hardware exists in the scenario; failover policy gaps are research commentary.",
        fi: "OneWeb + Iridium kaksois-LEO Signature mallista v0.4 — laitteisto on skenaariossa; failover-politiikan aukot ovat tutkimuskommentaaria.",
      },
      {
        kind: "ILLUSTRATIVE",
        en: "Iceland coastal autonomous fleet pedagogy; coordinates are regional, not an operator case study.",
        fi: "Islannin rannikon autonomisen kaluston pedagogiikka; koordinaatit ovat alueellisia, ei operaattorin case study.",
      },
      {
        kind: "RESEARCH",
        en: "No Traficom or Icelandic broadband aggregate is blended into the 0–100 score.",
        fi: "Traficom tai islantilainen laajakaista-aggregaatti ei sekoitu 0–100-pisteeseen.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "Single-Starlink safety-critical industrial Signature — Model v0.4 single-provider and autonomy caps, not plant RF.",
        fi: "Yhden Starlinkin turvallisuuskriittinen teollisuus-Signature — mallin v0.4 yhden toimittajan ja autonomian katot, ei laitoksen RF.",
      },
      {
        kind: "ILLUSTRATIVE",
        en: "Icelandic remote-industry single-provider failure mode for research comparison — no commercial operator link.",
        fi: "Islantilaisen etäteollisuuden yhden toimittajan vikamoodi tutkimusvertailuun — ei kaupallista operaattorisuhdetta.",
      },
      {
        kind: "RESEARCH",
        en: "Seed site with real-region coordinates; national measured broadband is out of scope for Iceland entries.",
        fi: "Siemenkohde alueellisesti tosilla koordinaateilla; kansallinen mitattu laajakaista on Islanti-merkinnöissä rajattu pois.",
      },
    ],
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
    evidenceNotes: [
      {
        kind: "MODELLED",
        en: "VSAT primary + Iridium backup at ~65.7°N — Model v0.4 dual-path maritime composition for the stated inputs.",
        fi: "VSAT-pääyhteys + Iridium-vara ~65.7°N — mallin v0.4 kaksoispolun merikoostumus annetuille syötteille.",
      },
      {
        kind: "RESEARCH",
        en: "Extends the maritime research set into Icelandic conditions; not a measured harbour survey.",
        fi: "Laajentaa merellisen tutkimusjoukon islantilaisiin olosuhteisiin — ei mitattu satamamittaus.",
      },
      {
        kind: "DERIVED",
        en: "Risks and ranked options follow the same deterministic Advisor path as other library maritime seeds.",
        fi: "Riskit ja sijoitetut vaihtoehdot seuraavat samaa determinististä Advisor-polkua kuin muut merelliset kirjastosiemenet.",
      },
    ],
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

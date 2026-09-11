import type { Lang } from "@/lib/use-lang"

export type KnowledgePhase = "2-knowledge" | "3-discovery"

export type KnowledgeLocale = {
  title: string
  description: string
  h1: string
  question: string
  shortAnswer: string
  sections: { h2: string; body: string }[]
  limitationsH2: string
  limitations: string[]
  ctaH2: string
  ctaBody: string
}

export type KnowledgeArticle = {
  slug: string
  primaryKeyword: string
  phase: KnowledgePhase
  updated: string
  en: KnowledgeLocale
  fi: KnowledgeLocale
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    slug: "satellite-connectivity-arctic",
    primaryKeyword: "satellite connectivity arctic",
    phase: "3-discovery",
    updated: "2026-09-10",
    en: {
      title: "Satellite connectivity in the Arctic — what remote ops should verify",
      description:
        "How Arctic latitude, orbital geometry, and single-provider setups affect satellite connectivity resilience. Modeled intelligence from GRYPS — not live RF coverage.",
      h1: "Satellite connectivity in the Arctic",
      question: "What should remote Arctic operations verify before relying on satellite connectivity?",
      shortAnswer:
        "Verify orbital mix (LEO / MEO / GEO), latitude impact on elevation and redundancy, and whether a single provider creates an unacceptable single point of failure. GRYPS scores those factors deterministically as a Resilience Signature — an assessment at a timestamp, not live monitoring.",
      sections: [
        {
          h2: "Why Arctic sites are different",
          body: "Above roughly 70°N, geostationary (GEO) satellites sit lower on the horizon, so weather, terrain, and antenna clearance matter more. LEO and polar-friendly constellations can help, but only if the site actually has a second independent path — not just a second modem on the same constellation class.",
        },
        {
          h2: "What “coverage” marketing leaves out",
          body: "Public coverage maps rarely encode redundancy, safety-critical autonomy, or modeled confidence for a specific lat/lng. Operators still need an on-site RF / sky-view survey for deployment. Intelligence tools should make architecture risk visible before hardware is locked.",
        },
        {
          h2: "How GRYPS frames Arctic connectivity",
          body: "GRYPS is satellite connectivity intelligence for Nordic and Arctic remote ops — forestry, maritime, mining, autonomous fleets. Model v0.3 weights redundancy, latitude, operational profile, and catalog confidence, then applies hard caps. It does not sell terminals or airtime.",
        },
      ],
      limitationsH2: "Limitations",
      limitations: [
        "Not live constellation telemetry or an outage feed.",
        "Not a substitute for a site survey or coverage SLA.",
        "Not insurance, certification, or legal advice.",
      ],
      ctaH2: "Next step",
      ctaBody: "Explore modeled regions via Connectivity Intelligence, then Generate Resilience Signature in the Advisor.",
    },
    fi: {
      title: "Satelliittiyhteydet Arktiksella — mitä etätoimintojen tulee tarkistaa",
      description:
        "Miten arktinen leveysaste, rataluokat ja yhden toimittajan asetelma vaikuttavat satelliittiyhteyksien resilienssiin. GRYPS:n mallinnettua älyä — ei reaaliaikaista RF-kattavuutta.",
      h1: "Satelliittiyhteydet Arktiksella",
      question: "Mitä arktisten etätoimintojen tulisi tarkistaa ennen kuin satelliittiyhteyteen nojataan?",
      shortAnswer:
        "Tarkista rataluokkien yhdistelmä (LEO / MEO / GEO), leveysasteen vaikutus elevaatioon ja redundanssiin sekä se, muodostaako yksi toimittaja liian suuren yksittäisen vikaantumispisteen. GRYPS pisteyttää nämä deterministisesti Resilience Signature -arviona — arvio ajanhetkellä, ei reaaliaikaista seurantaa.",
      sections: [
        {
          h2: "Miksi arktiset kohteet eroavat",
          body: "Yli noin 70°N geostationääriset (GEO) satelliitit ovat matalalla horisontissa, joten sää, maasto ja antennin näkymä korostuvat. LEO ja polaariystävälliset konstellaatiot voivat auttaa, mutta vain jos kohteella on aidosti toinen itsenäinen polku — ei pelkkä toinen modeemi samaan rataluokkaan.",
        },
        {
          h2: "Mitä kattavuusmarkkinointi jättää pois",
          body: "Julkiset kattavuuskartat eivät yleensä kuvaa redundanssia, turvallisuuskriittistä autonomiaa tai mallinnettua luottamusta tietylle lat/lng-pisteelle. Käyttöönottoon tarvitaan edelleen paikan päällä tehtävä RF- / taivasnäkymämittaus. Älytyökalun tulisi näyttää arkkitehtuuririski ennen laitteistolukitusta.",
        },
        {
          h2: "Miten GRYPS jäsentää arktista yhteyttä",
          body: "GRYPS on satelliittiyhteyksien älyä pohjoismaisiin ja arktisiin etätoimintoihin — metsä, meri, kaivos, autonomiset kalustot. Malli v0.3 painottaa redundanssia, leveysastetta, toimintaprofiilia ja hakemistoluottamusta sekä asettaa kovat katot. Se ei myy päätteitä eikä ilmaaikaa.",
        },
      ],
      limitationsH2: "Rajoitteet",
      limitations: [
        "Ei reaaliaikaista konstellaatiotelemetriaa eikä häiriösyötettä.",
        "Ei korvaa paikan päällä tehtävää mittausta eikä kattavuus-SLA:ta.",
        "Ei vakuutusta, sertifiointia eikä oikeudellista neuvontaa.",
      ],
      ctaH2: "Seuraava askel",
      ctaBody: "Tutki mallinnettuja alueita Capacity-kartalla ja aja sitten kohdearvio Advisorissa.",
    },
  },
  {
    slug: "leo-vs-meo-vs-geo-remote-operations",
    primaryKeyword: "LEO vs MEO vs GEO remote operations",
    phase: "2-knowledge",
    updated: "2026-09-10",
    en: {
      title: "LEO vs MEO vs GEO for remote operations",
      description:
        "Plain-language orbital trade-offs for remote industrial connectivity: latency, elevation at high latitude, and redundancy. GRYPS research framing — not a provider ranking to buy from.",
      h1: "LEO vs MEO vs GEO for remote operations",
      question: "How should remote operators compare LEO, MEO, and GEO satellite connectivity?",
      shortAnswer:
        "Compare by latency needs, latitude (especially GEO elevation), and whether paths are independent. LEO usually wins on latency; GEO is stable where elevation allows; MEO sits between. Resilience improves when orbital classes are mixed — not when two links share the same failure mode.",
      sections: [
        {
          h2: "LEO (low Earth orbit)",
          body: "Typical strengths: lower latency and denser revisits for many broadband use cases. Typical risks: handovers, terminal/constellation maturity, and assuming “LEO” alone equals redundancy. Two LEO paths on related infrastructure may still correlate under outage or policy constraints.",
        },
        {
          h2: "MEO (medium Earth orbit)",
          body: "Often positioned as a middle ground between GEO reliability narratives and LEO latency. Useful as an independent class in a multi-orbit design when the catalog and latitude support it — still subject to real antenna and service constraints on site.",
        },
        {
          h2: "GEO (geostationary)",
          body: "Fixed sky position simplifies tracking where elevation is healthy. At high Nordic/Arctic latitudes, low elevation increases weather and obstruction sensitivity. GEO-only designs above ~72°N are capped hard in GRYPS Model v0.3 for that reason.",
        },
        {
          h2: "What GRYPS scores",
          body: "The deterministic engine rewards independent orbital types in the redundancy component and applies latitude and GEO-related caps. Provider names in demos are catalog references — GRYPS has no commercial relationship with listed operators.",
        },
      ],
      limitationsH2: "Limitations",
      limitations: [
        "Not a live comparison of current constellation health.",
        "Not procurement advice or a “best provider” award.",
        "Site survey and vendor engineering still required before deployment.",
      ],
      ctaH2: "Next step",
      ctaBody: "Read the scoring formula, then score a sample high-latitude site in the Advisor.",
    },
    fi: {
      title: "LEO vs MEO vs GEO etätoiminnoissa",
      description:
        "Rataluokkien kompromissit etäteollisuuden yhteyksiin: viive, elevaatio korkeilla leveysasteilla ja redundanssi. GRYPS-tutkimuskehys — ei ostettavaa toimittajasijoitusta.",
      h1: "LEO vs MEO vs GEO etätoiminnoissa",
      question: "Miten etätoimijoiden kannattaa vertailla LEO-, MEO- ja GEO-satelliittiyhteyksiä?",
      shortAnswer:
        "Vertaa viivetarpeen, leveysasteen (erityisesti GEO-elevaatio) ja polkujen itsenäisyyden mukaan. LEO voittaa usein viiveessä; GEO on vakaa siellä missä elevaatio riittää; MEO on välimaasto. Resilienssi paranee, kun rataluokkia sekoitetaan — ei silloin, kun kaksi linkkiä jakaa saman vikaantumistavan.",
      sections: [
        {
          h2: "LEO (matala kiertorata)",
          body: "Tyypilliset vahvuudet: pienempi viive ja tiheämmät ohitukset monissa broadband-käytöissä. Tyypilliset riskit: handoverit, päätteen/konstellaation kypsyys ja oletus, että “LEO” yksin riittää redundanssiksi. Kaksi LEO-polkua samankaltaisessa infrastruktuurissa voivat silti korreloida häiriöissä.",
        },
        {
          h2: "MEO (keskikorkea kiertorata)",
          body: "Sijoittuu usein GEO-luotettavuuskertomusten ja LEO-viiveen väliin. Hyödyllinen itsenäisenä luokkana monirataisessa suunnittelussa, kun hakemisto ja leveysaste sen sallivat — kohteella pätevät silti antenni- ja palvelurajoitteet.",
        },
        {
          h2: "GEO (geostationäärinen)",
          body: "Kiinteä taivaspaikka helpottaa seurantaa, kun elevaatio on hyvä. Korkeilla pohjoisilla leveysasteilla matala elevaatio lisää sään ja esteiden herkkyyttä. Vain GEO -asetelmat yli ~72°N katkaistaan GRYPS-mallissa v0.3 juuri tästä syystä.",
        },
        {
          h2: "Mitä GRYPS pisteyttää",
          body: "Deterministinen moottori palkitsee itsenäiset rataluokat redundanssikomponentissa ja asettaa leveysaste- sekä GEO-katot. Demojen toimittajanimet ovat hakemistoviitteitä — GRYPS:llä ei ole kaupallista suhdetta listattuihin operaattoreihin.",
        },
      ],
      limitationsH2: "Rajoitteet",
      limitations: [
        "Ei reaaliaikaista vertailua konstellaatioiden terveydestä.",
        "Ei hankintaohjetta eikä “paras toimittaja” -palkintoa.",
        "Käyttöönottoon tarvitaan edelleen mittaus ja toimittajatekniikka.",
      ],
      ctaH2: "Seuraava askel",
      ctaBody: "Lue pisteytyskaava ja pisteytä sitten esimerkkikohde Advisorissa.",
    },
  },
  {
    slug: "forestry-satellite-connectivity-finland",
    primaryKeyword: "forestry satellite connectivity Finland",
    phase: "3-discovery",
    updated: "2026-09-10",
    en: {
      title: "Forestry satellite connectivity in Finland",
      description:
        "Connectivity resilience for Finnish forestry and timber-yard operations: canopy/terrain effects, autonomy profile, and multi-orbit thinking. GRYPS modeled intelligence.",
      h1: "Forestry satellite connectivity in Finland",
      question: "What matters for satellite connectivity on Finnish forestry sites?",
      shortAnswer:
        "Latitude band, canopy/terrain sky view, autonomy level, and whether the site depends on a single provider. GRYPS Model v0.3 applies a forestry terrain penalty below 300 m elevation and scores redundancy and operational profile separately from live RF.",
      sections: [
        {
          h2: "Operational reality",
          body: "Harvesting, roadside landings, and yard logistics often mix cellular fringe with satellite backup — or satellite-primary in deeper stands. Autonomy and remote operation raise the cost of a single-link outage even when average throughput looks fine on paper.",
        },
        {
          h2: "What the Signature emphasizes",
          body: "Redundancy across providers/orbits, latitude weight, operational profile (manual → autonomous), and catalog confidence. Terrain evidence (EU-DEM via OpenTopoData) is shown separately and is not blended into the 0–100 Signature score.",
        },
        {
          h2: "Finland-specific note",
          body: "Municipality-seeded demos may show Bittimittari fixed-network context where available; ad-hoc coordinates do not invent Finnish speed-test coverage. Always treat outputs as research-prototype assessments.",
        },
      ],
      limitationsH2: "Limitations",
      limitations: [
        "Not a canopy RF propagation model.",
        "Not live Starlink / OneWeb / Iridium status for a stand.",
        "Not a substitute for forestry OEM or integrator engineering.",
      ],
      ctaH2: "Next step",
      ctaBody: "Open Explore Connectivity Intelligence for Nordic context, then Generate Resilience Signature for a forestry site.",
    },
    fi: {
      title: "Metsätalouden satelliittiyhteydet Suomessa",
      description:
        "Yhteysresilienssi suomalaisessa metsä- ja puutavaratoiminnassa: latvus/maasto, autonomia ja monirataisuus. GRYPS:n mallinnettua älyä.",
      h1: "Metsätalouden satelliittiyhteydet Suomessa",
      question: "Mikä ratkaisee satelliittiyhteyden metsäkohteilla Suomessa?",
      shortAnswer:
        "Leveysastevyöhyke, latvuksen/maaston taivasnäkymä, autonomia sekä se, nojaako kohde yhteen toimittajaan. GRYPS-malli v0.3 lisää metsämaastorangaistuksen alle 300 m korkeudessa ja pisteyttää redundanssin sekä toimintaprofiilin erikseen reaaliaikaisesta RF:stä.",
      sections: [
        {
          h2: "Toimintaympäristö",
          body: "Hakkuu, tienvarsi ja varastologistiikka sekoittavat usein heikkoa matkapuhelinverkkoa ja satelliittivaraa — tai satelliittia ensisijaisena syvemmissä kohteissa. Autonomia ja etäohjaus nostavat yhden linkin katkon hintaa, vaikka keskimääräinen läpimeno näyttäisi paperilla hyvältä.",
        },
        {
          h2: "Mitä Signature korostaa",
          body: "Redundanssi toimittajien/ratojen yli, leveysastepaino, toimintaprofiili (manuaalinen → autonominen) ja hakemistoluottamus. Maastoaineisto (EU-DEM OpenTopoDatan kautta) näytetään erikseen eikä sekoiteta 0–100 Signature-pisteeseen.",
        },
        {
          h2: "Suomi-huomio",
          body: "Kuntapohjaiset demot voivat näyttää Bittimittari-kiinteän verkon kontekstia kun saatavilla; vapaat koordinaatit eivät keksi Suomen nopeustestikattavuutta. Tulosteet ovat tutkimusprototyypin arvioita.",
        },
      ],
      limitationsH2: "Rajoitteet",
      limitations: [
        "Ei latvuksen RF-etenemismalli.",
        "Ei reaaliaikaista Starlink- / OneWeb- / Iridium-tilaa leimikolle.",
        "Ei korvaa metsäkone-OEM:n tai integraattorin suunnittelua.",
      ],
      ctaH2: "Seuraava askel",
      ctaBody: "Avaa Capacity-kartta pohjoismaiseen kontekstiin ja pisteytä metsäkohde Advisorissa.",
    },
  },
  {
    slug: "satellite-connectivity-resilience-scoring",
    primaryKeyword: "satellite connectivity resilience scoring",
    phase: "2-knowledge",
    updated: "2026-09-10",
    en: {
      title: "Satellite connectivity resilience scoring",
      description:
        "What a Resilience Signature is: deterministic 0–100 score, grades, caps, and why GRYPS separates modeled intelligence from live RF monitoring.",
      h1: "Satellite connectivity resilience scoring",
      question: "What is satellite connectivity resilience scoring?",
      shortAnswer:
        "It is a structured assessment of how brittle a site’s satellite setup is under redundancy, latitude, operations profile, and provider confidence — not a speed test and not live coverage. GRYPS Model v0.3 outputs a versioned Resilience Signature (score, grade, risks, ranked options).",
      sections: [
        {
          h2: "Score components (Model v0.3)",
          body: "Redundancy (0–30) + latitude (0–20) + operational profile (0–15) + provider confidence (0–30), then hard caps, clamped 0–100. Grades: A ≥90 · B 75–89 · C 60–74 · D 40–59 · F <40.",
        },
        {
          h2: "Two scores, not one blend",
          body: "The Signature score is deterministic and reproducible for the same inputs. Terrain penalty evidence is shown separately. Optional language-model text may polish a recommendation paragraph only — it never changes score, grade, risks, or ranked providers.",
        },
        {
          h2: "Why versioning matters",
          body: "Each Signature carries issuedAt, modelVersion, and inputHash so later monitoring can compare T0 vs T1 with the same engine. Live drift alerting is not productized yet; homepage drift UI is illustrative.",
        },
      ],
      limitationsH2: "Limitations",
      limitations: [
        "Not certification, insurance, or NIS2/CER legal advice.",
        "Not live RF or constellation telemetry.",
        "Non-commercial R&D prototype — not for sale.",
      ],
      ctaH2: "Next step",
      ctaBody: "Read the full methodology, then run the demo Advisor on a sample site.",
    },
    fi: {
      title: "Satelliittiyhteyksien resilienssipisteytys",
      description:
        "Mikä Resilience Signature on: deterministinen 0–100-piste, arvosanat, katot ja miksi GRYPS erottaa mallinnetun älyn reaaliaikaisesta RF-seurannasta.",
      h1: "Satelliittiyhteyksien resilienssipisteytys",
      question: "Mitä satelliittiyhteyksien resilienssipisteytys tarkoittaa?",
      shortAnswer:
        "Se on rakenteellinen arvio siitä, miten hauras kohteen satelliittiasetelma on redundanssin, leveysasteen, toimintaprofiilin ja toimittajaluottamuksen suhteen — ei nopeustesti eikä live-kattavuus. GRYPS-malli v0.3 tuottaa versioidun Resilience Signaturen (pisteet, arvosana, riskit, suositukset).",
      sections: [
        {
          h2: "Pistekomponentit (malli v0.3)",
          body: "Redundanssi (0–30) + leveysaste (0–20) + toimintaprofiili (0–15) + toimittajaluottamus (0–30), sitten kovat katot, rajattu 0–100. Arvosanat: A ≥90 · B 75–89 · C 60–74 · D 40–59 · F <40.",
        },
        {
          h2: "Kaksi pistettä, ei yhtä sekoitusta",
          body: "Signature-piste on deterministinen ja toistettavissa samoilla syötteillä. Maastorangaistuksen näyttö on erillinen. Valinnainen kielimalliteksti voi hioa vain suosituskappaleen — se ei muuta pistettä, arvosanaa, riskejä tai toimittajasuosituksia.",
        },
        {
          h2: "Miksi versiointi merkitsee",
          body: "Jokainen Signature sisältää issuedAt-, modelVersion- ja inputHash-kentät, jotta seuranta voi verrata T0:ta ja T1:tä samalla moottorilla. Reaaliaikaisia ajautumahälytyksiä ei ole vielä tuotteistettu; etusivun ajautuma-UI on havainnollistus.",
        },
      ],
      limitationsH2: "Rajoitteet",
      limitations: [
        "Ei sertifiointia, vakuutusta eikä NIS2/CER-oikeudellista neuvontaa.",
        "Ei reaaliaikaista RF:ää eikä konstellaatiotelemetriaa.",
        "Ei-kaupallinen T&K-prototyyppi — ei myynnissä.",
      ],
      ctaH2: "Seuraava askel",
      ctaBody: "Lue koko menetelmä ja aja demo-Advisor esimerkkikohteelle.",
    },
  },
  {
    slug: "forestry-logistics",
    primaryKeyword: "forestry logistics",
    phase: "3-discovery",
    updated: "2026-09-10",
    en: {
      title: "Forestry logistics connectivity — resilience before the roadside fails",
      description:
        "Why forestry logistics links (yard, roadside, fleet) need connectivity resilience thinking — and how GRYPS models site risk without claiming live coverage.",
      h1: "Forestry logistics and connectivity resilience",
      question: "Why does forestry logistics need connectivity resilience scoring?",
      shortAnswer:
        "Roadside landings, timber yards, and fleet coordination break when the only link drops — especially under remote or autonomous workflows. Scoring resilience (redundancy, latitude, profile, confidence) surfaces single-provider risk before operations depend on hope.",
      sections: [
        {
          h2: "Logistics is a connectivity workload",
          body: "Dispatch, machine data, and safety messaging are latency- and availability-sensitive even when bulk file sync can wait. A “good enough” average speed test does not equal an acceptable outage profile for a safety-aware yard.",
        },
        {
          h2: "Early Search Console signal",
          body: "GRYPS already sees sparse impressions for the query “forestry logistics.” This page answers the operational meaning in our domain: connectivity for forestry logistics sites — not generic supply-chain content farms.",
        },
        {
          h2: "How to use GRYPS here",
          body: "Pick a representative lat/lng (yard or landing), set sector to forestry, choose autonomy/criticality honestly, and compare single- vs multi-provider setups when you Generate Resilience Signature. Pair with Explore Connectivity Intelligence for regional modeled context.",
        },
      ],
      limitationsH2: "Limitations",
      limitations: [
        "Not a TMS/WMS product or logistics optimizer.",
        "Not live fleet tracking.",
        "Early SEO demand signal — treat as editorial knowledge, not proof of search volume.",
      ],
      ctaH2: "Next step",
      ctaBody: "Score a forestry logistics site, then read Finland-focused forestry connectivity guidance.",
    },
    fi: {
      title: "Metsälogistiikan yhteydet — resilienssi ennen tienvarren katkoa",
      description:
        "Miksi metsälogistiikan linkit (varasto, tienvarsi, kalusto) tarvitsevat yhteysresilienssiajattelua — ja miten GRYPS mallintaa kohderiskiä ilman live-kattavuusväitettä.",
      h1: "Metsälogistiikka ja yhteysresilienssi",
      question: "Miksi metsälogistiikka tarvitsee yhteysresilienssin pisteytystä?",
      shortAnswer:
        "Tienvarsi, puutavaravarasto ja kaluston koordinointi kaatuvat, kun ainoa linkki katkeaa — erityisesti etä- tai autonomisissa työnkuluissa. Resilienssin pisteytys (redundanssi, leveysaste, profiili, luottamus) tuo yhden toimittajan riskin esiin ennen kuin toiminta nojaa toiveeseen.",
      sections: [
        {
          h2: "Logistiikka on yhteystyökuorma",
          body: "Ohjaus, konedata ja turvallisuusviestintä ovat viive- ja saatavuusherkkiä, vaikka massatiedostojen synkronointi voi odottaa. “Tarpeeksi hyvä” keskimääräinen nopeustesti ei ole hyväksyttävä katkoprofiili turvallisuustietoiselle varastolle.",
        },
        {
          h2: "Varhainen Search Console -signaali",
          body: "GRYPS näkee harvoja näyttökertoja haulle “forestry logistics.” Tämä sivu vastaa toiminnalliseen merkitykseen meidän domainissamme: yhteydet metsälogistiikkakohteille — ei geneeristä toimitusketjusisältöä.",
        },
        {
          h2: "Miten GRYPS:ää käytetään tässä",
          body: "Valitse edustava lat/lng (varasto tai tienvarsi), aseta toimiala metsäksi, valitse autonomia/kriittisyys rehellisesti ja vertaa yhden vs. usean toimittajan asetelmia Advisorissa. Yhdistä Capacity-karttaan alueellista mallinnettua kontekstia varten.",
        },
      ],
      limitationsH2: "Rajoitteet",
      limitations: [
        "Ei TMS/WMS-tuote eikä logistiikkaoptimoija.",
        "Ei reaaliaikaista kaluston seurantaa.",
        "Varhainen SEO-signaali — editorial-tietosisältö, ei todiste hakumäärästä.",
      ],
      ctaH2: "Seuraava askel",
      ctaBody: "Luo Resilience Signature metsälogistiikkakohteelle ja lue sitten Suomen metsäyhteysopas.",
    },
  },
]

export function getKnowledgeArticle(slug: string): KnowledgeArticle | undefined {
  return KNOWLEDGE_ARTICLES.find((a) => a.slug === slug)
}

export function getKnowledgeLocale(article: KnowledgeArticle, lang: Lang): KnowledgeLocale {
  return lang === "fi" ? article.fi : article.en
}

export function knowledgeSlugs(): string[] {
  return KNOWLEDGE_ARTICLES.map((a) => a.slug)
}

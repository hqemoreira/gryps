/**
 * Mission & Scenario Research — analytical depth beyond “which provider.”
 * Research scenarios only: no CRM, quotations, or sales funnel.
 */

export type MissionScenarioId =
  | "arctic-forestry"
  | "mining"
  | "maritime"
  | "remote-industrial"
  | "emergency-response"
  | "remote-infrastructure";

export type ScenarioSection = {
  environment: string;
  requirements: string[];
  challenges: string[];
  technology: string[];
  providers: string[];
  architecture: string;
};

export type MissionScenario = {
  slug: MissionScenarioId;
  title: string;
  titleFi: string;
  subtitle: string;
  subtitleFi: string;
  /** Short card blurb */
  blurb: string;
  blurbFi: string;
  /** Advisor sector prefill when generating a Signature */
  advisorSector: string;
  /** Optional mission priorities for Advisor prefill */
  suggestedPriorities: string[];
  relatedResearchSlugs: string[];
  relatedKnowledgeSlugs: string[];
  en: ScenarioSection;
  fi: ScenarioSection;
};

export const MISSION_SCENARIOS: MissionScenario[] = [
  {
    slug: "arctic-forestry",
    title: "Arctic forestry",
    titleFi: "Arktinen metsätalous",
    subtitle: "Canopy, mobility, and single-path exposure in high-latitude timber ops",
    subtitleFi: "Latvus, liikkuvuus ja yhden polun riski korkeiden leveysasteiden metsätyössä",
    blurb:
      "How connectivity architecture might support remote harvester fleets and timber logistics where canopy and latitude constrain GEO.",
    blurbFi:
      "Miten yhteysarkkitehtuuri voisi tukea etähakkuukonekalustoja ja puulogistiikkaa, kun latvus ja leveysaste rajoittavat GEO:ta.",
    advisorSector: "forestry",
    suggestedPriorities: ["mobility", "coverage", "deployment_simplicity"],
    relatedResearchSlugs: ["finnish-arctic-forestry-lapland", "finnish-arctic-forestry-inari"],
    relatedKnowledgeSlugs: [
      "forestry-satellite-connectivity-finland",
      "satellite-connectivity-arctic",
    ],
    en: {
      environment:
        "Nordic and Arctic forestry blocks — often 65–70°N+ — with mobile machinery, seasonal canopy, and limited terrestrial backhaul at the stump. Operations mix manual, remote-operated, and increasingly autonomous harvesting.",
      requirements: [
        "Machine telemetry and control paths that tolerate brief outages without stranding crews",
        "Mobility-friendly terminals (self-orienting LEO kits over fixed GEO dishes)",
        "Documented failover when primary broadband drops under canopy or weather",
        "Evidence suitable for readiness documentation — not a vendor quote package",
      ],
      challenges: [
        "Canopy and terrain shadowing reduce effective sky-view for phased-array LEO",
        "Single-provider broadband setups are common and create correlated outage risk",
        "GEO elevation degrades toward the Arctic Circle; unsuitable as sole primary above ~70°N",
        "Autonomy increases dependency: a connectivity gap becomes an operational safety event",
      ],
      technology: [
        "LEO broadband as primary mobility path where sky-view allows",
        "Polar-orbit narrowband (e.g. Iridium-class) as independent control/backup",
        "Store-and-forward / edge buffering for non-critical telemetry during passes",
        "Dual-orbit architecture when safety-critical autonomy is in scope",
      ],
      providers: [
        "LEO broadband catalog options (e.g. Starlink, OneWeb) for throughput under open sky",
        "Polar narrowband for high-latitude reach when broadband LEO is obstructed",
        "Avoid GEO-only architectures for Arctic stump-side primary connectivity",
        "GRYPS ranks options via Model v0.3 — illustrative, no commercial relationships",
      ],
      architecture:
        "A research-fit architecture for Arctic forestry often looks like LEO broadband for logistics video/telemetry plus an independent polar narrowband path for control and distress — scored for redundancy and latitude, not sold as a package.",
    },
    fi: {
      environment:
        "Pohjoismaiset ja arktiset metsälohkot — usein 65–70°N+ — liikkuvine koneineen, vuodenaikaisine latvuksineen ja rajallisella maanpäällisellä backhaulilla kannolla. Toiminta yhdistää manuaalista, etäohjattua ja yhä enemmän autonomista hakkuuta.",
      requirements: [
        "Koneiden telemetria- ja ohjauspolut, jotka kestävät lyhyitä katkoja ilman miehistön jättämistä",
        "Liikkuvuuteen sopivat terminaalit (itsesuuntautuva LEO kiinteän GEO-lautasen sijaan)",
        "Dokumentoitu failover, kun ensisijainen laajakaista putoaa latvuksen tai sään alle",
        "Näyttö valmiusdokumentaatioon — ei toimittajan tarjouspaketti",
      ],
      challenges: [
        "Latvus ja maaston varjostus heikentävät vaiheistetun LEO:n taivasnäkymää",
        "Yhden toimittajan laajakaista on yleistä ja synnyttää korreloituneen häiriöriskin",
        "GEO-elevaatio heikkenee napapiiriä kohti; ei sovi ainoaksi primääriksi yli ~70°N",
        "Autonomia kasvattaa riippuvuutta: yhteysaukosta tulee turvallisuustapahtuma",
      ],
      technology: [
        "LEO-laajakaista ensisijaisena liikkuvuuspolkuna, kun taivasnäkymä sallii",
        "Polaariradan kapeakaista (esim. Iridium-luokka) itsenäisenä ohjaus-/varapolkuna",
        "Store-and-forward / reunapuskurointi ei-kriittiselle telemetrille ohitusten aikana",
        "Kaksiorbitinen arkkitehtuuri, kun turvallisuuskriittinen autonomia on mukana",
      ],
      providers: [
        "LEO-laajakaistan hakemistovaihtoehdot (esim. Starlink, OneWeb) avoimen taivaan kapasiteettiin",
        "Polaarinen kapeakaista korkeiden leveysasteiden ulottuvuuteen, kun LEO-laajakaista estyy",
        "Vältä vain-GEO-arkkitehtuureja arktisen kannon ensisijaiseksi yhteydeksi",
        "GRYPS sijoittaa vaihtoehdot mallilla v0.3 — havainnollistavaa, ei kaupallisia suhteita",
      ],
      architecture:
        "Tutkimuksellisesti sopiva arkkitehtuuri arktiseen metsätalouteen näyttää usein LEO-laajakaistalta logistiikan videoon/telemetriaan plus itsenäiseltä polaariselta kapeakaistapolulta ohjaukseen ja hätään — pisteytetty redundanssin ja leveysasteen mukaan, ei myyty pakettina.",
    },
  },
  {
    slug: "mining",
    title: "Mining",
    titleFi: "Kaivostoiminta",
    subtitle: "Autonomous haul and pit connectivity under high operational criticality",
    subtitleFi: "Autonominen kuljetus ja avolouhos korkeassa toiminnan kriittisyydessä",
    blurb:
      "Connectivity architectures for Arctic and Nordic mining fleets where autonomy and safety-critical thresholds reshape redundancy needs.",
    blurbFi:
      "Yhteysarkkitehtuurit arktisille ja pohjoismaisille kaivoskalustoille, joissa autonomia ja turvallisuuskriittisyys muovaavat redundanssitarvetta.",
    advisorSector: "mining",
    suggestedPriorities: ["uptime", "redundancy", "latency"],
    relatedResearchSlugs: ["arctic-mining-northern-sweden", "finnish-arctic-mining-kittila"],
    relatedKnowledgeSlugs: [
      "satellite-connectivity-arctic",
      "satellite-connectivity-resilience-scoring",
    ],
    en: {
      environment:
        "Open-pit and remote extraction sites in Sweden, Finland, and the wider Arctic — often beyond reliable terrestrial coverage, with autonomous or remote-operated haul fleets and strict safety envelopes.",
      requirements: [
        "Low-latency command paths for vehicle supervision where autonomy is active",
        "Independent failover before safety-critical single-path postures",
        "Orbital-class diversity so one constellation outage does not halt the fleet",
        "Modeled Signature evidence for readiness docs — not procurement bidding",
      ],
      challenges: [
        "Safety-critical + autonomous + single provider triggers hard score caps in Model v0.3",
        "Pit geometry and berms can obstruct sky-view similarly to forestry canopy",
        "Failover often exists on paper but is not automated or drilled",
        "GEO links may serve camp offices while being unsuitable for pit primary paths above ~70°N",
      ],
      technology: [
        "Dual LEO (broadband + polar narrowband) as a common research pattern",
        "Edge autonomy with satellite for supervisory override rather than continuous teleoperation",
        "Documented switching procedures with modeled failover latency bands",
        "Mission priorities (uptime, redundancy, latency) to re-rank options without changing Signature score",
      ],
      providers: [
        "LEO broadband for haul telemetry and cameras under open sky",
        "Polar narrowband for resilient control and distress",
        "GEO/VSAT only as tertiary or camp-side, not sole Arctic pit primary",
        "Catalog confidence is assessment basis — not an SLA or commercial endorsement",
      ],
      architecture:
        "Mining research scenarios typically favour multi-orbit redundancy when autonomy is safety-critical: a broadband LEO primary plus an independent polar path, with Signature caps enforcing honesty about single-path setups.",
    },
    fi: {
      environment:
        "Avolouhokset ja etäiset louhintakohteet Ruotsissa, Suomessa ja laajemmin arktisella alueella — usein ilman luotettavaa maanpäällistä peittoa, autonomisine tai etäohjattuine kuljetuskalustoineen ja tiukkoine turvallisuuskehyksineen.",
      requirements: [
        "Matalan latenssin ohjauspolut ajoneuvojen valvontaan, kun autonomia on käytössä",
        "Itsenäinen failover ennen turvallisuuskriittisiä yhden polun asemia",
        "Rataluokan monimuotoisuus, jotta yhden konstellaation häiriö ei pysäytä kalustoa",
        "Mallinnettu Signature-näyttö valmiusdokumentteihin — ei hankintatarjouskilpailu",
      ],
      challenges: [
        "Turvallisuuskriittinen + autonominen + yksi toimittaja laukaisee mallin v0.3 kovat katot",
        "Louhoksen geometria ja penkereet voivat peittää taivasnäkymän kuten metsän latvus",
        "Failover on usein paperilla mutta ei automatisoitu tai harjoiteltu",
        "GEO voi palvella leiritoimistoja mutta ei sovi ainoaksi avolouhoksen primääriksi yli ~70°N",
      ],
      technology: [
        "Kaksois-LEO (laajakaista + polaarinen kapeakaista) yleisenä tutkimusmallina",
        "Reuna-autonomia satelliitilla valvova override, ei jatkuva teleoperointi",
        "Dokumentoidut vaihtomenettelyt mallinnetuilla failover-latenssikaistoilla",
        "Tehtävän prioriteetit (käytettävyys, redundanssi, latenssi) järjestävät vaihtoehdot ilman Signature-pisteen muutosta",
      ],
      providers: [
        "LEO-laajakaista kuljetustelemetriaan ja kameroihin avoimen taivaan alla",
        "Polaarinen kapeakaista resilienssiin ohjaukseen ja hätään",
        "GEO/VSAT vain tertiäärinä tai leiripuolella, ei ainoana arktisen louhoksen primäärinä",
        "Hakemistoluottamus on arviointiperusta — ei SLA eikä kaupallinen suositus",
      ],
      architecture:
        "Kaivosskenaariot suosivat tyypillisesti monirataista redundanssia, kun autonomia on turvallisuuskriittistä: LEO-laajakaista primäärinä plus itsenäinen polaaripolku, Signature-kattojen pitäessä yhden polun asetelmat rehellisinä.",
    },
  },
  {
    slug: "maritime",
    title: "Maritime",
    titleFi: "Merenkulku",
    subtitle: "Offshore platforms, fleets, and high-latitude elevation constraints",
    subtitleFi: "Offshore-alustat, laivastot ja korkeiden leveysasteiden elevaatiorajoitteet",
    blurb:
      "What connectivity architecture might suit Nordic–Arctic maritime ops where GEO heritage meets LEO expansion.",
    blurbFi:
      "Millainen yhteysarkkitehtuuri voisi sopia Pohjoismaiden–arktisen merenkulun toimintaan, jossa GEO-perinne kohtaa LEO-laajenemisen.",
    advisorSector: "maritime",
    suggestedPriorities: ["uptime", "coverage", "bandwidth"],
    relatedResearchSlugs: [
      "norwegian-arctic-maritime-offshore",
      "norwegian-maritime-lofoten",
      "norwegian-maritime-energy-hammerfest",
    ],
    relatedKnowledgeSlugs: ["leo-vs-meo-vs-geo-remote-operations", "satellite-connectivity-arctic"],
    en: {
      environment:
        "Fjords, offshore aquaculture, fishing fleets, and LNG/terminal monitoring along the Norwegian and Barents coasts — vessels and platforms that historically relied on GEO VSAT and are evaluating LEO overlays.",
      requirements: [
        "Continuous crew welfare and ops traffic without pretending GEO elevation is free at 70°N+",
        "Failover between orbital classes for weather and blockage events",
        "Maritime-certified hardware paths considered separately from modeled confidence",
        "Architecture research that stays non-commercial — no brokerage",
      ],
      challenges: [
        "GEO elevation collapses toward the poles; legacy FleetBroadband/GX as sole primary is fragile north of ~70°N",
        "Vessel motion and icing affect antenna performance across classes",
        "Mixing GEO primary with LEO backup (or reverse) needs explicit orbital-diversity thinking",
        "Latency bands differ sharply between GEO (~500–700 ms ref.) and LEO broadband (~20–50 ms ref.)",
      ],
      technology: [
        "Hybrid GEO + LEO where mid-latitude elevation still works",
        "LEO-primary + polar narrowband above high-latitude thresholds",
        "Stabilized maritime antennas and dual-modem routing (research pattern, not a product SKU)",
        "Mission priorities to stress uptime vs bandwidth for the same coordinates",
      ],
      providers: [
        "Inmarsat/Viasat-class GEO for heritage maritime coverage where elevation allows",
        "Starlink/OneWeb-class LEO for throughput and lower latency overlays",
        "Iridium-class polar narrowband for high-latitude safety backup",
        "GRYPS comparison bands are model commentary — not carrier SLAs",
      ],
      architecture:
        "Maritime research often surfaces a hybrid architecture: keep GEO where elevation still works, add LEO for latency/throughput, and retain polar narrowband above the Arctic threshold — then Signature the posture instead of buying a sales package.",
    },
    fi: {
      environment:
        "Vuonot, offshore-vesiviljely, kalastuslaivastot ja LNG-/terminaalivalvonta Norjan ja Barentsin rannikoilla — alukset ja alustat, jotka ovat perinteisesti nojanneet GEO-VSAT:iin ja arvioivat LEO-peittoja.",
      requirements: [
        "Jatkuva miehistön hyvinvointi- ja operatiivinen liikenne ilman oletusta, että GEO-elevaatio on vapaa yli 70°N",
        "Failover rataluokkien välillä sään ja peittojen yhteydessä",
        "Merenkulkusertifioidut laitteistopolut erillään mallinnetusta luottamuksesta",
        "Arkkitehtuuritutkimus, joka pysyy ei-kaupallisena — ei välitystä",
      ],
      challenges: [
        "GEO-elevaatio romahtaa napoja kohti; perinteinen FleetBroadband/GX ainoana primäärinä on hauras pohjoisessa ~70°N",
        "Aluksen liike ja jää vaikuttavat antenneihin kaikissa luokissa",
        "GEO-primääri + LEO-varapolku (tai päinvastoin) vaatii eksplisiittistä rata-monimuotoisuusajattelua",
        "Latenssikaistat eroavat jyrkästi GEO:n (~500–700 ms viite) ja LEO-laajakaistan (~20–50 ms viite) välillä",
      ],
      technology: [
        "Hybridi GEO + LEO, kun keski-leveän elevaatio vielä toimii",
        "LEO-primääri + polaarinen kapeakaista korkeiden leveysasteiden kynnyksen yli",
        "Stabiloidut meriantennit ja kaksoismodeemireititys (tutkimusmalli, ei tuote-SKU)",
        "Tehtävän prioriteetit painottamaan käytettävyyttä vs kaistaa samoilla koordinaateilla",
      ],
      providers: [
        "Inmarsat/Viasat-luokan GEO perinteiseen meripeittoon, kun elevaatio sallii",
        "Starlink/OneWeb-luokan LEO kapasiteettiin ja matalampaan latenssiin",
        "Iridium-luokan polaarinen kapeakaista korkeiden leveysasteiden turvavaraksi",
        "GRYPS-vertailukaistat ovat mallikommenttia — eivät operaattorin SLA:ita",
      ],
      architecture:
        "Merenkulun tutkimus nostaa usein hybridin: pidä GEO siellä missä elevaatio vielä toimii, lisää LEO latenssiin/kapasiteettiin, ja säilytä polaarinen kapeakaista arktisen kynnyksen yli — sitten Signature asema myyntipaketin sijaan.",
    },
  },
  {
    slug: "remote-industrial",
    title: "Remote industrial operations",
    titleFi: "Etäiset teollisuustoiminnot",
    subtitle: "Fixed remote sites, yards, and industrial islands without fiber",
    subtitleFi: "Kiinteät etäkohteet, pihat ja teollisuussaaret ilman kuitua",
    blurb:
      "Architecture thinking for remote yards, processing sites, and industrial outposts that need resilient links without a terrestrial core.",
    blurbFi:
      "Arkkitehtuuriajattelu etäpihoille, prosessointikohteille ja teollisuusasemille, jotka tarvitsevat resilienssiyhteyksiä ilman maanpäällistä ydintä.",
    advisorSector: "other",
    suggestedPriorities: ["uptime", "bandwidth", "deployment_simplicity"],
    relatedResearchSlugs: [
      "northern-infrastructure-jokkmokk",
      "icelandic-remote-industry-straumsvik",
    ],
    relatedKnowledgeSlugs: [
      "satellite-connectivity-resilience-scoring",
      "leo-vs-meo-vs-geo-remote-operations",
    ],
    en: {
      environment:
        "Timber yards, aggregate sites, remote factories, and Nordic industrial islands where fiber is absent or fragile and operations still expect office-grade connectivity.",
      requirements: [
        "Stable primary path for ERP, cameras, and remote expert support",
        "Documented backup before calling the posture “resilient”",
        "Deployment simplicity for small OT teams",
        "Clear separation between modeled Signature and live NOC monitoring (which GRYPS does not provide)",
      ],
      challenges: [
        "Sites often buy a single LEO kit and stop — no second path, no drill",
        "Fixed GEO can work at lower latitudes but locks mobility and elevation margins",
        "OT/IT convergence increases blast radius of a connectivity outage",
        "Operators confuse assessment confidence with availability guarantees",
      ],
      technology: [
        "LEO broadband primary + independent LEO narrowband or GEO tertiary by latitude",
        "SD-WAN / dual-modem patterns as research concepts (not GRYPS products)",
        "Edge caching so brief outages do not halt local production logic",
        "Mission priorities: uptime and bandwidth vs deployment simplicity trade-offs",
      ],
      providers: [
        "Catalog LEO broadband for primary capacity",
        "Secondary path from a different orbital class or operator family",
        "GEO VSAT where latitude and fixed mount allow",
        "Always label provider notes as non-endorsement research commentary",
      ],
      architecture:
        "Remote industrial research scenarios usually ask whether the site has two independent paths and whether latitude allows GEO at all — then Signature the gap instead of opening a sales ticket.",
    },
    fi: {
      environment:
        "Puutavarapihat, kiviainekset, etätehtaat ja pohjoismaiset teollisuussaaret, joissa kuitua ei ole tai se on hauras, mutta toiminta odottaa silti toimistotasoista yhteyttä.",
      requirements: [
        "Vakaa primääripolku ERP:lle, kameroille ja etäasiantuntijatuelle",
        "Dokumentoitu varapolku ennen kuin asemaa kutsutaan “resilientiksi”",
        "Käyttöönoton yksinkertaisuus pienille OT-tiimeille",
        "Selkeä ero mallinnetun Signaturen ja live-NOC-seurannan välillä (jota GRYPS ei tarjoa)",
      ],
      challenges: [
        "Kohteet ostavat usein yhden LEO-kitin ja lopettavat — ei toista polkua, ei harjoitusta",
        "Kiinteä GEO voi toimia alemmilla leveysasteilla mutta lukitsee liikkuvuuden ja elevaatiomarginaalit",
        "OT/IT-konvergenssi kasvattaa yhteyshäiriön vaikutusaluetta",
        "Operaattorit sekoittavat arviointiluottamuksen saatavuustakuisiin",
      ],
      technology: [
        "LEO-laajakaista primäärinä + itsenäinen LEO-kapeakaista tai GEO tertiäärinä leveysasteen mukaan",
        "SD-WAN / kaksoismodeemimallit tutkimuskäsitteinä (eivät GRYPS-tuotteita)",
        "Reunavälimuisti, jotta lyhyet katkot eivät pysäytä paikallista tuotantologiikkaa",
        "Tehtävän prioriteetit: käytettävyys ja kaista vs käyttöönoton yksinkertaisuus",
      ],
      providers: [
        "Hakemiston LEO-laajakaista primäärikapasiteettiin",
        "Toinen polku eri rataluokasta tai operaattoriperheestä",
        "GEO VSAT, kun leveysaste ja kiinteä asennus sallivat",
        "Merkitse toimittajahuomiot aina ei-suosittelevaksi tutkimuskommentiksi",
      ],
      architecture:
        "Etäisen teollisuuden skenaariot kysyvät yleensä, onko kohteella kaksi itsenäistä polkua ja salliiko leveysaste GEO:n lainkaan — sitten Signature-aukko myyntilipun sijaan.",
    },
  },
  {
    slug: "emergency-response",
    title: "Emergency response",
    titleFi: "Hätätilannevaste",
    subtitle: "Deployable connectivity under time pressure and unknown sky-view",
    subtitleFi: "Käyttöönotettava yhteys aikapaineessa ja tuntemattomassa taivasnäkymässä",
    blurb:
      "Research framing for incident response and civil protection teams that need rapid, portable links without procurement theatre.",
    blurbFi:
      "Tutkimuksellinen kehys häiriövaste- ja väestönsuojelutiimeille, jotka tarvitsevat nopeita, kannettavia yhteyksiä ilman hankintateatteria.",
    advisorSector: "other",
    suggestedPriorities: ["deployment_simplicity", "mobility", "coverage"],
    relatedResearchSlugs: [],
    relatedKnowledgeSlugs: ["satellite-connectivity-arctic", "leo-vs-meo-vs-geo-remote-operations"],
    en: {
      environment:
        "Wildfire edges, search-and-rescue staging, flood response, and Arctic incident posts — temporary sites with unknown RF conditions and minutes-to-hours deployment windows.",
      requirements: [
        "Minutes-scale setup with portable power and minimal pointing skill",
        "Coverage first; throughput second until command is stable",
        "Independent path if the primary constellation is congested or blocked",
        "Decision support that stays research — no “request a quote” step",
      ],
      challenges: [
        "Unknown canopy, terrain, and interference until teams are on site",
        "GEO pointing is slow and elevation-hostile at high latitude",
        "Congestion and fair-access policies on consumer LEO during mass events (model does not simulate congestion)",
        "Teams over-index on a single familiar provider brand",
      ],
      technology: [
        "Self-orienting LEO broadband kits for rapid primary",
        "Handheld/pack polar narrowband for voice and low-rate command",
        "Pre-staged dual kits in caches rather than single-path assumptions",
        "Prioritize deployment simplicity and mobility in Advisor weighting",
      ],
      providers: [
        "LEO broadband for deployable video and apps when sky-view opens",
        "Polar narrowband as the “always try” Arctic safety path",
        "Treat GEO as last resort for polar incident posts",
        "GRYPS does not broker airtime or ship terminals",
      ],
      architecture:
        "Emergency-response research architecture is usually portable LEO primary + polar narrowband always-on secondary, Signature’d for the staging coordinates — not a CRM opportunity.",
    },
    fi: {
      environment:
        "Metsäpalojen reunat, etsintä- ja pelastustoimen kokoamispaikat, tulvavaste ja arktiset häiriöasemat — tilapäisiä kohteita tuntemattomilla RF-olosuhteilla ja minuuttien–tuntien käyttöönottoikkunoilla.",
      requirements: [
        "Minuuttien käyttöönotto kannettavalla teholla ja vähäisellä suuntausosaamisella",
        "Kattavuus ensin; kapasiteetti toiseksi, kunnes johtaminen on vakaa",
        "Itsenäinen polku, jos primäärikonstellaatio on ruuhkainen tai peitetty",
        "Päätöstuki, joka pysyy tutkimuksena — ei “pyydä tarjousta” -vaihetta",
      ],
      challenges: [
        "Tuntematon latvus, maasto ja häiriöt, kunnes tiimit ovat paikalla",
        "GEO-suuntaus on hidasta ja elevaatioon vihamielistä korkeilla leveysasteilla",
        "Kuluttaja-LEO:n ruuhka ja fair-access massatapahtumissa (malli ei simuloi ruuhkaa)",
        "Tiimit yli-indeksoivat yhteen tuttuun toimittajabrändiin",
      ],
      technology: [
        "Itsesuuntautuvat LEO-laajakaistakitit nopeaan primääriin",
        "Käsi-/reppupolaarinen kapeakaista ääneen ja matalan nopeuden ohjaukseen",
        "Esivarastoidut kaksoiskitit välimuisteissa yhden polun oletusten sijaan",
        "Painota käyttöönoton yksinkertaisuutta ja liikkuvuutta Advisor-painotuksessa",
      ],
      providers: [
        "LEO-laajakaista käyttöönotettavaan videoon ja sovelluksiin, kun taivasnäkymä aukeaa",
        "Polaarinen kapeakaista “aina kokeile” -arktiseksi turvapoluksi",
        "Käsittele GEO:ta viimeisenä vaihtoehtona polaarisilla häiriöasemilla",
        "GRYPS ei välitä airtimea eikä toimita terminaaleja",
      ],
      architecture:
        "Hätätilannevasteen tutkimusarkkitehtuuri on yleensä kannettava LEO-primääri + polaarinen kapeakaista aina päällä olevana sekundäärinä, Signature kokoamiskoordinaateille — ei CRM-mahdollisuus.",
    },
  },
  {
    slug: "remote-infrastructure",
    title: "Remote infrastructure",
    titleFi: "Etäinen infrastruktuuri",
    subtitle: "Sensors, pipelines, grids, and unmanned monitoring posts",
    subtitleFi: "Anturit, putket, verkot ja miehittämättömät valvontapisteet",
    blurb:
      "Connectivity architecture for sparsely attended infrastructure where uptime and power budgets dominate over video bandwidth.",
    blurbFi:
      "Yhteysarkkitehtuuri harvoin miehitetyille infrastruktuurikohteille, joissa käytettävyys ja tehobudjetti hallitsevat videokaistaa.",
    advisorSector: "energy",
    suggestedPriorities: ["uptime", "coverage", "redundancy"],
    relatedResearchSlugs: ["extreme-arctic-svalbard", "northern-infrastructure-jokkmokk"],
    relatedKnowledgeSlugs: [
      "satellite-connectivity-resilience-scoring",
      "satellite-connectivity-arctic",
    ],
    en: {
      environment:
        "Pipeline corridors, wind/hydro SCADA outposts, environmental sensors, and unmanned Arctic stations — low-touch sites where a truck roll is expensive and winter access is limited.",
      requirements: [
        "High uptime for supervisory telemetry more than continuous HD video",
        "Power-efficient terminals and duty-cycled links",
        "Redundancy without requiring two power-hungry broadband kits",
        "Evidence trail for critical-entity readiness discussions — still not certification",
      ],
      challenges: [
        "Over-provisioning broadband LEO where narrowband would suffice wastes power and budget",
        "Single-path IoT satellite links fail silently until a maintenance window",
        "Extreme cold and icing degrade both solar and antenna performance",
        "Latitude still rules: GEO-only SCADA at 75°N is a research anti-pattern",
      ],
      technology: [
        "Polar/narrowband primary for SCADA-class traffic",
        "Optional LEO broadband bursts for maintenance windows and camera pulls",
        "Store-and-forward with local autonomy for non-critical samples",
        "Dual independent narrowband/LEO paths when the entity is critical",
      ],
      providers: [
        "Iridium-class and similar polar narrowband for continuous low-rate telemetry",
        "LEO broadband as scheduled overlay, not necessarily always-on primary",
        "GEO only where elevation and fixed mounts clearly allow",
        "Provider considerations remain catalog-based research notes",
      ],
      architecture:
        "Remote infrastructure research often inverts the consumer LEO default: start from power and uptime, choose narrowband-first architectures, then Signature whether a second path exists before any procurement conversation.",
    },
    fi: {
      environment:
        "Putkikäytävät, tuuli-/vesivoiman SCADA-asemat, ympäristöanturit ja miehittämättömät arktiset asemat — vähäkosketuksisia kohteita, joissa huoltokäynti on kallis ja talviauto on rajoitettua.",
      requirements: [
        "Korkea käytettävyys valvontalähetykseen enemmän kuin jatkuvaan HD-videoon",
        "Tehokkaat terminaalit ja vuorottaiset yhteydet",
        "Redundanssi ilman kahta tehosyöppöä laajakaistakittiä",
        "Näyttöpolku kriittisten toimijoiden valmiuskeskusteluihin — yhä ei sertifiointi",
      ],
      challenges: [
        "LEO-laajakaistan ylimitoitus, kun kapeakaista riittäisi, hukkaa tehoa ja budjettia",
        "Yhden polun IoT-satelliittiyhteydet hiljenevät, kunnes huoltoikkuna aukeaa",
        "Äärimmäinen kylmä ja jää heikentävät sekä aurinkoa että antennia",
        "Leveysaste hallitsee yhä: vain-GEO SCADA 75°N:ssä on tutkimuksen antipattern",
      ],
      technology: [
        "Polaarinen/kapeakaista primäärinä SCADA-luokan liikenteelle",
        "Valinnainen LEO-laajakaistan purske huoltoikkunoille ja kameravedoille",
        "Store-and-forward paikallisella autonomialla ei-kriittisille näytteille",
        "Kaksi itsenäistä kapeakaista/LEO-polkua, kun toimija on kriittinen",
      ],
      providers: [
        "Iridium-luokka ja vastaava polaarinen kapeakaista jatkuvaan matalan nopeuden telemetriaan",
        "LEO-laajakaista aikataulutettuna peittona, ei välttämättä always-on primäärinä",
        "GEO vain, kun elevaatio ja kiinteät asennukset selvästi sallivat",
        "Toimittajanäkökohdat pysyvät hakemistopohjaisina tutkimusmuistiinpanoina",
      ],
      architecture:
        "Etäisen infrastruktuurin tutkimus kääntää usein kuluttaja-LEO-oletuksen: aloita tehosta ja käytettävyydestä, valitse kapeakaista ensin -arkkitehtuurit, sitten Signature siitä onko toinen polku olemassa ennen mitään hankintakeskustelua.",
    },
  },
];

export function getAllMissionScenarios(): MissionScenario[] {
  return MISSION_SCENARIOS;
}

export function getMissionScenario(slug: string): MissionScenario | undefined {
  return MISSION_SCENARIOS.find((s) => s.slug === slug);
}

export function advisorHrefForScenario(s: MissionScenario): string {
  const p = new URLSearchParams();
  p.set("sector", s.advisorSector);
  if (s.suggestedPriorities.length) {
    p.set("priorities", s.suggestedPriorities.join(","));
  }
  return `/?${p.toString()}#advisor`;
}

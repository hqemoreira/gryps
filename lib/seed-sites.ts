// Synthesized-but-realistic Nordic/Arctic sites for the /signatures demonstration map.
// Coordinates are real Nordic/Arctic industrial regions; sites themselves are illustrative,
// not actual operators. Scores are NOT hand-picked — each site's resilience_signature is
// generated once by the same Mistral scoring model as the live Advisor (lib/scoring.ts),
// seeded via /api/seed-signatures, so grade spread emerges from the model, not from us.

export type SeedSite = {
  slug: string
  name: string
  lat: number
  lng: number
  sector: string
  autonomy_level: string
  operation_criticality: string
  current_setup: string
}

export const SEED_SITES: SeedSite[] = [
  { slug: "site-01-lapland-harvester-fleet", name: "Site 01 — Northern Lapland Harvesting Operation", lat: 68.2, lng: 27.4, sector: "forestry", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Starlink standard kit, no backup" },
  { slug: "site-02-norrbotten-mine", name: "Site 02 — Norrbotten Underground Mine", lat: 67.85, lng: 20.65, sector: "mining", autonomy_level: "remote-operated", operation_criticality: "high", current_setup: "Iridium Certus primary, terrestrial fiber where available" },
  { slug: "site-03-troms-fjord-platform", name: "Site 03 — Troms Offshore Aquaculture Platform", lat: 69.65, lng: 18.96, sector: "maritime", autonomy_level: "remote-operated", operation_criticality: "high", current_setup: "Inmarsat FleetBroadband, no LEO backup" },
  { slug: "site-04-inari-forestry-block", name: "Site 04 — Inari Forestry Block C", lat: 68.9, lng: 27.03, sector: "forestry", autonomy_level: "mixed", operation_criticality: "standard", current_setup: "Starlink + Iridium dual redundancy" },
  { slug: "site-05-kiruna-iron-mine", name: "Site 05 — Kiruna Iron Ore Extraction Zone", lat: 67.85, lng: 20.22, sector: "mining", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Single Starlink dish, no redundancy" },
  { slug: "site-06-finnmark-arctic-station", name: "Site 06 — Finnmark Arctic Research Station", lat: 70.98, lng: 25.97, sector: "arctic", autonomy_level: "manual", operation_criticality: "standard", current_setup: "Iridium Certus, satellite phone backup" },
  { slug: "site-07-lofoten-fishing-fleet", name: "Site 07 — Lofoten Fishing Fleet Coordination", lat: 68.15, lng: 13.6, sector: "maritime", autonomy_level: "remote-operated", operation_criticality: "high", current_setup: "VSAT + Iridium failover" },
  { slug: "site-08-rovaniemi-forestry-hub", name: "Site 08 — Rovaniemi Forestry Logistics Hub", lat: 66.5, lng: 25.73, sector: "forestry", autonomy_level: "mixed", operation_criticality: "standard", current_setup: "OneWeb primary, no failover configured" },
  { slug: "site-09-svalbard-outpost", name: "Site 09 — Svalbard Industrial Outpost", lat: 78.22, lng: 15.65, sector: "arctic", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Iridium only, high-latitude coverage gaps" },
  { slug: "site-10-vasterbotten-quarry", name: "Site 10 — Västerbotten Aggregate Quarry", lat: 64.75, lng: 20.26, sector: "mining", autonomy_level: "manual", operation_criticality: "standard", current_setup: "Terrestrial 4G with satellite backup" },
  { slug: "site-11-oulu-timber-yard", name: "Site 11 — Oulu Autonomous Timber Yard", lat: 65.01, lng: 25.47, sector: "forestry", autonomy_level: "autonomous", operation_criticality: "high", current_setup: "Starlink Business tier, single provider" },
  { slug: "site-12-hammerfest-lng-terminal", name: "Site 12 — Hammerfest LNG Terminal Monitoring", lat: 70.66, lng: 23.68, sector: "maritime", autonomy_level: "remote-operated", operation_criticality: "safety-critical", current_setup: "Dual VSAT + Iridium redundancy" },
  { slug: "site-13-gallivare-mine-fleet", name: "Site 13 — Gällivare Autonomous Haul Fleet", lat: 67.13, lng: 20.66, sector: "mining", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Single-provider LEO, no terrestrial fallback" },
  { slug: "site-14-sodankyla-forest-drone", name: "Site 14 — Sodankylä Forest Drone Survey Network", lat: 67.42, lng: 26.6, sector: "forestry", autonomy_level: "autonomous", operation_criticality: "standard", current_setup: "Starlink + local mesh backup" },
  { slug: "site-15-bodo-arctic-port", name: "Site 15 — Bodø Arctic Shipping Port", lat: 67.28, lng: 14.4, sector: "maritime", autonomy_level: "mixed", operation_criticality: "high", current_setup: "Fiber primary, satellite disaster backup" },
  { slug: "site-16-pajala-exploration", name: "Site 16 — Pajala Mineral Exploration Camp", lat: 67.21, lng: 23.37, sector: "mining", autonomy_level: "manual", operation_criticality: "standard", current_setup: "Iridium Certus, no terrestrial option" },
  { slug: "site-17-inari-reindeer-tracking", name: "Site 17 — Inari Reindeer Herd IoT Tracking", lat: 69.03, lng: 27.9, sector: "arctic", autonomy_level: "autonomous", operation_criticality: "standard", current_setup: "LoRaWAN + Iridium satellite uplink" },
  { slug: "site-18-narvik-ore-terminal", name: "Site 18 — Narvik Ore Export Terminal", lat: 68.44, lng: 17.43, sector: "mining", autonomy_level: "remote-operated", operation_criticality: "high", current_setup: "Terrestrial fiber, Starlink emergency backup" },
  { slug: "site-19-utsjoki-border-station", name: "Site 19 — Utsjoki Remote Monitoring Station", lat: 69.91, lng: 27.03, sector: "arctic", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Single Iridium modem, extreme latitude" },
  { slug: "site-20-lycksele-sawmill", name: "Site 20 — Lycksele Automated Sawmill Network", lat: 64.6, lng: 18.68, sector: "forestry", autonomy_level: "autonomous", operation_criticality: "standard", current_setup: "OneWeb + terrestrial redundancy" },
  { slug: "site-21-tromso-subsea-cable", name: "Site 21 — Tromsø Subsea Cable Monitoring Buoy", lat: 69.68, lng: 18.94, sector: "maritime", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Single satellite uplink, no redundancy" },
  { slug: "site-22-kittila-gold-mine", name: "Site 22 — Kittilä Gold Mine Autonomous Vehicles", lat: 67.66, lng: 24.9, sector: "mining", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Starlink + Iridium dual redundancy" },
  { slug: "site-23-alta-fjord-farm", name: "Site 23 — Alta Fjord Aquaculture Farm", lat: 69.97, lng: 23.27, sector: "maritime", autonomy_level: "remote-operated", operation_criticality: "high", current_setup: "VSAT primary, no backup" },
  { slug: "site-24-pello-forest-fire-watch", name: "Site 24 — Pello Forest Fire Watch Network", lat: 66.79, lng: 23.97, sector: "forestry", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Iridium + terrestrial LTE hybrid" },
  { slug: "site-25-jokkmokk-power-station", name: "Site 25 — Jokkmokk Hydro Power Monitoring", lat: 66.61, lng: 19.85, sector: "arctic", autonomy_level: "remote-operated", operation_criticality: "high", current_setup: "Fiber primary, satellite disaster recovery" },
  { slug: "site-26-vardo-radar-station", name: "Site 26 — Vardø Coastal Radar Station", lat: 70.37, lng: 31.1, sector: "arctic", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Single-provider GEO satellite, high latency" },
  { slug: "site-27-kemijarvi-pulp-mill", name: "Site 27 — Kemijärvi Pulp Mill Logistics", lat: 66.71, lng: 27.43, sector: "forestry", autonomy_level: "mixed", operation_criticality: "standard", current_setup: "Terrestrial 4G, no satellite backup" },
  { slug: "site-28-hamnoy-fishing-station", name: "Site 28 — Hamnøy Autonomous Fishing Station", lat: 67.93, lng: 13.08, sector: "maritime", autonomy_level: "autonomous", operation_criticality: "high", current_setup: "Starlink Maritime, single provider" },
  { slug: "site-29-malmberget-underground", name: "Site 29 — Malmberget Underground Mine Network", lat: 67.17, lng: 20.66, sector: "mining", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Leaky feeder + Iridium surface uplink" },
  { slug: "site-30-nuorgam-northernmost", name: "Site 30 — Nuorgam Northernmost Monitoring Post", lat: 70.08, lng: 27.83, sector: "arctic", autonomy_level: "manual", operation_criticality: "standard", current_setup: "Iridium satellite phone only" },
  // Iceland
  { slug: "site-31-straumsvik-aluminum-smelter", name: "Site 31 — Straumsvík Aluminum Smelter Grid", lat: 64.05, lng: -21.95, sector: "mining", autonomy_level: "autonomous", operation_criticality: "safety-critical", current_setup: "Starlink only, no redundancy" },
  { slug: "site-32-akureyri-fishing-fleet", name: "Site 32 — Akureyri Fishing Fleet Coordination", lat: 65.68, lng: -18.09, sector: "maritime", autonomy_level: "remote-operated", operation_criticality: "high", current_setup: "VSAT primary, Iridium backup" },
  { slug: "site-33-vestmannaeyjar-geothermal", name: "Site 33 — Vestmannaeyjar Geothermal Monitoring", lat: 63.44, lng: -20.27, sector: "arctic", autonomy_level: "manual", operation_criticality: "standard", current_setup: "Iridium Certus, satellite phone backup" },
]

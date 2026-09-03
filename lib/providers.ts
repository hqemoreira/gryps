export type ProviderCoverage = "full" | "improving" | "limited" | "planned" | "unsuitable"

export type IndexedProvider = {
  name: string
  operator: string
  orbit: "LEO" | "MEO" | "GEO"
  class: "broadband" | "narrowband" | "broadcast"
  coverage70N: ProviderCoverage
  coverageNote: string
  status: "operational" | "planned"
}

/** Curated public-knowledge index — not a live coverage database. */
export const INDEXED_PROVIDERS: IndexedProvider[] = [
  { name: "Starlink", operator: "SpaceX", orbit: "LEO", class: "broadband", coverage70N: "improving", coverageNote: "Polar shell expansion since 2023; not a substitute for polar-orbit narrowband.", status: "operational" },
  { name: "OneWeb", operator: "Eutelsat OneWeb", orbit: "LEO", class: "broadband", coverage70N: "full", coverageNote: "Polar-optimized inclination (~87.9°).", status: "operational" },
  { name: "Iridium Certus", operator: "Iridium", orbit: "LEO", class: "narrowband", coverage70N: "full", coverageNote: "True polar coverage including the geographic poles.", status: "operational" },
  { name: "Globalstar", operator: "Globalstar", orbit: "LEO", class: "narrowband", coverage70N: "limited", coverageNote: "Inclination leaves coverage gaps above ~70°N.", status: "operational" },
  { name: "Telesat Lightspeed", operator: "Telesat", orbit: "LEO", class: "broadband", coverage70N: "planned", coverageNote: "Not fully operational — treat as planned capacity.", status: "planned" },
  { name: "Project Kuiper", operator: "Amazon", orbit: "LEO", class: "broadband", coverage70N: "planned", coverageNote: "Not fully operational — treat as planned capacity.", status: "planned" },
  { name: "O3b mPOWER", operator: "SES", orbit: "MEO", class: "broadband", coverage70N: "limited", coverageNote: "MEO equatorial belt; high-latitude elevation is poor.", status: "operational" },
  { name: "Inmarsat FleetBroadband", operator: "Viasat / Inmarsat", orbit: "GEO", class: "narrowband", coverage70N: "limited", coverageNote: "GEO elevation degrades sharply above ~70°N.", status: "operational" },
  { name: "Inmarsat Global Xpress", operator: "Viasat / Inmarsat", orbit: "GEO", class: "broadband", coverage70N: "limited", coverageNote: "Ka-band GEO; unsuitable as sole primary above ~75°N.", status: "operational" },
  { name: "Viasat", operator: "Viasat", orbit: "GEO", class: "broadband", coverage70N: "limited", coverageNote: "Geostationary Ka/Ku; high-latitude elevation constraint.", status: "operational" },
  { name: "Intelsat", operator: "Intelsat", orbit: "GEO", class: "broadband", coverage70N: "limited", coverageNote: "GEO VSAT family; polar elevation constraint.", status: "operational" },
  { name: "Eutelsat", operator: "Eutelsat", orbit: "GEO", class: "broadband", coverage70N: "limited", coverageNote: "GEO; not polar-primary.", status: "operational" },
  { name: "SES", operator: "SES", orbit: "GEO", class: "broadband", coverage70N: "limited", coverageNote: "GEO fleet; high-latitude elevation constraint.", status: "operational" },
  { name: "Hughes", operator: "EchoStar / Hughes", orbit: "GEO", class: "broadband", coverage70N: "unsuitable", coverageNote: "Consumer GEO; not designed for Arctic industrial primary.", status: "operational" },
  { name: "Thuraya", operator: "Yahsat / Thuraya", orbit: "GEO", class: "narrowband", coverage70N: "unsuitable", coverageNote: "Regional GEO L-band; Arctic not in design coverage.", status: "operational" },
  { name: "Yahsat", operator: "Yahsat", orbit: "GEO", class: "broadband", coverage70N: "unsuitable", coverageNote: "Regional GEO; not a polar primary.", status: "operational" },
]

export const PROVIDER_INDEX_COUNT = INDEXED_PROVIDERS.length

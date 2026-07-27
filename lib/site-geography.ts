// Municipality/country lookup for the 33 EXISTING signature_sites coordinates only.
// This is a hardcoded, public-geographic-fact lookup — confirmed safe (not
// company-identifying) — and is deliberately scoped to these known sites, not a
// general-purpose reverse geocoder for arbitrary coordinates.
//
// Bittimittari (Traficom) is a FINNISH regulator dataset with zero coverage
// outside Finland. Of the 33 seed sites, only 11 sit in Finland; 8 are in
// Sweden, 11 in Norway, 3 in Iceland. Non-Finnish sites get `municipality: null`
// and rely on terrain-only real-data scoring — this is a real coverage
// limitation of the confirmed data source, not an oversight.
export type Country = "FI" | "SE" | "NO" | "IS"

export const SITE_GEOGRAPHY: Record<string, { municipality: string | null; country: Country }> = {
  "site-01-lapland-harvester-fleet":   { municipality: "Sodankylä", country: "FI" },
  "site-02-norrbotten-mine":           { municipality: null, country: "SE" },
  "site-03-troms-fjord-platform":      { municipality: null, country: "NO" },
  "site-04-inari-forestry-block":      { municipality: "Inari", country: "FI" },
  "site-05-kiruna-iron-mine":          { municipality: null, country: "SE" },
  "site-06-finnmark-arctic-station":   { municipality: null, country: "NO" },
  "site-07-lofoten-fishing-fleet":     { municipality: null, country: "NO" },
  "site-08-rovaniemi-forestry-hub":    { municipality: "Rovaniemi", country: "FI" },
  "site-09-svalbard-outpost":          { municipality: null, country: "NO" },
  "site-10-vasterbotten-quarry":       { municipality: null, country: "SE" },
  "site-11-oulu-timber-yard":          { municipality: "Oulu", country: "FI" },
  "site-12-hammerfest-lng-terminal":   { municipality: null, country: "NO" },
  "site-13-gallivare-mine-fleet":      { municipality: null, country: "SE" },
  "site-14-sodankyla-forest-drone":    { municipality: "Sodankylä", country: "FI" },
  "site-15-bodo-arctic-port":          { municipality: null, country: "NO" },
  "site-16-pajala-exploration":        { municipality: null, country: "SE" },
  "site-17-inari-reindeer-tracking":   { municipality: "Inari", country: "FI" },
  "site-18-narvik-ore-terminal":       { municipality: null, country: "NO" },
  "site-19-utsjoki-border-station":    { municipality: "Utsjoki", country: "FI" },
  "site-20-lycksele-sawmill":          { municipality: null, country: "SE" },
  "site-21-tromso-subsea-cable":       { municipality: null, country: "NO" },
  "site-22-kittila-gold-mine":         { municipality: "Kittilä", country: "FI" },
  "site-23-alta-fjord-farm":           { municipality: null, country: "NO" },
  "site-24-pello-forest-fire-watch":   { municipality: "Pello", country: "FI" },
  "site-25-jokkmokk-power-station":    { municipality: null, country: "SE" },
  "site-26-vardo-radar-station":       { municipality: null, country: "NO" },
  "site-27-kemijarvi-pulp-mill":       { municipality: "Kemijärvi", country: "FI" },
  "site-28-hamnoy-fishing-station":    { municipality: null, country: "NO" },
  "site-29-malmberget-underground":    { municipality: null, country: "SE" },
  "site-30-nuorgam-northernmost":      { municipality: "Utsjoki", country: "FI" }, // Nuorgam is a village within Utsjoki municipality
  "site-31-straumsvik-aluminum-smelter": { municipality: null, country: "IS" },
  "site-32-akureyri-fishing-fleet":    { municipality: null, country: "IS" },
  "site-33-vestmannaeyjar-geothermal": { municipality: null, country: "IS" },
}

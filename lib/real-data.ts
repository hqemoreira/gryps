import AdmZip from "adm-zip"

// ── Bittimittari (Traficom, CC BY 4.0) ──────────────────────────────────────
// IMPORTANT: the raw CSV includes a "VerkkoOperaattori" (network operator)
// column with real, named Finnish telecom operators (Elisa, Telia, etc).
// This module NEVER retains that column — it is not part of the parsed row
// type below, and is skipped entirely during parsing. Only municipality-wide
// medians across all operators combined are ever computed, stored, or
// returned. Do not add the operator field back without re-reading the
// constraint this was built under.

type BittimittariRow = { kunta: string; downloadMbps: number; latencyMs: number }

export type BittimittariMunicipalityStats = {
  period: string
  sampleCount: number
  medianDownloadMbps: number
  medianLatencyMs: number
}

async function getLatestBittimittariCsv(): Promise<{ period: string; rows: BittimittariRow[] }> {
  const discoveryRes = await fetch("https://opendata.traficom.fi/api/v13/Bittimittari")
  if (!discoveryRes.ok) throw new Error(`Bittimittari discovery failed: ${discoveryRes.status}`)
  const periods: { Kausi: string; Url: string }[] = await discoveryRes.json()
  const latest = periods[periods.length - 1]
  if (!latest) throw new Error("No Bittimittari periods found")

  const zipRes = await fetch(latest.Url)
  if (!zipRes.ok) throw new Error(`Bittimittari ZIP download failed: ${zipRes.status}`)
  const buf = Buffer.from(await zipRes.arrayBuffer())

  const zip = new AdmZip(buf)
  const entry = zip.getEntries()[0]
  const csvText = entry.getData().toString("latin1") // ISO8859-1 per Traficom's file description

  const lines = csvText.split("\n")
  const header = lines[0].split(";")
  const kuntaIdx = header.indexOf("Kunta")
  const downloadIdx = header.indexOf("Latausnopeus Mbit/s")
  const latencyIdx = header.indexOf("MediaaniViive ms")

  const rows: BittimittariRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const cols = line.split(";")
    const kunta = cols[kuntaIdx]?.trim()
    if (!kunta) continue // skip rows with no municipality (Wifi/browser tests without geolocation)
    const download = parseFloat(cols[downloadIdx]?.replace(",", "."))
    const latency = parseFloat(cols[latencyIdx]?.replace(",", "."))
    if (Number.isNaN(download) || Number.isNaN(latency)) continue
    rows.push({ kunta, downloadMbps: download, latencyMs: latency })
    // NOTE: VerkkoOperaattori column is never read into `rows` — intentional.
  }

  return { period: latest.Kausi, rows }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** Fetches the latest Bittimittari CSV once and computes per-municipality stats
 *  for every requested municipality — call once per batch, not once per site. */
export async function getBittimittariStatsForMunicipalities(
  municipalities: string[]
): Promise<Record<string, BittimittariMunicipalityStats | null>> {
  const { period, rows } = await getLatestBittimittariCsv()
  const result: Record<string, BittimittariMunicipalityStats | null> = {}

  for (const muni of municipalities) {
    const matched = rows.filter(r => r.kunta === muni)
    if (matched.length === 0) {
      result[muni] = null
      continue
    }
    result[muni] = {
      period,
      sampleCount: matched.length,
      medianDownloadMbps: median(matched.map(r => r.downloadMbps)),
      medianLatencyMs: median(matched.map(r => r.latencyMs)),
    }
  }

  return result
}

// ── Elevation / terrain (OpenTopoData, eudem25m — Copernicus/EEA) ──────────
// EU-DEM has occasional gaps (typically over water/fjords) where a sample
// point legitimately returns null instead of a number — both fields here are
// nullable rather than coerced to 0, so a data gap renders as "not available"
// instead of a fabricated terrain reading.
export type ElevationSample = { elevationCenterM: number | null; elevationVarianceM: number | null }

/** Builds a 5-point cross sample (center + N/S/E/W ~5km offsets) per coordinate.
 *  Offsets are a fixed ~0.045° (lat) and a longitude offset scaled by cos(lat)
 *  to approximate the same ground distance east-west at high latitudes. */
function sampleOffsets(lat: number, lng: number): { lat: number; lng: number }[] {
  const dLat = 0.045
  const dLng = 0.045 / Math.cos((lat * Math.PI) / 180)
  return [
    { lat, lng },
    { lat: lat + dLat, lng },
    { lat: lat - dLat, lng },
    { lat, lng: lng + dLng },
    { lat, lng: lng - dLng },
  ]
}

/** Fetches elevation samples for many sites in as few requests as possible
 *  (OpenTopoData allows up to 100 locations/request). Returns one
 *  ElevationSample per input coordinate, in the same order. */
export async function getElevationSamples(
  coords: { lat: number; lng: number }[]
): Promise<ElevationSample[]> {
  const allPoints = coords.flatMap(c => sampleOffsets(c.lat, c.lng))
  const BATCH = 100
  const elevations: (number | null)[] = []

  for (let i = 0; i < allPoints.length; i += BATCH) {
    const batch = allPoints.slice(i, i + BATCH)
    const locations = batch.map(p => `${p.lat},${p.lng}`).join("|")
    const res = await fetch(`https://api.opentopodata.org/v1/eudem25m?locations=${locations}`)
    if (!res.ok) throw new Error(`OpenTopoData failed: ${res.status}`)
    const data = await res.json()
    for (const r of data.results) elevations.push(r.elevation)
    // Public instance allows 1 call/sec — pace ourselves since we may issue >1 batch.
    if (i + BATCH < allPoints.length) await new Promise(r => setTimeout(r, 1100))
  }

  const samples: ElevationSample[] = []
  for (let i = 0; i < coords.length; i++) {
    const group = elevations.slice(i * 5, i * 5 + 5)
    const valid = group.filter((v): v is number => v != null)
    let variance: number | null = null
    if (valid.length >= 2) {
      const mean = valid.reduce((a, b) => a + b, 0) / valid.length
      variance = Math.sqrt(valid.reduce((a, b) => a + (b - mean) ** 2, 0) / valid.length)
    } else if (valid.length === 1) {
      variance = 0
    }
    samples.push({ elevationCenterM: group[0], elevationVarianceM: variance })
  }
  return samples
}

// ── Deterministic scoring ────────────────────────────────────────────────────
// All sub-scores are 0-100, higher = better (less risk) — consistent direction
// with the rest of the app's scoring language.

export function scoreRealWorldGap(stats: BittimittariMunicipalityStats): number {
  const speedScore = Math.max(0, Math.min(100, stats.medianDownloadMbps))
  const latencyScore = Math.max(0, Math.min(100, 100 - stats.medianLatencyMs))
  return Math.round(0.6 * speedScore + 0.4 * latencyScore)
}

export function scoreTerrainPenalty(sample: ElevationSample): number | null {
  // ~50m of elevation variance within the 5km sample cross maps to 0 (heavily
  // rugged terrain — significant line-of-sight obstruction risk for satellite/
  // fixed-wireless links); 0m variance (flat) maps to 100. Null when EU-DEM
  // had a data gap across the whole sample (e.g. open water) — no penalty is
  // fabricated in that case.
  if (sample.elevationVarianceM == null) return null
  return Math.max(0, Math.min(100, Math.round(100 - sample.elevationVarianceM * 2)))
}

export type RealDataScore = {
  municipality: string | null
  country: string
  bittimittari: BittimittariMunicipalityStats | null
  elevation: ElevationSample
  realWorldGapScore: number | null
  terrainPenaltyScore: number
  realDataScore: number
}

/**
 * Pull Google Search Console Search Analytics → seo/gsc-latest.json
 *
 * Usage: npm run seo:gsc
 * Env: see scripts/seo/README.md
 */
import {
  daysAgoIso,
  loadGoogleCredentials,
  parseArgs,
  repoRelative,
  requireSiteUrl,
  todayIso,
  writeJson,
} from "./lib"
import { applyGscDefaults, loadSeoEnvFile } from "./env"

type GscRow = {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

type MetricRow = {
  key: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

type Opportunity = MetricRow & {
  reason: string
  score: number
}

async function main() {
  loadSeoEnvFile()
  applyGscDefaults()
  const args = parseArgs(process.argv.slice(2))
  const days = Number(args.days ?? process.env.GSC_DAYS ?? 28)
  const rowLimit = Number(args.limit ?? process.env.GSC_ROW_LIMIT ?? 250)
  const siteUrl = requireSiteUrl()
  const endDate = todayIso()
  const startDate = daysAgoIso(days)
  const prevEnd = daysAgoIso(days)
  const prevStart = daysAgoIso(days * 2)

  const { google } = await import("googleapis")
  const auth = new google.auth.GoogleAuth({
    credentials: loadGoogleCredentials(),
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  })
  const searchconsole = google.searchconsole({ version: "v1", auth })

  async function query(dimensions: string[], range: { startDate: string; endDate: string }) {
    const res = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: range.startDate,
        endDate: range.endDate,
        dimensions,
        rowLimit,
        dataState: "final",
      },
    })
    return (res.data.rows ?? []) as GscRow[]
  }

  function toMetrics(rows: GscRow[]): MetricRow[] {
    return rows.map((r) => ({
      key: (r.keys ?? []).join(" · ") || "(unknown)",
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    }))
  }

  console.log(`GSC pull · site=${siteUrl} · ${startDate} → ${endDate}`)

  const [queries, pages, queryPage, prevQueries] = await Promise.all([
    query(["query"], { startDate, endDate }),
    query(["page"], { startDate, endDate }),
    query(["query", "page"], { startDate, endDate }),
    query(["query"], { startDate: prevStart, endDate: prevEnd }),
  ])

  const queryMetrics = toMetrics(queries)
  const pageMetrics = toMetrics(pages)
  const prevMap = new Map(toMetrics(prevQueries).map((r) => [r.key, r]))

  const risingImpressions = queryMetrics
    .map((row) => {
      const prev = prevMap.get(row.key)
      const prevImp = prev?.impressions ?? 0
      const delta = row.impressions - prevImp
      const lift = prevImp > 0 ? delta / prevImp : row.impressions > 0 ? 1 : 0
      return { ...row, prevImpressions: prevImp, impressionDelta: delta, impressionLift: lift }
    })
    .filter((r) => r.impressions >= 20 && (r.impressionLift >= 0.25 || r.impressionDelta >= 30))
    .sort((a, b) => b.impressionDelta - a.impressionDelta)
    .slice(0, 40)

  const opportunities: Opportunity[] = queryMetrics
    .filter((r) => r.impressions >= 30 && r.position >= 8 && r.position <= 30)
    .map((r) => {
      const weakPos = Math.min(1, (r.position - 7) / 15)
      const volume = Math.min(1, Math.log10(r.impressions + 1) / 4)
      const lowCtr = r.ctr < 0.05 ? 0.25 : 0
      const score = Number((weakPos * 0.45 + volume * 0.45 + lowCtr).toFixed(3))
      return {
        ...r,
        score,
        reason:
          r.position >= 8 && r.position <= 20
            ? "Impressions with weak position (page-2 / deep page-1 opportunity)"
            : "Visible impressions outside top results — content or intent gap",
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)

  const payload = {
    pulledAt: new Date().toISOString(),
    siteUrl,
    range: { startDate, endDate, days },
    previousRange: { startDate: prevStart, endDate: prevEnd },
    totals: {
      queryRows: queryMetrics.length,
      pageRows: pageMetrics.length,
      queryPageRows: queryPage.length,
      opportunityCount: opportunities.length,
      risingCount: risingImpressions.length,
    },
    topQueries: queryMetrics.slice(0, 50),
    topPages: pageMetrics.slice(0, 50),
    queryPage: toMetrics(queryPage).slice(0, 100),
    risingImpressions,
    opportunities,
    notes: [
      "Not live RF / not product UI — ops SEO feed for issue #3 knowledge pages.",
      "Opportunities = high-ish impressions + position 8–30 (tune thresholds in pull-gsc.ts).",
      "Feed this file to: npm run seo:propose",
    ],
  }

  const out = writeJson("gsc-latest.json", payload)
  console.log(`Wrote ${repoRelative(out)}`)
  console.log(
    `Queries=${payload.totals.queryRows} · Pages=${payload.totals.pageRows} · Opportunities=${payload.totals.opportunityCount} · Rising=${payload.totals.risingCount}`,
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})

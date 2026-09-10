/**
 * Keyword Planner pull — scaffold until Google Ads developer token is approved.
 *
 * Usage: npm run seo:planner -- --topic "arctic satellite connectivity"
 * Env: see scripts/seo/README.md
 */
import { parseArgs, repoRelative, writeJson } from "./lib"

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const topic = String(args.topic ?? args.t ?? "").trim()
  if (!topic) {
    throw new Error('Pass --topic "your seed theme" (e.g. --topic "arctic satellite connectivity").')
  }

  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)

  const token = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim()
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.trim()

  if (!token || !customerId) {
    const stub = {
      pulledAt: new Date().toISOString(),
      status: "awaiting_ads_credentials",
      topic,
      message:
        "Keyword Planner API is not connected yet. Set GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_CUSTOMER_ID (see scripts/seo/README.md). Until then, paste Planner CSV ideas into seo/planner-manual-{topic}.json or use GSC opportunities alone.",
      expectedShape: {
        topic: "string",
        keywords: [
          {
            text: "satellite connectivity arctic",
            avgMonthlySearches: 0,
            competition: "LOW|MEDIUM|HIGH",
            competitionIndex: 0,
            lowTopOfPageBidMicros: 0,
            highTopOfPageBidMicros: 0,
          },
        ],
      },
      nextSteps: [
        "Apply for Google Ads API developer token (test → production).",
        "OAuth / refresh token with ads scope.",
        "Implement KeywordPlanIdeaService generateKeywordIdeas in this script.",
        "Re-run: npm run seo:planner -- --topic \"" + topic + "\"",
      ],
    }
    const out = writeJson(`planner-${slug}.json`, stub)
    console.log(`Stub written → ${repoRelative(out)}`)
    console.log("Missing GOOGLE_ADS_DEVELOPER_TOKEN and/or GOOGLE_ADS_CUSTOMER_ID.")
    process.exitCode = 0
    return
  }

  // Production path placeholder — keep deterministic until Ads client is wired.
  throw new Error(
    "Ads credentials detected, but KeywordPlanIdeaService client is not implemented yet. Track in the SEO pipeline GitHub issue — scaffold stops here intentionally.",
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})

/**
 * Format seo/proposals-latest.json (+ gsc totals) for a GitHub issue comment.
 * Usage: npx tsx scripts/seo/format-weekly-comment.ts
 */
import { readJson } from "./lib"

type Proposal = {
  rank: number
  primaryKeyword: string
  source: string
  phase: string
  suggestedSlug: string
}

type Proposals = {
  generatedAt?: string
  gscPulledAt?: string
  siteUrl?: string
  earlyStage?: boolean
  proposals?: Proposal[]
}

type Gsc = {
  totals?: {
    queryRows?: number
    pageRows?: number
    opportunityCount?: number
    risingCount?: number
  }
  range?: { startDate?: string; endDate?: string }
}

function main() {
  const proposals = readJson<Proposals>("proposals-latest.json")
  const gsc = readJson<Gsc>("gsc-latest.json")
  if (!proposals) {
    console.error("Missing seo/proposals-latest.json")
    process.exit(1)
  }

  const lines: string[] = []
  lines.push("## Weekly SEO pull")
  lines.push("")
  lines.push(`- **Site:** ${proposals.siteUrl ?? "—"}`)
  lines.push(`- **GSC pulled:** ${proposals.gscPulledAt ?? "—"}`)
  lines.push(`- **Proposals generated:** ${proposals.generatedAt ?? "—"}`)
  if (gsc?.range) {
    lines.push(`- **Range:** ${gsc.range.startDate ?? "?"} → ${gsc.range.endDate ?? "?"}`)
  }
  if (gsc?.totals) {
    lines.push(
      `- **Totals:** queries=${gsc.totals.queryRows ?? 0} · pages=${gsc.totals.pageRows ?? 0} · opportunities=${gsc.totals.opportunityCount ?? 0} · rising=${gsc.totals.risingCount ?? 0}`,
    )
  }
  if (proposals.earlyStage) {
    lines.push("- **Mode:** early-stage fallback (thin GSC volume)")
  }
  lines.push("")
  lines.push("### Proposals")
  lines.push("")
  const list = proposals.proposals ?? []
  if (list.length === 0) {
    lines.push("_No proposals this week._")
  } else {
    for (const p of list) {
      lines.push(
        `${p.rank}. **${p.primaryKeyword}** — \`${p.suggestedSlug}\` · ${p.phase} · ${p.source}`,
      )
    }
  }
  lines.push("")
  lines.push("### Agent follow-up")
  lines.push("")
  lines.push(
    "From `seo/gsc-latest.json` and `seo/proposals-latest.json`, propose or update knowledge pages for issue #3. Prefer real opportunities over entity seeds when volume grows. Artifacts attached to this workflow run.",
  )
  lines.push("")
  lines.push("_Automated by `.github/workflows/seo-weekly.yml`._")

  process.stdout.write(lines.join("\n"))
}

main()

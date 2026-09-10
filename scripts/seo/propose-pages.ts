/**
 * Rank next knowledge-page candidates from GSC (+ optional Planner JSON).
 *
 * Usage: npm run seo:propose
 * Then paste seo/proposals-latest.json into an agent with the prompt in scripts/seo/README.md
 */
import { readdirSync, existsSync } from "node:fs"
import { SEO_DIR, parseArgs, readJson, repoRelative, writeJson } from "./lib"

type MetricRow = {
  key: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

type Opportunity = MetricRow & { reason: string; score: number }

type GscPayload = {
  pulledAt: string
  siteUrl: string
  opportunities?: Opportunity[]
  risingImpressions?: (MetricRow & { impressionDelta?: number })[]
  topQueries?: MetricRow[]
}

type PlannerKeyword = {
  text: string
  avgMonthlySearches?: number
  competition?: string
  competitionIndex?: number
}

type PlannerPayload = {
  topic?: string
  status?: string
  keywords?: PlannerKeyword[]
}

type Proposal = {
  rank: number
  primaryKeyword: string
  source: "gsc_opportunity" | "gsc_rising" | "gsc_seed" | "planner" | "blend" | "entity_seed"
  suggestedSlug: string
  phase: "2-knowledge" | "3-discovery"
  rationale: string
  signals: Record<string, number | string>
  outlineSeed: string[]
  internalLinks: string[]
}

/** Issue #3 Phase 2/3 starters when GSC volume is still too thin for opportunity thresholds. */
const ENTITY_SEEDS: { keyword: string; phase: Proposal["phase"]; rationale: string }[] = [
  {
    keyword: "satellite connectivity arctic",
    phase: "3-discovery",
    rationale: "Entity seed — Arctic remote-ops discoverability (issue #3 Phase 3).",
  },
  {
    keyword: "LEO vs MEO vs GEO remote operations",
    phase: "2-knowledge",
    rationale: "Entity seed — methodology-backed orbital trade-offs (issue #3 Phase 2).",
  },
  {
    keyword: "forestry satellite connectivity Finland",
    phase: "3-discovery",
    rationale: "Entity seed — sector × geography page; aligns with early GSC query forestry logistics.",
  },
  {
    keyword: "satellite connectivity resilience scoring",
    phase: "2-knowledge",
    rationale: "Entity seed — Resilience Signature / Advisor intent.",
  },
  {
    keyword: "Starlink Arctic coverage limitations",
    phase: "2-knowledge",
    rationale: "Entity seed — honest intelligence page (not reseller); deep-link Advisor + map.",
  },
]

function isBrandOnlyQuery(q: string): boolean {
  const k = q.trim().toLowerCase()
  return /^(gryps|gryps on|gryps-computer|gryps computer)(\s|$)/.test(k) || k === "gryps"
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
}

function guessPhase(keyword: string): Proposal["phase"] {
  const k = keyword.toLowerCase()
  if (
    /\b(lapland|arctic|finland|iceland|nordic|forestry|mining|maritime|svalbard|greenland)\b/.test(k) ||
    /\b(vs|versus|compare|comparison)\b/.test(k)
  ) {
    return "3-discovery"
  }
  return "2-knowledge"
}

function loadLatestPlanner(): { file: string; data: PlannerPayload } | null {
  if (!existsSync(SEO_DIR)) return null
  const files = readdirSync(SEO_DIR)
    .filter((f) => f.startsWith("planner-") && f.endsWith(".json") && !f.includes("manual-example"))
    .sort()
  if (files.length === 0) return null
  const file = files[files.length - 1]
  const data = readJson<PlannerPayload>(file)
  if (!data) return null
  return { file, data }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const limit = Number(args.limit ?? 5)

  const gsc = readJson<GscPayload>("gsc-latest.json")
  if (!gsc) {
    throw new Error("Missing seo/gsc-latest.json — run npm run seo:gsc first (or copy seo/gsc-example.json).")
  }

  const plannerPack = loadLatestPlanner()
  const plannerKeywords = (plannerPack?.data.keywords ?? []).filter((k) => k.text)

  const byKeyword = new Map<string, Proposal>()

  for (const opp of gsc.opportunities ?? []) {
    const primary = opp.key
    byKeyword.set(primary, {
      rank: 0,
      primaryKeyword: primary,
      source: "gsc_opportunity",
      suggestedSlug: slugify(primary),
      phase: guessPhase(primary),
      rationale: opp.reason,
      signals: {
        impressions: opp.impressions,
        position: Number(opp.position.toFixed(1)),
        ctr: Number((opp.ctr * 100).toFixed(2)),
        opportunityScore: opp.score,
      },
      outlineSeed: [
        `Q: What is ${primary}?`,
        "Short answer (AEO-friendly, 2–4 sentences)",
        "Evidence / how GRYPS models it (Model v0.3)",
        "CTA → Capacity map + Advisor",
      ],
      internalLinks: ["/methodology", "/map", "/#advisor", "/providers"],
    })
  }

  for (const rise of gsc.risingImpressions ?? []) {
    const existing = byKeyword.get(rise.key)
    if (existing) {
      existing.source = "blend"
      existing.signals.impressionDelta = rise.impressionDelta ?? 0
      existing.rationale += " · Rising impressions vs prior window."
      continue
    }
    byKeyword.set(rise.key, {
      rank: 0,
      primaryKeyword: rise.key,
      source: "gsc_rising",
      suggestedSlug: slugify(rise.key),
      phase: guessPhase(rise.key),
      rationale: "Impressions rising vs previous period — capture with a dedicated knowledge page before competitors.",
      signals: {
        impressions: rise.impressions,
        position: Number(rise.position.toFixed(1)),
        impressionDelta: rise.impressionDelta ?? 0,
      },
      outlineSeed: [
        `Q: ${rise.key}`,
        "Short answer",
        "Nordic/Arctic operational context",
        "CTA → map + Advisor",
      ],
      internalLinks: ["/map", "/methodology", "/#advisor"],
    })
  }

  for (const kw of plannerKeywords) {
    const volume = kw.avgMonthlySearches ?? 0
    const competition = (kw.competition ?? "").toUpperCase()
    const existing = byKeyword.get(kw.text)
    if (existing) {
      existing.source = "blend"
      existing.signals.avgMonthlySearches = volume
      existing.signals.competition = competition || "UNKNOWN"
      existing.rationale += " · Also present in Keyword Planner export."
      continue
    }
    // Prefer lower competition + some volume when we only have Planner
    if (volume < 10 && competition === "HIGH") continue
    byKeyword.set(kw.text, {
      rank: 0,
      primaryKeyword: kw.text,
      source: "planner",
      suggestedSlug: slugify(kw.text),
      phase: guessPhase(kw.text),
      rationale: "Keyword Planner candidate — validate against GRYPS entity positioning (intelligence, not reseller).",
      signals: {
        avgMonthlySearches: volume,
        competition: competition || "UNKNOWN",
        competitionIndex: kw.competitionIndex ?? 0,
      },
      outlineSeed: [
        `Primary keyword: ${kw.text}`,
        "Define problem for remote ops",
        "LEO/MEO/GEO trade-offs (honest)",
        "CTA → Advisor",
      ],
      internalLinks: ["/providers", "/methodology", "/#advisor"],
    })
  }

  // Early-stage fallback: any non-brand GSC query (site still below opportunity thresholds)
  if (byKeyword.size === 0) {
    for (const row of gsc.topQueries ?? []) {
      if (isBrandOnlyQuery(row.key)) continue
      byKeyword.set(row.key, {
        rank: 0,
        primaryKeyword: row.key,
        source: "gsc_seed",
        suggestedSlug: slugify(row.key),
        phase: guessPhase(row.key),
        rationale:
          "Early GSC seed — below opportunity thresholds (low impressions). Use as a topic hint, not proof of demand.",
        signals: {
          impressions: row.impressions,
          position: Number(row.position.toFixed(1)),
          ctr: Number((row.ctr * 100).toFixed(2)),
        },
        outlineSeed: [
          `Q: ${row.key}`,
          "Short answer (AEO-friendly)",
          "Nordic/Arctic ops context + Model v0.3 framing",
          "CTA → /map + /#advisor",
        ],
        internalLinks: ["/map", "/methodology", "/#advisor"],
      })
    }
  }

  // Fill remaining slots with curated issue #3 entity seeds
  for (const seed of ENTITY_SEEDS) {
    if (byKeyword.size >= limit) break
    if (byKeyword.has(seed.keyword)) continue
    byKeyword.set(seed.keyword, {
      rank: 0,
      primaryKeyword: seed.keyword,
      source: "entity_seed",
      suggestedSlug: slugify(seed.keyword),
      phase: seed.phase,
      rationale: seed.rationale,
      signals: { seed: 1 },
      outlineSeed: [
        `Primary keyword: ${seed.keyword}`,
        "Q → short answer → evidence → Advisor CTA",
        "Honest limitations (not live RF / not reseller)",
      ],
      internalLinks: ["/methodology", "/map", "/#advisor", "/providers"],
    })
  }

  const scored = [...byKeyword.values()]
    .map((p) => {
      const imp = Number(p.signals.impressions ?? 0)
      const pos = Number(p.signals.position ?? 20)
      const opp = Number(p.signals.opportunityScore ?? 0)
      const vol = Number(p.signals.avgMonthlySearches ?? 0)
      const delta = Number(p.signals.impressionDelta ?? 0)
      const entityBoost = p.source === "entity_seed" ? 5 : 0
      const rankScore =
        opp * 40 +
        Math.min(30, Math.log10(imp + 1) * 10) +
        (pos >= 8 && pos <= 20 ? 15 : 0) +
        Math.min(20, Math.log10(vol + 1) * 8) +
        Math.min(15, delta / 10) +
        entityBoost
      return { ...p, _rankScore: rankScore }
    })
    .sort((a, b) => b._rankScore - a._rankScore)
    .slice(0, limit)
    .map((p, i) => {
      const { _rankScore, ...rest } = p
      return { ...rest, rank: i + 1, signals: { ...rest.signals, rankScore: Number(_rankScore.toFixed(2)) } }
    })

  const early =
    (gsc.opportunities?.length ?? 0) === 0 && (gsc.risingImpressions?.length ?? 0) === 0

  const payload = {
    generatedAt: new Date().toISOString(),
    gscPulledAt: gsc.pulledAt,
    siteUrl: gsc.siteUrl,
    plannerFile: plannerPack?.file ?? null,
    earlyStage: early,
    limit,
    proposals: scored,
    agentPrompt: [
      "From seo/gsc-latest.json and seo/proposals-latest.json (and seo/planner-*.json if present),",
      "propose the next 5 knowledge pages for issue #3 Phase 2/3.",
      "Prefer high-impression weak-position queries, geography/sector topics for Nordic/Arctic satellite connectivity,",
      "and pages that deep-link to /map and /#advisor.",
      "If earlyStage is true, treat gsc_seed / entity_seed as editorial backlog — not proven demand.",
      "Output: slug, H1, primary keyword, intent, outline, internal links. No thin AI spam.",
      "GRYPS = satellite connectivity intelligence — not a connectivity reseller.",
    ].join(" "),
  }

  const out = writeJson("proposals-latest.json", payload)
  console.log(`Wrote ${repoRelative(out)} (${scored.length} proposals)${early ? " [early-stage fallback]" : ""}`)
  for (const p of scored) {
    console.log(`  ${p.rank}. [${p.phase}] ${p.primaryKeyword} (${p.source})`)
  }
  if (!plannerPack) {
    console.log("Note: no planner-*.json found — proposals are GSC/entity seeds only.")
  }
}

main()

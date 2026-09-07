/**
 * Run: npx --yes tsx scripts/verify-deterministic.ts
 */
import { assertSanityCases, scoreDeterministic } from "../lib/deterministic-score"

assertSanityCases()

const samples = [
  scoreDeterministic({
    lat: 71, sector: "maritime", providers: ["inmarsat"],
    autonomy: "remote-operated", criticality: "safety-critical",
  }),
  scoreDeterministic({
    lat: 65, sector: "mining", providers: ["oneweb", "iridium"],
    autonomy: "autonomous", criticality: "safety-critical",
  }),
  scoreDeterministic({
    lat: 68, sector: "forestry", providers: ["starlink"],
    autonomy: "autonomous", criticality: "safety-critical", elevation_m: 200,
  }),
  scoreDeterministic({
    lat: 60, sector: "research", providers: ["starlink", "oneweb", "iridium"],
    autonomy: "manual", criticality: "standard",
  }),
]

for (const s of samples) {
  console.log(`${s.resilience_signature.score} · ${s.resilience_signature.grade} — ${s.resilience_signature.summary}`)
}
console.log("All deterministic sanity cases passed.")

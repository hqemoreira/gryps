/**
 * Lightweight keyword retrieval over curated GRYPS materials.
 * Not a vector store — enough for Mimir v1 containment on Advisor pages.
 */

import { ADVISOR_PROVIDERS } from "@/lib/deterministic-score";
import { GRADE_BANDS_SUMMARY, SCORING_ENGINE_DISPLAY, SCORING_MODEL_LABEL } from "@/lib/model-constants";
import { RESEARCH_LIBRARY } from "@/lib/research-library";

export type RetrievalChunk = {
  id: string;
  title: string;
  text: string;
  source: string;
};

const STATIC_CHUNKS: RetrievalChunk[] = [
  {
    id: "model-layers",
    title: "Two-layer Signature (Model v0.4)",
    source: "/methodology",
    text: `${SCORING_MODEL_LABEL} (${SCORING_ENGINE_DISPLAY}) scores Site Conditions (0–20, fixed: latitude band + forestry elevation demerit) and Mitigation Quality (0–80: redundancy/independent paths 0–35, provider/path independence 0–25, profile–autonomy alignment 0–20). Composite = Conditions + Mitigation, then hard caps. Points earned, higher = better. Labels translate (e.g. 8/20 Conditions → harsh). Grades: ${GRADE_BANDS_SUMMARY}.`,
  },
  {
    id: "independent-path",
    title: "Independent path definition",
    source: "/methodology",
    text: "An independent connectivity path requires at least one of: different orbit class (LEO/MEO/GEO), different ground segment / ground-station network, or different failure mode (e.g. fiber cut vs satellite rain fade). Two terminals on the same constellation count as one path.",
  },
  {
    id: "hard-caps",
    title: "Hard caps",
    source: "/methodology",
    text: "Safety-critical + autonomous + fewer than 2 providers → score capped at 50. Safety-critical + exactly 1 provider → capped at 60. Latitude above 72°N with GEO-only providers → capped at 45.",
  },
  {
    id: "evidence-excluded",
    title: "Evidence context excluded from score",
    source: "/methodology",
    text: "EU-DEM terrain, weather notes, and infrastructure reach are adjacent evidence. They are not blended into the 0–100 Resilience Signature. Confidence ranges derive from the evidence package confidence band (High ±3, Medium ±6, Low ±10) with a provenance label (catalog vs operator-reported).",
  },
  {
    id: "priorities",
    title: "Mission priorities",
    source: "/methodology",
    text: "Mission priorities re-rank backup recommendations only. They never change the Signature score, grade, or layer points.",
  },
  {
    id: "ai-disclosure",
    title: "AI vs deterministic scoring",
    source: "/terms",
    text: "Scores are computed by a deterministic model. Optional AI-assisted interpretation may polish recommendation wording when the user opts in. Mimir is an AI chatbot that explains results — it does not produce scores.",
  },
  {
    id: "form-guide",
    title: "Assessment form guide",
    source: "/#advisor",
    text: "Assessment inputs: site coordinates (Nordic/Arctic/Iceland envelope), sector, current providers, autonomy level (manual / remote-operated / mixed / autonomous), operation criticality (standard / high / safety-critical), and up to three mission priorities. Generate Resilience Signature runs Model v0.4.",
  },
  {
    id: "latitude-context",
    title: "Latitude context for grades",
    source: "/methodology",
    text: "A D grade at 68°N often reflects harsh Site Conditions plus weak Mitigation (e.g. single provider). A D at 60°N usually means Mitigation is weak despite milder Conditions — operator choices matter more. Always read both layers, never the composite alone.",
  },
];

function providerChunks(): RetrievalChunk[] {
  return ADVISOR_PROVIDERS.filter((p) => p.id !== "none").map((p) => ({
    id: `provider-${p.id}`,
    title: `${p.name} (catalog)`,
    source: "/providers",
    text: `${p.name}: ${p.orbit} ${p.class}. Catalog confidence ${p.confidence} (assessment/data basis, not availability %). Aliases: ${p.aliases.join(", ")}. GEO service is latitude-degraded in the model above ~70°N.`,
  }));
}

function researchChunks(): RetrievalChunk[] {
  return RESEARCH_LIBRARY.slice(0, 12).map((e) => ({
    id: `research-${e.slug}`,
    title: e.title,
    source: `/research/${e.slug}`,
    text: `${e.title}. ${e.locationLabel}. ${e.context}`,
  }));
}

let corpus: RetrievalChunk[] | null = null;

function getCorpus(): RetrievalChunk[] {
  if (!corpus) corpus = [...STATIC_CHUNKS, ...providerChunks(), ...researchChunks()];
  return corpus;
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9äöå°/+. -]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/** Rank chunks by keyword overlap. Returns top K and a simple confidence. */
export function retrieveChunks(
  query: string,
  k = 4
): { chunks: RetrievalChunk[]; confidence: "high" | "medium" | "low" } {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return { chunks: STATIC_CHUNKS.slice(0, 2), confidence: "low" };
  }

  const scored = getCorpus()
    .map((chunk) => {
      const hay = `${chunk.title} ${chunk.text}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (hay.includes(t)) score += t.length > 5 ? 2 : 1;
      }
      return { chunk, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, k).map((s) => s.chunk);
  const best = scored[0]?.score ?? 0;
  const confidence: "high" | "medium" | "low" =
    best >= 6 && top.length >= 2 ? "high" : best >= 3 ? "medium" : "low";

  return { chunks: top, confidence };
}

export function formatRetrievalContext(
  chunks: RetrievalChunk[],
  confidence: "high" | "medium" | "low"
): string {
  if (chunks.length === 0 || confidence === "low") {
    return "RETRIEVAL_CONFIDENCE: low\nNo strong matches. Prefer the refusal: That's not in my materials — see the Methodology page or contact the GRYPS team.";
  }
  const body = chunks
    .map((c, i) => `[${i + 1}] ${c.title} (${c.source})\n${c.text}`)
    .join("\n\n");
  return `RETRIEVAL_CONFIDENCE: ${confidence}\n\nRETRIEVED MATERIALS:\n${body}`;
}

/**
 * Focused checks for Sprint 10–11 Dependency Research Lab.
 * Does not calculate a fixture-derived Signature.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEPENDENCY_LAB_FIXTURE_CONTEXT_NOTICE,
  DEPENDENCY_LAB_SIGNATURE_NOTICE,
  REFERENCE_SIGNATURE_LABEL,
  RESEARCH_SCENARIO_LABEL,
  UNKNOWN_RELATIONSHIP_COPY,
  buildLayerViews,
  contradictedRelationships,
  fixtureHasContradiction,
  fixtureHasPositiveSeparation,
  fixtureHasSharedFailureDomain,
  getDependencyFixture,
  isSyntheticFixture,
  listFixtureIds,
  separationRelationships,
  type FixtureId,
} from "../lib/research/dependency-fixtures";
import { HERO_DEMO_GRADE, HERO_DEMO_INPUT, HERO_DEMO_SCORE } from "../lib/hero-demo";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

const EXPECTED_CONCLUSIONS: Record<FixtureId, string> = {
  "fixture-a-starlink-oneweb":
    "Different constellation architecture classes are represented. End-to-end infrastructure independence remains UNKNOWN.",
  "fixture-b-starlink-iridium":
    "The catalogue represents different provider and service characteristics. End-to-end infrastructure independence remains UNKNOWN.",
  "fixture-c-synthetic-shared-dependency":
    "Two otherwise distinct paths depend on the same explicitly modelled infrastructure entity. A failure of that entity could affect both paths.",
  "fixture-d-synthetic-positive-separation":
    "Evidence supports separation of the specified infrastructure dependency within the stated scope. This does not establish complete end-to-end independence.",
  "fixture-e-synthetic-contradictory-evidence":
    "Available evidence conflicts. The dependency relationship cannot currently be classified as established or absent.",
};

function main(): void {
  assert(HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B", "Homepage regression Signature must remain 83 · B");

  const ids = listFixtureIds();
  assert(ids.length === 5, `Expected five fixtures, got ${ids.length}`);

  for (const id of ids) {
    const f = getDependencyFixture(id);
    assert(f.researchConclusion === EXPECTED_CONCLUSIONS[id], `${id}: conclusion mismatch`);
    assert(f.containsScoreOrProbability === false, `${id}: must not contain scores/probabilities`);
    assert(f.isOperationalAssessment === false, `${id}: must not be operational assessment`);

    const layers = buildLayerViews(f);
    assert(layers.length === 6, `${id}: expected six layer views`);

    for (const u of f.unknownRelationships) {
      assert(u.confidence === "unknown", `${id}: unknown must stay unknown`);
      assert(u.evidenceIds.length === 0, `${id}: UNKNOWN must not cite evidence as proof`);
      assert(u.mustNotInfer.length > 0, `${id}: mustNotInfer required`);
    }

    // Fixture providers must be explicit and must not be assumed equal to hero Signature providers
    assert(f.catalogueClassification.providerIds.length >= 2, `${id}: needs fixture providers`);
    const fixtureProviders = f.catalogueClassification.providerIds.join(",");
    const heroProviders = HERO_DEMO_INPUT.providers.join(",");
    if (id !== "fixture-b-starlink-iridium") {
      assert(
        fixtureProviders !== heroProviders,
        `${id}: non-B fixtures should differ from hero providers to test context separation`
      );
    }

    if (id.startsWith("fixture-c") || id.startsWith("fixture-d") || id.startsWith("fixture-e")) {
      assert(isSyntheticFixture(f), `${id} must be synthetic`);
      assert(
        f.evidence.every((e) => e.isSynthetic && e.evidenceType === "synthetic_test"),
        `${id} evidence must all be synthetic_test`
      );
    }

    if (id === "fixture-c-synthetic-shared-dependency") {
      assert(fixtureHasSharedFailureDomain(f), "Fixture C must demonstrate shared infrastructure");
      assert(!fixtureHasPositiveSeparation(f), "Fixture C is shared, not separated");
    }
    if (id === "fixture-d-synthetic-positive-separation") {
      assert(fixtureHasPositiveSeparation(f), "Fixture D needs positive separation");
      assert(separationRelationships(f).length >= 1, "Fixture D separation edges");
      assert(
        separationRelationships(f).every((r) => /ground|landing/i.test(r.scope.label)),
        "Fixture D separation must stay scoped"
      );
      assert(f.unknownRelationships.length >= 1, "Fixture D keeps other layers UNKNOWN");
      assert(!fixtureHasContradiction(f), "Fixture D should not be contradicted");
    }
    if (id === "fixture-e-synthetic-contradictory-evidence") {
      assert(fixtureHasContradiction(f), "Fixture E needs contradicted relationships");
      assert(contradictedRelationships(f).length >= 1, "Fixture E contradicted edges");
      const earlier = f.evidence.find((e) => e.id === "ev-synth-e-earlier-shared");
      const later = f.evidence.find((e) => e.id === "ev-synth-e-later-separate");
      assert(earlier && later, "Fixture E temporal pair");
      assert(earlier!.publicationDate && later!.publicationDate, "publication dates required");
      assert(String(earlier!.publicationDate) < String(later!.publicationDate), "earlier < later");
      assert(later!.supersedes !== earlier!.id, "must not auto-supersede as resolved truth");
      assert(!!later!.qualifies || !!earlier!.qualifiedBy, "temporal qualify link required");
    }
  }

  const viewPath = join(process.cwd(), "components/DependencyResearchLabView.tsx");
  const adapterPath = join(process.cwd(), "lib/research/dependency-fixtures.ts");
  const view = readFileSync(viewPath, "utf8");
  const adapter = readFileSync(adapterPath, "utf8");

  assert(view.includes("REFERENCE_SIGNATURE_LABEL") || view.includes(REFERENCE_SIGNATURE_LABEL), "Reference Signature label");
  assert(view.includes("RESEARCH_SCENARIO_LABEL") || view.includes(RESEARCH_SCENARIO_LABEL), "Research scenario label");
  assert(
    view.includes("DEPENDENCY_LAB_SIGNATURE_NOTICE") || view.includes(DEPENDENCY_LAB_SIGNATURE_NOTICE),
    "Signature notice"
  );
  assert(
    view.includes("DEPENDENCY_LAB_FIXTURE_CONTEXT_NOTICE") ||
      view.includes(DEPENDENCY_LAB_FIXTURE_CONTEXT_NOTICE),
    "Fixture context notice"
  );
  assert(adapter.includes(DEPENDENCY_LAB_SIGNATURE_NOTICE), "notice text in adapter");
  assert(adapter.includes(DEPENDENCY_LAB_FIXTURE_CONTEXT_NOTICE), "fixture notice in adapter");
  assert(adapter.includes(REFERENCE_SIGNATURE_LABEL), "reference label in adapter");
  assert(adapter.includes(RESEARCH_SCENARIO_LABEL), "research label in adapter");
  assert(
    view.includes("UNKNOWN_RELATIONSHIP_COPY") || view.includes(UNKNOWN_RELATIONSHIP_COPY),
    "UNKNOWN copy"
  );
  assert(view.includes("Catalogue confidence"), "Catalogue confidence label required");
  assert(view.includes("Provider diversity"), "Provider diversity label required");
  assert(view.includes("Catalogue-based orbit mix"), "Catalogue-based orbit mix label required");
  assert(view.includes("Synthetic test evidence"), "Synthetic evidence labelling required");
  assert(view.includes("Fixture providers:"), "Fixture providers must be displayed");
  assert(view.includes("Reference providers:"), "Reference providers must be displayed separately");
  assert(view.includes("Research preview"), "Research preview label required");
  assert(view.includes("LAB_SCENARIO_OPTIONS"), "Lab must load unified scenario options");
  assert(view.includes("EVIDENCE_PACK_NOTICE"), "Public evidence pack notice required");
  assert(view.includes("EVIDENCE_PACK_NO_SCORE_NOTICE"), "Pack no-score notice required");
  assert(!view.includes("independent paths"), "Panel must not use 'independent paths' wording");
  assert(
    !view.includes("@/lib/deterministic-score") && !view.includes("@/lib/scoring"),
    "Panel must not import scoring modules directly"
  );
  assert(
    !/from\s+["']@\/lib\/deterministic-score["']/.test(adapter) &&
      !/from\s+["']@\/lib\/scoring["']/.test(adapter),
    "Fixture adapter must stay isolated from scoring engine modules"
  );

  console.log("Dependency research panel checks passed.");
  console.log(`Signature regression display source: ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
  console.log("Fixtures A–E + evidence pack scenario wired. No fixture-derived resilience score.");
}

main();

/**
 * P6-S3 research workflow integrity checks.
 * Does not calculate fixture-derived scores. Does not write Neon.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { HERO_DEMO_GRADE, HERO_DEMO_INPUT, HERO_DEMO_SCORE } from "../lib/hero-demo";
import {
  WORKFLOW_DISCLAIMER_EN,
  WORKFLOW_STAGES,
  buildAdvisorHref,
  buildDependencyLabHref,
  buildWorkspaceHref,
  emptyWorkflowSession,
  findMatchingSavedAssessment,
  homepageRegressionSession,
  missingInformation,
  providersUnknown,
  scenarioFieldsComplete,
  siteFieldsComplete,
  stageStatus,
} from "../lib/research/workflow-context";
import { exportAssessmentMarkdown } from "../lib/research-workspace";
import type { SavedResearchAssessment } from "../lib/research-workspace";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

function main(): void {
  assert(
    HERO_DEMO_SCORE === 83 && HERO_DEMO_GRADE === "B",
    "Homepage regression must remain 83 · B"
  );

  assert(WORKFLOW_STAGES.length === 7, "seven workflow stages required");
  assert(
    WORKFLOW_STAGES.map((s) => s.id).join(",") ===
      "site,scenario,dependencies,evidence,assessment,comparison,report",
    "stage order"
  );

  const empty = emptyWorkflowSession();
  assert(!siteFieldsComplete(empty), "empty site incomplete");
  assert(stageStatus(empty, "dependencies", 0) === "unavailable", "deps unavailable before save");
  assert(
    stageStatus(empty, "assessment", 0) === "unavailable",
    "assessment unavailable before save"
  );
  assert(providersUnknown(empty), "empty providers are UNKNOWN");

  const hero = homepageRegressionSession();
  assert(siteFieldsComplete(hero) && scenarioFieldsComplete(hero), "hero session fields");
  assert(hero.stages.siteDefined && hero.stages.scenarioDefined, "hero stages marked");
  assert(Number(hero.lat) === HERO_DEMO_INPUT.lat, "hero lat");
  assert(Number(hero.lng) === HERO_DEMO_INPUT.lng, "hero lng");
  assert(hero.providers.join(",") === HERO_DEMO_INPUT.providers.join(","), "hero providers");

  const advisor = buildAdvisorHref(hero);
  assert(advisor.includes("lat=67"), "advisor lat");
  assert(advisor.includes("lng=26"), "advisor lng");
  assert(advisor.includes("sector=mining"), "advisor sector");
  assert(
    advisor.includes("providers=starlink%2Ciridium") ||
      advisor.includes("providers=starlink,iridium"),
    "advisor providers"
  );
  assert(advisor.includes("from=workflow"), "advisor from workflow");
  assert(advisor.includes("#advisor"), "advisor hash");

  // UNKNOWN providers must emit an explicit empty providers query (not omit the param).
  const unknownProviders = emptyWorkflowSession();
  unknownProviders.lat = "67";
  unknownProviders.lng = "26";
  unknownProviders.sector = "mining";
  unknownProviders.autonomy = "remote-operated";
  unknownProviders.criticality = "high";
  unknownProviders.providers = [];
  const unknownHref = buildAdvisorHref(unknownProviders);
  assert(unknownHref.includes("providers="), "UNKNOWN emits providers param");
  assert(unknownHref.includes("providersUnknown=1"), "UNKNOWN flag set");
  assert(
    /(?:^|[?&])providers=(?:&|$)/.test(unknownHref) || unknownHref.includes("providers=&"),
    "providers value empty when UNKNOWN"
  );

  // Homepage Advisor hydration must honour present-but-empty providers (static check).
  const pageSrc = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
  assert(pageSrc.includes("providersUnknown"), "Advisor page handles providersUnknown");
  assert(
    pageSrc.includes("providersRaw !== null") || pageSrc.includes("providersRaw!==null"),
    "Advisor treats present providers query as authoritative"
  );

  const lab = buildDependencyLabHref(hero);
  assert(lab.startsWith("/research/dependency-lab?"), "lab path");
  assert(lab.includes("from=workflow"), "lab from workflow");
  assert(lab.includes("lab=fixture-b-starlink-iridium"), "lab scenario");

  const ws = buildWorkspaceHref(hero, "compare");
  assert(ws.includes("/workspace?"), "workspace path");
  assert(ws.includes("mode=compare"), "compare mode");
  const wsExport = buildWorkspaceHref(hero, "export");
  assert(wsExport.includes("mode=export"), "report stage deep-links export mode");
  assert(wsExport.includes("from=workflow"), "export href from workflow");

  hero.stages.siteDefined = true;
  hero.stages.scenarioDefined = true;
  assert(stageStatus(hero, "dependencies", 0) === "ready", "deps ready after site/scenario");
  assert(stageStatus(hero, "comparison", 1) === "unavailable", "compare needs two assessments");
  assert(stageStatus(hero, "comparison", 2) === "ready", "compare ready with two");
  assert(stageStatus(hero, "report", 2) === "unavailable", "report needs linked assessment");

  const missing = missingInformation(hero);
  assert(
    missing.some((m) => /dependency/i.test(m)),
    "missing lists dependency acknowledgement"
  );
  assert(WORKFLOW_DISCLAIMER_EN.includes("not independently validated"), "disclaimer");

  // Safer assessment linking — match session inputs; reject unrelated coords
  const matchOk = findMatchingSavedAssessment(hero, [
    {
      id: "a1",
      title: "match",
      inputs: {
        lat: HERO_DEMO_INPUT.lat,
        lng: HERO_DEMO_INPUT.lng,
        sector: HERO_DEMO_INPUT.sector,
        autonomy_level: HERO_DEMO_INPUT.autonomy,
        operation_criticality: HERO_DEMO_INPUT.criticality,
      },
    },
  ]);
  assert(matchOk?.id === "a1", "matching assessment found");
  const matchMiss = findMatchingSavedAssessment(hero, [
    {
      id: "a2",
      title: "wrong site",
      inputs: {
        lat: 60,
        lng: 24,
        sector: HERO_DEMO_INPUT.sector,
        autonomy_level: HERO_DEMO_INPUT.autonomy,
        operation_criticality: HERO_DEMO_INPUT.criticality,
      },
    },
  ]);
  assert(matchMiss === undefined, "non-matching assessment rejected");

  // Export integrity — limitations and methodology present; not certification language
  const sample: SavedResearchAssessment = {
    id: "exp1",
    title: "Export integrity sample",
    savedAt: new Date().toISOString(),
    depth: "abbreviated",
    inputs: {
      lat: HERO_DEMO_INPUT.lat,
      lng: HERO_DEMO_INPUT.lng,
      sector: HERO_DEMO_INPUT.sector,
      autonomy_level: HERO_DEMO_INPUT.autonomy,
      operation_criticality: HERO_DEMO_INPUT.criticality,
    },
    abbreviated: {
      depth: "abbreviated",
      resilience_signature: {
        score: HERO_DEMO_SCORE,
        grade: HERO_DEMO_GRADE,
        summary: "Sample summary",
      },
      modelVersion: "0.4",
      top_risks: [],
      recommended: {
        provider: "Starlink + Iridium",
        type: "dual-path",
        confidence: 70,
        confidenceBand: "Medium",
        latencyEstimate: null,
        orbitalType: "LEO",
        why: "Sample abbreviated recommendation for export integrity.",
      },
    },
  };
  const md = exportAssessmentMarkdown(sample);
  assert(md.includes("## Limitations"), "export has Limitations");
  assert(md.includes("## Assumptions"), "export has Assumptions");
  assert(/not a site survey|Not a site survey/i.test(md), "export states not a survey");
  assert(
    !/\bis certified\b|\bcertification of\b|\bpurchase now\b/i.test(md),
    "export avoids positive certification / sales claims"
  );

  const viewPath = join(process.cwd(), "components/ResearchWorkflowView.tsx");
  const pagePath = join(process.cwd(), "app/research/workflow/page.tsx");
  const ctxPath = join(process.cwd(), "lib/research/workflow-context.ts");
  const view = readFileSync(viewPath, "utf8");
  const page = readFileSync(pagePath, "utf8");
  const ctx = readFileSync(ctxPath, "utf8");
  const workspaceView = readFileSync(
    join(process.cwd(), "components/ResearchWorkspaceView.tsx"),
    "utf8"
  );

  assert(page.includes("ResearchWorkflowView"), "workflow page mounts view");
  assert(view.includes("Integrated research assessment"), "workflow title");
  assert(view.includes("Mark dependency review noted"), "explicit ack — not open=complete");
  assert(view.includes("UNKNOWN"), "UNKNOWN visible");
  assert(view.includes("Link matching saved assessment"), "safer assessment link label");
  assert(view.includes("mode=export") || view.includes('"export"'), "report uses export mode");
  assert(!view.includes("@/lib/deterministic-score"), "workflow UI must not import scoring engine");
  assert(ctx.includes("WORKFLOW_STORAGE_KEY"), "local storage key");
  assert(!ctx.includes("@neondatabase"), "workflow context must not import Neon");
  assert(!/from\s+["']@\/lib\/scoring["']/.test(ctx), "no scoring import in context");
  assert(workspaceView.includes("fromWorkflow"), "workspace return banner prop");
  assert(workspaceView.includes("Return to research workflow"), "workspace return link");

  const nav = readFileSync(join(process.cwd(), "lib/ia-nav.ts"), "utf8");
  assert(nav.includes("/research/workflow"), "IA nav includes workflow");
  assert(nav.includes("/research/dependency-lab"), "IA nav includes dependency lab");

  console.log("Research workflow checks passed.");
  console.log(`Homepage regression ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
  console.log("Local session only · no Neon · Model v0.4 unchanged.");
}

main();

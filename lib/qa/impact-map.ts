/**
 * Component → validator mapping grounded in actual npm scripts / paths.
 */

export type ImpactComponentId =
  | "scoring_engine"
  | "evidence_handling"
  | "dependency_lab"
  | "research_workflow"
  | "ui_routes"
  | "security_boundaries"
  | "documentation"
  | "qa_system"
  | "unmapped";

export type ValidatorId =
  | "test:score"
  | "test:evidence"
  | "test:evidence-pack"
  | "test:evidence-intake"
  | "test:fixtures"
  | "test:dependency-lab"
  | "test:workflow"
  | "test:boundaries"
  | "test:qa-agents"
  | "typecheck"
  | "lint"
  | "build";

export type ImpactRule = {
  component: ImpactComponentId;
  /** Exact files or directory prefixes (directories end with /) */
  patterns: string[];
  validators: ValidatorId[];
  description: string;
};

/** Mandatory on every task-level QA run regardless of change type. */
export const MANDATORY_BASELINE_VALIDATORS: ValidatorId[] = ["test:score", "test:boundaries"];

export const IMPACT_RULES: ImpactRule[] = [
  {
    component: "scoring_engine",
    patterns: [
      "lib/deterministic-score.ts",
      "lib/scoring.ts",
      "lib/model-constants.ts",
      "lib/hero-demo.ts",
      "lib/signature-meta.ts",
      "scripts/verify-deterministic.ts",
    ],
    validators: ["test:score", "test:boundaries", "typecheck"],
    description: "Model v0.4 scoring / homepage regression",
  },
  {
    component: "evidence_handling",
    patterns: [
      "lib/evidence-model.ts",
      "lib/evidence-kinds.ts",
      "lib/research/evidence-intake.ts",
      "lib/research/evidence-packs.ts",
      "docs/methodology/evidence-packs/",
      "docs/methodology/fixtures/evidence-intake/",
      "scripts/verify-evidence-integrity.ts",
      "scripts/verify-evidence-intake.ts",
      "scripts/verify-nordic-lapland-evidence-pack.ts",
    ],
    validators: ["test:evidence", "test:evidence-pack", "test:evidence-intake", "test:boundaries"],
    description: "Evidence, provenance, intake, packs",
  },
  {
    component: "dependency_lab",
    patterns: [
      "lib/research/dependency-fixtures.ts",
      "components/DependencyResearchLabView.tsx",
      "app/research/dependency-lab/",
      "docs/methodology/fixtures/provider-dependency-fixtures/",
      "scripts/verify-dependency-research-panel.ts",
      "scripts/verify-provider-dependency-fixtures.ts",
    ],
    validators: ["test:dependency-lab", "test:fixtures"],
    description: "Dependency Lab and fixtures",
  },
  {
    component: "research_workflow",
    patterns: [
      "lib/research/workflow-context.ts",
      "components/ResearchWorkflowView.tsx",
      "app/research/workflow/",
      "scripts/verify-research-workflow.ts",
      "lib/ia-nav.ts",
    ],
    validators: ["test:workflow", "build"],
    description: "Integrated research workflow",
  },
  {
    component: "ui_routes",
    patterns: ["app/", "components/", "context/"],
    validators: ["typecheck", "lint", "build"],
    description: "UI / routes / components",
  },
  {
    component: "security_boundaries",
    patterns: [
      "LICENSE",
      "docs/methodology/fixtures/protected-boundaries-manifest.json",
      "scripts/verify-protected-boundaries.ts",
    ],
    validators: ["test:boundaries"],
    description: "Protected boundaries",
  },
  {
    component: "qa_system",
    patterns: [
      "lib/qa/",
      "scripts/verify-multi-agent-qa.ts",
      "scripts/verify-task-qa.ts",
      "docs/methodology/qa-fixtures/",
    ],
    validators: ["test:qa-agents", "typecheck"],
    description: "Multi-agent / task QA framework",
  },
  {
    component: "documentation",
    patterns: ["docs/methodology/", "docs/"],
    validators: [],
    description: "Methodology docs — no dedicated doc validator script",
  },
];

export function normalizeRepoPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}

function patternMatches(path: string, pattern: string): boolean {
  const p = normalizeRepoPath(path);
  const pat = normalizeRepoPath(pattern);
  if (pat.endsWith("/")) return p === pat.slice(0, -1) || p.startsWith(pat);
  return p === pat;
}

export function matchComponents(path: string): ImpactComponentId[] {
  const hits: ImpactComponentId[] = [];
  for (const rule of IMPACT_RULES) {
    if (rule.patterns.some((pat) => patternMatches(path, pat))) {
      hits.push(rule.component);
    }
  }
  if (hits.length === 0) return ["unmapped"];
  return [...new Set(hits)];
}

export function validatorsForPaths(paths: string[]): {
  components: ImpactComponentId[];
  validators: ValidatorId[];
  unmappedPaths: string[];
} {
  const components = new Set<ImpactComponentId>();
  const validators = new Set<ValidatorId>();
  const unmappedPaths: string[] = [];
  for (const path of paths) {
    const comps = matchComponents(path);
    for (const c of comps) components.add(c);
    if (comps.length === 1 && comps[0] === "unmapped") {
      unmappedPaths.push(normalizeRepoPath(path));
    }
    for (const rule of IMPACT_RULES) {
      if (comps.includes(rule.component)) {
        for (const v of rule.validators) validators.add(v);
      }
    }
  }
  return {
    components: [...components],
    validators: [...validators],
    unmappedPaths,
  };
}

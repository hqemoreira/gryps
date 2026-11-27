/**
 * Independent live reviewer execution (P6-S7).
 * Three separate model calls — never one response relabelled as three agents.
 */
import {
  DEFAULT_LIVE_COST_CONTROLS,
  LiveExecutionBudget,
  type LiveCostControls,
} from "@/lib/qa/live/cost-controls";
import { buildLiveReviewContext, contextToPromptPayload } from "@/lib/qa/live/context-builder";
import { parseLiveAgentJson } from "@/lib/qa/live/findings-parse";
import {
  LIVE_P6_S7_AGENTS,
  systemPromptForLiveAgent,
  userPromptForLiveAgent,
  type LiveP6S7Agent,
} from "@/lib/qa/live/prompts";
import type { LiveModelProvider } from "@/lib/qa/live/providers/types";
import type { ChangeInventory } from "@/lib/qa/change-inventory";
import type { DevelopmentTaskDefinition } from "@/lib/qa/task-definition";
import type { QaAgentReport, QaDeterministicCheck, QaFinding } from "@/lib/qa/types";

export type LiveAgentRunMeta = {
  provider: string;
  model: string;
  latencyMs: number;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  estimatedUsd?: number;
  retries: number;
  errors: string[];
  disagreements?: string[];
};

export type LiveAgentOutcome = {
  report: QaAgentReport;
  meta: LiveAgentRunMeta;
  independent: true;
};

export type LiveReviewBundle = {
  outcomes: LiveAgentOutcome[];
  budget: LiveExecutionBudget;
  providerId: string;
  model: string;
  allFindings: QaFinding[];
  preservedIndependently: true;
};

async function runOneLiveAgent(
  agent: LiveP6S7Agent,
  provider: LiveModelProvider,
  budget: LiveExecutionBudget,
  controls: LiveCostControls,
  input: {
    task: DevelopmentTaskDefinition | Parameters<typeof buildLiveReviewContext>[0]["task"];
    sandboxRoot?: string;
    inventory?: ChangeInventory;
    validatorResults?: QaDeterministicCheck[];
    peerFindingSummaries?: string[];
    taskStartSnapshotId?: string;
    protectedBoundaryStatus?: string;
    model: string;
  }
): Promise<LiveAgentOutcome> {
  const gate = budget.canCall();
  if (!gate.ok) {
    return {
      independent: true,
      meta: {
        provider: provider.id,
        model: input.model,
        latencyMs: 0,
        retries: 0,
        errors: [gate.reason ?? "budget blocked"],
      },
      report: {
        agent,
        executed: false,
        mode: "live",
        status: "blocked",
        summary: gate.reason ?? "Budget blocked live review",
        findings: [],
      },
    };
  }

  const ctx = buildLiveReviewContext({
    agent,
    task: input.task,
    sandboxRoot: input.sandboxRoot,
    inventory: input.inventory,
    validatorResults: input.validatorResults,
    peerFindingSummaries: agent === "adversarial" ? input.peerFindingSummaries : undefined,
    taskStartSnapshotId: input.taskStartSnapshotId,
    protectedBoundaryStatus: input.protectedBoundaryStatus,
  });

  const messages = [
    { role: "system" as const, content: systemPromptForLiveAgent(agent) },
    { role: "user" as const, content: userPromptForLiveAgent(contextToPromptPayload(ctx)) },
  ];

  let lastError = "";
  let retries = 0;
  const maxAttempts = 1 + controls.maxRetries;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) retries += 1;
    const can = budget.canCall();
    if (!can.ok) {
      lastError = can.reason ?? "budget";
      break;
    }
    try {
      const result = await provider.complete({
        model: input.model,
        messages,
        temperature: 0.2,
        maxTokens: controls.maxTokensPerCall,
        jsonObject: true,
        timeoutMs: controls.timeoutMs,
      });
      const cost = budget.recordCall(result.usage, `${agent}@${result.model}`);
      const parsed = parseLiveAgentJson(agent, result.content, {
        provider: result.provider,
        model: result.model,
      });

      if (!parsed.ok && parsed.findings.length === 0) {
        lastError = parsed.errors.join("; ") || "invalid structured output";
        continue;
      }

      const status = parsed.findings.some((f) => f.blocking)
        ? ("fail" as const)
        : ("pass" as const);

      return {
        independent: true,
        meta: {
          provider: result.provider,
          model: result.model,
          latencyMs: result.latencyMs,
          usage: result.usage,
          estimatedUsd: cost.estimatedUsd,
          retries,
          errors: parsed.errors,
          disagreements: parsed.disagreements,
        },
        report: {
          agent,
          executed: true,
          mode: "live",
          status,
          summary:
            parsed.summary ?? `Live review by ${agent} via ${result.provider}/${result.model}`,
          findings: parsed.findings,
          provider: result.provider,
          model: result.model,
          latencyMs: result.latencyMs,
          estimatedUsd: cost.estimatedUsd,
        },
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    independent: true,
    meta: {
      provider: provider.id,
      model: input.model,
      latencyMs: 0,
      retries,
      errors: [lastError || "live review failed"],
    },
    report: {
      agent,
      executed: false,
      mode: "live",
      status: "blocked",
      summary: `Live review blocked: ${lastError || "unknown error"}`,
      findings: [],
      provider: provider.id,
      model: input.model,
    },
  };
}

/**
 * Run the three P6-S7 live reviewers as separate sequential tasks.
 * Adversarial receives peer summaries after A+B complete — cannot rewrite them.
 */
export async function runLiveP6S7Reviewers(options: {
  provider: LiveModelProvider;
  task: DevelopmentTaskDefinition | Parameters<typeof buildLiveReviewContext>[0]["task"];
  sandboxRoot?: string;
  inventory?: ChangeInventory;
  validatorResults?: QaDeterministicCheck[];
  taskStartSnapshotId?: string;
  protectedBoundaryStatus?: string;
  model?: string;
  controls?: LiveCostControls;
}): Promise<LiveReviewBundle> {
  const controls = options.controls ?? DEFAULT_LIVE_COST_CONTROLS;
  const budget = new LiveExecutionBudget(controls);
  const avail = options.provider.checkAvailability();
  const model = options.model ?? avail.modelDefault ?? "mistral-small-latest";
  const outcomes: LiveAgentOutcome[] = [];

  // Agent A then B independently
  for (const agent of ["requirements", "domain_model"] as LiveP6S7Agent[]) {
    const outcome = await runOneLiveAgent(agent, options.provider, budget, controls, {
      task: options.task,
      sandboxRoot: options.sandboxRoot,
      inventory: options.inventory,
      validatorResults: options.validatorResults,
      taskStartSnapshotId: options.taskStartSnapshotId,
      protectedBoundaryStatus: options.protectedBoundaryStatus,
      model,
    });
    outcomes.push(outcome);
  }

  const peerSummaries = outcomes.flatMap((o) =>
    o.report.findings.map(
      (f) => `${f.findingId} (${f.agent}/${f.severity}): ${f.description.slice(0, 160)}`
    )
  );

  // Agent C — separate call; may challenge peers, cannot mutate prior outcomes
  const adv = await runOneLiveAgent("adversarial", options.provider, budget, controls, {
    task: options.task,
    sandboxRoot: options.sandboxRoot,
    inventory: options.inventory,
    validatorResults: options.validatorResults,
    peerFindingSummaries: peerSummaries,
    taskStartSnapshotId: options.taskStartSnapshotId,
    protectedBoundaryStatus: options.protectedBoundaryStatus,
    model,
  });
  outcomes.push(adv);

  // Freeze prior findings — adversarial must not rewrite
  const allFindings = outcomes.flatMap((o) => o.report.findings.map((f) => ({ ...f })));

  return {
    outcomes,
    budget,
    providerId: options.provider.id,
    model,
    allFindings,
    preservedIndependently: true,
  };
}

export { LIVE_P6_S7_AGENTS };

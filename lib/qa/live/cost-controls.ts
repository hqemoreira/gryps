/**
 * Cost and execution controls for live QA (P6-S7).
 */
import { MISTRAL_SMALL_COST_PER_1M } from "@/lib/qa/live/providers/mistral";
import type { ChatCompletionUsage, CostEstimate } from "@/lib/qa/live/providers/types";

export type LiveCostControls = {
  maxTokensPerCall: number;
  timeoutMs: number;
  maxRetries: number;
  maxCallsPerTask: number;
  /** Soft ceiling in USD; exceeding blocks further calls */
  costCeilingUsd: number;
  /** Require GRYPS_QA_LIVE_APPROVE=1 for batch seed evals */
  requireBatchApproval: boolean;
};

export const DEFAULT_LIVE_COST_CONTROLS: LiveCostControls = {
  maxTokensPerCall: 2048,
  timeoutMs: 60_000,
  maxRetries: 1,
  maxCallsPerTask: 3,
  costCeilingUsd: 0.5,
  requireBatchApproval: true,
};

export class LiveExecutionBudget {
  private calls = 0;
  private estimatedUsd = 0;
  readonly logs: string[] = [];

  constructor(private readonly controls: LiveCostControls = DEFAULT_LIVE_COST_CONTROLS) {}

  get callCount(): number {
    return this.calls;
  }

  get spentUsd(): number {
    return this.estimatedUsd;
  }

  canCall(): { ok: boolean; reason?: string } {
    if (this.calls >= this.controls.maxCallsPerTask) {
      return {
        ok: false,
        reason: `Per-task model-call limit reached (${this.controls.maxCallsPerTask})`,
      };
    }
    if (this.estimatedUsd >= this.controls.costCeilingUsd) {
      return {
        ok: false,
        reason: `Cost ceiling reached (~$${this.estimatedUsd.toFixed(4)} >= $${this.controls.costCeilingUsd})`,
      };
    }
    return { ok: true };
  }

  recordCall(usage: ChatCompletionUsage | undefined, label: string): CostEstimate {
    this.calls += 1;
    const estimate = estimateMistralSmallCost(usage);
    this.estimatedUsd += estimate.estimatedUsd;
    this.logs.push(
      `${new Date().toISOString()} ${label} tokens=${usage?.totalTokens ?? "?"} ~$${estimate.estimatedUsd.toFixed(5)}`
    );
    return estimate;
  }
}

export function estimateMistralSmallCost(usage?: ChatCompletionUsage): CostEstimate {
  const prompt = usage?.promptTokens ?? 0;
  const completion = usage?.completionTokens ?? 0;
  const estimatedUsd =
    (prompt / 1_000_000) * MISTRAL_SMALL_COST_PER_1M.inputUsd +
    (completion / 1_000_000) * MISTRAL_SMALL_COST_PER_1M.outputUsd;
  return {
    currency: "USD",
    estimatedUsd,
    basis: MISTRAL_SMALL_COST_PER_1M.basis,
  };
}

export function batchApprovalGranted(): boolean {
  return process.env.GRYPS_QA_LIVE_APPROVE === "1";
}

export function liveExecutionRequested(): boolean {
  return process.env.GRYPS_QA_LIVE === "1";
}

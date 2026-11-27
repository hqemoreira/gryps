import type { QaAgentId, QaAgentReport, QaExecutionMode } from "@/lib/qa/types";
import { runMockAgent } from "@/lib/qa/mock-agents";

/**
 * Provider abstraction — mock + live LLM adapters (P6-S7).
 * Live path uses lib/qa/live/*; this interface remains for P6-S4 orchestrator.
 */
export interface QaAgentProvider {
  readonly mode: QaExecutionMode;
  review(
    agent: Exclude<QaAgentId, "orchestrator">,
    sandboxRoot: string | undefined
  ): Promise<QaAgentReport> | QaAgentReport;
}

export class MockQaAgentProvider implements QaAgentProvider {
  readonly mode: QaExecutionMode = "mock";
  review(
    agent: Exclude<QaAgentId, "orchestrator">,
    sandboxRoot: string | undefined
  ): QaAgentReport {
    return runMockAgent(agent, sandboxRoot, "mock");
  }
}

/** Placeholder — must not silently PASS when selected. */
export class LiveUnimplementedQaAgentProvider implements QaAgentProvider {
  readonly mode: QaExecutionMode = "live_unimplemented";
  review(
    agent: Exclude<QaAgentId, "orchestrator">,
    sandboxRoot: string | undefined
  ): QaAgentReport {
    return runMockAgent(agent, sandboxRoot, "live_unimplemented");
  }
}

/**
 * Thin adapter: P6-S4 orchestrator per-agent review in live mode should use
 * runLiveQaOrchestrator for the three P6-S7 agents. This provider returns
 * BLOCKED for arbitrary peer agents so silent PASS is impossible.
 */
export class LiveQaAgentProviderStub implements QaAgentProvider {
  readonly mode: QaExecutionMode = "live";
  review(
    agent: Exclude<QaAgentId, "orchestrator">,
    _sandboxRoot: string | undefined
  ): QaAgentReport {
    return {
      agent,
      executed: false,
      mode: "live",
      status: "blocked",
      summary:
        "Use runLiveQaOrchestrator for P6-S7 three-agent live reviews — per-agent stub refuses silent PASS",
      findings: [],
    };
  }
}

export function createQaProvider(mode: QaExecutionMode): QaAgentProvider {
  if (mode === "live") return new LiveQaAgentProviderStub();
  if (mode === "live_unimplemented") return new LiveUnimplementedQaAgentProvider();
  return new MockQaAgentProvider();
}

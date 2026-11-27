/**
 * Multi-provider chat interfaces for live QA (P6-S7).
 * Verified against Mistral Chat Completions + JSON mode docs.
 */

export type LiveProviderId = "mistral" | "openai_compatible" | "unavailable";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** When true, request JSON object mode (Mistral response_format json_object). */
  jsonObject?: boolean;
  timeoutMs?: number;
};

export type ChatCompletionUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type ChatCompletionResult = {
  provider: LiveProviderId;
  model: string;
  content: string;
  finishReason?: string;
  usage?: ChatCompletionUsage;
  latencyMs: number;
  requestId?: string;
  rawExcerpt?: string;
};

export type ProviderAvailability = {
  provider: LiveProviderId;
  available: boolean;
  reason?: string;
  modelDefault?: string;
};

export interface LiveModelProvider {
  readonly id: LiveProviderId;
  readonly displayName: string;
  checkAvailability(): ProviderAvailability;
  complete(req: ChatCompletionRequest): Promise<ChatCompletionResult>;
}

/** Rough USD estimate helpers — informational only, not billing. */
export type CostEstimate = {
  currency: "USD";
  estimatedUsd: number;
  basis: string;
};

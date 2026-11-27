/**
 * Mistral Chat Completions adapter (P6-S7).
 * Uses existing @mistralai/mistralai dependency — same pattern as lib/scoring.ts.
 * API: POST chat.complete with response_format { type: "json_object" } for JSON mode
 * (docs.mistral.ai — JSON Mode / Chat Completions).
 */
import { Mistral } from "@mistralai/mistralai";
import type {
  ChatCompletionRequest,
  ChatCompletionResult,
  LiveModelProvider,
  ProviderAvailability,
} from "@/lib/qa/live/providers/types";

export const MISTRAL_DEFAULT_QA_MODEL = "mistral-small-latest";

/** Approximate public list prices for cost ceilings (informational; verify before batch spend). */
export const MISTRAL_SMALL_COST_PER_1M = {
  inputUsd: 0.1,
  outputUsd: 0.3,
  basis: "mistral-small-latest approximate public list (verify current pricing before batch)",
};

function extractContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: string }).text ?? "");
        }
        return "";
      })
      .join("");
  }
  return "";
}

export class MistralLiveProvider implements LiveModelProvider {
  readonly id = "mistral" as const;
  readonly displayName = "Mistral AI";
  private readonly apiKey: string | undefined;
  private readonly defaultModel: string;

  constructor(options?: { apiKey?: string; defaultModel?: string }) {
    this.apiKey = options?.apiKey ?? process.env.MISTRAL_API_KEY;
    this.defaultModel = options?.defaultModel ?? MISTRAL_DEFAULT_QA_MODEL;
  }

  checkAvailability(): ProviderAvailability {
    if (!this.apiKey || !this.apiKey.trim()) {
      return {
        provider: "mistral",
        available: false,
        reason: "MISTRAL_API_KEY not set in process environment",
        modelDefault: this.defaultModel,
      };
    }
    return {
      provider: "mistral",
      available: true,
      modelDefault: this.defaultModel,
    };
  }

  async complete(req: ChatCompletionRequest): Promise<ChatCompletionResult> {
    const avail = this.checkAvailability();
    if (!avail.available) {
      throw new Error(avail.reason ?? "Mistral provider unavailable");
    }
    const model = req.model || this.defaultModel;
    const timeoutMs = req.timeoutMs ?? 60_000;
    const client = new Mistral({ apiKey: this.apiKey! });
    const t0 = Date.now();

    const work = client.chat.complete({
      model,
      messages: req.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: req.temperature ?? 0.2,
      maxTokens: req.maxTokens ?? 2048,
      ...(req.jsonObject ? { responseFormat: { type: "json_object" as const } } : {}),
    });

    const timed = new Promise<never>((_, reject) => {
      const t = setTimeout(
        () => reject(new Error(`Mistral timeout after ${timeoutMs}ms`)),
        timeoutMs
      );
      t.unref?.();
    });

    const response = await Promise.race([work, timed]);
    const latencyMs = Date.now() - t0;
    const choice = response.choices?.[0];
    const content = extractContent(choice?.message?.content);
    const usage = response.usage
      ? {
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
        }
      : undefined;

    return {
      provider: "mistral",
      model: response.model ?? model,
      content,
      finishReason: choice?.finishReason ?? undefined,
      usage,
      latencyMs,
      requestId: response.id,
      rawExcerpt: content.slice(0, 500),
    };
  }
}

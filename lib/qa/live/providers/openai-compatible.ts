/**
 * Generic OpenAI-compatible Chat Completions HTTP adapter (P6-S7).
 * No OpenAI SDK dependency — raw fetch only.
 * Enabled only when GRYPS_QA_OPENAI_COMPAT_BASE_URL + API key env are set.
 * Does not invent vendor endpoints; caller supplies base URL.
 */
import type {
  ChatCompletionRequest,
  ChatCompletionResult,
  LiveModelProvider,
  ProviderAvailability,
} from "@/lib/qa/live/providers/types";

export class OpenAiCompatibleLiveProvider implements LiveModelProvider {
  readonly id = "openai_compatible" as const;
  readonly displayName = "OpenAI-compatible HTTP";
  private readonly baseUrl: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly defaultModel: string;

  constructor(options?: { baseUrl?: string; apiKey?: string; defaultModel?: string }) {
    this.baseUrl = options?.baseUrl ?? process.env.GRYPS_QA_OPENAI_COMPAT_BASE_URL ?? undefined;
    this.apiKey =
      options?.apiKey ??
      process.env.GRYPS_QA_OPENAI_COMPAT_API_KEY ??
      process.env.OPENAI_API_KEY ??
      undefined;
    this.defaultModel =
      options?.defaultModel ?? process.env.GRYPS_QA_OPENAI_COMPAT_MODEL ?? "gpt-4o-mini";
  }

  checkAvailability(): ProviderAvailability {
    if (!this.baseUrl?.trim()) {
      return {
        provider: "openai_compatible",
        available: false,
        reason: "GRYPS_QA_OPENAI_COMPAT_BASE_URL not set",
        modelDefault: this.defaultModel,
      };
    }
    if (!this.apiKey?.trim()) {
      return {
        provider: "openai_compatible",
        available: false,
        reason: "OpenAI-compatible API key not set",
        modelDefault: this.defaultModel,
      };
    }
    return {
      provider: "openai_compatible",
      available: true,
      modelDefault: this.defaultModel,
    };
  }

  async complete(req: ChatCompletionRequest): Promise<ChatCompletionResult> {
    const avail = this.checkAvailability();
    if (!avail.available) throw new Error(avail.reason ?? "OpenAI-compatible unavailable");

    const model = req.model || this.defaultModel;
    const timeoutMs = req.timeoutMs ?? 60_000;
    const url = `${this.baseUrl!.replace(/\/$/, "")}/chat/completions`;
    const t0 = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: req.messages,
          temperature: req.temperature ?? 0.2,
          max_tokens: req.maxTokens ?? 2048,
          ...(req.jsonObject ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: controller.signal,
      });
      const latencyMs = Date.now() - t0;
      const body = (await res.json()) as {
        id?: string;
        model?: string;
        choices?: Array<{
          finish_reason?: string;
          message?: { content?: string };
        }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }
      const content = body.choices?.[0]?.message?.content ?? "";
      return {
        provider: "openai_compatible",
        model: body.model ?? model,
        content,
        finishReason: body.choices?.[0]?.finish_reason,
        usage: body.usage
          ? {
              promptTokens: body.usage.prompt_tokens,
              completionTokens: body.usage.completion_tokens,
              totalTokens: body.usage.total_tokens,
            }
          : undefined,
        latencyMs,
        requestId: body.id,
        rawExcerpt: content.slice(0, 500),
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

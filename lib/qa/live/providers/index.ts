import { MistralLiveProvider, MISTRAL_DEFAULT_QA_MODEL } from "@/lib/qa/live/providers/mistral";
import { OpenAiCompatibleLiveProvider } from "@/lib/qa/live/providers/openai-compatible";
import type {
  LiveModelProvider,
  LiveProviderId,
  ProviderAvailability,
} from "@/lib/qa/live/providers/types";

export type { LiveModelProvider, LiveProviderId, ProviderAvailability };
export { MistralLiveProvider, MISTRAL_DEFAULT_QA_MODEL, OpenAiCompatibleLiveProvider };

export type ResolveProviderOptions = {
  /** Prefer mistral | openai_compatible | auto */
  prefer?: "mistral" | "openai_compatible" | "auto";
};

/**
 * Resolve the first available configured provider.
 * Does not invent availability — checks env/credentials only.
 */
export function resolveLiveProvider(options: ResolveProviderOptions = {}): {
  provider: LiveModelProvider | null;
  availability: ProviderAvailability[];
} {
  const mistral = new MistralLiveProvider();
  const openaiCompat = new OpenAiCompatibleLiveProvider();
  const availability = [mistral.checkAvailability(), openaiCompat.checkAvailability()];

  const prefer = options.prefer ?? "auto";
  const order: LiveModelProvider[] =
    prefer === "openai_compatible"
      ? [openaiCompat, mistral]
      : prefer === "mistral"
        ? [mistral, openaiCompat]
        : [mistral, openaiCompat];

  for (const p of order) {
    if (p.checkAvailability().available) return { provider: p, availability };
  }
  return { provider: null, availability };
}

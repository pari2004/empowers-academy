import type { AiProviderAdapter, AiProviderName } from "./types";
import { createClaudeProvider } from "./providers/claude";
import { createOpenAiProvider } from "./providers/openai";
import { createGeminiProvider } from "./providers/gemini";

let cached: AiProviderAdapter | null = null;

/** Provider-agnostic factory — reads AI_PROVIDER (default "claude") and lazily builds/caches the matching adapter. */
export function getAiProvider(): AiProviderAdapter {
  const name = (process.env.AI_PROVIDER || "claude").toLowerCase() as AiProviderName;
  if (cached && cached.name === name) return cached;

  switch (name) {
    case "openai":
      cached = createOpenAiProvider();
      break;
    case "gemini":
      cached = createGeminiProvider();
      break;
    case "claude":
    default:
      cached = createClaudeProvider();
      break;
  }
  return cached;
}

export * from "./types";

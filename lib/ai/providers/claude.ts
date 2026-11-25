import { AiNotConfiguredError, type AiCompletionParams, type AiCompletionResult, type AiProviderAdapter } from "../types";

const DEFAULT_MODEL = "claude-sonnet-5";
const API_URL = "https://api.anthropic.com/v1/messages";

export function createClaudeProvider(): AiProviderAdapter {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  return {
    name: "claude",
    model,
    async complete(params: AiCompletionParams): Promise<AiCompletionResult> {
      if (!apiKey) throw new AiNotConfiguredError("claude");

      const system = params.jsonMode
        ? `${params.system ?? ""}\n\nRespond with ONLY valid JSON. No prose, no markdown code fences.`.trim()
        : params.system;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: params.maxTokens ?? 1024,
          temperature: params.temperature ?? 0.4,
          ...(system ? { system } : {}),
          messages: params.messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Claude API error ${res.status}: ${body.slice(0, 500)}`);
      }

      const json = await res.json();
      const text = (json.content ?? [])
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("");

      return {
        text,
        promptTokens: json.usage?.input_tokens,
        completionTokens: json.usage?.output_tokens,
        model,
      };
    },
  };
}

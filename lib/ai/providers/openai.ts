import { AiNotConfiguredError, type AiCompletionParams, type AiCompletionResult, type AiProviderAdapter } from "../types";

const DEFAULT_MODEL = "gpt-4o-mini";
const API_URL = "https://api.openai.com/v1/chat/completions";

export function createOpenAiProvider(): AiProviderAdapter {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  return {
    name: "openai",
    model,
    async complete(params: AiCompletionParams): Promise<AiCompletionResult> {
      if (!apiKey) throw new AiNotConfiguredError("openai");

      const messages = [
        ...(params.system ? [{ role: "system", content: params.system }] : []),
        ...params.messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: params.maxTokens ?? 1024,
          temperature: params.temperature ?? 0.4,
          ...(params.jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`OpenAI API error ${res.status}: ${body.slice(0, 500)}`);
      }

      const json = await res.json();
      const text = json.choices?.[0]?.message?.content ?? "";

      return {
        text,
        promptTokens: json.usage?.prompt_tokens,
        completionTokens: json.usage?.completion_tokens,
        model,
      };
    },
  };
}

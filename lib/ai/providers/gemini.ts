import { AiNotConfiguredError, type AiCompletionParams, type AiCompletionResult, type AiProviderAdapter } from "../types";

const DEFAULT_MODEL = "gemini-1.5-flash";

export function createGeminiProvider(): AiProviderAdapter {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  return {
    name: "gemini",
    model,
    async complete(params: AiCompletionParams): Promise<AiCompletionResult> {
      if (!apiKey) throw new AiNotConfiguredError("gemini");

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = params.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents,
          ...(params.system ? { systemInstruction: { parts: [{ text: params.system }] } } : {}),
          generationConfig: {
            maxOutputTokens: params.maxTokens ?? 1024,
            temperature: params.temperature ?? 0.4,
            ...(params.jsonMode ? { responseMimeType: "application/json" } : {}),
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 500)}`);
      }

      const json = await res.json();
      const text = (json.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");

      return {
        text,
        promptTokens: json.usageMetadata?.promptTokenCount,
        completionTokens: json.usageMetadata?.candidatesTokenCount,
        model,
      };
    },
  };
}

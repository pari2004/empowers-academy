import type { z, ZodTypeAny } from "zod";
import type { AiCompletionParams, AiProviderAdapter } from "./types";

function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export type CompleteJsonResult<T> = {
  data: T;
  promptTokens?: number;
  completionTokens?: number;
};

/**
 * Calls the provider in JSON mode and parses+validates the response against
 * `schema`. Retries once with a corrective follow-up message if the first
 * response isn't valid JSON matching the schema, then throws.
 */
export async function completeJson<S extends ZodTypeAny>(
  provider: AiProviderAdapter,
  params: AiCompletionParams,
  schema: S
): Promise<CompleteJsonResult<z.infer<S>>> {
  let messages = params.messages;

  for (let i = 0; i < 2; i++) {
    // Not wrapped in try/catch: a provider failure (e.g. AiNotConfiguredError,
    // a network error, a non-2xx API response) must propagate immediately —
    // only a malformed/non-JSON *response body* is retryable.
    const res = await provider.complete({ ...params, messages, jsonMode: true });

    let parsed: ReturnType<typeof schema.safeParse>;
    try {
      parsed = schema.safeParse(JSON.parse(stripFences(res.text)));
    } catch {
      parsed = schema.safeParse(undefined);
    }

    if (parsed.success) {
      return { data: parsed.data, promptTokens: res.promptTokens, completionTokens: res.completionTokens };
    }

    messages = [
      ...messages,
      { role: "assistant", content: res.text },
      {
        role: "user",
        content:
          "Your last response was not valid JSON matching the required schema. Respond again with ONLY valid JSON, no prose, no markdown fences.",
      },
    ];
  }

  throw new Error("AI response was not valid JSON matching the expected schema after retry");
}

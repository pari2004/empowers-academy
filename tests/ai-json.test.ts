import { describe, it, expect } from "vitest";
import { z } from "zod";
import { completeJson } from "@/lib/ai/json";
import type { AiCompletionParams, AiCompletionResult, AiProviderAdapter } from "@/lib/ai/types";

const schema = z.object({ score: z.number(), label: z.string() });

function fakeProvider(responses: string[]): AiProviderAdapter {
  let call = 0;
  return {
    name: "claude",
    model: "fake-model",
    async complete(_params: AiCompletionParams): Promise<AiCompletionResult> {
      const text = responses[Math.min(call, responses.length - 1)];
      call++;
      return { text, model: "fake-model" };
    },
  };
}

const baseParams: Omit<AiCompletionParams, "jsonMode"> = { messages: [{ role: "user", content: "hi" }] };

describe("completeJson", () => {
  it("parses a valid JSON response on the first try", async () => {
    const provider = fakeProvider([JSON.stringify({ score: 42, label: "ok" })]);
    const { data } = await completeJson(provider, baseParams, schema);
    expect(data).toEqual({ score: 42, label: "ok" });
  });

  it("strips markdown code fences before parsing", async () => {
    const provider = fakeProvider(["```json\n" + JSON.stringify({ score: 7, label: "fenced" }) + "\n```"]);
    const { data } = await completeJson(provider, baseParams, schema);
    expect(data).toEqual({ score: 7, label: "fenced" });
  });

  it("retries once when the first response is malformed, then succeeds", async () => {
    const provider = fakeProvider(["not json at all", JSON.stringify({ score: 1, label: "retried" })]);
    const { data } = await completeJson(provider, baseParams, schema);
    expect(data).toEqual({ score: 1, label: "retried" });
  });

  it("retries once when the first response doesn't match the schema, then succeeds", async () => {
    const provider = fakeProvider([JSON.stringify({ wrong: "shape" }), JSON.stringify({ score: 9, label: "fixed" })]);
    const { data } = await completeJson(provider, baseParams, schema);
    expect(data).toEqual({ score: 9, label: "fixed" });
  });

  it("throws a clear error if still invalid after the retry", async () => {
    const provider = fakeProvider(["still not json", "still not json either"]);
    await expect(completeJson(provider, baseParams, schema)).rejects.toThrow(/valid JSON/i);
  });
});

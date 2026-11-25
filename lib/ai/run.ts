import type { AiFeature } from "@prisma/client";
import type { z, ZodTypeAny } from "zod";
import { getAiProvider } from "./index";
import { completeJson } from "./json";
import { withAiLogging, type AiLogContext } from "./log";
import { saveInsight, type InsightScope } from "./cache";
import type { AiCompletionParams } from "./types";

/**
 * The common shape every structured (JSON) AI feature follows: build a
 * prompt, call the provider through the logger, validate+parse the result,
 * cache it as the entity's current AiInsight. Centralized here so the 9
 * JSON-producing feature services (lib/services/ai/*) stay a few lines each.
 */
export async function runCachedJsonFeature<S extends ZodTypeAny>(params: {
  feature: AiFeature;
  scope: InsightScope;
  actorId?: string | null;
  build: () => Omit<AiCompletionParams, "jsonMode">;
  schema: S;
}): Promise<z.infer<S>> {
  const provider = getAiProvider();
  const ctx: AiLogContext = { userId: params.actorId, entityType: params.scope.entityType, entityId: params.scope.entityId };

  const data = await withAiLogging(params.feature, ctx, async (provider) => {
    const { data, promptTokens, completionTokens } = await completeJson(provider, params.build(), params.schema);
    return { result: data, promptTokens, completionTokens };
  });

  await saveInsight(params.feature, params.scope, data, {
    provider: provider.name,
    model: provider.model,
    createdById: params.actorId,
  });

  return data;
}

/** For conversational (non-JSON, non-cached) calls — currently just the chat assistant. */
export async function runLoggedCompletion(params: {
  feature: AiFeature;
  ctx: AiLogContext;
  build: () => AiCompletionParams;
}): Promise<{ text: string }> {
  return withAiLogging(params.feature, params.ctx, async (provider) => {
    const res = await provider.complete(params.build());
    return { result: { text: res.text }, promptTokens: res.promptTokens, completionTokens: res.completionTokens };
  });
}

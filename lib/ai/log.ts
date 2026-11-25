import { prisma } from "@/lib/db";
import type { AiFeature } from "@prisma/client";
import { getAiProvider } from "./index";
import type { AiProviderAdapter } from "./types";

export type AiLogContext = {
  userId?: string | null;
  entityType?: string;
  entityId?: string;
};

type AiCallOutcome<T> = { result: T; promptTokens?: number; completionTokens?: number };

/**
 * Wraps every AI feature-service call: times it, resolves the provider once,
 * and writes exactly one AiRequestLog row regardless of outcome. Unlike
 * `logActivity`, a logging failure is swallowed (the write itself never
 * throws) but the original error from `fn` always propagates — callers must
 * still see AI failures.
 */
export async function withAiLogging<T>(
  feature: AiFeature,
  ctx: AiLogContext,
  fn: (provider: AiProviderAdapter) => Promise<AiCallOutcome<T>>
): Promise<T> {
  const provider = getAiProvider();
  const start = Date.now();

  try {
    const { result, promptTokens, completionTokens } = await fn(provider);
    await writeLog({
      feature,
      ctx,
      provider: provider.name,
      model: provider.model,
      latencyMs: Date.now() - start,
      status: "SUCCESS",
      promptTokens,
      completionTokens,
    });
    return result;
  } catch (err) {
    await writeLog({
      feature,
      ctx,
      provider: provider.name,
      model: provider.model,
      latencyMs: Date.now() - start,
      status: "ERROR",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

async function writeLog(params: {
  feature: AiFeature;
  ctx: AiLogContext;
  provider: string;
  model: string;
  latencyMs: number;
  status: "SUCCESS" | "ERROR";
  promptTokens?: number;
  completionTokens?: number;
  errorMessage?: string;
}): Promise<void> {
  try {
    await prisma.aiRequestLog.create({
      data: {
        feature: params.feature,
        provider: params.provider,
        model: params.model,
        userId: params.ctx.userId ?? null,
        entityType: params.ctx.entityType,
        entityId: params.ctx.entityId,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        latencyMs: params.latencyMs,
        status: params.status,
        errorMessage: params.errorMessage,
      },
    });
  } catch (err) {
    console.error("AI request logging failed", err);
  }
}

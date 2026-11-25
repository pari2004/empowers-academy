import { prisma } from "@/lib/db";
import type { AiFeature } from "@prisma/client";
import type { z, ZodTypeAny } from "zod";

/** Account-wide insights (no specific entity) use this sentinel for both entityType and entityId. */
export const GLOBAL_SCOPE = "global";

export type InsightScope = { entityType: string; entityId: string };

export async function saveInsight(
  feature: AiFeature,
  scope: InsightScope,
  data: unknown,
  meta: { provider: string; model: string; createdById?: string | null }
) {
  return prisma.aiInsight.upsert({
    where: { feature_entityType_entityId: { feature, entityType: scope.entityType, entityId: scope.entityId } },
    update: { data: data as never, provider: meta.provider, model: meta.model, createdById: meta.createdById ?? null },
    create: {
      feature,
      entityType: scope.entityType,
      entityId: scope.entityId,
      data: data as never,
      provider: meta.provider,
      model: meta.model,
      createdById: meta.createdById ?? null,
    },
  });
}

export function getInsight(feature: AiFeature, scope: InsightScope) {
  return prisma.aiInsight.findUnique({
    where: { feature_entityType_entityId: { feature, entityType: scope.entityType, entityId: scope.entityId } },
  });
}

/** Reads a cached insight and validates+unwraps its `data` against `schema` — the shape every getCachedX() feature helper returns. */
export async function getValidatedInsight<S extends ZodTypeAny>(
  feature: AiFeature,
  scope: InsightScope,
  schema: S
): Promise<z.infer<S> | null> {
  const cached = await getInsight(feature, scope);
  if (!cached) return null;
  const parsed = schema.safeParse(cached.data);
  return parsed.success ? parsed.data : null;
}

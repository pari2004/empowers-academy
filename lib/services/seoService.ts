import { prisma } from "@/lib/db";
import type { SeoMetaInput } from "@/lib/validation/seo";

export function listSeoMeta() {
  return prisma.seoMeta.findMany({ orderBy: { updatedAt: "desc" } });
}

export function getSeoMeta(entityType: string, entityId: string) {
  return prisma.seoMeta.findUnique({ where: { entityType_entityId: { entityType, entityId } } });
}

export async function upsertSeoMeta(input: SeoMetaInput) {
  return prisma.seoMeta.upsert({
    where: { entityType_entityId: { entityType: input.entityType, entityId: input.entityId } },
    update: input as never,
    create: input as never,
  });
}

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { BannerInput, BannerUpdateInput } from "@/lib/validation/banner";

export function listBanners() {
  return prisma.banner.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
}

export function getBannerById(id: string) {
  return prisma.banner.findFirst({ where: { id, deletedAt: null } });
}

export function getActiveBanners() {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      OR: [{ publishAt: null }, { publishAt: { lte: now } }],
      AND: [{ OR: [{ unpublishAt: null }, { unpublishAt: { gte: now } }] }],
    },
    orderBy: { order: "asc" },
  });
}

function toData(input: Partial<BannerInput>) {
  return {
    ...input,
    publishAt: input.publishAt !== undefined ? (input.publishAt ? new Date(input.publishAt) : null) : undefined,
    unpublishAt: input.unpublishAt !== undefined ? (input.unpublishAt ? new Date(input.unpublishAt) : null) : undefined,
  };
}

export async function createBanner(input: BannerInput, actorId?: string | null) {
  const banner = await prisma.banner.create({
    data: { ...toData(input), createdById: actorId ?? null, updatedById: actorId ?? null } as never,
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "banner", entityId: banner.id });
  return banner;
}

export async function updateBanner(id: string, input: BannerUpdateInput, actorId?: string | null) {
  const banner = await prisma.banner.update({ where: { id }, data: { ...toData(input), updatedById: actorId ?? null } as never });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "banner", entityId: id });
  return banner;
}

export async function deleteBanner(id: string, actorId?: string | null) {
  await prisma.banner.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "banner", entityId: id });
}

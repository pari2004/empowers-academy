import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createRevision } from "@/lib/revisions";
import type { LandingPageInput, LandingPageUpdateInput } from "@/lib/validation/landingPage";

export function listLandingPages() {
  return prisma.landingPage.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } });
}

export function getLandingPageById(id: string) {
  return prisma.landingPage.findFirst({ where: { id, deletedAt: null }, include: { sections: { orderBy: { order: "asc" } } } });
}

export function getPublishedLandingPageBySlug(slug: string) {
  return prisma.landingPage.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    include: { sections: { where: { enabled: true }, orderBy: { order: "asc" } } },
  });
}

export async function createLandingPage(input: LandingPageInput, actorId?: string | null) {
  const page = await prisma.landingPage.create({ data: { ...input, createdById: actorId ?? null, updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "landingPage", entityId: page.id });
  return page;
}

export async function updateLandingPage(id: string, input: LandingPageUpdateInput, actorId?: string | null) {
  const existing = await prisma.landingPage.findUnique({ where: { id } });
  if (!existing) throw new Error("Landing page not found");
  await createRevision({ entityType: "landingPage", entityId: id, data: existing, createdById: actorId });

  const page = await prisma.landingPage.update({
    where: { id },
    data: {
      ...input,
      publishedAt: input.status === "PUBLISHED" && existing.status !== "PUBLISHED" ? new Date() : undefined,
      version: { increment: 1 },
      updatedById: actorId ?? null,
    },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "landingPage", entityId: id });
  return page;
}

export async function deleteLandingPage(id: string, actorId?: string | null) {
  await prisma.landingPage.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "landingPage", entityId: id });
}

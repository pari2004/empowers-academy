import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createRevision } from "@/lib/revisions";
import type { AboutPageUpdateInput } from "@/lib/validation/aboutPage";

export async function getAboutPage() {
  const page = await prisma.aboutPage.findUnique({ where: { id: "singleton" } });
  return page ?? prisma.aboutPage.create({ data: { id: "singleton" } });
}

export async function getPublishedAboutPage() {
  const page = await prisma.aboutPage.findUnique({ where: { id: "singleton" } });
  if (!page || page.status !== "PUBLISHED") return null;
  return page;
}

export async function updateAboutPage(input: AboutPageUpdateInput, actorId?: string | null) {
  const existing = await getAboutPage();
  await createRevision({ entityType: "aboutPage", entityId: "singleton", data: existing, createdById: actorId });

  const wasPublished = existing.status === "PUBLISHED";
  const willBePublished = input.status ? input.status === "PUBLISHED" : wasPublished;

  const page = await prisma.aboutPage.upsert({
    where: { id: "singleton" },
    update: {
      ...input,
      publishedAt: input.publishedAt
        ? new Date(input.publishedAt)
        : !wasPublished && willBePublished
          ? new Date()
          : undefined,
      updatedById: actorId ?? null,
    } as never,
    create: { id: "singleton", ...input, updatedById: actorId ?? null } as never,
  });

  await logActivity({ userId: actorId, action: "UPDATE", entityType: "aboutPage", entityId: "singleton" });
  return page;
}

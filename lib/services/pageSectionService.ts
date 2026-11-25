import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createRevision } from "@/lib/revisions";

export function listSections(landingPageId: string | null) {
  return prisma.pageSection.findMany({ where: { landingPageId }, orderBy: { order: "asc" } });
}

export async function createSection(
  input: { landingPageId: string | null; type: string; config: Record<string, unknown>; backgroundColor?: string; order?: number },
  actorId?: string | null
) {
  const section = await prisma.pageSection.create({
    data: {
      landingPageId: input.landingPageId,
      type: input.type,
      config: input.config as never,
      backgroundColor: input.backgroundColor,
      order: input.order ?? 0,
      updatedById: actorId ?? null,
    },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "pageSection", entityId: section.id });
  return section;
}

export async function updateSection(
  id: string,
  input: Partial<{ enabled: boolean; config: Record<string, unknown>; backgroundColor: string | null }>,
  actorId?: string | null
) {
  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) throw new Error("Section not found");
  await createRevision({ entityType: "pageSection", entityId: id, data: existing, createdById: actorId });

  const section = await prisma.pageSection.update({
    where: { id },
    data: { ...input, version: { increment: 1 }, updatedById: actorId ?? null } as never,
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "pageSection", entityId: id });
  return section;
}

export async function deleteSection(id: string, actorId?: string | null) {
  await prisma.pageSection.delete({ where: { id } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "pageSection", entityId: id });
}

export async function reorderSections(orderedIds: string[], actorId?: string | null) {
  await prisma.$transaction(orderedIds.map((id, index) => prisma.pageSection.update({ where: { id }, data: { order: index } })));
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "pageSection", metadata: { reordered: true } });
}

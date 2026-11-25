import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { FaqInput, FaqUpdateInput } from "@/lib/validation/faq";

export function listFaqs() {
  return prisma.faq.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: { category: true },
  });
}

export function getFaqById(id: string) {
  return prisma.faq.findFirst({ where: { id, deletedAt: null } });
}

export function listGlobalPublishedFaqs() {
  return prisma.faq.findMany({
    where: { deletedAt: null, status: "PUBLISHED", courseId: null },
    orderBy: { order: "asc" },
  });
}

export function listFaqCategories() {
  return prisma.faqCategory.findMany({ orderBy: { order: "asc" } });
}

export async function createFaqCategory(name: string, order = 0) {
  return prisma.faqCategory.create({ data: { name, order } });
}

export async function createFaq(input: FaqInput, actorId?: string | null) {
  const faq = await prisma.faq.create({
    data: { ...input, createdById: actorId ?? null, updatedById: actorId ?? null },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "faq", entityId: faq.id });
  return faq;
}

export async function updateFaq(id: string, input: FaqUpdateInput, actorId?: string | null) {
  const faq = await prisma.faq.update({ where: { id }, data: { ...input, updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "faq", entityId: id });
  return faq;
}

export async function deleteFaq(id: string, actorId?: string | null) {
  await prisma.faq.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "faq", entityId: id });
}

export async function reorderFaqs(orderedIds: string[], actorId?: string | null) {
  await prisma.$transaction(orderedIds.map((id, index) => prisma.faq.update({ where: { id }, data: { order: index } })));
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "faq", metadata: { reordered: true } });
}

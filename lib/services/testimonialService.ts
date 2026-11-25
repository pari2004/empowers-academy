import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { TestimonialInput, TestimonialUpdateInput } from "@/lib/validation/testimonial";

export async function listTestimonials() {
  return prisma.testimonial.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
}

export function getTestimonialById(id: string) {
  return prisma.testimonial.findFirst({ where: { id, deletedAt: null } });
}

export function getFeaturedTestimonials() {
  return prisma.testimonial.findMany({
    where: { deletedAt: null, status: "PUBLISHED", featured: true },
    orderBy: { order: "asc" },
  });
}

export function getTestimonialsByIds(ids: string[]) {
  if (ids.length === 0) return Promise.resolve([]);
  return prisma.testimonial.findMany({
    where: { id: { in: ids }, deletedAt: null, status: "PUBLISHED" },
    orderBy: { order: "asc" },
  });
}

export async function createTestimonial(input: TestimonialInput, actorId?: string | null) {
  const testimonial = await prisma.testimonial.create({
    data: { ...input, createdById: actorId ?? null, updatedById: actorId ?? null },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "testimonial", entityId: testimonial.id });
  return testimonial;
}

export async function updateTestimonial(id: string, input: TestimonialUpdateInput, actorId?: string | null) {
  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: { ...input, updatedById: actorId ?? null },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "testimonial", entityId: id });
  return testimonial;
}

export async function deleteTestimonial(id: string, actorId?: string | null) {
  await prisma.testimonial.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "testimonial", entityId: id });
}

export async function reorderTestimonials(orderedIds: string[], actorId?: string | null) {
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.testimonial.update({ where: { id }, data: { order: index } }))
  );
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "testimonial", metadata: { reordered: true } });
}

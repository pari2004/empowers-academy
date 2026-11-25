import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createRevision } from "@/lib/revisions";
import type { InstructorInput, InstructorUpdateInput } from "@/lib/validation/instructor";

export type ListInstructorsParams = { page?: number; pageSize?: number; search?: string };

export async function listInstructors(params: ListInstructorsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    deletedAt: null,
    ...(params.search ? { name: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.instructor.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.instructor.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getInstructorById(id: string) {
  return prisma.instructor.findFirst({ where: { id, deletedAt: null } });
}

export function getFeaturedInstructors() {
  return prisma.instructor.findMany({
    where: { deletedAt: null, status: "PUBLISHED", featured: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createInstructor(input: InstructorInput, actorId?: string | null) {
  const instructor = await prisma.instructor.create({
    data: { ...input, createdById: actorId ?? null, updatedById: actorId ?? null } as never,
  });
  await createRevision({ entityType: "instructor", entityId: instructor.id, data: instructor, createdById: actorId });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "instructor", entityId: instructor.id });
  return instructor;
}

export async function updateInstructor(id: string, input: InstructorUpdateInput, actorId?: string | null) {
  const existing = await getInstructorById(id);
  if (!existing) throw new Error("Instructor not found");
  await createRevision({ entityType: "instructor", entityId: id, data: existing, createdById: actorId });

  const updated = await prisma.instructor.update({
    where: { id },
    data: { ...input, version: { increment: 1 }, updatedById: actorId ?? null } as never,
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "instructor", entityId: id });
  return updated;
}

export async function deleteInstructor(id: string, actorId?: string | null) {
  await prisma.instructor.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "instructor", entityId: id });
}

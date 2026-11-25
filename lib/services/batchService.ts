import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { BatchInput, BatchUpdateInput } from "@/lib/validation/batch";
import type { BatchStatus } from "@prisma/client";

const include = {
  course: { select: { id: true, title: true } },
  instructor: { select: { id: true, name: true } },
} as const;

export type ListBatchesParams = { page?: number; pageSize?: number; status?: BatchStatus; courseId?: string; search?: string };

export async function listBatches(params: ListBatchesParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.courseId ? { courseId: params.courseId } : {}),
    ...(params.search ? { name: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.batch.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include }),
    prisma.batch.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getBatchById(id: string) {
  return prisma.batch.findFirst({ where: { id, deletedAt: null }, include });
}

export async function createBatch(input: BatchInput, actorId?: string | null) {
  const batch = await prisma.batch.create({
    data: {
      name: input.name,
      courseId: input.courseId,
      instructorId: input.instructorId,
      timing: input.timing,
      capacity: input.capacity,
      startDate: input.startDate,
      endDate: input.endDate,
      meetingLink: input.meetingLink,
      status: input.status,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
    include,
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "batch", entityId: batch.id });
  return batch;
}

export async function updateBatch(id: string, input: BatchUpdateInput, actorId?: string | null) {
  const batch = await prisma.batch.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.courseId !== undefined && { courseId: input.courseId }),
      ...(input.instructorId !== undefined && { instructorId: input.instructorId }),
      ...(input.timing !== undefined && { timing: input.timing }),
      ...(input.capacity !== undefined && { capacity: input.capacity }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.endDate !== undefined && { endDate: input.endDate }),
      ...(input.meetingLink !== undefined && { meetingLink: input.meetingLink }),
      ...(input.status !== undefined && { status: input.status }),
      updatedById: actorId ?? null,
    },
    include,
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "batch", entityId: id });
  return batch;
}

export async function deleteBatch(id: string, actorId?: string | null) {
  await prisma.batch.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "batch", entityId: id });
}

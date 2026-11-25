import { prisma } from "@/lib/db";
import type { AiFeature, AiRequestStatus } from "@prisma/client";

export type ListAiRequestLogsParams = { page?: number; pageSize?: number; feature?: AiFeature; status?: AiRequestStatus };

/** Mirrors activityLogService.listActivityLogs()'s pagination + user-lookup pattern. */
export async function listAiRequestLogs(params: ListAiRequestLogsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 30;
  const where = {
    ...(params.feature ? { feature: params.feature } : {}),
    ...(params.status ? { status: params.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.aiRequestLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.aiRequestLog.count({ where }),
  ]);

  const userIds = [...new Set(items.map((i) => i.userId).filter((id): id is string => !!id))];
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
    : [];
  const userById = new Map(users.map((u) => [u.id, u]));

  return {
    items: items.map((i) => ({ ...i, user: i.userId ? (userById.get(i.userId) ?? null) : null })),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

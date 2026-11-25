import { prisma } from "@/lib/db";

export type ListActivityParams = { page?: number; pageSize?: number; action?: string; entityType?: string };

export async function listActivityLogs(params: ListActivityParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 30;
  const where = {
    ...(params.action ? { action: params.action } : {}),
    ...(params.entityType ? { entityType: params.entityType } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.activityLog.count({ where }),
  ]);

  const userIds = [...new Set(items.map((i) => i.userId).filter((id): id is string => !!id))];
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } });
  const userById = new Map(users.map((u) => [u.id, u]));

  return {
    items: items.map((i) => ({ ...i, user: i.userId ? userById.get(i.userId) ?? null : null })),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

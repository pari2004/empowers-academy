import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export type ListSubscribersParams = { page?: number; pageSize?: number; search?: string };

export async function listSubscribers(params: ListSubscribersParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = params.search ? { email: { contains: params.search, mode: "insensitive" as const } } : {};

  const [items, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function listAllSubscribersForExport() {
  return prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
}

export async function subscribe(email: string, source?: string) {
  return prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isActive: true },
    create: { email, source },
  });
}

export async function importSubscribers(emails: string[]) {
  const results = await Promise.allSettled(
    emails.map((email) => prisma.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email, source: "import" } }))
  );
  return results.filter((r) => r.status === "fulfilled").length;
}

export async function deleteSubscriber(id: string, actorId?: string | null) {
  await prisma.newsletterSubscriber.delete({ where: { id } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "newsletterSubscriber", entityId: id });
}

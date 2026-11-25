import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { NotificationType, NotificationPriority, Prisma } from "@prisma/client";
import type { RoleName } from "@/lib/rbac";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  priority?: NotificationPriority;
};

/** Fire-and-forget, like `logActivity` — a notification failure must never break the calling mutation. */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const pref = await prisma.notificationPreference.findUnique({ where: { userId: input.userId } });
    if (pref && (!pref.inAppEnabled || pref.mutedTypes.includes(input.type))) return;

    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        priority: input.priority ?? "MEDIUM",
      },
    });
  } catch (err) {
    console.error("createNotification failed", err);
  }
}

export async function notifyUsers(userIds: string[], input: Omit<CreateNotificationInput, "userId">): Promise<void> {
  await Promise.all(userIds.map((userId) => createNotification({ ...input, userId })));
}

/** Notifies every active user holding `roleName` — used by the NOTIFY_ADMIN workflow action and system alerts. */
export async function notifyRole(roleName: RoleName, input: Omit<CreateNotificationInput, "userId">): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { role: { name: roleName }, isActive: true, deletedAt: null },
      select: { id: true },
    });
    await notifyUsers(
      users.map((u) => u.id),
      input
    );
  } catch (err) {
    console.error("notifyRole failed", err);
  }
}

export type ListNotificationsParams = {
  isRead?: boolean;
  isArchived?: boolean;
  priority?: NotificationPriority;
  page?: number;
  pageSize?: number;
};

/** Always scoped to `userId` — every caller (any role, including STUDENT) only ever sees their own notifications. */
export async function listForUser(userId: string, params: ListNotificationsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.NotificationWhereInput = {
    userId,
    isArchived: params.isArchived ?? false,
    ...(params.isRead !== undefined ? { isRead: params.isRead } : {}),
    ...(params.priority ? { priority: params.priority } : {}),
  };

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false, isArchived: false } }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize), unreadCount };
}

export function markRead(id: string, userId: string) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true, readAt: new Date() } });
}

export function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export function archiveNotification(id: string, userId: string) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { isArchived: true, archivedAt: new Date() } });
}

const DEFAULT_PREFERENCE = {
  emailEnabled: true,
  inAppEnabled: true,
  whatsappEnabled: false,
  smsEnabled: false,
  pushEnabled: false,
  mutedTypes: [] as NotificationType[],
};

export async function getPreference(userId: string) {
  const pref = await prisma.notificationPreference.findUnique({ where: { userId } });
  return pref ?? { userId, ...DEFAULT_PREFERENCE };
}

export type PreferenceInput = {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  mutedTypes: NotificationType[];
};

export async function upsertPreference(userId: string, input: PreferenceInput, actorId?: string | null) {
  const pref = await prisma.notificationPreference.upsert({
    where: { userId },
    update: input,
    create: { userId, ...input },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "notificationPreference", entityId: userId });
  return pref;
}

export type NotificationChannel = "email" | "whatsapp" | "sms" | "push";

/** Used by emailService/whatsappService/smsService/reminderService before dispatching on a non-in-app channel. */
export async function isChannelEnabled(userId: string, channel: NotificationChannel, type: NotificationType): Promise<boolean> {
  const pref = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!pref) return channel === "email";
  if (pref.mutedTypes.includes(type)) return false;
  switch (channel) {
    case "email":
      return pref.emailEnabled;
    case "whatsapp":
      return pref.whatsappEnabled;
    case "sms":
      return pref.smsEnabled;
    case "push":
      return pref.pushEnabled;
  }
}

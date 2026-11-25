// Named `communicationReminderService` (not `reminderService`) — that name is
// already taken by the Payments module's installment-dunning reminder
// service (lib/services/reminderService.ts, keyed off the payment-specific
// `ReminderType` enum). This is a distinct, generic reminder concept for
// Phase 6 (`Reminder` model / `ReminderCategory` enum) — unrelated domain,
// deliberately different file and type names to avoid colliding with it.

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/services/notificationService";
import type { ReminderInput, ReminderUpdateInput, ReminderListQuery } from "@/lib/validation/reminder";
import { Prisma } from "@prisma/client";
import type { NotificationType, ReminderRecurrence } from "@prisma/client";

export async function listReminders(params: ReminderListQuery) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.ReminderWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.type ? { type: params.type } : {}),
    ...(params.assignedToId ? { assignedToId: params.assignedToId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.reminder.findMany({ where, orderBy: { dueAt: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.reminder.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getReminderById(id: string) {
  return prisma.reminder.findUnique({ where: { id } });
}

export async function createReminder(input: ReminderInput, actorId?: string | null) {
  const reminder = await prisma.reminder.create({
    data: {
      ...input,
      recurrenceConfig:
        input.recurrenceConfig === null ? Prisma.JsonNull : (input.recurrenceConfig as Prisma.InputJsonValue | undefined),
      createdById: actorId ?? null,
    },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "reminder", entityId: reminder.id });
  return reminder;
}

export async function updateReminder(id: string, input: ReminderUpdateInput, actorId?: string | null) {
  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      ...input,
      recurrenceConfig:
        input.recurrenceConfig === null ? Prisma.JsonNull : (input.recurrenceConfig as Prisma.InputJsonValue | undefined),
    },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "reminder", entityId: id });
  return reminder;
}

export async function dismissReminder(id: string, actorId?: string | null) {
  const reminder = await prisma.reminder.update({ where: { id }, data: { status: "DISMISSED" } });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "reminder", entityId: id, metadata: { status: "DISMISSED" } });
  return reminder;
}

export async function deleteReminder(id: string, actorId?: string | null) {
  await prisma.reminder.delete({ where: { id } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "reminder", entityId: id });
}

function computeNextDueDate(dueAt: Date, recurrence: ReminderRecurrence): Date | null {
  switch (recurrence) {
    case "DAILY":
      return new Date(dueAt.getTime() + 86_400_000);
    case "WEEKLY":
      return new Date(dueAt.getTime() + 7 * 86_400_000);
    case "MONTHLY": {
      const next = new Date(dueAt);
      next.setMonth(next.getMonth() + 1);
      return next;
    }
    case "NONE":
    case "CUSTOM":
    default:
      // CUSTOM recurrence rules are read from recurrenceConfig by whichever
      // integration defines them — not auto-advanced generically here.
      return null;
  }
}

function mapToNotificationType(category: string): NotificationType {
  switch (category) {
    case "FOLLOW_UP":
      return "FOLLOW_UP_REMINDER";
    case "PENDING_PAYMENT":
      return "PAYMENT_OVERDUE";
    case "CERTIFICATE_READY":
      return "CERTIFICATE_GENERATED";
    default:
      return "GENERAL";
  }
}

/** Cron entry point: turns due reminders into notifications, advancing recurring ones instead of closing them out. */
export async function processDueReminders(): Promise<{ processed: number }> {
  const due = await prisma.reminder.findMany({ where: { status: "PENDING", dueAt: { lte: new Date() } } });

  for (const reminder of due) {
    if (reminder.assignedToId) {
      await createNotification({
        userId: reminder.assignedToId,
        type: mapToNotificationType(reminder.type),
        title: reminder.title,
        body: reminder.description ?? reminder.title,
        entityType: reminder.entityType ?? undefined,
        entityId: reminder.entityId ?? undefined,
      });
    }

    const next = computeNextDueDate(reminder.dueAt, reminder.recurrence);
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: next
        ? { dueAt: next, nextTriggerAt: next, lastTriggeredAt: new Date() }
        : { status: "SENT", lastTriggeredAt: new Date() },
    });
  }

  return { processed: due.length };
}

/**
 * Scans upcoming Follow-ups, Demo Classes, and Batch Starts and creates a
 * `Reminder` row if one doesn't already exist for that entity+type+dueAt.
 * Assignment-due/certificate-ready reminders are manually created only — no
 * Assignment/Certificate model exists in the LMS to scan yet. Pending-payment
 * reminders intentionally aren't duplicated here — the Payments module
 * already runs its own installment dunning cycle (lib/services/reminderService.ts).
 */
export async function generateSystemReminders(): Promise<{ created: number }> {
  let created = 0;
  const horizon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const followUpLeads = await prisma.lead.findMany({
    where: { deletedAt: null, nextFollowUpAt: { lte: horizon, not: null } },
    select: { id: true, name: true, nextFollowUpAt: true, assignedToId: true },
  });
  for (const lead of followUpLeads) {
    if (!lead.nextFollowUpAt) continue;
    const exists = await prisma.reminder.findFirst({ where: { type: "FOLLOW_UP", leadId: lead.id, dueAt: lead.nextFollowUpAt } });
    if (exists) continue;
    await prisma.reminder.create({
      data: {
        type: "FOLLOW_UP",
        title: `Follow up with ${lead.name}`,
        dueAt: lead.nextFollowUpAt,
        leadId: lead.id,
        entityType: "lead",
        entityId: lead.id,
        assignedToId: lead.assignedToId,
      },
    });
    created += 1;
  }

  const demoLeads = await prisma.lead.findMany({
    where: { deletedAt: null, sessionScheduledAt: { lte: horizon, not: null } },
    select: { id: true, name: true, sessionScheduledAt: true, assignedToId: true },
  });
  for (const lead of demoLeads) {
    if (!lead.sessionScheduledAt) continue;
    const exists = await prisma.reminder.findFirst({ where: { type: "DEMO_CLASS", leadId: lead.id, dueAt: lead.sessionScheduledAt } });
    if (exists) continue;
    await prisma.reminder.create({
      data: {
        type: "DEMO_CLASS",
        title: `Session with ${lead.name}`,
        dueAt: lead.sessionScheduledAt,
        leadId: lead.id,
        entityType: "lead",
        entityId: lead.id,
        assignedToId: lead.assignedToId,
      },
    });
    created += 1;
  }

  const upcomingBatches = await prisma.batch.findMany({
    where: { deletedAt: null, status: "UPCOMING", startDate: { lte: horizon, not: null } },
    select: { id: true, name: true, startDate: true },
  });
  for (const batch of upcomingBatches) {
    if (!batch.startDate) continue;
    const exists = await prisma.reminder.findFirst({ where: { type: "BATCH_START", batchId: batch.id, dueAt: batch.startDate } });
    if (exists) continue;
    await prisma.reminder.create({
      data: {
        type: "BATCH_START",
        title: `Batch "${batch.name}" starts soon`,
        dueAt: batch.startDate,
        batchId: batch.id,
        entityType: "batch",
        entityId: batch.id,
      },
    });
    created += 1;
  }

  return { created };
}

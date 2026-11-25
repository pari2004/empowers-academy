import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/services/settingsService";

export type CalendarEventType = "FOLLOW_UP" | "DEMO_CLASS" | "BATCH_START" | "PAYMENT_DUE" | "REMINDER" | "HOLIDAY";

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  title: string;
  date: Date;
  entityType?: string;
  entityId?: string;
  link?: string;
};

/** Aggregates every date-bearing Phase 6 + CRM/Payments concept into one feed for the admin Calendar (day/week/month views). */
export async function getEvents(range: { from: Date; to: Date }): Promise<CalendarEvent[]> {
  const [reminders, followUpLeads, demoLeads, batches, installments, settings] = await Promise.all([
    prisma.reminder.findMany({ where: { dueAt: { gte: range.from, lte: range.to } } }),
    prisma.lead.findMany({
      where: { deletedAt: null, nextFollowUpAt: { gte: range.from, lte: range.to } },
      select: { id: true, name: true, nextFollowUpAt: true },
    }),
    prisma.lead.findMany({
      where: { deletedAt: null, sessionScheduledAt: { gte: range.from, lte: range.to } },
      select: { id: true, name: true, sessionScheduledAt: true },
    }),
    prisma.batch.findMany({
      where: { deletedAt: null, startDate: { gte: range.from, lte: range.to } },
      select: { id: true, name: true, startDate: true },
    }),
    prisma.installment.findMany({
      where: { status: { in: ["PENDING", "OVERDUE"] }, dueDate: { gte: range.from, lte: range.to } },
      include: { student: { select: { id: true, name: true } } },
    }),
    getSiteSettings(),
  ]);

  const events: CalendarEvent[] = [];

  for (const r of reminders) {
    events.push({
      id: `reminder-${r.id}`,
      type: "REMINDER",
      title: r.title,
      date: r.dueAt,
      entityType: r.entityType ?? undefined,
      entityId: r.entityId ?? undefined,
      link: "/admin/reminders",
    });
  }
  for (const l of followUpLeads) {
    if (!l.nextFollowUpAt) continue;
    events.push({ id: `followup-${l.id}`, type: "FOLLOW_UP", title: `Follow up: ${l.name}`, date: l.nextFollowUpAt, entityType: "lead", entityId: l.id, link: `/admin/leads/${l.id}` });
  }
  for (const l of demoLeads) {
    if (!l.sessionScheduledAt) continue;
    events.push({ id: `demo-${l.id}`, type: "DEMO_CLASS", title: `Session: ${l.name}`, date: l.sessionScheduledAt, entityType: "lead", entityId: l.id, link: `/admin/leads/${l.id}` });
  }
  for (const b of batches) {
    if (!b.startDate) continue;
    events.push({ id: `batch-${b.id}`, type: "BATCH_START", title: `Batch starts: ${b.name}`, date: b.startDate, entityType: "batch", entityId: b.id, link: `/admin/batches/${b.id}` });
  }
  for (const i of installments) {
    events.push({ id: `installment-${i.id}`, type: "PAYMENT_DUE", title: `Payment due: ${i.student.name}`, date: i.dueDate, entityType: "student", entityId: i.student.id, link: `/admin/students/${i.student.id}` });
  }

  const holidays = ((settings as { holidays?: Array<{ date: string; name: string }> | null }).holidays ?? []) ?? [];
  for (const h of holidays) {
    const date = new Date(h.date);
    if (date >= range.from && date <= range.to) {
      events.push({ id: `holiday-${h.date}-${h.name}`, type: "HOLIDAY", title: h.name, date });
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

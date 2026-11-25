import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { NOTIFIERS } from "@/lib/notifications";
import type { ReminderType } from "@prisma/client";

const UPCOMING_WINDOW_DAYS = 3;
const FINAL_THRESHOLD_DAYS = 14;

export async function listDueReminders(type: ReminderType) {
  const now = new Date();

  if (type === "UPCOMING") {
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + UPCOMING_WINDOW_DAYS);
    return prisma.installment.findMany({
      where: { status: "PENDING", dueDate: { gte: now, lte: windowEnd } },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
  }

  if (type === "FINAL") {
    const finalCutoff = new Date(now);
    finalCutoff.setDate(finalCutoff.getDate() - FINAL_THRESHOLD_DAYS);
    return prisma.installment.findMany({
      where: { status: "OVERDUE", dueDate: { lte: finalCutoff }, lastReminderType: { not: "FINAL" } },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
  }

  return prisma.installment.findMany({
    where: { status: "OVERDUE", lastReminderType: { not: "FINAL" } },
    include: { student: { select: { id: true, name: true, email: true } } },
  });
}

function messageFor(type: ReminderType, studentName: string, amount: number, dueDate: Date): { subject: string; message: string } {
  const formattedAmount = `Rs. ${amount.toFixed(2)}`;
  const formattedDate = dueDate.toLocaleDateString();
  if (type === "UPCOMING") {
    return {
      subject: "Upcoming fee installment due",
      message: `Dear ${studentName}, your installment of ${formattedAmount} is due on ${formattedDate}. Please make the payment on time.`,
    };
  }
  if (type === "FINAL") {
    return {
      subject: "Final notice: overdue fee installment",
      message: `Dear ${studentName}, your installment of ${formattedAmount} (due ${formattedDate}) is significantly overdue. Please clear this immediately to avoid further action.`,
    };
  }
  return {
    subject: "Overdue fee installment",
    message: `Dear ${studentName}, your installment of ${formattedAmount} was due on ${formattedDate} and is now overdue. Please make the payment at the earliest.`,
  };
}

export async function sendInstallmentReminder(installmentId: string, type: ReminderType, actorId?: string | null) {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { student: { select: { id: true, name: true, email: true } } },
  });
  if (!installment) throw new Error("Installment not found");
  if (!installment.student.email) throw new Error("Student has no email address on file");

  const { subject, message } = messageFor(type, installment.student.name, Number(installment.amount), installment.dueDate);
  await NOTIFIERS.EMAIL.send({ to: installment.student.email, subject, message });

  const updated = await prisma.installment.update({
    where: { id: installmentId },
    data: { remindersSentCount: { increment: 1 }, lastReminderAt: new Date(), lastReminderType: type },
  });

  await logActivity({ userId: actorId, action: "UPDATE", entityType: "installment", entityId: installmentId, metadata: { reminderSent: type } });
  return updated;
}

export async function sendBulkReminders(type: ReminderType, actorId?: string | null) {
  const due = await listDueReminders(type);
  let sent = 0;
  let failed = 0;

  for (const installment of due) {
    try {
      await sendInstallmentReminder(installment.id, type, actorId);
      sent++;
    } catch (err) {
      console.error(`sendBulkReminders: failed for installment ${installment.id}`, err);
      failed++;
    }
  }

  return { sent, failed, total: due.length };
}

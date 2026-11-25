// Same reuse pattern as whatsappService.ts: delegates delivery to the
// existing `NOTIFIERS.SMS` registry (lib/notifications/smsNotifier.ts, a
// logging no-op today) and adds the persisted `SmsLog` + `CommunicationLog`
// tracking layer that doesn't exist elsewhere.

import { prisma } from "@/lib/db";
import { NOTIFIERS } from "@/lib/notifications";
import { logCommunication } from "@/lib/services/communicationService";
import type { SmsSendInput } from "@/lib/validation/sms";
import type { Prisma } from "@prisma/client";

export async function sendSms(input: SmsSendInput, actorId?: string | null) {
  const log = await prisma.smsLog.create({
    data: {
      toPhone: input.toPhone,
      message: input.message,
      purpose: input.purpose,
      status: "QUEUED",
      leadId: input.leadId ?? null,
      studentId: input.studentId ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      createdById: actorId ?? null,
    },
  });

  let status: "SENT" | "FAILED" = "SENT";
  let errorMessage: string | null = null;
  try {
    await NOTIFIERS.SMS.send({ to: input.toPhone, message: input.message });
  } catch (err) {
    status = "FAILED";
    errorMessage = err instanceof Error ? err.message : "Unknown SMS send error";
  }

  const updated = await prisma.smsLog.update({
    where: { id: log.id },
    data: { status, errorMessage },
  });

  await logCommunication(
    {
      channel: "SMS",
      direction: "OUTBOUND",
      summary: input.message,
      status: status === "SENT" ? "SENT" : "FAILED",
      leadId: input.leadId ?? null,
      studentId: input.studentId ?? null,
    },
    actorId
  );

  return updated;
}

export async function listSmsLogs(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.SmsLogWhereInput = {};

  const [items, total] = await Promise.all([
    prisma.smsLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.smsLog.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

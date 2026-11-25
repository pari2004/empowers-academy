// Delegates actual delivery to the existing `NOTIFIERS.WHATSAPP` registry
// (lib/notifications/whatsappNotifier.ts) — that's already the "architecture
// ready" pluggable-provider seam (currently a logging no-op; swapping in the
// real WhatsApp Business API later is a one-file change there). This service
// adds what doesn't exist elsewhere yet: a persisted `WhatsAppLog` row per
// message and a `CommunicationLog` entry for the unified history/timeline.

import { prisma } from "@/lib/db";
import { NOTIFIERS } from "@/lib/notifications";
import { logCommunication } from "@/lib/services/communicationService";
import type { WhatsAppSendInput } from "@/lib/validation/whatsapp";
import type { Prisma } from "@prisma/client";

export async function sendWhatsApp(input: WhatsAppSendInput, actorId?: string | null) {
  const log = await prisma.whatsAppLog.create({
    data: {
      toPhone: input.toPhone,
      templateName: input.templateName ?? null,
      message: input.message,
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
    await NOTIFIERS.WHATSAPP.send({ to: input.toPhone, message: input.message });
  } catch (err) {
    status = "FAILED";
    errorMessage = err instanceof Error ? err.message : "Unknown WhatsApp send error";
  }

  const updated = await prisma.whatsAppLog.update({
    where: { id: log.id },
    data: { status, errorMessage },
  });

  await logCommunication(
    {
      channel: "WHATSAPP",
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

export async function listWhatsAppLogs(params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.WhatsAppLogWhereInput = {};

  const [items, total] = await Promise.all([
    prisma.whatsAppLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.whatsAppLog.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

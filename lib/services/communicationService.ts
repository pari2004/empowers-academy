import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { LogCommunicationInput, CommunicationListQuery } from "@/lib/validation/communication";

/** Writes the unified cross-channel history row. Called internally by emailService/whatsappService/smsService — never throws, matches the fire-and-forget audit convention. */
export async function logCommunication(input: LogCommunicationInput, actorId?: string | null) {
  try {
    return await prisma.communicationLog.create({
      data: {
        channel: input.channel,
        direction: input.direction ?? "OUTBOUND",
        subject: input.subject ?? null,
        summary: input.summary,
        status: input.status ?? "SENT",
        leadId: input.leadId ?? null,
        studentId: input.studentId ?? null,
        counsellorId: input.counsellorId ?? null,
        trainerId: input.trainerId ?? null,
        batchId: input.batchId ?? null,
        createdById: actorId ?? null,
      },
    });
  } catch (err) {
    console.error("logCommunication failed", err);
    return null;
  }
}

export async function listCommunications(params: CommunicationListQuery) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const where: Prisma.CommunicationLogWhereInput = {
    ...(params.channel ? { channel: params.channel } : {}),
    ...(params.entityType === "lead" && params.entityId ? { leadId: params.entityId } : {}),
    ...(params.entityType === "student" && params.entityId ? { studentId: params.entityId } : {}),
    ...(params.entityType === "batch" && params.entityId ? { batchId: params.entityId } : {}),
    ...(params.dateFrom || params.dateTo
      ? {
          createdAt: {
            ...(params.dateFrom ? { gte: params.dateFrom } : {}),
            ...(params.dateTo ? { lte: params.dateTo } : {}),
          },
        }
      : {}),
    ...(params.search
      ? {
          OR: [
            { subject: { contains: params.search, mode: "insensitive" as const } },
            { summary: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.communicationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.communicationLog.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export type TimelineEntry = {
  id: string;
  source: "communication" | "activity";
  createdAt: Date;
  label: string;
  detail: string | null;
  metadata?: Record<string, unknown> | null;
};

/** Merges CommunicationLog + the existing ActivityLog into one chronological feed for a Lead/Student detail page. */
export async function getTimelineForEntity(entityType: "lead" | "student", entityId: string): Promise<TimelineEntry[]> {
  const [comms, activity] = await Promise.all([
    prisma.communicationLog.findMany({
      where: entityType === "lead" ? { leadId: entityId } : { studentId: entityId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.activityLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const entries: TimelineEntry[] = [
    ...comms.map((c) => ({
      id: c.id,
      source: "communication" as const,
      createdAt: c.createdAt,
      label: `${c.channel} · ${c.status}`,
      detail: c.summary,
    })),
    ...activity.map((a) => ({
      id: a.id,
      source: "activity" as const,
      createdAt: a.createdAt,
      label: a.action,
      detail: null,
      metadata: a.metadata as Record<string, unknown> | null,
    })),
  ];

  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

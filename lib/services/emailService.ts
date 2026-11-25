import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { ApiError } from "@/lib/api-guard";
import { getSiteSettings } from "@/lib/services/settingsService";
import { logCommunication } from "@/lib/services/communicationService";
import { renderTemplate } from "@/lib/templateVariables";
import type { Prisma } from "@prisma/client";
import type { EmailListQuery } from "@/lib/validation/email";

type Attachment = { url: string; filename: string; size?: number };

export type SendEmailParams = {
  templateId?: string | null;
  to: string;
  toName?: string | null;
  subject?: string;
  bodyHtml?: string;
  ccEmails?: string[];
  bccEmails?: string[];
  attachments?: Attachment[];
  scheduledAt?: Date | null;
  templateVariables?: Record<string, string | number>;
  isDraft?: boolean;
  bulkSendId?: string | null;
  leadId?: string | null;
  studentId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

/** Builds a nodemailer transport from SiteSettings (Admin → Global Settings), falling back to SMTP_* env vars. Returns null if unconfigured. */
async function getTransporter() {
  const settings = await getSiteSettings();
  const host = settings.smtpHost || process.env.SMTP_HOST;
  const port = settings.smtpPort || Number(process.env.SMTP_PORT || 0);
  const user = settings.smtpUser || process.env.SMTP_USER;
  const pass = settings.smtpPassword || process.env.SMTP_PASSWORD;
  if (!host || !port) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

function trackingPixelUrl(emailLogId: string): string {
  const base = (process.env.EMAIL_TRACKING_BASE_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
  return `${base}/api/track/email/${emailLogId}/open`;
}

/**
 * Creates the EmailLog row and, unless it's a draft or scheduled for later,
 * attempts to send it immediately. Never throws on send failure — the
 * failure is recorded on the log row (status=FAILED) instead, matching the
 * fire-and-forget convention used elsewhere for background side effects.
 */
export async function sendEmail(params: SendEmailParams, actorId?: string | null) {
  let subject = params.subject ?? "";
  let bodyHtml = params.bodyHtml ?? "";

  if (params.templateId) {
    const template = await prisma.emailTemplate.findUnique({ where: { id: params.templateId } });
    if (!template) throw new ApiError("Email template not found", 404);
    subject = renderTemplate(template.subject, params.templateVariables ?? {});
    bodyHtml = renderTemplate(template.bodyHtml, params.templateVariables ?? {});
  }

  const settings = await getSiteSettings();
  const fromEmail = settings.smtpFrom || process.env.SMTP_FROM || "no-reply@empowersacademy.com";

  const isScheduled = Boolean(params.scheduledAt && params.scheduledAt.getTime() > Date.now());
  const status = params.isDraft ? "DRAFT" : isScheduled ? "SCHEDULED" : "QUEUED";

  const log = await prisma.emailLog.create({
    data: {
      templateId: params.templateId ?? null,
      subject,
      bodyHtml,
      toEmail: params.to,
      toName: params.toName ?? null,
      fromEmail,
      ccEmails: params.ccEmails ?? [],
      bccEmails: params.bccEmails ?? [],
      attachments: (params.attachments ?? []) as unknown as Prisma.InputJsonValue,
      status,
      scheduledAt: params.scheduledAt ?? null,
      bulkSendId: params.bulkSendId ?? null,
      leadId: params.leadId ?? null,
      studentId: params.studentId ?? null,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      createdById: actorId ?? null,
    },
  });

  await logActivity({ userId: actorId, action: "CREATE", entityType: "emailLog", entityId: log.id });

  if (status === "QUEUED") {
    await dispatchEmail(log.id);
  }

  return prisma.emailLog.findUnique({ where: { id: log.id } });
}

/** Sends (or re-attempts) a QUEUED/SCHEDULED EmailLog row. Idempotent-ish: no-ops on rows already past this stage. */
export async function dispatchEmail(emailLogId: string): Promise<void> {
  const log = await prisma.emailLog.findUnique({ where: { id: emailLogId } });
  if (!log || (log.status !== "QUEUED" && log.status !== "SCHEDULED")) return;

  const transporter = await getTransporter();
  if (!transporter) {
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        errorMessage: "SMTP is not configured (Admin → Global Settings, or SMTP_* env vars).",
      },
    });
    return;
  }

  const htmlWithTracking = `${log.bodyHtml}<img src="${trackingPixelUrl(emailLogId)}" width="1" height="1" alt="" style="display:none" />`;
  const attachments = (log.attachments as unknown as Attachment[] | null) ?? [];

  try {
    await transporter.sendMail({
      from: log.fromEmail,
      to: log.toName ? `"${log.toName}" <${log.toEmail}>` : log.toEmail,
      cc: log.ccEmails.length ? log.ccEmails : undefined,
      bcc: log.bccEmails.length ? log.bccEmails : undefined,
      subject: log.subject,
      html: htmlWithTracking,
      attachments: attachments.map((a) => ({ filename: a.filename, path: a.url })),
    });

    await prisma.emailLog.update({ where: { id: emailLogId }, data: { status: "SENT", sentAt: new Date() } });
    await logCommunication(
      {
        channel: "EMAIL",
        direction: "OUTBOUND",
        subject: log.subject,
        summary: `Email sent: ${log.subject}`,
        status: "SENT",
        leadId: log.leadId,
        studentId: log.studentId,
      },
      log.createdById
    );
  } catch (err) {
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        errorMessage: err instanceof Error ? err.message : "Unknown SMTP error",
      },
    });
    await logCommunication(
      {
        channel: "EMAIL",
        direction: "OUTBOUND",
        subject: log.subject,
        summary: `Email failed: ${log.subject}`,
        status: "FAILED",
        leadId: log.leadId,
        studentId: log.studentId,
      },
      log.createdById
    );
  }
}

export type BulkRecipient = {
  to: string;
  toName?: string | null;
  templateVariables?: Record<string, string | number>;
  leadId?: string | null;
  studentId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

/** One EmailLog/CommunicationLog row per recipient (not one giant blast) so delivery is tracked individually; all rows share `bulkSendId` for reporting. */
export async function sendBulkEmail(
  input: { templateId: string; recipients: BulkRecipient[]; scheduledAt?: Date | null },
  actorId?: string | null
) {
  const bulkSendId = randomUUID();
  for (const recipient of input.recipients) {
    await sendEmail(
      {
        templateId: input.templateId,
        to: recipient.to,
        toName: recipient.toName,
        templateVariables: recipient.templateVariables,
        scheduledAt: input.scheduledAt,
        bulkSendId,
        leadId: recipient.leadId,
        studentId: recipient.studentId,
        entityType: recipient.entityType,
        entityId: recipient.entityId,
      },
      actorId
    );
  }
  return { bulkSendId, count: input.recipients.length };
}

/** Cron entry point: dispatches every EmailLog whose scheduledAt has passed. */
export async function processScheduledEmails(): Promise<{ processed: number }> {
  const due = await prisma.emailLog.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
    select: { id: true },
  });

  for (const row of due) {
    await prisma.emailLog.update({ where: { id: row.id }, data: { status: "QUEUED" } });
    await dispatchEmail(row.id);
  }

  return { processed: due.length };
}

export async function markEmailOpened(id: string): Promise<void> {
  try {
    await prisma.emailLog.updateMany({
      where: { id, status: { in: ["SENT", "DELIVERED"] } },
      data: { openedAt: new Date(), status: "OPENED" },
    });
  } catch (err) {
    console.error("markEmailOpened failed", err);
  }
}

export async function listEmails(params: EmailListQuery) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const where: Prisma.EmailLogWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.entityType ? { entityType: params.entityType } : {}),
    ...(params.entityId ? { entityId: params.entityId } : {}),
    ...(params.search
      ? {
          OR: [
            { subject: { contains: params.search, mode: "insensitive" as const } },
            { toEmail: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { template: { select: { id: true, name: true } } },
    }),
    prisma.emailLog.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getEmailById(id: string) {
  return prisma.emailLog.findUnique({ where: { id }, include: { template: { select: { id: true, name: true } } } });
}

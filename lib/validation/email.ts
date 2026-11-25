import { z } from "zod";

const entityLinkSchema = z.object({
  leadId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.string().optional().nullable(),
});

const attachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string().min(1),
  size: z.number().int().nonnegative().optional(),
});

export const sendEmailSchema = z
  .object({
    templateId: z.string().uuid().optional().nullable(),
    to: z.string().email(),
    toName: z.string().optional().nullable(),
    subject: z.string().min(1, "Subject is required"),
    bodyHtml: z.string().min(1, "Body is required"),
    ccEmails: z.array(z.string().email()).default([]),
    bccEmails: z.array(z.string().email()).default([]),
    attachments: z.array(attachmentSchema).default([]),
    scheduledAt: z.coerce.date().optional().nullable(),
    templateVariables: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
    isDraft: z.boolean().default(false),
  })
  .merge(entityLinkSchema);

export const bulkSendEmailSchema = z.object({
  templateId: z.string().uuid(),
  recipients: z
    .array(
      z
        .object({
          to: z.string().email(),
          toName: z.string().optional().nullable(),
          templateVariables: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
        })
        .merge(entityLinkSchema)
    )
    .min(1, "At least one recipient is required")
    .max(500, "Bulk send is capped at 500 recipients per request"),
  scheduledAt: z.coerce.date().optional().nullable(),
});

export const emailListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  status: z
    .enum(["DRAFT", "QUEUED", "SCHEDULED", "SENDING", "SENT", "DELIVERED", "OPENED", "FAILED", "BOUNCED"])
    .optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  search: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type BulkSendEmailInput = z.infer<typeof bulkSendEmailSchema>;
export type EmailListQuery = z.infer<typeof emailListQuerySchema>;

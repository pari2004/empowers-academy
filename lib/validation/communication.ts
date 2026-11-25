import { z } from "zod";

export const communicationChannelSchema = z.enum(["EMAIL", "WHATSAPP", "SMS", "IN_APP", "PUSH", "CALL", "MEETING"]);
export const communicationDirectionSchema = z.enum(["OUTBOUND", "INBOUND"]);
export const communicationStatusSchema = z.enum(["PENDING", "SENT", "DELIVERED", "FAILED", "READ"]);

export const logCommunicationSchema = z.object({
  channel: communicationChannelSchema,
  direction: communicationDirectionSchema.default("OUTBOUND"),
  subject: z.string().optional().nullable(),
  summary: z.string().min(1, "Summary is required"),
  status: communicationStatusSchema.default("SENT"),
  leadId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  counsellorId: z.string().uuid().optional().nullable(),
  trainerId: z.string().uuid().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
});

export const communicationListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  channel: communicationChannelSchema.optional(),
  entityType: z.enum(["lead", "student", "batch"]).optional(),
  entityId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(),
});

export type LogCommunicationInput = z.infer<typeof logCommunicationSchema>;
export type CommunicationListQuery = z.infer<typeof communicationListQuerySchema>;

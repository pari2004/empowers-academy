import { z } from "zod";

export const aiDraftChannelSchema = z.enum(["EMAIL", "WHATSAPP"]);

export const aiDraftRequestSchema = z.object({
  channel: aiDraftChannelSchema,
  tone: z.enum(["FORMAL", "FRIENDLY", "URGENT"]).default("FRIENDLY"),
  context: z.string().max(2000).optional(),
});

export const aiMeetingSummaryRequestSchema = z.object({
  transcript: z.string().min(1, "Transcript or notes are required").max(20000),
});

export const aiReportScopeSchema = z.enum(["leads", "students", "courses", "revenue"]);

export const aiReportRequestSchema = z.object({
  scope: aiReportScopeSchema,
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const aiRevenueForecastRequestSchema = z.object({
  months: z.number().int().min(1).max(12).default(3),
});

export const aiChatMessageRequestSchema = z.object({
  threadId: z.string().uuid().optional().nullable(),
  message: z.string().min(1, "Message is required").max(4000),
});

export type AiDraftRequest = z.infer<typeof aiDraftRequestSchema>;
export type AiMeetingSummaryRequest = z.infer<typeof aiMeetingSummaryRequestSchema>;
export type AiReportRequest = z.infer<typeof aiReportRequestSchema>;
export type AiRevenueForecastRequest = z.infer<typeof aiRevenueForecastRequestSchema>;
export type AiChatMessageRequest = z.infer<typeof aiChatMessageRequestSchema>;

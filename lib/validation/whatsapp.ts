import { z } from "zod";

export const whatsappSendSchema = z.object({
  toPhone: z.string().min(6, "A valid phone number is required"),
  message: z.string().min(1, "Message is required"),
  templateName: z.string().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.string().optional().nullable(),
});

export type WhatsAppSendInput = z.infer<typeof whatsappSendSchema>;

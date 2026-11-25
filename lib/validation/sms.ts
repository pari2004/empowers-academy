import { z } from "zod";

export const smsPurposeSchema = z.enum(["OTP", "PAYMENT_REMINDER", "DEMO_REMINDER", "EMERGENCY", "GENERAL"]);

export const smsSendSchema = z.object({
  toPhone: z.string().min(6, "A valid phone number is required"),
  message: z.string().min(1, "Message is required"),
  purpose: smsPurposeSchema.default("GENERAL"),
  leadId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.string().optional().nullable(),
});

export type SmsSendInput = z.infer<typeof smsSendSchema>;

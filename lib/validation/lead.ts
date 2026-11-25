import { z } from "zod";
import { paymentTypeSchema, manualPaymentMethodSchema } from "@/lib/validation/payment";
import { optionalIndianPhone } from "@/lib/validation/phone";
import { optionalUrlOrPath } from "@/lib/validation/shared";

export const leadSourceSchema = z.enum([
  "WEBSITE",
  "WHATSAPP",
  "FACEBOOK_ADS",
  "INSTAGRAM",
  "GOOGLE_ADS",
  "REFERRAL",
  "WALK_IN",
  "LINKEDIN",
  "YOUTUBE",
  "OTHER",
]);

export const leadStageSchema = z.enum([
  "NEW_LEAD",
  "CALL_ATTEMPTED",
  "FOLLOW_UP",
  "CALL_CONNECTED",
  "SESSION_SCHEDULED",
  "SESSION_DONE",
  "PARTIAL_PAYMENT",
  "ONBOARDED_LEARNER",
  "INVALID_NUMBER",
  "DUPLICATE_LEAD",
  "NOT_INTERESTED",
  "WRONG_REQUIREMENT",
  "NO_RESPONSE",
  "LOST",
  "SPAM",
]);

export const leadNoteTypeSchema = z.enum(["NOTE", "CALL", "STAGE_CHANGE"]);

// `stage` is deliberately absent here — a lead always starts at NEW_LEAD, and
// stage only ever changes through the dedicated transition endpoint
// (leadStageTransitionSchema below), which enforces the pipeline state
// machine. Allowing a raw create/update to set `stage` would bypass it.
export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: optionalIndianPhone,
  whatsapp: optionalIndianPhone,
  email: z.string().email().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  college: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  source: leadSourceSchema.default("WEBSITE"),
  interestedCourseId: z.string().uuid().optional().nullable(),
  budget: z.number().nonnegative().optional().nullable(),
  expectedJoining: z.coerce.date().optional().nullable(),
  leadScore: z.number().int().min(0).max(100).default(0),
  tags: z.array(z.string()).default([]),
  nextFollowUpAt: z.coerce.date().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const leadUpdateSchema = leadSchema.partial();

const transitionPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  method: manualPaymentMethodSchema,
  type: paymentTypeSchema.default("REGISTRATION_FEE"),
  notes: z.string().optional().nullable(),
});

// Most stages just need the target; a few need extra data to drive their
// automatic side effects (see lib/services/leadService.ts transitionStage).
export const leadStageTransitionSchema = z.discriminatedUnion("stage", [
  z.object({
    stage: z.enum([
      "CALL_ATTEMPTED",
      "CALL_CONNECTED",
      "SESSION_DONE",
      "INVALID_NUMBER",
      "DUPLICATE_LEAD",
      "NOT_INTERESTED",
      "WRONG_REQUIREMENT",
      "NO_RESPONSE",
      "LOST",
      "SPAM",
    ]),
    reason: z.string().optional().nullable(),
  }),
  z.object({
    stage: z.literal("FOLLOW_UP"),
    followUpAt: z.coerce.date().optional(),
    reason: z.string().optional().nullable(),
  }),
  z.object({
    stage: z.literal("SESSION_SCHEDULED"),
    sessionScheduledAt: z.coerce.date(),
  }),
  z.object({
    stage: z.literal("PARTIAL_PAYMENT"),
    payment: transitionPaymentSchema,
  }),
  z.object({
    stage: z.literal("ONBOARDED_LEARNER"),
    batchId: z.string().uuid().optional().nullable(),
    payment: transitionPaymentSchema.optional(),
  }),
]);

export const leadNoteSchema = z.object({
  type: leadNoteTypeSchema.default("NOTE"),
  body: z.string().min(1, "Note body is required"),
  attachmentUrl: optionalUrlOrPath("Attachment URL"),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
export type LeadStageTransitionInput = z.infer<typeof leadStageTransitionSchema>;
export type LeadNoteInput = z.infer<typeof leadNoteSchema>;

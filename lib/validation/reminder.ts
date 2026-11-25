import { z } from "zod";

// Named `ReminderCategory` (not `ReminderType`) — the Payments module already
// owns a `ReminderType` enum (UPCOMING/OVERDUE/FINAL) for its own payment
// reminder cadence; this is a distinct, unrelated concept (what the reminder
// is *for*, not what stage of a dunning sequence it's at).
export const reminderCategorySchema = z.enum([
  "FOLLOW_UP",
  "DEMO_CLASS",
  "PENDING_PAYMENT",
  "BATCH_START",
  "ASSIGNMENT_DUE",
  "CERTIFICATE_READY",
  "CUSTOM",
]);

export const reminderRecurrenceSchema = z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]);
export const reminderStatusSchema = z.enum(["PENDING", "SENT", "DISMISSED", "CANCELLED"]);

export const reminderSchema = z.object({
  type: reminderCategorySchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  dueAt: z.coerce.date(),
  recurrence: reminderRecurrenceSchema.default("NONE"),
  recurrenceConfig: z.record(z.string(), z.unknown()).optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.string().optional().nullable(),
});

export const reminderUpdateSchema = reminderSchema.partial();

export const reminderListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  status: reminderStatusSchema.optional(),
  type: reminderCategorySchema.optional(),
  assignedToId: z.string().uuid().optional(),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
export type ReminderUpdateInput = z.infer<typeof reminderUpdateSchema>;
export type ReminderListQuery = z.infer<typeof reminderListQuerySchema>;

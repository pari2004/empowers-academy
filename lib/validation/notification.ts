import { z } from "zod";

// Kept in sync with the Prisma `NotificationType` enum, which is shared with
// the LMS module (BATCH_ASSIGNMENT, NEW_ENROLLMENT, UPCOMING_CLASS,
// ASSIGNMENT_DEADLINE, ATTENDANCE_ALERT, GENERAL) — this phase's values are
// additive to that enum, not a separate one.
export const notificationTypeSchema = z.enum([
  "LEAD_ASSIGNED",
  "FOLLOW_UP_REMINDER",
  "ADMISSION_COMPLETED",
  "PAYMENT_RECEIVED",
  "PAYMENT_OVERDUE",
  "BATCH_ASSIGNED",
  "NEW_STUDENT",
  "ASSIGNMENT_SUBMITTED",
  "CERTIFICATE_GENERATED",
  "TASK_ASSIGNED",
  "TASK_DUE",
  "WORKFLOW_ALERT",
  "GENERAL",
]);

export const notificationPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const notificationListQuerySchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  priority: notificationPrioritySchema.optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const notificationPreferenceSchema = z.object({
  emailEnabled: z.boolean().default(true),
  inAppEnabled: z.boolean().default(true),
  whatsappEnabled: z.boolean().default(false),
  smsEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(false),
  mutedTypes: z.array(notificationTypeSchema).default([]),
});

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
export type NotificationPreferenceInput = z.infer<typeof notificationPreferenceSchema>;

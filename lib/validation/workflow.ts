import { z } from "zod";

export const workflowTriggerTypeSchema = z.enum([
  "LEAD_CREATED",
  "LEAD_STAGE_CHANGED",
  "DEMO_SCHEDULED",
  "ADMISSION_APPROVED",
  "STUDENT_CREATED",
  "PAYMENT_RECEIVED",
  "PAYMENT_OVERDUE",
  "BATCH_ASSIGNED",
  "COURSE_COMPLETED",
]);

export const workflowActionTypeSchema = z.enum([
  "SEND_EMAIL",
  "CREATE_TASK",
  "ASSIGN_COUNSELLOR",
  "NOTIFY_ADMIN",
  "SEND_REMINDER",
  "UPDATE_STATUS",
  "GENERATE_NOTIFICATION",
]);

// Trigger filter — e.g. only fire LEAD_STAGE_CHANGED when moving from NEW to
// CONTACTED. Every key is optional; an absent key means "match any".
export const workflowTriggerConfigSchema = z.record(z.string(), z.unknown()).default({});

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

// Per-action-type config shape, used to validate `WorkflowAction.config` at
// creation time so a malformed workflow fails fast in the builder rather than
// silently no-op-ing when it eventually fires.
export const ACTION_CONFIG_SCHEMAS = {
  SEND_EMAIL: z.object({
    templateId: z.string().uuid(),
    toField: z.enum(["lead.email", "student.email"]).default("lead.email"),
  }),
  CREATE_TASK: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: priorityEnum.default("MEDIUM"),
    dueInDays: z.number().int().min(0).default(1),
    assignToField: z.enum(["assignedTo", "currentUser"]).default("assignedTo"),
  }),
  ASSIGN_COUNSELLOR: z.object({
    userId: z.string().uuid().optional(),
  }),
  NOTIFY_ADMIN: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
  }),
  SEND_REMINDER: z.object({
    type: z.string().min(1),
    title: z.string().min(1),
    dueInDays: z.number().int().min(0).default(1),
  }),
  UPDATE_STATUS: z.object({
    entityField: z.string().min(1),
    newValue: z.string().min(1),
  }),
  GENERATE_NOTIFICATION: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    priority: priorityEnum.default("MEDIUM"),
  }),
} as const satisfies Record<z.infer<typeof workflowActionTypeSchema>, z.ZodTypeAny>;

export function parseActionConfig<T extends z.infer<typeof workflowActionTypeSchema>>(
  type: T,
  config: unknown
): z.infer<(typeof ACTION_CONFIG_SCHEMAS)[T]> {
  return ACTION_CONFIG_SCHEMAS[type].parse(config);
}

export const workflowActionSchema = z.object({
  order: z.number().int().min(0).default(0),
  type: workflowActionTypeSchema,
  config: z.record(z.string(), z.unknown()),
});

export const workflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  trigger: z.object({
    type: workflowTriggerTypeSchema,
    config: workflowTriggerConfigSchema.optional(),
  }),
  actions: z.array(workflowActionSchema).default([]),
});

export const workflowUpdateSchema = workflowSchema.partial();

export type WorkflowInput = z.infer<typeof workflowSchema>;
export type WorkflowUpdateInput = z.infer<typeof workflowUpdateSchema>;
export type WorkflowActionInput = z.infer<typeof workflowActionSchema>;
export type WorkflowTriggerType = z.infer<typeof workflowTriggerTypeSchema>;
export type WorkflowActionType = z.infer<typeof workflowActionTypeSchema>;

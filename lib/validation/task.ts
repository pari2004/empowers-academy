import { z } from "zod";

export const taskStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  status: taskStatusSchema.default("PENDING"),
  priority: taskPrioritySchema.default("MEDIUM"),
  dueDate: z.coerce.date().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.string().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
});

export const taskUpdateSchema = taskSchema.partial();

export const taskStatusTransitionSchema = z.object({ status: taskStatusSchema });

export const taskCommentSchema = z.object({
  body: z.string().min(1, "Comment body is required"),
});

export const taskAttachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string().min(1),
  size: z.number().int().nonnegative().optional().nullable(),
});

export const taskListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignedToId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskCommentInput = z.infer<typeof taskCommentSchema>;
export type TaskAttachmentInput = z.infer<typeof taskAttachmentSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;

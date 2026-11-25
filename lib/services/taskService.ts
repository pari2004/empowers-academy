import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/services/notificationService";
import type { TaskInput, TaskUpdateInput, TaskListQuery, TaskCommentInput, TaskAttachmentInput } from "@/lib/validation/task";
import type { Prisma, TaskStatus } from "@prisma/client";

export async function listTasks(params: TaskListQuery) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.TaskWhereInput = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.priority ? { priority: params.priority } : {}),
    ...(params.assignedToId ? { assignedToId: params.assignedToId } : {}),
    ...(params.search ? { title: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({ where, orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.task.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

/** All tasks grouped by status, for the Kanban board (no pagination — boards render everything in view). */
export async function listTasksForBoard(assignedToId?: string) {
  const tasks = await prisma.task.findMany({
    where: { deletedAt: null, ...(assignedToId ? { assignedToId } : {}) },
    orderBy: { createdAt: "desc" },
  });

  const board: Record<TaskStatus, typeof tasks> = { PENDING: [], IN_PROGRESS: [], COMPLETED: [], CANCELLED: [] };
  for (const task of tasks) board[task.status].push(task);
  return board;
}

export function getTaskById(id: string) {
  return prisma.task.findFirst({
    where: { id, deletedAt: null },
    include: { comments: { orderBy: { createdAt: "desc" } }, attachments: { orderBy: { createdAt: "desc" } } },
  });
}

export async function createTask(input: TaskInput, actorId?: string | null) {
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      assignedToId: input.assignedToId,
      assignedById: actorId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      leadId: input.leadId,
      studentId: input.studentId,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
  });

  await logActivity({ userId: actorId, action: "CREATE", entityType: "task", entityId: task.id });

  if (task.assignedToId) {
    await createNotification({
      userId: task.assignedToId,
      type: "TASK_ASSIGNED",
      title: "New task assigned",
      body: task.title,
      link: `/admin/tasks?taskId=${task.id}`,
      entityType: "task",
      entityId: task.id,
      priority: task.priority === "CRITICAL" ? "CRITICAL" : task.priority === "HIGH" ? "HIGH" : "MEDIUM",
    });
  }

  return task;
}

export async function updateTask(id: string, input: TaskUpdateInput, actorId?: string | null) {
  const existing = await prisma.task.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new Error("Task not found");

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && {
        status: input.status,
        completedAt: input.status === "COMPLETED" ? new Date() : existing.status === "COMPLETED" ? null : existing.completedAt,
      }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      ...(input.assignedToId !== undefined && { assignedToId: input.assignedToId }),
      ...(input.entityType !== undefined && { entityType: input.entityType }),
      ...(input.entityId !== undefined && { entityId: input.entityId }),
      ...(input.leadId !== undefined && { leadId: input.leadId }),
      ...(input.studentId !== undefined && { studentId: input.studentId }),
      updatedById: actorId ?? null,
    },
  });

  await logActivity({ userId: actorId, action: "UPDATE", entityType: "task", entityId: id });

  if (input.assignedToId && input.assignedToId !== existing.assignedToId) {
    await createNotification({
      userId: input.assignedToId,
      type: "TASK_ASSIGNED",
      title: "Task assigned to you",
      body: task.title,
      link: `/admin/tasks?taskId=${task.id}`,
      entityType: "task",
      entityId: task.id,
    });
  }

  return task;
}

export async function transitionTaskStatus(id: string, status: TaskStatus, actorId?: string | null) {
  return updateTask(id, { status }, actorId);
}

export async function deleteTask(id: string, actorId?: string | null) {
  await prisma.task.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "task", entityId: id });
}

export async function addTaskComment(taskId: string, input: TaskCommentInput, actorId?: string | null) {
  const comment = await prisma.taskComment.create({ data: { taskId, body: input.body, createdById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "taskComment", entityId: comment.id, metadata: { taskId } });

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (task?.assignedToId && task.assignedToId !== actorId) {
    await createNotification({
      userId: task.assignedToId,
      type: "TASK_ASSIGNED",
      title: "New comment on your task",
      body: task.title,
      link: `/admin/tasks?taskId=${taskId}`,
      entityType: "task",
      entityId: taskId,
    });
  }

  return comment;
}

export async function addTaskAttachment(taskId: string, input: TaskAttachmentInput, actorId?: string | null) {
  const attachment = await prisma.taskAttachment.create({
    data: { taskId, url: input.url, filename: input.filename, size: input.size ?? null, uploadedById: actorId ?? null },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "taskAttachment", entityId: attachment.id, metadata: { taskId } });
  return attachment;
}

/** Cron-adjacent helper: notifies assignees of tasks due today that aren't yet complete. Dedup handled by the caller (reminderService) via a Reminder row per task. */
export function listTasksDueSoon(withinHours: number) {
  const until = new Date(Date.now() + withinHours * 60 * 60 * 1000);
  return prisma.task.findMany({
    where: { deletedAt: null, status: { in: ["PENDING", "IN_PROGRESS"] }, dueDate: { lte: until } },
  });
}

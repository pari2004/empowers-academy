import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createNotification, notifyRole } from "@/lib/services/notificationService";
import { sendEmail } from "@/lib/services/emailService";
import { createTask } from "@/lib/services/taskService";
import { createReminder } from "@/lib/services/communicationReminderService";
import { parseActionConfig } from "@/lib/validation/workflow";
import type { WorkflowInput, WorkflowUpdateInput } from "@/lib/validation/workflow";
import type { Prisma, WorkflowActionType, WorkflowTriggerType } from "@prisma/client";
import type { ReminderInput } from "@/lib/validation/reminder";

export type DispatchContext = {
  entityType: string;
  entityId: string;
  actorId?: string | null;
  /** Disambiguates repeat-safe triggers of the same type on the same entity, e.g. "NEW->CONTACTED" for a stage change. Combined with workflowId+entity into the exactly-once dedupe key. */
  eventSignature: string;
  /** Resolved fields available to action templating/filtering (lead/student email, assignedToId, stage, etc). */
  context: Record<string, unknown>;
};

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
}

function matchesTriggerConfig(config: unknown, ctx: DispatchContext): boolean {
  if (!config || typeof config !== "object") return true;
  return Object.entries(config as Record<string, unknown>).every(
    ([key, value]) => value === undefined || value === null || ctx.context[key] === value
  );
}

async function executeAction(type: WorkflowActionType, config: Record<string, unknown>, ctx: DispatchContext): Promise<void> {
  switch (type) {
    case "SEND_EMAIL": {
      const cfg = parseActionConfig("SEND_EMAIL", config);
      const to = cfg.toField === "student.email" ? (ctx.context.studentEmail as string | undefined) : (ctx.context.leadEmail as string | undefined);
      if (!to) return;
      await sendEmail(
        {
          templateId: cfg.templateId,
          to,
          templateVariables: ctx.context as Record<string, string | number>,
          leadId: ctx.entityType === "lead" ? ctx.entityId : undefined,
          studentId: ctx.entityType === "student" ? ctx.entityId : undefined,
          entityType: ctx.entityType,
          entityId: ctx.entityId,
        },
        ctx.actorId
      );
      return;
    }
    case "CREATE_TASK": {
      const cfg = parseActionConfig("CREATE_TASK", config);
      const dueDate = new Date(Date.now() + cfg.dueInDays * 86_400_000);
      const assignedToId =
        cfg.assignToField === "currentUser" ? ctx.actorId ?? null : (ctx.context.assignedToId as string | undefined) ?? null;
      await createTask(
        {
          title: cfg.title,
          description: cfg.description ?? null,
          status: "PENDING",
          priority: cfg.priority,
          dueDate,
          assignedToId,
          entityType: ctx.entityType,
          entityId: ctx.entityId,
          leadId: ctx.entityType === "lead" ? ctx.entityId : null,
          studentId: ctx.entityType === "student" ? ctx.entityId : null,
        },
        ctx.actorId
      );
      return;
    }
    case "ASSIGN_COUNSELLOR": {
      const cfg = parseActionConfig("ASSIGN_COUNSELLOR", config);
      const userId = cfg.userId ?? (ctx.context.assignedToId as string | undefined);
      if (!userId || ctx.entityType !== "lead") return;
      await prisma.lead.update({ where: { id: ctx.entityId }, data: { assignedToId: userId } });
      return;
    }
    case "NOTIFY_ADMIN": {
      const cfg = parseActionConfig("NOTIFY_ADMIN", config);
      await notifyRole("ADMIN", {
        type: "WORKFLOW_ALERT",
        title: cfg.title,
        body: cfg.body,
        entityType: ctx.entityType,
        entityId: ctx.entityId,
      });
      return;
    }
    case "SEND_REMINDER": {
      const cfg = parseActionConfig("SEND_REMINDER", config);
      const dueAt = new Date(Date.now() + cfg.dueInDays * 86_400_000);
      await createReminder(
        {
          type: cfg.type,
          title: cfg.title,
          dueAt,
          recurrence: "NONE",
          leadId: ctx.entityType === "lead" ? ctx.entityId : null,
          studentId: ctx.entityType === "student" ? ctx.entityId : null,
          entityType: ctx.entityType,
          entityId: ctx.entityId,
          assignedToId: (ctx.context.assignedToId as string | undefined) ?? null,
        } as ReminderInput,
        ctx.actorId
      );
      return;
    }
    case "UPDATE_STATUS": {
      const cfg = parseActionConfig("UPDATE_STATUS", config);
      if (ctx.entityType === "lead") {
        await prisma.lead.update({ where: { id: ctx.entityId }, data: { [cfg.entityField]: cfg.newValue } });
      } else if (ctx.entityType === "student") {
        await prisma.student.update({ where: { id: ctx.entityId }, data: { [cfg.entityField]: cfg.newValue } });
      }
      return;
    }
    case "GENERATE_NOTIFICATION": {
      const cfg = parseActionConfig("GENERATE_NOTIFICATION", config);
      const userId = (ctx.context.assignedToId as string | undefined) ?? ctx.actorId;
      if (!userId) return;
      await createNotification({
        userId,
        type: "WORKFLOW_ALERT",
        title: cfg.title,
        body: cfg.body,
        priority: cfg.priority,
        entityType: ctx.entityType,
        entityId: ctx.entityId,
      });
      return;
    }
  }
}

/**
 * The automation engine's entry point — called from lifecycle points in the
 * existing Lead/Student/Batch services (e.g. `leadService.createLead` calls
 * `dispatchTrigger("LEAD_CREATED", ...)`). Fire-and-forget: never throws into
 * the caller. Exactly-once is enforced by `WorkflowRun.dedupeKey` being a DB
 * unique constraint — a `P2002` on insert means this exact event already ran
 * for this workflow, so it's silently skipped rather than re-executed.
 */
export async function dispatchTrigger(type: WorkflowTriggerType, ctx: DispatchContext): Promise<void> {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { isActive: true, trigger: { type } },
      include: { trigger: true, actions: { orderBy: { order: "asc" } } },
    });

    for (const workflow of workflows) {
      if (!matchesTriggerConfig(workflow.trigger?.config, ctx)) continue;

      const dedupeKey = `${workflow.id}:${ctx.entityType}:${ctx.entityId}:${ctx.eventSignature}`;
      let run: { id: string };
      try {
        run = await prisma.workflowRun.create({
          data: { workflowId: workflow.id, entityType: ctx.entityType, entityId: ctx.entityId, status: "SUCCESS", dedupeKey },
        });
      } catch (err) {
        if (isUniqueConstraintError(err)) continue;
        throw err;
      }

      const resultLog: Array<{ action: string; status: string; error?: string }> = [];
      for (const action of workflow.actions) {
        try {
          await executeAction(action.type, action.config as Record<string, unknown>, ctx);
          resultLog.push({ action: action.type, status: "SUCCESS" });
        } catch (err) {
          resultLog.push({ action: action.type, status: "FAILED", error: err instanceof Error ? err.message : String(err) });
        }
      }

      const failedCount = resultLog.filter((r) => r.status === "FAILED").length;
      const runStatus = failedCount === 0 ? "SUCCESS" : failedCount === resultLog.length ? "FAILED" : "PARTIAL";

      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: runStatus, resultLog: resultLog as unknown as Prisma.InputJsonValue },
      });
    }
  } catch (err) {
    console.error("dispatchTrigger failed", err);
  }
}

export type ListWorkflowsParams = { page?: number; pageSize?: number; search?: string };

export async function listWorkflows(params: ListWorkflowsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.WorkflowWhereInput = params.search
    ? { name: { contains: params.search, mode: "insensitive" as const } }
    : {};

  const [items, total] = await Promise.all([
    prisma.workflow.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { trigger: true, actions: { orderBy: { order: "asc" } }, _count: { select: { runs: true } } },
    }),
    prisma.workflow.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getWorkflowById(id: string) {
  return prisma.workflow.findUnique({ where: { id }, include: { trigger: true, actions: { orderBy: { order: "asc" } } } });
}

export async function createWorkflow(input: WorkflowInput, actorId?: string | null) {
  const workflow = await prisma.workflow.create({
    data: {
      name: input.name,
      description: input.description,
      isActive: input.isActive,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
      trigger: { create: { type: input.trigger.type, config: (input.trigger.config ?? {}) as Prisma.InputJsonValue } },
      actions: {
        create: input.actions.map((a) => ({ order: a.order, type: a.type, config: a.config as Prisma.InputJsonValue })),
      },
    },
    include: { trigger: true, actions: true },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "workflow", entityId: workflow.id });
  return workflow;
}

export async function updateWorkflow(id: string, input: WorkflowUpdateInput, actorId?: string | null) {
  await prisma.$transaction(async (tx) => {
    await tx.workflow.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        updatedById: actorId ?? null,
      },
    });

    if (input.trigger) {
      await tx.workflowTrigger.upsert({
        where: { workflowId: id },
        update: { type: input.trigger.type, config: (input.trigger.config ?? {}) as Prisma.InputJsonValue },
        create: { workflowId: id, type: input.trigger.type, config: (input.trigger.config ?? {}) as Prisma.InputJsonValue },
      });
    }

    if (input.actions) {
      await tx.workflowAction.deleteMany({ where: { workflowId: id } });
      if (input.actions.length) {
        await tx.workflowAction.createMany({
          data: input.actions.map((a) => ({ workflowId: id, order: a.order, type: a.type, config: a.config as Prisma.InputJsonValue })),
        });
      }
    }
  });

  await logActivity({ userId: actorId, action: "UPDATE", entityType: "workflow", entityId: id });
  return getWorkflowById(id);
}

export async function toggleWorkflow(id: string, isActive: boolean, actorId?: string | null) {
  const workflow = await prisma.workflow.update({ where: { id }, data: { isActive, updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "workflow", entityId: id, metadata: { isActive } });
  return workflow;
}

export async function deleteWorkflow(id: string, actorId?: string | null) {
  await prisma.workflow.delete({ where: { id } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "workflow", entityId: id });
}

export async function listWorkflowRuns(workflowId: string, params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.WorkflowRunWhereInput = { workflowId };

  const [items, total] = await Promise.all([
    prisma.workflowRun.findMany({ where, orderBy: { triggeredAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.workflowRun.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { ApiError } from "@/lib/api-guard";
import { isValidTransition, isTerminalStage, stageLabel } from "@/lib/leadPipeline";
import { createTask } from "@/lib/services/taskService";
import { createNotification } from "@/lib/services/notificationService";
import { dispatchTrigger } from "@/lib/services/workflowService";
import { createStudentFromLead, getStudentByLeadId, updateStudent } from "@/lib/services/studentService";
import { linkStudentToLms } from "@/lib/services/lmsService";
import type { LeadInput, LeadUpdateInput, LeadNoteInput, LeadStageTransitionInput } from "@/lib/validation/lead";
import type { LeadSource, LeadStage } from "@prisma/client";

export type ListLeadsParams = {
  page?: number;
  pageSize?: number;
  stage?: LeadStage;
  source?: LeadSource;
  assignedToId?: string;
  search?: string;
};

export async function listLeads(params: ListLeadsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    deletedAt: null,
    ...(params.stage ? { stage: params.stage } : {}),
    ...(params.source ? { source: params.source } : {}),
    ...(params.assignedToId ? { assignedToId: params.assignedToId } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
            { phone: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { course: { select: { id: true, title: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function listAllLeadsForExport() {
  return prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { course: { select: { title: true } } },
  });
}

export function getLeadById(id: string) {
  return prisma.lead.findFirst({
    where: { id, deletedAt: null },
    include: { course: { select: { id: true, title: true } } },
  });
}

export async function createLead(input: LeadInput, actorId?: string | null) {
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email,
      city: input.city,
      state: input.state,
      college: input.college,
      company: input.company,
      experience: input.experience,
      source: input.source,
      interestedCourseId: input.interestedCourseId,
      budget: input.budget,
      expectedJoining: input.expectedJoining,
      leadScore: input.leadScore,
      tags: input.tags,
      nextFollowUpAt: input.nextFollowUpAt,
      assignedToId: input.assignedToId,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
    include: { course: { select: { id: true, title: true } } },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "lead", entityId: lead.id });
  await dispatchTrigger("LEAD_CREATED", {
    entityType: "lead",
    entityId: lead.id,
    actorId,
    eventSignature: "created",
    context: { leadEmail: lead.email, assignedToId: lead.assignedToId, stage: lead.stage },
  });
  return lead;
}

export async function updateLead(id: string, input: LeadUpdateInput, actorId?: string | null) {
  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.whatsapp !== undefined && { whatsapp: input.whatsapp }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.state !== undefined && { state: input.state }),
      ...(input.college !== undefined && { college: input.college }),
      ...(input.company !== undefined && { company: input.company }),
      ...(input.experience !== undefined && { experience: input.experience }),
      ...(input.source !== undefined && { source: input.source }),
      ...(input.interestedCourseId !== undefined && { interestedCourseId: input.interestedCourseId }),
      ...(input.budget !== undefined && { budget: input.budget }),
      ...(input.expectedJoining !== undefined && { expectedJoining: input.expectedJoining }),
      ...(input.leadScore !== undefined && { leadScore: input.leadScore }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.nextFollowUpAt !== undefined && { nextFollowUpAt: input.nextFollowUpAt }),
      ...(input.assignedToId !== undefined && { assignedToId: input.assignedToId }),
      updatedById: actorId ?? null,
    },
    include: { course: { select: { id: true, title: true } } },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "lead", entityId: id });
  return lead;
}

export async function deleteLead(id: string, actorId?: string | null) {
  await prisma.lead.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "lead", entityId: id });
}

/**
 * Enforces the CRM pipeline state machine (lib/leadPipeline.ts) and runs each
 * target stage's automatic side effects: auto-created follow-up tasks off
 * FOLLOW_UP, auto-scheduled session task/notification off SESSION_SCHEDULED,
 * and student+payment creation / LMS linking off PARTIAL_PAYMENT /
 * ONBOARDED_LEARNER. One parameterized transition rather than near-identical
 * per-stage functions, branching only where a stage's side effects differ.
 */
export async function transitionStage(id: string, payload: LeadStageTransitionInput, actorId?: string | null) {
  const existing = await prisma.lead.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new ApiError("Lead not found", 404);

  const target = payload.stage;
  if (!isValidTransition(existing.stage, target)) {
    throw new ApiError(`Cannot move a lead from "${stageLabel(existing.stage)}" to "${stageLabel(target)}"`, 422);
  }

  const data: { stage: LeadStage; updatedById: string | null; nextFollowUpAt?: Date; sessionScheduledAt?: Date } = {
    stage: target,
    updatedById: actorId ?? null,
  };
  let noteBody = `Stage changed from ${stageLabel(existing.stage)} to ${stageLabel(target)}.`;

  if (payload.stage === "FOLLOW_UP") {
    data.nextFollowUpAt = payload.followUpAt ?? new Date(Date.now() + 86_400_000);
    if (payload.reason) noteBody += ` Reason: ${payload.reason}`;
  } else if (payload.stage === "SESSION_SCHEDULED") {
    data.sessionScheduledAt = payload.sessionScheduledAt;
  } else if (isTerminalStage(target) && "reason" in payload && payload.reason) {
    noteBody += ` Reason: ${payload.reason}`;
  }

  const lead = await prisma.lead.update({ where: { id }, data, include: { course: { select: { id: true, title: true } } } });

  await prisma.leadNote.create({
    data: { leadId: id, type: "STAGE_CHANGE", body: noteBody, createdById: actorId ?? null },
  });

  if (payload.stage === "FOLLOW_UP") {
    await createTask(
      {
        title: `Follow up with ${lead.name}`,
        description: payload.reason ?? null,
        status: "PENDING",
        priority: "MEDIUM",
        dueDate: lead.nextFollowUpAt,
        assignedToId: lead.assignedToId,
        entityType: "lead",
        entityId: lead.id,
        leadId: lead.id,
        studentId: null,
      },
      actorId
    );
  }

  if (payload.stage === "SESSION_SCHEDULED") {
    await createTask(
      {
        title: `Session with ${lead.name}`,
        description: null,
        status: "PENDING",
        priority: "HIGH",
        dueDate: lead.sessionScheduledAt,
        assignedToId: lead.assignedToId,
        entityType: "lead",
        entityId: lead.id,
        leadId: lead.id,
        studentId: null,
      },
      actorId
    );
    if (lead.assignedToId) {
      await createNotification({
        userId: lead.assignedToId,
        type: "SESSION_SCHEDULED",
        title: "Session scheduled",
        body: `Session with ${lead.name} scheduled for ${lead.sessionScheduledAt?.toLocaleString() ?? "TBD"}.`,
        link: `/admin/leads/${lead.id}`,
        entityType: "lead",
        entityId: lead.id,
      });
    }
  }

  let studentId: string | null = null;

  if (payload.stage === "PARTIAL_PAYMENT") {
    let student = await getStudentByLeadId(lead.id);
    if (!student) student = await createStudentFromLead(lead, {}, actorId);
    studentId = student.id;

    // Dynamic import: paymentService transitively pulls in receipt/invoice
    // PDF generation (pdfkit/fontkit) — a much heavier dependency than the
    // rest of this file needs on every stage move, so it's only loaded for
    // the two transitions that actually record a payment.
    const { createManualPayment } = await import("@/lib/services/paymentService");
    await createManualPayment(
      {
        studentId: student.id,
        amount: payload.payment.amount,
        method: payload.payment.method,
        type: payload.payment.type,
        notes: payload.payment.notes,
      },
      actorId
    );

    await dispatchTrigger("PAYMENT_RECEIVED", {
      entityType: "student",
      entityId: student.id,
      actorId,
      eventSignature: `lead-${lead.id}-partial-payment`,
      context: { leadId: lead.id, studentEmail: student.email, assignedToId: lead.assignedToId },
    });
  }

  if (payload.stage === "ONBOARDED_LEARNER") {
    let student = await getStudentByLeadId(lead.id);
    if (!student) student = await createStudentFromLead(lead, { batchId: payload.batchId }, actorId);
    studentId = student.id;

    if (payload.payment) {
      const { createManualPayment } = await import("@/lib/services/paymentService");
      await createManualPayment(
        {
          studentId: student.id,
          amount: payload.payment.amount,
          method: payload.payment.method,
          type: payload.payment.type,
          notes: payload.payment.notes,
        },
        actorId
      );
    }

    await updateStudent(student.id, { batchId: payload.batchId, admissionStatus: "CONFIRMED" }, actorId);
    await linkStudentToLms(student.id, actorId);

    if (lead.assignedToId) {
      await createNotification({
        userId: lead.assignedToId,
        type: "ADMISSION_COMPLETED",
        title: "Learner onboarded",
        body: `${lead.name} has been onboarded as a learner.`,
        link: `/admin/students/${student.id}`,
        entityType: "student",
        entityId: student.id,
      });
    }

    await dispatchTrigger("ADMISSION_APPROVED", {
      entityType: "student",
      entityId: student.id,
      actorId,
      eventSignature: `lead-${lead.id}-onboarded`,
      context: { leadId: lead.id, studentEmail: student.email, assignedToId: lead.assignedToId },
    });
  }

  await logActivity({
    userId: actorId,
    action: "STAGE_CHANGE",
    entityType: "lead",
    entityId: id,
    metadata: { from: existing.stage, to: target, studentId },
  });

  await dispatchTrigger("LEAD_STAGE_CHANGED", {
    entityType: "lead",
    entityId: id,
    actorId,
    eventSignature: `${existing.stage}->${target}`,
    context: { fromStage: existing.stage, toStage: target, leadEmail: lead.email, assignedToId: lead.assignedToId },
  });

  return lead;
}

export function listLeadNotes(leadId: string) {
  return prisma.leadNote.findMany({ where: { leadId }, orderBy: { createdAt: "desc" } });
}

export async function addLeadNote(leadId: string, input: LeadNoteInput, actorId?: string | null) {
  const note = await prisma.leadNote.create({
    data: { leadId, type: input.type, body: input.body, attachmentUrl: input.attachmentUrl, createdById: actorId ?? null },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "leadNote", entityId: note.id, metadata: { leadId } });
  return note;
}

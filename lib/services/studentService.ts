import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { ApiError } from "@/lib/api-guard";
import { getLeadById } from "@/lib/services/leadService";
import { dispatchTrigger } from "@/lib/services/workflowService";
import type { StudentInput, StudentUpdateInput, ConvertLeadInput } from "@/lib/validation/student";
import type { AdmissionStatus, Lead } from "@prisma/client";

const include = {
  course: { select: { id: true, title: true } },
  batch: { select: { id: true, name: true } },
} as const;

export type ListStudentsParams = {
  page?: number;
  pageSize?: number;
  batchId?: string;
  admissionStatus?: AdmissionStatus;
  search?: string;
};

export async function listStudents(params: ListStudentsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    deletedAt: null,
    ...(params.batchId ? { batchId: params.batchId } : {}),
    ...(params.admissionStatus ? { admissionStatus: params.admissionStatus } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.student.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include }),
    prisma.student.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getStudentById(id: string) {
  return prisma.student.findFirst({ where: { id, deletedAt: null }, include });
}

export function getStudentByLeadId(leadId: string) {
  return prisma.student.findFirst({ where: { leadId, deletedAt: null } });
}

export async function createStudent(input: StudentInput, actorId?: string | null) {
  const student = await prisma.student.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      courseId: input.courseId,
      batchId: input.batchId,
      admissionStatus: input.admissionStatus,
      offerLetterUrl: input.offerLetterUrl,
      assignedToId: input.assignedToId,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
    include,
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "student", entityId: student.id });
  return student;
}

export async function updateStudent(id: string, input: StudentUpdateInput, actorId?: string | null) {
  const student = await prisma.student.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.courseId !== undefined && { courseId: input.courseId }),
      ...(input.batchId !== undefined && { batchId: input.batchId }),
      ...(input.admissionStatus !== undefined && { admissionStatus: input.admissionStatus }),
      ...(input.offerLetterUrl !== undefined && { offerLetterUrl: input.offerLetterUrl }),
      ...(input.assignedToId !== undefined && { assignedToId: input.assignedToId }),
      updatedById: actorId ?? null,
    },
    include,
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "student", entityId: id });
  return student;
}

/**
 * Creates the Student record behind a Lead. Pure creation only — it does
 * NOT change the lead's pipeline stage; stage progression is owned
 * exclusively by leadService.transitionStage (which calls this when a lead
 * enters PARTIAL_PAYMENT/ONBOARDED_LEARNER). Used both by that pipeline path
 * and by the manual "Convert to Student" escape hatch below.
 */
export async function createStudentFromLead(lead: Lead, input: { batchId?: string | null }, actorId?: string | null) {
  if (!lead.interestedCourseId) throw new ApiError("Lead has no interested course to enroll into", 422);

  const student = await prisma.student.create({
    data: {
      leadId: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      courseId: lead.interestedCourseId,
      batchId: input.batchId ?? null,
      assignedToId: lead.assignedToId,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
    include,
  });

  await logActivity({ userId: actorId, action: "CREATE", entityType: "student", entityId: student.id, metadata: { leadId: lead.id } });
  await dispatchTrigger("STUDENT_CREATED", {
    entityType: "student",
    entityId: student.id,
    actorId,
    eventSignature: `from-lead-${lead.id}`,
    context: { leadId: lead.id, studentEmail: student.email, assignedToId: student.assignedToId },
  });

  return student;
}

/**
 * Manual "Convert to Student" escape hatch (the lead detail page button) —
 * pre-creates the Student record independently of pipeline position. It no
 * longer forces a stage change: the pipeline itself only advances through
 * leadService.transitionStage's legal transitions.
 */
export async function convertLeadToStudent(leadId: string, input: ConvertLeadInput, actorId?: string | null) {
  const lead = await getLeadById(leadId);
  if (!lead) throw new ApiError("Lead not found", 404);

  const existing = await getStudentByLeadId(leadId);
  if (existing) throw new ApiError("This lead has already been converted to a student", 409);

  return createStudentFromLead(lead, input, actorId);
}

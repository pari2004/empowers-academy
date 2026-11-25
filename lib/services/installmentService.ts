import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { computeInstallmentSplit } from "@/lib/finance/calculations";
import { getOrCreateFeeProfile, recalculateFeeProfile, createManualPayment } from "@/lib/services/paymentService";
import type { GenerateInstallmentPlanInput, InstallmentUpdateInput, MarkInstallmentPaidInput } from "@/lib/validation/installment";
import type { InstallmentStatus } from "@prisma/client";

const studentSelect = { select: { id: true, name: true, email: true, phone: true } } as const;

export type ListInstallmentsParams = {
  page?: number;
  pageSize?: number;
  studentId?: string;
  status?: InstallmentStatus;
  dueBefore?: Date;
  dueAfter?: Date;
};

function buildInstallmentsWhere(params: ListInstallmentsParams) {
  return {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.dueBefore || params.dueAfter
      ? {
          dueDate: {
            ...(params.dueBefore ? { lte: params.dueBefore } : {}),
            ...(params.dueAfter ? { gte: params.dueAfter } : {}),
          },
        }
      : {}),
  };
}

export async function listInstallments(params: ListInstallmentsParams = {}) {
  await sweepOverdueInstallments();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = buildInstallmentsWhere(params);

  const [items, total] = await Promise.all([
    prisma.installment.findMany({
      where,
      orderBy: { dueDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { student: studentSelect },
    }),
    prisma.installment.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getInstallmentById(id: string) {
  return prisma.installment.findUnique({ where: { id }, include: { student: studentSelect, payment: true } });
}

export async function generateInstallmentPlan(studentId: string, input: GenerateInstallmentPlanInput, actorId?: string | null) {
  const existingCount = await prisma.installment.count({ where: { studentId, status: { not: "CANCELLED" } } });
  if (existingCount > 0) throw new Error("An installment plan already exists for this student");

  const profile = await getOrCreateFeeProfile(studentId, actorId);
  const amountToSplit = Number(profile.pendingAmount) > 0 ? Number(profile.pendingAmount) : Number(profile.totalCourseFee);
  const rows = computeInstallmentSplit(amountToSplit, input.count, input.startDate);

  await prisma.$transaction(
    rows.map((row) =>
      prisma.installment.create({
        data: {
          studentId,
          installmentNumber: row.installmentNumber,
          dueDate: row.dueDate,
          amount: row.amount,
          createdById: actorId ?? null,
          updatedById: actorId ?? null,
        },
      })
    )
  );

  await prisma.studentFeeProfile.update({ where: { studentId }, data: { installmentCount: input.count } });
  await recalculateFeeProfile(studentId);

  await logActivity({ userId: actorId, action: "CREATE", entityType: "installmentPlan", entityId: studentId, metadata: { count: input.count } });

  return listInstallments({ studentId });
}

export async function updateInstallment(id: string, input: InstallmentUpdateInput, actorId?: string | null) {
  const existing = await prisma.installment.findUnique({ where: { id } });
  if (!existing) throw new Error("Installment not found");
  if (existing.status === "PAID") throw new Error("A paid installment cannot be edited");

  const installment = await prisma.installment.update({
    where: { id },
    data: {
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.notes !== undefined && { notes: input.notes }),
      updatedById: actorId ?? null,
    },
  });

  await recalculateFeeProfile(existing.studentId);
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "installment", entityId: id });
  return installment;
}

/** Reuses paymentService.createManualPayment so a from-installment payment gets
 *  the exact same receipt/invoice/fee-profile side effects as any other manual
 *  payment — createManualPayment handles the installment→payment linking itself
 *  when `installmentId` is passed. */
export async function markInstallmentPaid(id: string, input: MarkInstallmentPaidInput, actorId?: string | null) {
  const installment = await prisma.installment.findUnique({ where: { id } });
  if (!installment) throw new Error("Installment not found");
  if (installment.status === "PAID") throw new Error("Installment is already paid");
  if (installment.status === "CANCELLED") throw new Error("Cannot pay a cancelled installment");

  await createManualPayment(
    {
      studentId: installment.studentId,
      type: "INSTALLMENT",
      amount: Number(installment.amount),
      method: input.method,
      installmentId: id,
      notes: input.notes,
    },
    actorId
  );

  return getInstallmentById(id);
}

export async function cancelInstallment(id: string, actorId?: string | null) {
  const existing = await prisma.installment.findUnique({ where: { id } });
  if (!existing) throw new Error("Installment not found");
  if (existing.status === "PAID") throw new Error("A paid installment cannot be cancelled");

  const installment = await prisma.installment.update({
    where: { id },
    data: { status: "CANCELLED", updatedById: actorId ?? null },
  });

  await recalculateFeeProfile(existing.studentId);
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "installment", entityId: id, metadata: { cancelled: true } });
  return installment;
}

/** Read-time status promotion — there's no background scheduler, so every list/
 *  dashboard/report read sweeps PENDING installments past their due date to OVERDUE first. */
export async function sweepOverdueInstallments() {
  const result = await prisma.installment.updateMany({
    where: { status: "PENDING", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });
  return result.count;
}

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { computeRefundableAmount } from "@/lib/finance/calculations";
import { getGateway } from "@/lib/payments";
import { recalculateFeeProfile } from "@/lib/services/paymentService";
import type { RefundRequestInput } from "@/lib/validation/refund";

const studentSelect = { select: { id: true, name: true, email: true, phone: true } } as const;

export type ListRefundsParams = { page?: number; pageSize?: number; studentId?: string; status?: string };

export async function listRefunds(params: ListRefundsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.status ? { status: params.status as never } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { student: studentSelect },
    }),
    prisma.refund.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function listAllRefundsForExport(params: ListRefundsParams = {}) {
  return prisma.refund.findMany({
    where: params.studentId ? { studentId: params.studentId } : {},
    orderBy: { createdAt: "desc" },
    include: { student: studentSelect },
  });
}

export function getRefundById(id: string) {
  return prisma.refund.findUnique({ where: { id }, include: { student: studentSelect, payment: true } });
}

export async function createRefundRequest(input: RefundRequestInput, actorId?: string | null) {
  const payment = await prisma.payment.findUnique({ where: { id: input.paymentId } });
  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "SUCCESS") throw new Error("Only successful payments can be refunded");

  const existingRefunds = await prisma.refund.findMany({ where: { paymentId: input.paymentId } });
  const refundable = computeRefundableAmount(
    { amount: Number(payment.amount) },
    existingRefunds.map((r) => ({ amount: Number(r.amount), status: r.status }))
  );
  if (input.amount > refundable) throw new Error(`Refund amount exceeds the refundable balance of ${refundable}`);

  const refund = await prisma.refund.create({
    data: {
      paymentId: input.paymentId,
      studentId: payment.studentId,
      amount: input.amount,
      type: input.type,
      reason: input.reason,
      createdById: actorId ?? null,
    },
  });

  await logActivity({ userId: actorId, action: "CREATE", entityType: "refund", entityId: refund.id, metadata: { paymentId: input.paymentId } });
  return refund;
}

export async function approveRefund(id: string, actorId?: string | null) {
  const refund = await prisma.refund.findUnique({ where: { id }, include: { payment: true } });
  if (!refund) throw new Error("Refund not found");
  if (refund.status !== "REQUESTED") throw new Error("Only a requested refund can be approved");

  const gateway = getGateway(refund.payment.method);
  const result =
    refund.payment.method === "RAZORPAY" && refund.payment.gatewayPaymentId
      ? await gateway.refund({ gatewayPaymentId: refund.payment.gatewayPaymentId, amount: Number(refund.amount) })
      : await gateway.refund({ gatewayPaymentId: refund.paymentId, amount: Number(refund.amount) });

  const updated = await prisma.refund.update({
    where: { id },
    data: {
      status: "PROCESSED",
      approvedById: actorId ?? null,
      gatewayRefundId: result.refundId,
      refundedAt: new Date(),
    },
  });

  if (refund.type === "FULL") {
    await prisma.payment.update({ where: { id: refund.paymentId }, data: { status: "REFUNDED" } });
  }

  await recalculateFeeProfile(refund.studentId);
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "refund", entityId: id, metadata: { approved: true } });
  return updated;
}

export async function rejectRefund(id: string, reason: string, actorId?: string | null) {
  const refund = await prisma.refund.findUnique({ where: { id } });
  if (!refund) throw new Error("Refund not found");
  if (refund.status !== "REQUESTED") throw new Error("Only a requested refund can be rejected");

  const updated = await prisma.refund.update({ where: { id }, data: { status: "REJECTED" } });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "refund", entityId: id, metadata: { rejected: true, reason } });
  return updated;
}

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { computePendingAmount, computeFeeStatus } from "@/lib/finance/calculations";
import { getGateway } from "@/lib/payments";
import { validateCoupon, getCouponByCode, incrementCouponUsage } from "@/lib/services/couponService";
import * as receiptService from "@/lib/services/receiptService";
import * as invoiceService from "@/lib/services/invoiceService";
import type { ManualPaymentInput, RazorpayOrderRequestInput, RazorpayConfirmInput } from "@/lib/validation/payment";
import type { FeeProfileUpdateInput } from "@/lib/validation/payment";
import type { FeeStatus, PaymentMethod, PaymentType, PaymentTxnStatus } from "@prisma/client";

const studentSelect = { select: { id: true, name: true, email: true, phone: true } } as const;

export type ListPaymentsParams = {
  page?: number;
  pageSize?: number;
  studentId?: string;
  courseId?: string;
  method?: PaymentMethod;
  type?: PaymentType;
  status?: PaymentTxnStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
};

function buildPaymentsWhere(params: ListPaymentsParams) {
  return {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.courseId ? { courseId: params.courseId } : {}),
    ...(params.method ? { method: params.method } : {}),
    ...(params.type ? { type: params.type } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.dateFrom || params.dateTo
      ? {
          createdAt: {
            ...(params.dateFrom ? { gte: params.dateFrom } : {}),
            ...(params.dateTo ? { lte: params.dateTo } : {}),
          },
        }
      : {}),
    ...(params.search
      ? {
          student: {
            is: {
              OR: [
                { name: { contains: params.search, mode: "insensitive" as const } },
                { email: { contains: params.search, mode: "insensitive" as const } },
              ],
            },
          },
        }
      : {}),
  };
}

export async function listPayments(params: ListPaymentsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = buildPaymentsWhere(params);

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { student: studentSelect },
    }),
    prisma.payment.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function listAllPaymentsForExport(params: ListPaymentsParams = {}) {
  return prisma.payment.findMany({
    where: buildPaymentsWhere(params),
    orderBy: { createdAt: "desc" },
    include: { student: studentSelect },
  });
}

export function getPaymentById(id: string) {
  return prisma.payment.findUnique({ where: { id }, include: { student: studentSelect, invoice: true, receipt: true, refunds: true } });
}

export async function getOrCreateFeeProfile(studentId: string, actorId?: string | null) {
  const existing = await prisma.studentFeeProfile.findUnique({ where: { studentId } });
  if (existing) return existing;

  const student = await prisma.student.findFirst({
    where: { id: studentId, deletedAt: null },
    include: { course: { select: { price: true, discountPrice: true } } },
  });
  if (!student) throw new Error("Student not found");

  const totalCourseFee = Number(student.course.discountPrice ?? student.course.price ?? 0);
  return prisma.studentFeeProfile.create({
    data: { studentId, totalCourseFee, createdById: actorId ?? null, updatedById: actorId ?? null },
  });
}

export async function updateFeeProfile(studentId: string, input: FeeProfileUpdateInput, actorId?: string | null) {
  await getOrCreateFeeProfile(studentId, actorId);
  await prisma.studentFeeProfile.update({
    where: { studentId },
    data: {
      ...(input.totalCourseFee !== undefined && { totalCourseFee: input.totalCourseFee }),
      ...(input.registrationFee !== undefined && { registrationFee: input.registrationFee }),
      ...(input.discountAmount !== undefined && { discountAmount: input.discountAmount }),
      ...(input.scholarshipAmount !== undefined && { scholarshipAmount: input.scholarshipAmount }),
      ...(input.installmentCount !== undefined && { installmentCount: input.installmentCount }),
      updatedById: actorId ?? null,
    },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "studentFeeProfile", entityId: studentId });
  return recalculateFeeProfile(studentId);
}

/** The single writer for StudentFeeProfile's cached aggregates — called after every
 *  mutation that changes a student's paid/pending/due-date picture (payment success,
 *  refund processed, installment paid/cancelled). */
export async function recalculateFeeProfile(studentId: string) {
  const [paidAgg, refundedAgg, overdueCount, nextInstallment, profile] = await Promise.all([
    prisma.payment.aggregate({ where: { studentId, status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.refund.aggregate({ where: { studentId, status: "PROCESSED" }, _sum: { amount: true } }),
    prisma.installment.count({ where: { studentId, status: "OVERDUE" } }),
    prisma.installment.findFirst({
      where: { studentId, status: { in: ["PENDING", "OVERDUE"] } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.studentFeeProfile.findUnique({ where: { studentId } }),
  ]);

  if (!profile) return null;

  const grossPaid = Number(paidAgg._sum.amount ?? 0);
  const totalRefunded = Number(refundedAgg._sum.amount ?? 0);
  const amountPaid = grossPaid - totalRefunded;
  const pendingAmount = computePendingAmount({
    totalCourseFee: Number(profile.totalCourseFee),
    registrationFee: Number(profile.registrationFee),
    discountAmount: Number(profile.discountAmount),
    scholarshipAmount: Number(profile.scholarshipAmount),
    amountPaid,
  });

  let paymentStatus: FeeStatus = computeFeeStatus({ amountPaid, pendingAmount, hasOverdueInstallment: overdueCount > 0 });
  if (amountPaid <= 0 && totalRefunded > 0) paymentStatus = "REFUNDED";

  return prisma.studentFeeProfile.update({
    where: { studentId },
    data: { amountPaid, pendingAmount, nextDueDate: nextInstallment?.dueDate ?? null, paymentStatus },
  });
}

/** Shared success path for both the checkout.js client confirm and the webhook —
 *  each verifies the payment differently, but the side effects (installment/receipt/
 *  invoice/fee-profile) are identical, so they live here once. Idempotent: a payment
 *  already SUCCESS is returned as-is. */
async function markPaymentSuccess(paymentId: string, gatewayPaymentId: string | null, actorId?: string | null) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");
  if (payment.status === "SUCCESS") return payment;

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "SUCCESS",
      gatewayPaymentId: gatewayPaymentId ?? payment.gatewayPaymentId,
      updatedById: actorId ?? null,
    },
  });

  const installment = await prisma.installment.findUnique({ where: { paymentId } });
  if (installment) {
    await prisma.installment.update({ where: { id: installment.id }, data: { status: "PAID", paidAt: new Date() } });
  }

  await receiptService.createReceiptForPayment(paymentId, actorId);
  await invoiceService.generateInvoiceForPayment(paymentId, actorId);
  await recalculateFeeProfile(payment.studentId);

  return updated;
}

export async function createManualPayment(input: ManualPaymentInput, actorId?: string | null) {
  const student = await prisma.student.findFirst({ where: { id: input.studentId, deletedAt: null } });
  if (!student) throw new Error("Student not found");

  await getOrCreateFeeProfile(input.studentId, actorId);

  let discountAmount = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const result = await validateCoupon(input.couponCode, { amount: input.amount, courseId: student.courseId });
    if ("error" in result) throw new Error(result.error);
    discountAmount = result.discount ?? 0;
    couponId = (await getCouponByCode(input.couponCode))?.id ?? null;
  }

  const payment = await prisma.payment.create({
    data: {
      studentId: input.studentId,
      courseId: student.courseId,
      type: input.type,
      method: input.method,
      amount: input.amount,
      discountAmount,
      couponId,
      status: "SUCCESS",
      collectedById: actorId ?? null,
      notes: input.notes,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
  });

  if (input.installmentId) {
    await prisma.installment.update({
      where: { id: input.installmentId },
      data: { paymentId: payment.id, status: "PAID", paidAt: new Date() },
    });
  }

  if (couponId) await incrementCouponUsage(couponId);

  await receiptService.createReceiptForPayment(payment.id, actorId);
  await invoiceService.generateInvoiceForPayment(payment.id, actorId);
  await recalculateFeeProfile(input.studentId);

  await logActivity({
    userId: actorId,
    action: "CREATE",
    entityType: "payment",
    entityId: payment.id,
    metadata: { manual: true, method: input.method, amount: input.amount },
  });

  return payment;
}

export async function createRazorpayOrder(input: RazorpayOrderRequestInput, actorId?: string | null) {
  const student = await prisma.student.findFirst({ where: { id: input.studentId, deletedAt: null } });
  if (!student) throw new Error("Student not found");
  await getOrCreateFeeProfile(input.studentId, actorId);

  const payment = await prisma.payment.create({
    data: {
      studentId: input.studentId,
      courseId: student.courseId,
      type: input.type,
      method: "RAZORPAY",
      amount: input.amount,
      status: "PENDING",
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
  });

  const testMode = process.env.RAZORPAY_TEST_MODE === "true";
  const order = testMode
    ? { orderId: `order_test_${payment.id.slice(0, 8)}`, amount: input.amount, currency: "INR", keyId: "rzp_test_placeholder" }
    : await getGateway("RAZORPAY").createOrder({ amount: input.amount, receipt: payment.id });

  await prisma.payment.update({ where: { id: payment.id }, data: { gatewayOrderId: order.orderId } });
  await prisma.paymentTransaction.create({
    data: { paymentId: payment.id, gateway: "RAZORPAY", gatewayOrderId: order.orderId, status: "PENDING" },
  });

  if (input.installmentId) {
    await prisma.installment.update({ where: { id: input.installmentId }, data: { paymentId: payment.id } });
  }

  return { paymentId: payment.id, orderId: order.orderId, amount: order.amount, currency: order.currency, keyId: order.keyId, testMode };
}

export async function confirmRazorpayPayment(input: RazorpayConfirmInput, actorId?: string | null) {
  const payment = await prisma.payment.findUnique({ where: { id: input.paymentId } });
  if (!payment) throw new Error("Payment not found");
  if (payment.status === "SUCCESS") return payment;

  const testMode = process.env.RAZORPAY_TEST_MODE === "true";
  const verified =
    testMode ||
    getGateway("RAZORPAY").verifyPayment({
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
    });
  if (!verified) throw new Error("Payment signature verification failed");

  const updated = await markPaymentSuccess(payment.id, input.razorpayPaymentId, actorId);

  await prisma.paymentTransaction.create({
    data: {
      paymentId: payment.id,
      gateway: "RAZORPAY",
      gatewayOrderId: input.razorpayOrderId,
      gatewayPaymentId: input.razorpayPaymentId,
      gatewaySignature: input.razorpaySignature,
      status: "SUCCESS",
    },
  });

  await logActivity({ userId: actorId, action: "UPDATE", entityType: "payment", entityId: payment.id, metadata: { razorpayConfirmed: true } });

  return updated;
}

/** Reconciles the case where the client-side confirm callback never fires
 *  (e.g. the browser tab closed mid-checkout) — verified via HMAC over the raw
 *  webhook body, not the per-payment checkout.js signature. */
export async function handleRazorpayWebhook(rawBody: string, signatureHeader: string) {
  if (!getGateway("RAZORPAY").verifyWebhookSignature(rawBody, signatureHeader)) {
    throw new Error("Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string } } };
  };
  const entity = payload.payload?.payment?.entity;
  if (!entity?.order_id) return { handled: false };

  const payment = await prisma.payment.findFirst({ where: { gatewayOrderId: entity.order_id } });
  if (!payment) return { handled: false };

  await prisma.paymentTransaction.create({
    data: {
      paymentId: payment.id,
      gateway: "RAZORPAY",
      gatewayOrderId: entity.order_id,
      gatewayPaymentId: entity.id,
      status: payload.event === "payment.captured" ? "SUCCESS" : "FAILED",
      rawPayload: payload as never,
    },
  });

  if (payload.event === "payment.captured" && payment.status !== "SUCCESS") {
    await markPaymentSuccess(payment.id, entity.id, null);
  } else if (payload.event === "payment.failed" && payment.status === "PENDING") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
  }

  return { handled: true };
}

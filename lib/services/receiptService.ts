import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { nextSequence } from "@/lib/services/financeSequenceService";
import { nextSequenceFormat } from "@/lib/finance/calculations";
import { generateReceiptPdf } from "@/lib/pdf/receiptPdf";
import { sendEmail } from "@/lib/email";

const studentSelect = { select: { id: true, name: true, email: true, phone: true } } as const;

export type ListReceiptsParams = { page?: number; pageSize?: number; studentId?: string };

export async function listReceipts(params: ListReceiptsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = params.studentId ? { studentId: params.studentId } : {};

  const [items, total] = await Promise.all([
    prisma.receipt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { student: studentSelect },
    }),
    prisma.receipt.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function listAllReceiptsForExport(params: ListReceiptsParams = {}) {
  return prisma.receipt.findMany({
    where: params.studentId ? { studentId: params.studentId } : {},
    orderBy: { createdAt: "desc" },
    include: { student: studentSelect },
  });
}

export function getReceiptById(id: string) {
  return prisma.receipt.findUnique({ where: { id }, include: { student: studentSelect, payment: true } });
}

export async function createReceiptForPayment(paymentId: string, actorId?: string | null) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const seq = await nextSequence("RECEIPT");
  const receiptNumber = nextSequenceFormat(settings?.receiptPrefix ?? "RCT", seq);

  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber,
      paymentId: payment.id,
      studentId: payment.studentId,
      amount: payment.amount,
      method: payment.method,
      collectedById: payment.collectedById ?? actorId ?? null,
    },
  });

  await prisma.payment.update({ where: { id: payment.id }, data: { receiptNumber } });

  await logActivity({ userId: actorId, action: "CREATE", entityType: "receipt", entityId: receipt.id, metadata: { paymentId } });
  return receipt;
}

export async function getReceiptPdfBuffer(id: string): Promise<Buffer> {
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: { student: true } });
  if (!receipt) throw new Error("Receipt not found");

  const [collector, settings] = await Promise.all([
    receipt.collectedById ? prisma.user.findUnique({ where: { id: receipt.collectedById }, select: { name: true } }) : null,
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return generateReceiptPdf({
    receiptNumber: receipt.receiptNumber,
    createdAt: receipt.createdAt,
    amount: Number(receipt.amount),
    method: receipt.method,
    collectedByName: collector?.name ?? null,
    student: { name: receipt.student.name },
    company: { siteName: settings?.siteName ?? "Empowers Academy" },
  });
}

export async function emailReceipt(id: string, to: string | undefined, actorId?: string | null) {
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: { student: true } });
  if (!receipt) throw new Error("Receipt not found");
  const recipient = to ?? receipt.student.email;
  if (!recipient) throw new Error("No email address available for this student");

  const buffer = await getReceiptPdfBuffer(id);
  await sendEmail({
    to: recipient,
    subject: `Receipt ${receipt.receiptNumber}`,
    html: `<p>Please find attached receipt ${receipt.receiptNumber} for ${receipt.student.name}.</p>`,
    attachments: [{ filename: `${receipt.receiptNumber}.pdf`, content: buffer }],
  });

  const updated = await prisma.receipt.update({ where: { id }, data: { emailedAt: new Date() } });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "receipt", entityId: id, metadata: { emailed: true } });
  return updated;
}

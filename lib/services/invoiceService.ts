import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { nextSequence } from "@/lib/services/financeSequenceService";
import { nextSequenceFormat } from "@/lib/finance/calculations";
import { generateInvoicePdf } from "@/lib/pdf/invoicePdf";
import { sendEmail } from "@/lib/email";

const studentSelect = { select: { id: true, name: true, email: true, phone: true } } as const;

export type ListInvoicesParams = { page?: number; pageSize?: number; studentId?: string };

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function listInvoices(params: ListInvoicesParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = params.studentId ? { studentId: params.studentId } : {};

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { student: studentSelect },
    }),
    prisma.invoice.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function listAllInvoicesForExport(params: ListInvoicesParams = {}) {
  return prisma.invoice.findMany({
    where: params.studentId ? { studentId: params.studentId } : {},
    orderBy: { createdAt: "desc" },
    include: { student: studentSelect },
  });
}

export function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({ where: { id }, include: { student: studentSelect, payment: true } });
}

export async function generateInvoiceForPayment(paymentId: string, actorId?: string | null) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const gstRate = settings?.gstEnabled ? Number(settings.gstRate ?? 0) : 0;
  const gstAmount = gstRate > 0 ? round2((Number(payment.amount) * gstRate) / 100) : 0;
  const totalAmount = round2(Number(payment.amount) + gstAmount);

  const seq = await nextSequence("INVOICE");
  const invoiceNumber = nextSequenceFormat(settings?.invoicePrefix ?? "INV", seq);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      paymentId: payment.id,
      studentId: payment.studentId,
      courseId: payment.courseId,
      amount: payment.amount,
      gstRate: gstRate > 0 ? gstRate : null,
      gstAmount,
      totalAmount,
      createdById: actorId ?? null,
    },
  });

  await logActivity({ userId: actorId, action: "CREATE", entityType: "invoice", entityId: invoice.id, metadata: { paymentId } });
  return invoice;
}

export async function getInvoicePdfBuffer(id: string): Promise<Buffer> {
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { student: true, payment: true } });
  if (!invoice) throw new Error("Invoice not found");

  const [course, settings] = await Promise.all([
    prisma.course.findUnique({ where: { id: invoice.courseId }, select: { title: true } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return generateInvoicePdf({
    invoiceNumber: invoice.invoiceNumber,
    createdAt: invoice.createdAt,
    amount: Number(invoice.amount),
    discountAmount: Number(invoice.payment.discountAmount),
    scholarshipAmount: Number(invoice.payment.scholarshipAmount),
    gstRate: invoice.gstRate ? Number(invoice.gstRate) : null,
    gstAmount: Number(invoice.gstAmount),
    totalAmount: Number(invoice.totalAmount),
    paymentMethod: invoice.payment.method,
    student: { name: invoice.student.name, email: invoice.student.email, phone: invoice.student.phone },
    course: { title: course?.title ?? "—" },
    company: { siteName: settings?.siteName ?? "Empowers Academy", gstNumber: settings?.gstNumber ?? null },
  });
}

export async function emailInvoice(id: string, to: string | undefined, actorId?: string | null) {
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { student: true } });
  if (!invoice) throw new Error("Invoice not found");
  const recipient = to ?? invoice.student.email;
  if (!recipient) throw new Error("No email address available for this student");

  const buffer = await getInvoicePdfBuffer(id);
  await sendEmail({
    to: recipient,
    subject: `Invoice ${invoice.invoiceNumber}`,
    html: `<p>Please find attached invoice ${invoice.invoiceNumber} for ${invoice.student.name}.</p>`,
    attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: buffer }],
  });

  const updated = await prisma.invoice.update({ where: { id }, data: { emailedAt: new Date(), status: "EMAILED" } });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "invoice", entityId: id, metadata: { emailed: true } });
  return updated;
}

export async function reprintInvoice(id: string, actorId?: string | null) {
  const invoice = await getInvoiceById(id);
  if (!invoice) throw new Error("Invoice not found");
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "invoice", entityId: id, metadata: { reprint: true } });
  return invoice;
}

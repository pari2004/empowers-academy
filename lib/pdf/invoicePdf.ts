import { renderPdf } from "@/lib/pdf/renderPdf";
import { generateQrPngBuffer } from "@/lib/pdf/qrCode";

export type InvoicePdfInput = {
  invoiceNumber: string;
  createdAt: Date;
  amount: number;
  discountAmount: number;
  scholarshipAmount: number;
  gstRate?: number | null;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: string;
  student: { name: string; email?: string | null; phone?: string | null };
  course: { title: string };
  company: { siteName: string; gstNumber?: string | null };
};

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}

export async function generateInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
  const qrBuffer = await generateQrPngBuffer(
    `invoice:${input.invoiceNumber};amount:${input.totalAmount}`
  ).catch(() => null);

  return renderPdf((doc) => {
    doc.fontSize(20).text(input.company.siteName, { continued: false });
    doc.fontSize(10).fillColor("#666").text("Fee Invoice").moveDown(1.5);
    doc.fillColor("#000");

    doc.fontSize(12).text(`Invoice #: ${input.invoiceNumber}`);
    doc.text(`Date: ${input.createdAt.toLocaleDateString()}`);
    if (input.company.gstNumber) doc.text(`GSTIN: ${input.company.gstNumber}`);
    doc.moveDown();

    doc.fontSize(12).text("Billed to:", { underline: true });
    doc.text(input.student.name);
    if (input.student.email) doc.text(input.student.email);
    if (input.student.phone) doc.text(input.student.phone);
    doc.moveDown();

    doc.text(`Course: ${input.course.title}`);
    doc.moveDown();

    doc.fontSize(12).text("Amount Details", { underline: true });
    doc.fontSize(11);
    doc.text(`Amount: ${formatCurrency(input.amount)}`);
    if (input.discountAmount > 0) doc.text(`Discount: -${formatCurrency(input.discountAmount)}`);
    if (input.scholarshipAmount > 0) doc.text(`Scholarship: -${formatCurrency(input.scholarshipAmount)}`);
    if (input.gstAmount > 0) doc.text(`GST (${input.gstRate ?? 0}%): ${formatCurrency(input.gstAmount)}`);
    doc.moveDown(0.5);
    doc.fontSize(13).text(`Total: ${formatCurrency(input.totalAmount)}`, { underline: true });
    doc.fontSize(11).text(`Payment Method: ${input.paymentMethod}`);
    doc.moveDown(2);

    if (qrBuffer) {
      doc.image(qrBuffer, doc.page.width - 170, doc.page.height - 220, { width: 120 });
      doc.fontSize(8).fillColor("#666").text("Scan to verify", doc.page.width - 170, doc.page.height - 95, { width: 120, align: "center" });
    }

    doc
      .fontSize(9)
      .fillColor("#999")
      .text("This is a system-generated invoice.", 50, doc.page.height - 60, { align: "left" });
  });
}

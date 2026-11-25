import { renderPdf } from "@/lib/pdf/renderPdf";

export type ReceiptPdfInput = {
  receiptNumber: string;
  createdAt: Date;
  amount: number;
  method: string;
  collectedByName?: string | null;
  student: { name: string };
  company: { siteName: string };
};

export async function generateReceiptPdf(input: ReceiptPdfInput): Promise<Buffer> {
  return renderPdf((doc) => {
    doc.fontSize(20).text(input.company.siteName);
    doc.fontSize(10).fillColor("#666").text("Payment Receipt").moveDown(1.5);
    doc.fillColor("#000");

    doc.fontSize(12).text(`Receipt #: ${input.receiptNumber}`);
    doc.text(`Date: ${input.createdAt.toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`Received from: ${input.student.name}`);
    doc.text(`Amount: Rs. ${input.amount.toFixed(2)}`);
    doc.text(`Payment Method: ${input.method}`);
    if (input.collectedByName) doc.text(`Collected By: ${input.collectedByName}`);
    doc.moveDown(2);

    doc.fontSize(9).fillColor("#999").text("This is a system-generated receipt.", 50, doc.page.height - 60);
  });
}

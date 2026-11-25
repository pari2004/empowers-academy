import { z } from "zod";

export const emailInvoiceSchema = z.object({
  to: z.string().email().optional(),
});

export const emailReceiptSchema = z.object({
  to: z.string().email().optional(),
});

export type EmailInvoiceInput = z.infer<typeof emailInvoiceSchema>;
export type EmailReceiptInput = z.infer<typeof emailReceiptSchema>;

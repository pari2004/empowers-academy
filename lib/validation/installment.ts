import { z } from "zod";
import { manualPaymentMethodSchema } from "@/lib/validation/payment";

export const generateInstallmentPlanSchema = z.object({
  count: z.number().int().min(1).max(36),
  startDate: z.coerce.date(),
});

export const installmentUpdateSchema = z
  .object({
    dueDate: z.coerce.date(),
    amount: z.number().positive("Amount must be greater than zero"),
    notes: z.string().optional().nullable(),
  })
  .partial();

export const markInstallmentPaidSchema = z.object({
  method: manualPaymentMethodSchema,
  notes: z.string().optional().nullable(),
});

export type GenerateInstallmentPlanInput = z.infer<typeof generateInstallmentPlanSchema>;
export type InstallmentUpdateInput = z.infer<typeof installmentUpdateSchema>;
export type MarkInstallmentPaidInput = z.infer<typeof markInstallmentPaidSchema>;

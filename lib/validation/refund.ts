import { z } from "zod";

export const refundTypeSchema = z.enum(["FULL", "PARTIAL"]);

export const refundRequestSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive("Amount must be greater than zero"),
  type: refundTypeSchema,
  reason: z.string().min(5, "Please provide a reason for the refund"),
});

export const rejectRefundSchema = z.object({
  reason: z.string().min(5, "Please provide a reason for rejecting the refund"),
});

export type RefundType = z.infer<typeof refundTypeSchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;
export type RejectRefundInput = z.infer<typeof rejectRefundSchema>;

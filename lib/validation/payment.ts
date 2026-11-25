import { z } from "zod";

export const paymentTypeSchema = z.enum([
  "REGISTRATION_FEE",
  "ADMISSION_FEE",
  "COURSE_FEE",
  "INSTALLMENT",
  "OTHER",
]);

export const manualPaymentMethodSchema = z.enum(["CASH", "CHEQUE", "BANK_TRANSFER", "UPI"]);

export const paymentMethodSchema = z.enum(["RAZORPAY", "STRIPE", "UPI", "BANK_TRANSFER", "CASH", "CHEQUE"]);

export const manualPaymentSchema = z.object({
  studentId: z.string().uuid("Student is required"),
  type: paymentTypeSchema,
  amount: z.number().positive("Amount must be greater than zero"),
  method: manualPaymentMethodSchema,
  installmentId: z.string().uuid().optional().nullable(),
  couponCode: z.string().trim().min(1).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const razorpayOrderRequestSchema = z.object({
  studentId: z.string().uuid("Student is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  type: paymentTypeSchema,
  installmentId: z.string().uuid().optional().nullable(),
});

export const razorpayConfirmSchema = z.object({
  paymentId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const feeProfileUpdateSchema = z
  .object({
    totalCourseFee: z.number().nonnegative(),
    registrationFee: z.number().nonnegative(),
    discountAmount: z.number().nonnegative(),
    scholarshipAmount: z.number().nonnegative(),
    installmentCount: z.number().int().min(1).max(36),
  })
  .partial()
  .refine(
    (v) =>
      v.discountAmount === undefined ||
      v.scholarshipAmount === undefined ||
      v.totalCourseFee === undefined ||
      v.registrationFee === undefined ||
      v.discountAmount + v.scholarshipAmount <= v.totalCourseFee + v.registrationFee,
    { message: "Discount and scholarship cannot exceed the total fee", path: ["discountAmount"] }
  );

export type PaymentType = z.infer<typeof paymentTypeSchema>;
export type ManualPaymentMethod = z.infer<typeof manualPaymentMethodSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>;
export type RazorpayOrderRequestInput = z.infer<typeof razorpayOrderRequestSchema>;
export type RazorpayConfirmInput = z.infer<typeof razorpayConfirmSchema>;
export type FeeProfileUpdateInput = z.infer<typeof feeProfileUpdateSchema>;

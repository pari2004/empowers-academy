import { z } from "zod";

export const couponDiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,20}$/, "Code must be 3-20 characters: letters, numbers, - or _"),
    discountType: couponDiscountTypeSchema,
    discountValue: z.number().positive("Discount value must be greater than zero"),
    maxUsage: z.number().int().positive().default(1),
    expiryDate: z.coerce.date().optional().nullable(),
    isActive: z.boolean().default(true),
    applicableCourseIds: z.array(z.string().uuid()).optional().default([]),
  })
  .refine((v) => v.discountType !== "PERCENTAGE" || v.discountValue <= 100, {
    message: "Percentage discount cannot exceed 100",
    path: ["discountValue"],
  });

export const couponUpdateSchema = z
  .object({
    discountType: couponDiscountTypeSchema,
    discountValue: z.number().positive(),
    maxUsage: z.number().int().positive(),
    expiryDate: z.coerce.date().optional().nullable(),
    isActive: z.boolean(),
    applicableCourseIds: z.array(z.string().uuid()),
  })
  .partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1),
  amount: z.number().positive(),
  courseId: z.string().uuid().optional().nullable(),
});

export type CouponInput = z.infer<typeof couponSchema>;
export type CouponUpdateInput = z.infer<typeof couponUpdateSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

// Pure calculation helpers for the Finance module — no Prisma/Next imports,
// so these stay unit-testable without a database (see tests/finance-calculations.test.ts).

export type CouponLike = {
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  isActive: boolean;
  expiryDate?: Date | null;
  usedCount: number;
  maxUsage: number;
  applicableCourseIds: string[];
};

export type FeeProfileLike = {
  totalCourseFee: number;
  registrationFee: number;
  discountAmount: number;
  scholarshipAmount: number;
  amountPaid: number;
};

export type RefundLike = {
  amount: number;
  status: "REQUESTED" | "APPROVED" | "PROCESSED" | "REJECTED";
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Splits `totalAmount` into `count` monthly installments, allocating the
 *  rounding remainder to the last installment so the sum always matches exactly. */
export function computeInstallmentSplit(
  totalAmount: number,
  count: number,
  startDate: Date
): Array<{ installmentNumber: number; dueDate: Date; amount: number }> {
  if (count < 1) throw new Error("Installment count must be at least 1");
  const base = round2(totalAmount / count);
  const installments: Array<{ installmentNumber: number; dueDate: Date; amount: number }> = [];
  let allocated = 0;

  for (let i = 1; i <= count; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    const amount = i === count ? round2(totalAmount - allocated) : base;
    allocated = round2(allocated + amount);
    installments.push({ installmentNumber: i, dueDate, amount });
  }

  return installments;
}

/** Net payable minus amount paid — can be negative if overpaid. */
export function computePendingAmount(profile: FeeProfileLike): number {
  const netPayable =
    profile.totalCourseFee + profile.registrationFee - profile.discountAmount - profile.scholarshipAmount;
  return round2(netPayable - profile.amountPaid);
}

export function computeFeeStatus(input: {
  amountPaid: number;
  pendingAmount: number;
  hasOverdueInstallment: boolean;
}): "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" {
  if (input.amountPaid <= 0) return "PENDING";
  if (input.pendingAmount <= 0) return "PAID";
  if (input.hasOverdueInstallment) return "OVERDUE";
  return "PARTIAL";
}

export function computeCouponDiscount(
  coupon: CouponLike,
  amount: number,
  courseId?: string | null
): { discount: number; error?: undefined } | { discount?: undefined; error: string } {
  if (!coupon.isActive) return { error: "This coupon is no longer active" };
  if (coupon.expiryDate && coupon.expiryDate.getTime() < Date.now()) {
    return { error: "This coupon has expired" };
  }
  if (coupon.usedCount >= coupon.maxUsage) {
    return { error: "This coupon has reached its usage limit" };
  }
  if (coupon.applicableCourseIds.length > 0 && (!courseId || !coupon.applicableCourseIds.includes(courseId))) {
    return { error: "This coupon is not applicable to the selected course" };
  }

  const discount =
    coupon.discountType === "PERCENTAGE"
      ? round2(Math.min(amount, (amount * coupon.discountValue) / 100))
      : round2(Math.min(amount, coupon.discountValue));

  return { discount };
}

/** Amount still refundable on a payment, after subtracting refunds already
 *  requested/approved/processed (everything but REJECTED counts against the cap). */
export function computeRefundableAmount(payment: { amount: number }, existingRefunds: RefundLike[]): number {
  const reserved = existingRefunds
    .filter((r) => r.status !== "REJECTED")
    .reduce((sum, r) => round2(sum + r.amount), 0);
  return round2(payment.amount - reserved);
}

export function nextSequenceFormat(prefix: string, seq: number, year: number = new Date().getFullYear()): string {
  return `${prefix}-${year}-${String(seq).padStart(6, "0")}`;
}

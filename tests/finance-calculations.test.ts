import { describe, it, expect } from "vitest";
import {
  computeInstallmentSplit,
  computePendingAmount,
  computeFeeStatus,
  computeCouponDiscount,
  computeRefundableAmount,
  nextSequenceFormat,
} from "@/lib/finance/calculations";

describe("computeInstallmentSplit", () => {
  it("splits an amount evenly across installments", () => {
    const rows = computeInstallmentSplit(9000, 3, new Date("2026-01-01"));
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.amount)).toEqual([3000, 3000, 3000]);
    expect(rows.map((r) => r.installmentNumber)).toEqual([1, 2, 3]);
  });

  it("allocates the rounding remainder to the last installment", () => {
    const rows = computeInstallmentSplit(1000, 3, new Date("2026-01-01"));
    expect(rows.map((r) => r.amount)).toEqual([333.33, 333.33, 333.34]);
    const sum = rows.reduce((s, r) => s + r.amount, 0);
    expect(Math.round(sum * 100) / 100).toBe(1000);
  });

  it("spaces due dates one month apart starting from startDate", () => {
    const rows = computeInstallmentSplit(3000, 3, new Date("2026-01-15"));
    expect(rows[0].dueDate.getMonth()).toBe(0);
    expect(rows[1].dueDate.getMonth()).toBe(1);
    expect(rows[2].dueDate.getMonth()).toBe(2);
  });

  it("supports a single installment", () => {
    const rows = computeInstallmentSplit(5000, 1, new Date("2026-01-01"));
    expect(rows).toEqual([{ installmentNumber: 1, dueDate: new Date("2026-01-01"), amount: 5000 }]);
  });

  it("rejects a count below 1", () => {
    expect(() => computeInstallmentSplit(1000, 0, new Date())).toThrow();
  });
});

describe("computePendingAmount", () => {
  it("computes pending amount from fee profile fields", () => {
    const pending = computePendingAmount({
      totalCourseFee: 50000,
      registrationFee: 2000,
      discountAmount: 5000,
      scholarshipAmount: 0,
      amountPaid: 10000,
    });
    expect(pending).toBe(37000);
  });

  it("returns a negative value when overpaid", () => {
    const pending = computePendingAmount({
      totalCourseFee: 10000,
      registrationFee: 0,
      discountAmount: 0,
      scholarshipAmount: 0,
      amountPaid: 12000,
    });
    expect(pending).toBe(-2000);
  });
});

describe("computeFeeStatus", () => {
  it("is PENDING when nothing has been paid", () => {
    expect(computeFeeStatus({ amountPaid: 0, pendingAmount: 10000, hasOverdueInstallment: false })).toBe("PENDING");
  });

  it("is PAID when pending amount is zero or less", () => {
    expect(computeFeeStatus({ amountPaid: 10000, pendingAmount: 0, hasOverdueInstallment: false })).toBe("PAID");
    expect(computeFeeStatus({ amountPaid: 12000, pendingAmount: -2000, hasOverdueInstallment: false })).toBe("PAID");
  });

  it("is OVERDUE when partially paid with an overdue installment", () => {
    expect(computeFeeStatus({ amountPaid: 5000, pendingAmount: 5000, hasOverdueInstallment: true })).toBe("OVERDUE");
  });

  it("is PARTIAL when partially paid with no overdue installment", () => {
    expect(computeFeeStatus({ amountPaid: 5000, pendingAmount: 5000, hasOverdueInstallment: false })).toBe("PARTIAL");
  });
});

describe("computeCouponDiscount", () => {
  const baseCoupon = {
    discountType: "PERCENTAGE" as const,
    discountValue: 10,
    isActive: true,
    expiryDate: null,
    usedCount: 0,
    maxUsage: 100,
    applicableCourseIds: [] as string[],
  };

  it("computes a percentage discount", () => {
    expect(computeCouponDiscount(baseCoupon, 10000)).toEqual({ discount: 1000 });
  });

  it("caps a percentage discount at 100% of the amount", () => {
    expect(computeCouponDiscount({ ...baseCoupon, discountValue: 150 }, 10000)).toEqual({ discount: 10000 });
  });

  it("computes a fixed discount, capped at the amount", () => {
    const coupon = { ...baseCoupon, discountType: "FIXED" as const, discountValue: 500 };
    expect(computeCouponDiscount(coupon, 10000)).toEqual({ discount: 500 });
    expect(computeCouponDiscount(coupon, 300)).toEqual({ discount: 300 });
  });

  it("rejects an inactive coupon", () => {
    expect(computeCouponDiscount({ ...baseCoupon, isActive: false }, 10000).error).toBeTruthy();
  });

  it("rejects an expired coupon", () => {
    const expired = { ...baseCoupon, expiryDate: new Date("2000-01-01") };
    expect(computeCouponDiscount(expired, 10000).error).toBeTruthy();
  });

  it("rejects a coupon that has hit its usage limit", () => {
    const exhausted = { ...baseCoupon, usedCount: 100, maxUsage: 100 };
    expect(computeCouponDiscount(exhausted, 10000).error).toBeTruthy();
  });

  it("rejects a coupon scoped to other courses", () => {
    const scoped = { ...baseCoupon, applicableCourseIds: ["course-a"] };
    expect(computeCouponDiscount(scoped, 10000, "course-b").error).toBeTruthy();
    expect(computeCouponDiscount(scoped, 10000, "course-a")).toEqual({ discount: 1000 });
  });
});

describe("computeRefundableAmount", () => {
  it("returns the full amount when there are no existing refunds", () => {
    expect(computeRefundableAmount({ amount: 5000 }, [])).toBe(5000);
  });

  it("deducts non-rejected refunds", () => {
    const refunds = [
      { amount: 1000, status: "PROCESSED" as const },
      { amount: 500, status: "REQUESTED" as const },
      { amount: 2000, status: "REJECTED" as const },
    ];
    expect(computeRefundableAmount({ amount: 5000 }, refunds)).toBe(3500);
  });
});

describe("nextSequenceFormat", () => {
  it("formats a prefix/year/zero-padded sequence", () => {
    expect(nextSequenceFormat("INV", 123, 2026)).toBe("INV-2026-000123");
  });
});

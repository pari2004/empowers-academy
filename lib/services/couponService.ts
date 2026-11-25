import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { computeCouponDiscount } from "@/lib/finance/calculations";
import type { CouponInput, CouponUpdateInput } from "@/lib/validation/coupon";

export type ListCouponsParams = {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
  search?: string;
};

export async function listCoupons(params: ListCouponsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = {
    deletedAt: null,
    ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    ...(params.search ? { code: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.coupon.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.coupon.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export function getCouponById(id: string) {
  return prisma.coupon.findFirst({ where: { id, deletedAt: null } });
}

export function getCouponByCode(code: string) {
  return prisma.coupon.findFirst({ where: { code: code.toUpperCase(), deletedAt: null } });
}

export async function createCoupon(input: CouponInput, actorId?: string | null) {
  const coupon = await prisma.coupon.create({
    data: {
      code: input.code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      maxUsage: input.maxUsage,
      expiryDate: input.expiryDate,
      isActive: input.isActive,
      applicableCourseIds: input.applicableCourseIds,
      createdById: actorId ?? null,
      updatedById: actorId ?? null,
    },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "coupon", entityId: coupon.id });
  return coupon;
}

export async function updateCoupon(id: string, input: CouponUpdateInput, actorId?: string | null) {
  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(input.discountType !== undefined && { discountType: input.discountType }),
      ...(input.discountValue !== undefined && { discountValue: input.discountValue }),
      ...(input.maxUsage !== undefined && { maxUsage: input.maxUsage }),
      ...(input.expiryDate !== undefined && { expiryDate: input.expiryDate }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.applicableCourseIds !== undefined && { applicableCourseIds: input.applicableCourseIds }),
      updatedById: actorId ?? null,
    },
  });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "coupon", entityId: id });
  return coupon;
}

export async function deleteCoupon(id: string, actorId?: string | null) {
  await prisma.coupon.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId ?? null } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "coupon", entityId: id });
}

export async function validateCoupon(code: string, params: { amount: number; courseId?: string | null }) {
  const coupon = await getCouponByCode(code);
  if (!coupon) return { error: "Coupon not found" as const };

  return computeCouponDiscount(
    {
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      isActive: coupon.isActive,
      expiryDate: coupon.expiryDate,
      usedCount: coupon.usedCount,
      maxUsage: coupon.maxUsage,
      applicableCourseIds: coupon.applicableCourseIds,
    },
    params.amount,
    params.courseId
  );
}

export async function incrementCouponUsage(id: string) {
  await prisma.coupon.update({ where: { id }, data: { usedCount: { increment: 1 } } });
}

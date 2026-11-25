export type PaymentMethod = "RAZORPAY" | "STRIPE" | "UPI" | "BANK_TRANSFER" | "CASH" | "CHEQUE";
export type ManualPaymentMethod = "CASH" | "CHEQUE" | "BANK_TRANSFER" | "UPI";
export type PaymentType = "REGISTRATION_FEE" | "ADMISSION_FEE" | "COURSE_FEE" | "INSTALLMENT" | "OTHER";
export type PaymentTxnStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
export type FeeStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "REFUNDED";
export type InstallmentStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
export type RefundType = "FULL" | "PARTIAL";
export type RefundStatus = "REQUESTED" | "APPROVED" | "PROCESSED" | "REJECTED";
export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export type StudentRef = { id: string; name: string; email: string | null; phone: string | null };

export type Payment = {
  id: string;
  studentId: string;
  student: StudentRef;
  courseId: string;
  type: PaymentType;
  method: PaymentMethod;
  amount: string;
  discountAmount: string;
  scholarshipAmount: string;
  status: PaymentTxnStatus;
  receiptNumber: string | null;
  notes: string | null;
  createdAt: string;
};

export type Installment = {
  id: string;
  studentId: string;
  student: StudentRef;
  installmentNumber: number;
  dueDate: string;
  amount: string;
  status: InstallmentStatus;
  paidAt: string | null;
  notes: string | null;
  remindersSentCount: number;
  lastReminderAt: string | null;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  studentId: string;
  student: StudentRef;
  amount: string;
  gstAmount: string;
  totalAmount: string;
  status: "GENERATED" | "EMAILED" | "CANCELLED";
  emailedAt: string | null;
  createdAt: string;
};

export type Receipt = {
  id: string;
  receiptNumber: string;
  studentId: string;
  student: StudentRef;
  amount: string;
  method: PaymentMethod;
  emailedAt: string | null;
  createdAt: string;
};

export type Refund = {
  id: string;
  paymentId: string;
  studentId: string;
  student: StudentRef;
  amount: string;
  type: RefundType;
  reason: string;
  status: RefundStatus;
  createdAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: string;
  maxUsage: number;
  usedCount: number;
  expiryDate: string | null;
  isActive: boolean;
};

export type StudentFeeProfile = {
  studentId: string;
  totalCourseFee: string;
  registrationFee: string;
  discountAmount: string;
  scholarshipAmount: string;
  amountPaid: string;
  pendingAmount: string;
  installmentCount: number;
  nextDueDate: string | null;
  paymentStatus: FeeStatus;
};

export const MANUAL_PAYMENT_METHODS: Array<{ value: ManualPaymentMethod; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
];

export const PAYMENT_TYPES: Array<{ value: PaymentType; label: string }> = [
  { value: "REGISTRATION_FEE", label: "Registration Fee" },
  { value: "ADMISSION_FEE", label: "Admission Fee" },
  { value: "COURSE_FEE", label: "Course Fee" },
  { value: "INSTALLMENT", label: "Installment" },
  { value: "OTHER", label: "Other" },
];

export const FEE_STATUSES: Array<{ value: FeeStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "REFUNDED", label: "Refunded" },
];

export const INSTALLMENT_STATUSES: Array<{ value: InstallmentStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

function labelFrom<T extends string>(options: Array<{ value: T; label: string }>, value: T): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export const paymentTypeLabel = (v: PaymentType) => labelFrom(PAYMENT_TYPES, v);
export const feeStatusLabel = (v: FeeStatus) => labelFrom(FEE_STATUSES, v);
export const installmentStatusLabel = (v: InstallmentStatus) => labelFrom(INSTALLMENT_STATUSES, v);

export function formatCurrency(value: string | number): string {
  return `Rs. ${Number(value).toFixed(2)}`;
}

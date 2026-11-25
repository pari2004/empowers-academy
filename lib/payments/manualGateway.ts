import type { PaymentGateway, RefundResult } from "@/lib/payments/types";

// Manual methods (Cash/Cheque/Bank Transfer/UPI-manual-entry) have no external
// API call — the trust boundary is RBAC (`payments.create`/`refunds.update`),
// not a cryptographic signature.
export const manualGateway: PaymentGateway = {
  name: "MANUAL",
  async createOrder() {
    throw new Error("Manual payment methods do not use gateway order creation");
  },
  verifyPayment() {
    return true;
  },
  verifyWebhookSignature() {
    return true;
  },
  async refund(): Promise<RefundResult> {
    return { refundId: "manual", status: "processed" };
  },
};

export interface CreateOrderInput {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface RefundInput {
  gatewayPaymentId: string;
  amount: number;
  notes?: Record<string, string>;
}

export interface RefundResult {
  refundId: string;
  status: string;
}

export interface PaymentGateway {
  name: "RAZORPAY" | "STRIPE" | "MANUAL";
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  verifyPayment(input: VerifyPaymentInput): boolean;
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
  refund(input: RefundInput): Promise<RefundResult>;
}

import crypto from "crypto";
import Razorpay from "razorpay";
import type { CreateOrderInput, CreateOrderResult, PaymentGateway, RefundInput, RefundResult, VerifyPaymentInput } from "@/lib/payments/types";

function getClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const client = getClient();
  const order = await client.orders.create({
    amount: Math.round(input.amount * 100),
    currency: input.currency ?? "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
  return {
    orderId: order.id,
    amount: input.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
}

// Per Razorpay's checkout verification spec: HMAC-SHA256 of `${orderId}|${paymentId}` signed
// with the key secret must match the signature returned by checkout.js.
function verifyPayment(input: VerifyPaymentInput): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, input.signature);
}

function verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signatureHeader);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function refund(input: RefundInput): Promise<RefundResult> {
  const client = getClient();
  const result = await client.payments.refund(input.gatewayPaymentId, {
    amount: Math.round(input.amount * 100),
    notes: input.notes,
  });
  return { refundId: result.id, status: result.status };
}

export const razorpayGateway: PaymentGateway = {
  name: "RAZORPAY",
  createOrder,
  verifyPayment,
  verifyWebhookSignature,
  refund,
};

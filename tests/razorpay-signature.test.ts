import crypto from "crypto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { razorpayGateway } from "@/lib/payments/razorpayGateway";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.RAZORPAY_KEY_SECRET = "test_key_secret";
  process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("razorpayGateway.verifyPayment", () => {
  it("accepts a correctly signed payment", () => {
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(razorpayGateway.verifyPayment({ orderId, paymentId, signature })).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    const tampered = validSignature.slice(0, -1) + (validSignature.at(-1) === "a" ? "b" : "a");

    expect(razorpayGateway.verifyPayment({ orderId, paymentId, signature: tampered })).toBe(false);
  });

  it("rejects a signature for a different payment id", () => {
    const orderId = "order_abc123";
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|pay_original`)
      .digest("hex");

    expect(razorpayGateway.verifyPayment({ orderId, paymentId: "pay_swapped", signature })).toBe(false);
  });

  it("rejects when the key secret is not configured", () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    expect(razorpayGateway.verifyPayment({ orderId: "o", paymentId: "p", signature: "sig" })).toBe(false);
  });
});

describe("razorpayGateway.verifyWebhookSignature", () => {
  it("accepts a correctly signed webhook payload", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(rawBody).digest("hex");

    expect(razorpayGateway.verifyWebhookSignature(rawBody, signature)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(rawBody).digest("hex");
    const tamperedBody = JSON.stringify({ event: "payment.captured", amount: 999999 });

    expect(razorpayGateway.verifyWebhookSignature(tamperedBody, signature)).toBe(false);
  });

  it("rejects when the webhook secret is not configured", () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    expect(razorpayGateway.verifyWebhookSignature("{}", "sig")).toBe(false);
  });
});

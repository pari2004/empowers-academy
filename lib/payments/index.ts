import type { PaymentGateway } from "@/lib/payments/types";
import { razorpayGateway } from "@/lib/payments/razorpayGateway";
import { manualGateway } from "@/lib/payments/manualGateway";
import { stripeGateway } from "@/lib/payments/stripeGateway";

const MANUAL_METHODS = new Set(["CASH", "CHEQUE", "BANK_TRANSFER", "UPI"]);

export function getGateway(method: string): PaymentGateway {
  if (method === "RAZORPAY") return razorpayGateway;
  if (method === "STRIPE") return stripeGateway;
  if (MANUAL_METHODS.has(method)) return manualGateway;
  throw new Error(`Unsupported payment method: ${method}`);
}

export type { PaymentGateway } from "@/lib/payments/types";

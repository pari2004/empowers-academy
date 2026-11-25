import type { PaymentGateway } from "@/lib/payments/types";

// Architecture-ready stub only — Stripe is not wired into any UI path this phase.
// The interface exists so a future phase can implement this without touching callers.
function notImplemented(): never {
  throw new Error("Stripe integration is not implemented yet — architecture reserved for a future phase");
}

export const stripeGateway: PaymentGateway = {
  name: "STRIPE",
  createOrder: async () => notImplemented(),
  verifyPayment: () => notImplemented(),
  verifyWebhookSignature: () => notImplemented(),
  refund: async () => notImplemented(),
};

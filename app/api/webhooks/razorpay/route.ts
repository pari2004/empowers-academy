import { NextResponse } from "next/server";
import { handleRazorpayWebhook } from "@/lib/services/paymentService";

// Deliberately OUTSIDE /api/admin — middleware.ts's matcher would 401 an
// unauthenticated Razorpay webhook call. Auth here is HMAC signature
// verification over the raw body, not a session.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  try {
    const result = await handleRazorpayWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Razorpay webhook error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}

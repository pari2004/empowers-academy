"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/admin/ToastProvider";
import StudentCombobox from "./StudentCombobox";
import { MANUAL_PAYMENT_METHODS, PAYMENT_TYPES, type ManualPaymentMethod, type PaymentType } from "./types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export default function PaymentForm({ initialStudentId }: { initialStudentId?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [studentId, setStudentId] = useState<string | null>(initialStudentId ?? null);
  const [type, setType] = useState<PaymentType>("COURSE_FEE");
  const [method, setMethod] = useState<ManualPaymentMethod | "RAZORPAY">("CASH");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function applyCoupon() {
    setCouponError(null);
    setCouponDiscount(null);
    if (!couponCode || !amount) return;
    const res = await fetch("/api/admin/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, amount: Number(amount) }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setCouponError(body.error ?? "Invalid coupon");
      return;
    }
    setCouponDiscount(body.discount ?? 0);
  }

  async function submitManual() {
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        type,
        amount: Number(amount),
        method,
        couponCode: couponCode || undefined,
        notes: notes || undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? "Failed to record payment");
    showToast("Payment recorded", "success");
    router.push(`/admin/finance/payments/${body.id}`);
  }

  async function submitRazorpay() {
    const orderRes = await fetch("/api/admin/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, amount: Number(amount), type }),
    });
    const order = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok) throw new Error(order.error ?? "Failed to create Razorpay order");

    if (order.testMode) {
      const verifyRes = await fetch("/api/admin/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: order.paymentId,
          razorpayOrderId: order.orderId,
          razorpayPaymentId: `pay_test_${String(order.paymentId).slice(0, 8)}`,
          razorpaySignature: "test-mode",
        }),
      });
      if (!verifyRes.ok) throw new Error("Test-mode payment confirmation failed");
      showToast("Test-mode Razorpay payment recorded", "success");
      router.push(`/admin/finance/payments/${order.paymentId}`);
      return;
    }

    await loadRazorpayScript();
    if (!window.Razorpay) throw new Error("Razorpay checkout unavailable");

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: Math.round(order.amount * 100),
      currency: order.currency,
      order_id: order.orderId,
      name: "Empowers Academy",
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch("/api/admin/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: order.paymentId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });
        if (!verifyRes.ok) {
          showToast("Payment verification failed", "error");
          return;
        }
        showToast("Payment successful", "success");
        router.push(`/admin/finance/payments/${order.paymentId}`);
      },
    });
    rzp.open();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) {
      showToast("Please select a student", "error");
      return;
    }
    setSubmitting(true);
    try {
      if (method === "RAZORPAY") await submitRazorpay();
      else await submitManual();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Student</Label>
          <StudentCombobox value={studentId} onChange={setStudentId} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Payment Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as PaymentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Payment Method</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as ManualPaymentMethod | "RAZORPAY")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MANUAL_PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
              <SelectItem value="RAZORPAY">Razorpay (Online)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="couponCode">Coupon Code</Label>
          <div className="flex gap-2">
            <Input id="couponCode" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          {couponDiscount !== null && <p className="text-xs text-emerald-600">Discount applied: ₹{couponDiscount.toFixed(2)}</p>}
          {couponError && <p className="text-xs text-destructive">{couponError}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Processing…" : method === "RAZORPAY" ? "Pay with Razorpay" : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isIndianMobile } from "@/lib/validation/phone";
import { Icon } from "./Icons";
import FormField from "./FormField";

const emailError = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Enter a valid email address.";
const phoneError = (phone: string) =>
  isIndianMobile(phone) ? undefined : "Enter a valid 10-digit Indian mobile number.";

export default function MasterclassRegisterForm({ slug, title, formUrl }: { slug: string; title: string; formUrl?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = {
      name: name.trim() ? undefined : "Please enter your full name.",
      email: emailError(email),
      phone: phoneError(phone),
    };
    const cleaned = Object.fromEntries(Object.entries(nextErrors).filter(([, v]) => v)) as typeof errors;
    setErrors(cleaned);
    if (Object.keys(cleaned).length) return;

    setSubmitting(true);
    try {
      await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          courseInterested: title,
          message: `Masterclass signup: ${title}`,
          enquiryType: "MASTERCLASS_SIGNUP",
        }),
      });
    } catch {
      // Best-effort — still proceed.
    }
    
    // Redirect to Google Form or thank you page after capturing lead in CRM
    const targetUrl = formUrl || "https://forms.gle/ZfVhN8BsuQXkccNH6";
    if (targetUrl.startsWith("http")) {
      window.location.href = `${targetUrl}?entry.name=${encodeURIComponent(name)}&entry.email=${encodeURIComponent(email)}&entry.phone=${encodeURIComponent(phone)}`;
    } else {
      router.push(`/masterclasses/${slug}/thank-you`);
    }
  }

  return (
    <form className="modal-form" onSubmit={submit} noValidate>
      <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(255, 193, 7, 0.08)", border: "1px solid rgba(255, 193, 7, 0.2)", fontSize: "0.85rem", color: "var(--text-primary)" }}>
        <span style={{ fontWeight: 700, color: "#f59e0b" }}>🔥 High Demand: </span>
        Free access includes live Q&amp;A session &amp; downloadable resources.
      </div>
      <FormField
        label="Full Name"
        value={name}
        onChange={setName}
        placeholder="Your full name"
        error={errors.name}
        name="name"
        autoComplete="name"
        required
      />
      <FormField
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={setPhone}
        placeholder="9876543210"
        error={errors.phone}
        name="phoneNumber"
        autoComplete="tel"
        inputMode="tel"
        required
      />
      <FormField
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@company.com"
        error={errors.email}
        name="emailAddress"
        autoComplete="email"
        inputMode="email"
        required
      />
      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", marginTop: 8, padding: "14px 20px", fontSize: "1rem", fontWeight: 700 }}>
        {submitting ? "Reserving Your Spot…" : <><Icon name="pulse" size={18} /> Claim Free Seat Now</>}
      </button>
      <p style={{ fontSize: "0.75rem", textAlign: "center", color: "var(--text-secondary)", marginTop: 12, marginBottom: 0 }}>
        🔒 100% Free · No credit card required · Instant access
      </p>
    </form>
  );
}

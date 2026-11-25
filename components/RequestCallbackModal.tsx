"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm, ValidationError } from "@formspree/react";
import { on } from "@/lib/events";
import { isIndianMobile } from "@/lib/validation/phone";
import { Icon } from "./Icons";
import FormField from "./FormField";
import SegmentedControl from "./SegmentedControl";

type CompanyType = "service" | "product" | "";
type Mode = "callback" | "brochure";

type FormState = {
  name: string;
  phone: string;
  email: string;
  company: string;
  designation: string;
  companyType: CompanyType;
  goal: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

// Company Type ships pre-selected — most leads are service-side, and a
// pre-filled required field is one fewer blank box for the user to face.
// Goal is left blank on purpose: picking it is the one active decision that
// gives the user a small stake in the form before the admin fields (IKEA
// effect) — defaulting it away would remove that.
const initialForm: FormState = {
  name: "",
  phone: "",
  email: "",
  company: "",
  designation: "",
  companyType: "service",
  goal: "",
};

const emailError = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Enter a valid email address.";
// isIndianMobile handles the +91 country code and enforces a real mobile prefix
// (6–9), so filler like "1234567890" no longer slips through into the CRM.
const phoneError = (phone: string) =>
  isIndianMobile(phone) ? undefined : "Enter a valid 10-digit Indian mobile number.";

const requiredFieldChecks = (f: FormState) => [
  f.name.trim().length > 0,
  !phoneError(f.phone),
  !emailError(f.email),
  f.company.trim().length > 0,
  !!f.companyType,
  !!f.goal,
];

const companyTypeOptions = [
  { label: "Service-Based Company", value: "service" },
  { label: "Product-Based Company", value: "product" },
];

const goalOptions = [
  { label: "Switch into an AI career", value: "switch-career" },
  { label: "Grow in my current role", value: "grow-role" },
  { label: "Land a higher-paying offer", value: "higher-offer" },
  { label: "Not sure yet", value: "not-sure" },
];

const mediaPoints = [
  { icon: "shield", text: "180-Day Better-Offer Guarantee, in writing" },
  { icon: "users", text: "5,000+ professionals trained" },
  { icon: "pulse", text: "350+ hiring partner companies" },
];

// Same form, same fields, same psychology — only the copy changes to match
// why the user opened it (an advisor call vs. an instant PDF).
const modeCopy: Record<
  Mode,
  {
    icon: string;
    title: string;
    subtitle: string;
    heroLead: string;
    heroHighlight: string;
    heroSub: string;
    reassurance: string;
    submitLabel: string;
    successTitle: string;
    successNote: string;
  }
> = {
  callback: {
    icon: "phone",
    title: "Request a Callback",
    subtitle: "Share your details and one of our advisors will call you back shortly.",
    heroLead: "Let's talk about your",
    heroHighlight: "AI career",
    heroSub:
      "Tell us a bit about yourself and one of our advisors will call you back to map out the right program, no obligation.",
    reassurance: "Takes about 2 minutes · Free 1:1 roadmap call · Cohorts cap at 8–10 learners",
    submitLabel: "Request Callback",
    successTitle: "Thank you! Our team will contact you shortly.",
    successNote: "While you wait, grab the full curriculum, mentor, and format breakdown.",
  },
  brochure: {
    icon: "download",
    title: "Download the Brochure",
    subtitle: "Share your details and we'll get the full brochure straight to you.",
    heroLead: "Get the full picture on your",
    heroHighlight: "AI career",
    heroSub:
      "Complete curriculum, mentor bios, and program format, delivered instantly, no obligation.",
    reassurance: "Takes about 2 minutes · Instant PDF download · No obligation",
    submitLabel: "Get the Brochure",
    successTitle: "You're all set! Your brochure is downloading now.",
    successNote: "Didn't start automatically? Use the button below, or talk to an advisor live.",
  },
};

// Frontend option values (kept short for Formspree/UI) map to the CRM's
// backend enum values — see lib/validation/contact.ts for the enum shape.
const companyTypeToBackend: Record<Exclude<CompanyType, "">, string> = {
  service: "SERVICE_BASED",
  product: "PRODUCT_BASED",
};

const goalToBackend: Record<string, string> = {
  "switch-career": "SWITCH_CAREER",
  "grow-role": "GROW_ROLE",
  "higher-offer": "HIGHER_OFFER",
  "not-sure": "NOT_SURE",
};

export default function RequestCallbackModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("callback");
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [fsState, fsSubmit, fsReset] = useForm("xlgqelrr");
  const downloadRef = useRef<HTMLAnchorElement>(null);

  // Brochure mode should start the PDF download the instant Formspree
  // confirms the lead was recorded, not on the click that opened the modal.
  useEffect(() => {
    if (fsState.succeeded && mode === "brochure") downloadRef.current?.click();
  }, [fsState.succeeded, mode]);

  useEffect(
    () =>
      on("open-lead", () => {
        setMode("callback");
        setOpen(true);
      }),
    []
  );
  useEffect(
    () =>
      on("open-brochure", () => {
        setMode("brochure");
        setOpen(true);
      }),
    []
  );

  // Lock scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    // reset a moment after the exit so the confirmation isn't seen mid-close
    setTimeout(() => {
      fsReset();
      setForm(initialForm);
      setErrors({});
    }, 300);
  };

  const update = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Once a field's error is showing, clear it live as soon as it's fixed
    // instead of making the user blur away and back to see it go.
    if (key === "email" && errors.email) setErrors((er) => ({ ...er, email: emailError(value) }));
    if (key === "phone" && errors.phone) setErrors((er) => ({ ...er, phone: phoneError(value) }));
  };

  const onEmailBlur = () => setErrors((er) => ({ ...er, email: emailError(form.email) }));
  const onPhoneBlur = () => setErrors((er) => ({ ...er, phone: phoneError(form.phone) }));

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Please enter your full name.";
    e.email = emailError(form.email);
    e.phone = phoneError(form.phone);
    if (!form.company.trim()) e.company = "Please enter your company name.";
    if (!form.goal) e.goal = "Please pick what you're looking for.";
    const cleaned = Object.fromEntries(
      Object.entries(e).filter(([, v]) => v !== undefined)
    ) as Errors;
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const companyTypeLabel =
      companyTypeOptions.find((o) => o.value === form.companyType)?.label ?? form.companyType;
    const goalLabel = goalOptions.find((o) => o.value === form.goal)?.label ?? form.goal;
    fsSubmit({
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      designation: form.designation,
      companyType: companyTypeLabel,
      goal: goalLabel,
      requestType: mode === "brochure" ? "Brochure Download" : "Callback Request",
      _subject: `New ${mode === "brochure" ? "brochure request" : "callback request"} — ${form.name}`,
    });

    // Also persist to the CMS so counselors can manage this lead from the
    // admin panel — best-effort, never blocks or affects the Formspree flow above.
    fetch("/api/public/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        companyName: form.company,
        designation: form.designation,
        companyType: companyTypeToBackend[form.companyType as Exclude<CompanyType, "">],
        lookingFor: goalToBackend[form.goal],
        enquiryType: mode === "brochure" ? "BROCHURE_DOWNLOAD" : "CALLBACK",
      }),
    }).catch(() => { });
  };

  if (!open) return null;

  const copy = modeCopy[mode];
  const checks = requiredFieldChecks(form);
  const progress = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const titleId = "lead-modal-title";

  return (
    <div className="modal-overlay modal-overlay-full callback-overlay" onMouseDown={close}>
      <div
        className="modal modal-split modal-fullscreen glass-panel callback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-media" aria-hidden="true">
          <span className="modal-media-blob b1" />
          <span className="modal-media-blob b2" />

          <div className="modal-media-top">
            <Image src="/logo.png" alt="" width={180} height={48} className="modal-media-logo" />
          </div>

          <div className="modal-media-body">
            <span className="modal-media-eyebrow">180 Day Better Offer Guarantee</span>
            <h2 className="modal-media-headline">
              {copy.heroLead} <span className="shine">{copy.heroHighlight}</span>.
            </h2>
            <p className="modal-media-sub">{copy.heroSub}</p>
            <ul className="modal-media-points">
              {mediaPoints.map((p) => (
                <li className="modal-media-point" key={p.text}>
                  <span className="pt-ic"><Icon name={p.icon} size={18} /></span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="modal-media-foot">
            <div className="proof-stars">
              {"★★★★★"}
              <strong>4.9/5</strong>
            </div>
            <span>Trusted by learners across 350+ hiring partners</span>
          </div>
        </div>

        <div className="modal-panel">
          <button className="modal-close" onClick={close} aria-label="Close">
            <Icon name="close" size={20} />
          </button>

          {!fsState.succeeded ? (
            <div className="modal-body">
              <div className="modal-header">
                <div className="modal-badge"><Icon name={copy.icon} size={22} /></div>
                <h3 id={titleId}>{copy.title}</h3>
                <p className="modal-sub">{copy.subtitle}</p>
                {/* Compact stand-in for the desktop hero panel's trust signals — phones only. */}
                <div className="modal-trust-mobile" aria-hidden="true">
                  <span className="trust-line">
                    <span className="trust-stars">★★★★★</span> 4.9 · 5,000+ learners
                  </span>
                </div>
                {/* Never starts at 0% — Company Type ships pre-filled, so the
                    first field is already "done" the moment the form opens. */}
                <div className="modal-progress-row">
                  <div className="modal-progress">
                    <div className="modal-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="modal-progress-label">{progress}% ready</span>
                </div>
              </div>
              <div className="modal-scroll">
                <form className="modal-form" onSubmit={submit} noValidate>
                  <SegmentedControl
                    label="Current Company Type"
                    options={companyTypeOptions}
                    value={form.companyType}
                    onChange={(v) => setForm((f) => ({ ...f, companyType: v as CompanyType }))}
                    className="segmented-row"
                    required
                  />
                  <SegmentedControl
                    label="What are you looking for?"
                    options={goalOptions}
                    value={form.goal}
                    onChange={update("goal")}
                    error={errors.goal}
                    required
                  />
                  <div className="field-row">
                    <FormField
                      label="Full Name"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Your full name"
                      error={errors.name}
                      name="name"
                      autoComplete="name"
                      required
                    />
                    <FormField
                      label="Phone Number"
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      onBlur={onPhoneBlur}
                      placeholder="9876543210"
                      error={errors.phone}
                      name="phoneNumber"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                    />
                  </div>
                  <div className="field-row">
                    <FormField
                      label="Email Address"
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      onBlur={onEmailBlur}
                      placeholder="you@company.com"
                      error={errors.email}
                      name="emailAddress"
                      autoComplete="email"
                      inputMode="email"
                      required
                    />
                    <FormField
                      label="Company Name"
                      value={form.company}
                      onChange={update("company")}
                      placeholder="Your company"
                      error={errors.company}
                      name="organization"
                      autoComplete="organization"
                      required
                    />
                  </div>
                  <FormField
                    label="Designation"
                    value={form.designation}
                    onChange={update("designation")}
                    placeholder="Your role (optional)"
                    name="organization-title"
                    autoComplete="organization-title"
                  />
                  <p className="modal-reassurance">{copy.reassurance}</p>
                  <ValidationError errors={fsState.errors} className="field-err" />
                  <div className="modal-actions">
                    <button type="button" className="btn btn-glass" onClick={close}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={fsState.submitting}>
                      {fsState.submitting ? "Submitting…" : copy.submitLabel}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="modal-scroll">
              <div className="modal-success">
                <div className="success-ring"><Icon name="check" size={34} /></div>
                <h3>{copy.successTitle}</h3>
                <p className="modal-sub">{copy.successNote}</p>
                <div className="modal-actions">
                  <button className="btn btn-glass" onClick={close}>
                    Close
                  </button>
                  <a
                    className="btn btn-primary"
                    href="/empowers-academy-brochure.pdf"
                    download="Empowers-Academy-Brochure.pdf"
                    onClick={close}
                  >
                    Download the Brochure
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Hidden trigger so submitting in brochure mode starts the download
          immediately, in the same click that opened it — no second click. */}
      <a
        ref={downloadRef}
        href="/empowers-academy-brochure.pdf"
        download="Empowers-Academy-Brochure.pdf"
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { on, emit } from "@/lib/events";
import { isIndianMobile } from "@/lib/validation/phone";
import { Icon } from "./Icons";
import FormField from "./FormField";
import SegmentedControl from "./SegmentedControl";

type Background = "software" | "nontech" | "student" | "switcher" | "";
type Interest = "ai" | "cloud" | "security" | "webdev" | "business" | "unsure" | "";
type Commitment = "under5" | "5to10" | "10to15" | "15plus" | "";

type QuizState = {
  background: Background;
  interest: Interest;
  commitment: Commitment;
  name: string;
  phone: string;
  email: string;
};

const initialState: QuizState = { background: "", interest: "", commitment: "", name: "", phone: "", email: "" };

const backgroundOptions = [
  { label: "Software / Tech Professional", value: "software" },
  { label: "Non-Tech Professional", value: "nontech" },
  { label: "Recent Graduate / Student", value: "student" },
  { label: "Career Switcher (Any Field)", value: "switcher" },
];

const interestOptions = [
  { label: "AI, ML & Generative AI", value: "ai" },
  { label: "Cloud Computing & DevOps", value: "cloud" },
  { label: "Cybersecurity", value: "security" },
  { label: "Full-Stack Web Development", value: "webdev" },
  { label: "Business Analysis & AI", value: "business" },
  { label: "Not sure yet", value: "unsure" },
];

const commitmentOptions = [
  { label: "Under 5 hrs/week", value: "under5" },
  { label: "5-10 hrs/week", value: "5to10" },
  { label: "10-15 hrs/week", value: "10to15" },
  { label: "15+ hrs/week", value: "15plus" },
];

// Deterministic, rule-based recommendation — no AI/ML involved. Direct
// interest picks map 1:1; "not sure" falls back on background so the result
// still feels tailored instead of defaulting to the same track for everyone.
const trackByInterest: Record<Exclude<Interest, "" | "unsure">, string> = {
  ai: "AI, ML & Generative AI",
  cloud: "Cloud Computing & DevOps",
  security: "Cybersecurity",
  webdev: "Full-Stack Web Development",
  business: "Business Analysis & AI",
};

function recommendTrack(background: Background, interest: Interest): string {
  if (interest && interest !== "unsure") return trackByInterest[interest];
  if (background === "student") return "Full-Stack Web Development";
  return "AI, ML & Generative AI";
}

const commitmentLabel: Record<Exclude<Commitment, "">, string> = {
  under5: "Under 5 hrs/week",
  "5to10": "5-10 hrs/week",
  "10to15": "10-15 hrs/week",
  "15plus": "15+ hrs/week",
};
const backgroundLabel: Record<Exclude<Background, "">, string> = {
  software: "Software / Tech Professional",
  nontech: "Non-Tech Professional",
  student: "Recent Graduate / Student",
  switcher: "Career Switcher (Any Field)",
};

const TOTAL_STEPS = 4;

const emailError = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Enter a valid email address.";
const phoneError = (phone: string) =>
  isIndianMobile(phone) ? undefined : "Enter a valid 10-digit Indian mobile number.";

export default function EligibilityQuiz() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<QuizState>(initialState);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => on("open-quiz", () => setOpen(true)), []);

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
    setTimeout(() => {
      setStep(0);
      setState(initialState);
      setErrors({});
      setSubmitting(false);
      setSubmitted(false);
    }, 300);
  };

  if (!open) return null;

  const track = recommendTrack(state.background, state.interest);

  const canAdvance =
    (step === 0 && !!state.background) ||
    (step === 1 && !!state.interest) ||
    (step === 2 && !!state.commitment);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = {
      name: state.name.trim() ? undefined : "Please enter your full name.",
      email: emailError(state.email),
      phone: phoneError(state.phone),
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
          name: state.name,
          email: state.email,
          phone: state.phone,
          courseInterested: track,
          message: `Course-fit quiz result: ${track}. Background: ${backgroundLabel[state.background as Exclude<Background, "">]}. Weekly time: ${commitmentLabel[state.commitment as Exclude<Commitment, "">]}.`,
          enquiryType: "QUIZ_RESULT",
        }),
      });
    } catch {
      // Best-effort — the result still displays even if the save failed.
    }
    setSubmitting(false);
    setSubmitted(true);
  }

  const titleId = "quiz-modal-title";

  return (
    <div className="modal-overlay modal-overlay-full" onMouseDown={close}>
      <div
        className="modal modal-fullscreen quiz-modal glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={close} aria-label="Close">
          <Icon name="close" size={20} />
        </button>

        {!submitted ? (
          <div className="modal-body">
            <div className="modal-header">
              <div className="modal-badge"><Icon name="spark" size={22} /></div>
              <h3 id={titleId}>Which Program Fits You?</h3>
              <p className="modal-sub">Answer 3 quick questions to get a personalized track recommendation.</p>
              <div className="modal-progress-row">
                <div className="modal-progress">
                  <div className="modal-progress-fill" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
                </div>
                <span className="modal-progress-label">Step {step + 1} of {TOTAL_STEPS}</span>
              </div>
            </div>

            <div className="modal-scroll">
              {step === 0 && (
                <SegmentedControl
                  label="Which best describes you?"
                  options={backgroundOptions}
                  value={state.background}
                  onChange={(v) => setState((s) => ({ ...s, background: v as Background }))}
                  required
                />
              )}
              {step === 1 && (
                <SegmentedControl
                  label="What are you most interested in?"
                  options={interestOptions}
                  value={state.interest}
                  onChange={(v) => setState((s) => ({ ...s, interest: v as Interest }))}
                  required
                />
              )}
              {step === 2 && (
                <SegmentedControl
                  label="How much time can you commit weekly?"
                  options={commitmentOptions}
                  value={state.commitment}
                  onChange={(v) => setState((s) => ({ ...s, commitment: v as Commitment }))}
                  required
                />
              )}
              {step === 3 && (
                <form className="modal-form" onSubmit={submit} noValidate>
                  <p className="quiz-result-preview">
                    Your recommended track: <strong>{track}</strong>. Share your details to get the full breakdown.
                  </p>
                  <FormField
                    label="Full Name"
                    value={state.name}
                    onChange={(v) => setState((s) => ({ ...s, name: v }))}
                    placeholder="Your full name"
                    error={errors.name}
                    name="name"
                    autoComplete="name"
                    required
                  />
                  <div className="field-row">
                    <FormField
                      label="Phone Number"
                      type="tel"
                      value={state.phone}
                      onChange={(v) => setState((s) => ({ ...s, phone: v }))}
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
                      value={state.email}
                      onChange={(v) => setState((s) => ({ ...s, email: v }))}
                      placeholder="you@company.com"
                      error={errors.email}
                      name="emailAddress"
                      autoComplete="email"
                      inputMode="email"
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-glass" onClick={() => setStep(2)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? "Getting your result…" : "See My Recommendation"}
                    </button>
                  </div>
                </form>
              )}

              {step < 3 && (
                <div className="modal-actions">
                  {step > 0 && (
                    <button type="button" className="btn btn-glass" onClick={() => setStep((s) => s - 1)}>
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!canAdvance}
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="modal-scroll">
            <div className="modal-success">
              <div className="success-ring"><Icon name="check" size={34} /></div>
              <h3>Your recommended track: {track}</h3>
              <p className="modal-sub">
                An advisor will follow up to walk you through the exact program, fees, and next cohort.
              </p>
              <div className="modal-actions">
                <button className="btn btn-glass" onClick={close}>
                  Close
                </button>
                <Link className="btn btn-primary" href="/#programs" onClick={close}>
                  Browse Programs
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    close();
                    emit("open-lead");
                  }}
                >
                  Talk to an Advisor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

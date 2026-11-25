"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { on } from "@/lib/events";
import { auth } from "@/lib/content";
import { Icon } from "./Icons";

type Mode = "login" | "signup";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
  remember: boolean;
};

type Errors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  name: "",
  email: "",
  password: "",
  confirm: "",
  remember: false,
};

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [showPw, setShowPw] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => on("open-auth", () => setOpen(true)), []);

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
      setSent(false);
      setForm(initialForm);
      setErrors({});
      setMode("login");
      setShowPw(false);
    }, 300);
  };

  const update = (key: keyof FormState) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const e: Errors = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (mode === "signup" && form.confirm !== form.password) e.confirm = "Passwords don't match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) setSent(true); // front-end only — no backend wired in this build
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setErrors({});
  };

  if (!open) return null;

  return (
    <div className="modal-overlay modal-overlay-full" onMouseDown={close}>
      <div
        className="modal modal-fullscreen auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal-close auth-close" onClick={close} aria-label="Close">
          <Icon name="close" size={20} />
        </button>

        <div className="auth-left">
          <div className="auth-brand-row">
            <Image src="/logo.png" alt="Empowers Academy" width={180} height={48} className="auth-logo" />
            <span className="auth-brand-divider" aria-hidden="true" />
            <div className="auth-powered">
              <span className="auth-powered-label">Powered by</span>
              <strong className="auth-powered-name">{auth.poweredBy}</strong>
            </div>
          </div>

          <h2 className="auth-headline">
            {auth.headline}
            <br />
            <span className="auth-headline-accent">{auth.headlineAccent}</span>
          </h2>
          <p className="auth-tagline">
            {auth.tagline.map((t, i) =>
              t.accent ? (
                <span className="auth-tagline-accent" key={i}>{t.text}</span>
              ) : (
                <span key={i}>{t.text}</span>
              )
            )}
          </p>
          <span className="auth-rule" aria-hidden="true" />

          {!sent ? (
            <div className="auth-form-wrap">
              <h3 id="auth-title">{mode === "login" ? "Welcome Back" : "Create Your Account"}</h3>
              <p className="auth-form-sub">
                {mode === "login" ? "Login to your account to continue" : "Sign up to start your AI career journey"}
              </p>

              <form className="auth-form" onSubmit={submit} noValidate>
                {mode === "signup" && (
                  <div className="auth-field-group">
                    <label className={`auth-field ${errors.name ? "has-error" : ""}`}>
                      <Icon name="users" size={17} />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={(e) => update("name")(e.target.value)}
                        aria-invalid={!!errors.name}
                      />
                    </label>
                    {errors.name && <em className="field-err">{errors.name}</em>}
                  </div>
                )}

                <div className="auth-field-group">
                  <label className={`auth-field ${errors.email ? "has-error" : ""}`}>
                    <Icon name="mail" size={17} />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => update("email")(e.target.value)}
                      aria-invalid={!!errors.email}
                    />
                  </label>
                  {errors.email && <em className="field-err">{errors.email}</em>}
                </div>

                <div className="auth-field-group">
                  <label className={`auth-field ${errors.password ? "has-error" : ""}`}>
                    <Icon name="lock" size={17} />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => update("password")(e.target.value)}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      className="auth-field-eye"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      <Icon name="eye" size={17} />
                    </button>
                  </label>
                  {errors.password && <em className="field-err">{errors.password}</em>}
                </div>

                {mode === "signup" && (
                  <div className="auth-field-group">
                    <label className={`auth-field ${errors.confirm ? "has-error" : ""}`}>
                      <Icon name="lock" size={17} />
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={form.confirm}
                        onChange={(e) => update("confirm")(e.target.value)}
                        aria-invalid={!!errors.confirm}
                      />
                    </label>
                    {errors.confirm && <em className="field-err">{errors.confirm}</em>}
                  </div>
                )}

                {mode === "login" && (
                  <div className="auth-row">
                    <label className="auth-remember">
                      <input
                        type="checkbox"
                        checked={form.remember}
                        onChange={(e) => update("remember")(e.target.checked)}
                      />
                      Remember me
                    </label>
                    <button type="button" className="auth-forgot">Forgot Password?</button>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-block">
                  {mode === "login" ? "Login" : "Sign Up"}
                </button>
              </form>

              <p className="auth-switch">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button type="button" onClick={switchMode}>
                  {mode === "login" ? "Sign up" : "Login"}
                </button>
              </p>
            </div>
          ) : (
            <div className="auth-success">
              <div className="success-ring"><Icon name="check" size={30} /></div>
              {mode === "login" ? (
                <>
                  <h3>Welcome back!</h3>
                  <p>You&apos;re all set. Continue exploring your programs and resources.</p>
                </>
              ) : (
                <>
                  <h3>Account created!</h3>
                  <p>Welcome to Empowers Academy you can log in anytime to pick up where you left off.</p>
                </>
              )}
              <button className="btn btn-glass" onClick={close}>Close</button>
            </div>
          )}

          <div className="auth-capabilities">
            {auth.capabilities.map((c) => (
              <div className="auth-cap" key={c.label}>
                <span className="auth-cap-ic"><Icon name={c.icon} size={20} /></span>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-right" aria-hidden="true">
          <div className="auth-right-grid" />
          <div className="auth-right-glow" />
          <span className="auth-badge b1"><Icon name="cloud" size={22} /></span>
          <span className="auth-badge b2"><Icon name="code" size={22} /></span>
          <span className="auth-badge b3"><Icon name="pulse" size={22} /></span>
        </div>
      </div>
    </div>
  );
}

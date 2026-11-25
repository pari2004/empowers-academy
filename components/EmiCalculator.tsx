"use client";

import { useState } from "react";

const TENURES = [3, 6, 9, 12];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

// Simple fee-divided-by-months estimate — no interest rate is fabricated
// since actual EMI terms are business-confirmed by an advisor, not fixed here.
export default function EmiCalculator({ amount }: { amount: number }) {
  const [months, setMonths] = useState(6);
  const perMonth = Math.ceil(amount / months);

  return (
    <div className="emi-calculator glass-panel">
      <p className="emi-calculator-head">Estimate your monthly EMI</p>
      <div className="emi-calculator-tenures" role="radiogroup" aria-label="EMI tenure in months">
        {TENURES.map((m) => (
          <button
            key={m}
            type="button"
            className={`emi-tenure-btn${m === months ? " is-active" : ""}`}
            aria-pressed={m === months}
            onClick={() => setMonths(m)}
          >
            {m} mo
          </button>
        ))}
      </div>
      <p className="emi-calculator-result">
        <strong>{formatCurrency(perMonth)}</strong> / month for {months} months
      </p>
      <p className="emi-calculator-note">Estimate only final EMI terms are confirmed by your advisor.</p>
    </div>
  );
}

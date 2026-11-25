"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: Date | string;
}

export default function MasterclassCountdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="live-status-badge flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm font-semibold w-fit">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        Event Starting Soon / Live Now
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "16px 0 24px 0" }}>
      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }}></span>
        Live Event Starts In
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div className="glass-panel" style={{ padding: "10px 16px", minWidth: 70, textAlign: "center", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.04)" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{timeLeft.days}</div>
          <div style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", marginTop: 4 }}>Days</div>
        </div>
        <div className="glass-panel" style={{ padding: "10px 16px", minWidth: 70, textAlign: "center", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.04)" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{timeLeft.hours}</div>
          <div style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", marginTop: 4 }}>Hours</div>
        </div>
        <div className="glass-panel" style={{ padding: "10px 16px", minWidth: 70, textAlign: "center", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.04)" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{timeLeft.minutes}</div>
          <div style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", marginTop: 4 }}>Mins</div>
        </div>
        <div className="glass-panel" style={{ padding: "10px 16px", minWidth: 70, textAlign: "center", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.04)" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{timeLeft.seconds}</div>
          <div style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", marginTop: 4 }}>Secs</div>
        </div>
      </div>
    </div>
  );
}

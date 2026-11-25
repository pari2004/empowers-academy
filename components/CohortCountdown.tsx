"use client";

import { useEffect, useState } from "react";

function formatCountdown(ms: number) {
  if (ms <= 0) return null;
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function CohortCountdown({
  startDate,
  seatsLeft,
  capacity,
}: {
  startDate: string;
  seatsLeft: number | null;
  capacity: number | null;
}) {
  const target = new Date(startDate).getTime();
  // Countdown stays null until after mount so the server-rendered markup and
  // the first client render match exactly — no hydration mismatch from a
  // ticking clock.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const formattedDate = new Date(startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const countdown = now ? formatCountdown(target - now) : null;

  return (
    <div className="cohort-countdown glass-panel">
      <div className="cohort-countdown-main">
        <span className="cohort-countdown-label">Next cohort starts</span>
        <span className="cohort-countdown-date">{formattedDate}</span>
        {countdown && <span className="cohort-countdown-timer">Starts in {countdown}</span>}
      </div>
      {seatsLeft !== null && capacity !== null && (
        <div className="cohort-countdown-seats">
          <span className="cohort-countdown-seats-count">{seatsLeft}</span>
          <span>of {capacity} seats left</span>
        </div>
      )}
    </div>
  );
}

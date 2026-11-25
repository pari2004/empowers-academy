"use client";

import { useEffect, useRef, useState } from "react";

export type StatItem = { value: number; suffix: string; label: string; decimals?: number };

function useCountUp(target: number, decimals = 0) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done.current) {
            done.current = true;
            const start = performance.now();
            const dur = 1400;
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              setVal(target * eased);
              if (t < 1) requestAnimationFrame(tick);
              else setVal(target);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [target]);

  return { ref, display: val.toFixed(decimals) };
}

export function StatTile({ value, suffix, label, decimals = 0 }: StatItem) {
  const { ref, display } = useCountUp(value, decimals);
  return (
    <div className="stat-tile glass-panel" ref={ref}>
      <div className="stat-value gradient-text">
        {display}
        <span>{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Outcomes({ stats }: { stats: StatItem[] }) {
  return (
    <section className="outcomes" id="outcomes" style={{ position: "relative" }}>
      <div id="placements" style={{ position: "absolute", top: "-100px" }} />
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Real outcomes</span>
          <h2>From their old role to a better one</h2>
          <p>A snapshot of where alumni started and where they landed.</p>
        </div>

        <div className="stat-row reveal">
          {stats.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

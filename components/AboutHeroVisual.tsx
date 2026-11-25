"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./Icons";

const traits = ["Live Classes", "Mentor-Led", "Small Cohorts", "Practitioner-Taught", "Applied Learning"];

// Same gyro/orbit visual language as the homepage Hero — reused here (not
// homepage-specific skill chips) so the About hero gets the site's signature
// animated visual instead of a one-off.
export default function AboutHeroVisual() {
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = visualRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--mx", x.toFixed(3));
        el.style.setProperty("--my", y.toFixed(3));
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hero-visual about-hero-visual" ref={visualRef} aria-hidden="true">
      <div className="gyro">
        <div className="gyro-glow" />
        <div className="gyro-ring g1" />
        <div className="gyro-ring g2" />
        <div className="gyro-ring g3" />

        <div className="gyro-core">
          <span className="gyro-core-shine" />
          <span className="gyro-core-spark">
            <Icon name="users" size={36} />
          </span>
        </div>

        <div className="orbit orbit-a">
          {traits.slice(0, 3).map((t, i) => (
            <span className="skill-chip" style={{ ["--i" as string]: i, ["--n" as string]: 3 }} key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="orbit orbit-b">
          {traits.slice(3).map((t, i) => (
            <span className="skill-chip" style={{ ["--i" as string]: i, ["--n" as string]: 2 }} key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

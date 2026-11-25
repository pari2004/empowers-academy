"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { emit } from "@/lib/events";
import { Icon } from "./Icons";
import HeroCanvas from "./HeroCanvas";

const skills = ["Python", "LLMs", "RAG", "Agents", "MLOps"];

const proofAvatars = [
  { initials: "PK", photo: "/mentors/Parikshith%20T%20T.png", name: "Mr. Parikshith T T" },
  { initials: "TH", photo: "/mentors/Thanushree.jpeg", name: "Ms. Thanushree B R" },
  { initials: "SP", photo: "/mentors/Spoorthy.jpeg", name: "Ms. Spoorthy S G" },
  { initials: "PA", photo: "/mentors/pavan.jpeg", name: "Mr. Pavan" },
];

export type HeroData = { subheadline: string; primaryCta: string; secondaryCta: string };

export default function Hero({ hero }: { hero: HeroData }) {
  const visualRef = useRef<HTMLDivElement>(null);

  // Layered mouse parallax: rings tilt, cards drift more (foreground depth).
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
    <section className="hero" id="top">
      <HeroCanvas />
      <div className="hero-spot" aria-hidden="true" />
      <div className="hero-floor" aria-hidden="true" />

      <div className="container hero-inner">
        {/* ---------- Copy ---------- */}
        <div className="hero-copy">
          <span className="hero-badge s1">
            <span className="hero-badge-ic">
              <Icon name="shield" size={16} />
            </span>
            180 Day Better Offer Guarantee
            <span className="hero-badge-tag">In Writing</span>
          </span>

          <h1 className="hero-title s2">
            Get a Better Offer in{" "}
            <span className="shine">180 Days</span>
            <br className="hide-sm" />Or Your Money Back,{" "}
            <span className="shine">In Writing.</span>
          </h1>

          <p className="hero-sub s3">{hero.subheadline}</p>

          <div className="hero-cta s4">
            <button className="btn btn-primary btn-shine" onClick={() => emit("open-lead")}>
              {hero.primaryCta}
              <Icon name="arrow" size={18} color="#fff" />
            </button>
            <button className="btn btn-glass" onClick={() => emit("open-brochure")}>
              <Icon name="download" size={18} />
              {hero.secondaryCta}
            </button>
          </div>

          <div className="hero-proof s5">
            <div className="proof-avatars">
              {proofAvatars.map((a, i) => (
                <span key={a.initials} className="proof-av" style={{ zIndex: 4 - i }}>
                  <Image
                    src={a.photo}
                    alt={a.name}
                    fill
                    sizes="40px"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.classList.add("proof-av-fallback");
                    }}
                  />
                  <span className="proof-av-initials" aria-hidden="true">{a.initials}</span>
                </span>
              ))}
            </div>
            <div className="proof-text">
              <div className="proof-stars">
                {"★★★★★"}
                <a href="https://maps.app.goo.gl/MAcqVsJk1DBELgvA8" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                  <strong>4.9/5</strong>
                </a>
              </div>
              <span>Trusted by 5,000+ professionals across 350+ hiring partners</span>
            </div>
          </div>
        </div>

        {/* ---------- Spatial visual ---------- */}
        <div className="hero-visual" ref={visualRef} aria-hidden="true">
          <div className="gyro">
            <div className="gyro-glow" />
            <div className="gyro-ring g1" />
            <div className="gyro-ring g2" />
            <div className="gyro-ring g3" />

            <div className="gyro-core">
              <span className="gyro-core-shine" />
              <span className="gyro-core-spark">
                <Icon name="spark" size={36} />
              </span>
            </div>

            {/* orbiting skill chips */}
            <div className="orbit orbit-a">
              {skills.slice(0, 3).map((s, i) => (
                <span className="skill-chip" style={{ ["--i" as string]: i, ["--n" as string]: 3 }} key={s}>
                  {s}
                </span>
              ))}
            </div>
            <div className="orbit orbit-b">
              {skills.slice(3).map((s, i) => (
                <span className="skill-chip" style={{ ["--i" as string]: i, ["--n" as string]: 2 }} key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useLayoutEffect, useRef } from "react";
import { Icon } from "./Icons";

export type AlumniOutcome = {
  name: string;
  photo?: string;
  prior: string;
  role: string;
  company: string;
  salary: number;
  quote: string;
  // Optional free-text tag an admin sets per alumni entry (e.g. a course
  // category) so a program page can surface the 1-3 stories relevant to it.
  programTag?: string;
};

export default function Alumni({ outcomes }: { outcomes: AlumniOutcome[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinActiveRef = useRef(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;

    const mq = window.matchMedia("(min-width: 721px)");
    const maxScroll = () => track.scrollWidth - track.clientWidth;
    // Dwell time after the last card arrives, so it isn't released the instant it's reached.
    const tailBuffer = () => window.innerHeight * 0.6;

    let targetLeft = 0;
    let rafId = 0;

    const setHeight = () => {
      if (!pinActiveRef.current) {
        stage.style.height = "";
        return;
      }
      stage.style.height = `${window.innerHeight + maxScroll() + tailBuffer()}px`;
    };

    // Recompute the target scrollLeft from page-scroll progress; the rAF loop
    // below eases the track toward it so wheel ticks glide instead of snapping.
    const computeTarget = () => {
      if (!pinActiveRef.current) return;
      const ms = maxScroll();
      if (ms <= 0) return;
      const scrolled = -stage.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, scrolled / ms));
      targetLeft = progress * ms;
    };

    const onResize = () => {
      setHeight();
      computeTarget();
    };

    const tick = () => {
      if (pinActiveRef.current) {
        const current = track.scrollLeft;
        const delta = targetLeft - current;
        track.scrollLeft = Math.abs(delta) > 0.5 ? current + delta * 0.18 : targetLeft;
      }
      rafId = requestAnimationFrame(tick);
    };

    const applyMode = () => {
      pinActiveRef.current = mq.matches;
      stage.classList.toggle("pin-active", pinActiveRef.current);
      if (!pinActiveRef.current) {
        track.scrollLeft = 0;
        targetLeft = 0;
      }
      setHeight();
      computeTarget();
    };

    applyMode();
    rafId = requestAnimationFrame(tick);
    window.addEventListener("scroll", computeTarget, { passive: true });
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", applyMode);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", computeTarget);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", applyMode);
    };
  }, []);

  return (
    <section className="alumni" id="alumni">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Our Alumni</span>
          <h2>The people behind the outcomes</h2>
          <p>Meet a few of the professionals who made the jump.</p>
        </div>
      </div>

      <div className="outcomes-scroll-stage" ref={stageRef}>
        <div className="outcomes-sticky">
          <div className="outcomes-carousel reveal">
            <div className="outcomes-track" ref={trackRef}>
              {outcomes.map((o) => (
                <article className="outcome-card glass-panel" key={o.name}>
                  <div className="outcome-card-body">
                    <div className="outcome-card-head">
                      <div className="outcome-card-meta">
                        <div className="outcome-card-name-row">
                          <h3>{o.name}</h3>
                          <span className="outcome-check" aria-label="Verified" title="Verified Alumni">
                            <Icon name="check" size={13} />
                          </span>
                        </div>
                        <p className="outcome-card-role gradient-text">{o.role} @ {o.company}</p>
                      </div>
                    </div>
                    <p className="outcome-card-quote">{o.quote}</p>
                  </div>
                  <div className="outcome-card-salary">
                    <span>Salary Jump</span>
                    <strong>₹{o.salary} LPA</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

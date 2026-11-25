"use client";

import { useRef } from "react";
import { Icon } from "./Icons";

export type WhyCard = { icon: string; title: string; body: string };

export default function WhyEmpowers({ whyCards }: { whyCards: WhyCard[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Subtle tilt/translate parallax as the cursor moves over the grid.
  const onMove = (e: React.MouseEvent) => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll<HTMLElement>(".why-card");
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      card.style.transform = `translate(${dx * 6}px, ${dy * 6}px) rotateX(${dy * -4}deg) rotateY(${dx * 4}deg)`;
    });
  };
  const onLeave = () => {
    gridRef.current
      ?.querySelectorAll<HTMLElement>(".why-card")
      .forEach((c) => (c.style.transform = ""));
  };

  return (
    <section className="why" id="why">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">What Empowers</span>
          <h2>A different kind of AI program</h2>
          <p>
            Calm, credible, and built around outcomes, not hype. Here&apos;s what sets the
            experience apart.
          </p>
        </div>

        <div className="why-grid reveal" ref={gridRef} onMouseMove={onMove} onMouseLeave={onLeave}>
          {whyCards.map((c) => (
            <article className="why-card glass-panel" key={c.title}>
              <div className="why-icon">
                <Icon name={c.icon} size={26} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { about, mentors } from "@/lib/content";
import { PerspectiveCarousel } from "@/components/ui/perspective-carousel";

export default function TeamIntro() {
  const items = mentors.map((m) => ({
    src: m.image,
    initials: m.initials,
    title: m.name,
    subtitle: m.aboutTitle,
    alt: m.name,
  }));

  return (
    <section className="team-intro" id="team">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">{about.teamEyebrow}</span>
          <h2>{about.teamHeading}</h2>
          <p>{about.teamBody}</p>
        </div>

        <div className="team-carousel reveal">
          <PerspectiveCarousel items={items} loop autoplay slideWidth={220} rotationStep={55} />
        </div>
      </div>
    </section>
  );
}

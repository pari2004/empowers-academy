"use client";

import React, { useRef, useState, useEffect } from "react";
import TechLogo from "./TechLogo";

export type ProjectItem = {
  title: string;
  description: string;
  tech?: string;
  iconSlug?: string;
};

export default function ProjectsCarousel({ projects }: { projects: ProjectItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(Math.max(0, scrollLeft / maxScroll), 1));
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [projects.length]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 380;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="projects-carousel-wrapper">
      <div className="projects-scroll-wrapper">
        <div className="projects-scroll-container" ref={scrollRef}>
          {projects.map((proj, idx) => (
            <div key={proj.title} className="industry-project-card">
              <div className="project-card-header">
                <span className="project-card-label">Project {idx + 1}</span>
                <h4 className="project-card-title">{proj.title}</h4>
              </div>
              <div className="project-card-content">
                <p>{proj.description}</p>
              </div>
              <div className="project-card-footer">
                <div className="project-card-tech">
                  <TechLogo name={proj.tech || "Python"} iconSlug={proj.iconSlug} size={28} />
                  <span className="project-card-tech-name">{proj.tech || "Python"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="projects-disclaimer">
        Disclaimer - The projects have been built leveraging real publicly available datasets from organizations.
      </p>

      {/* Bottom slider and arrows matching the reference layout */}
      <div className="projects-bottom-nav">
        <button
          type="button"
          className="projects-slider-arrow-btn"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous project"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="projects-slider-track">
          <div
            className="projects-slider-bar"
            style={{
              left: `${scrollProgress * 65}%`,
              width: "35%",
            }}
          />
        </div>

        <button
          type="button"
          className="projects-slider-arrow-btn"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Next project"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

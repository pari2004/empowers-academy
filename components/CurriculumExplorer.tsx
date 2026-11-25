"use client";

import { useState } from "react";
import type { ProgramCurriculumSection } from "@/lib/content";
import { Icon } from "./Icons";

export default function CurriculumExplorer({ sections }: { sections: ProgramCurriculumSection[] }) {
  // First module open by default
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(() => new Set([0]));

  const totalLessons = sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);

  const toggle = (i: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenIndexes(new Set(sections.map((_, i) => i)));
  };

  const collapseAll = () => {
    setOpenIndexes(new Set());
  };

  const allOpen = openIndexes.size === sections.length;

  return (
    <div className="curriculum-explorer">
      <div className="curriculum-header-flex">
        <p className="curriculum-summary">
          <span className="curriculum-summary-pill">{sections.length} Modules</span>
          {totalLessons > 0 && (
            <>
              <span aria-hidden="true" className="curriculum-dot">·</span>
              <span className="curriculum-summary-pill">{totalLessons} Core Topics &amp; Labs</span>
            </>
          )}
        </p>
        <button
          type="button"
          className="curriculum-toggle-all-btn"
          onClick={allOpen ? collapseAll : expandAll}
        >
          {allOpen ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="curriculum-list">
        {sections.map((section, i) => {
          const isOpen = openIndexes.has(i);

          // If section.lessons is empty, provide sensible default lessons based on title
          const lessons =
            section.lessons && section.lessons.length > 0
              ? section.lessons
              : [
                  { title: `Core Concepts, Architecture & Theory of ${section.title}` },
                  { title: `Hands-on Implementation & Industry Best Practices` },
                  { title: `Real-world Problem Solving & Case Studies` },
                  { title: `Code Review, Optimization & Deliverables` },
                ];

          const lessonCount = lessons.length;

          return (
            <div className={`curriculum-item glass-panel${isOpen ? " is-open" : ""}`} key={i}>
              <h3>
                <button
                  type="button"
                  className="curriculum-q"
                  aria-expanded={isOpen}
                  aria-controls={`curriculum-panel-${i}`}
                  id={`curriculum-header-${i}`}
                  onClick={() => toggle(i)}
                >
                  <span className="curriculum-q-title">
                    <span className="curriculum-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="curriculum-title-text">{section.title}</span>
                  </span>
                  <span className="curriculum-q-right">
                    <span className="curriculum-lesson-count">
                      {lessonCount} {lessonCount === 1 ? "topic" : "topics"}
                    </span>
                    <span className={`faq-icon${isOpen ? " is-rotated" : ""}`} aria-hidden="true">
                      <Icon name="arrow" size={16} />
                    </span>
                  </span>
                </button>
              </h3>

              {isOpen && (
                <div
                  className="curriculum-panel"
                  id={`curriculum-panel-${i}`}
                  role="region"
                  aria-labelledby={`curriculum-header-${i}`}
                >
                  <ul className="curriculum-lessons">
                    {lessons.map((lesson, idx) => (
                      <li key={idx} className="curriculum-lesson-item">
                        <span className="curriculum-check-icon">
                          <Icon name="check" size={14} />
                        </span>
                        <span className="curriculum-lesson-title">{lesson.title}</span>
                        {lesson.duration && (
                          <span className="curriculum-duration">{lesson.duration}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

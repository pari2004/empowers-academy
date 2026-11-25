"use client";

import { useState } from "react";
import { Icon } from "./Icons";

export type FaqItem = { q: string; a: string };

// Every answer ships in the server-rendered HTML even while collapsed, so
// crawlers read it — that's what keeps the FAQPage schema in StructuredData
// honest (Google explicitly permits FAQ content behind an accordion).
export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Questions, answered</span>
          <h2>Frequently Asked Questions</h2>
          <p>
            Everything about the guarantee, the format, and who these programs are for.
            Still unsure? An advisor will walk you through it.
          </p>
        </div>

        <div className="faq-list reveal">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div className={`faq-item glass-panel${isOpen ? " is-open" : ""}`} key={f.q}>
                <h3>
                  <button
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{f.q}</span>
                    <span className="faq-icon" aria-hidden="true">
                      <Icon name="arrow" size={16} />
                    </span>
                  </button>
                </h3>
                <div
                  className="faq-a"
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  hidden={!isOpen}
                >
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

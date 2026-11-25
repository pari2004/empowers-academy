"use client";

import Link from "next/link";
import { Icon } from "./Icons";

export type ProgramCard = {
  slug: string;
  tag: string;
  title: string;
  goal: string;
  format: string;
  trendingNow?: boolean;
  price?: number;
  discountPrice?: number;
  gstText?: string;
  badge?: string;
};

function handleCardPointerMove(e: React.MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
  el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
}

export default function Programs({ programs }: { programs: ProgramCard[] }) {
  return (
    <section className="programs" id="programs">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Program offerings</span>
          <h2>Explore Our AI Programs</h2>
          <p>Live, mentor led, and covered by the 180 day better-offer guarantee.</p>
          <Link href="/programs/compare" className="program-compare-link">
            Compare programs side by side <Icon name="arrow" size={13} />
          </Link>
        </div>

        <div className="program-grid reveal">
          {programs.map((p) => {
            const highlighted = p.tag === "Flagship";

            // Real <Link> to a real route, not a click-to-open overlay — this
            // is what lets crawlers reach the program content at all.
            return (
              <Link
                href={`/programs/${p.slug}`}
                className={`program-card glass-panel${highlighted ? " program-card-highlight" : ""}${p.trendingNow ? " program-card-soon" : ""}`}
                key={p.slug}
                onMouseMove={handleCardPointerMove}
              >
                <div className="program-card-sheen" aria-hidden="true" />

                <div className="program-card-body">
                  <div className="program-top">
                    <span className="program-tag">{p.tag}</span>
                    {p.badge ? (
                      <span className="badge-highlight-chip">
                        <Icon name="spark" size={13} /> {p.badge}
                      </span>
                    ) : p.trendingNow ? (
                      <span className="soon-chip">Trending Now</span>
                    ) : (
                      <span className="guarantee-chip">
                        <Icon name="shield" size={15} /> 180 day guarantee
                      </span>
                    )}
                  </div>
                  <h3>{p.title}</h3>
                  <p className="program-goal">{p.goal}</p>
                  <p className="program-format">{p.format}</p>

                  {p.price ? (
                    <div className="program-card-pricing">
                      <div className="program-card-fee">
                        <span className="program-fee-label">Course Fee</span>
                        <div className="program-fee-val-wrap">
                          <span className="program-fee-amount">₹{p.price.toLocaleString("en-IN")}</span>
                          <span className="program-fee-gst">{p.gstText ?? "+ 18% GST"}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <span className="program-card-cta">
                    View full program <Icon name="arrow" size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

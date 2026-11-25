"use client";

import { emit } from "@/lib/events";

// The only interactive part of a program page — kept separate so the rest of
// ProgramContent stays a server component and ships in the crawlable HTML.
export default function ProgramCtas({
  applyCtaLabel,
  applyCtaHref,
  brochureUrl,
  brochureLabel,
}: {
  applyCtaLabel?: string;
  applyCtaHref?: string;
  brochureUrl?: string;
  brochureLabel?: string;
}) {
  return (
    <div className="program-detail-actions">
      {applyCtaHref ? (
        <a className="btn btn-primary" href={applyCtaHref} target="_blank" rel="noopener noreferrer">
          {applyCtaLabel || "Apply Now"}
        </a>
      ) : (
        <button className="btn btn-primary" onClick={() => emit("open-lead")}>
          Request a Callback
        </button>
      )}
      {brochureUrl ? (
        <a className="btn btn-glass" href={brochureUrl} download>
          {brochureLabel || "Download Brochure"}
        </a>
      ) : (
        <button className="btn btn-glass" onClick={() => emit("open-brochure")}>
          Download Brochure
        </button>
      )}
    </div>
  );
}

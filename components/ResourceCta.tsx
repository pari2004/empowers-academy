"use client";

import { emit } from "@/lib/events";

// End-of-article conversion point. Readers arrive here from an informational
// search — this is the only "sell" on the page, and it stays soft.
export default function ResourceCta() {
  return (
    <aside className="article-cta">
      <h2>Want to build this for real?</h2>
      <p>
        Empowers Academy runs live, mentor led AI programs covering exactly this kind of
        production engineering backed by a 180 day better offer guarantee, signed in
        writing before you pay.
      </p>
      <div className="article-cta-actions">
        <button className="btn btn-primary" onClick={() => emit("open-lead")}>
          Request a Callback
        </button>
        <button className="btn btn-glass" onClick={() => emit("open-brochure")}>
          Download Brochure
        </button>
      </div>
    </aside>
  );
}

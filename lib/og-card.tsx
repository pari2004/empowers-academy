// Shared branded 1200×630 social-share card, rendered by both
// app/opengraph-image.tsx and app/twitter-image.tsx. Text-only so it needs
// no font/image assets bundled — matches the site's dark spatial gradient.

export const ogSize = { width: 1200, height: 630 };

export const ogAlt =
  "Empowers Academy — Get a Better Offer in 180 Days or Your Money Back, In Writing";

export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background:
          "linear-gradient(160deg, #05060a 0%, #10132b 55%, #191049 100%)",
        color: "#f5f5f7",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            padding: "10px 26px",
            borderRadius: 999,
            border: "1px solid rgba(6,182,212,0.55)",
            color: "#06b6d4",
            fontSize: 26,
            letterSpacing: 4,
          }}
        >
          180-DAY BETTER-OFFER GUARANTEE
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.12 }}>
          Get a Better Offer in 180 Days
        </div>
        <div
          style={{
            fontSize: 74,
            fontWeight: 700,
            lineHeight: 1.12,
            color: "#8b7cf6",
          }}
        >
          Or Your Money Back, In Writing.
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(245,245,247,0.72)",
            marginTop: 10,
          }}
        >
          Live, mentor-led AI programs · GenAI · Agentic AI · ML · MLOps
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
          Empowers Academy
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 28,
          }}
        >
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} width="26" height="26" viewBox="0 0 24 24">
                <path
                  fill="#fbbf24"
                  d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
                />
              </svg>
            ))}
          </div>
          <span style={{ color: "#f5f5f7" }}>4.9/5 · 5,000+ trained</span>
        </div>
      </div>
    </div>
  );
}

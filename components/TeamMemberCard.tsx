"use client";

import { useState } from "react";

export type TeamMemberProps = {
  name: string;
  designation?: string;
  photo?: string;
  bio?: string;
};

function normalizePhotoUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
}

export default function TeamMemberCard({ name, designation, photo, bio }: TeamMemberProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedPhoto = normalizePhotoUrl(photo);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="resource-card glass-panel founder-message" style={{ marginBottom: 20 }}>
      {resolvedPhoto && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedPhoto}
          alt={name}
          className="founder-photo"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="founder-photo"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "1.6rem",
            letterSpacing: 1,
            borderRadius: "50%",
            flexShrink: 0,
            boxShadow: "0 4px 20px rgba(37, 99, 235, 0.3)",
          }}
        >
          {initials}
        </div>
      )}
      <div>
        <h3 style={{ fontSize: "1.25rem", marginBottom: 6, color: "var(--text-primary)" }}>{name}</h3>
        {designation && (
          <span className="chip" style={{ marginBottom: 12, display: "inline-block" }}>
            {designation}
          </span>
        )}
        {bio && <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>{bio}</p>}
      </div>
    </div>
  );
}

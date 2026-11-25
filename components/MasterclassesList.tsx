import Image from "next/image";
import Link from "next/link";
import type { getUpcomingMasterclasses } from "@/lib/services/masterclassService";
import { Icon } from "./Icons";
import { formatMasterclassDateTime } from "@/lib/masterclassFormat";

type MasterclassInfo = Awaited<ReturnType<typeof getUpcomingMasterclasses>>[number];

export default function MasterclassesList({ masterclasses }: { masterclasses: MasterclassInfo[] }) {
  return (
    <div className="resource-grid resource-grid-index" style={{ gap: 24 }}>
      {masterclasses.map((m) => (
        <Link href={`/masterclasses/${m.slug}`} className="resource-card glass-panel" key={m.slug} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: 16, padding: 24, transition: "all 0.2s ease-in-out", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <span className="chip" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", border: "1px solid rgba(129, 140, 248, 0.3)", padding: "4px 10px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 700 }}>
                📅 {formatMasterclassDateTime(m.scheduledAt)}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700, background: "rgba(52, 211, 153, 0.1)", padding: "2px 8px", borderRadius: 6 }}>
                FREE WEBINAR
              </span>
            </div>

            {m.coverImage && (
              <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", marginBottom: 14, height: 160 }}>
                <Image src={m.coverImage} alt={m.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
              </div>
            )}

            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.3, marginBottom: 10, color: "#fff" }}>
              {m.title}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {m.description}
            </p>
          </div>

          <div>
            <div className="program-detail-meta-row" style={{ marginBottom: 16, fontSize: "0.82rem" }}>
              {m.durationMinutes && (
                <span><Icon name="pulse" size={14} /> {m.durationMinutes} min</span>
              )}
              {m.instructor && (
                <span><Icon name="users" size={14} /> {m.instructor.name}</span>
              )}
              {!!m.capacity && (
                <span><Icon name="spark" size={14} /> Limited seats</span>
              )}
            </div>
            <span className="btn btn-primary" style={{ width: "100%", textAlign: "center", display: "block" }}>
              Reserve Free Spot →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}


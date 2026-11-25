import { StatTile } from "./Outcomes";
import type { AlumniOutcome } from "./Alumni";

export type OutcomesSnapshotData = {
  placementRate?: number | null;
  avgSalaryHikePct?: number | null;
  avgPackageLpa?: number | null;
  alumni?: AlumniOutcome[];
};

export default function ProgramOutcomesSnapshot({
  placementRate,
  avgSalaryHikePct,
  avgPackageLpa,
  alumni = [],
}: OutcomesSnapshotData) {
  const stats = [
    placementRate != null && { value: placementRate, suffix: "%", label: "Placement rate" },
    avgSalaryHikePct != null && { value: avgSalaryHikePct, suffix: "%", label: "Avg. salary hike" },
    avgPackageLpa != null && { value: avgPackageLpa, suffix: " LPA", label: "Avg. package", decimals: 1 },
  ].filter(Boolean) as { value: number; suffix: string; label: string; decimals?: number }[];

  if (!stats.length && !alumni.length) return null;

  return (
    <section className="program-detail-section">
      <h2>Outcomes Snapshot</h2>
      {!!stats.length && (
        <div className="stat-row stat-row--compact">
          {stats.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>
      )}
      {!!alumni.length && (
        <div className="resource-grid" style={stats.length ? { marginTop: 20 } : undefined}>
          {alumni.map((a) => (
            <div className="resource-card glass-panel outcome-snapshot-card" key={a.name}>
              <p className="outcome-snapshot-move">
                {a.prior} <span aria-hidden="true">&rarr;</span> {a.role} at {a.company}
              </p>
              <p>&ldquo;{a.quote}&rdquo;</p>
              <p><strong>{a.name}</strong></p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

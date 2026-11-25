import Link from "next/link";
import type { getCoursesForComparison } from "@/lib/services/courseService";

type CourseCompareInfo = Awaited<ReturnType<typeof getCoursesForComparison>>[number];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const rows: { label: string; render: (c: CourseCompareInfo) => React.ReactNode }[] = [
  { label: "Duration", render: (c) => c.duration ?? "" },
  { label: "Mode", render: (c) => c.programmeDetail?.mode ?? "" },
  {
    label: "Fee",
    render: (c) => {
      const fee = c.discountPrice ?? c.price;
      return fee ? (
        <div>
          <strong style={{ fontSize: "1.05rem" }}>{formatCurrency(Number(fee))}</strong>
          <span style={{ display: "block", fontSize: "0.78rem", color: "var(--accent-light, #a78bfa)", marginTop: "2px", fontWeight: 600 }}>
            + 18% GST
          </span>
        </div>
      ) : "";
    },
  },
  { label: "EMI Available", render: (c) => (c.programmeDetail?.emiAvailable ? "Yes" : "") },
  { label: "Certification", render: (c) => c.programmeDetail?.certification ?? "" },
  { 
    label: "Skills Covered", 
    render: (c) => (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {c.tags.slice(0, 6).map((tag, i) => (
          <span key={i} className="compare-tag">{tag}</span>
        ))}
      </div>
    ) 
  },
  { label: "Placement Support", render: (c) => c.programmeDetail?.placementSupport ?? "" },
  {
    label: "Placement Rate",
    render: (c) => (c.programmeDetail?.placementRate != null ? `${c.programmeDetail.placementRate}%` : ""),
  },
  {
    label: "Avg. Package",
    render: (c) => (c.programmeDetail?.avgPackageLpa != null ? `${Number(c.programmeDetail.avgPackageLpa)} LPA` : ""),
  },
];

export default function CompareProgramsTable({ courses }: { courses: CourseCompareInfo[] }) {
  return (
    <div className="compare-table-wrap glass-panel">
      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col" />
            {courses.map((c) => (
              <th scope="col" key={c.slug}>
                <Link href={`/programs/${c.slug}`}>{c.title}</Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {courses.map((c) => (
                <td key={c.slug}>{r.render(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

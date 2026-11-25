"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  programmeDetail: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; updatedAt: string } | null;
};

const badgeClass = (status: string) =>
  status === "PUBLISHED" ? styles.badgePublished : status === "ARCHIVED" ? styles.badgeArchived : styles.badgeDraft;

export default function ProgrammeDetailsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-programme-details", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/programme-details?${params}`);
      if (!res.ok) throw new Error("Failed to load courses");
      return res.json() as Promise<{ items: CourseRow[] }>;
    },
  });

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Programme Details</h1>
      </div>
      <p style={{ color: "var(--adm-text-faint)", fontSize: 13, marginTop: -12, marginBottom: 16 }}>
        Manage the public program-page marketing content for each course. New courses are created from{" "}
        <Link href="/admin/courses">Courses</Link>.
      </p>

      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <input className={styles.search} placeholder="Search courses…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Course Status</th>
              <th>Programme Details</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.category ?? "—"}</td>
                <td>
                  <span className={`${styles.badge} ${badgeClass(course.status)}`}>{course.status.toLowerCase()}</span>
                </td>
                <td>
                  {course.programmeDetail ? (
                    <span className={`${styles.badge} ${badgeClass(course.programmeDetail.status)}`}>
                      {course.programmeDetail.status.toLowerCase()}
                    </span>
                  ) : (
                    <span className={styles.badge}>not started</span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/programme-details/${course.id}`} className={styles.actionBtn}>
                      {course.programmeDetail ? "Edit" : "Set up"}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && (data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No courses found.</div>}
      </div>
    </div>
  );
}

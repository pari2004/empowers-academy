"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type Course = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string;
};

const badgeClass = (status: Course["status"]) =>
  status === "PUBLISHED" ? styles.badgePublished : status === "ARCHIVED" ? styles.badgeArchived : styles.badgeDraft;

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses", page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/courses?${params}`);
      if (!res.ok) throw new Error("Failed to load courses");
      return res.json() as Promise<{ items: Course[]; total: number; pageCount: number }>;
    },
  });

  async function runAction(url: string, method: string, successMessage: string) {
    const res = await fetch(url, { method });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Action failed", "error");
      return;
    }
    showToast(successMessage, "success");
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Courses</h1>
        <Link href="/admin/courses/new" className={pageStyles.primaryBtn}>
          + New Course
        </Link>
      </div>

      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Search courses…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className={styles.search}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.category ?? "—"}</td>
                <td>
                  <span className={`${styles.badge} ${badgeClass(course.status)}`}>
                    {course.status.toLowerCase()}
                  </span>
                </td>
                <td>{new Date(course.updatedAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/courses/${course.id}`} className={styles.actionBtn}>
                      Edit
                    </Link>
                    {course.status !== "PUBLISHED" && (
                      <button
                        className={styles.actionBtn}
                        onClick={() =>
                          runAction(`/api/admin/courses/${course.id}/publish`, "POST", "Course published")
                        }
                      >
                        Publish
                      </button>
                    )}
                    {course.status !== "ARCHIVED" && (
                      <button
                        className={styles.actionBtn}
                        onClick={() =>
                          runAction(`/api/admin/courses/${course.id}/archive`, "POST", "Course archived")
                        }
                      >
                        Archive
                      </button>
                    )}
                    <button
                      className={styles.actionBtn}
                      onClick={() =>
                        runAction(`/api/admin/courses/${course.id}/duplicate`, "POST", "Course duplicated")
                      }
                    >
                      Duplicate
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => setPendingDelete(course)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && (data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No courses found.</div>}

        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {data?.pageCount ?? 1}
          </span>
          <button
            className={styles.pageBtn}
            disabled={page >= (data?.pageCount ?? 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete course"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? This can be recovered by a Super Admin.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await runAction(`/api/admin/courses/${pendingDelete.id}`, "DELETE", "Course deleted");
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

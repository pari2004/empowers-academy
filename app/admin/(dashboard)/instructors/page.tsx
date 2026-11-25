"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type Instructor = {
  id: string;
  name: string;
  designation: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const badgeClass = (status: Instructor["status"]) =>
  status === "PUBLISHED" ? styles.badgePublished : status === "ARCHIVED" ? styles.badgeArchived : styles.badgeDraft;

export default function InstructorsPage() {
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Instructor | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-instructors", search],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: "50" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/instructors?${params}`);
      if (!res.ok) throw new Error("Failed to load instructors");
      return res.json() as Promise<{ items: Instructor[] }>;
    },
  });

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/instructors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to delete instructor", "error");
      return;
    }
    showToast("Instructor deleted", "success");
    queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Instructors</h1>
        <Link href="/admin/instructors/new" className={pageStyles.primaryBtn}>
          + New Instructor
        </Link>
      </div>

      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <input className={styles.search} placeholder="Search instructors…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Featured</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((instructor) => (
              <tr key={instructor.id}>
                <td>{instructor.name}</td>
                <td>{instructor.designation}</td>
                <td>{instructor.featured ? "Yes" : "No"}</td>
                <td>
                  <span className={`${styles.badge} ${badgeClass(instructor.status)}`}>
                    {instructor.status.toLowerCase()}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/instructors/${instructor.id}`} className={styles.actionBtn}>
                      Edit
                    </Link>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => setPendingDelete(instructor)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && (data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No instructors found.</div>}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete instructor"
        message={`Are you sure you want to delete "${pendingDelete?.name}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await handleDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

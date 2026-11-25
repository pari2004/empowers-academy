"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type Brochure = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  updatedAt: string;
  category?: { name: string } | null;
};

const badgeClass = (status: Brochure["status"]) =>
  status === "PUBLISHED" ? styles.badgePublished : status === "ARCHIVED" ? styles.badgeArchived : styles.badgeDraft;

export default function BrochuresPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Brochure | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-brochures", page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/brochures?${params}`);
      if (!res.ok) throw new Error("Failed to load brochures");
      return res.json() as Promise<{ items: Brochure[]; total: number; pageCount: number }>;
    },
  });

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Brochures</h1>
        <Link href="/admin/brochures/new" className={pageStyles.primaryBtn}>
          + New Brochure
        </Link>
      </div>

      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Search brochures…"
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
              <th>Featured</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((brochure) => (
              <tr key={brochure.id}>
                <td>{brochure.title}</td>
                <td>{brochure.category?.name ?? "—"}</td>
                <td>{brochure.featured ? "Yes" : "—"}</td>
                <td>
                  <span className={`${styles.badge} ${badgeClass(brochure.status)}`}>{brochure.status.toLowerCase()}</span>
                </td>
                <td>{new Date(brochure.updatedAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/brochures/${brochure.id}`} className={styles.actionBtn}>
                      Edit
                    </Link>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setPendingDelete(brochure)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && (data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No brochures found.</div>}

        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {data?.pageCount ?? 1}
          </span>
          <button className={styles.pageBtn} disabled={page >= (data?.pageCount ?? 1)} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete brochure"
        message={`Delete "${pendingDelete?.title}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/brochures/${pendingDelete.id}`, { method: "DELETE" });
          showToast("Brochure deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-brochures"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

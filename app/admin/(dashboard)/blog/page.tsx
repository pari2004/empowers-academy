"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type Blog = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  readingTime: string | null;
  updatedAt: string;
  category?: { name: string } | null;
};

const badgeClass = (status: Blog["status"]) =>
  status === "PUBLISHED" ? styles.badgePublished : status === "ARCHIVED" ? styles.badgeArchived : styles.badgeDraft;

export default function BlogListPage() {
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Blog | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog", search],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: "50" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/blog?${params}`);
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json() as Promise<{ items: Blog[] }>;
    },
  });

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Blog</h1>
        <Link href="/admin/blog/new" className={pageStyles.primaryBtn}>
          + New Post
        </Link>
      </div>

      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <input className={styles.search} placeholder="Search posts…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Reading Time</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.category?.name ?? "—"}</td>
                <td>{post.readingTime ?? "—"}</td>
                <td>
                  <span className={`${styles.badge} ${badgeClass(post.status)}`}>{post.status.toLowerCase()}</span>
                </td>
                <td>{new Date(post.updatedAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/blog/${post.id}`} className={styles.actionBtn}>
                      Edit
                    </Link>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setPendingDelete(post)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && (data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No blog posts found.</div>}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete post"
        message={`Delete "${pendingDelete?.title}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/blog/${pendingDelete.id}`, { method: "DELETE" });
          showToast("Post deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

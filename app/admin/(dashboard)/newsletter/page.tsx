"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import formStyles from "@/components/admin/Form.module.css";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type Subscriber = { id: string; email: string; isActive: boolean; source: string | null; createdAt: string };

export default function NewsletterPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Subscriber | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-newsletter", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/newsletter?${params}`);
      return (await res.json()) as { items: Subscriber[]; pageCount: number };
    },
  });

  async function handleImport() {
    const emails = importText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    const body = await res.json();
    showToast(`Imported ${body.imported ?? 0} subscribers`, "success");
    setImportOpen(false);
    setImportText("");
    queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Newsletter Subscribers</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={formStyles.cancelBtn} onClick={() => setImportOpen(true)} type="button">
            Import
          </button>
          <Link className={pageStyles.primaryBtn} href="/api/admin/newsletter/export">
            Export CSV
          </Link>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <input className={styles.search} placeholder="Search email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Subscribed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>{s.source ?? "—"}</td>
                <td>
                  <span className={`${styles.badge} ${s.isActive ? styles.badgePublished : styles.badgeArchived}`}>
                    {s.isActive ? "active" : "inactive"}
                  </span>
                </td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setPendingDelete(s)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No subscribers yet.</div>}
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

      <Modal open={importOpen} title="Import Subscribers" onClose={() => setImportOpen(false)}>
        <label className={formStyles.hint} htmlFor="newsletter-import" style={{ display: "block", marginBottom: 10 }}>
          Paste emails separated by commas or new lines.
        </label>
        <textarea id="newsletter-import" className={formStyles.textarea} style={{ minHeight: 160 }} value={importText} onChange={(e) => setImportText(e.target.value)} />
        <div className={formStyles.actions}>
          <button className={formStyles.cancelBtn} onClick={() => setImportOpen(false)} type="button">
            Cancel
          </button>
          <button className={formStyles.submitBtn} onClick={handleImport} type="button">
            Import
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete subscriber"
        message={`Delete "${pendingDelete?.email}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/newsletter/${pendingDelete.id}`, { method: "DELETE" });
          showToast("Subscriber deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

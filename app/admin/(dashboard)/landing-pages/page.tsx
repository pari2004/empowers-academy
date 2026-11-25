"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import formStyles from "@/components/admin/Form.module.css";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type LandingPage = { id: string; title: string; slug: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" };

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function LandingPagesPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<LandingPage | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-landing-pages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/landing-pages");
      return (await res.json()) as { items: LandingPage[] };
    },
  });

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, status: "DRAFT" }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to create landing page", "error");
      return;
    }
    showToast("Landing page created", "success");
    setCreating(false);
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    queryClient.invalidateQueries({ queryKey: ["admin-landing-pages"] });
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Landing Pages</h1>
        <button className={pageStyles.primaryBtn} onClick={() => setCreating(true)}>
          + New Landing Page
        </button>
      </div>

      <div className={listStyles.wrap}>
        <table className={listStyles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>/{p.slug}</td>
                <td>
                  <span className={`${listStyles.badge} ${p.status === "PUBLISHED" ? listStyles.badgePublished : listStyles.badgeDraft}`}>
                    {p.status.toLowerCase()}
                  </span>
                </td>
                <td>
                  <div className={listStyles.actions}>
                    <Link href={`/admin/landing-pages/${p.id}`} className={listStyles.actionBtn}>
                      Edit
                    </Link>
                    <button className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`} onClick={() => setPendingDelete(p)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items?.length ?? 0) === 0 && <div className={listStyles.empty}>No landing pages yet.</div>}
      </div>

      <Modal open={creating} title="New Landing Page" onClose={() => setCreating(false)}>
        <form onSubmit={createPage}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="landing-page-title">Title</label>
            <input
              id="landing-page-title"
              className={formStyles.input}
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="landing-page-slug">Slug (/{slug || "…"})</label>
            <input
              id="landing-page-slug"
              className={formStyles.input}
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </div>
          <div className={formStyles.actions}>
            <button type="button" className={formStyles.cancelBtn} onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button type="submit" className={formStyles.submitBtn}>
              Create
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete landing page"
        message={`Delete "${pendingDelete?.title}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/landing-pages/${pendingDelete.id}`, { method: "DELETE" });
          showToast("Landing page deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-landing-pages"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

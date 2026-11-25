"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import Modal from "@/components/admin/Modal";
import formStyles from "@/components/admin/Form.module.css";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type SeoMeta = {
  id: string;
  entityType: string;
  entityId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  keywords: string[];
  ogImage: string | null;
  twitterCard: string | null;
  robots: string | null;
};

const emptyForm = {
  entityType: "static",
  entityId: "",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  keywords: "",
  ogImage: "",
  twitterCard: "summary_large_image",
  robots: "index,follow",
};

export default function SeoManagerPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SeoMeta | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-seo"],
    queryFn: async () => {
      const res = await fetch("/api/admin/seo");
      return (await res.json()) as { items: SeoMeta[] };
    },
  });

  function openEdit(item: SeoMeta) {
    setForm({
      entityType: item.entityType,
      entityId: item.entityId,
      metaTitle: item.metaTitle ?? "",
      metaDescription: item.metaDescription ?? "",
      canonicalUrl: item.canonicalUrl ?? "",
      keywords: item.keywords.join(", "),
      ogImage: item.ogImage ?? "",
      twitterCard: item.twitterCard ?? "summary_large_image",
      robots: item.robots ?? "index,follow",
    });
    setEditing(item);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      entityType: form.entityType,
      entityId: form.entityId,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      canonicalUrl: form.canonicalUrl || undefined,
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      ogImage: form.ogImage || undefined,
      twitterCard: form.twitterCard || undefined,
      robots: form.robots,
    };
    const res = await fetch("/api/admin/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save SEO entry", "error");
      return;
    }
    showToast("SEO entry saved", "success");
    setEditing(null);
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["admin-seo"] });
  }

  const modalOpen = creating || !!editing;

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>SEO Manager</h1>
        <button
          className={pageStyles.primaryBtn}
          onClick={() => {
            setForm(emptyForm);
            setCreating(true);
          }}
        >
          + New SEO Entry
        </button>
      </div>

      <div className={listStyles.wrap}>
        <table className={listStyles.table}>
          <thead>
            <tr>
              <th>Entity</th>
              <th>Meta Title</th>
              <th>Robots</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((item) => (
              <tr key={item.id}>
                <td>
                  {item.entityType} / {item.entityId}
                </td>
                <td>{item.metaTitle ?? "—"}</td>
                <td>{item.robots}</td>
                <td>
                  <button className={listStyles.actionBtn} onClick={() => openEdit(item)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items?.length ?? 0) === 0 && <div className={listStyles.empty}>No SEO entries yet.</div>}
      </div>

      <Modal open={modalOpen} title={editing ? "Edit SEO Entry" : "New SEO Entry"} onClose={() => { setEditing(null); setCreating(false); }} wide>
        <form onSubmit={onSubmit}>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="seo-entity-type">Entity Type</label>
              <input id="seo-entity-type"
                className={formStyles.input}
                required
                disabled={!!editing}
                placeholder="static / course / blog / landing-page"
                value={form.entityType}
                onChange={(e) => setForm({ ...form, entityType: e.target.value })}
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="seo-entity-id-key">Entity ID / Key</label>
              <input id="seo-entity-id-key"
                className={formStyles.input}
                required
                disabled={!!editing}
                placeholder="home, resources, or a record id"
                value={form.entityId}
                onChange={(e) => setForm({ ...form, entityId: e.target.value })}
              />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="seo-meta-title">Meta Title</label>
            <input id="seo-meta-title" className={formStyles.input} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="seo-meta-description">Meta Description</label>
            <textarea id="seo-meta-description" className={formStyles.textarea} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="seo-canonical-url">Canonical URL</label>
              <input id="seo-canonical-url" className={formStyles.input} value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="seo-og-image-url">OG Image URL</label>
              <input id="seo-og-image-url" className={formStyles.input} value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="seo-twitter-card-type">Twitter Card Type</label>
              <select id="seo-twitter-card-type" className={formStyles.select} value={form.twitterCard} onChange={(e) => setForm({ ...form, twitterCard: e.target.value })}>
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="seo-robots">Robots</label>
              <select id="seo-robots" className={formStyles.select} value={form.robots} onChange={(e) => setForm({ ...form, robots: e.target.value })}>
                <option value="index,follow">index,follow</option>
                <option value="noindex,follow">noindex,follow</option>
                <option value="noindex,nofollow">noindex,nofollow</option>
              </select>
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="seo-keywords-comma-separated">Keywords (comma separated)</label>
            <input id="seo-keywords-comma-separated" className={formStyles.input} value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
          </div>
          <div className={formStyles.actions}>
            <button type="button" className={formStyles.cancelBtn} onClick={() => { setEditing(null); setCreating(false); }}>
              Cancel
            </button>
            <button type="submit" className={formStyles.submitBtn} disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

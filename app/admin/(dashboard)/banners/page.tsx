"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import formStyles from "@/components/admin/Form.module.css";
import UrlField from "@/components/admin/UrlField";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type Banner = {
  id: string;
  name: string;
  desktopImage: string;
  mobileImage: string | null;
  headline: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  backgroundColor: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const emptyForm = {
  name: "",
  desktopImage: "",
  mobileImage: "",
  headline: "",
  subheading: "",
  ctaLabel: "",
  ctaHref: "",
  backgroundColor: "",
  status: "DRAFT" as const,
};

export default function BannersPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await fetch("/api/admin/banners");
      return (await res.json()) as { items: Banner[] };
    },
  });

  function openEdit(b: Banner) {
    setForm({
      name: b.name,
      desktopImage: b.desktopImage,
      mobileImage: b.mobileImage ?? "",
      headline: b.headline ?? "",
      subheading: b.subheading ?? "",
      ctaLabel: b.ctaLabel ?? "",
      ctaHref: b.ctaHref ?? "",
      backgroundColor: b.backgroundColor ?? "",
      status: b.status as "DRAFT",
    });
    setEditing(b);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name,
      desktopImage: form.desktopImage,
      mobileImage: form.mobileImage || undefined,
      headline: form.headline || undefined,
      subheading: form.subheading || undefined,
      ctaLabel: form.ctaLabel || undefined,
      ctaHref: form.ctaHref || undefined,
      backgroundColor: form.backgroundColor || undefined,
      status: form.status,
    };
    const url = editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save banner", "error");
      return;
    }
    showToast(editing ? "Banner updated" : "Banner created", "success");
    setEditing(null);
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  const modalOpen = creating || !!editing;

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Banners</h1>
        <button
          className={pageStyles.primaryBtn}
          onClick={() => {
            setForm(emptyForm);
            setCreating(true);
          }}
        >
          + New Banner
        </button>
      </div>

      <div className={listStyles.wrap}>
        <table className={listStyles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Headline</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.headline ?? "—"}</td>
                <td>
                  <span className={`${listStyles.badge} ${b.status === "PUBLISHED" ? listStyles.badgePublished : listStyles.badgeDraft}`}>
                    {b.status.toLowerCase()}
                  </span>
                </td>
                <td>
                  <div className={listStyles.actions}>
                    <button className={listStyles.actionBtn} onClick={() => openEdit(b)}>
                      Edit
                    </button>
                    <button className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`} onClick={() => setPendingDelete(b)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items?.length ?? 0) === 0 && <div className={listStyles.empty}>No banners yet.</div>}
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Banner" : "New Banner"} onClose={() => { setEditing(null); setCreating(false); }} wide>
        <form onSubmit={onSubmit}>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="banner-name">Name</label>
              <input id="banner-name" className={formStyles.input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="banner-status">Status</label>
              <select id="banner-status" className={formStyles.select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as never })}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className={formStyles.grid2}>
            <UrlField
          id="banner-desktop-image-url"
          label="Desktop Image URL"
          value={form.desktopImage}
          onChange={(v) => setForm({ ...form, desktopImage: v })}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
          required
        />
            <UrlField
          id="banner-mobile-image-url"
          label="Mobile Image URL"
          value={form.mobileImage}
          onChange={(v) => setForm({ ...form, mobileImage: v })}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
        />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="banner-headline">Headline</label>
            <input id="banner-headline" className={formStyles.input} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="banner-subheading">Subheading</label>
            <input id="banner-subheading" className={formStyles.input} value={form.subheading} onChange={(e) => setForm({ ...form, subheading: e.target.value })} />
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="banner-cta-label">CTA Label</label>
              <input id="banner-cta-label" className={formStyles.input} value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="banner-cta-link">CTA Link</label>
              <input id="banner-cta-link" className={formStyles.input} value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="banner-background-color">Background Color</label>
            <input id="banner-background-color" className={formStyles.input} placeholder="#101010" value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })} />
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

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete banner"
        message={`Delete "${pendingDelete?.name}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/banners/${pendingDelete.id}`, { method: "DELETE" });
          showToast("Banner deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

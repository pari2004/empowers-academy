"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import SortableList from "@/components/admin/SortableList";
import formStyles from "@/components/admin/Form.module.css";
import UrlField from "@/components/admin/UrlField";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type Testimonial = {
  id: string;
  studentName: string;
  company: string | null;
  designation: string | null;
  review: string;
  rating: number;
  image: string | null;
  videoUrl: string | null;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  order: number;
};

const emptyForm = {
  studentName: "",
  company: "",
  designation: "",
  review: "",
  rating: 5,
  image: "",
  videoUrl: "",
  featured: false,
  status: "PUBLISHED" as const,
};

export default function TestimonialsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to load testimonials");
      return res.json() as Promise<{ items: Testimonial[] }>;
    },
  });

  function openCreate() {
    setForm(emptyForm);
    setCreating(true);
  }

  function openEdit(t: Testimonial) {
    setForm({
      studentName: t.studentName,
      company: t.company ?? "",
      designation: t.designation ?? "",
      review: t.review,
      rating: t.rating,
      image: t.image ?? "",
      videoUrl: t.videoUrl ?? "",
      featured: t.featured,
      status: t.status as "PUBLISHED",
    });
    setEditing(t);
  }

  async function handleReorder(next: Testimonial[]) {
    queryClient.setQueryData(["admin-testimonials"], { items: next });
    await fetch("/api/admin/testimonials/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((t) => t.id) }),
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      studentName: form.studentName,
      company: form.company || undefined,
      designation: form.designation || undefined,
      review: form.review,
      rating: Number(form.rating),
      image: form.image || undefined,
      videoUrl: form.videoUrl || undefined,
      featured: form.featured,
      status: form.status,
    };

    const url = editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save testimonial", "error");
      return;
    }

    showToast(editing ? "Testimonial updated" : "Testimonial created", "success");
    setEditing(null);
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
  }

  const modalOpen = creating || !!editing;

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Testimonials</h1>
        <button className={pageStyles.primaryBtn} onClick={openCreate}>
          + New Testimonial
        </button>
      </div>

      <SortableList
        items={data?.items ?? []}
        onReorder={handleReorder}
        renderItem={(t) => (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{t.studentName}</strong>
              {t.company && <span style={{ color: "var(--adm-text-faint)" }}> · {t.company}</span>}
              {t.featured && (
                <span className={listStyles.badge} style={{ marginLeft: 8, background: "var(--adm-primary-soft)", color: "var(--adm-primary)" }}>
                  Featured
                </span>
              )}
            </div>
            <div className={listStyles.actions}>
              <button className={listStyles.actionBtn} onClick={() => openEdit(t)}>
                Edit
              </button>
              <button className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`} onClick={() => setPendingDelete(t)}>
                Delete
              </button>
            </div>
          </div>
        )}
      />

      <Modal open={modalOpen} title={editing ? "Edit Testimonial" : "New Testimonial"} onClose={() => { setEditing(null); setCreating(false); }}>
        <form onSubmit={onSubmit}>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="testimonial-student-name">Student Name</label>
              <input id="testimonial-student-name" className={formStyles.input} required value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="testimonial-company">Company</label>
              <input id="testimonial-company" className={formStyles.input} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="testimonial-designation">Designation</label>
            <input id="testimonial-designation" className={formStyles.input} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="testimonial-review">Review</label>
            <textarea id="testimonial-review" className={formStyles.textarea} required value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="testimonial-rating-1-5">Rating (1-5)</label>
              <input id="testimonial-rating-1-5"
                type="number"
                min={1}
                max={5}
                className={formStyles.input}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="testimonial-status">Status</label>
              <select id="testimonial-status" className={formStyles.select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as never })}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className={formStyles.grid2}>
            <UrlField
          id="testimonial-image-url"
          label="Image URL"
          value={form.image}
          onChange={(v) => setForm({ ...form, image: v })}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
        />
            <UrlField
          id="testimonial-video-url"
          label="Video URL"
          value={form.videoUrl}
          onChange={(v) => setForm({ ...form, videoUrl: v })}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
        />
          </div>
          <label className={formStyles.checkboxRow}>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured testimonial
          </label>
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
        title="Delete testimonial"
        message={`Delete testimonial from "${pendingDelete?.studentName}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/testimonials/${pendingDelete.id}`, { method: "DELETE" });
          showToast("Testimonial deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

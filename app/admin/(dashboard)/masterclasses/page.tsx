"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import formStyles from "@/components/admin/Form.module.css";
import UrlField from "@/components/admin/UrlField";
import listStyles from "@/components/admin/DataTable.module.css";
import itemStyles from "@/components/admin/SortableList.module.css";
import pageStyles from "../module-list.module.css";

type Masterclass = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  instructorId: string | null;
  instructor: { id: string; name: string } | null;
  courseId: string | null;
  course: { id: string; title: string } | null;
  scheduledAt: string;
  durationMinutes: number | null;
  meetingLink: string | null;
  capacity: number | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
};

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  coverImage: "",
  instructorId: "",
  courseId: "",
  scheduledAt: "",
  durationMinutes: "",
  meetingLink: "",
  capacity: "",
  status: "DRAFT" as "DRAFT" | "PUBLISHED" | "CANCELLED",
};

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MasterclassesPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Masterclass | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Masterclass | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-masterclasses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/masterclasses");
      if (!res.ok) throw new Error("Failed to load masterclasses");
      return res.json() as Promise<{ items: Masterclass[] }>;
    },
  });

  const { data: instructorData } = useQuery({
    queryKey: ["admin-instructors-options"],
    queryFn: async () => {
      const res = await fetch("/api/admin/instructors?pageSize=100");
      if (!res.ok) throw new Error("Failed to load instructors");
      return res.json() as Promise<{ items: { id: string; name: string }[] }>;
    },
  });

  const { data: courseData } = useQuery({
    queryKey: ["admin-courses-options"],
    queryFn: async () => {
      const res = await fetch("/api/admin/courses?pageSize=100");
      if (!res.ok) throw new Error("Failed to load courses");
      return res.json() as Promise<{ items: { id: string; title: string }[] }>;
    },
  });

  function openCreate() {
    setForm(emptyForm);
    setSlugTouched(false);
    setCreating(true);
  }

  function openEdit(m: Masterclass) {
    setForm({
      title: m.title,
      slug: m.slug,
      description: m.description,
      coverImage: m.coverImage ?? "",
      instructorId: m.instructorId ?? "",
      courseId: m.courseId ?? "",
      scheduledAt: toDatetimeLocal(m.scheduledAt),
      durationMinutes: m.durationMinutes?.toString() ?? "",
      meetingLink: m.meetingLink ?? "",
      capacity: m.capacity?.toString() ?? "",
      status: m.status,
    });
    setSlugTouched(true);
    setEditing(m);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      coverImage: form.coverImage || undefined,
      instructorId: form.instructorId || undefined,
      courseId: form.courseId || undefined,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
      meetingLink: form.meetingLink || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      status: form.status,
    };

    const url = editing ? `/api/admin/masterclasses/${editing.id}` : "/api/admin/masterclasses";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save masterclass", "error");
      return;
    }

    showToast(editing ? "Masterclass updated" : "Masterclass created", "success");
    setEditing(null);
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["admin-masterclasses"] });
  }

  const modalOpen = creating || !!editing;

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Masterclasses</h1>
        <button className={pageStyles.primaryBtn} onClick={openCreate}>
          + New Masterclass
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(data?.items ?? []).map((m) => (
          <div key={m.id} className={itemStyles.item} style={{ justifyContent: "space-between" }}>
            <div>
              <strong>{m.title}</strong>
              <span style={{ color: "var(--adm-text-faint)" }}> · {new Date(m.scheduledAt).toLocaleString("en-IN")}</span>
              {m.instructor && <span style={{ color: "var(--adm-text-faint)" }}> · {m.instructor.name}</span>}
              <span
                className={listStyles.badge}
                style={{
                  marginLeft: 8,
                  background: m.status === "PUBLISHED" ? "var(--adm-primary-soft)" : "var(--adm-surface-2)",
                  color: m.status === "PUBLISHED" ? "var(--adm-primary)" : "var(--adm-text-faint)",
                }}
              >
                {m.status}
              </span>
            </div>
            <div className={listStyles.actions}>
              <button className={listStyles.actionBtn} onClick={() => openEdit(m)}>
                Edit
              </button>
              <button className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`} onClick={() => setPendingDelete(m)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {!data?.items.length && <p style={{ color: "var(--adm-text-faint)" }}>No masterclasses yet.</p>}
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Masterclass" : "New Masterclass"} onClose={() => { setEditing(null); setCreating(false); }} wide>
        <form onSubmit={onSubmit}>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="mc-title">Title</label>
              <input
                id="mc-title"
                className={formStyles.input}
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
                }}
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="mc-slug">Slug</label>
              <input
                id="mc-slug"
                className={formStyles.input}
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value });
                }}
              />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="mc-description">Description</label>
            <textarea id="mc-description" className={formStyles.textarea} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <UrlField
            id="mc-cover-image"
            label="Cover Image"
            value={form.coverImage}
            onChange={(v) => setForm({ ...form, coverImage: v })}
            hint="Internal = an uploaded file from Media. External = a URL on another site."
          />
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="mc-instructor">Instructor</label>
              <select id="mc-instructor" className={formStyles.select} value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })}>
                <option value="">None</option>
                {(instructorData?.items ?? []).map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="mc-course">Related Course</label>
              <select id="mc-course" className={formStyles.select} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                <option value="">None</option>
                {(courseData?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="mc-scheduled-at">Date &amp; Time</label>
              <input id="mc-scheduled-at" type="datetime-local" className={formStyles.input} required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="mc-duration">Duration (minutes)</label>
              <input id="mc-duration" type="number" min="0" className={formStyles.input} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="mc-meeting-link">Meeting Link</label>
              <input id="mc-meeting-link" className={formStyles.input} placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="mc-capacity">Capacity (seats)</label>
              <input id="mc-capacity" type="number" min="0" className={formStyles.input} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="mc-status">Status</label>
            <select id="mc-status" className={formStyles.select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as never })}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
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
        title="Delete masterclass"
        message={`Delete "${pendingDelete?.title}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/masterclasses/${pendingDelete.id}`, { method: "DELETE" });
          showToast("Masterclass deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-masterclasses"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

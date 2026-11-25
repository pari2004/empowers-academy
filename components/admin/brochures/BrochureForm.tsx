"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import formStyles from "@/components/admin/Form.module.css";

type Category = { id: string; name: string };
type Course = { id: string; title: string };

export type BrochureFormValues = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  categoryId: string;
  courseId: string;
  tags: string;
  downloadButtonText: string;
  featured: boolean;
  order: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string;
};

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const linesToArray = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

export default function BrochureForm({
  brochureId,
  initialValues,
}: {
  brochureId?: string;
  initialValues?: Partial<BrochureFormValues>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [slugTouched, setSlugTouched] = useState(!!initialValues?.slug);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<BrochureFormValues>({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    thumbnail: "",
    fileUrl: "",
    fileName: "",
    fileSize: null,
    categoryId: "",
    courseId: "",
    tags: "",
    downloadButtonText: "Download Brochure",
    featured: false,
    order: 0,
    status: "DRAFT",
    publishedAt: "",
    ...initialValues,
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-brochure-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/brochure-categories");
      return (await res.json()) as { items: Category[] };
    },
  });
  const { data: courses } = useQuery({
    queryKey: ["admin-courses-picker"],
    queryFn: async () => {
      const res = await fetch("/api/admin/courses?pageSize=200");
      if (!res.ok) throw new Error("Failed to load courses");
      return (await res.json()) as { items: Course[] };
    },
  });

  function set<K extends keyof BrochureFormValues>(key: K, val: BrochureFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/admin/brochure-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    const created = await res.json();
    setNewCategory("");
    queryClient.invalidateQueries({ queryKey: ["admin-brochure-categories"] });
    set("categoryId", created.id);
  }

  async function handlePdfUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    const presignRes = await fetch("/api/admin/media/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, mimeType: file.type || "application/pdf", size: file.size }),
    });
    if (!presignRes.ok) {
      const body = await presignRes.json().catch(() => ({}));
      showToast(body.error ?? "Upload failed", "error");
      setUploading(false);
      return;
    }
    const { uploadUrl, publicUrl } = await presignRes.json();
    const putRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/pdf" } });
    setUploading(false);
    if (!putRes.ok) {
      showToast(`Failed to upload ${file.name}`, "error");
      return;
    }
    setValues((prev) => ({ ...prev, fileUrl: publicUrl, fileName: file.name, fileSize: file.size }));
    showToast("PDF uploaded", "success");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function buildPayload() {
    return {
      title: values.title,
      slug: values.slug,
      shortDescription: values.shortDescription || undefined,
      description: values.description || undefined,
      thumbnail: values.thumbnail || undefined,
      fileUrl: values.fileUrl,
      fileName: values.fileName || undefined,
      fileSize: values.fileSize ?? undefined,
      categoryId: values.categoryId || undefined,
      courseId: values.courseId || undefined,
      tags: linesToArray(values.tags),
      downloadButtonText: values.downloadButtonText || undefined,
      featured: values.featured,
      order: values.order,
      status: values.status,
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.fileUrl) {
      showToast("Please upload a PDF file", "error");
      return;
    }
    setSubmitting(true);
    const res = await fetch(brochureId ? `/api/admin/brochures/${brochureId}` : "/api/admin/brochures", {
      method: brochureId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save brochure", "error");
      return;
    }

    showToast(brochureId ? "Brochure updated" : "Brochure created", "success");
    router.push("/admin/brochures");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Basics</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="brochure-title">Title</label>
            <input id="brochure-title"
              className={formStyles.input}
              required
              value={values.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="brochure-slug">Slug</label>
            <input id="brochure-slug"
              className={formStyles.input}
              required
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="brochure-short-description">Short Description</label>
          <input id="brochure-short-description" className={formStyles.input} value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="brochure-full-description">Full Description</label>
          <textarea id="brochure-full-description" className={formStyles.textarea} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Files</h2>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="brochure-thumbnail-url">Thumbnail URL</label>
          <input id="brochure-thumbnail-url" className={formStyles.input} value={values.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>PDF File</label>
          {values.fileUrl && (
            <p className={formStyles.hint}>
              Current: <a href={values.fileUrl} target="_blank" rel="noopener noreferrer">{values.fileName || values.fileUrl}</a>
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => handlePdfUpload(e.target.files?.[0] ?? null)}
            disabled={uploading}
          />
          {uploading && <p className={formStyles.hint}>Uploading…</p>}
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="brochure-download-button-text">Download Button Text</label>
          <input id="brochure-download-button-text" className={formStyles.input} value={values.downloadButtonText} onChange={(e) => set("downloadButtonText", e.target.value)} />
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Organization</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="brochure-category">Category</label>
            <select id="brochure-category" className={formStyles.select} value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">None</option>
              {(categories?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input className={formStyles.input} placeholder="New category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              <button type="button" className={formStyles.cancelBtn} onClick={addCategory}>
                Add
              </button>
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="brochure-course">Course</label>
            <select id="brochure-course" className={formStyles.select} value={values.courseId} onChange={(e) => set("courseId", e.target.value)}>
              <option value="">None</option>
              {(courses?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="brochure-tags">Tags (one per line)</label>
          <textarea id="brochure-tags" className={formStyles.textarea} value={values.tags} onChange={(e) => set("tags", e.target.value)} />
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Publishing</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="brochure-status">Status</label>
            <select id="brochure-status" className={formStyles.select} value={values.status} onChange={(e) => set("status", e.target.value as never)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="brochure-publish-date">Publish Date (leave blank for now)</label>
            <input id="brochure-publish-date"
              type="datetime-local"
              className={formStyles.input}
              value={values.publishedAt}
              onChange={(e) => set("publishedAt", e.target.value)}
            />
          </div>
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="brochure-order">Display Order</label>
            <input id="brochure-order" type="number" className={formStyles.input} value={values.order} onChange={(e) => set("order", Number(e.target.value))} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.checkboxRow} htmlFor="brochure-featured">
              <input id="brochure-featured" type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured brochure
            </label>
          </div>
        </div>
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={() => router.push("/admin/brochures")}>
          Cancel
        </button>
        <button type="submit" className={formStyles.submitBtn} disabled={submitting || uploading}>
          {submitting ? "Saving…" : brochureId ? "Save Changes" : "Create Brochure"}
        </button>
      </div>
    </form>
  );
}

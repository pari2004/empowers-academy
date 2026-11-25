"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Block } from "@/lib/resources";
import formStyles from "@/components/admin/Form.module.css";
import UrlField from "@/components/admin/UrlField";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

export type BlogFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  body: Block[];
  categoryId: string;
  tagIds: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string;
};

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BlogForm({
  blogId,
  initialValues,
}: {
  blogId?: string;
  initialValues?: Partial<BlogFormValues>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [slugTouched, setSlugTouched] = useState(!!initialValues?.slug);
  const [submitting, setSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [values, setValues] = useState<BlogFormValues>({
    title: "",
    slug: "",
    excerpt: "",
    featuredImage: "",
    body: [],
    categoryId: "",
    tagIds: [],
    status: "DRAFT",
    publishedAt: "",
    ...initialValues,
  });
  const dirtyRef = useRef(false);

  const { data: categories } = useQuery({
    queryKey: ["admin-blog-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blog-categories");
      return (await res.json()) as { items: Category[] };
    },
  });
  const { data: tags } = useQuery({
    queryKey: ["admin-blog-tags"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blog-tags");
      return (await res.json()) as { items: Tag[] };
    },
  });

  function set<K extends keyof BlogFormValues>(key: K, val: BlogFormValues[K]) {
    dirtyRef.current = true;
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function buildPayload() {
    return {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt || undefined,
      featuredImage: values.featuredImage || undefined,
      body: values.body,
      categoryId: values.categoryId || undefined,
      tagIds: values.tagIds,
      status: values.status,
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
    };
  }

  // Auto-save: only once a post already exists — silently PATCHes every 4s while dirty.
  useEffect(() => {
    if (!blogId) return;
    const interval = setInterval(async () => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      await fetch(`/api/admin/blog/${blogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId, values]);

  async function addCategory() {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/admin/blog-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    const created = await res.json();
    setNewCategory("");
    queryClient.invalidateQueries({ queryKey: ["admin-blog-categories"] });
    set("categoryId", created.id);
  }

  async function addTag() {
    if (!newTag.trim()) return;
    const res = await fetch("/api/admin/blog-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag.trim() }),
    });
    const created = await res.json();
    setNewTag("");
    queryClient.invalidateQueries({ queryKey: ["admin-blog-tags"] });
    set("tagIds", [...values.tagIds, created.id]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(blogId ? `/api/admin/blog/${blogId}` : "/api/admin/blog", {
      method: blogId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save post", "error");
      return;
    }

    showToast(blogId ? "Post updated" : "Post created", "success");
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.card}>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="blog-title">Title</label>
            <input id="blog-title"
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
            <label className={formStyles.label} htmlFor="blog-slug">Slug</label>
            <input id="blog-slug"
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
          <label className={formStyles.label} htmlFor="blog-excerpt">Excerpt</label>
          <textarea id="blog-excerpt" className={formStyles.textarea} value={values.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </div>
        <UrlField
          id="blog-featured-image-url"
          label="Featured Image URL"
          value={values.featuredImage}
          onChange={(v) => set("featuredImage", v)}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
        />
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Content</h2>
        <RichTextEditor value={values.body} onChange={(body) => set("body", body)} />
      </div>

      <div className={formStyles.card}>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="blog-category">Category</label>
            <select id="blog-category" className={formStyles.select} value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
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
            <label className={formStyles.label}>Tags</label>
            <div className={formStyles.checkboxGrid}>
              {(tags?.items ?? []).map((t) => (
                <label key={t.id} className={formStyles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={values.tagIds.includes(t.id)}
                    onChange={() =>
                      set("tagIds", values.tagIds.includes(t.id) ? values.tagIds.filter((x) => x !== t.id) : [...values.tagIds, t.id])
                    }
                  />
                  {t.name}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input className={formStyles.input} placeholder="New tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
              <button type="button" className={formStyles.cancelBtn} onClick={addTag}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={formStyles.card}>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="blog-status">Status</label>
            <select id="blog-status" className={formStyles.select} value={values.status} onChange={(e) => set("status", e.target.value as never)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="blog-publish-date-leave-blank-for-now">Publish Date (leave blank for now)</label>
            <input id="blog-publish-date-leave-blank-for-now"
              type="datetime-local"
              className={formStyles.input}
              value={values.publishedAt}
              onChange={(e) => set("publishedAt", e.target.value)}
            />
            <p className={formStyles.hint}>A future date + Published status schedules the post — it won&apos;t appear publicly until then.</p>
          </div>
        </div>
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={() => router.push("/admin/blog")}>
          Cancel
        </button>
        <button type="submit" className={formStyles.submitBtn} disabled={submitting}>
          {submitting ? "Saving…" : blogId ? "Save Changes" : "Create Post"}
        </button>
      </div>
    </form>
  );
}

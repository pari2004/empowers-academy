"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import SortableList from "@/components/admin/SortableList";
import formStyles from "@/components/admin/Form.module.css";
import UrlField from "@/components/admin/UrlField";

type Instructor = { id: string; name: string; designation: string };
type CurriculumRow = { id: string; title: string };

export type CourseFormValues = {
  title: string;
  slug: string;
  category: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  coverImage: string;
  duration: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  language: string;
  price: string;
  discountPrice: string;
  gstRate?: string;
  gstText?: string;
  tags: string;
  learningOutcomes: string;
  requirements: string;
  toolsCovered: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  instructorIds: string[];
  curriculum: CurriculumRow[];
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const linesToArray = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

export default function CourseForm({
  courseId,
  initialValues,
}: {
  courseId?: string;
  initialValues?: Partial<CourseFormValues>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [slugTouched, setSlugTouched] = useState(!!initialValues?.slug);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<CourseFormValues>({
    title: "",
    slug: "",
    category: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    coverImage: "",
    duration: "",
    level: "ALL_LEVELS",
    language: "English",
    price: "",
    discountPrice: "",
    gstRate: "18",
    gstText: "+ 18% GST",
    tags: "",
    learningOutcomes: "",
    requirements: "",
    toolsCovered: "",
    status: "DRAFT",
    instructorIds: [],
    curriculum: [],
    ...initialValues,
  });

  const { data: instructorsData } = useQuery({
    queryKey: ["admin-instructors-picker"],
    queryFn: async () => {
      const res = await fetch("/api/admin/instructors?pageSize=100");
      if (!res.ok) throw new Error("Failed to load instructors");
      return res.json() as Promise<{ items: Instructor[] }>;
    },
  });

  function set<K extends keyof CourseFormValues>(key: K, val: CourseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function toggleInstructor(id: string) {
    setValues((prev) => ({
      ...prev,
      instructorIds: prev.instructorIds.includes(id)
        ? prev.instructorIds.filter((x) => x !== id)
        : [...prev.instructorIds, id],
    }));
  }

  function addCurriculumRow() {
    setValues((prev) => ({
      ...prev,
      curriculum: [...prev.curriculum, { id: `new-${Date.now()}`, title: "" }],
    }));
  }

  function updateCurriculumRow(id: string, title: string) {
    setValues((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((row) => (row.id === id ? { ...row, title } : row)),
    }));
  }

  function removeCurriculumRow(id: string) {
    setValues((prev) => ({ ...prev, curriculum: prev.curriculum.filter((row) => row.id !== id) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title: values.title,
      slug: values.slug,
      category: values.category || undefined,
      description: values.description,
      shortDescription: values.shortDescription || undefined,
      thumbnail: values.thumbnail || undefined,
      coverImage: values.coverImage || undefined,
      duration: values.duration || undefined,
      level: values.level,
      language: values.language,
      price: values.price ? Number(values.price) : undefined,
      discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
      tags: linesToArray(values.tags),
      learningOutcomes: linesToArray(values.learningOutcomes),
      requirements: linesToArray(values.requirements),
      toolsCovered: linesToArray(values.toolsCovered),
      status: values.status,
      instructorIds: values.instructorIds,
      curriculum: values.curriculum
        .filter((row) => row.title.trim())
        .map((row, index) => ({ title: row.title, order: index, lessons: [] })),
    };

    const res = await fetch(courseId ? `/api/admin/courses/${courseId}` : "/api/admin/courses", {
      method: courseId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save course", "error");
      return;
    }

    showToast(courseId ? "Course updated" : "Course created", "success");
    router.push("/admin/courses");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Basics</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-title">Title</label>
            <input
              id="course-title"
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
            <label className={formStyles.label} htmlFor="course-slug">Slug</label>
            <input id="course-slug"
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
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-category">Category</label>
            <input id="course-category" className={formStyles.input} value={values.category} onChange={(e) => set("category", e.target.value)} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-status">Status</label>
            <select id="course-status"
              className={formStyles.select}
              value={values.status}
              onChange={(e) => set("status", e.target.value as CourseFormValues["status"])}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="course-short-description">Short Description</label>
          <input id="course-short-description"
            className={formStyles.input}
            value={values.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
          />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="course-description">Description</label>
          <textarea
            id="course-description"
            className={formStyles.textarea}
            required
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Media & Format</h2>
        <div className={formStyles.grid2}>
          <UrlField
          id="course-thumbnail-url"
          label="Thumbnail URL"
          value={values.thumbnail}
          onChange={(v) => set("thumbnail", v)}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
        />
          <UrlField
          id="course-cover-image-url"
          label="Cover Image URL"
          value={values.coverImage}
          onChange={(v) => set("coverImage", v)}
          hint="Internal = an uploaded file from Media. External = a URL on another site."
        />
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-duration">Duration</label>
            <input id="course-duration" className={formStyles.input} value={values.duration} onChange={(e) => set("duration", e.target.value)} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-level">Level</label>
            <select id="course-level" className={formStyles.select} value={values.level} onChange={(e) => set("level", e.target.value as CourseFormValues["level"])}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ALL_LEVELS">All Levels</option>
            </select>
          </div>
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-language">Language</label>
            <input id="course-language" className={formStyles.input} value={values.language} onChange={(e) => set("language", e.target.value)} />
          </div>
          <div />
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-price">Price (₹)</label>
            <input id="course-price" type="number" min="0" className={formStyles.input} value={values.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-discount-price">Discount Price (₹)</label>
            <input id="course-discount-price"
              type="number"
              min="0"
              className={formStyles.input}
              value={values.discountPrice}
              onChange={(e) => set("discountPrice", e.target.value)}
            />
          </div>
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-gst-rate">GST Rate (%)</label>
            <input
              id="course-gst-rate"
              type="number"
              min="0"
              placeholder="18"
              className={formStyles.input}
              value={values.gstRate ?? "18"}
              onChange={(e) => set("gstRate", e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary, #888)", marginTop: "4px" }}>
              Standard GST rate (e.g. 18 for +18% GST)
            </span>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-gst-text">GST Display Text</label>
            <input
              id="course-gst-text"
              type="text"
              placeholder="+ 18% GST"
              className={formStyles.input}
              value={values.gstText ?? "+ 18% GST"}
              onChange={(e) => set("gstText", e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary, #888)", marginTop: "4px" }}>
              Displayed next to the fee on cards and course pages
            </span>
          </div>
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Details (one per line)</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-tags">Tags</label>
            <textarea id="course-tags" className={formStyles.textarea} value={values.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-tools-covered">Tools Covered</label>
            <textarea id="course-tools-covered" className={formStyles.textarea} value={values.toolsCovered} onChange={(e) => set("toolsCovered", e.target.value)} />
          </div>
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-learning-outcomes">Learning Outcomes</label>
            <textarea id="course-learning-outcomes"
              className={formStyles.textarea}
              value={values.learningOutcomes}
              onChange={(e) => set("learningOutcomes", e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="course-requirements">Requirements</label>
            <textarea id="course-requirements" className={formStyles.textarea} value={values.requirements} onChange={(e) => set("requirements", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Instructors</h2>
        <div className={formStyles.checkboxGrid}>
          {(instructorsData?.items ?? []).map((instructor) => (
            <label key={instructor.id} className={formStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={values.instructorIds.includes(instructor.id)}
                onChange={() => toggleInstructor(instructor.id)}
              />
              {instructor.name}
            </label>
          ))}
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Curriculum</h2>
        <SortableList
          items={values.curriculum}
          onReorder={(next) => set("curriculum", next)}
          renderItem={(row) => (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className={formStyles.input}
                placeholder="Section title"
                value={row.title}
                onChange={(e) => updateCurriculumRow(row.id, e.target.value)}
              />
              <button type="button" className={formStyles.cancelBtn} onClick={() => removeCurriculumRow(row.id)}>
                Remove
              </button>
            </div>
          )}
        />
        <button type="button" className={formStyles.cancelBtn} onClick={addCurriculumRow}>
          + Add Section
        </button>
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={() => router.push("/admin/courses")}>
          Cancel
        </button>
        <button type="submit" className={formStyles.submitBtn} disabled={submitting}>
          {submitting ? "Saving…" : courseId ? "Save Changes" : "Create Course"}
        </button>
      </div>
    </form>
  );
}

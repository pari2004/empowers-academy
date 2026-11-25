"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ToastProvider";
import formStyles from "@/components/admin/Form.module.css";
import UrlField from "@/components/admin/UrlField";

export type InstructorFormValues = {
  name: string;
  slug: string;
  designation: string;
  bio: string;
  skills: string;
  experience: string;
  profileImage: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function InstructorForm({
  instructorId,
  initialValues,
}: {
  instructorId?: string;
  initialValues?: Partial<InstructorFormValues>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [slugTouched, setSlugTouched] = useState(!!initialValues?.slug);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<InstructorFormValues>({
    name: "",
    slug: "",
    designation: "",
    bio: "",
    skills: "",
    experience: "",
    profileImage: "",
    featured: false,
    status: "DRAFT",
    ...initialValues,
  });

  function set<K extends keyof InstructorFormValues>(key: K, val: InstructorFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: values.name,
      slug: values.slug,
      designation: values.designation,
      bio: values.bio,
      skills: values.skills.split("\n").map((s) => s.trim()).filter(Boolean),
      experience: values.experience || undefined,
      profileImage: values.profileImage || undefined,
      featured: values.featured,
      status: values.status,
    };

    const res = await fetch(instructorId ? `/api/admin/instructors/${instructorId}` : "/api/admin/instructors", {
      method: instructorId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save instructor", "error");
      return;
    }

    showToast(instructorId ? "Instructor updated" : "Instructor created", "success");
    router.push("/admin/instructors");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.card}>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="instructor-name">Name</label>
            <input id="instructor-name"
              className={formStyles.input}
              required
              value={values.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="instructor-slug">Slug</label>
            <input id="instructor-slug"
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
          <label className={formStyles.label} htmlFor="instructor-designation">Designation</label>
          <input id="instructor-designation" className={formStyles.input} required value={values.designation} onChange={(e) => set("designation", e.target.value)} />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="instructor-biography">Biography</label>
          <textarea id="instructor-biography" className={formStyles.textarea} required value={values.bio} onChange={(e) => set("bio", e.target.value)} />
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="instructor-skills-one-per-line">Skills (one per line)</label>
            <textarea id="instructor-skills-one-per-line" className={formStyles.textarea} value={values.skills} onChange={(e) => set("skills", e.target.value)} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="instructor-experience">Experience</label>
            <input id="instructor-experience" className={formStyles.input} value={values.experience} onChange={(e) => set("experience", e.target.value)} />
          </div>
        </div>
        <UrlField
          id="instructor-profile-image-url"
          label="Profile Image URL"
          value={values.profileImage}
          onChange={(v) => set("profileImage", v)}
          hint="Pick Internal for an uploaded image from Media, or External for a URL elsewhere."
        />
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="instructor-status">Status</label>
            <select id="instructor-status"
              className={formStyles.select}
              value={values.status}
              onChange={(e) => set("status", e.target.value as InstructorFormValues["status"])}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <label className={formStyles.checkboxRow} style={{ marginTop: 28 }}>
            <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured instructor
          </label>
        </div>
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={() => router.push("/admin/instructors")}>
          Cancel
        </button>
        <button type="submit" className={formStyles.submitBtn} disabled={submitting}>
          {submitting ? "Saving…" : instructorId ? "Save Changes" : "Create Instructor"}
        </button>
      </div>
    </form>
  );
}

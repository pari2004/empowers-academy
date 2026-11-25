"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ToastProvider";
import SortableList from "@/components/admin/SortableList";
import formStyles from "@/components/admin/Form.module.css";

type ProjectRow = { id: string; title: string; description: string };

export type ProgrammeDetailFormValues = {
  heroBanner: string;
  heroImage: string;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  eligibility: string;
  certification: string;
  emiAvailable: boolean;
  emiDetails: string;
  scholarshipInfo: string;
  admissionOpen: boolean;
  overview: string;
  highlights: string;
  careerOpportunities: string;
  placementSupport: string;
  placementRate: string;
  avgSalaryHikePct: string;
  avgPackageLpa: string;
  courseFee?: string;
  gstRate?: string;
  gstText?: string;
  badge?: string;
  projects: ProjectRow[];
  galleryImages: string;
  videoUrl: string;
  curriculumUrl: string;
  applyCtaLabel: string;
  applyCtaHref: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string;
};

const linesToArray = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

export default function ProgrammeDetailForm({
  courseId,
  courseTitle,
  courseSlug,
  initialValues,
}: {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  initialValues?: Partial<ProgrammeDetailFormValues>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<ProgrammeDetailFormValues>({
    heroBanner: "",
    heroImage: "",
    mode: "ONLINE",
    eligibility: "",
    certification: "",
    emiAvailable: false,
    emiDetails: "",
    scholarshipInfo: "",
    admissionOpen: true,
    overview: "",
    highlights: "",
    careerOpportunities: "",
    placementSupport: "",
    placementRate: "",
    avgSalaryHikePct: "",
    avgPackageLpa: "",
    courseFee: "",
    gstRate: "18",
    gstText: "+ 18% GST",
    badge: "",
    projects: [],
    galleryImages: "",
    videoUrl: "",
    curriculumUrl: "",
    applyCtaLabel: "Apply Now",
    applyCtaHref: "",
    status: "DRAFT",
    publishedAt: "",
    ...initialValues,
  });

  function set<K extends keyof ProgrammeDetailFormValues>(key: K, val: ProgrammeDetailFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function addProject() {
    setValues((prev) => ({ ...prev, projects: [...prev.projects, { id: `new-${Date.now()}`, title: "", description: "" }] }));
  }

  function updateProject(id: string, patch: Partial<ProjectRow>) {
    setValues((prev) => ({ ...prev, projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }

  function removeProject(id: string) {
    setValues((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      heroBanner: values.heroBanner || undefined,
      heroImage: values.heroImage || undefined,
      mode: values.mode,
      eligibility: values.eligibility || undefined,
      certification: values.certification || undefined,
      emiAvailable: values.emiAvailable,
      emiDetails: values.emiDetails || undefined,
      scholarshipInfo: values.scholarshipInfo || undefined,
      admissionOpen: values.admissionOpen,
      overview: values.overview || undefined,
      highlights: linesToArray(values.highlights),
      careerOpportunities: linesToArray(values.careerOpportunities),
      placementSupport: values.placementSupport || undefined,
      placementRate: values.placementRate ? Number(values.placementRate) : undefined,
      avgSalaryHikePct: values.avgSalaryHikePct ? Number(values.avgSalaryHikePct) : undefined,
      avgPackageLpa: values.avgPackageLpa ? Number(values.avgPackageLpa) : undefined,
      projects: values.projects.filter((p) => p.title.trim()).map((p) => ({ title: p.title, description: p.description || undefined })),
      galleryImages: linesToArray(values.galleryImages),
      videoUrl: values.videoUrl || undefined,
      curriculumUrl: values.curriculumUrl || undefined,
      applyCtaLabel: values.applyCtaLabel || undefined,
      applyCtaHref: values.applyCtaHref || undefined,
      status: values.status,
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
    };

    if (values.courseFee) {
      await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(values.courseFee) }),
      }).catch(() => {});
    }

    const res = await fetch(`/api/admin/programme-details/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save programme details", "error");
      return;
    }

    showToast("Programme details saved", "success");
    router.push("/admin/programme-details");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Course</h2>
        <p className={formStyles.hint}>
          Programme details extend <strong>{courseTitle}</strong> (/programs/{courseSlug}). Core fields like title,
          slug, thumbnail, price, curriculum and instructors are edited from{" "}
          <Link href={`/admin/courses/${courseId}`}>the Course record</Link>.
        </p>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Hero</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-hero-banner">Hero Banner URL</label>
            <input id="pd-hero-banner" className={formStyles.input} value={values.heroBanner} onChange={(e) => set("heroBanner", e.target.value)} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-hero-image">Hero Image URL</label>
            <input id="pd-hero-image" className={formStyles.input} value={values.heroImage} onChange={(e) => set("heroImage", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Format &amp; Admissions</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-mode">Mode</label>
            <select id="pd-mode" className={formStyles.select} value={values.mode} onChange={(e) => set("mode", e.target.value as never)}>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-certification">Certification</label>
            <input id="pd-certification" className={formStyles.input} value={values.certification} onChange={(e) => set("certification", e.target.value)} />
          </div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="pd-eligibility">Eligibility</label>
          <textarea id="pd-eligibility" className={formStyles.textarea} value={values.eligibility} onChange={(e) => set("eligibility", e.target.value)} />
        </div>
        <div className={formStyles.checkboxGrid}>
          <label className={formStyles.checkboxRow} htmlFor="pd-emi">
            <input id="pd-emi" type="checkbox" checked={values.emiAvailable} onChange={(e) => set("emiAvailable", e.target.checked)} />
            EMI Available
          </label>
          <label className={formStyles.checkboxRow} htmlFor="pd-admission-open">
            <input id="pd-admission-open" type="checkbox" checked={values.admissionOpen} onChange={(e) => set("admissionOpen", e.target.checked)} />
            Admission Open
          </label>
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-emi-details">EMI Details</label>
            <textarea
              id="pd-emi-details"
              className={formStyles.textarea}
              placeholder="e.g. ₹9,999/month for 12 months, no-cost EMI via HDFC"
              value={values.emiDetails}
              onChange={(e) => set("emiDetails", e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-scholarship-info">Scholarship Info</label>
            <textarea
              id="pd-scholarship-info"
              className={formStyles.textarea}
              placeholder="e.g. Up to 20% merit scholarship for the pre-cohort diagnostic top scorers"
              value={values.scholarshipInfo}
              onChange={(e) => set("scholarshipInfo", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Overview &amp; Highlights</h2>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="pd-overview">Overview</label>
          <textarea id="pd-overview" className={formStyles.textarea} value={values.overview} onChange={(e) => set("overview", e.target.value)} />
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-highlights">Highlights (one per line)</label>
            <textarea id="pd-highlights" className={formStyles.textarea} value={values.highlights} onChange={(e) => set("highlights", e.target.value)} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-career-opportunities">Career Opportunities (one per line)</label>
            <textarea id="pd-career-opportunities" className={formStyles.textarea} value={values.careerOpportunities} onChange={(e) => set("careerOpportunities", e.target.value)} />
          </div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="pd-placement-support">Placement Support</label>
          <textarea id="pd-placement-support" className={formStyles.textarea} value={values.placementSupport} onChange={(e) => set("placementSupport", e.target.value)} />
        </div>
        <p className={formStyles.hint}>
          Outcomes Snapshot below only renders on the public page once these are filled in — leave blank until the
          business has confirmed real numbers for this cohort.
        </p>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-placement-rate">Placement Rate (%)</label>
            <input
              id="pd-placement-rate"
              type="number"
              min="0"
              max="100"
              className={formStyles.input}
              value={values.placementRate}
              onChange={(e) => set("placementRate", e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-salary-hike">Avg. Salary Hike (%)</label>
            <input
              id="pd-salary-hike"
              type="number"
              min="0"
              className={formStyles.input}
              value={values.avgSalaryHikePct}
              onChange={(e) => set("avgSalaryHikePct", e.target.value)}
            />
          </div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="pd-avg-package">Avg. Package (LPA)</label>
          <input
            id="pd-avg-package"
            type="number"
            min="0"
            step="0.1"
            className={formStyles.input}
            value={values.avgPackageLpa}
            onChange={(e) => set("avgPackageLpa", e.target.value)}
          />
        </div>
        <p className={formStyles.hint}>
          Curriculum, tools covered, and learning outcomes are edited on{" "}
          <Link href={`/admin/courses/${courseId}`}>the Course record</Link>. Trainers, testimonials, and FAQs are
          managed from their own modules and linked to this course there.
        </p>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Course Fee &amp; GST Details</h2>
        <p className={formStyles.hint}>
          Set the course fee, GST percentage, display text, and badge for this program.
        </p>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-course-fee">Course Fee (₹)</label>
            <input
              id="pd-course-fee"
              type="number"
              min="0"
              placeholder="e.g. 129999"
              className={formStyles.input}
              value={values.courseFee ?? ""}
              onChange={(e) => set("courseFee", e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-gst-rate">GST Rate (%)</label>
            <input
              id="pd-gst-rate"
              type="number"
              min="0"
              placeholder="18"
              className={formStyles.input}
              value={values.gstRate ?? "18"}
              onChange={(e) => set("gstRate", e.target.value)}
            />
          </div>
        </div>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-gst-text">GST Display Text</label>
            <input
              id="pd-gst-text"
              type="text"
              placeholder="+ 18% GST"
              className={formStyles.input}
              value={values.gstText ?? "+ 18% GST"}
              onChange={(e) => set("gstText", e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary, #888)", marginTop: "4px" }}>
              Displayed next to fee (e.g. &quot;+ 18% GST&quot;)
            </span>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-badge">Program Badge / Tag</label>
            <input
              id="pd-badge"
              type="text"
              placeholder="e.g. Most Enrolled Program / Best Selling Program"
              className={formStyles.input}
              value={values.badge ?? ""}
              onChange={(e) => set("badge", e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary, #888)", marginTop: "4px" }}>
              Featured chip displayed on top of the program card
            </span>
          </div>
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Projects</h2>
        <SortableList
          items={values.projects}
          onReorder={(next) => set("projects", next)}
          renderItem={(row) => (
            <div className={formStyles.grid2}>
              <input
                className={formStyles.input}
                placeholder="Project title"
                value={row.title}
                onChange={(e) => updateProject(row.id, { title: e.target.value })}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className={formStyles.input}
                  placeholder="Description"
                  value={row.description}
                  onChange={(e) => updateProject(row.id, { description: e.target.value })}
                />
                <button type="button" className={formStyles.cancelBtn} onClick={() => removeProject(row.id)}>
                  Remove
                </button>
              </div>
            </div>
          )}
        />
        <button type="button" className={formStyles.cancelBtn} onClick={addProject}>
          + Add Project
        </button>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Gallery &amp; Video</h2>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="pd-gallery">Gallery Images (one URL per line)</label>
          <textarea id="pd-gallery" className={formStyles.textarea} value={values.galleryImages} onChange={(e) => set("galleryImages", e.target.value)} />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="pd-video">Video URL</label>
          <input id="pd-video" className={formStyles.input} value={values.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="pd-curriculum">Curriculum Page URL</label>
          <input
            id="pd-curriculum"
            className={formStyles.input}
            placeholder="/Programs/curriculum/<slug>/index.html"
            value={values.curriculumUrl}
            onChange={(e) => set("curriculumUrl", e.target.value)}
          />
          <p className={formStyles.hint}>
            Path to a standalone curriculum HTML page (embedded as an iframe on the program page).
          </p>
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Download Brochure &amp; Apply CTA</h2>
        <p className={formStyles.hint}>
          Manage downloadable PDFs for this course in <Link href="/admin/brochures">Brochures</Link> — link a
          brochure to this course there and it will surface automatically on this programme&apos;s public page.
        </p>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-apply-cta-label">Apply CTA Label</label>
            <input id="pd-apply-cta-label" className={formStyles.input} value={values.applyCtaLabel} onChange={(e) => set("applyCtaLabel", e.target.value)} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-apply-cta-href">Apply CTA Link</label>
            <input id="pd-apply-cta-href" className={formStyles.input} value={values.applyCtaHref} onChange={(e) => set("applyCtaHref", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Publishing</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-status">Status</label>
            <select id="pd-status" className={formStyles.select} value={values.status} onChange={(e) => set("status", e.target.value as never)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="pd-publish-date">Publish Date (leave blank for now)</label>
            <input id="pd-publish-date" type="datetime-local" className={formStyles.input} value={values.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
          </div>
        </div>
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={() => router.push("/admin/programme-details")}>
          Cancel
        </button>
        <button type="submit" className={formStyles.submitBtn} disabled={submitting}>
          {submitting ? "Saving…" : "Save Programme Details"}
        </button>
      </div>
    </form>
  );
}

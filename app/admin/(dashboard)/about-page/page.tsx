"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import RepeatableFieldList from "@/components/admin/about/RepeatableFieldList";
import formStyles from "@/components/admin/Form.module.css";
import pageStyles from "../module-list.module.css";

type CoreValue = { title: string; description: string };
type WhyCard = { icon: string; title: string; body: string };
type TeamMember = { name: string; designation: string; photo: string; bio: string };
type Partner = { name: string; logo: string };
type Achievement = { title: string; description: string; year: string };
type TimelineItem = { year: string; title: string; description: string };
type Testimonial = { id: string; studentName: string };

type AboutPage = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroBackground: string | null;
  heroCtaLabel: string | null;
  heroCtaHref: string | null;
  aboutDescription: string | null;
  vision: string | null;
  mission: string | null;
  coreValues: CoreValue[] | null;
  statStudents: string | null;
  statCourses: string | null;
  statTrainers: string | null;
  statPlacements: string | null;
  founderName: string | null;
  founderDesignation: string | null;
  founderPhoto: string | null;
  founderMessage: string | null;
  whyChooseUs: WhyCard[] | null;
  team: TeamMember[] | null;
  partners: Partner[] | null;
  achievements: Achievement[] | null;
  timeline: TimelineItem[] | null;
  gallery: string[];
  videoUrl: string | null;
  testimonialIds: string[];
  ctaTitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const linesToArray = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

export default function AboutPageAdmin() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroBackground: "",
    heroCtaLabel: "",
    heroCtaHref: "",
    aboutDescription: "",
    vision: "",
    mission: "",
    coreValues: [] as CoreValue[],
    statStudents: "",
    statCourses: "",
    statTrainers: "",
    statPlacements: "",
    founderName: "",
    founderDesignation: "",
    founderPhoto: "",
    founderMessage: "",
    whyChooseUs: [] as WhyCard[],
    team: [] as TeamMember[],
    partners: [] as Partner[],
    achievements: [] as Achievement[],
    timeline: [] as TimelineItem[],
    gallery: "",
    videoUrl: "",
    testimonialIds: [] as string[],
    ctaTitle: "",
    ctaLabel: "",
    ctaHref: "",
    status: "DRAFT" as AboutPage["status"],
  });

  const { data } = useQuery({
    queryKey: ["admin-about-page"],
    queryFn: async () => {
      const res = await fetch("/api/admin/about-page");
      return (await res.json()) as AboutPage;
    },
  });

  const { data: testimonials } = useQuery({
    queryKey: ["admin-testimonials-picker"],
    queryFn: async () => {
      const res = await fetch("/api/admin/testimonials");
      return (await res.json()) as { items: Testimonial[] };
    },
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      heroTitle: data.heroTitle ?? "",
      heroSubtitle: data.heroSubtitle ?? "",
      heroBackground: data.heroBackground ?? "",
      heroCtaLabel: data.heroCtaLabel ?? "",
      heroCtaHref: data.heroCtaHref ?? "",
      aboutDescription: data.aboutDescription ?? "",
      vision: data.vision ?? "",
      mission: data.mission ?? "",
      coreValues: data.coreValues ?? [],
      statStudents: data.statStudents ?? "",
      statCourses: data.statCourses ?? "",
      statTrainers: data.statTrainers ?? "",
      statPlacements: data.statPlacements ?? "",
      founderName: data.founderName ?? "",
      founderDesignation: data.founderDesignation ?? "",
      founderPhoto: data.founderPhoto ?? "",
      founderMessage: data.founderMessage ?? "",
      whyChooseUs: data.whyChooseUs ?? [],
      team: data.team ?? [],
      partners: data.partners ?? [],
      achievements: data.achievements ?? [],
      timeline: data.timeline ?? [],
      gallery: (data.gallery ?? []).join("\n"),
      videoUrl: data.videoUrl ?? "",
      testimonialIds: data.testimonialIds ?? [],
      ctaTitle: data.ctaTitle ?? "",
      ctaLabel: data.ctaLabel ?? "",
      ctaHref: data.ctaHref ?? "",
      status: data.status,
    });
  }, [data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      heroTitle: form.heroTitle || undefined,
      heroSubtitle: form.heroSubtitle || undefined,
      heroBackground: form.heroBackground || undefined,
      heroCtaLabel: form.heroCtaLabel || undefined,
      heroCtaHref: form.heroCtaHref || undefined,
      aboutDescription: form.aboutDescription || undefined,
      vision: form.vision || undefined,
      mission: form.mission || undefined,
      coreValues: form.coreValues.filter((v) => v.title.trim()),
      statStudents: form.statStudents || undefined,
      statCourses: form.statCourses || undefined,
      statTrainers: form.statTrainers || undefined,
      statPlacements: form.statPlacements || undefined,
      founderName: form.founderName || undefined,
      founderDesignation: form.founderDesignation || undefined,
      founderPhoto: form.founderPhoto || undefined,
      founderMessage: form.founderMessage || undefined,
      whyChooseUs: form.whyChooseUs.filter((c) => c.title.trim()),
      team: form.team.filter((t) => t.name.trim()),
      partners: form.partners.filter((p) => p.name.trim()),
      achievements: form.achievements.filter((a) => a.title.trim()),
      timeline: form.timeline.filter((t) => t.title.trim()),
      gallery: linesToArray(form.gallery),
      videoUrl: form.videoUrl || undefined,
      testimonialIds: form.testimonialIds,
      ctaTitle: form.ctaTitle || undefined,
      ctaLabel: form.ctaLabel || undefined,
      ctaHref: form.ctaHref || undefined,
      status: form.status,
    };
    const res = await fetch("/api/admin/about-page", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save About page", "error");
      return;
    }
    showToast("About page saved", "success");
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>About Page</h1>
        <a href="/about" target="_blank" rel="noopener noreferrer" className={pageStyles.primaryBtn}>
          Preview
        </a>
      </div>

      <form onSubmit={onSubmit}>
        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Hero Section</h2>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Title</label>
              <input className={formStyles.input} value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Subtitle</label>
              <input className={formStyles.input} value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label}>Background Image URL</label>
            <input className={formStyles.input} value={form.heroBackground} onChange={(e) => setForm({ ...form, heroBackground: e.target.value })} />
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>CTA Label</label>
              <input className={formStyles.input} value={form.heroCtaLabel} onChange={(e) => setForm({ ...form, heroCtaLabel: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>CTA Link</label>
              <input className={formStyles.input} value={form.heroCtaHref} onChange={(e) => setForm({ ...form, heroCtaHref: e.target.value })} />
            </div>
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Company Information</h2>
          <div className={formStyles.field}>
            <label className={formStyles.label}>About Description</label>
            <textarea className={formStyles.textarea} value={form.aboutDescription} onChange={(e) => setForm({ ...form, aboutDescription: e.target.value })} />
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Vision</label>
              <textarea className={formStyles.textarea} value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Mission</label>
              <textarea className={formStyles.textarea} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
            </div>
          </div>
          <label className={formStyles.label}>Core Values</label>
          <RepeatableFieldList
            items={form.coreValues}
            onChange={(next) => setForm({ ...form, coreValues: next })}
            fields={[{ key: "title", label: "Title" }, { key: "description", label: "Description", multiline: true }]}
            emptyItem={{ title: "", description: "" }}
            addLabel="Add Core Value"
          />
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Statistics</h2>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Students</label>
              <input className={formStyles.input} value={form.statStudents} onChange={(e) => setForm({ ...form, statStudents: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Courses</label>
              <input className={formStyles.input} value={form.statCourses} onChange={(e) => setForm({ ...form, statCourses: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Trainers</label>
              <input className={formStyles.input} value={form.statTrainers} onChange={(e) => setForm({ ...form, statTrainers: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Placements</label>
              <input className={formStyles.input} value={form.statPlacements} onChange={(e) => setForm({ ...form, statPlacements: e.target.value })} />
            </div>
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Founder Message</h2>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Name</label>
              <input className={formStyles.input} value={form.founderName} onChange={(e) => setForm({ ...form, founderName: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Designation</label>
              <input className={formStyles.input} value={form.founderDesignation} onChange={(e) => setForm({ ...form, founderDesignation: e.target.value })} />
            </div>
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label}>Photo URL</label>
            <input className={formStyles.input} value={form.founderPhoto} onChange={(e) => setForm({ ...form, founderPhoto: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label}>Message</label>
            <textarea className={formStyles.textarea} value={form.founderMessage} onChange={(e) => setForm({ ...form, founderMessage: e.target.value })} />
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Why Choose Us</h2>
          <RepeatableFieldList
            items={form.whyChooseUs}
            onChange={(next) => setForm({ ...form, whyChooseUs: next })}
            fields={[{ key: "icon", label: "Icon" }, { key: "title", label: "Title" }, { key: "body", label: "Body", multiline: true }]}
            emptyItem={{ icon: "", title: "", body: "" }}
            addLabel="Add Card"
          />
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Team</h2>
          <RepeatableFieldList
            items={form.team}
            onChange={(next) => setForm({ ...form, team: next })}
            fields={[
              { key: "name", label: "Name" },
              { key: "designation", label: "Designation" },
              { key: "photo", label: "Photo URL" },
              { key: "bio", label: "Bio", multiline: true },
            ]}
            emptyItem={{ name: "", designation: "", photo: "", bio: "" }}
            addLabel="Add Team Member"
          />
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Partners</h2>
          <RepeatableFieldList
            items={form.partners}
            onChange={(next) => setForm({ ...form, partners: next })}
            fields={[{ key: "name", label: "Name" }, { key: "logo", label: "Logo URL" }]}
            emptyItem={{ name: "", logo: "" }}
            addLabel="Add Partner"
          />
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Achievements</h2>
          <RepeatableFieldList
            items={form.achievements}
            onChange={(next) => setForm({ ...form, achievements: next })}
            fields={[{ key: "title", label: "Title" }, { key: "year", label: "Year" }, { key: "description", label: "Description", multiline: true }]}
            emptyItem={{ title: "", year: "", description: "" }}
            addLabel="Add Achievement"
          />
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Timeline</h2>
          <RepeatableFieldList
            items={form.timeline}
            onChange={(next) => setForm({ ...form, timeline: next })}
            fields={[{ key: "year", label: "Year" }, { key: "title", label: "Title" }, { key: "description", label: "Description", multiline: true }]}
            emptyItem={{ year: "", title: "", description: "" }}
            addLabel="Add Timeline Entry"
          />
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Gallery &amp; Video</h2>
          <div className={formStyles.field}>
            <label className={formStyles.label}>Gallery Images (one URL per line)</label>
            <textarea className={formStyles.textarea} value={form.gallery} onChange={(e) => setForm({ ...form, gallery: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label}>Video URL</label>
            <input className={formStyles.input} value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Testimonials</h2>
          <div className={formStyles.checkboxGrid}>
            {(testimonials?.items ?? []).map((t) => (
              <label key={t.id} className={formStyles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.testimonialIds.includes(t.id)}
                  onChange={() =>
                    setForm({
                      ...form,
                      testimonialIds: form.testimonialIds.includes(t.id)
                        ? form.testimonialIds.filter((id) => id !== t.id)
                        : [...form.testimonialIds, t.id],
                    })
                  }
                />
                {t.studentName}
              </label>
            ))}
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>CTA Section</h2>
          <div className={formStyles.field}>
            <label className={formStyles.label}>Title</label>
            <input className={formStyles.input} value={form.ctaTitle} onChange={(e) => setForm({ ...form, ctaTitle: e.target.value })} />
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Button Label</label>
              <input className={formStyles.input} value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Button Link</label>
              <input className={formStyles.input} value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} />
            </div>
          </div>
        </div>

        <div className={formStyles.card}>
          <h2 className={formStyles.sectionTitle}>Status</h2>
          <div className={formStyles.field}>
            <label className={formStyles.label}>Publish Status</label>
            <select className={formStyles.select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as never })}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className={formStyles.actions}>
          <button type="submit" className={formStyles.submitBtn} disabled={submitting}>
            {submitting ? "Saving…" : "Save About Page"}
          </button>
        </div>
      </form>
    </div>
  );
}

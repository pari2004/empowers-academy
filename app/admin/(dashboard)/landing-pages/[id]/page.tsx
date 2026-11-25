"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import SortableList from "@/components/admin/SortableList";
import SectionEditorModal, { type PageSection } from "@/components/admin/SectionEditorModal";
import formStyles from "@/components/admin/Form.module.css";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../../module-list.module.css";

type LandingPage = {
  id: string;
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sections: PageSection[];
};

export default function EditLandingPagePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { id } = params;
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-landing-page", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/landing-pages/${id}`);
      if (!res.ok) throw new Error("Not found");
      return (await res.json()) as LandingPage;
    },
  });

  const [meta, setMeta] = useState<{ title: string; slug: string; metaTitle: string; metaDescription: string; status: string } | null>(null);
  const activeMeta = meta ?? (data ? { title: data.title, slug: data.slug, metaTitle: data.metaTitle ?? "", metaDescription: data.metaDescription ?? "", status: data.status } : null);

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!activeMeta) return;
    setSavingMeta(true);
    const res = await fetch(`/api/admin/landing-pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: activeMeta.title,
        slug: activeMeta.slug,
        metaTitle: activeMeta.metaTitle || undefined,
        metaDescription: activeMeta.metaDescription || undefined,
        status: activeMeta.status,
      }),
    });
    setSavingMeta(false);
    if (!res.ok) {
      showToast("Failed to save page details", "error");
      return;
    }
    showToast("Page details saved", "success");
    queryClient.invalidateQueries({ queryKey: ["admin-landing-page", id] });
  }

  async function handleReorder(next: PageSection[]) {
    queryClient.setQueryData(["admin-landing-page", id], { ...data, sections: next });
    await fetch("/api/admin/page-sections/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((s) => s.id) }),
    });
  }

  async function addSection() {
    const type = window.prompt("Section type (e.g. HERO, FEATURES, CTA)?");
    if (!type) return;
    await fetch("/api/admin/page-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ landingPageId: id, type, config: {}, order: data?.sections?.length ?? 0 }),
    });
    queryClient.invalidateQueries({ queryKey: ["admin-landing-page", id] });
    showToast("Section added", "success");
  }

  if (isLoading || !activeMeta) return <div>Loading…</div>;

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Edit Landing Page</h1>
        <button className={formStyles.cancelBtn} onClick={() => router.push("/admin/landing-pages")}>
          Back to list
        </button>
      </div>

      <form onSubmit={saveMeta} className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Page Details</h2>
        <div className={formStyles.grid2}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="landing-page-title">Title</label>
            <input id="landing-page-title" className={formStyles.input} value={activeMeta.title} onChange={(e) => setMeta({ ...activeMeta, title: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="landing-page-slug">Slug</label>
            <input id="landing-page-slug" className={formStyles.input} value={activeMeta.slug} onChange={(e) => setMeta({ ...activeMeta, slug: e.target.value })} />
          </div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="landing-page-meta-title">Meta Title</label>
          <input id="landing-page-meta-title" className={formStyles.input} value={activeMeta.metaTitle} onChange={(e) => setMeta({ ...activeMeta, metaTitle: e.target.value })} />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="landing-page-meta-description">Meta Description</label>
          <textarea id="landing-page-meta-description" className={formStyles.textarea} value={activeMeta.metaDescription} onChange={(e) => setMeta({ ...activeMeta, metaDescription: e.target.value })} />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="landing-page-status">Status</label>
          <select id="landing-page-status" className={formStyles.select} value={activeMeta.status} onChange={(e) => setMeta({ ...activeMeta, status: e.target.value })}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className={formStyles.actions}>
          <button type="submit" className={formStyles.submitBtn} disabled={savingMeta}>
            {savingMeta ? "Saving…" : "Save Details"}
          </button>
        </div>
      </form>

      <div className={pageStyles.header}>
        <h2 className={formStyles.sectionTitle}>Sections</h2>
        <button className={pageStyles.primaryBtn} onClick={addSection} type="button">
          + Add Section
        </button>
      </div>

      <SortableList
        items={data?.sections ?? []}
        onReorder={handleReorder}
        renderItem={(section) => (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{section.type}</strong>
              {!section.enabled && (
                <span className={listStyles.badge} style={{ marginLeft: 8, background: "#fee2e2", color: "#991b1b" }}>
                  Hidden
                </span>
              )}
            </div>
            <div className={listStyles.actions}>
              <button className={listStyles.actionBtn} onClick={() => setEditingSection(section)}>
                Edit
              </button>
              <button
                className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`}
                onClick={async () => {
                  if (!window.confirm(`Delete the "${section.type}" section?`)) return;
                  await fetch(`/api/admin/page-sections/${section.id}`, { method: "DELETE" });
                  queryClient.invalidateQueries({ queryKey: ["admin-landing-page", id] });
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      />

      <SectionEditorModal
        key={editingSection?.id ?? "none"}
        section={editingSection}
        onClose={() => setEditingSection(null)}
        onSave={async (input) => {
          if (!editingSection) return;
          await fetch(`/api/admin/page-sections/${editingSection.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          showToast("Section updated", "success");
          setEditingSection(null);
          queryClient.invalidateQueries({ queryKey: ["admin-landing-page", id] });
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import SortableList from "@/components/admin/SortableList";
import SectionEditorModal, { type PageSection } from "@/components/admin/SectionEditorModal";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

export default function HomepageBuilderPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-homepage-sections"],
    queryFn: async () => {
      const res = await fetch("/api/admin/page-sections?landingPageId=");
      return (await res.json()) as { items: PageSection[] };
    },
  });

  async function handleReorder(next: PageSection[]) {
    queryClient.setQueryData(["admin-homepage-sections"], { items: next });
    await fetch("/api/admin/page-sections/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((s) => s.id) }),
    });
  }

  async function toggleEnabled(section: PageSection) {
    await fetch(`/api/admin/page-sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !section.enabled }),
    });
    queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Homepage Builder</h1>
        <button
          className={pageStyles.primaryBtn}
          onClick={async () => {
            const type = window.prompt("Section type (e.g. CUSTOM, TESTIMONIALS)?");
            if (!type) return;
            await fetch("/api/admin/page-sections", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ landingPageId: null, type, config: {}, order: data?.items?.length ?? 0 }),
            });
            queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
            showToast("Section added", "success");
          }}
        >
          + Add Section
        </button>
      </div>
      <p style={{ color: "var(--adm-text-faint)", fontSize: 13, marginTop: -12, marginBottom: 20 }}>
        Drag to reorder sections. Toggle visibility, or click a section to edit its content, background, and images.
      </p>

      <SortableList
        items={data?.items ?? []}
        onReorder={handleReorder}
        renderItem={(section) => (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{section.type.replace(/_/g, " ")}</strong>
              {!section.enabled && (
                <span className={listStyles.badge} style={{ marginLeft: 8, background: "#fee2e2", color: "#991b1b" }}>
                  Hidden
                </span>
              )}
            </div>
            <div className={listStyles.actions}>
              <button className={listStyles.actionBtn} onClick={() => toggleEnabled(section)}>
                {section.enabled ? "Hide" : "Show"}
              </button>
              <button className={listStyles.actionBtn} onClick={() => setEditingSection(section)}>
                Edit
              </button>
              <button
                className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`}
                onClick={async () => {
                  if (!window.confirm(`Delete the "${section.type}" section?`)) return;
                  await fetch(`/api/admin/page-sections/${section.id}`, { method: "DELETE" });
                  queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
                  showToast("Section deleted", "success");
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
          const res = await fetch(`/api/admin/page-sections/${editingSection.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          if (!res.ok) {
            showToast("Failed to save section", "error");
            return;
          }
          showToast("Section updated", "success");
          setEditingSection(null);
          queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
        }}
      />
    </div>
  );
}

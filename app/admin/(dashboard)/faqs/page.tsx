"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import SortableList from "@/components/admin/SortableList";
import formStyles from "@/components/admin/Form.module.css";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type FaqCategory = { id: string; name: string; order: number };
type Faq = {
  id: string;
  question: string;
  answer: string;
  categoryId: string | null;
  order: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  category?: FaqCategory | null;
};

const emptyForm = { question: "", answer: "", categoryId: "", status: "PUBLISHED" as const };

export default function FaqsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Faq | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/faqs");
      if (!res.ok) throw new Error("Failed to load FAQs");
      return res.json() as Promise<{ items: Faq[] }>;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-faq-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/faq-categories");
      if (!res.ok) throw new Error("Failed to load categories");
      return res.json() as Promise<{ items: FaqCategory[] }>;
    },
  });

  const filtered = useMemo(() => {
    return (data?.items ?? []).filter((f) => {
      const matchesSearch = !search || f.question.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || f.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [data, search, categoryFilter]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreate() {
    setForm(emptyForm);
    setCreating(true);
  }

  function openEdit(f: Faq) {
    setForm({ question: f.question, answer: f.answer, categoryId: f.categoryId ?? "", status: f.status as "PUBLISHED" });
    setEditing(f);
  }

  async function handleReorder(next: Faq[]) {
    queryClient.setQueryData(["admin-faqs"], { items: next });
    await fetch("/api/admin/faqs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((f) => f.id) }),
    });
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    await fetch("/api/admin/faq-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim(), order: categoriesData?.items.length ?? 0 }),
    });
    setNewCategoryName("");
    queryClient.invalidateQueries({ queryKey: ["admin-faq-categories"] });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      question: form.question,
      answer: form.answer,
      categoryId: form.categoryId || undefined,
      status: form.status,
    };
    const url = editing ? `/api/admin/faqs/${editing.id}` : "/api/admin/faqs";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save FAQ", "error");
      return;
    }
    showToast(editing ? "FAQ updated" : "FAQ created", "success");
    setEditing(null);
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
  }

  const modalOpen = creating || !!editing;

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>FAQs</h1>
        <button className={pageStyles.primaryBtn} onClick={openCreate}>
          + New FAQ
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          className={listStyles.search}
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={listStyles.search} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {(categoriesData?.items ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className={listStyles.search}
          placeholder="New category name…"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
        />
        <button className={formStyles.cancelBtn} onClick={addCategory} type="button">
          Add Category
        </button>
      </div>

      <SortableList
        items={filtered}
        onReorder={handleReorder}
        renderItem={(f) => (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleExpand(f.id)}>
              <div>
                <strong>{f.question}</strong>
                {f.category && <span style={{ color: "var(--adm-text-faint)", marginLeft: 8, fontSize: 12 }}>{f.category.name}</span>}
                <span className={`${listStyles.badge} ${f.status === "PUBLISHED" ? listStyles.badgePublished : listStyles.badgeDraft}`} style={{ marginLeft: 8 }}>
                  {f.status.toLowerCase()}
                </span>
              </div>
              <div className={listStyles.actions} onClick={(e) => e.stopPropagation()}>
                <button className={listStyles.actionBtn} onClick={() => openEdit(f)}>
                  Edit
                </button>
                <button
                  className={listStyles.actionBtn}
                  onClick={() =>
                    fetch(`/api/admin/faqs/${f.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: f.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
                    }).then(() => queryClient.invalidateQueries({ queryKey: ["admin-faqs"] }))
                  }
                >
                  {f.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </button>
                <button className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`} onClick={() => setPendingDelete(f)}>
                  Delete
                </button>
              </div>
            </div>
            {expanded.has(f.id) && <p style={{ marginTop: 10, color: "var(--adm-text-soft)", fontSize: 13.5 }}>{f.answer}</p>}
          </div>
        )}
      />

      <Modal open={modalOpen} title={editing ? "Edit FAQ" : "New FAQ"} onClose={() => { setEditing(null); setCreating(false); }}>
        <form onSubmit={onSubmit}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="faq-question">Question</label>
            <input id="faq-question" className={formStyles.input} required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="faq-answer">Answer</label>
            <textarea id="faq-answer" className={formStyles.textarea} required value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          </div>
          <div className={formStyles.grid2}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="faq-category">Category</label>
              <select id="faq-category" className={formStyles.select} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">None</option>
                {(categoriesData?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="faq-status">Status</label>
              <select id="faq-status" className={formStyles.select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as never })}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
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
        title="Delete FAQ"
        message={`Delete "${pendingDelete?.question}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/faqs/${pendingDelete.id}`, { method: "DELETE" });
          showToast("FAQ deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

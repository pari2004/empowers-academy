"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SortableList from "@/components/admin/SortableList";
import formStyles from "@/components/admin/Form.module.css";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  isExternal: boolean;
  parentId: string | null;
  order: number;
};
type Menu = { id: string; location: string; items: MenuItem[] };

const LOCATIONS = ["HEADER", "FOOTER", "MOBILE"] as const;

export default function MenusPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<(typeof LOCATIONS)[number]>("HEADER");
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-menu", location],
    queryFn: async () => {
      const res = await fetch(`/api/admin/menus/${location}`);
      return (await res.json()) as Menu;
    },
  });

  const topLevel = (data?.items ?? []).filter((i) => !i.parentId);
  const childrenOf = (id: string) => (data?.items ?? []).filter((i) => i.parentId === id);

  async function addItem() {
    if (!newLabel.trim() || !newHref.trim()) return;
    await fetch(`/api/admin/menus/${location}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel, href: newHref, parentId: newParentId || undefined, order: data?.items?.length ?? 0 }),
    });
    setNewLabel("");
    setNewHref("");
    setNewParentId("");
    queryClient.invalidateQueries({ queryKey: ["admin-menu", location] });
    showToast("Menu item added", "success");
  }

  async function handleReorder(next: MenuItem[]) {
    queryClient.setQueryData(["admin-menu", location], { ...data, items: [...next, ...(data?.items ?? []).filter((i) => i.parentId)] });
    await fetch("/api/admin/menu-items/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((i) => i.id) }),
    });
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Menus</h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {LOCATIONS.map((loc) => (
          <button
            key={loc}
            className={formStyles.cancelBtn}
            style={loc === location ? { background: "var(--adm-primary-soft)", color: "var(--adm-primary)", borderColor: "var(--adm-primary)" } : undefined}
            onClick={() => setLocation(loc)}
          >
            {loc}
          </button>
        ))}
      </div>

      <div className={formStyles.card}>
        <h2 className={formStyles.sectionTitle}>Add Menu Item</h2>
        <div className={formStyles.grid2}>
          <input aria-label="Menu item label" className={formStyles.input} placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          <input aria-label="Menu item link" className={formStyles.input} placeholder="Link (href)" value={newHref} onChange={(e) => setNewHref(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <select aria-label="Parent menu item" className={formStyles.select} value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
            <option value="">Top level</option>
            {topLevel.map((item) => (
              <option key={item.id} value={item.id}>
                Nested under: {item.label}
              </option>
            ))}
          </select>
          <button className={pageStyles.primaryBtn} onClick={addItem} type="button">
            + Add
          </button>
        </div>
      </div>

      <SortableList
        items={topLevel}
        onReorder={handleReorder}
        renderItem={(item) => (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{item.label}</strong> <span style={{ color: "var(--adm-text-faint)", fontSize: 12 }}>{item.href}</span>
              </div>
              <button className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`} onClick={() => setPendingDelete(item)}>
                Delete
              </button>
            </div>
            {childrenOf(item.id).length > 0 && (
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {childrenOf(item.id).map((child) => (
                  <li key={child.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                    <span>
                      {child.label} <span style={{ color: "var(--adm-text-faint)" }}>{child.href}</span>
                    </span>
                    <button className={listStyles.actionBtn} onClick={() => setPendingDelete(child)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete menu item"
        message={`Delete "${pendingDelete?.label}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/menu-items/${pendingDelete.id}`, { method: "DELETE" });
          showToast("Menu item deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-menu", location] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

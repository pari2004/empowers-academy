"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import formStyles from "@/components/admin/Form.module.css";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";
import { ALL_PERMISSIONS } from "@/lib/rbac";

type Role = { id: string; name: string; permissions: string[] };
type User = { id: string; name: string; email: string; isActive: boolean; role: Role };

const emptyUserForm = { name: "", email: "", password: "", roleId: "", isActive: true };

export default function UsersPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"users" | "roles">("users");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [rolePerms, setRolePerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      return (await res.json()) as { items: User[] };
    },
  });
  const { data: roles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/roles");
      return (await res.json()) as { items: Role[] };
    },
  });

  function openCreateUser() {
    setUserForm(emptyUserForm);
    setEditingUser(null);
    setUserModalOpen(true);
  }
  function openEditUser(u: User) {
    setUserForm({ name: u.name, email: u.email, password: "", roleId: u.role.id, isActive: u.isActive });
    setEditingUser(u);
    setUserModalOpen(true);
  }

  async function onUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      name: userForm.name,
      email: userForm.email,
      roleId: userForm.roleId,
      isActive: userForm.isActive,
    };
    if (userForm.password) payload.password = userForm.password;

    const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
    const res = await fetch(url, {
      method: editingUser ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingUser ? payload : { ...payload, password: userForm.password }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save user", "error");
      return;
    }
    showToast(editingUser ? "User updated" : "User created", "success");
    setUserModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }

  function openRole(role: Role) {
    setRolePerms(role.permissions);
    setEditingRole(role);
  }

  function togglePerm(perm: string) {
    setRolePerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  }

  async function saveRole() {
    if (!editingRole) return;
    await fetch(`/api/admin/roles/${editingRole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: rolePerms }),
    });
    showToast("Role permissions updated", "success");
    setEditingRole(null);
    queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Users &amp; Roles</h1>
        {tab === "users" && (
          <button className={pageStyles.primaryBtn} onClick={openCreateUser}>
            + New User
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className={formStyles.cancelBtn} style={tab === "users" ? { background: "var(--adm-primary-soft)", color: "var(--adm-primary)" } : undefined} onClick={() => setTab("users")}>
          Users
        </button>
        <button className={formStyles.cancelBtn} style={tab === "roles" ? { background: "var(--adm-primary-soft)", color: "var(--adm-primary)" } : undefined} onClick={() => setTab("roles")}>
          Roles &amp; Permissions
        </button>
      </div>

      {tab === "users" ? (
        <div className={listStyles.wrap}>
          <table className={listStyles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(users?.items ?? []).map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role.name.replace(/_/g, " ")}</td>
                  <td>
                    <span className={`${listStyles.badge} ${u.isActive ? listStyles.badgePublished : listStyles.badgeArchived}`}>
                      {u.isActive ? "active" : "inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={listStyles.actions}>
                      <button className={listStyles.actionBtn} onClick={() => openEditUser(u)}>
                        Edit
                      </button>
                      <button className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`} onClick={() => setPendingDelete(u)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {(roles?.items ?? []).map((role) => (
            <div key={role.id} className={formStyles.card} style={{ marginBottom: 0, cursor: "pointer" }} onClick={() => openRole(role)}>
              <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>{role.name.replace(/_/g, " ")}</h3>
              <p style={{ fontSize: 12, color: "var(--adm-text-faint)", margin: 0 }}>
                {role.permissions.includes("*") ? "All permissions" : `${role.permissions.length} permissions`}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={userModalOpen} title={editingUser ? "Edit User" : "New User"} onClose={() => setUserModalOpen(false)}>
        <form onSubmit={onUserSubmit}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="user-name">Name</label>
            <input id="user-name" className={formStyles.input} required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="user-email">Email</label>
            <input id="user-email" type="email" className={formStyles.input} required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="user-password">{editingUser ? "New Password (leave blank to keep current)" : "Password"}</label>
            <input id="user-password"
              type="password"
              className={formStyles.input}
              required={!editingUser}
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="user-role">Role</label>
            <select id="user-role" className={formStyles.select} required value={userForm.roleId} onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}>
              <option value="">Select a role</option>
              {(roles?.items ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <label className={formStyles.checkboxRow}>
            <input type="checkbox" checked={userForm.isActive} onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })} />
            Active
          </label>
          <div className={formStyles.actions}>
            <button type="button" className={formStyles.cancelBtn} onClick={() => setUserModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className={formStyles.submitBtn} disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editingRole} title={`Permissions — ${editingRole?.name.replace(/_/g, " ") ?? ""}`} onClose={() => setEditingRole(null)} wide>
        <div className={formStyles.checkboxGrid} style={{ maxHeight: 400, overflowY: "auto" }}>
          {ALL_PERMISSIONS.map((perm) => (
            <label key={perm} className={formStyles.checkboxRow}>
              <input type="checkbox" checked={rolePerms.includes("*") || rolePerms.includes(perm)} disabled={rolePerms.includes("*")} onChange={() => togglePerm(perm)} />
              {perm}
            </label>
          ))}
        </div>
        <label className={formStyles.checkboxRow} style={{ marginTop: 12 }}>
          <input type="checkbox" checked={rolePerms.includes("*")} onChange={() => setRolePerms(rolePerms.includes("*") ? [] : ["*"])} />
          All permissions (Super Admin)
        </label>
        <div className={formStyles.actions}>
          <button type="button" className={formStyles.cancelBtn} onClick={() => setEditingRole(null)}>
            Cancel
          </button>
          <button type="button" className={formStyles.submitBtn} onClick={saveRole}>
            Save Permissions
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete user"
        message={`Delete "${pendingDelete?.name}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const res = await fetch(`/api/admin/users/${pendingDelete.id}`, { method: "DELETE" });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            showToast(body.error ?? "Failed to delete user", "error");
          } else {
            showToast("User deleted", "success");
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

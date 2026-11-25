"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";

type LogEntry = {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
};

const ACTIONS = ["LOGIN", "LOGIN_FAILED", "LOGOUT", "CREATE", "UPDATE", "DELETE", "PUBLISH", "ARCHIVE", "DUPLICATE", "RESTORE", "ROLE_CHANGE"];

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-activity-logs", page, action],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "30" });
      if (action) params.set("action", action);
      const res = await fetch(`/api/admin/activity-logs?${params}`);
      return (await res.json()) as { items: LogEntry[]; pageCount: number };
    },
  });

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Activity Logs</h1>
      </div>

      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <select className={styles.search} value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((log) => (
              <tr key={log.id}>
                <td>{log.user ? `${log.user.name} (${log.user.email})` : "System"}</td>
                <td>{log.action}</td>
                <td>{log.entityType ?? "—"}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No activity recorded yet.</div>}
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {data?.pageCount ?? 1}
          </span>
          <button className={styles.pageBtn} disabled={page >= (data?.pageCount ?? 1)} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

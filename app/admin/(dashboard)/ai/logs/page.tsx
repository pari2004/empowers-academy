"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "@/components/admin/DataTable.module.css";
import pageStyles from "../../module-list.module.css";

type LogEntry = {
  id: string;
  feature: string;
  provider: string;
  model: string;
  status: "SUCCESS" | "ERROR";
  latencyMs: number;
  promptTokens: number | null;
  completionTokens: number | null;
  entityType: string | null;
  entityId: string | null;
  errorMessage: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
};

const FEATURES = [
  "LEAD_SCORE",
  "FOLLOWUP_SUGGESTION",
  "EMAIL_DRAFT",
  "WHATSAPP_DRAFT",
  "MEETING_SUMMARY",
  "STUDENT_RISK",
  "PLACEMENT_READINESS",
  "REVENUE_FORECAST",
  "DASHBOARD_INSIGHT",
  "REPORT",
  "CHAT",
];

export default function AiLogsPage() {
  const [page, setPage] = useState(1);
  const [feature, setFeature] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-ai-logs", page, feature],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "30" });
      if (feature) params.set("feature", feature);
      const res = await fetch(`/api/admin/ai/logs?${params}`);
      return (await res.json()) as { items: LogEntry[]; pageCount: number };
    },
  });

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>AI Request Logs</h1>
      </div>

      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <select className={styles.search} value={feature} onChange={(e) => setFeature(e.target.value)}>
            <option value="">All features</option>
            {FEATURES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Feature</th>
              <th>Provider / Model</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Tokens (prompt/completion)</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((log) => (
              <tr key={log.id}>
                <td>{log.user ? `${log.user.name} (${log.user.email})` : "System"}</td>
                <td title={log.errorMessage ?? undefined}>{log.feature}</td>
                <td>
                  {log.provider} / {log.model}
                </td>
                <td>{log.status}</td>
                <td>{log.latencyMs}ms</td>
                <td>
                  {log.promptTokens ?? "—"} / {log.completionTokens ?? "—"}
                </td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items?.length ?? 0) === 0 && <div className={styles.empty}>No AI requests recorded yet.</div>}
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

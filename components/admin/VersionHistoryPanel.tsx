"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import formStyles from "@/components/admin/Form.module.css";
import styles from "./VersionHistoryPanel.module.css";

type Revision = { id: string; versionNumber: number; data: Record<string, unknown>; createdAt: string; createdById: string | null };

function shallowDiff(a: Record<string, unknown>, b: Record<string, unknown>) {
  const fields = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  const changes: Array<{ field: string; before: unknown; after: unknown }> = [];
  for (const field of fields) {
    if (JSON.stringify(a?.[field]) !== JSON.stringify(b?.[field])) {
      changes.push({ field, before: a?.[field], after: b?.[field] });
    }
  }
  return changes;
}

export default function VersionHistoryPanel({ entityType, entityId }: { entityType: string; entityId: string }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Revision | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-revisions", entityType, entityId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/revisions?entityType=${entityType}&entityId=${entityId}`);
      return (await res.json()) as { items: Revision[] };
    },
  });

  const revisions = data?.items ?? [];

  return (
    <div className={formStyles.card}>
      <h2 className={formStyles.sectionTitle}>Version History</h2>
      {revisions.length === 0 && <p style={{ color: "var(--adm-text-faint)", fontSize: 13 }}>No prior versions yet.</p>}
      <ul className={styles.list}>
        {revisions.map((rev, idx) => {
          const previous = revisions[idx + 1];
          const diff = previous ? shallowDiff(previous.data, rev.data) : [];
          return (
            <li key={rev.id} className={styles.item}>
              <div className={styles.row}>
                <div>
                  <strong>Version {rev.versionNumber}</strong>
                  <span className={styles.meta}> · {new Date(rev.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {previous && (
                    <button className={formStyles.cancelBtn} onClick={() => setExpanded(expanded === rev.id ? null : rev.id)}>
                      {expanded === rev.id ? "Hide diff" : "Compare"}
                    </button>
                  )}
                  <button className={formStyles.cancelBtn} onClick={() => setPendingRestore(rev)}>
                    Restore
                  </button>
                </div>
              </div>
              {expanded === rev.id && (
                <div className={styles.diff}>
                  {diff.length === 0 ? (
                    <span className={styles.meta}>No field-level changes detected.</span>
                  ) : (
                    diff.map((d) => (
                      <div key={d.field} className={styles.diffRow}>
                        <span className={styles.diffField}>{d.field}</span>
                        <span className={styles.diffBefore}>{JSON.stringify(d.before)}</span>
                        <span className={styles.diffAfter}>{JSON.stringify(d.after)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={!!pendingRestore}
        title="Restore version"
        message={`Restore version ${pendingRestore?.versionNumber}? This overwrites the current content (a new version is created first, so nothing is lost).`}
        confirmLabel="Restore"
        onCancel={() => setPendingRestore(null)}
        onConfirm={async () => {
          if (!pendingRestore) return;
          const res = await fetch(`/api/admin/revisions/${pendingRestore.id}/restore`, { method: "POST" });
          if (!res.ok) {
            showToast("Failed to restore version", "error");
          } else {
            showToast("Version restored", "success");
            queryClient.invalidateQueries();
          }
          setPendingRestore(null);
        }}
      />
    </div>
  );
}

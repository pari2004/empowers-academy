"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import listStyles from "@/components/admin/DataTable.module.css";
import pageStyles from "../module-list.module.css";
import styles from "./media.module.css";

type MediaFile = {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  size: number;
  altText: string | null;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-media", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/media?${params}`);
      if (!res.ok) throw new Error("Failed to load media");
      return res.json() as Promise<{ items: MediaFile[] }>;
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const presignRes = await fetch("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
      });

      if (!presignRes.ok) {
        const body = await presignRes.json().catch(() => ({}));
        showToast(body.error ?? "Upload failed", "error");
        continue;
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      const putRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) {
        showToast(`Failed to upload ${file.name}`, "error");
        continue;
      }

      await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, url: publicUrl, mimeType: file.type, size: file.size }),
      });
    }

    setUploading(false);
    showToast("Upload complete", "success");
    queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Media Library</h1>
        <button className={pageStyles.primaryBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : "+ Upload Files"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <input
        className={listStyles.search}
        placeholder="Search files…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, width: "100%", maxWidth: 320 }}
      />

      {!isLoading && (data?.items?.length ?? 0) === 0 && (
        <div className={listStyles.empty}>
          No media yet. Upload your first file — note media storage must be configured (S3_ENDPOINT, S3_BUCKET, etc.
          in .env) before uploads will succeed.
        </div>
      )}

      <div className={styles.grid}>
        {(data?.items ?? []).map((file) => (
          <div key={file.id} className={styles.card}>
            <div className={styles.preview}>
              {file.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.thumbnailUrl ?? file.url} alt={file.altText ?? file.filename} />
              ) : (
                <span className={styles.fileIcon}>{file.mimeType.split("/")[1]?.toUpperCase() ?? "FILE"}</span>
              )}
            </div>
            <div className={styles.meta}>
              <div className={styles.filename} title={file.filename}>
                {file.filename}
              </div>
              <div className={styles.size}>{formatSize(file.size)}</div>
            </div>
            <div className={styles.cardActions}>
              <button
                className={listStyles.actionBtn}
                onClick={() => {
                  navigator.clipboard.writeText(file.url);
                  showToast("URL copied", "success");
                }}
              >
                Copy URL
              </button>
              <button className={`${listStyles.actionBtn} ${listStyles.actionBtnDanger}`} onClick={() => setPendingDelete(file)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete file"
        message={`Delete "${pendingDelete?.filename}"? This removes it from storage.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await fetch(`/api/admin/media/${pendingDelete.id}`, { method: "DELETE" });
          showToast("File deleted", "success");
          queryClient.invalidateQueries({ queryKey: ["admin-media"] });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

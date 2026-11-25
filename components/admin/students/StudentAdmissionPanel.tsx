"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/admin/ToastProvider";
import { ADMISSION_STATUSES, type AdmissionStatus } from "./types";

type BatchOption = { id: string; name: string };

export default function StudentAdmissionPanel({
  studentId,
  courseId,
  admissionStatus,
  batchId,
  offerLetterUrl,
}: {
  studentId: string;
  courseId: string;
  admissionStatus: AdmissionStatus;
  batchId: string | null;
  offerLetterUrl: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<AdmissionStatus>(admissionStatus);
  const [batch, setBatch] = useState<string>(batchId ?? "NONE");
  const [offerUrl, setOfferUrl] = useState(offerLetterUrl ?? "");
  const [saving, setSaving] = useState(false);

  const { data: batchesData } = useQuery({
    queryKey: ["admin-batches-for-course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/batches?courseId=${courseId}&pageSize=100`);
      return (await res.json()) as { items: BatchOption[] };
    },
  });
  const batches = batchesData?.items ?? [];

  async function save(patch: Record<string, unknown>) {
    setSaving(true);
    const res = await fetch(`/api/admin/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(body.error ?? "Failed to save", "error");
      return;
    }
    showToast("Saved", "success");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-foreground">Admission Status</div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as AdmissionStatus)}>
            <SelectTrigger className="flex-1" aria-label="Admission status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMISSION_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => save({ admissionStatus: status })} disabled={saving || status === admissionStatus}>
            Save
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-foreground">Batch</div>
        <div className="flex items-center gap-2">
          <Select value={batch} onValueChange={setBatch}>
            <SelectTrigger className="flex-1" aria-label="Batch">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Unassigned</SelectItem>
              {batches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => save({ batchId: batch === "NONE" ? null : batch })} disabled={saving || batch === (batchId ?? "NONE")}>
            Save
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-foreground">Offer Letter URL</div>
        <div className="flex items-center gap-2">
          <Input value={offerUrl} onChange={(e) => setOfferUrl(e.target.value)} placeholder="https://…" />
          <Button
            onClick={() => save({ offerLetterUrl: offerUrl || null })}
            disabled={saving || offerUrl === (offerLetterUrl ?? "")}
          >
            Save
          </Button>
        </div>
        {offerLetterUrl && (
          <a href={offerLetterUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-primary hover:underline">
            View current offer letter
          </a>
        )}
      </div>
    </div>
  );
}

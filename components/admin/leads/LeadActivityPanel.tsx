"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/admin/ToastProvider";
import StageTransitionDialog from "./StageTransitionDialog";
import { getValidNextStages, stageLabel, stageRequiresPayload, type LeadNote, type LeadNoteType, type LeadStage } from "./types";

const NOTE_TYPES: Array<{ value: LeadNoteType; label: string }> = [
  { value: "NOTE", label: "Note" },
  { value: "CALL", label: "Call" },
];

async function uploadAttachment(file: File): Promise<string> {
  const presignRes = await fetch("/api/admin/media/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
  });
  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to get an upload URL");
  }
  const { uploadUrl, publicUrl } = await presignRes.json();

  const putRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!putRes.ok) throw new Error("Failed to upload file");

  return publicUrl;
}

export default function LeadActivityPanel({
  leadId,
  leadName,
  currentStage,
  courseId,
}: {
  leadId: string;
  leadName: string;
  currentStage: LeadStage;
  courseId: string | null;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [noteType, setNoteType] = useState<LeadNoteType>("NOTE");
  const [noteBody, setNoteBody] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validNextStages = getValidNextStages(currentStage);
  const [pendingStage, setPendingStage] = useState<LeadStage>(validNextStages[0] ?? currentStage);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // currentStage comes from the server (this page is a Server Component);
  // after a successful move it changes via router.refresh() without
  // remounting this component, so the pending-stage picker must be
  // re-synced to the new stage's valid next moves rather than keeping
  // whatever was selected before the move.
  useEffect(() => {
    setPendingStage(getValidNextStages(currentStage)[0] ?? currentStage);
  }, [currentStage]);

  const { data: notes } = useQuery({
    queryKey: ["admin-lead-notes", leadId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`);
      return (await res.json()) as LeadNote[];
    },
  });

  function onMoveComplete() {
    queryClient.invalidateQueries({ queryKey: ["admin-lead-notes", leadId] });
    queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
    queryClient.invalidateQueries({ queryKey: ["admin-leads-board"] });
    // The lead detail page is a Server Component (stage, canConvert, and the
    // LeadForm's initial values are all computed server-side) — a
    // query-cache invalidation alone won't refresh those, so also refresh
    // the route itself.
    router.refresh();
  }

  async function moveStage() {
    if (pendingStage === currentStage || !validNextStages.includes(pendingStage)) return;

    if (stageRequiresPayload(pendingStage)) {
      setDialogOpen(true);
      return;
    }

    setTransitioning(true);
    const res = await fetch(`/api/admin/leads/${leadId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: pendingStage }),
    });
    setTransitioning(false);
    if (!res.ok) {
      showToast("Failed to update stage", "error");
      return;
    }
    showToast("Stage updated", "success");
    onMoveComplete();
  }

  async function addNote() {
    if (!noteBody.trim()) return;
    setSubmittingNote(true);
    try {
      let attachmentUrl: string | null = null;
      if (attachmentFile) {
        attachmentUrl = await uploadAttachment(attachmentFile);
      }

      const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: noteType, body: noteBody.trim(), attachmentUrl }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to add note");
      }
      setNoteBody("");
      setAttachmentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["admin-lead-notes", leadId] });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add note", "error");
    } finally {
      setSubmittingNote(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-foreground">Pipeline Stage</div>
        <div className="mb-2 text-xs text-muted-foreground">Current: {stageLabel(currentStage)}</div>
        {validNextStages.length === 0 ? (
          <p className="text-sm text-muted-foreground">This is a closed stage — no further moves.</p>
        ) : (
        <div className="flex items-center gap-2">
          <Select value={pendingStage} onValueChange={(v) => setPendingStage(v as LeadStage)}>
            <SelectTrigger className="flex-1" aria-label="Move to stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {validNextStages.map((s) => (
                <SelectItem key={s} value={s}>
                  {stageLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={moveStage} disabled={transitioning || pendingStage === currentStage}>
            Move
          </Button>
        </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Add Note</span>
          <Select value={noteType} onValueChange={(v) => setNoteType(v as LeadNoteType)}>
            <SelectTrigger className="h-7 w-24 text-xs" aria-label="Note type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          rows={3}
          placeholder={noteType === "CALL" ? "Call summary…" : "Meeting notes, student queries, etc."}
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Paperclip className="size-3.5" />
            {attachmentFile ? attachmentFile.name : "Attach file"}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button size="sm" onClick={addNote} disabled={submittingNote || !noteBody.trim()}>
            {submittingNote ? "Saving…" : "Add Note"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 text-sm font-medium text-foreground">Activity Timeline</div>
        {(notes ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(notes ?? []).map((note) => (
              <li key={note.id} className="border-l-2 border-border pl-3">
                <div className="flex items-center gap-2">
                  <Badge variant={note.type === "STAGE_CHANGE" ? "secondary" : "outline"} className="text-[10px]">
                    {note.type === "STAGE_CHANGE" ? "Stage" : note.type === "CALL" ? "Call" : "Note"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-foreground">{note.body}</p>
                {note.attachmentUrl && (
                  <a
                    href={note.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Paperclip className="size-3" />
                    Attachment
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <StageTransitionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        leadId={leadId}
        leadName={leadName}
        fromStage={currentStage}
        toStage={pendingStage}
        courseId={courseId}
        onSuccess={onMoveComplete}
      />
    </div>
  );
}

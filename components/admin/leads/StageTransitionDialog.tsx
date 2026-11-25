"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/admin/ToastProvider";
import { getValidNextStages, stageLabel, type LeadStage } from "@/lib/leadPipeline";

type BatchOption = { id: string; name: string };

const PAYMENT_METHODS = ["CASH", "CHEQUE", "BANK_TRANSFER", "UPI"] as const;
const PAYMENT_TYPES = ["REGISTRATION_FEE", "ADMISSION_FEE", "COURSE_FEE", "INSTALLMENT", "OTHER"] as const;

// Sentinel used when the drop target isn't one specific stage yet — the
// Kanban's aggregated "Closed" column, which covers all terminal outcomes.
export const TERMINAL_PICKER = "TERMINAL_PICKER" as const;

export default function StageTransitionDialog({
  open,
  onOpenChange,
  leadId,
  leadName,
  fromStage,
  toStage,
  courseId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  fromStage: LeadStage;
  toStage: LeadStage | typeof TERMINAL_PICKER;
  courseId: string | null;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const terminalOptions = toStage === TERMINAL_PICKER ? getValidNextStages(fromStage) : [];
  const [pickedTerminal, setPickedTerminal] = useState<LeadStage | "">(terminalOptions[0] ?? "");

  const [followUpAt, setFollowUpAt] = useState("");
  const [reason, setReason] = useState("");

  const [sessionAt, setSessionAt] = useState("");

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("CASH");
  const [paymentType, setPaymentType] = useState<(typeof PAYMENT_TYPES)[number]>("REGISTRATION_FEE");
  const [notes, setNotes] = useState("");

  const [batchId, setBatchId] = useState<string>("NONE");
  const { data: batchesData } = useQuery({
    queryKey: ["admin-batches-for-course", courseId],
    enabled: toStage === "ONBOARDED_LEARNER" && !!courseId,
    queryFn: async () => {
      const res = await fetch(`/api/admin/batches?courseId=${courseId}&pageSize=100`);
      return (await res.json()) as { items: BatchOption[] };
    },
  });
  const batches = batchesData?.items ?? [];

  // LeadActivityPanel keeps one dialog instance mounted and just toggles
  // `open` across separate transitions (unlike the Kanban, which mounts a
  // fresh instance per drag) — without this, stale field values (e.g. a
  // payment amount typed for PARTIAL_PAYMENT) would silently carry over and
  // get resubmitted as an unintended top-up on the next transition.
  useEffect(() => {
    if (!open) return;
    setPickedTerminal(terminalOptions[0] ?? "");
    setFollowUpAt("");
    setReason("");
    setSessionAt("");
    setAmount("");
    setMethod("CASH");
    setPaymentType("REGISTRATION_FEE");
    setNotes("");
    setBatchId("NONE");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, toStage]);

  const effectiveTarget: LeadStage | "" = toStage === TERMINAL_PICKER ? pickedTerminal : toStage;

  function buildBody(): Record<string, unknown> | null {
    if (!effectiveTarget) return null;
    if (effectiveTarget === "FOLLOW_UP") {
      return { stage: "FOLLOW_UP", followUpAt: followUpAt || undefined, reason: reason || undefined };
    }
    if (effectiveTarget === "SESSION_SCHEDULED") {
      if (!sessionAt) return null;
      return { stage: "SESSION_SCHEDULED", sessionScheduledAt: sessionAt };
    }
    if (effectiveTarget === "PARTIAL_PAYMENT") {
      if (!amount) return null;
      return { stage: "PARTIAL_PAYMENT", payment: { amount: Number(amount), method, type: paymentType, notes: notes || undefined } };
    }
    if (effectiveTarget === "ONBOARDED_LEARNER") {
      return {
        stage: "ONBOARDED_LEARNER",
        batchId: batchId === "NONE" ? null : batchId,
        payment: amount ? { amount: Number(amount), method, type: paymentType, notes: notes || undefined } : undefined,
      };
    }
    return { stage: effectiveTarget, reason: reason || undefined };
  }

  async function submit() {
    const body = buildBody();
    if (!body) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Failed to update stage");
      }
      showToast("Lead stage updated", "success");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update stage", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !submitting &&
    !!effectiveTarget &&
    (effectiveTarget !== "SESSION_SCHEDULED" || !!sessionAt) &&
    (effectiveTarget !== "PARTIAL_PAYMENT" || !!amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {leadName}</DialogTitle>
          <DialogDescription>
            {toStage === TERMINAL_PICKER
              ? "Choose an outcome to close this lead."
              : `Moving to ${stageLabel(toStage)}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {toStage === TERMINAL_PICKER && (
            <div className="flex flex-col gap-1.5">
              <Label>Outcome</Label>
              <Select value={pickedTerminal} onValueChange={(v) => setPickedTerminal(v as LeadStage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getValidNextStages(fromStage).map((s) => (
                    <SelectItem key={s} value={s}>
                      {stageLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {effectiveTarget === "FOLLOW_UP" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="followUpAt">Follow up on (defaults to tomorrow)</Label>
              <Input id="followUpAt" type="datetime-local" value={followUpAt} onChange={(e) => setFollowUpAt(e.target.value)} />
            </div>
          )}

          {effectiveTarget === "SESSION_SCHEDULED" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sessionAt">Session date &amp; time</Label>
              <Input id="sessionAt" type="datetime-local" value={sessionAt} onChange={(e) => setSessionAt(e.target.value)} required />
            </div>
          )}

          {(effectiveTarget === "PARTIAL_PAYMENT" || effectiveTarget === "ONBOARDED_LEARNER") && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="amount">
                    Amount {effectiveTarget === "ONBOARDED_LEARNER" ? "(optional top-up)" : ""}
                  </Label>
                  <Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Method</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as (typeof PAYMENT_METHODS)[number])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Payment Type</Label>
                <Select value={paymentType} onValueChange={(v) => setPaymentType(v as (typeof PAYMENT_TYPES)[number])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </>
          )}

          {effectiveTarget === "ONBOARDED_LEARNER" && (
            <div className="flex flex-col gap-1.5">
              <Label>Batch</Label>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger aria-label="Batch">
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
            </div>
          )}

          {effectiveTarget &&
            effectiveTarget !== "FOLLOW_UP" &&
            effectiveTarget !== "SESSION_SCHEDULED" &&
            effectiveTarget !== "PARTIAL_PAYMENT" &&
            effectiveTarget !== "ONBOARDED_LEARNER" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {submitting ? "Saving…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/admin/ToastProvider";
import Modal from "@/components/admin/Modal";

type LeadScore = { score: number; reasoning: string; signals: string[] };
type FollowUp = { suggestion: string; nextAction: string; suggestedDate?: string };
type Draft = { subject?: string; body: string };
type MeetingSummary = { summary: string; actionItems: string[]; sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" };

async function postAi<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error ?? "AI request failed");
  }
  return res.json();
}

async function getCached<T>(url: string): Promise<T | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) ?? null;
}

export default function AiInsightsPanel({ leadId }: { leadId: string }) {
  const { showToast } = useToast();

  const [score, setScore] = useState<LeadScore | null>(null);
  const [scoring, setScoring] = useState(false);

  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  const [draftOpen, setDraftOpen] = useState(false);
  const [channel, setChannel] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
  const [tone, setTone] = useState<"FORMAL" | "FRIENDLY" | "URGENT">("FRIENDLY");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [drafting, setDrafting] = useState(false);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    getCached<LeadScore>(`/api/admin/ai/leads/${leadId}/score`).then(setScore);
    getCached<FollowUp>(`/api/admin/ai/leads/${leadId}/followup`).then(setFollowUp);
  }, [leadId]);

  async function runScore() {
    setScoring(true);
    try {
      setScore(await postAi(`/api/admin/ai/leads/${leadId}/score`, {}));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to score lead", "error");
    } finally {
      setScoring(false);
    }
  }

  async function runFollowUp() {
    setSuggesting(true);
    try {
      setFollowUp(await postAi(`/api/admin/ai/leads/${leadId}/followup`, {}));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to suggest follow-up", "error");
    } finally {
      setSuggesting(false);
    }
  }

  async function runDraft() {
    setDrafting(true);
    try {
      setDraft(await postAi(`/api/admin/ai/leads/${leadId}/draft`, { channel, tone }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to generate draft", "error");
    } finally {
      setDrafting(false);
    }
  }

  async function runSummary() {
    if (!transcript.trim()) return;
    setSummarizing(true);
    try {
      setSummary(await postAi(`/api/admin/ai/leads/${leadId}/meeting-summary`, { transcript: transcript.trim() }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to summarize meeting", "error");
    } finally {
      setSummarizing(false);
    }
  }

  function copyDraft() {
    if (!draft) return;
    navigator.clipboard.writeText(draft.subject ? `${draft.subject}\n\n${draft.body}` : draft.body);
    showToast("Draft copied to clipboard", "success");
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 text-sm font-medium text-foreground">AI Insights</div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Lead Score</span>
            <Button size="sm" variant="outline" onClick={runScore} disabled={scoring}>
              {scoring ? "Scoring…" : score ? "Refresh" : "Score Lead"}
            </Button>
          </div>
          {score && (
            <div className="mt-2 rounded-md bg-muted/50 p-2">
              <div className="flex items-center gap-2">
                <Badge>{score.score}/100</Badge>
                {score.signals.map((s) => (
                  <Badge key={s} variant="outline" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{score.reasoning}</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Follow-up Suggestion</span>
            <Button size="sm" variant="outline" onClick={runFollowUp} disabled={suggesting}>
              {suggesting ? "Thinking…" : followUp ? "Refresh" : "Suggest"}
            </Button>
          </div>
          {followUp && (
            <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              <p className="text-foreground">{followUp.nextAction}</p>
              <p className="mt-1">{followUp.suggestion}</p>
              {followUp.suggestedDate && <p className="mt-1">Suggested date: {followUp.suggestedDate}</p>}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setDraftOpen(true)}>
            Generate Draft
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setSummaryOpen(true)}>
            Summarize Meeting
          </Button>
        </div>
      </div>

      <Modal open={draftOpen} title="Generate AI Draft" onClose={() => setDraftOpen(false)}>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
              <SelectTrigger className="flex-1" aria-label="Channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
              <SelectTrigger className="flex-1" aria-label="Tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FORMAL">Formal</SelectItem>
                <SelectItem value="FRIENDLY">Friendly</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={runDraft} disabled={drafting}>
            {drafting ? "Generating…" : "Generate"}
          </Button>
          {draft && (
            <div className="rounded-md border border-border p-3">
              {draft.subject && <p className="mb-1 text-sm font-medium text-foreground">{draft.subject}</p>}
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{draft.body}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={copyDraft}>
                Copy
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={summaryOpen} title="AI Meeting Summary" onClose={() => setSummaryOpen(false)}>
        <div className="flex flex-col gap-3">
          <Textarea
            rows={6}
            placeholder="Paste the call transcript or meeting notes…"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <Button onClick={runSummary} disabled={summarizing || !transcript.trim()}>
            {summarizing ? "Summarizing…" : "Summarize"}
          </Button>
          {summary && (
            <div className="rounded-md border border-border p-3">
              <Badge variant={summary.sentiment === "NEGATIVE" ? "destructive" : "outline"}>{summary.sentiment}</Badge>
              <p className="mt-2 text-sm text-foreground">{summary.summary}</p>
              {summary.actionItems.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                  {summary.actionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

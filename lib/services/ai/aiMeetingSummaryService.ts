import { z } from "zod";
import { getLeadById, addLeadNote } from "@/lib/services/leadService";
import { runCachedJsonFeature } from "@/lib/ai/run";
import { getValidatedInsight } from "@/lib/ai/cache";

const resultSchema = z.object({
  summary: z.string(),
  actionItems: z.array(z.string()).default([]),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
});

export type MeetingSummaryResult = z.infer<typeof resultSchema>;

/** Summarizes pasted call/meeting notes or a transcript — no audio/video processing, text only. */
export async function summarizeMeeting(leadId: string, transcript: string, actorId?: string | null): Promise<MeetingSummaryResult> {
  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead not found");

  const result = await runCachedJsonFeature({
    feature: "MEETING_SUMMARY",
    scope: { entityType: "lead", entityId: leadId },
    actorId,
    schema: resultSchema,
    build: () => ({
      system:
        "You summarize sales/counselling call notes for a CRM. Produce a short summary, a list of concrete action " +
        "items, and an overall sentiment (POSITIVE, NEUTRAL, or NEGATIVE) for how the call went.",
      messages: [{ role: "user", content: `Lead: ${lead.name}\n\nCall notes / transcript:\n${transcript}` }],
    }),
  });

  await addLeadNote(leadId, { type: "NOTE", body: `AI meeting summary: ${result.summary}` }, actorId);
  return result;
}

export function getCachedMeetingSummary(leadId: string) {
  return getValidatedInsight("MEETING_SUMMARY", { entityType: "lead", entityId: leadId }, resultSchema);
}

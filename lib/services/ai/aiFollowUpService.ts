import { z } from "zod";
import { getLeadById, listLeadNotes } from "@/lib/services/leadService";
import { runCachedJsonFeature } from "@/lib/ai/run";
import { getValidatedInsight } from "@/lib/ai/cache";

const resultSchema = z.object({
  suggestion: z.string(),
  nextAction: z.string(),
  suggestedDate: z.string().optional(),
});

export type FollowUpSuggestion = z.infer<typeof resultSchema>;

export async function suggestFollowUp(leadId: string, actorId?: string | null): Promise<FollowUpSuggestion> {
  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead not found");
  const notes = await listLeadNotes(leadId);

  return runCachedJsonFeature({
    feature: "FOLLOWUP_SUGGESTION",
    scope: { entityType: "lead", entityId: leadId },
    actorId,
    schema: resultSchema,
    build: () => ({
      system:
        "You are a CRM assistant helping a counsellor decide what to do next with a lead. Suggest one concrete next " +
        "action and, if useful, a suggested follow-up date (YYYY-MM-DD). Be practical and specific to this lead's history.",
      messages: [
        {
          role: "user",
          content: [
            `Lead: ${lead.name} — stage ${lead.stage}, source ${lead.source}`,
            `Course interested: ${lead.course?.title ?? "Unspecified"}`,
            `Next follow-up currently set: ${lead.nextFollowUpAt?.toISOString().slice(0, 10) ?? "none"}`,
            `Session scheduled: ${lead.sessionScheduledAt?.toISOString().slice(0, 10) ?? "none"}`,
            `Notes (${notes.length}, most recent first):`,
            ...notes.slice(0, 10).map((n) => `- [${n.type}] ${n.body}`),
          ].join("\n"),
        },
      ],
    }),
  });
}

export function getCachedFollowUp(leadId: string) {
  return getValidatedInsight("FOLLOWUP_SUGGESTION", { entityType: "lead", entityId: leadId }, resultSchema);
}

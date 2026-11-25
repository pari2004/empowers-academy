import { z } from "zod";
import { getLeadById, listLeadNotes } from "@/lib/services/leadService";
import { runCachedJsonFeature } from "@/lib/ai/run";
import { getValidatedInsight } from "@/lib/ai/cache";

const resultSchema = z.object({
  score: z.number().int().min(0).max(100),
  reasoning: z.string(),
  signals: z.array(z.string()).default([]),
});

export type LeadScoreResult = z.infer<typeof resultSchema>;

export async function scoreLead(leadId: string, actorId?: string | null): Promise<LeadScoreResult> {
  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead not found");
  const notes = await listLeadNotes(leadId);

  return runCachedJsonFeature({
    feature: "LEAD_SCORE",
    scope: { entityType: "lead", entityId: leadId },
    actorId,
    schema: resultSchema,
    build: () => ({
      system:
        "You are a CRM lead-scoring assistant for an ed-tech admissions team. Score how likely this lead is to enroll, " +
        "from 0 (cold) to 100 (near-certain), based on the signals given. Be concise and specific in your reasoning.",
      messages: [
        {
          role: "user",
          content: [
            `Lead: ${lead.name}`,
            `Source: ${lead.source}`,
            `Stage: ${lead.stage}`,
            `Course interested: ${lead.course?.title ?? "Unspecified"}`,
            `Budget: ${lead.budget ?? "Unspecified"}`,
            `Expected joining: ${lead.expectedJoining?.toISOString().slice(0, 10) ?? "Unspecified"}`,
            `Location: ${[lead.city, lead.state].filter(Boolean).join(", ") || "Unspecified"}`,
            `Tags: ${lead.tags.join(", ") || "none"}`,
            `Lead created: ${lead.createdAt.toISOString().slice(0, 10)}`,
            `Recent activity (${notes.length} notes):`,
            ...notes.slice(0, 10).map((n) => `- [${n.type}] ${n.body}`),
          ].join("\n"),
        },
      ],
    }),
  });
}

export function getCachedLeadScore(leadId: string) {
  return getValidatedInsight("LEAD_SCORE", { entityType: "lead", entityId: leadId }, resultSchema);
}

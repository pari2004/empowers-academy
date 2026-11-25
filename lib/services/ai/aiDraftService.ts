import { z } from "zod";
import type { AiFeature } from "@prisma/client";
import { getLeadById } from "@/lib/services/leadService";
import { runCachedJsonFeature } from "@/lib/ai/run";
import { getValidatedInsight } from "@/lib/ai/cache";
import type { AiDraftRequest } from "@/lib/validation/ai";

const resultSchema = z.object({
  subject: z.string().optional(),
  body: z.string(),
});

export type DraftResult = z.infer<typeof resultSchema>;

const FEATURE_BY_CHANNEL: Record<AiDraftRequest["channel"], AiFeature> = {
  EMAIL: "EMAIL_DRAFT",
  WHATSAPP: "WHATSAPP_DRAFT",
};

export async function generateDraft(leadId: string, req: AiDraftRequest, actorId?: string | null): Promise<DraftResult> {
  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead not found");

  const feature = FEATURE_BY_CHANNEL[req.channel];
  const isEmail = req.channel === "EMAIL";

  return runCachedJsonFeature({
    feature,
    scope: { entityType: "lead", entityId: leadId },
    actorId,
    schema: resultSchema,
    build: () => ({
      system:
        `You draft ${isEmail ? "emails" : "WhatsApp messages"} for an ed-tech admissions team reaching out to leads. ` +
        `Tone: ${req.tone.toLowerCase()}. ${isEmail ? "Include a short subject line." : "Keep it short and conversational, no subject line."} ` +
        "Never invent facts not given below.",
      messages: [
        {
          role: "user",
          content: [
            `Lead: ${lead.name}`,
            `Course interested: ${lead.course?.title ?? "Unspecified"}`,
            `Stage: ${lead.stage}`,
            req.context ? `Additional context: ${req.context}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    }),
  });
}

export function getCachedDraft(leadId: string, channel: AiDraftRequest["channel"]) {
  return getValidatedInsight(FEATURE_BY_CHANNEL[channel], { entityType: "lead", entityId: leadId }, resultSchema);
}

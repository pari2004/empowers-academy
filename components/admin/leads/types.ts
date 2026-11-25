import {
  PIPELINE_STAGES,
  TERMINAL_OUTCOMES,
  ALL_STAGES,
  stageLabel,
  getValidNextStages,
  isValidTransition,
  stageRequiresPayload,
  type LeadStage,
} from "@/lib/leadPipeline";

export type { LeadStage };

export type LeadSource =
  | "WEBSITE"
  | "WHATSAPP"
  | "FACEBOOK_ADS"
  | "INSTAGRAM"
  | "GOOGLE_ADS"
  | "REFERRAL"
  | "WALK_IN"
  | "LINKEDIN"
  | "YOUTUBE"
  | "OTHER";

export type LeadNoteType = "NOTE" | "CALL" | "STAGE_CHANGE";

export type Lead = {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  college: string | null;
  company: string | null;
  experience: string | null;
  source: LeadSource;
  interestedCourseId: string | null;
  course: { id: string; title: string } | null;
  budget: string | null;
  expectedJoining: string | null;
  leadScore: number;
  tags: string[];
  stage: LeadStage;
  nextFollowUpAt: string | null;
  sessionScheduledAt: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadNote = {
  id: string;
  leadId: string;
  type: LeadNoteType;
  body: string;
  attachmentUrl: string | null;
  createdById: string | null;
  createdAt: string;
};

// Re-exported from lib/leadPipeline.ts — the single source of truth for the
// pipeline graph/labels, shared between server enforcement and client UX.
export { PIPELINE_STAGES, TERMINAL_OUTCOMES, stageLabel, getValidNextStages, isValidTransition, stageRequiresPayload };
export const LEAD_STAGES = ALL_STAGES;

export const LEAD_SOURCES: Array<{ value: LeadSource; label: string }> = [
  { value: "WEBSITE", label: "Website" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "FACEBOOK_ADS", label: "Facebook Ads" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "GOOGLE_ADS", label: "Google Ads" },
  { value: "REFERRAL", label: "Referral" },
  { value: "WALK_IN", label: "Walk-in" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "OTHER", label: "Other" },
];

export function sourceLabel(source: LeadSource): string {
  return LEAD_SOURCES.find((s) => s.value === source)?.label ?? source;
}

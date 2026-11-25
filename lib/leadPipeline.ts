// Single source of truth for the CRM lead pipeline state machine — imported by
// both server code (lib/services/leadService.ts, for enforcement) and client
// components (components/admin/leads/*, for UX gating: only showing/allowing
// legal moves). Deliberately has zero server-only imports (no prisma, no
// next/server) so it's safe to import from "use client" files.
import type { LeadStage } from "@prisma/client";

export type { LeadStage };

export const PIPELINE_STAGES: Array<{ value: LeadStage; label: string }> = [
  { value: "NEW_LEAD", label: "New Lead" },
  { value: "CALL_ATTEMPTED", label: "Call Attempted" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "CALL_CONNECTED", label: "Call Connected" },
  { value: "SESSION_SCHEDULED", label: "Session Scheduled" },
  { value: "SESSION_DONE", label: "Session Done" },
  { value: "PARTIAL_PAYMENT", label: "Partial Payment" },
  { value: "ONBOARDED_LEARNER", label: "Onboarded Learner" },
];

export const TERMINAL_OUTCOMES: Array<{ value: LeadStage; label: string }> = [
  { value: "INVALID_NUMBER", label: "Invalid Number" },
  { value: "DUPLICATE_LEAD", label: "Duplicate Lead" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "WRONG_REQUIREMENT", label: "Wrong Requirement" },
  { value: "NO_RESPONSE", label: "No Response" },
  { value: "LOST", label: "Lost" },
  { value: "SPAM", label: "Spam" },
];

export const ALL_STAGES: Array<{ value: LeadStage; label: string }> = [...PIPELINE_STAGES, ...TERMINAL_OUTCOMES];

// Stages whose transition requires more than just the target stage — the
// caller must supply extra fields (see leadStageTransitionSchema in
// lib/validation/lead.ts) and the side effects that stage triggers.
export const PAYLOAD_STAGES = new Set<LeadStage>(["FOLLOW_UP", "SESSION_SCHEDULED", "PARTIAL_PAYMENT", "ONBOARDED_LEARNER"]);

/**
 * The pipeline's transition graph. "DNP" (did-not-pick) off Call Attempted and
 * "Follow-up Required" off Call Connected both route into FOLLOW_UP — that's
 * what the spec's "auto-create follow-up tasks for DNP / Follow-up Required"
 * requirement hooks off of. Terminal outcomes are absorbing: no transitions
 * out of them in v1.
 */
export const LEAD_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  NEW_LEAD: ["CALL_ATTEMPTED", "INVALID_NUMBER", "DUPLICATE_LEAD", "SPAM"],
  CALL_ATTEMPTED: ["CALL_CONNECTED", "FOLLOW_UP", "INVALID_NUMBER"],
  FOLLOW_UP: ["CALL_ATTEMPTED", "CALL_CONNECTED", "NO_RESPONSE", "NOT_INTERESTED", "LOST"],
  CALL_CONNECTED: ["SESSION_SCHEDULED", "FOLLOW_UP", "NOT_INTERESTED", "WRONG_REQUIREMENT", "DUPLICATE_LEAD", "LOST"],
  SESSION_SCHEDULED: ["SESSION_DONE", "FOLLOW_UP", "NO_RESPONSE", "LOST"],
  SESSION_DONE: ["PARTIAL_PAYMENT", "NOT_INTERESTED", "WRONG_REQUIREMENT", "LOST"],
  PARTIAL_PAYMENT: ["ONBOARDED_LEARNER", "LOST"],
  ONBOARDED_LEARNER: [],
  INVALID_NUMBER: [],
  DUPLICATE_LEAD: [],
  NOT_INTERESTED: [],
  WRONG_REQUIREMENT: [],
  NO_RESPONSE: [],
  LOST: [],
  SPAM: [],
};

const TERMINAL_SET = new Set<LeadStage>(TERMINAL_OUTCOMES.map((s) => s.value));
const LABEL_BY_STAGE = new Map<LeadStage, string>(ALL_STAGES.map((s) => [s.value, s.label]));

export function isTerminalStage(stage: LeadStage): boolean {
  return TERMINAL_SET.has(stage);
}

export function getValidNextStages(stage: LeadStage): LeadStage[] {
  return LEAD_TRANSITIONS[stage] ?? [];
}

export function isValidTransition(from: LeadStage, to: LeadStage): boolean {
  return getValidNextStages(from).includes(to);
}

export function stageRequiresPayload(stage: LeadStage): boolean {
  return PAYLOAD_STAGES.has(stage);
}

export function stageLabel(stage: LeadStage): string {
  return LABEL_BY_STAGE.get(stage) ?? stage;
}

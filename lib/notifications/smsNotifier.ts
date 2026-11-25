import type { Notifier } from "@/lib/notifications/types";

// Stub: no SMS provider is wired up this phase — see whatsappNotifier.ts for the same pattern.
export const smsNotifier: Notifier = {
  channel: "SMS",
  async send(input) {
    console.warn(`smsNotifier: no provider configured, skipping message to ${input.to}`);
  },
};

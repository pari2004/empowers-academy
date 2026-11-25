import type { Notifier } from "@/lib/notifications/types";

// Stub: no WhatsApp Business API provider is wired up this phase. Registered
// in the notifier registry so a future phase can implement `send` without
// touching any caller.
export const whatsappNotifier: Notifier = {
  channel: "WHATSAPP",
  async send(input) {
    console.warn(`whatsappNotifier: no provider configured, skipping message to ${input.to}`);
  },
};

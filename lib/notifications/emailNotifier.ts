import { sendEmail } from "@/lib/email";
import type { Notifier } from "@/lib/notifications/types";

export const emailNotifier: Notifier = {
  channel: "EMAIL",
  async send(input) {
    await sendEmail({
      to: input.to,
      subject: input.subject ?? "Payment Reminder",
      html: `<p>${input.message.replace(/\n/g, "<br/>")}</p>`,
      text: input.message,
    });
  },
};

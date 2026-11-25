import type { Notifier, NotificationChannel } from "@/lib/notifications/types";
import { emailNotifier } from "@/lib/notifications/emailNotifier";
import { whatsappNotifier } from "@/lib/notifications/whatsappNotifier";
import { smsNotifier } from "@/lib/notifications/smsNotifier";

export const NOTIFIERS: Record<NotificationChannel, Notifier> = {
  EMAIL: emailNotifier,
  WHATSAPP: whatsappNotifier,
  SMS: smsNotifier,
};

export type { Notifier, NotifierInput, NotificationChannel } from "@/lib/notifications/types";

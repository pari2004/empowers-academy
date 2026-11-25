export type NotificationChannel = "EMAIL" | "WHATSAPP" | "SMS";

export interface NotifierInput {
  to: string;
  subject?: string;
  message: string;
}

export interface Notifier {
  channel: NotificationChannel;
  send(input: NotifierInput): Promise<void>;
}

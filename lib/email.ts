import nodemailer from "nodemailer";

export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
};

/** No-ops with a console warning when SMTP isn't configured, so dev/CI environments
 *  without credentials don't crash — mirrors lib/s3.ts's isS3Configured() guard. */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(`sendEmail: SMTP not configured, skipping email to ${input.to} ("${input.subject}")`);
    return;
  }

  await getTransport().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    attachments: input.attachments,
  });
}

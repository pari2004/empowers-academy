import { z } from "zod";
import { optionalUrlOrPath } from "./shared";

export const settingsSchema = z.object({
  siteName: z.string().min(1).default("Empowers Academy"),
  logoUrl: optionalUrlOrPath("Logo URL"),
  faviconUrl: optionalUrlOrPath("Favicon URL"),
  themeColors: z.record(z.string()).optional().nullable(),
  companyInfo: z
    .object({
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      hours: z.array(z.string()).optional(),
    })
    .optional()
    .nullable(),
  socialLinks: z.record(z.string()).optional().nullable(),
  legalLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional().nullable(),
  copyright: z.string().optional().nullable(),
  googleAnalyticsId: z.string().optional().nullable(),
  metaPixelId: z.string().optional().nullable(),
  gtmId: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  smtpHost: z.string().optional().nullable(),
  smtpPort: z.number().int().optional().nullable(),
  smtpUser: z.string().optional().nullable(),
  smtpPassword: z.string().optional().nullable(),
  smtpFrom: z.string().optional().nullable(),
});

export const settingsUpdateSchema = settingsSchema.partial();
export type SettingsInput = z.infer<typeof settingsUpdateSchema>;

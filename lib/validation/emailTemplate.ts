import { z } from "zod";

export const emailTemplateCategorySchema = z.enum([
  "WELCOME",
  "DEMO_INVITATION",
  "FOLLOW_UP",
  "ADMISSION_CONFIRMATION",
  "PAYMENT_REMINDER",
  "BATCH_ASSIGNMENT",
  "CLASS_REMINDER",
  "ASSIGNMENT_REMINDER",
  "CERTIFICATE_ISSUED",
  "PLACEMENT_UPDATE",
  "CUSTOM",
]);

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens only"),
  category: emailTemplateCategorySchema.default("CUSTOM"),
  subject: z.string().min(1, "Subject is required"),
  bodyHtml: z.string().min(1, "Body is required"),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const emailTemplateUpdateSchema = emailTemplateSchema.partial();

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;
export type EmailTemplateUpdateInput = z.infer<typeof emailTemplateUpdateSchema>;

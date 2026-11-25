import { z } from "zod";

export const landingPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export const landingPageUpdateSchema = landingPageSchema.partial();
export type LandingPageInput = z.infer<typeof landingPageSchema>;
export type LandingPageUpdateInput = z.infer<typeof landingPageUpdateSchema>;

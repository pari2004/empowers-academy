import { z } from "zod";
import { optionalUrlOrPath, requiredUrlOrPath } from "./shared";

export const brochureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  thumbnail: optionalUrlOrPath("Thumbnail"),
  fileUrl: requiredUrlOrPath("Brochure file"),
  fileName: z.string().optional().nullable(),
  fileSize: z.number().int().nonnegative().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  downloadButtonText: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const brochureUpdateSchema = brochureSchema.partial();

export type BrochureInput = z.infer<typeof brochureSchema>;
export type BrochureUpdateInput = z.infer<typeof brochureUpdateSchema>;

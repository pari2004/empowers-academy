import { z } from "zod";
import { optionalUrlOrPath } from "./shared";

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("h2"), text: z.string() }),
  z.object({ type: z.literal("h3"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(z.string()) }),
  z.object({ type: z.literal("ol"), items: z.array(z.string()) }),
  z.object({ type: z.literal("code"), code: z.string() }),
  z.object({ type: z.literal("callout"), text: z.string() }),
  z.object({ type: z.literal("image"), src: z.string(), alt: z.string().optional() }),
  z.object({ type: z.literal("table"), rows: z.array(z.array(z.string())) }),
  z.object({ type: z.literal("embed"), url: z.string() }),
]);

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  excerpt: z.string().optional().nullable(),
  featuredImage: optionalUrlOrPath("Featured Image"),
  body: z.array(blockSchema).default([]),
  categoryId: z.string().uuid().optional().nullable(),
  tagIds: z.array(z.string().uuid()).default([]),
  readingTime: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const blogUpdateSchema = blogSchema.partial();

export type BlogInput = z.infer<typeof blogSchema>;
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>;

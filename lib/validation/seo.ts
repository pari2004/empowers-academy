import { z } from "zod";

export const seoMetaSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional().nullable(),
  twitterCard: z.string().optional().nullable(),
  schemaJsonLd: z.record(z.unknown()).optional().nullable(),
  robots: z.string().default("index,follow"),
});

export type SeoMetaInput = z.infer<typeof seoMetaSchema>;

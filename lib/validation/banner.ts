import { z } from "zod";
import { optionalUrlOrPath, requiredUrlOrPath } from "./shared";

export const bannerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  desktopImage: requiredUrlOrPath("Desktop image"),
  mobileImage: optionalUrlOrPath("Mobile image"),
  headline: z.string().optional().nullable(),
  subheading: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  backgroundColor: z.string().optional().nullable(),
  overlay: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishAt: z.string().datetime().optional().nullable(),
  unpublishAt: z.string().datetime().optional().nullable(),
  order: z.number().int().default(0),
});

export const bannerUpdateSchema = bannerSchema.partial();
export type BannerInput = z.infer<typeof bannerSchema>;
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>;

import { z } from "zod";
import { optionalUrlOrPath } from "./shared";

export const classModeSchema = z.enum(["ONLINE", "OFFLINE", "HYBRID"]);

export const programmeDetailSchema = z.object({
  heroBanner: optionalUrlOrPath("Hero Banner"),
  heroImage: optionalUrlOrPath("Hero Image"),
  mode: classModeSchema.default("ONLINE"),
  eligibility: z.string().optional().nullable(),
  certification: z.string().optional().nullable(),
  emiAvailable: z.boolean().default(false),
  emiDetails: z.string().optional().nullable(),
  scholarshipInfo: z.string().optional().nullable(),
  admissionOpen: z.boolean().default(true),
  overview: z.string().optional().nullable(),
  highlights: z.array(z.string()).default([]),
  careerOpportunities: z.array(z.string()).default([]),
  placementSupport: z.string().optional().nullable(),
  placementRate: z.number().int().min(0).max(100).optional().nullable(),
  avgSalaryHikePct: z.number().int().min(0).optional().nullable(),
  avgPackageLpa: z.number().min(0).optional().nullable(),
  projects: z
    .array(z.object({ title: z.string(), description: z.string().optional() }))
    .default([]),
  galleryImages: z.array(z.string()).default([]),
  videoUrl: optionalUrlOrPath("Video URL"),
  curriculumUrl: optionalUrlOrPath("Curriculum URL"),
  applyCtaLabel: z.string().optional().nullable(),
  applyCtaHref: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const programmeDetailUpdateSchema = programmeDetailSchema.partial();

export type ProgrammeDetailInput = z.infer<typeof programmeDetailSchema>;
export type ProgrammeDetailUpdateInput = z.infer<typeof programmeDetailUpdateSchema>;

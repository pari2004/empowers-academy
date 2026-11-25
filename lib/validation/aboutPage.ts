import { z } from "zod";
import { optionalUrlOrPath } from "./shared";

export const coreValueSchema = z.object({ title: z.string(), description: z.string().optional() });
export const whyChooseUsCardSchema = z.object({ icon: z.string().optional(), title: z.string(), body: z.string().optional() });
export const teamMemberSchema = z.object({ name: z.string(), designation: z.string().optional(), photo: z.string().optional(), bio: z.string().optional() });
export const partnerSchema = z.object({ name: z.string(), logo: z.string().optional() });
export const achievementSchema = z.object({ title: z.string(), description: z.string().optional(), year: z.string().optional() });
export const timelineItemSchema = z.object({ year: z.string(), title: z.string(), description: z.string().optional() });

export const aboutPageUpdateSchema = z.object({
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  heroBackground: optionalUrlOrPath("Hero Background"),
  heroCtaLabel: z.string().optional().nullable(),
  heroCtaHref: z.string().optional().nullable(),
  aboutDescription: z.string().optional().nullable(),
  vision: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  coreValues: z.array(coreValueSchema).optional(),
  statStudents: z.string().optional().nullable(),
  statCourses: z.string().optional().nullable(),
  statTrainers: z.string().optional().nullable(),
  statPlacements: z.string().optional().nullable(),
  founderName: z.string().optional().nullable(),
  founderDesignation: z.string().optional().nullable(),
  founderPhoto: optionalUrlOrPath("Founder Photo"),
  founderMessage: z.string().optional().nullable(),
  whyChooseUs: z.array(whyChooseUsCardSchema).optional(),
  team: z.array(teamMemberSchema).optional(),
  partners: z.array(partnerSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  timeline: z.array(timelineItemSchema).optional(),
  gallery: z.array(z.string()).optional(),
  videoUrl: optionalUrlOrPath("Video URL"),
  testimonialIds: z.array(z.string().uuid()).optional(),
  ctaTitle: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export type AboutPageUpdateInput = z.infer<typeof aboutPageUpdateSchema>;
export type CoreValue = z.infer<typeof coreValueSchema>;
export type WhyChooseUsCard = z.infer<typeof whyChooseUsCardSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Partner = z.infer<typeof partnerSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;

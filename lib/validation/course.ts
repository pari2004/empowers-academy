import { z } from "zod";
import { optionalUrlOrPath } from "./shared";

export const courseLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]);
export const contentStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const curriculumLessonSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  duration: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

export const curriculumSectionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  order: z.number().int().default(0),
  lessons: z.array(curriculumLessonSchema).default([]),
});

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  category: z.string().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional().nullable(),
  thumbnail: optionalUrlOrPath("Thumbnail URL"),
  coverImage: optionalUrlOrPath("Cover Image URL"),
  duration: z.string().optional().nullable(),
  level: courseLevelSchema.default("ALL_LEVELS"),
  language: z.string().default("English"),
  price: z.number().nonnegative().optional().nullable(),
  discountPrice: z.number().nonnegative().optional().nullable(),
  tags: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  toolsCovered: z.array(z.string()).default([]),
  status: contentStatusSchema.default("DRAFT"),
  instructorIds: z.array(z.string().uuid()).default([]),
  curriculum: z.array(curriculumSectionSchema).default([]),
});

export const courseUpdateSchema = courseSchema.partial();

export type CourseInput = z.infer<typeof courseSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;

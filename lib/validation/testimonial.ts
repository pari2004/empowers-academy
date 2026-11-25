import { z } from "zod";
import { optionalUrlOrPath } from "./shared";

export const testimonialSchema = z.object({
  studentName: z.string().min(1, "Name is required"),
  company: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  review: z.string().min(1, "Review is required"),
  rating: z.number().int().min(1).max(5).default(5),
  image: optionalUrlOrPath("Image"),
  videoUrl: optionalUrlOrPath("Video URL"),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  order: z.number().int().default(0),
});

export const testimonialUpdateSchema = testimonialSchema.partial();

export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;

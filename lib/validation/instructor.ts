import { z } from "zod";
import { optionalUrl, optionalUrlOrPath } from "./shared";

export const contentStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const instructorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  designation: z.string().min(1, "Designation is required"),
  bio: z.string().min(1, "Biography is required"),
  skills: z.array(z.string()).default([]),
  experience: z.string().optional().nullable(),
  profileImage: optionalUrlOrPath("Profile Image"),
  socialLinks: z
    .object({
      linkedin: optionalUrl("LinkedIn URL"),
      twitter: optionalUrl("Twitter URL"),
      github: optionalUrl("GitHub URL"),
      website: optionalUrl("Website URL"),
    })
    .optional()
    .nullable(),
  featured: z.boolean().default(false),
  status: contentStatusSchema.default("DRAFT"),
});

export const instructorUpdateSchema = instructorSchema.partial();

export type InstructorInput = z.infer<typeof instructorSchema>;
export type InstructorUpdateInput = z.infer<typeof instructorUpdateSchema>;

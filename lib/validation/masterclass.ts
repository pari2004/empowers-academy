import { z } from "zod";

export const masterclassStatusValues = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;

export const masterclassSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.string().optional().nullable(),
  instructorId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid().optional().nullable(),
  scheduledAt: z.string().datetime("Enter a valid date/time"),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  meetingLink: z.string().optional().nullable(),
  capacity: z.number().int().min(0).optional().nullable(),
  status: z.enum(masterclassStatusValues).default("DRAFT"),
});

export const masterclassUpdateSchema = masterclassSchema.partial();

export type MasterclassInput = z.infer<typeof masterclassSchema>;
export type MasterclassUpdateInput = z.infer<typeof masterclassUpdateSchema>;

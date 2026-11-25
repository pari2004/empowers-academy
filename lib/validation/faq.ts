import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  categoryId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid().optional().nullable(),
  order: z.number().int().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const faqUpdateSchema = faqSchema.partial();

export type FaqInput = z.infer<typeof faqSchema>;
export type FaqUpdateInput = z.infer<typeof faqUpdateSchema>;

export const faqCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  order: z.number().int().default(0),
});

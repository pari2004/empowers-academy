import { z } from "zod";
import { optionalUrl } from "./shared";

export const batchStatusSchema = z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]);

export const batchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  courseId: z.string().uuid("Course is required"),
  instructorId: z.string().uuid().optional().nullable(),
  timing: z.string().optional().nullable(),
  capacity: z.number().int().min(0).default(0),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  meetingLink: optionalUrl("Meeting Link"),
  status: batchStatusSchema.default("UPCOMING"),
});

export const batchUpdateSchema = batchSchema.partial();

export type BatchInput = z.infer<typeof batchSchema>;
export type BatchUpdateInput = z.infer<typeof batchUpdateSchema>;

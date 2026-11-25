import { z } from "zod";
import { optionalIndianPhone } from "@/lib/validation/phone";
import { optionalEmail, optionalUrlOrPath } from "./shared";

export const admissionStatusSchema = z.enum([
  "APPLICATION_RECEIVED",
  "DOCUMENTS_VERIFIED",
  "OFFER_SENT",
  "FEE_PENDING",
  "CONFIRMED",
]);

export const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: optionalEmail("Email"),
  phone: optionalIndianPhone,
  courseId: z.string().uuid("Course is required"),
  batchId: z.string().uuid().optional().nullable(),
  admissionStatus: admissionStatusSchema.default("APPLICATION_RECEIVED"),
  offerLetterUrl: optionalUrlOrPath("Offer Letter URL"),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const studentUpdateSchema = studentSchema.partial();

export const convertLeadSchema = z.object({
  batchId: z.string().uuid().optional().nullable(),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;

import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().uuid("Role is required"),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const roleUpdateSchema = z.object({
  permissions: z.array(z.string()),
});

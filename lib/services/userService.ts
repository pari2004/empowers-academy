import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import type { z } from "zod";
import type { userCreateSchema, userUpdateSchema } from "@/lib/validation/user";

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

function stripPassword<T extends { passwordHash: string }>(user: T): Omit<T, "passwordHash"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to drop passwordHash from the result
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { role: true },
  });
  return users.map(stripPassword);
}

export function listRoles() {
  return prisma.role.findMany({ orderBy: { name: "asc" } });
}

export async function updateRolePermissions(roleId: string, permissions: string[], actorId?: string | null) {
  const role = await prisma.role.update({ where: { id: roleId }, data: { permissions } });
  await logActivity({ userId: actorId, action: "ROLE_CHANGE", entityType: "role", entityId: roleId, metadata: { permissions } });
  return role;
}

export async function createUser(input: UserCreateInput, actorId?: string | null) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash, roleId: input.roleId, isActive: input.isActive },
    include: { role: true },
  });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "user", entityId: user.id });
  return stripPassword(user);
}

export async function updateUser(id: string, input: UserUpdateInput, actorId?: string | null) {
  const data: Record<string, unknown> = { ...input };
  delete data.password;
  if (input.password) data.passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.update({ where: { id }, data, include: { role: true } });
  await logActivity({ userId: actorId, action: input.roleId ? "ROLE_CHANGE" : "UPDATE", entityType: "user", entityId: id });
  return stripPassword(user);
}

export async function deleteUser(id: string, actorId?: string | null) {
  await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "user", entityId: id });
}

import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export type MenuLocationValue = "HEADER" | "FOOTER" | "MOBILE";

export async function getMenuByLocation(location: MenuLocationValue) {
  let menu = await prisma.menu.findUnique({
    where: { location },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!menu) {
    menu = await prisma.menu.create({ data: { location }, include: { items: true } });
  }
  return menu;
}

export async function createMenuItem(
  menuId: string,
  input: { label: string; href: string; icon?: string; isExternal?: boolean; parentId?: string | null; order?: number },
  actorId?: string | null
) {
  const item = await prisma.menuItem.create({ data: { menuId, ...input } });
  await logActivity({ userId: actorId, action: "CREATE", entityType: "menuItem", entityId: item.id });
  return item;
}

export async function updateMenuItem(
  id: string,
  input: Partial<{ label: string; href: string; icon: string | null; isExternal: boolean; parentId: string | null; order: number }>,
  actorId?: string | null
) {
  const item = await prisma.menuItem.update({ where: { id }, data: input });
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "menuItem", entityId: id });
  return item;
}

export async function deleteMenuItem(id: string, actorId?: string | null) {
  await prisma.menuItem.delete({ where: { id } });
  await logActivity({ userId: actorId, action: "DELETE", entityType: "menuItem", entityId: id });
}

export async function reorderMenuItems(orderedIds: string[], actorId?: string | null) {
  await prisma.$transaction(orderedIds.map((id, index) => prisma.menuItem.update({ where: { id }, data: { order: index } })));
  await logActivity({ userId: actorId, action: "UPDATE", entityType: "menuItem", metadata: { reordered: true } });
}

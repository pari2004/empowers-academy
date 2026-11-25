import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getMenuByLocation, createMenuItem, type MenuLocationValue } from "@/lib/services/menuService";

const locationSchema = z.enum(["HEADER", "FOOTER", "MOBILE"]);
const createSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  icon: z.string().optional(),
  isExternal: z.boolean().default(false),
  parentId: z.string().uuid().optional().nullable(),
  order: z.number().int().default(0),
});

export async function GET(req: Request, props: { params: Promise<{ location: string }> }) {
  const params = await props.params;
  try {
    await requirePermission(req, "menus.view");
    const { location } = params;
    const parsedLocation = locationSchema.safeParse(location.toUpperCase());
    if (!parsedLocation.success) throw new ApiError("Invalid menu location", 400);
    const menu = await getMenuByLocation(parsedLocation.data as MenuLocationValue);
    return NextResponse.json(menu);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request, props: { params: Promise<{ location: string }> }) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "menus.update");
    const { location } = params;
    const parsedLocation = locationSchema.safeParse(location.toUpperCase());
    if (!parsedLocation.success) throw new ApiError("Invalid menu location", 400);

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const menu = await getMenuByLocation(parsedLocation.data as MenuLocationValue);
    const item = await createMenuItem(menu.id, parsed.data, session.user.id);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listRevisions } from "@/lib/revisions";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");
  if (!entityType || !entityId) return NextResponse.json({ error: "entityType and entityId are required" }, { status: 400 });

  const items = await listRevisions(entityType, entityId);
  return NextResponse.json({ items });
}

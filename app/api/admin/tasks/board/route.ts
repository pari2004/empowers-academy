import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse } from "@/lib/api-guard";
import { listTasksForBoard } from "@/lib/services/taskService";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "tasks.view");
    const { searchParams } = new URL(req.url);
    const board = await listTasksForBoard(searchParams.get("assignedToId") ?? undefined);
    return NextResponse.json(board);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

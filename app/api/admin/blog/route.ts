import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { listBlogs, createBlog } from "@/lib/services/blogService";
import { blogSchema } from "@/lib/validation/blog";

export async function GET(req: Request) {
  try {
    await requirePermission(req, "blog.view");
    const { searchParams } = new URL(req.url);
    const result = await listBlogs({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(req, "blog.create");
    const parsed = blogSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const blog = await createBlog(parsed.data, session.user.id);
    return NextResponse.json(blog, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

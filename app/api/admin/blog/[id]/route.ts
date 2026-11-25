import { NextResponse } from "next/server";
import { requirePermission, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getBlogById, updateBlog, deleteBlog } from "@/lib/services/blogService";
import { blogUpdateSchema } from "@/lib/validation/blog";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, props: Params) {
  const params = await props.params;
  try {
    await requirePermission(req, "blog.view");
    const { id } = params;
    const blog = await getBlogById(id);
    if (!blog) throw new ApiError("Blog post not found", 404);
    return NextResponse.json(blog);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "blog.update");
    const { id } = params;
    const parsed = blogUpdateSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    const blog = await updateBlog(id, parsed.data, session.user.id);
    return NextResponse.json(blog);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request, props: Params) {
  const params = await props.params;
  try {
    const session = await requirePermission(req, "blog.delete");
    const { id } = params;
    await deleteBlog(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

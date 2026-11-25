import { notFound } from "next/navigation";
import { getBlogById } from "@/lib/services/blogService";
import BlogForm, { type BlogFormValues } from "@/components/admin/blog/BlogForm";
import VersionHistoryPanel from "@/components/admin/VersionHistoryPanel";
import type { Block } from "@/lib/resources";
import pageStyles from "../../module-list.module.css";

function toDatetimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditBlogPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const blog = await getBlogById(id);
  if (!blog) notFound();

  const initialValues: Partial<BlogFormValues> = {
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt ?? "",
    featuredImage: blog.featuredImage ?? "",
    body: blog.body as unknown as Block[],
    categoryId: blog.categoryId ?? "",
    tagIds: blog.tags.map((t) => t.tagId),
    status: blog.status,
    publishedAt: toDatetimeLocal(blog.publishedAt),
  };

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Edit Blog Post</h1>
      </div>
      <BlogForm blogId={blog.id} initialValues={initialValues} />
      <VersionHistoryPanel entityType="blog" entityId={blog.id} />
    </div>
  );
}

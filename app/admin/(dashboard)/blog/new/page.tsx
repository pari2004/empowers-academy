import BlogForm from "@/components/admin/blog/BlogForm";
import pageStyles from "../../module-list.module.css";

export default function NewBlogPage() {
  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>New Blog Post</h1>
      </div>
      <BlogForm />
    </div>
  );
}

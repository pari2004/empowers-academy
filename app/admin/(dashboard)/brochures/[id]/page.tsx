import { notFound } from "next/navigation";
import { getBrochureById } from "@/lib/services/brochureService";
import BrochureForm, { type BrochureFormValues } from "@/components/admin/brochures/BrochureForm";
import VersionHistoryPanel from "@/components/admin/VersionHistoryPanel";
import pageStyles from "../../module-list.module.css";

function toDatetimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditBrochurePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const brochure = await getBrochureById(id);
  if (!brochure) notFound();

  const initialValues: Partial<BrochureFormValues> = {
    title: brochure.title,
    slug: brochure.slug,
    shortDescription: brochure.shortDescription ?? "",
    description: brochure.description ?? "",
    thumbnail: brochure.thumbnail ?? "",
    fileUrl: brochure.fileUrl,
    fileName: brochure.fileName ?? "",
    fileSize: brochure.fileSize,
    categoryId: brochure.categoryId ?? "",
    courseId: brochure.courseId ?? "",
    tags: brochure.tags.join("\n"),
    downloadButtonText: brochure.downloadButtonText ?? "Download Brochure",
    featured: brochure.featured,
    order: brochure.order,
    status: brochure.status,
    publishedAt: toDatetimeLocal(brochure.publishedAt),
  };

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Edit Brochure</h1>
        <a href={brochure.fileUrl} target="_blank" rel="noopener noreferrer" className={pageStyles.primaryBtn}>
          Preview PDF
        </a>
      </div>
      <BrochureForm brochureId={brochure.id} initialValues={initialValues} />
      <VersionHistoryPanel entityType="brochure" entityId={brochure.id} />
    </div>
  );
}
